import pool from "../db.js";

export const createSubmission = async ({
    userId,
    problemId,
    sourceCode,
    language
}) => {
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
                    submissionId: submission.id
                })
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

export const getSubmissionById = async (
    submissionId,
    userId
) => {
    const result = await pool.query(
        `SELECT
            id,
            user_id,
            problem_id,
            language,
            status,
            verdict,
            created_at,
            started_at,
            completed_at,
            execution_time_ms
         FROM submissions
         WHERE id = $1
         AND user_id = $2`,
        [
            submissionId,
            userId
        ]
    );

    if (result.rows.length === 0) {
        throw new AppError(
            "Submission not found",
            404
        );
    }

    return result.rows[0];
};

export const getUserSubmissions = async ({
    userId,
    page,
    limit
}) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(
        `SELECT
            id,
            problem_id,
            language,
            status,
            verdict,
            created_at,
            started_at,
            completed_at,
            execution_time_ms
         FROM submissions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2
         OFFSET $3`,
        [
            userId,
            limit,
            offset
        ]
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
            totalPages: Math.ceil(total / limit)
        }
    };
};