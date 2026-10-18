
import pool from "../db.js";
import AppError from "../utils/AppError.js";

export const createTestCase = async (slug, testCase) => {
    const { input, expected_output, is_hidden } = testCase;

    const problemResult = await pool.query(
        `SELECT id
         FROM problems
         WHERE slug = $1
           AND deleted_at IS NULL`,
        [slug]
    );

    if (problemResult.rows.length === 0) {
        throw new AppError("Problem not found", 404);
    }

    const problemId = problemResult.rows[0].id;

    const result = await pool.query(
        `INSERT INTO test_cases (
            problem_id,
            input,
            expected_output,
            is_hidden
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            problem_id,
            input,
            expected_output,
            is_hidden`,
        [problemId, input, expected_output, is_hidden]
    );

    return result.rows[0];
};

export const createTestCasesBulk = async (slug, testCases) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const problemResult = await client.query(
            `SELECT id
             FROM problems
             WHERE slug = $1
               AND deleted_at IS NULL
             FOR SHARE`,
            [slug]
        );

        if (problemResult.rows.length === 0) {
            throw new AppError("Problem not found", 404);
        }

        const problemId = problemResult.rows[0].id;
        const createdTestCases = [];

        for (const testCase of testCases) {
            const {
                input,
                expected_output,
                is_hidden,
            } = testCase;

            const result = await client.query(
                `INSERT INTO test_cases (
                    problem_id,
                    input,
                    expected_output,
                    is_hidden
                )
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    problem_id,
                    input,
                    expected_output,
                    is_hidden`,
                [
                    problemId,
                    input,
                    expected_output,
                    is_hidden,
                ]
            );

            createdTestCases.push(result.rows[0]);
        }

        await client.query("COMMIT");

        return {
            problemId,
            count: createdTestCases.length,
            testCases: createdTestCases,
        };
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Failed to roll back test-case transaction:",
                rollbackError
            );
        }

        throw error;
    } finally {
        client.release();
    }
};

export const getPublicTestCases = async (slug) => {
    const problemResult = await pool.query(
        `SELECT id
         FROM problems
         WHERE slug = $1
           AND deleted_at IS NULL`,
        [slug]
    );

    if (problemResult.rows.length === 0) {
        throw new AppError("Problem not found", 404);
    }

    const problemId = problemResult.rows[0].id;

    const result = await pool.query(
        `SELECT
            id,
            input,
            expected_output
         FROM test_cases
         WHERE problem_id = $1
           AND is_hidden = false
         ORDER BY id ASC`,
        [problemId]
    );

    return result.rows;
};

export const getAllTestCasesByProblemId = async (problemId) => {
    const result = await pool.query(
        `SELECT
            id,
            input,
            expected_output,
            is_hidden
         FROM test_cases
         WHERE problem_id = $1
         ORDER BY id ASC`,
        [problemId]
    );

    return result.rows;
};
