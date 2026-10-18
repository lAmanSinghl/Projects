
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../workspaceUtils";
import { apiFetch } from "../../../../lib/api";
import styles from "./ProblemSubmissionsPanel.module.css";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function verdictInfo(submission) {
  const verdict = String(
    submission?.verdict || submission?.status || "PENDING"
  ).toUpperCase();

  if (verdict === "ACCEPTED") {
    return {
      label: "Accepted",
      className: styles.accepted,
    };
  }

  if (["PENDING", "PROCESSING", "QUEUED"].includes(verdict)) {
    return {
      label: verdict.charAt(0) + verdict.slice(1).toLowerCase(),
      className: styles.pending,
    };
  }

  return {
    label: verdict.replaceAll("_", " "),
    className: styles.otherVerdict,
  };
}

export default function ProblemSubmissionsPanel({
  problemId,
  refreshKey = 0,
}) {
  const params = useParams();
  const routeSlug = params?.slug;
  const slug = Array.isArray(routeSlug) ? routeSlug[0] : routeSlug;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(
    async (signal) => {
      if (problemId == null) return;

      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(
          `${API_URL}/submissions/problem/${encodeURIComponent(problemId)}`,
          { signal }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              (response.status === 401
                ? "Sign in to view your submissions."
                : "Unable to load submissions for this problem.")
          );
        }

        if (!signal?.aborted) {
          setSubmissions(
            Array.isArray(data.submissions) ? data.submissions : []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError" && !signal?.aborted) {
          setError(err.message || "Unable to load submissions.");
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [problemId]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadSubmissions(controller.signal);

    return () => controller.abort();
  }, [loadSubmissions, refreshKey]);

  return (
    <section
      className={styles.panel}
      aria-labelledby="problem-submissions-title"
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>YOUR ACTIVITY</p>
          <h2 id="problem-submissions-title">Submissions</h2>
          <p className={styles.subtitle}>
            Your previous attempts for this problem.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => loadSubmissions()}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadSubmissions()}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.state} aria-live="polite">
          <span className={styles.spinner} />
          <span>Loading your submissions…</span>
        </div>
      ) : error ? null : submissions.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            ↗
          </span>
          <h3>No submissions yet</h3>
          <p>
            Your attempts for this problem will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.listHeading}>
            <span>
              {submissions.length} attempt
              {submissions.length === 1 ? "" : "s"}
            </span>
            <span>Newest first</span>
          </div>

          <div className={styles.list}>
            {submissions.map((item, index) => {
              const id = String(item.id);
              const verdict = verdictInfo(item);

              const submissionUrl = slug
                ? `/problems/${encodeURIComponent(slug)}/submission/${encodeURIComponent(id)}`
                : null;

              const content = (
                <>
                  <div
                    className={styles.attemptNumber}
                    aria-hidden="true"
                  >
                    {submissions.length - index}
                  </div>

                  <div className={styles.attemptContent}>
                    <div className={styles.attemptTitleRow}>
                      <strong>Submission #{item.id}</strong>

                      <span
                        className={`${styles.verdict} ${verdict.className}`}
                      >
                        {verdict.label}
                      </span>
                    </div>

                    <div className={styles.metadata}>
                      <span>{item.language || "Unknown language"}</span>

                      <span>
                        {item.execution_time_ms == null
                          ? "Runtime —"
                          : `${item.execution_time_ms} ms`}
                      </span>

                      <time dateTime={item.created_at || undefined}>
                        {formatDate(item.created_at)}
                      </time>
                    </div>

                    <span className={styles.detailsButton}>
                      View submission ↗
                    </span>
                  </div>
                </>
              );

              return submissionUrl ? (
                <Link
                  key={id}
                  href={submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.attempt}
                  aria-label={`Open submission ${id} in a new tab`}
                >
                  <div className={styles.attemptMain}>
                    {content}
                  </div>
                </Link>
              ) : (
                <article className={styles.attempt} key={id}>
                  <div className={styles.attemptMain}>
                    {content}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
