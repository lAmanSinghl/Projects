import express from "express";

import {createSubmissionController,getSubmissionController,getUserSubmissionsController} from "../controllers/submission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createSubmissionController
);

router.get(
    "/",
    authMiddleware,
    getUserSubmissionsController
);

router.get(
    "/:id",
    authMiddleware,
    getSubmissionController
);
export default router;