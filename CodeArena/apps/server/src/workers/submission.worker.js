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
        const { submissionId, mode = "submit" } = job.data;

        if (!submissionId) {
            throw new Error("Missing submissionId");
        }

        if (!["run", "submit"].includes(mode)) {
            throw new Error(`Invalid submission mode: ${mode}`);
        }

        console.log(
            `Processing submission ${submissionId} in ${mode} mode`
        );

        let submission;

        try {
            const submissionResult = await pool.query(
                `UPDATE submissions
                 SET status = 'PROCESSING',
                     started_at = CURRENT_TIMESTAMP
                 WHERE id = $1
                 RETURNING
                     id,
                     user_id,
                     problem_id,
                     source_code,
                     language,
                     started_at`,
                [submissionId]
            );

            if (submissionResult.rows.length === 0) {
                throw new Error(
                    `Submission ${submissionId} not found`
                );
            }

            submission = submissionResult.rows[0];

            const problemResult = await pool.query(
                `SELECT function_name, function_config, starter_code
                 FROM problems
                 WHERE id = $1 AND deleted_at IS NULL`,
                [submission.problem_id]
            );

            if (problemResult.rows.length === 0) {
                throw new Error(
                    `Problem ${submission.problem_id} not found`
                );
            }

            const problem = problemResult.rows[0];

            if (!problem.function_name) {
                throw new Error(
                    `Problem ${submission.problem_id} has no function name`
                );
            }

            if (
                !problem.function_config ||
                !Array.isArray(problem.function_config.parameters)
            ) {
                throw new Error(
                    `Problem ${submission.problem_id} has an invalid function configuration`
                );
            }

            if (!problem.starter_code?.[submission.language]) {
                throw new Error(
                    `Starter code unavailable for language: ${submission.language}`
                );
            }

            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId: submission.id,
                userId: submission.user_id,
                status: "PROCESSING",
            });

            const allTestCases =
                await getAllTestCasesByProblemId(
                    submission.problem_id
                );

            const testCases =
                mode === "run"
                    ? allTestCases.filter(
                        (testCase) => !testCase.is_hidden
                    )
                    : allTestCases;

            if (testCases.length === 0) {
                throw new Error(
                    `No ${mode === "run" ? "public " : ""}test cases found for problem ${submission.problem_id}`
                );
            }

            console.log(
                `Running ${testCases.length} test cases for submission ${submissionId}`
            );

            const executionStart = process.hrtime.bigint();

            const result = await runSubmission({
                language: submission.language,
                sourceCode: submission.source_code,
                testCases,
                functionName: problem.function_name,
                functionConfig: problem.function_config,
                mode,
            });
            console.log(
                "Test-case verdict summary:",
                (result.testCaseResults ?? []).map((testCaseResult) => ({
                    testCaseId: testCaseResult.testCaseId,
                    status: testCaseResult.status,
                }))
            );
            const executionEnd = process.hrtime.bigint();

            const executionTimeMs = Math.round(
                Number(executionEnd - executionStart) / 1_000_000
            );

            console.log(
                `Submission ${submissionId} verdict: ${result.verdict}`
            );

            console.log(
                `Submission ${submissionId} execution time: ${executionTimeMs} ms`
            );

            await pool.query(
                `UPDATE submissions
                 SET status = 'COMPLETED',
                     verdict = $1,
                     completed_at = CURRENT_TIMESTAMP,
                     execution_time_ms = $2
                 WHERE id = $3`,
                [
                    result.verdict,
                    executionTimeMs,
                    submissionId,
                ]
            );

            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId: submission.id,
                userId: submission.user_id,
                status: "COMPLETED",
                verdict: result.verdict,
            });



            // Keep detailed test results in BullMQ.
            // Associate each result with its original test case using the ID.
            const testCasesById = new Map(
                testCases.map((testCase) => [
                    String(testCase.id),
                    testCase,
                ])
            );

            return {
                submissionId: submission.id,
                mode,
                verdict: result.verdict,
                executionTimeMs,
                testCaseResults: (result.testCaseResults ?? []).map(
                    (testCaseResult) => {
                        const testCase = testCasesById.get(
                            String(testCaseResult.testCaseId)
                        );

                        // Fail safely if a result cannot be matched.
                        if (!testCase) {
                            throw new Error(
                                `Could not match result to test case ${testCaseResult.testCaseId}`
                            );
                        }

                        return {
                            ...testCaseResult,
                            isHidden: testCase.is_hidden,
                            input: testCase.input,
                            expectedOutput: testCase.expected_output,
                        };
                    }
                ),
                stderr: result.stderr,
                exitCode: result.exitCode,
            };
        } catch (error) {
            console.error(
                `Submission ${submissionId} failed:`,
                error
            );

            try {
                await pool.query(
                    `UPDATE submissions
                     SET status = 'FAILED',
                         completed_at = CURRENT_TIMESTAMP
                     WHERE id = $1`,
                    [submissionId]
                );
            } catch (updateError) {
                console.error(
                    `Failed to mark submission ${submissionId} as FAILED:`,
                    updateError
                );
            }

            try {
                await publishSubmissionEvent({
                    type: "SUBMISSION_STATUS",
                    submissionId,
                    userId: submission?.user_id,
                    status: "FAILED",
                });
            } catch (publishError) {
                console.error(
                    `Failed to publish failure event for submission ${submissionId}:`,
                    publishError
                );
            }

            throw error;
        }
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
});