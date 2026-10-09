
import express from "express";

import {
    register,
    login,
    getMe,
    refresh,
    logout,
    verifyEmail,
    startGoogleOAuth,
    googleOAuthCallback,
    completeGoogleRegistrationController
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import {
    registerRateLimit,
    verifyEmailRateLimit,
    loginRateLimit
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Authenticated routes
router.get("/me", authMiddleware, getMe);

// Google OAuth routes
router.get("/google", startGoogleOAuth);
router.get("/google/callback", googleOAuthCallback);
router.post("/google/register", completeGoogleRegistrationController);

// Email/password authentication routes
router.post("/register", registerRateLimit, register);
router.post("/verify-email", verifyEmailRateLimit, verifyEmail);
router.post("/login", loginRateLimit, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
