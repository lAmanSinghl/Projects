
import express from "express";

import {
    getProblems,
    createProblemController,
    getProblem,
    deleteProblem,
    createTestCaseController,
    createTestCasesBulkController,
    getTestCases
} from "../controllers/problem.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/authorization.middleware.js";

const router = express.Router();

// Public routes

router.get("/", getProblems);
router.get("/:slug", getProblem);
router.get("/:slug/test-cases", getTestCases);

// Admin-only routes

router.post(
    "/",
    authMiddleware,
    requireAdmin,
    createProblemController
);

router.post(
    "/:slug/test-cases",
    authMiddleware,
    requireAdmin,
    createTestCaseController
);

router.post(
    "/:slug/test-cases/bulk",
    authMiddleware,
    requireAdmin,
    createTestCasesBulkController
);

router.delete(
    "/:slug",
    authMiddleware,
    requireAdmin,
    deleteProblem
);

export default router;
