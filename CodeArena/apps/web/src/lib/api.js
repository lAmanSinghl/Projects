
import { refreshAccessToken } from "./refreshAccessToken.js";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "accessToken";

const NO_REFRESH_PATHS = new Set([
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/refresh",
    "/api/auth/logout"
]);

export async function apiFetch(path, options = {}) {
    if (typeof window === "undefined") {
        throw new Error("apiFetch must be called in the browser.");
    }

    const {
        refreshOn401 = true,
        headers: suppliedHeaders,
        ...fetchOptions
    } = options;

    const normalizedPath = path.startsWith("/")
        ? path
        : `/${path}`;

    const url = `${API_URL}${normalizedPath}`;

    // Capture the access token used by the original request.
    const tokenUsedByRequest = localStorage.getItem(ACCESS_TOKEN_KEY);

    const headers = new Headers(suppliedHeaders || {});

    if (tokenUsedByRequest) {
        headers.set(
            "Authorization",
            `Bearer ${tokenUsedByRequest}`
        );
    }

    const credentials = fetchOptions.credentials ?? "include";

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials
    });

    const shouldRefresh =
        refreshOn401 &&
        response.status === 401 &&
        !NO_REFRESH_PATHS.has(normalizedPath);

    if (!shouldRefresh) {
        return response;
    }

    // This coordinates refresh requests across browser tabs.
    const newAccessToken = await refreshAccessToken(
        tokenUsedByRequest
    );

    // Retry the original request once using the new access token.
    const retryHeaders = new Headers(suppliedHeaders || {});

    retryHeaders.set(
        "Authorization",
        `Bearer ${newAccessToken}`
    );

    return fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
        credentials
    });
}
