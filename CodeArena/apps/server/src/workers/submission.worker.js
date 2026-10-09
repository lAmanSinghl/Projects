import { Worker } from "bullmq";
import pool from "../db.js";
import { publishSubmissionEvent } from "../websocket/redisPublisher.js";
import {
    getAllTestCasesByProblemId
} from "../services/testCase.service.js";

import {
    runSubmission
} from "../execution/runSubmission.js";


const worker = new Worker(
    "submissions",

    async (job) => {
        const { submissionId } = job.data;

        if (!submissionId) {
            throw new Error("Missing submissionId");
        }

        console.log(
            `Processing submission ${submissionId}`
        );
        let submission;
        try {
            // ----------------------------------------------
            // 1. Mark submission as PROCESSING
            // ----------------------------------------------

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

            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId: submission.id,
                userId: submission.user_id,
                status: "PROCESSING"
            });
            // ----------------------------------------------
            // 2. Fetch test cases
            // ----------------------------------------------

            const testCases =
                await getAllTestCasesByProblemId(
                    submission.problem_id
                );


            if (testCases.length === 0) {
                throw new Error(
                    `Problem ${submission.problem_id} has no test cases`
                );
            }


            console.log(
                `Running ${testCases.length} test cases for submission ${submissionId}`
            );


            // ----------------------------------------------
            // 3. Start execution timer
            // ----------------------------------------------

            const executionStart = process.hrtime.bigint();


            // ----------------------------------------------
            // 4. Execute and judge submission
            // ----------------------------------------------

            const result = await runSubmission({
                language: submission.language,
                sourceCode: submission.source_code,
                testCases
            });


            // ----------------------------------------------
            // 5. Calculate execution time
            // ----------------------------------------------

            const executionEnd = process.hrtime.bigint();

            const executionTimeMs = Number(
                executionEnd - executionStart
            ) / 1_000_000;


            const roundedExecutionTimeMs =
                Math.round(executionTimeMs);


            console.log(
                `Submission ${submissionId} verdict: ${result.verdict}`
            );

            console.log(
                `Submission ${submissionId} execution time: ${roundedExecutionTimeMs} ms`
            );


            // ----------------------------------------------
            // 6. Mark submission as COMPLETED
            // ----------------------------------------------

            await pool.query(
                `UPDATE submissions
                 SET status = 'COMPLETED',
                     verdict = $1,
                     completed_at = CURRENT_TIMESTAMP,
                     execution_time_ms = $2
                 WHERE id = $3`,
                [
                    result.verdict,
                    roundedExecutionTimeMs,
                    submissionId
                ]
            );

            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId: submission.id,
                userId: submission.user_id,
                status: "COMPLETED",
                verdict: result.verdict
            });
            // ----------------------------------------------
            // 7. Return result to BullMQ
            // ----------------------------------------------

            return result;

        } catch (error) {

            console.error(
                `Submission ${submissionId} failed:`,
                error
            );


            // ----------------------------------------------
            // Unexpected worker/system failure
            // ----------------------------------------------

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
            await publishSubmissionEvent({
                type: "SUBMISSION_STATUS",
                submissionId,
                userId: submission?.user_id,
                status: "FAILED"
            });

            throw error;
        }
    },

    {
        connection: {
            host: "localhost",
            port: 6379
        }
    }
);


// ======================================================
// BullMQ EVENTS
// ======================================================

worker.on("completed", (job) => {

    console.log(
        `Job ${job.id} completed`
    );

});


worker.on("failed", (job, error) => {

    console.error(
        `Job ${job?.id} failed:`,
        error
    );

});