
import express from "express";

import {
    createSubmissionController,
    getSubmissionController,
    getUserSubmissionsController,
    getUserSubmissionStatsController
} from "../controllers/submission.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Creating submissions requires authentication.
router.post(
    "/",
    authMiddleware,
    createSubmissionController
);

// Public submission history, selected by username.
router.get(
    "/",
    getUserSubmissionsController
);

// Public stats, selected by username.
router.get(
    "/stats",
    getUserSubmissionStatsController
);

// Individual submission details remain protected.
router.get(
    "/:id",
    authMiddleware,
    getSubmissionController
);

export default router;
