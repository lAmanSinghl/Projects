
import { apiFetch } from "./api.js";

const ACCESS_TOKEN_KEY = "accessToken";

async function readResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || fallbackMessage
    );
  }

  return data;
}

export async function registerUser({ username, email, password }) {
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
    refreshOn401: false,
  });

  return readResponse(response, "Registration failed.");
}

export async function verifyEmail({ email, otp }) {
  const response = await apiFetch("/api/auth/verify-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
    refreshOn401: false,
  });

  return readResponse(response, "Email verification failed.");
}

export async function login({ identifier, password }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
    refreshOn401: false,
  });

  const data = await readResponse(response, "Login failed.");

  if (typeof data.accessToken !== "string") {
    throw new Error("Login response contained no access token.");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

  return data.user;
}

export async function getCurrentUser() {
  const response = await apiFetch("/api/auth/me");
  return readResponse(response, "Unable to load your profile.");
}

export async function logout() {
  const response = await apiFetch("/api/auth/logout", {
    method: "POST",
    refreshOn401: false,
  });

  if (!response.ok) {
    throw new Error("Logout failed.");
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
