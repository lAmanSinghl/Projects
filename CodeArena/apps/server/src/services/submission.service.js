import pool from "../db.js";
import AppError from "../utils/AppError.js";
import submissionQueue from "../queues/submission.queue.js";

export const createSubmission = async ({
    userId,
    problemId,
    sourceCode,
    language,
    executionType,
}) => {
    if (!["run", "submit"].includes(executionType)) {
        throw new AppError("Invalid execution type", 400);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const submissionResult = await client.query(
            `INSERT INTO submissions
             (user_id, problem_id, source_code, language)
             VALUES ($1, $2, $3, $4)
             RETURNING id, user_id, problem_id, status, created_at`,
            [userId, problemId, sourceCode, language]
        );

        const submission = submissionResult.rows[0];

        await client.query(
            `INSERT INTO outbox_events
             (event_type, aggregate_id, payload)
             VALUES ($1, $2, $3)`,
            [
                "SUBMISSION_CREATED",
                submission.id,
                JSON.stringify({
                    submissionId: submission.id,
                    executionType,
                }),
            ]
        );

        await client.query("COMMIT");

        return submission;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};



export const getSubmissionById = async (submissionId, userId) => {
    const { rows } = await pool.query(
        `SELECT
       id,
       user_id,
       problem_id,
       language,
       status,
       verdict,
       source_code,
       created_at,
       execution_time_ms,
       error_output,
       exit_code,
       failed_test_case_id,
       actual_output,
       passed_test_cases,
       total_test_cases
     FROM submissions
     WHERE id = $1 AND user_id = $2`,
        [submissionId, userId]
    );

    if (rows.length === 0) {
        throw new AppError("Submission not found", 404);
    }

    const submission = rows[0];

    const response = {
        id: submission.id,
        problemId: submission.problem_id,
        language: submission.language,
        status: submission.status,
        createdAt: submission.created_at,
        sourceCode: submission.source_code,
        result: null,
    };

    // Results are available only after processing finishes.
    if (submission.status !== "COMPLETED") {
        return response;
    }

    let failedTestCase = null;

    if (submission.failed_test_case_id !== null) {
        const { rows: testCases } = await pool.query(
            `SELECT id, is_hidden, input, expected_output
       FROM test_cases
       WHERE id = $1`,
            [submission.failed_test_case_id]
        );

        const testCase = testCases[0];

        // Never expose hidden test-case details.
        if (testCase) {
            failedTestCase = {
                id: testCase.id,
                input: testCase.input,
                expectedOutput: testCase.expected_output,
                actualOutput: submission.actual_output,
            };
        }
    }

    response.result = {
        verdict: submission.verdict,
        executionTimeMs: submission.execution_time_ms,
        passedTestCases: submission.passed_test_cases,
        totalTestCases: submission.total_test_cases,
        ...(submission.error_output
            ? { errorOutput: submission.error_output }
            : {}),
        ...(submission.exit_code !== null
            ? { exitCode: submission.exit_code }
            : {}),
        ...(failedTestCase ? { failedTestCase } : {}),
    };

    return response;
};


export const getUserSubmissions = async ({
    userId,
    page,
    limit,
}) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(
        `SELECT
            s.id,
            s.problem_id,
            p.title AS problem_title,
            p.slug AS problem_slug,
            s.language,
            s.status,
            s.verdict,
            s.created_at,
            s.started_at,
            s.completed_at,
            s.execution_time_ms
         FROM submissions s
         LEFT JOIN problems p ON p.id = s.problem_id
         WHERE s.user_id = $1
         ORDER BY s.created_at DESC, s.id DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)::integer AS total
         FROM submissions
         WHERE user_id = $1`,
        [userId]
    );

    const total = countResult.rows[0].total;

    return {
        submissions: result.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getUserSubmissionStats = async (userId) => {
    const result = await pool.query(
        `SELECT
            COUNT(*)::integer AS total_submissions,
            COUNT(*) FILTER (
                WHERE verdict = 'ACCEPTED'
            )::integer AS accepted_submissions,
            COUNT(DISTINCT problem_id) FILTER (
                WHERE verdict = 'ACCEPTED'
            )::integer AS solved_problems
         FROM submissions
         WHERE user_id = $1`,
        [userId]
    );

    const stats = result.rows[0];
    const total = stats.total_submissions;
    const accepted = stats.accepted_submissions;

    return {
        totalSubmissions: total,
        acceptedSubmissions: accepted,
        solvedProblems: stats.solved_problems,
        acceptanceRate:
            total === 0
                ? 0
                : Number(((accepted / total) * 100).toFixed(1)),
    };
};

export const getProblemSubmissions = async ({
    userId,
    problemId,
}) => {
    const result = await pool.query(
        `SELECT
            id,
            problem_id,
            language,
            status,
            verdict,
            created_at,
            completed_at,
            execution_time_ms
         FROM submissions
         WHERE user_id = $1
           AND problem_id = $2
         ORDER BY created_at DESC, id DESC`,
        [userId, problemId]
    );

    return result.rows;
};


export const getPublicSubmissionById = async (submissionId) => {
    const { rows } = await pool.query(
        `SELECT
            s.id,
            s.problem_id,
            p.slug AS problem_slug,
            p.title AS problem_title,
            s.language,
            s.status,
            s.verdict,
            s.source_code,
            s.created_at,
            s.execution_time_ms,
            s.error_output,
            s.exit_code,
            s.failed_test_case_id,
            s.actual_output,
            s.passed_test_cases,
            s.total_test_cases
         FROM submissions s
         JOIN problems p ON p.id = s.problem_id
         WHERE s.id = $1`,
        [submissionId]
    );

    if (rows.length === 0) {
        throw new AppError("Submission not found", 404);
    }

    const submission = rows[0];

    const response = {
        id: submission.id,
        problemId: submission.problem_id,
        problemSlug: submission.problem_slug,
        problemTitle: submission.problem_title,
        language: submission.language,
        status: submission.status,
        verdict: submission.verdict,
        createdAt: submission.created_at,
        sourceCode: submission.source_code,
        result: null,
    };

    if (submission.status !== "COMPLETED") {
        return response;
    }

    let failedTestCase = null;

    if (submission.failed_test_case_id !== null) {
        const { rows: testCases } = await pool.query(
            `SELECT id, input, expected_output
             FROM test_cases
             WHERE id = $1
               AND is_hidden = FALSE`,
            [submission.failed_test_case_id]
        );

        if (testCases.length > 0) {
            failedTestCase = {
                id: testCases[0].id,
                input: testCases[0].input,
                expectedOutput: testCases[0].expected_output,
                actualOutput: submission.actual_output,
            };
        }
    }

    response.result = {
        verdict: submission.verdict,
        executionTimeMs: submission.execution_time_ms,
        passedTestCases: submission.passed_test_cases,
        totalTestCases: submission.total_test_cases,
        ...(submission.error_output
            ? { errorOutput: submission.error_output }
            : {}),
        ...(submission.exit_code !== null
            ? { exitCode: submission.exit_code }
            : {}),
        ...(failedTestCase ? { failedTestCase } : {}),
    };

    return response;
};
