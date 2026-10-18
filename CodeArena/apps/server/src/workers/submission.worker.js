
import { Worker } from "bullmq";

import pool from "../db.js";
import { publishSubmissionEvent } from "../websocket/redisPublisher.js";
import {
    getAllTestCasesByProblemId,
} from "../services/testCase.service.js";
import {
    runSubmission,
} from "../execution/runSubmission.js";

const worker = new Worker(
    "submissions",
    async (job) => {
        const { submissionId, executionType } = job.data ?? {};

        if (!["run", "submit"].includes(executionType)) {
            throw new Error("Invalid execution type");
        }

        if (!submissionId) {
            throw new Error("Missing submissionId");
        }

        console.log(
            `Processing submission ${submissionId} (${executionType})`
        );

        try {
            // 1. Mark submission as PROCESSING and clear stale results.
            const submissionResult = await pool.query(
                `UPDATE submissions
                 SET status = 'PROCESSING',
                     started_at = CURRENT_TIMESTAMP,
                     completed_at = NULL,
                     verdict = NULL,
                     error_output = NULL,
                     exit_code = NULL,
                     execution_time_ms = NULL,
                     failed_test_case_id = NULL,
                     actual_output = NULL,
                     passed_test_cases = 0,
                     total_test_cases = 0
                 WHERE id = $1
                   AND status <> 'COMPLETED'
                 RETURNING
                     id,
                     user_id,
                     problem_id,
                     source_code,
                     language,
                     started_at`,
                [submissionId]
            );

            // A retry may encounter a submission that already completed.
            if (submissionResult.rows.length === 0) {
                const existingResult = await pool.query(
                    `SELECT id, status
                     FROM submissions
                     WHERE id = $1`,
                    [submissionId]
                );

                if (existingResult.rows.length === 0) {
                    throw new Error(
                        `Submission ${submissionId} not found`
                    );
                }

                if (existingResult.rows[0].status === "COMPLETED") {
                    console.log(
                        `Submission ${submissionId} is already COMPLETED; skipping retry`
                    );

                    return {
                        submissionId,
                        skipped: true,
                        reason: "Submission already completed",
                    };
                }

                throw new Error(
                    `Could not mark submission ${submissionId} as PROCESSING`
                );
            }

            const submission = submissionResult.rows[0];

            // 2. Load the trusted language template.
            const problemResult = await pool.query(
                `SELECT language_templates
                 FROM problems
                 WHERE id = $1
                   AND deleted_at IS NULL`,
                [submission.problem_id]
            );

            if (problemResult.rows.length === 0) {
                throw new Error(
                    `Problem ${submission.problem_id} not found`
                );
            }

            const problem = problemResult.rows[0];

            const languageTemplate =
                problem.language_templates?.[submission.language];

            if (
                typeof languageTemplate !== "string" ||
                !languageTemplate.trim()
            ) {
                throw new Error(
                    `Execution template unavailable for language: ${submission.language}`
                );
            }

            const placeholder = "{{USER_SOLUTION}}";
            const occurrences =
                languageTemplate.split(placeholder).length - 1;

            if (occurrences !== 1) {
                throw new Error(
                    `Invalid execution template for ${submission.language}: ` +
                    `expected exactly one ${placeholder} placeholder`
                );
            }

            // 3. Notify the user that execution has started.
            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId: submission.id,
                userId: submission.user_id,
                status: "PROCESSING",
            });

            // 4. Load the appropriate test cases.
            const allTestCases =
                await getAllTestCasesByProblemId(
                    submission.problem_id
                );

            const testCases =
                executionType === "run"
                    ? allTestCases.filter(
                        (testCase) => testCase.is_hidden === false
                    )
                    : allTestCases;

            if (testCases.length === 0) {
                throw new Error(
                    `No ${
                        executionType === "run" ? "public " : ""
                    }test cases found for problem ${submission.problem_id}`
                );
            }

            console.log(
                `Running ${testCases.length} test cases for submission ${submissionId}`
            );

            // 5. Execute and judge the submission.
            const result = await runSubmission({
                language: submission.language,
                sourceCode: submission.source_code,
                languageTemplate,
                testCases,
                executionType,
            });

            console.log(
                "Execution result:",
                JSON.stringify(result, null, 2)
            );

            const executionTimeMs =
                Number.isFinite(result.executionTimeMs) &&
                result.executionTimeMs >= 0
                    ? Math.round(result.executionTimeMs)
                    : null;

            // Match results against trusted database test cases.
            const testCasesById = new Map(
                testCases.map((testCase) => [
                    String(testCase.id),
                    testCase,
                ])
            );

            const matchedResults = (
                result.testCaseResults ?? []
            ).map((testCaseResult) => {
                const testCase = testCasesById.get(
                    String(testCaseResult.testCaseId)
                );

                if (!testCase) {
                    throw new Error(
                        `Could not match result to test case ${testCaseResult.testCaseId}`
                    );
                }

                return {
                    ...testCaseResult,
                    isHidden: testCase.is_hidden,
                    input: testCase.is_hidden
                        ? undefined
                        : testCase.input,
                    expectedOutput: testCase.is_hidden
                        ? undefined
                        : testCase.expected_output,
                };
            });

            // 6. Calculate the submission summary.
            const passedTestCases = matchedResults.filter(
                (testCase) => testCase.status === "ACCEPTED"
            ).length;

            // Keep the first non-accepted test case.
            const failedTestCase =
                matchedResults.find(
                    (testCase) => testCase.status !== "ACCEPTED"
                ) ?? null;

            const failedTestCaseId =
                failedTestCase?.testCaseId ?? null;

            const actualOutputJson =
                failedTestCase?.actualOutput == null
                    ? null
                    : JSON.stringify(failedTestCase.actualOutput);

            // Includes all selected cases, even if execution stopped early.
            const totalTestCases = testCases.length;

            // Keep hidden test-case details out of the BullMQ return value.
            const publicFailedTestCase =
                failedTestCase && !failedTestCase.isHidden
                    ? failedTestCase
                    : null;

            // 7. Persist the result transactionally.
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                await client.query(
                    `UPDATE submissions
                     SET status = 'COMPLETED',
                         verdict = $1,
                         completed_at = CURRENT_TIMESTAMP,
                         execution_time_ms = $2,
                         error_output = $3,
                         exit_code = $4,
                         failed_test_case_id = $5,
                         actual_output = $6::jsonb,
                         passed_test_cases = $7,
                         total_test_cases = $8
                     WHERE id = $9`,
                    [
                        result.verdict,
                        executionTimeMs,
                        result.stderr ?? "",
                        result.exitCode ?? null,
                        failedTestCaseId,
                        actualOutputJson,
                        passedTestCases,
                        totalTestCases,
                        submissionId,
                    ]
                );

                await client.query("COMMIT");
            } catch (error) {
                await client.query("ROLLBACK");
                throw error;
            } finally {
                client.release();
            }

            console.log(
                `Submission ${submissionId} verdict: ${result.verdict}`
            );

            console.log(
                `Submission ${submissionId} runtime: ${
                    executionTimeMs === null
                        ? "not available"
                        : `${executionTimeMs} ms`
                }`
            );

            // 8. Notify the user that execution has finished.
            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId: submission.id,
                userId: submission.user_id,
                status: "COMPLETED",
                verdict: result.verdict,
            });

            // 9. Return safe details to BullMQ consumers.
            return {
                submissionId: submission.id,
                executionType,
                verdict: result.verdict,
                executionTimeMs,
                passedTestCases,
                totalTestCases,

                failedTestCaseId:
                    publicFailedTestCase?.testCaseId ?? null,

                actualOutput:
                    publicFailedTestCase?.actualOutput ?? null,

                failedTestCase: publicFailedTestCase
                    ? {
                        testCaseId:
                            publicFailedTestCase.testCaseId,
                        status: publicFailedTestCase.status,
                        input: publicFailedTestCase.input,
                        expectedOutput:
                            publicFailedTestCase.expectedOutput,
                        actualOutput:
                            publicFailedTestCase.actualOutput ?? null,
                        stderr:
                            publicFailedTestCase.stderr ?? "",
                        exitCode:
                            publicFailedTestCase.exitCode ?? null,
                    }
                    : null,

                stderr: result.stderr ?? "",
                exitCode: result.exitCode ?? null,
            };
        } catch (error) {
            console.error(
                `Submission ${submissionId} processing attempt failed:`,
                error
            );

            // Do not mark FAILED here. BullMQ may retry this job.
            // The failed event handler below persists FAILED only
            // after the job reaches its terminal failed state.
            throw error;
        }
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },

        // Detect jobs whose worker disappeared while processing.
        stalledInterval: 10_000,
        maxStalledCount: 2,
        lockDuration: 10_000,
    }
);

