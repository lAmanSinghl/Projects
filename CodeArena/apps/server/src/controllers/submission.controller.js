import submissionSchema from "../validation/submission.schema.js";
import {
    createSubmission,
    getSubmissionById,
    getUserSubmissions,
    getUserSubmissionStats
} from "../services/submission.service.js";
import {
    getPublicUserByUsername
} from "../services/auth.service.js";
export const createSubmissionController = async (req, res) => {
    const data = submissionSchema.parse(req.body);

    const submission = await createSubmission({
        userId: req.user.id,
        problemId: data.problemId,
        sourceCode: data.sourceCode,
        language: data.language
    });

    res.status(201).json(submission);
};


export const getSubmissionController = async (req, res) => {
    const submissionId = Number(req.params.id);

    const submission = await getSubmissionById(
        submissionId,
        req.user.id
    );

    res.status(200).json(submission);
};


export const getUserSubmissionsController = async (req, res) => {
    const username = req.query.username;

    if (typeof username !== "string" || !username.trim()) {
        return res.status(400).json({
            message: "Username is required"
        });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
            message: "Page must be at least 1"
        });
    }

    if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        return res.status(400).json({
            message: "Limit must be between 1 and 100"
        });
    }

    const user = await getPublicUserByUsername(username.trim());

    const result = await getUserSubmissions({
        userId: user.id,
        page,
        limit
    });

    res.status(200).json(result);
};

export const getUserSubmissionStatsController = async (req, res) => {
    const username = req.query.username;

    if (typeof username !== "string" || !username.trim()) {
        return res.status(400).json({
            message: "Username is required"
        });
    }

    const user = await getPublicUserByUsername(username.trim());

    const stats = await getUserSubmissionStats(user.id);

    res.status(200).json(stats);
};
