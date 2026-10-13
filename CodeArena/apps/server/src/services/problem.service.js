import pool from "../db.js";
import AppError from "../utils/AppError.js";

export const getProblemBySlug = async (slug) => {
    const result = await pool.query(
        `SELECT
    id,
    title,
    slug,
    description,
    difficulty,
    function_name,
    function_config,
    starter_code,
    created_at
FROM problems
WHERE slug = $1
AND deleted_at IS NULL`,
        [slug]
    );

    if (result.rows.length === 0) {
        throw new AppError("Problem not found", 404);
    }

    return result.rows[0];
};

export const getAllProblems = async () => {
    const result = await pool.query(
        `SELECT id, title, slug, description, difficulty, created_at
         FROM problems
         WHERE deleted_at IS NULL`
    );

    return result.rows;
};


export const createProblem = async (problem) => {
    const {
        title,
        slug,
        description,
        difficulty,
        function_name,
        function_config,
        starter_code,
    } = problem;

    const result = await pool.query(
        `INSERT INTO problems (
            title,
            slug,
            description,
            difficulty,
            function_name,
            function_config,
            starter_code
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            title,
            slug,
            description,
            difficulty,
            function_name,
            JSON.stringify(function_config),
            JSON.stringify(starter_code),
        ]
    );

    return result.rows[0];
};


export const deleteProblemBySlug = async (slug) => {
    const result = await pool.query(
        `UPDATE problems
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE slug = $1
         AND deleted_at IS NULL
         RETURNING id, title, slug, deleted_at`,
        [slug]
    );

    if (result.rows.length === 0) {
        throw new AppError("Problem not found", 404);
    }

    return result.rows[0];
};

