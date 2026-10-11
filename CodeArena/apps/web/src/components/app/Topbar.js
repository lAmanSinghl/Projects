
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCurrentUser, logout } from "../../lib/auth.js";
import { useTheme } from "../ThemeProvider";

function ThemeIcon({ theme }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
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

export default function Topbar({
  activeSection,
  onMenuClick,
  user,
  onUserChange,
}) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      onUserChange(null);
      setMenuOpen(false);
      window.location.assign("/login");
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
    user?.avatar_url || user?.picture || user?.photo_url || user?.image || "";

  const sectionLabels = {
    overview: "Overview",
    problems: "Problems",
    contests: "Contests",
    submissions: "Submissions",
    profile: "Profile",
  };

  return (
    <header className="ca-topbar">
      <div className="ca-topbar-left">
        <button
          type="button"
          className="ca-icon-button ca-mobile-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="ca-breadcrumb">
          <span>Workspace</span>
          <span className="ca-breadcrumb-slash">/</span>
          <strong>{sectionLabels[activeSection] || "Overview"}</strong>
        </div>
      </div>

      <div className="ca-topbar-right">
        <button
          type="button"
          className="ca-icon-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <ThemeIcon theme={theme} />
        </button>

        <span className="ca-topbar-divider" />

        {user ? (
          <div className="ca-account" ref={menuRef}>
            <button
              type="button"
              className={`ca-account-trigger ${menuOpen ? "ca-account-open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {avatar ? (
                <img src={avatar} alt="" className="ca-avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="ca-avatar ca-avatar-initial">{initial}</span>
              )}
              <span className="ca-account-name">{displayName}</span>
              <svg className="ca-chevron" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </button>

            {menuOpen && (
              <div className="ca-account-menu" role="menu">
                <div className="ca-account-summary">
                  {avatar ? (
                    <img src={avatar} alt="" className="ca-avatar ca-avatar-large" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="ca-avatar ca-avatar-initial ca-avatar-large">{initial}</span>
                  )}
                  <div className="ca-account-summary-text">
                    <strong>{displayName}</strong>
                    {user.email && <span>{user.email}</span>}
                  </div>
                </div>
                <div className="ca-menu-divider" />
                <button
                  type="button"
                  className="ca-menu-item"
                  role="menuitem"
                  onClick={() => {
                    onUserChange(user);
                    setMenuOpen(false);
                  }}
                >
                  <span>Account</span>
                  <span className="ca-menu-hint">Signed in</span>
                </button>
                <button
                  type="button"
                  className="ca-menu-item ca-menu-logout"
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
          <div className="ca-topbar-auth">
            <Link href="/login">Sign in</Link>
            <Link href="/register" className="ca-topbar-register">Create account</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export async function fetchSessionUser() {
  try {
    const result = await getCurrentUser();
    return result?.user || result || null;
  } catch {
    return null;
  }
}
