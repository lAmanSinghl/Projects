
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import AppShell from "../components/app/AppShell";

const PAGE_SIZE = 8;

function Icon({ name }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    code: <><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /><path d="m14 4-4 16" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function difficultyName(value) {
  const valueUpper = String(value || "").toUpperCase();
  if (valueUpper === "EASY") return "Easy";
  if (valueUpper === "MEDIUM") return "Medium";
  if (valueUpper === "HARD") return "Hard";
  return "Unknown";
}

function Overview({ user, onNavigate }) {
  const name = user?.username || user?.name || user?.email?.split("@")[0] || "there";
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await apiFetch("/api/problems/", {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load problems");

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.problems)
            ? data.problems
            : [];

        if (!controller.signal.aborted) setProblems(list);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Problem list could not be loaded:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const counts = useMemo(() => ({
    total: problems.length,
    easy: problems.filter((p) => String(p.difficulty).toUpperCase() === "EASY").length,
    medium: problems.filter((p) => String(p.difficulty).toUpperCase() === "MEDIUM").length,
    hard: problems.filter((p) => String(p.difficulty).toUpperCase() === "HARD").length,
  }), [problems]);

  const recentProblems = problems.slice(0, 5);

  return (
    <div className="ca-page-enter">
      <div className="ca-overview-heading">
        <div>
          <div className="ca-eyebrow"><span /> YOUR WORKSPACE</div>
          <h1>Good to have you back, {name}.</h1>
          <p>Make some progress today. One problem at a time.</p>
        </div>
        <button
          type="button"
          className="ca-primary-button"
          onClick={() => onNavigate("problems")}
        >
          Browse problems <Icon name="arrow" />
        </button>
      </div>

      <section className="ca-overview-stats" aria-label="Problem library overview">
        <article className="ca-stat-card ca-stat-total">
          <div className="ca-stat-top">
            <span>PROBLEM LIBRARY</span>
            <span className="ca-stat-icon"><Icon name="code" /></span>
          </div>
          <strong>{loading ? "—" : counts.total}</strong>
          <p>Total available problems</p>
        </article>
        <article className="ca-stat-card">
          <div className="ca-stat-top">
            <span>EASY</span>
            <span className="ca-stat-indicator ca-easy-bg" />
          </div>
          <strong>{loading ? "—" : counts.easy}</strong>
          <p>Ready to get started</p>
        </article>
        <article className="ca-stat-card">
          <div className="ca-stat-top">
            <span>MEDIUM</span>
            <span className="ca-stat-indicator ca-medium-bg" />
          </div>
          <strong>{loading ? "—" : counts.medium}</strong>
          <p>Build your approach</p>
        </article>
        <article className="ca-stat-card">
          <div className="ca-stat-top">
            <span>HARD</span>
            <span className="ca-stat-indicator ca-hard-bg" />
          </div>
          <strong>{loading ? "—" : counts.hard}</strong>
          <p>Challenge yourself</p>
        </article>
      </section>

      <section className="ca-overview-grid">
        <article className="ca-panel ca-recent-panel">
          <div className="ca-panel-heading">
            <div>
              <h2>Explore problems</h2>
              <p>Find your next challenge.</p>
            </div>
            <button
              type="button"
              className="ca-text-link"
              onClick={() => onNavigate("problems")}
            >
              View all <Icon name="arrow" />
            </button>
          </div>

          {loading ? (
            <div className="ca-list-message">Loading problem library…</div>
          ) : recentProblems.length ? (
            <div className="ca-recent-list">
              {recentProblems.map((problem) => (
                <Link
                  href={problem.slug ? `/problems/${encodeURIComponent(problem.slug)}` : "#"}
                  key={problem.id ?? problem.slug ?? problem.title}
                  className="ca-recent-row"
                  onClick={(event) => {
                    if (!problem.slug) event.preventDefault();
                  }}
                >
                  <span className="ca-recent-code"><Icon name="code" /></span>
                  <span className="ca-recent-title">
                    <strong>{problem.title}</strong>
                    <span>{problem.slug || "Coding challenge"}</span>
                  </span>
                  <span className={`ca-difficulty ca-difficulty-${difficultyName(problem.difficulty).toLowerCase()}`}>
                    <span />{difficultyName(problem.difficulty)}
                  </span>
                  <span className="ca-recent-arrow"><Icon name="chevron" /></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="ca-list-message">
              No problems are available yet.
            </div>
          )}
        </article>

        <aside className="ca-panel ca-start-panel">
          <div className="ca-start-kicker"><Icon name="target" /> YOUR NEXT STEP</div>
          <h2>Consistency beats intensity.</h2>
          <p>Choose a problem, work through the examples, and build your problem-solving habits.</p>
          <div className="ca-start-rule" />
          <div className="ca-start-detail">
            <span className="ca-start-detail-icon"><Icon name="check" /></span>
            <span>Read the problem carefully</span>
          </div>
          <div className="ca-start-detail">
            <span className="ca-start-detail-icon"><Icon name="code" /></span>
            <span>Think through an approach</span>
          </div>
          <button
            type="button"
            className="ca-start-button"
            onClick={() => onNavigate("problems")}
          >
            Find a problem <Icon name="arrow" />
          </button>
        </aside>
      </section>

      <div className="ca-bottom-note">
        <span>CODEARENA</span>
        <span className="ca-bottom-dot" />
        <span>Practice with purpose.</span>
      </div>
    </div>
  );
}

function Problems({ onNavigate }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [page, setPage] = useState(1);

  const loadProblems = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/problems/", { signal });
      if (!response.ok) throw new Error("Couldn't load problems.");

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.problems)
          ? data.problems
          : [];

      setProblems(list);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Something went wrong.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProblems(controller.signal);
    return () => controller.abort();
  }, [loadProblems]);

  useEffect(() => setPage(1), [search, difficulty]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return problems.filter((problem) => {
      const matchesSearch =
        !query ||
        String(problem.title || "").toLowerCase().includes(query) ||
        String(problem.slug || "").toLowerCase().includes(query) ||
        String(problem.description || "").toLowerCase().includes(query);

      const matchesDifficulty =
        difficulty === "ALL" ||
        String(problem.difficulty || "").toUpperCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [problems, search, difficulty]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="ca-page-enter">
      <div className="ca-overview-heading">
        <div>
          <div className="ca-eyebrow"><span /> PROBLEM LIBRARY</div>
          <h1>Problems</h1>
          <p>Choose a challenge and work your way through it.</p>
        </div>
        <button type="button" className="ca-secondary-button" onClick={() => onNavigate("overview")}>
          Back to overview
        </button>
      </div>

      <section className="ca-problem-panel">
        <div className="ca-problem-toolbar">
          <div className="ca-difficulty-tabs" aria-label="Filter by difficulty">
            {[
              ["ALL", "All"],
              ["EASY", "Easy"],
              ["MEDIUM", "Medium"],
              ["HARD", "Hard"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={difficulty === value ? "ca-filter-active" : ""}
                onClick={() => setDifficulty(value)}
              >
                {label}
                {value === "ALL" && <span>{problems.length}</span>}
              </button>
            ))}
          </div>
          <label className="ca-problem-search">
            <Icon name="search" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search problems"
              aria-label="Search problems"
            />
          </label>
        </div>

        <div className="ca-table-scroll">
          <table className="ca-problem-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Difficulty</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="ca-table-message">Loading problems…</td></tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="ca-table-message">
                    <p>{error}</p>
                    <button className="ca-inline-action" onClick={() => loadProblems()}>
                      Try again
                    </button>
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((problem, index) => (
                  <tr key={problem.id ?? problem.slug ?? problem.title}>
                    <td className="ca-row-number">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td>
                      <div className="ca-table-title">
                        <strong>{problem.title}</strong>
                        {problem.description && <span>{problem.description}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`ca-difficulty ca-difficulty-${difficultyName(problem.difficulty).toLowerCase()}`}>
                        <span />{difficultyName(problem.difficulty)}
                      </span>
                    </td>
                    <td>
                      {problem.slug ? (
                        <Link className="ca-solve-link" href={`/problems/${encodeURIComponent(problem.slug)}`}>
                          Solve <Icon name="arrow" />
                        </Link>
                      ) : <span className="ca-muted">Unavailable</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="ca-table-message">
                    No matching problems. Try changing your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filtered.length > 0 && (
          <footer className="ca-table-footer">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="ca-pagination">
              <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
              <span>{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}

function Placeholder({ section, onNavigate }) {
  const title = section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <div className="ca-page-enter">
      <div className="ca-eyebrow"><span /> WORKSPACE</div>
      <h1 className="ca-placeholder-title">{title}</h1>
      <section className="ca-panel ca-placeholder-panel">
        <span className="ca-placeholder-icon"><Icon name="clock" /></span>
        <h2>{title} is coming next.</h2>
        <p>This section isn't connected yet. The existing backend and routes will be checked before we implement it.</p>
        <button className="ca-primary-button" onClick={() => onNavigate("overview")}>
          Return to overview <Icon name="arrow" />
        </button>
      </section>
    </div>
  );
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <AppShell activeSection={activeSection} onNavigate={setActiveSection}>
      {({ user, onNavigate }) => {
        if (activeSection === "overview") {
          return <Overview user={user} onNavigate={onNavigate} />;
        }

        if (activeSection === "problems") {
          return <Problems onNavigate={onNavigate} />;
        }

        return <Placeholder section={activeSection} onNavigate={onNavigate} />;
      }}
    </AppShell>
  );
}
