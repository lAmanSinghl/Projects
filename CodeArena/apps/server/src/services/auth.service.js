import redis from "../redis.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import argon2 from "argon2";
import pool from "../db.js";
import AppError from "../utils/AppError.js";
import createAccessToken from "../utils/jwt.js";
import { generateRefreshToken } from "../utils/refreshToken.js";
import { hashToken } from "../utils/tokenHash.js";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/email.js";



const REGISTRATION_TTL = 10 * 60;

const getRegistrationKey = (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    return `registration:otp:${hashToken(normalizedEmail)}`;
};

const storePendingRegistration = async ({
    username,
    email,
    passwordHash,
    otp
}) => {
    const key = getRegistrationKey(email);

    const registrationData = {
        username,
        email: email.trim().toLowerCase(),
        passwordHash,
        otpHash: hashOtp(otp),
        attempts: 0
    };

    await redis.set(
        key,
        JSON.stringify(registrationData),
        "EX",
        REGISTRATION_TTL
    );

    return otp;
};

export const getCurrentUser = async (userId) => {
    const result = await pool.query(
        `SELECT
            id,
            username,
            email,
            display_name,
            avatar_url,
            bio,
            role,
            created_at
         FROM users
         WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new AppError("User not found", 404);
    }

    return result.rows[0];
};

export const registerUser = async ({ username, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
        `SELECT id
         FROM users
         WHERE LOWER(email) = $1
            OR username = $2`,
        [normalizedEmail, username]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError(
            "Email or username already exists",
            409
        );
    }

    const passwordHash = await argon2.hash(password);
    const otp = generateOtp();

    await storePendingRegistration({
        username,
        email: normalizedEmail,
        passwordHash,
        otp
    });

    // Temporary development step: we'll connect email delivery next.
    await sendOtpEmail(normalizedEmail, otp);

    return {
        message: "Verification code sent to your email."
    };
};


export const verifyRegistrationOtp = async ({ email, otp }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const key = getRegistrationKey(normalizedEmail);

    const verifyOtpScript = `
local registrationData = redis.call("GET", KEYS[1])

if not registrationData then
    return -1
end

local registration = cjson.decode(registrationData)

if registration.email ~= ARGV[1] then
    return -4
end

if registration.otpHash ~= ARGV[2] then
    registration.attempts = registration.attempts + 1

    if registration.attempts >= 5 then
        redis.call("DEL", KEYS[1])
        return -2
    else
        redis.call(
            "SET",
            KEYS[1],
            cjson.encode(registration),
            "KEEPTTL"
        )
    end

    return -3
end

return cjson.encode(registration)
    `;

    // ARGV[1] = normalized email
    // ARGV[2] = hashed OTP
    const result = await redis.eval(
        verifyOtpScript,
        1,
        key,
        normalizedEmail,
        hashOtp(otp)
    );

    if (result === -1) {
        throw new AppError(
            "Registration expired or not found. Please register again.",
            400
        );
    }

    if (result === -2) {
        throw new AppError(
            "Too many failed attempts. Please register again.",
            429
        );
    }

    if (result === -3) {
        throw new AppError("Invalid OTP.", 400);
    }

    if (result === -4) {
        throw new AppError(
            "Registration email mismatch. Please register again.",
            400
        );
    }

    let registration;

    try {
        registration = JSON.parse(result);
    } catch {
        throw new AppError(
            "Invalid registration data. Please register again.",
            400
        );
    }

    // Validate the pending registration before touching PostgreSQL.
    if (
        !registration.username ||
        !registration.email ||
        !registration.passwordHash ||
        registration.email !== normalizedEmail
    ) {
        throw new AppError(
            "Registration data is incomplete or invalid. Please register again.",
            400
        );
    }

    const client = await pool.connect();
    let transactionOpen = false;

    try {
        await client.query("BEGIN");
        transactionOpen = true;

        // Create the account.
        const userResult = await client.query(
            `INSERT INTO users (
                username,
                email,
                password_hash
            )
            VALUES ($1, $2, $3)
            RETURNING
                id,
                username,
                email,
                display_name,
                avatar_url,
                bio,
                role,
                created_at`,
            [
                registration.username,
                normalizedEmail,
                registration.passwordHash
            ]
        );

        const user = userResult.rows[0];

        // Create the same kind of session as normal password login.
        const accessToken = createAccessToken(user);
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashToken(refreshToken);
        const familyId = crypto.randomUUID();

        await client.query(
            `INSERT INTO refresh_tokens (
                user_id,
                token_hash,
                family_id,
                expires_at
            )
            VALUES (
                $1,
                $2,
                $3,
                CURRENT_TIMESTAMP + INTERVAL '30 days'
            )`,
            [
                user.id,
                refreshTokenHash,
                familyId
            ]
        );

        // Commit the account and its session together.
        await client.query("COMMIT");
        transactionOpen = false;

        // Best-effort cleanup after the database commit.
        // Redis TTL remains the fallback if deletion fails.
        try {
            await redis.del(key);
        } catch {
            // Do not turn a successful account creation into a failed response.
        }

        return {
            user,
            accessToken,
            refreshToken
        };
    } catch (error) {
        if (transactionOpen) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Preserve the original error.
            }
        }

        if (error.code === "23505") {
            // Best-effort cleanup for a duplicate account.
            try {
                await redis.del(key);
            } catch {
                // Preserve the original database error handling.
            }

            throw new AppError(
                "Email or username already exists. Please register again.",
                409
            );
        }

        // Keep pending registration for retryable database failures.
        throw error;
    } finally {
        client.release();
    }
};



export const loginUser = async ({ identifier, password }) => {
    const result = await pool.query(
        `SELECT
            id,
            username,
            email,
            password_hash,
            display_name,
            avatar_url,
            bio,
            role,
            created_at
         FROM users
         WHERE LOWER(email) = LOWER($1)
            OR username = $1`,
        [identifier.trim()]
    );

    const dbUser = result.rows[0];

    // Same generic error for unknown users and accounts without passwords.
    if (!dbUser || !dbUser.password_hash) {
        throw new AppError(
            "Invalid username/email or password",
            401
        );
    }

    const passwordMatches = await argon2.verify(
        dbUser.password_hash,
        password
    );

    if (!passwordMatches) {
        throw new AppError(
            "Invalid username/email or password",
            401
        );
    }

    // Never return the password hash to the client.
    const { password_hash, ...user } = dbUser;

    const accessToken = createAccessToken(user);

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);
    const familyId = crypto.randomUUID();

    await pool.query(
        `INSERT INTO refresh_tokens (
            user_id,
            token_hash,
            family_id,
            expires_at
         )
         VALUES (
            $1,
            $2,
            $3,
            CURRENT_TIMESTAMP + INTERVAL '30 days'
         )`,
        [user.id, refreshTokenHash, familyId]
    );

    return {
        user,
        accessToken,
        refreshToken
    };
};


export const refreshAccessToken = async (refreshToken) => {
    const client = await pool.connect();
    let transactionOpen = false;

    try {
        await client.query("BEGIN");
        transactionOpen = true;

        const tokenHash = hashToken(refreshToken);

        // Lock this token row while processing the refresh.
        const result = await client.query(
            `SELECT id, user_id, family_id, expires_at, revoked_at
             FROM refresh_tokens
             WHERE token_hash = $1
             FOR UPDATE`,
            [tokenHash]
        );

        if (result.rows.length === 0) {
            throw new AppError("Invalid refresh token", 401);
        }

        const storedToken = result.rows[0];

        // Preserve strict refresh-token reuse detection.
        if (storedToken.revoked_at) {
            await client.query(
                `UPDATE refresh_tokens
                 SET revoked_at = CURRENT_TIMESTAMP
                 WHERE family_id = $1
                   AND revoked_at IS NULL`,
                [storedToken.family_id]
            );

            // Commit the revocation before returning the error.
            await client.query("COMMIT");
            transactionOpen = false;

            throw new AppError(
                "Refresh token reuse detected",
                401
            );
        }

        if (new Date(storedToken.expires_at) <= new Date()) {
            throw new AppError("Refresh token has expired", 401);
        }

        const userResult = await client.query(
            `SELECT id, role
             FROM users
             WHERE id = $1`,
            [storedToken.user_id]
        );

        if (userResult.rows.length === 0) {
            throw new AppError("User not found", 401);
        }

        const user = userResult.rows[0];

        // Revoke the current refresh token.
        await client.query(
            `UPDATE refresh_tokens
             SET revoked_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [storedToken.id]
        );

        const newRefreshToken = generateRefreshToken();
        const newRefreshTokenHash = hashToken(newRefreshToken);

        // Insert the replacement token in the same family.
        await client.query(
            `INSERT INTO refresh_tokens (
                user_id,
                token_hash,
                family_id,
                expires_at
            )
            VALUES (
                $1,
                $2,
                $3,
                CURRENT_TIMESTAMP + INTERVAL '30 days'
            )`,
            [
                user.id,
                newRefreshTokenHash,
                storedToken.family_id
            ]
        );

        const accessToken = createAccessToken(user);

        await client.query("COMMIT");
        transactionOpen = false;

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        if (transactionOpen) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Preserve the original error.
            }
        }

        throw error;
    } finally {
        client.release();
    }
};


