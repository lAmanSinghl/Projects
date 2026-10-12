
"use client";

import { useState,useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, verifyEmail } from "../../lib/auth.js";
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
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l-1.42 1.42m11.3-11.3 1.42-1.42" />
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

export default function RegisterPage() {
    const router = useRouter();


    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                let token = localStorage.getItem("accessToken");

                // First, check whether the existing access token is valid.
                if (token) {
                    const meResponse = await fetch(
                        "http://localhost:5000/api/auth/me",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            credentials: "include",
                        }
                    );

                    if (meResponse.ok) {
                        if (!cancelled) {
                            router.replace("/");
                            router.refresh();
                        }
                        return;
                    }
                }

                // The access token may be missing or expired.
                // Try restoring the session with the refresh-token cookie.
                const refreshResponse = await fetch(
                    "http://localhost:5000/api/auth/refresh",
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );

                if (!refreshResponse.ok) {
                    localStorage.removeItem("accessToken");
                    return;
                }

                const data = await refreshResponse.json();

                if (!data.accessToken) {
                    localStorage.removeItem("accessToken");
                    return;
                }

                localStorage.setItem("accessToken", data.accessToken);

                // Confirm the refreshed token before redirecting.
                const meResponse = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${data.accessToken}`,
                        },
                        credentials: "include",
                    }
                );

                if (meResponse.ok && !cancelled) {
                    router.replace("/");
                    router.refresh();
                } else if (!meResponse.ok) {
                    localStorage.removeItem("accessToken");
                }
            } catch (error) {
                // Keep the login page available if the backend is unreachable.
                console.error("Session check failed:", error);
            }
        }

        checkSession();

        return () => {
            cancelled = true;
        };
    }, [router]);

    const { theme, toggleTheme } = useTheme();

    const [step, setStep] = useState("register");

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleRegister(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        const cleanUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (cleanUsername.length < 3 || cleanUsername.length > 50) {
            setError("Your username must be between 3 and 50 characters.");
            return;
        }

        if (password.length < 8 || password.length > 100) {
            setError("Your password must be between 8 and 100 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await registerUser({
                username: cleanUsername,
                email: normalizedEmail,
                password,
            });

            setEmail(normalizedEmail);
            setStep("verify");
            setNotice("We've sent a verification code to your email.");
        } catch (err) {
            setError(
                err?.message ||
                "We couldn't start your registration. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleVerifyEmail(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (!/^\d{6}$/.test(otp)) {
            setError("Enter the six-digit verification code.");
            return;
        }

        setSubmitting(true);

        try {
            const result = await verifyEmail({
                email: email.trim().toLowerCase(),
                otp,
            });

            if (typeof result.accessToken !== "string") {
                throw new Error(
                    "Your account was verified, but no login token was returned."
                );
            }

            localStorage.setItem("accessToken", result.accessToken);

            router.replace("/");
            router.refresh();
        } catch (err) {
            setError(
                err?.message ||
                "Email verification failed. Check your code and try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handleEditEmail() {
        setStep("register");
        setOtp("");
        setError("");
        setNotice("");
    }

    function handleGoogleLogin() {
        const googleAuthUrl =
            process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL;

        if (!googleAuthUrl) {
            setError("Google sign-in is not configured yet.");
            return;
        }

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
                        codearena
                        <span className="auth-brand-period">.</span>
                    </span>
                </Link>

                <div className="auth-header-right">
                    <span className="auth-header-caption">
                        Already a member?
                    </span>

                    <Link href="/login" className="auth-header-link">
                        Sign in <span aria-hidden="true">↗</span>
                    </Link>

                    <button
                        type="button"
                        className="auth-theme-button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"
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
                        Start building.
                        <br />
                        <span>Become consistent.</span>
                    </h1>

                    <p className="auth-intro-description">
                        Every great problem solver starts somewhere.
                        Create your account, practice with purpose, and
                        make progress one submission at a time.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature">
                            <span className="auth-feature-number">01</span>
                            <span>
                                <strong>Your own coding identity</strong>
                                <small>
                                    Choose a username that represents you.
                                </small>
                            </span>
                        </div>

                        <div className="auth-feature">
                            <span className="auth-feature-number">02</span>
                            <span>
                                <strong>Verify and get started</strong>
                                <small>
                                    Confirm your email to activate your account.
                                </small>
                            </span>
                        </div>

                        <div className="auth-feature">
                            <span className="auth-feature-number">03</span>
                            <span>
                                <strong>Make every session count</strong>
                                <small>
                                    Build habits that make you a better problem solver.
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
                                {step === "register"
                                    ? "JOIN CODEARENA"
                                    : "ONE LAST STEP"}
                            </span>

                            <h2>
                                {step === "register"
                                    ? "Create your account"
                                    : "Verify your email"}
                            </h2>

                            <p>
                                {step === "register"
                                    ? "Your coding journey starts here."
                                    : "Enter the code we sent you to finish signing up."}
                            </p>
                        </div>

                        {step === "register" ? (
                            <form
                                className="auth-form"
                                onSubmit={handleRegister}
                            >
                                <div className="auth-field">
                                    <label htmlFor="username">
                                        Username
                                    </label>

                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(event.target.value)
                                        }
                                        minLength={3}
                                        maxLength={50}
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="email">
                                        Email address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        required
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <div className="auth-password-wrap">
                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            placeholder="At least 8 characters"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            minLength={8}
                                            maxLength={100}
                                            required
                                            disabled={submitting}
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

                                <div className="auth-field">
                                    <label htmlFor="confirmPassword">
                                        Confirm password
                                    </label>

                                    <div className="auth-password-wrap">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            placeholder="Enter your password again"
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            disabled={submitting}
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (visible) => !visible
                                                )
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirmation password"
                                                    : "Show confirmation password"
                                            }
                                            aria-pressed={showConfirmPassword}
                                        >
                                            <EyeIcon
                                                visible={showConfirmPassword}
                                            />
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
                                    disabled={submitting}
                                >
                                    <span>
                                        {submitting
                                            ? "Creating your account…"
                                            : "Create account"}
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
                        ) : (
                            <form
                                className="auth-form"
                                onSubmit={handleVerifyEmail}
                            >
                                <div className="auth-field">
                                    <label htmlFor="verification-email">
                                        Email address
                                    </label>

                                    <input
                                        id="verification-email"
                                        type="email"
                                        value={email}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="otp">
                                        Six-digit verification code
                                    </label>

                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(event) => {
                                            setOtp(
                                                event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6)
                                            );
                                            setError("");
                                        }}
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        required
                                        disabled={submitting}
                                        className="auth-otp-input"
                                    />

                                    <p className="auth-field-hint">
                                        Check your inbox and spam folder.
                                        The code expires after 10 minutes.
                                    </p>
                                </div>

                                {error && (
                                    <div className="auth-error" role="alert">
                                        <span aria-hidden="true">!</span>
                                        {error}
                                    </div>
                                )}

                                {notice && (
                                    <p
                                        className="auth-success"
                                        role="status"
                                    >
                                        {notice}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="auth-submit"
                                    disabled={
                                        submitting || otp.length !== 6
                                    }
                                >
                                    <span>
                                        {submitting
                                            ? "Verifying email…"
                                            : "Verify and continue"}
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

                                <button
                                    type="button"
                                    className="auth-back-button"
                                    onClick={handleEditEmail}
                                    disabled={submitting}
                                >
                                    ← Back to registration
                                </button>
                            </form>
                        )}

                        {step === "register" && (
                            <>


                                <div className="auth-or-divider">
                                    <span />
                                    <span>OR CONTINUE WITH</span>
                                    <span />
                                </div>

                                <button
                                    type="button"
                                    className="auth-google-button"
                                    onClick={handleGoogleLogin}
                                    disabled={submitting}
                                >
                                    <GoogleIcon />
                                    <span>Continue with Google</span>
                                </button>
                            </>
                        )}

                        <div className="auth-card-footer">
                            <span>
                                {step === "register"
                                    ? "Already have an account?"
                                    : "Already verified or want to sign in?"}
                            </span>
                            <Link href="/login">Sign in</Link>
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
