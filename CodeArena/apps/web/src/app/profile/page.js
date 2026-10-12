"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { apiFetch } from "../../lib/api";

const EMPTY_STATS = {
  totalSubmissions: 0,
  acceptedSubmissions: 0,
  solvedProblems: 0,
  acceptanceRate: 0,
};

async function readJson(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, value, icon }) {
  return (
    <div className="profile-stat-card">
      <div className="profile-stat-top">
        <span>{label}</span>
        <span aria-hidden="true">{icon}</span>
      </div>
      <div className="profile-stat-value">{value}</div>
    </div>
  );
}

function ProfileContent({ user }) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, submissionsResponse] = await Promise.all([
        apiFetch("/api/submissions/stats"),
        apiFetch(`/api/submissions/?page=${page}&limit=10`),
      ]);

      const [statsData, submissionsData] = await Promise.all([
        readJson(statsResponse),
        readJson(submissionsResponse),
      ]);

      setStats(statsData);
      setSubmissions(submissionsData.submissions ?? []);
      setPagination(submissionsData.pagination ?? {
        page,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      setError(err.message || "Could not load your profile data.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const username = user?.username || "CodeArena user";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <p className="profile-eyebrow">YOUR ACCOUNT</p>
          <h1>My Profile</h1>
          <p className="profile-subtitle">
            Your coding activity and submission history.
          </p>
        </div>
      </div>

      <section className="profile-identity">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-identity-details">
          <h2>{username}</h2>
          <p>{user?.email || "No email available"}</p>
          <div className="profile-meta">
            <span>{user?.role || "User"}</span>
            <span>
              Joined {formatDate(user?.created_at)}
            </span>
          </div>
        </div>
      </section>

      <section className="profile-stats-grid">
        <StatCard
          label="Problems solved"
          value={stats.solvedProblems}
          icon="✓"
        />
        <StatCard
          label="Total submissions"
          value={stats.totalSubmissions}
          icon="↗"
        />
        <StatCard
          label="Accepted submissions"
          value={stats.acceptedSubmissions}
          icon="◎"
        />
        <StatCard
          label="Acceptance rate"
          value={`${stats.acceptanceRate}%`}
          icon="%"
        />
      </section>

      <section className="profile-history">
        <div className="profile-history-heading">
          <div>
            <h2>Submission history</h2>
            <p>Your latest attempts and their results.</p>
          </div>

          <span className="profile-total">
            {pagination.total} submissions
          </span>
        </div>

        {error && (
          <div className="profile-error" role="alert">
            {error}
            <button onClick={loadProfileData}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="profile-empty">Loading your activity…</div>
        ) : !error && submissions.length === 0 ? (
          <div className="profile-empty">
            <div className="profile-empty-icon">⌘</div>
            <h3>No submissions yet</h3>
            <p>
              Your attempts will appear here when you start solving problems.
            </p>
          </div>
        ) : (
          !error && (
            <>
              <div className="profile-table-wrap">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Language</th>
                      <th>Verdict</th>
                      <th>Runtime</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>

                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          {submission.problem_title ||
                            `Problem #${submission.problem_id}`}
                        </td>
                        <td>{submission.language || "—"}</td>
                        <td>
                          <span
                            className={`profile-verdict ${
                              submission.verdict === "ACCEPTED"
                                ? "is-accepted"
                                : "is-other"
                            }`}
                          >
                            {submission.verdict ||
                              submission.status ||
                              "Pending"}
                          </span>
                        </td>
                        <td>
                          {submission.execution_time_ms == null
                            ? "—"
                            : `${submission.execution_time_ms} ms`}
                        </td>
                        <td>{formatDate(submission.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="profile-pagination">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <div>
                  <button
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>
                  <button
                    disabled={
                      page >= pagination.totalPages || loading
                    }
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell activeSection="profile">
      {({ user }) => <ProfileContent user={user} />}
    </AppShell>
  );
}