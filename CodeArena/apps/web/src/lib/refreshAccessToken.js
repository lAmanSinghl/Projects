
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_LOCK = "codearena:refresh";

export async function refreshAccessToken(tokenUsedByRequest) {
    if (typeof window === "undefined") {
        throw new Error("Token refresh must run in the browser.");
    }

    if (!navigator.locks?.request) {
        throw new Error(
            "Your browser does not support coordinated token refresh."
        );
    }

    return navigator.locks.request(REFRESH_LOCK, async () => {
        const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        // Another tab may have refreshed while we waited.
        if (
            currentToken &&
            currentToken !== tokenUsedByRequest
        ) {
            return currentToken;
        }

        // Avoid restoring a session after another tab logged out.
        if (tokenUsedByRequest && !currentToken) {
            throw new Error("Your session has ended. Please log in again.");
        }


        const response = await fetch(
            `${API_URL}/api/auth/refresh`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (
                response.status === 401 &&
                localStorage.getItem(ACCESS_TOKEN_KEY) === currentToken
            ) {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
            }

            throw new Error(
                data.error || "Unable to refresh your session."
            );
        }

        if (typeof data.accessToken !== "string") {
            throw new Error("Refresh response did not contain an access token.");
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

        return data.accessToken;
    });
}