// A successfully processed job.
worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

// A job attempt failed. Persist FAILED only after retries are exhausted.
worker.on("failed", async (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);

    if (!job) {
        return;
    }

    try {
        const state = await job.getState();

        // Intermediate failures should be retried by BullMQ.
        if (state !== "failed") {
            console.log(
                `Job ${job.id} is ${state}; waiting for retry or recovery`
            );
            return;
        }

        const { submissionId } = job.data ?? {};

        if (!submissionId) {
            console.error(
                `Job ${job.id} has no submissionId`
            );
            return;
        }

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        const updateResult = await pool.query(
            `UPDATE submissions
             SET status = 'FAILED',
                 verdict = NULL,
                 error_output = $1,
                 completed_at = CURRENT_TIMESTAMP
             WHERE id = $2
               AND status <> 'COMPLETED'
               AND status <> 'FAILED'
             RETURNING user_id`,
            [message, submissionId]
        );

        // Avoid duplicate failure notifications.
        if (updateResult.rows.length === 0) {
            return;
        }

        await publishSubmissionEvent({
            type: "SUBMISSION_STATUS",
            submissionId,
            userId: updateResult.rows[0].user_id,
            status: "FAILED",
        });

        console.log(
            `Submission ${submissionId} marked FAILED after retries were exhausted`
        );
    } catch (handlerError) {
        console.error(
            `Failed to persist terminal failure for job ${job.id}:`,
            handlerError
        );
    }
});

worker.on("error", (error) => {
    console.error("BullMQ worker error:", error);
});

console.log("Submission worker started");
