
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SiteNavbar from "../../components/app/SiteNavbar";
import styles from "./page.module.css";

const API_URL = "http://localhost:5000/api";

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

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const encodedUsername = encodeURIComponent(username);

        const [profileResponse, statsResponse, submissionsResponse] =
          await Promise.all([
            fetch(`${API_URL}/auth/public/${encodedUsername}`, {
              signal: controller.signal,
            }),
            fetch(
              `${API_URL}/submissions/stats?username=${encodedUsername}`,
              { signal: controller.signal }
            ),
            fetch(
              `${API_URL}/submissions?username=${encodedUsername}&page=1&limit=10`,
              { signal: controller.signal }
            ),
          ]);

        if (
          !profileResponse.ok ||
          !statsResponse.ok ||
          !submissionsResponse.ok
        ) {
          throw new Error(
            profileResponse.status === 404
              ? "User not found."
              : "Unable to load this profile."
          );
        }

        const [profileData, statsData, submissionsData] =
          await Promise.all([
            profileResponse.json(),
            statsResponse.json(),
            submissionsResponse.json(),
          ]);

        setProfile(profileData.user);
        setStats(statsData);
        setSubmissions(submissionsData.submissions ?? []);
      } catch (err) {
        if (err.name === "AbortError") return;

        setError(err.message || "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => controller.abort();
  }, [username]);

  const displayName =
    profile?.display_name || profile?.username || username;

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  const totalCount = Number(stats?.totalSubmissions ?? 0);
  const acceptedCount = Number(stats?.acceptedSubmissions ?? 0);
  const solvedCount = Number(stats?.solvedProblems ?? 0);
  const acceptanceRate = Number(stats?.acceptanceRate ?? 0);

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
        ) : error || !profile || !stats ? (
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
                    {totalCount.toLocaleString("en-IN")}
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
                    {acceptedCount.toLocaleString("en-IN")}
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
                    {solvedCount.toLocaleString("en-IN")}
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
                  <strong>{acceptanceRate}%</strong>

                  <div
                    className={styles.rateTrack}
                    role="progressbar"
                    aria-label="Acceptance rate"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(
                      100,
                      Math.max(0, acceptanceRate)
                    )}
                  >
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, acceptanceRate)
                        )}%`,
                      }}
                    />
                  </div>
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
                  {submissions.length} of latest 10
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <ProfileIcon type="submissions" />
                  </div>

                  <h3>No submissions yet</h3>
                  <p>
                    Submissions will appear here when this member
                    starts solving problems.
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
                          verdict.toUpperCase() === "ACCEPTED";

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
                                  {submission.problem_title ||
                                    `Problem #${submission.problem_id}`}
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
                                {verdict.replaceAll("_", " ")}
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

              <div className={styles.historyFooter}>
                <span>
                  Showing {submissions.length} recent submission
                  {submissions.length === 1 ? "" : "s"}
                </span>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
