
"use client";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "problems", label: "Problems", icon: "code" },
  { id: "contests", label: "Contests", icon: "trophy", comingSoon: true },
  { id: "submissions", label: "Submissions", icon: "history", comingSoon: true },
];

function NavIcon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    code: <><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /><path d="m14 4-4 16" /></>,
    trophy: <><path d="M8 21h8m-4-4v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function Sidebar({
  activeSection,
  onNavigate,
  mobileOpen,
  onClose,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="ca-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside className={`ca-sidebar ${mobileOpen ? "ca-sidebar-open" : ""}`}>
        <a href="/" className="ca-brand" onClick={(event) => {
          event.preventDefault();
          onNavigate("overview");
        }}>
          <span className="ca-brand-symbol"><span /><span /></span>
          <span className="ca-brand-word">codearena<span>.</span></span>
        </a>

        <div className="ca-sidebar-label">WORKSPACE</div>

        <nav className="ca-sidebar-nav" aria-label="Workspace">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`ca-nav-item ${activeSection === item.id ? "ca-nav-active" : ""}`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              title={item.comingSoon ? "Coming soon" : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
              {item.comingSoon && <span className="ca-nav-soon">SOON</span>}
              {activeSection === item.id && <span className="ca-nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="ca-sidebar-bottom">
          <div className="ca-sidebar-note">
            <span className="ca-note-dot" />
            <div>
              <strong>Built for consistency.</strong>
              <p>One problem at a time.</p>
            </div>
          </div>
          <div className="ca-sidebar-version">CODEARENA <span>·</span> EARLY ACCESS</div>
        </div>
      </aside>
    </>
  );
}
