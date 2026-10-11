
"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar, { fetchSessionUser } from "./Topbar";

export default function AppShell({ children, activeSection, onNavigate }) {
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    fetchSessionUser().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setSessionChecked(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ca-app">
      <Sidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="ca-app-main">
        <Topbar
          activeSection={activeSection}
          onMenuClick={() => setMobileOpen(true)}
          user={user}
          onUserChange={setUser}
        />

        <main className="ca-content">
          {!sessionChecked ? (
            <div className="ca-loading-page">
              <span className="ca-loading-mark" />
              <span>Loading your workspace</span>
            </div>
          ) : (
            children({ user, onNavigate })
          )}
        </main>
      </div>
    </div>
  );
}
