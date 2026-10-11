
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../../lib/auth.js";
import { useTheme } from "../../components/ThemeProvider";

function BrandMark() {
    return (
        <span className="auth-brand-mark" aria-hidden="true">
            <span />
            <span />
        </span>
    );
}

function ThemeIcon({ theme }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {theme === "dark" ? (
                <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </>
            ) : (
                <path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z" />
            )}
        </svg>
    );
}

function EyeIcon({ visible }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {visible ? (
                <>
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                </>
            ) : (
                <>
                    <path d="m3 3 18 18" />
                    <path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.6 15.6 0 0 1-3.1 3.8" />
                    <path d="M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
                </>
            )}
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
            <path
                fill="#EA4335"
                d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.5 17.7 9.5 24 9.5Z"
            />
            <path
                fill="#4285F4"
                d="M46.1 24.5c0-1.6-.2-3.2-.5-4.7H24v9h12.4c-.6 3-2.3 5.5-4.8 7.2l7.7 6C43.8 37.8 46.1 31.6 46.1 24.5Z"
            />
            <path
                fill="#FBBC05"
                d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.8l7.8-6.1Z"
            />
            <path
                fill="#34A853"
                d="M24 48c6.3 0 11.6-2.1 15.4-6l-7.7-6c-2.1 1.4-4.7 2.2-7.7 2.2-6.3 0-11.7-4-13.6-9.5l-7.8 6.1C6.5 42.6 14.6 48 24 48Z"
            />
        </svg>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Reset the Google button when this page is restored with Back/Forward.
    useEffect(() => {
        function handlePageShow() {
            setGoogleLoading(false);
        }

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!identifier.trim() || !password) {
            setError("Enter your email or username and password.");
            return;
        }

        setSubmitting(true);

        try {
            await login({
                identifier: identifier.trim(),
                password,
            });

            router.replace("/");
            router.refresh();
        } catch (err) {
            setError(
                err?.message ||
                    "Unable to sign in. Please check your credentials and try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handleGoogleLogin() {
        setError("");

        const googleAuthUrl =
            process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL;

        if (!googleAuthUrl) {
            setError(
                "Google sign-in isn't configured yet. Connect the Google OAuth endpoint to enable it."
            );
            return;
        }

        setGoogleLoading(true);
        window.location.assign(googleAuthUrl);
    }

    return (
        <main className="auth-page">
            <div className="auth-background-grid" aria-hidden="true" />

            <header className="auth-header">
                <Link
                    href="/"
                    className="auth-brand"
                    aria-label="CodeArena home"
                >
                    <BrandMark />
                    <span>
                        codearena<span className="auth-brand-period">.</span>
                    </span>
                </Link>

                <div className="auth-header-right">
                    <span className="auth-header-caption">
                        New to CodeArena?
                    </span>

                    <Link href="/register" className="auth-header-link">
                        Create account <span aria-hidden="true">↗</span>
                    </Link>

                    <button
                        type="button"
                        className="auth-theme-button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${
                            theme === "dark" ? "light" : "dark"
                        } theme`}
                        title="Change theme"
                    >
                        <ThemeIcon theme={theme} />
                    </button>
                </div>
            </header>

            <section className="auth-main">
                <div className="auth-intro">
                    <div className="auth-eyebrow">
                        <span className="auth-eyebrow-dot" />
                        YOUR NEXT CHALLENGE STARTS HERE
                    </div>

                    <h1>
                        Think clearly.
                        <br />
                        <span>Code confidently.</span>
                    </h1>

                    <p className="auth-intro-description">
                        A space to sharpen your problem-solving skills,
                        build consistency, and get better with every
                        submission.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature">
                            <span className="auth-feature-number">01</span>
                            <span>
                                <strong>Practice with purpose</strong>
                                <small>
                                    Challenges that put your thinking first.
                                </small>
                            </span>
                        </div>

                        <div className="auth-feature">
                            <span className="auth-feature-number">02</span>
                            <span>
                                <strong>Build real consistency</strong>
                                <small>
                                    Small steps. Better problem-solving habits.
                                </small>
                            </span>
                        </div>

                        <div className="auth-feature">
                            <span className="auth-feature-number">03</span>
                            <span>
                                <strong>Focus on the solution</strong>
                                <small>
                                    Spend your energy where it matters.
                                </small>
                            </span>
                        </div>
                    </div>

                    <div className="auth-decoration" aria-hidden="true">
                        <span className="auth-decoration-line" />
                        <span>01001</span>
                        <span>10110</span>
                        <span>00101</span>
                        <span className="auth-decoration-line" />
                    </div>
                </div>

                <div className="auth-form-column">
                    <div className="auth-card">
                        <div className="auth-card-heading">
                            <div className="auth-card-icon">
                                <BrandMark />
                            </div>

                            <span className="auth-card-label">
                                WELCOME BACK
                            </span>

                            <h2>Sign in to your account</h2>
                            <p>Pick up where you left off.</p>
                        </div>

                        <form
                            className="auth-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="auth-field">
                                <label htmlFor="identifier">
                                    Email or username
                                </label>

                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="you@example.com"
                                    value={identifier}
                                    onChange={(event) =>
                                        setIdentifier(event.target.value)
                                    }
                                    required
                                    disabled={
                                        submitting || googleLoading
                                    }
                                />
                            </div>

                            <div className="auth-field">
                                <div className="auth-label-row">
                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="auth-forgot-link"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="auth-password-wrap">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        required
                                        disabled={
                                            submitting || googleLoading
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (visible) => !visible
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={showPassword}
                                    >
                                        <EyeIcon visible={showPassword} />
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error" role="alert">
                                    <span aria-hidden="true">!</span>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={submitting || googleLoading}
                            >
                                <span>
                                    {submitting
                                        ? "Signing you in…"
                                        : "Sign in"}
                                </span>

                                {!submitting && (
                                    <span className="auth-submit-arrow">
                                        ↗
                                    </span>
                                )}

                                {submitting && (
                                    <span className="auth-spinner" />
                                )}
                            </button>
                        </form>

                        <div className="auth-or-divider">
                            <span />
                            <span>OR CONTINUE WITH</span>
                            <span />
                        </div>

                        <button
                            type="button"
                            className="auth-google-button"
                            onClick={handleGoogleLogin}
                            disabled={submitting || googleLoading}
                        >
                            <GoogleIcon />

                            <span>
                                {googleLoading
                                    ? "Redirecting to Google…"
                                    : "Continue with Google"}
                            </span>

                            {googleLoading && (
                                <span className="auth-spinner auth-google-spinner" />
                            )}
                        </button>

                        <div className="auth-card-footer">
                            <span>Don't have an account?</span>
                            <Link href="/register">Create one</Link>
                        </div>
                    </div>

                    <p className="auth-security-note">
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect
                                x="4"
                                y="8"
                                width="12"
                                height="9"
                                rx="2"
                            />
                            <path d="M7 8V5a3 3 0 0 1 6 0v3" />
                        </svg>

                        Your account. Your progress. Your space.
                    </p>
                </div>
            </section>

            <footer className="auth-footer">
                <span>© {new Date().getFullYear()} CodeArena</span>

                <span className="auth-footer-status">
                    <span /> BUILT FOR CONSISTENCY
                </span>
            </footer>
        </main>
    );
}
