"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api.js";

const ACCENT = "#D5F278";

function GoogleIcon() {
    return (
        <svg
            viewBox="0 0 48 48"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
        >
            <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
            />
            <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"
            />
            <path
                fill="#FBBC05"
                d="M12.8 27.7a12 12 0 0 1 0-7.4v-5.2H5.9a20 20 0 0 0 0 17.8l6.9-5.2Z"
            />
            <path
                fill="#EA4335"
                d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.9 15.1l6.9 5.2c1.6-4.7 6-8.2 11.2-8.2Z"
            />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
                d="m5 12 4 4L19 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function GoogleRegisterPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const normalizedUsername = username.trim();
    const usernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(
        normalizedUsername
    );

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!usernameValid) {
            setError(
                "Use 3–30 characters: letters, numbers, and underscores only."
            );
            return;
        }

        setSubmitting(true);

        try {
            const response = await apiFetch("/api/auth/google/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: normalizedUsername,
                }),
                refreshOn401: false,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "We couldn't complete your registration."
                );
            }

            if (typeof data.accessToken !== "string") {
                throw new Error(
                    "Your account was created, but the login session was not returned. Please try signing in."
                );
            }

            // Match the existing CodeArena authentication setup.
            localStorage.setItem("accessToken", data.accessToken);

            // Let the existing app shell load the authenticated user.
            router.replace("/");
        } catch (err) {
            setError(
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="relative flex min-h-screen overflow-hidden bg-[#10110F] text-white">
            {/* Ambient background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                    backgroundSize: "52px 52px",
                    maskImage:
                        "linear-gradient(to bottom, black, transparent 90%)",
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full blur-3xl"
                style={{ background: "rgba(213,242,120,0.07)" }}
            />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-8 lg:px-12">
                {/* Brand */}
                <header className="flex h-20 items-center justify-between">
                    <a
                        href="/"
                        className="group inline-flex items-center gap-3"
                        aria-label="CodeArena home"
                    >
                        <span
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#10110F] transition-transform group-hover:rotate-3"
                            style={{ backgroundColor: ACCENT }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-6 w-6"
                                aria-hidden="true"
                            >
                                <path
                                    d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>

                        <span className="text-lg font-semibold tracking-tight">
                            Code<span style={{ color: ACCENT }}>Arena</span>
                        </span>
                    </a>

                    <a
                        href="/login"
                        className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                        Already a member?{" "}
                        <span className="font-medium text-white">
                            Sign in
                        </span>
                    </a>
                </header>

                {/* Main content */}
                <section className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1fr_460px] lg:gap-20 lg:py-16">
                    {/* Left introduction */}
                    <div className="mx-auto w-full max-w-xl lg:mx-0">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
                            style={{
                                borderColor: "rgba(213,242,120,0.22)",
                                backgroundColor: "rgba(213,242,120,0.06)",
                                color: ACCENT,
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D5F278]" />
                            YOUR NEXT CHAPTER STARTS HERE
                        </div>

                        <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
                            Make your mark.
                            <br />
                            <span style={{ color: ACCENT }}>
                                One problem
                                <br className="hidden sm:block" /> at a time.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-7 text-white/55 sm:text-lg">
                            Create your CodeArena identity and get ready
                            to sharpen your skills, solve challenges, and
                            track your progress.
                        </p>

                        <div className="mt-10 space-y-5">
                            {[
                                {
                                    title: "Your identity, your choice",
                                    description:
                                        "Pick a username that represents you.",
                                },
                                {
                                    title: "One place for your journey",
                                    description:
                                        "Keep your coding progress connected to your account.",
                                },
                                {
                                    title: "Get straight to solving",
                                    description:
                                        "Finish setup and head to your dashboard.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-4"
                                >
                                    <span
                                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "rgba(213,242,120,0.10)",
                                            color: ACCENT,
                                        }}
                                    >
                                        <CheckIcon />
                                    </span>

                                    <div>
                                        <p className="text-sm font-medium text-white/90">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-white/45">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 hidden border-t border-white/10 pt-6 sm:block">
                            <p className="text-xs tracking-wide text-white/30">
                                BUILD SKILLS. SOLVE PROBLEMS. LEVEL UP.
                            </p>
                        </div>
                    </div>

                    {/* Registration card */}
                    <div className="mx-auto w-full max-w-md">
                        <div className="rounded-3xl border border-white/10 bg-[#171815]/95 p-6 shadow-2xl shadow-black/30 sm:p-9">
                            <div className="mb-8">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                                    <GoogleIcon />
                                </div>

                                <p
                                    className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                    style={{ color: ACCENT }}
                                >
                                    Almost there
                                </p>

                                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Choose your username
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-white/50">
                                    Your Google account is connected.
                                    Choose the username people will see
                                    on CodeArena.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="mb-2 block text-sm font-medium text-white/80"
                                    >
                                        Username
                                    </label>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/35">
                                            @
                                        </span>

                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            required
                                            minLength={3}
                                            maxLength={30}
                                            value={username}
                                            onChange={(event) => {
                                                setUsername(
                                                    event.target.value
                                                );
                                                if (error) setError("");
                                            }}
                                            placeholder="your_username"
                                            aria-invalid={Boolean(error)}
                                            aria-describedby="username-hint username-error"
                                            className="h-12 w-full rounded-xl border border-white/10 bg-[#10110F] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#D5F278]/60 focus:ring-2 focus:ring-[#D5F278]/10"
                                        />
                                    </div>

                                    <p
                                        id="username-hint"
                                        className="mt-2 text-xs leading-5 text-white/40"
                                    >
                                        3–30 characters. Letters, numbers,
                                        and underscores.
                                    </p>

                                    <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
                                        <span className="text-xs text-white/45">
                                            Your profile name
                                        </span>
                                        <span className="max-w-[60%] truncate text-xs font-medium text-white/80">
                                            {normalizedUsername
                                                ? `@${normalizedUsername}`
                                                : "@your_username"}
                                        </span>
                                    </div>

                                    {error && (
                                        <p
                                            id="username-error"
                                            role="alert"
                                            className="mt-3 rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-sm leading-5 text-red-300"
                                        >
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !usernameValid}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#10110F] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#D5F278]/50 focus:ring-offset-2 focus:ring-offset-[#171815] disabled:cursor-not-allowed disabled:opacity-40"
                                    style={{ backgroundColor: ACCENT }}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#10110F]/30 border-t-[#10110F]" />
                                            Creating your account…
                                        </>
                                    ) : (
                                        <>
                                            Complete registration
                                            <ArrowIcon />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-xs text-white/30">
                                    SECURE SIGN-UP
                                </span>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            <div className="flex items-start gap-3 text-xs leading-5 text-white/40">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="4"
                                        y="10"
                                        width="16"
                                        height="11"
                                        rx="2"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                    />
                                    <path
                                        d="M8 10V7a4 4 0 1 1 8 0v3"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <p>
                                    Your Google sign-in is handled securely.
                                    Your password is not needed for this
                                    registration.
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 text-center text-xs leading-5 text-white/30">
                            By continuing, you agree to use CodeArena
                            responsibly and respectfully.
                        </p>
                    </div>
                </section>

                <footer className="flex min-h-14 items-center justify-between gap-4 border-t border-white/[0.07] text-xs text-white/30">
                    <span>© {new Date().getFullYear()} CodeArena</span>
                    <span>Built for people who love to solve.</span>
                </footer>
            </div>
        </main>
    );
}