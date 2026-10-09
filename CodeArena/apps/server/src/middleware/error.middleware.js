import { z } from "zod";

export const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof z.ZodError) {
        const fields = {};

        for (const issue of err.issues) {
            const field = issue.path.join(".");

            if (!fields[field]) {
                fields[field] = issue.message;
            }
        }

        return res.status(400).json({
            error: "Validation failed",
            fields
        });
    }

    if (err.code === "23505") {
        return res.status(409).json({
            error: "Resource already exists"
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: err.message || "Internal server error"
    });
};