"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api.js";

const filters = ["ALL", "EASY", "MEDIUM", "HARD"];

export default function Home() {
  const [problems, setProblems] = useState([]);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProblems() {
      try {
        const response = await apiFetch("/api/problems/");
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.error || data.message || "Could not load problems.");
        if (active) setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Could not connect to CodeArena.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProblems();
    return () => { active = false; };
  }, []);

  const filteredProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesDifficulty = difficulty === "ALL" || problem.difficulty === difficulty;
      const matchesQuery = !normalized || `${problem.title} ${problem.slug} ${problem.description || ""}`.toLowerCase().includes(normalized);
      return matchesDifficulty && matchesQuery;
    });
  }, [problems, query, difficulty]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="CodeArena home">
          <span className="brand-mark">C<span>A</span></span>
          <span>codearena<span className="brand-dot">.</span></span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#problems">Problems</a>
          <a className="nav-link" href="#about">Practice</a>
        </nav>
        <div className="top-actions">
          <span className="status-indicator"><span /> Judge online</span>
          <Link className="login-link" href="/login">Log in <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT LEVEL STARTS HERE</div>
          <h1>Think clearly.<br /><span>Code boldly.</span></h1>
          <p>A focused space to sharpen your problem-solving skills, one submission at a time.</p>
          <a className="hero-cta" href="#problems">Explore problems <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-code">
            <div className="code-window-top"><span /><span /><span /><b>solution.js</b></div>
            <div className="code-lines">
              <span><i>01</i><em>const</em> <strong>solve</strong> = (input) =&gt; {"{"}</span>
              <span><i>02</i>  <em>return</em> input.<strong>map</strong>(x =&gt; x * 2);</span>
              <span><i>03</i>{"}"}</span>
              <span><i>04</i></span>
              <span><i>05</i><small>// keep going.</small></span>
            </div>
          </div>
          <div className="hero-badge"><span>✳</span> BUILD YOUR EDGE</div>
          <div className="hero-index">01 <span>/</span> 07</div>
        </div>
      </section>

      <section className="problems-section" id="problems">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> THE PRACTICE ARENA</div>
            <h2>Choose your <span>challenge.</span></h2>
            <p>Build consistency. Learn patterns. Make every attempt count.</p>
          </div>
          <div className="problem-count"><strong>{problems.length.toString().padStart(2, "0")}</strong><span>PROBLEMS<br />AVAILABLE</span></div>
        </div>

        <div className="problem-toolbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title or keyword..." aria-label="Search problems" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="filter-group" aria-label="Filter by difficulty">
            {filters.map((item) => <button key={item} className={difficulty === item ? "filter-button selected" : "filter-button"} onClick={() => setDifficulty(item)}>{item === "ALL" ? "All levels" : item[0] + item.slice(1).toLowerCase()}</button>)}
          </div>
        </div>

        {loading && <div className="state-panel"><span className="loading-spinner" /> Loading the arena...</div>}
        {!loading && error && <div className="state-panel error-panel"><strong>Couldn’t load the problem set.</strong><p>{error}</p><button className="secondary-button" onClick={() => window.location.reload()}>Try again</button></div>}
        {!loading && !error && filteredProblems.length === 0 && <div className="state-panel"><strong>No matching problems.</strong><p>Try another search or difficulty filter.</p></div>}
        {!loading && !error && filteredProblems.length > 0 && (
          <div className="problem-list">
            <div className="problem-list-head"><span>PROBLEM</span><span>DIFFICULTY</span><span>OPEN</span></div>
            {filteredProblems.map((problem, index) => (
              <Link className="problem-row" href={`/problems/${encodeURIComponent(problem.slug)}`} key={problem.id ?? problem.slug}>
                <span className="problem-main"><span className="problem-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{problem.title}</strong><small>{problem.slug}</small></span></span>
                <span><span className={`difficulty difficulty-${String(problem.difficulty || "easy").toLowerCase()}`}>{problem.difficulty || "Unrated"}</span></span>
                <span className="problem-open" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer" id="about"><span>© {new Date().getFullYear()} CodeArena</span><span>MADE FOR THE PROCESS, NOT JUST THE RESULT <b>✳</b></span><span>KEEP BUILDING <b>↗</b></span></footer>
    </main>
  );
}
