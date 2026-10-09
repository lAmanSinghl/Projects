import {
    registerUser,
    verifyRegistrationOtp,
    loginUser,
    refreshAccessToken,
    logoutUser,
    beginGoogleLogin,
    completeGoogleRegistration
} from "../services/auth.service.js";

import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    googleRegistrationSchema
} from "../validation/auth.schema.js";

import AppError from "../utils/AppError.js";

import { randomBytes } from "node:crypto";

import {
    createGoogleAuthorizationUrl,
    googleOAuthClient
} from "../utils/googleOAuth.js";

export const getMe = (req, res) => {
    res.status(200).json(req.user);
};

export const login = async (req, res) => {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(validatedData);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        user: result.user,
        accessToken: result.accessToken
    });
};

export const register = async (req, res) => {
    const validatedData = registerSchema.parse(req.body);

    const user = await registerUser(validatedData);

    res.status(201).json(user);
};

export const verifyEmail = async (req, res) => {
    const validatedData = verifyEmailSchema.parse(req.body);

    const user = await verifyRegistrationOtp(validatedData);

    res.status(201).json({
        message: "Email verified and account created successfully",
        user
    });
};


export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError("Refresh token required", 401);
    }


    const result = await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        accessToken: result.accessToken
    });
};


export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.status(204).send();
};

export const startGoogleOAuth = (req, res) => {

    const state = randomBytes(32).toString("hex");

    res.cookie("googleOAuthState", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
        path: "/api/auth/google/callback"
    });

    const authorizationUrl = createGoogleAuthorizationUrl(state);

    res.redirect(302, authorizationUrl);
};


export const googleOAuthCallback = async (req, res) => {
    const { code, state, error } = req.query;
    const expectedState = req.cookies.googleOAuthState;

    // Clear the one-time state cookie using the same path.
    res.clearCookie("googleOAuthState", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/google/callback"
    });

    if (error) {
        throw new AppError("Google sign-in was cancelled or denied", 400);
    }

    if (
        typeof state !== "string" ||
        !expectedState ||
        state !== expectedState
    ) {
        throw new AppError("Invalid Google OAuth state", 400);
    }

    if (typeof code !== "string" || !code) {
        throw new AppError("Google authorization code is missing", 400);
    }

    // Exchange Google's one-time authorization code.
    const { tokens } = await googleOAuthClient.getToken(code);

    if (!tokens.id_token) {
        throw new AppError("Google did not return an ID token", 401);
    }

    // Verify the ID token's signature, audience, and validity.
    const ticket = await googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (
        !payload?.sub ||
        !payload.email ||
        payload.email_verified !== true
    ) {
        throw new AppError(
            "Google account identity or verified email is missing",
            401
        );
    }

    // Temporary development response: account linking comes next.
    const result = await beginGoogleLogin({
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified === true,
        name: payload.name,
        picture: payload.picture
    });

    if (result.status === "registration_required") {
        res.cookie(
            "googleRegistrationToken",
            result.registrationToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 10 * 60 * 1000,
                path: "/api/auth/google/register"
            }
        );

        return res.status(200).json({
            status: "registration_required",
            message: "Choose a username to finish creating your account.",
            profile: result.profile
        });
    }

    // Existing Google-linked account: create a normal login session.
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        status: "authenticated",
        user: result.user,
        accessToken: result.accessToken
    });
};


export const completeGoogleRegistrationController = async (req, res) => {
    const { username } = googleRegistrationSchema.parse(req.body);

    const registrationToken = req.cookies.googleRegistrationToken;

    if (!registrationToken) {
        throw new AppError(
            "Google registration session expired. Please sign in with Google again.",
            401
        );
    }

    const result = await completeGoogleRegistration({
        registrationToken,
        username
    });

    res.clearCookie("googleRegistrationToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/google/register"
    });

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
        status: "authenticated",
        user: result.user,
        accessToken: result.accessToken
    });
};
