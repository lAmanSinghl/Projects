
import { apiFetch } from "../src/lib/api";

const ACCESS_TOKEN_KEY = "accessToken";

export async function login({ email, password }) {
    const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        refreshOn401: false
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Login failed.");
    }

    if (typeof data.accessToken !== "string") {
        throw new Error("Login response contained no access token.");
    }

    // Shared between tabs from the same origin.
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

    return data.user;
}

export async function getCurrentUser() {
    const response = await apiFetch("/api/auth/me");

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Unable to load your profile.");
    }

    return data;
}

export async function logout() {
    const response = await apiFetch("/api/auth/logout", {
        method: "POST",
        refreshOn401: false
    });

    if (!response.ok) {
        throw new Error("Logout failed.");
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
}
