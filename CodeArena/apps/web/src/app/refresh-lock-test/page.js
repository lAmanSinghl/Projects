
"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function RefreshLockTestPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("Log in to start testing.");

    async function login(event) {
        event.preventDefault();
        setStatus("Logging in...");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("accessToken", data.accessToken);
            setStatus("Logged in. Open this page in a second tab.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    function armTest() {
        localStorage.setItem(
            "accessToken",
            "expired-access-token-for-testing"
        );

        setStatus("Test armed. Click Run /me in both tabs.");
    }

    async function runTest() {
        setStatus("Requesting profile...");

        try {
            const response = await apiFetch("/api/auth/me");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Request failed");
            }

            setStatus(
                `SUCCESS: /me returned ${response.status}. User ID: ${data.id}`
            );
        } catch (error) {
            setStatus(`FAILED: ${error.message}`);
        }
    }

    return (
        <main style={{ padding: 32, fontFamily: "sans-serif" }}>
            <h1>Refresh Lock Test</h1>

            <form onSubmit={login}>
                <p>Email</p>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <p>Password</p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <p>
                    <button type="submit">Login</button>
                </p>
            </form>

            <hr />

            <p>
                <button onClick={armTest}>Arm test</button>
                {" "}
                <button onClick={runTest}>Run /me</button>
            </p>

            <p>{status}</p>
        </main>
    );
}