export const logoutUser = async (refreshToken) => {
    const tokenHash = hashToken(refreshToken);

    const result = await pool.query(
        `SELECT family_id
         FROM refresh_tokens
         WHERE token_hash = $1
         AND revoked_at IS NULL`,
        [tokenHash]
    );

    if (result.rows.length === 0) {
        return;
    }

    const { family_id } = result.rows[0];

    await pool.query(
        `UPDATE refresh_tokens
         SET revoked_at = CURRENT_TIMESTAMP
         WHERE family_id = $1
         AND revoked_at IS NULL`,
        [family_id]
    );
};


const getUserByGoogleId = async (googleId) => {
    const result = await pool.query(
        `SELECT
            u.id,
            u.username,
            u.email,
            u.display_name,
            u.avatar_url,
            u.bio,
            u.role,
            u.created_at
         FROM user_oauth_accounts AS oa
         JOIN users AS u ON u.id = oa.user_id
         WHERE oa.provider = 'google'
           AND oa.provider_user_id = $1`,
        [googleId]
    );

    return result.rows[0] ?? null;
};

const createGoogleSession = async (user) => {
    const refreshToken = generateRefreshToken();

    await pool.query(
        `INSERT INTO refresh_tokens (
            user_id,
            token_hash,
            family_id,
            expires_at
        )
        VALUES (
            $1,
            $2,
            $3,
            CURRENT_TIMESTAMP + INTERVAL '30 days'
        )`,
        [
            user.id,
            hashToken(refreshToken),
            crypto.randomUUID()
        ]
    );

    return {
        status: "authenticated",
        user,
        accessToken: createAccessToken(user),
        refreshToken
    };
};

