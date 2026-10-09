
import { OAuth2Client } from "google-auth-library";

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
} = process.env;

if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_CALLBACK_URL
) {
    throw new Error(
        "Missing Google OAuth environment variables."
    );
}

export const googleOAuthClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
);

export const createGoogleAuthorizationUrl = (state) => {
    return googleOAuthClient.generateAuthUrl({
        response_type: "code",
        scope: ["openid", "email", "profile"],
        state,
        prompt: "select_account"
    });
};
