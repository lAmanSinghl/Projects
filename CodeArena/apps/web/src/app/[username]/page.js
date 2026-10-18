
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SiteNavbar from "../../components/app/SiteNavbar";
import styles from "./page.module.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const SUBMISSIONS_PAGE_SIZE = 10;

function ProfileIcon({ type }) {
  const paths = {
    submissions: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    accepted: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    solved: (
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    ),
    rate: (
      <>
        <path d="M4 17 9 12l3 3 8-8" />
        <path d="M14 7h6v6" />
      </>
    ),
  };

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
      {paths[type]}
    </svg>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getSubmissionRows(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.submissions ??
      payload?.data?.submissions ??
      (Array.isArray(payload?.data) ? payload.data : []);

  return Array.isArray(rows) ? rows : [];
}

// Returns true/false when the API exposes pagination metadata,
// or null when we need to check the following page.
function getHasNextPage(payload, page, rowCount) {
  const pagination =
    payload?.pagination ??
    payload?.meta?.pagination ??
    payload?.pageInfo ??
    payload?.page_info ??
    payload?.meta ??
    {};

  const explicitValue =
    pagination.hasNextPage ??
    pagination.has_next_page ??
    pagination.hasMore ??
    pagination.has_more ??
    payload?.hasNextPage ??
    payload?.has_next_page ??
    payload?.hasMore ??
    payload?.has_more;

  if (typeof explicitValue === "boolean") {
    return explicitValue;
  }

  const totalPages =
    pagination.totalPages ??
    pagination.total_pages ??
    payload?.totalPages ??
    payload?.total_pages;

  if (
    Number.isFinite(Number(totalPages)) &&
    totalPages !== null &&
    totalPages !== ""
  ) {
    return page < Number(totalPages);
  }

  const totalItems =
    pagination.totalItems ??
    pagination.total_items ??
    pagination.total ??
    payload?.totalItems ??
    payload?.total_items ??
    payload?.total;

  if (
    Number.isFinite(Number(totalItems)) &&
    totalItems !== null &&
    totalItems !== ""
  ) {
    return page * SUBMISSIONS_PAGE_SIZE < Number(totalItems);
  }

  const nextPage =
    pagination.nextPage ??
    pagination.next_page ??
    payload?.nextPage ??
    payload?.next_page;

  if (nextPage !== undefined) {
    return (
      nextPage !== null &&
      nextPage !== false &&
      Number(nextPage) > page
    );
  }

  if (rowCount < SUBMISSIONS_PAGE_SIZE) {
    return false;
  }

  return null;
}

async function fetchSubmissionPage(username, page, signal) {
  const encodedUsername = encodeURIComponent(username);

  const response = await fetch(
    `${API_URL}/submissions?username=${encodedUsername}&page=${page}&limit=${SUBMISSIONS_PAGE_SIZE}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Could not load submission history.");
  }

  const payload = await response.json();
  const allRows = getSubmissionRows(payload);
  const rows = allRows.slice(0, SUBMISSIONS_PAGE_SIZE);

  let hasNextPage = getHasNextPage(
    payload,
    page,
    allRows.length
  );

  // If the API does not provide pagination metadata, check the
  // next page so we only show Next 10 when it has submissions.
  if (hasNextPage === null) {
    try {
      const nextResponse = await fetch(
        `${API_URL}/submissions?username=${encodedUsername}&page=${page + 1}&limit=${SUBMISSIONS_PAGE_SIZE}`,
        { signal }
      );

      if (nextResponse.ok) {
        const nextPayload = await nextResponse.json();

        hasNextPage =
          getSubmissionRows(nextPayload).length > 0;
      } else {
        hasNextPage =
          allRows.length >= SUBMISSIONS_PAGE_SIZE;
      }
    } catch (err) {
      if (err?.name === "AbortError") throw err;

      hasNextPage =
        allRows.length >= SUBMISSIONS_PAGE_SIZE;
    }
  }

  return {
    rows,
    hasNextPage: Boolean(hasNextPage),
  };
}

export default function PublicProfilePage() {
  const params = useParams();

  const routeUsername = params?.username;

  const username = Array.isArray(routeUsername)
    ? routeUsername[0]
    : routeUsername;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [submissionPage, setSubmissionPage] = useState(1);
  const [hasNextSubmissionPage, setHasNextSubmissionPage] =
    useState(false);
  const [submissionsLoading, setSubmissionsLoading] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [submissionsError, setSubmissionsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    if (!username) {
      setError("The username is missing from this profile URL.");
      setLoading(false);

      return () => controller.abort();
    }

    async function loadProfile() {
      setLoading(true);
      setError("");
      setStatsError("");
      setSubmissionsError("");

      setProfile(null);
      setStats(null);
      setSubmissions([]);

      setSubmissionPage(1);
      setHasNextSubmissionPage(false);
      setSubmissionsLoading(false);

      const encodedUsername = encodeURIComponent(username);
      const requestOptions = { signal: controller.signal };

      try {
        // The profile is the primary resource. A failure to fetch
        // stats or submissions should not hide the entire profile.
        const profileResponse = await fetch(
          `${API_URL}/auth/public/${encodedUsername}`,
          requestOptions
        );

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            throw new Error("User not found.");
          }

          throw new Error("Unable to load this profile.");
        }

        const profileData = await profileResponse.json();

        const profileUser =
          profileData?.user ??
          profileData?.profile ??
          profileData;

        if (
          !profileUser ||
          typeof profileUser !== "object" ||
          !profileUser.username
        ) {
          throw new Error(
            "The server returned an invalid profile response."
          );
        }

        if (controller.signal.aborted) return;

        setProfile(profileUser);

        const [statsResult, submissionsResult] =
          await Promise.allSettled([
            (async () => {
              const response = await fetch(
                `${API_URL}/submissions/stats?username=${encodedUsername}`,
                requestOptions
              );

              if (!response.ok) {
                throw new Error(
                  "Could not load profile statistics."
                );
              }

              return response.json();
            })(),

            fetchSubmissionPage(
              username,
              1,
              requestOptions.signal
            ),
          ]);

        if (controller.signal.aborted) return;

        if (statsResult.status === "fulfilled") {
          const payload = statsResult.value;

          setStats(
            payload?.stats ??
              payload?.data?.stats ??
              payload?.data ??
              payload
          );
        } else if (
          statsResult.reason?.name === "AbortError"
        ) {
          return;
        } else {
          setStatsError(
            statsResult.reason?.message ||
              "Could not load profile statistics."
          );
        }

        if (submissionsResult.status === "fulfilled") {
          setSubmissions(submissionsResult.value.rows);
          setSubmissionPage(1);
          setHasNextSubmissionPage(
            submissionsResult.value.hasNextPage
          );
        } else if (
          submissionsResult.reason?.name === "AbortError"
        ) {
          return;
        } else {
          setSubmissionsError(
            submissionsResult.reason?.message ||
              "Could not load submission history."
          );
        }
      } catch (err) {
        if (err?.name === "AbortError") return;

        setError(
          err?.message || "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => controller.abort();
  }, [username]);

  async function changeSubmissionPage(nextPage) {
    if (
      !username ||
      submissionsLoading ||
      nextPage < 1 ||
      nextPage === submissionPage
    ) {
      return;
    }

    const controller = new AbortController();

    setSubmissionsLoading(true);
    setSubmissionsError("");

    try {
      const result = await fetchSubmissionPage(
        username,
        nextPage,
        controller.signal
      );

      setSubmissions(result.rows);
      setSubmissionPage(nextPage);
      setHasNextSubmissionPage(result.hasNextPage);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setSubmissionsError(
          err?.message || "Could not load submission history."
        );
      }
    } finally {
      setSubmissionsLoading(false);
    }
  }

  const displayName =
    profile?.display_name ||
    profile?.username ||
    username;

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  const totalCount = stats
    ? Number(stats.totalSubmissions ?? 0)
    : null;

  const acceptedCount = stats
    ? Number(stats.acceptedSubmissions ?? 0)
    : null;

  const solvedCount = stats
    ? Number(stats.solvedProblems ?? 0)
    : null;

  const acceptanceRate = stats
    ? Number(stats.acceptanceRate)
    : NaN;

  const hasAcceptanceRate =
    Number.isFinite(acceptanceRate);

  const safeAcceptanceRate = hasAcceptanceRate
    ? Math.min(100, Math.max(0, acceptanceRate))
    : 0;

  return (
    <div className={styles.site}>
      <SiteNavbar />

      <main className={styles.page}>
        {loading ? (
          <section
            className={styles.loadingState}
            aria-live="polite"
          >
            <span className={styles.loadingMark} />
            <p>Loading profile...</p>
          </section>
        ) : error || !profile ? (
          <section className={styles.messageCard}>
            <p className={styles.eyebrow}>
              PROFILE UNAVAILABLE
            </p>

            <h1>Profile not found</h1>

            <p className={styles.messageText}>
              {error || "This user could not be found."}
            </p>
          </section>
        ) : (
          <>
            {/* Profile header */}
            <section className={styles.hero}>
              <div
                className={styles.heroGlow}
                aria-hidden="true"
              />

              <div className={styles.heroTop}>
                <span className={styles.profileLabel}>
                  <span className={styles.statusDot} />
                  PUBLIC PROFILE
                </span>
              </div>

              <div className={styles.identity}>
                <div className={styles.avatar}>
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.username}'s avatar`}
                    />
                  ) : (
                    <span>
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className={styles.userInfo}>
                  <p className={styles.eyebrow}>
                    CODER PROFILE
                  </p>

                  <h1>{displayName}</h1>

                  <p className={styles.username}>
                    @{profile.username}
                  </p>

                  <p
                    className={
                      profile.bio
                        ? styles.bio
                        : styles.bioMuted
                    }
                  >
                    {profile.bio ||
                      "Building skills, one submission at a time."}
                  </p>

                  <div className={styles.meta}>
                    {joinedDate && (
                      <span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="16"
                            rx="2"
                          />
                          <path d="M16 3v4M8 3v4M3 10h18" />
                        </svg>

                        Joined {joinedDate}
                      </span>
                    )}

                    <span>
                      <span className={styles.metaDot} />
                      Profile is public
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.heroFooter}>
                <span>PROGRESS OVER PERFECTION.</span>

                <span className={styles.heroUsername}>
                  @{profile.username}
                </span>
              </div>
            </section>

            {/* Statistics */}
            <section className={styles.statsSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>
                    PERFORMANCE OVERVIEW
                  </p>

                  <h2>Problem-solving activity</h2>

                  <p className={styles.sectionDescription}>
                    A snapshot of this member&apos;s submission
                    history.
                  </p>
                </div>

                <span className={styles.sectionTag}>
                  ALL TIME
                </span>
              </div>

              <div className={styles.statsGrid}>
                <article
                  className={`${styles.statCard} ${styles.statPrimary}`}
                >
                  <div className={styles.statTop}>
                    <span className={styles.statIcon}>
                      <ProfileIcon type="submissions" />
                    </span>

                    <span className={styles.statIndex}>01</span>
                  </div>

                  <p>Total submissions</p>

                  <strong>
                    {totalCount === null
                      ? "—"
                      : totalCount.toLocaleString("en-IN")}
                  </strong>

                  <span className={styles.statFoot}>
                    Attempts submitted
                  </span>
                </article>

                <article className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span
                      className={`${styles.statIcon} ${styles.greenIcon}`}
                    >
                      <ProfileIcon type="accepted" />
                    </span>

                    <span className={styles.statIndex}>02</span>
                  </div>

                  <p>Accepted submissions</p>

                  <strong className={styles.greenValue}>
                    {acceptedCount === null
                      ? "—"
                      : acceptedCount.toLocaleString("en-IN")}
                  </strong>

                  <span className={styles.statFoot}>
                    Successful attempts
                  </span>
                </article>

                <article className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span
                      className={`${styles.statIcon} ${styles.purpleIcon}`}
                    >
                      <ProfileIcon type="solved" />
                    </span>

                    <span className={styles.statIndex}>03</span>
                  </div>

                  <p>Problems solved</p>

                  <strong>
                    {solvedCount === null
                      ? "—"
                      : solvedCount.toLocaleString("en-IN")}
                  </strong>

                  <span className={styles.statFoot}>
                    Unique problems solved
                  </span>
                </article>

                <article className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span
                      className={`${styles.statIcon} ${styles.blueIcon}`}
                    >
                      <ProfileIcon type="rate" />
                    </span>

                    <span className={styles.statIndex}>04</span>
                  </div>

                  <p>Acceptance rate</p>

                  <strong>
                    {hasAcceptanceRate
                      ? `${safeAcceptanceRate}%`
                      : "—"}
                  </strong>

                  <div
                    className={styles.rateTrack}
                    role="progressbar"
                    aria-label="Acceptance rate"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={safeAcceptanceRate}
                  >
                    <span
                      style={{
                        width: `${safeAcceptanceRate}%`,
                      }}
                    />
                  </div>

                  {statsError && (
                    <span className={styles.statFoot}>
                      Statistics unavailable
                    </span>
                  )}
                </article>
              </div>
            </section>

            {/* Recent submissions */}
            <section className={styles.historySection}>
              <div className={styles.historyHeading}>
                <div className={styles.historyTitle}>
                  <span className={styles.historyIcon}>
                    <ProfileIcon type="submissions" />
                  </span>

                  <div>
                    <p className={styles.eyebrow}>
                      RECENT ACTIVITY
                    </p>

                    <h2>Submission history</h2>

                    <p className={styles.sectionDescription}>
                      Recent coding attempts and their verdicts.
                    </p>
                  </div>
                </div>

                <span className={styles.countBadge}>
                  {submissionsError
                    ? "Unavailable"
                    : `Page ${submissionPage} · ${SUBMISSIONS_PAGE_SIZE} per page`}
                </span>
              </div>

              {submissionsError ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <ProfileIcon type="submissions" />
                  </div>

                  <h3>Submission history unavailable</h3>
                  <p>{submissionsError}</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <ProfileIcon type="submissions" />
                  </div>

                  <h3>
                    {submissionPage > 1
                      ? "No more submissions"
                      : "No submissions yet"}
                  </h3>

                  <p>
                    {submissionPage > 1
                      ? "There are no submissions on this page. Go back to view the previous batch."
                      : "Submissions will appear here when this member starts solving problems."}
                  </p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>PROBLEM</th>
                        <th>LANGUAGE</th>
                        <th>VERDICT</th>
                        <th>SUBMITTED</th>
                      </tr>
                    </thead>

                    <tbody>
                      {submissions.map((submission) => {
                        const verdict =
                          submission.verdict ||
                          submission.status ||
                          "Pending";

                        const accepted =
                          String(verdict).toUpperCase() === "ACCEPTED";

                        return (
                          <tr key={submission.id}>
                            <td>
                              <div className={styles.problemCell}>
                                <span
                                  className={styles.problemMarker}
                                >
                                  <ProfileIcon type="solved" />
                                </span>

                                <span>
                                  {submission.problem_slug ? (
                                    <Link
                                      href={`/problems/${encodeURIComponent(
                                        submission.problem_slug
                                      )}/submission/${encodeURIComponent(
                                        submission.id
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.problemLink}
                                    >
                                      {submission.problem_title ||
                                        `Problem #${submission.problem_id}`}
                                    </Link>
                                  ) : (
                                    submission.problem_title ||
                                    `Problem #${submission.problem_id}`
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className={styles.language}>
                                {submission.language || "—"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`${styles.verdict} ${
                                  accepted
                                    ? styles.accepted
                                    : styles.otherVerdict
                                }`}
                              >
                                <span
                                  className={styles.verdictDot}
                                />

                                {String(verdict).replaceAll("_", " ")}
                              </span>
                            </td>

                            <td className={styles.dateCell}>
                              {formatDate(submission.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div
                className={styles.historyFooter}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span>
                  {submissionsError
                    ? "Submission history could not be retrieved."
                    : `Showing ${submissions.length} submission${submissions.length === 1 ? "" : "s"} · Page ${submissionPage}`}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeSubmissionPage(submissionPage - 1)
                    }
                    disabled={
                      submissionPage === 1 ||
                      submissionsLoading ||
                      Boolean(submissionsError)
                    }
                    style={{
                      padding: "9px 13px",
                      borderRadius: "8px",
                      border: "1px solid var(--border, #30342b)",
                      background: "var(--panel-bg, #191b17)",
                      color: "var(--text, #edf0e7)",
                      cursor:
                        submissionPage === 1 ||
                        submissionsLoading ||
                        submissionsError
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        submissionPage === 1 ||
                        submissionsLoading ||
                        submissionsError
                          ? 0.45
                          : 1,
                      font: "inherit",
                    }}
                  >
                    Previous 10
                  </button>

                  {hasNextSubmissionPage && (
                    <button
                      type="button"
                      onClick={() =>
                        changeSubmissionPage(submissionPage + 1)
                      }
                      disabled={
                        submissionsLoading ||
                        Boolean(submissionsError)
                      }
                      style={{
                        padding: "9px 13px",
                        borderRadius: "8px",
                        border: "1px solid var(--accent, #c7e85a)",
                        background: "var(--accent, #c7e85a)",
                        color: "#15170f",
                        cursor:
                          submissionsLoading || submissionsError
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          submissionsLoading || submissionsError
                            ? 0.6
                            : 1,
                        font: "inherit",
                        fontWeight: 600,
                      }}
                    >
                      {submissionsLoading
                        ? "Loading…"
                        : "Next 10"}
                    </button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