export const beginGoogleLogin = async ({
    googleId,
    email,
    emailVerified,
    name,
    picture
}) => {
    if (
        typeof googleId !== "string" ||
        !googleId ||
        typeof email !== "string" ||
        !email.trim() ||
        emailVerified !== true
    ) {
        throw new AppError(
            "A verified Google identity is required",
            401
        );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Returning Google user: authenticate the linked account.
    const linkedUser = await getUserByGoogleId(googleId);

    if (linkedUser) {
        return createGoogleSession(linkedUser);
    }

    // 2. An existing email/password account must not be
    // silently linked based on an email match.

    const existingEmail = await pool.query(
        `SELECT id
         FROM users
         WHERE LOWER(email) = $1
         LIMIT 1`,
        [normalizedEmail]
    );

    if (existingEmail.rows.length > 0) {
        throw new AppError(
            "An account already uses this email. Sign in to that account before linking Google.",
            409
        );
    }

    // 3. New Google user: wait for them to choose a username.
    // Do not create a database user yet.

    const registrationToken = crypto
        .randomBytes(32)
        .toString("hex");

    const registrationKey =
        `google:registration:${hashToken(registrationToken)}`;

    await redis.set(
        registrationKey,
        JSON.stringify({
            googleId,
            email: normalizedEmail,
            name: name ?? null,
            picture: picture ?? null
        }),
        "EX",
        10 * 60
    );

    return {
        status: "registration_required",
        registrationToken,
        profile: {
            email: normalizedEmail,
            name: name ?? null,
            picture: picture ?? null
        }
    };
};

export const completeGoogleRegistration = async ({
    registrationToken,
    username
}) => {
    // The controller validates the username through Zod.
    // The registration token comes from an HTTP-only cookie.
    if (typeof registrationToken !== "string" || !registrationToken) {
        throw new AppError("Google registration token is required", 401);
    }

    // Retrieve the temporary Google identity from Redis.
    const key = `google:registration:${hashToken(registrationToken)}`;
    const pendingData = await redis.get(key);

    if (!pendingData) {
        throw new AppError(
            "Google registration has expired. Please sign in with Google again.",
            401
        );
    }

    let googleUser;

    try {
        googleUser = JSON.parse(pendingData);
    } catch {
        await redis.del(key);

        throw new AppError(
            "Invalid pending Google registration",
            401
        );
    }

    if (
        typeof googleUser.googleId !== "string" ||
        !googleUser.googleId ||
        typeof googleUser.email !== "string" ||
        !googleUser.email
    ) {
        await redis.del(key);

        throw new AppError(
            "Invalid pending Google registration",
            401
        );
    }

    const client = await pool.connect();
    let transactionOpen = false;

    try {
        await client.query("BEGIN");
        transactionOpen = true;

        // Check whether the username is already taken.
        // Zod has already validated and trimmed it.
        const existingUsername = await client.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        );

        if (existingUsername.rows.length > 0) {
            throw new AppError("Username is already taken", 409);
        }

        // Create the CodeArena user.
        // Google-only users initially have no password.
        const userResult = await client.query(
            `INSERT INTO users (
                username,
                email,
                password_hash,
                display_name,
                avatar_url
            )
            VALUES ($1, $2, NULL, $3, $4)
            RETURNING
                id,
                username,
                email,
                display_name,
                avatar_url,
                bio,
                role,
                created_at`,
            [
                username,
                googleUser.email,
                googleUser.name ?? null,
                googleUser.picture ?? null
            ]
        );

        const user = userResult.rows[0];

        // Associate the Google identity with the new CodeArena user.
        await client.query(
            `INSERT INTO user_oauth_accounts (
                user_id,
                provider,
                provider_user_id
            )
            VALUES ($1, 'google', $2)`,
            [user.id, googleUser.googleId]
        );

        // Create the standard refresh-token session.
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashToken(refreshToken);
        const familyId = crypto.randomUUID();

        await client.query(
            `INSERT INTO refresh_tokens (
                user_id,
                token_hash,
                family_id,
                expires_at
            )
            VALUES (
                $1,
                $2,
                $3,
                CURRENT_TIMESTAMP + INTERVAL '30 days'
            )`,
            [user.id, refreshTokenHash, familyId]
        );

        const accessToken = createAccessToken(user);

        await client.query("COMMIT");
        transactionOpen = false;

        // Remove pending registration only after the DB commit succeeds.
        try {
            await redis.del(key);
        } catch {
            // Redis TTL will eventually remove the temporary data.
        }

        return {
            user,
            accessToken,
            refreshToken
        };
    } catch (error) {
        if (transactionOpen) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Preserve the original error.
            }
        }

        if (
            error.code === "23505" &&
            error.constraint?.toLowerCase().includes("username")
        ) {
            throw new AppError("Username is already taken", 409);
        }

        if (error.code === "23505") {
            throw new AppError(
                "This email or Google account is already registered. Please sign in.",
                409
            );
        }

        throw error;
    } finally {
        client.release();
    }
};

export const getPublicUserByUsername = async (username) => {
    const result = await pool.query(
        `SELECT
            id,
            username,
            display_name,
            avatar_url,
            bio,
            created_at
         FROM users
         WHERE username = $1`,
        [username]
    );

    if (result.rows.length === 0) {
        throw new AppError("User not found", 404);
    }

    return result.rows[0];
};
