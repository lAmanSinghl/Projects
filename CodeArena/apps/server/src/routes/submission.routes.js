
import express from "express";

import {
    runSubmissionController,
    submitSubmissionController,
    getSubmissionController,
    getUserSubmissionsController,
    getUserSubmissionStatsController,
} from "../controllers/submission.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Run against public test cases.
router.post("/run", authMiddleware, runSubmissionController);

// Submit against public and hidden test cases.
router.post("/submit", authMiddleware, submitSubmissionController);

// Submission history and stats.
router.get("/", getUserSubmissionsController);
router.get("/stats", getUserSubmissionStatsController);

// Retrieve an individual submission and its result.
router.get("/:id", authMiddleware, getSubmissionController);

export default router;
