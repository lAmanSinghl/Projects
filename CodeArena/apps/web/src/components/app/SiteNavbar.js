
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout } from "../../lib/auth.js";
import { useTheme } from "../ThemeProvider";

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

function BrandMark() {
  return (
    <Link href="/" className="ca-public-brand" aria-label="CodeArena home">
      <span className="ca-public-brand-mark">
        <span />
        <span />
      </span>
      <span className="ca-public-brand-name">codearena.</span>
    </Link>
  );
}

export default function SiteNavbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const result = await getCurrentUser();

        if (!cancelled) {
          setUser(result?.user || result || null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      setMenuOpen(false);
      router.push("/login");
      router.refresh();
    }
  }

  const displayName =
    user?.username ||
    user?.display_name ||
    user?.name ||
    user?.email ||
    "Your account";

  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  const avatar =
    user?.avatar_url ||
    user?.picture ||
    user?.photo_url ||
    user?.image ||
    "";

  return (
    <header className="ca-public-nav">
      <div className="ca-public-nav-inner">
        <BrandMark />

        <div className="ca-public-nav-right">
          <button
            type="button"
            className="ca-public-icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <ThemeIcon theme={theme} />
          </button>

          <span className="ca-public-divider" />

          {!sessionChecked ? (
            <div className="ca-public-session-placeholder" />
          ) : user ? (
            <div className="ca-public-account" ref={menuRef}>
              <button
                type="button"
                className={`ca-public-account-trigger ${
                  menuOpen ? "is-open" : ""
                }`}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="ca-public-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="ca-public-avatar ca-public-avatar-initial">
                    {initial}
                  </span>
                )}

                <span className="ca-public-account-name">
                  {displayName}
                </span>

                <svg
                  className="ca-public-chevron"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>

              {menuOpen && (
                <div className="ca-public-account-menu" role="menu">
                  <div className="ca-public-account-summary">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatar}
                        alt=""
                        className="ca-public-avatar ca-public-avatar-large"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="ca-public-avatar ca-public-avatar-initial ca-public-avatar-large">
                        {initial}
                      </span>
                    )}

                    <div className="ca-public-summary-text">
                      <strong>{displayName}</strong>
                      {user.email && <span>{user.email}</span>}
                    </div>
                  </div>

                  <div className="ca-public-menu-divider" />

                  <Link
                    href={`/${encodeURIComponent(user.username || displayName)}`}
                    className="ca-public-menu-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    View profile
                  </Link>

                  <button
                    type="button"
                    className="ca-public-menu-item ca-public-logout"
                    role="menuitem"
                    disabled={loggingOut}
                    onClick={handleLogout}
                  >
                    {loggingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ca-public-auth-links">
              <Link href="/login" className="ca-public-signin">
                Sign in
              </Link>
              <Link href="/register" className="ca-public-register">
                Create account <span aria-hidden="true">↗</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
