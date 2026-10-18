import styles from "../page.module.css";

export default function SubmissionResultPanel({
  submitError,
  submitBusy,
  submission,
  terminal,
  latestStatus,
  verdictMessage,
  passedCount,
  totalCount,
  submissionResult,
  firstFailure,
  submitPollingTimedOut,
  pretty,
}) {
  return (
    <section className={styles.submissionResult}>
      {submitError ? (
        <p className={styles.inlineError}>{submitError}</p>
      ) : submitBusy ? (
        <div className={styles.waiting}>
          <span className={styles.spinner} />
          <h2>Judging your submission…</h2>
          <p>Evaluating your solution.</p>
        </div>
      ) : !submission ? (
        <div className={styles.waiting}>
          <h2>Submit your solution</h2>
          <p>Your verdict will appear here.</p>
        </div>
      ) : !terminal ? (
        <div className={styles.waiting}>
          <span className={styles.spinner} />
          <h2>Submission queued</h2>
        </div>
      ) : (
        <div className={styles.verdictContent}>
          <div
            className={`${styles.verdictHero} ${latestStatus === "ACCEPTED"
              ? styles.accepted
              : styles.rejected
            }`}
          >
            <div className={styles.verdictIcon}>
              {latestStatus === "ACCEPTED" ? "✓" : "×"}
            </div>
            <div>
              <h2>
                {latestStatus === "ACCEPTED"
                  ? "Accepted"
                  : latestStatus.replaceAll("_", " ")}
              </h2>
              <p>{verdictMessage(latestStatus)}</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div>
              <span>TEST CASES PASSED</span>
              <strong>
                {passedCount ?? (latestStatus === "ACCEPTED" ? "All" : "—")}
                {totalCount != null ? ` / ${totalCount}` : ""}
              </strong>
            </div>
            <div>
              <span>EXECUTION TIME</span>
              <strong>
                {submission.execution_time_ms != null
                  ? `${submission.execution_time_ms} ms`
                  : submissionResult?.executionTimeMs != null
                    ? `${submissionResult.executionTimeMs} ms`
                    : "—"}
              </strong>
            </div>
          </div>

          {(submissionResult?.stderr || submissionResult?.errorOutput || submissionResult?.exitCode != null) && (
            <section className={styles.diagnosticPanel}>
              <h2>
                {latestStatus === "COMPILATION_ERROR"
                  ? "Compiler output"
                  : "Execution diagnostics"}
              </h2>
              {submissionResult?.stderr || submissionResult?.errorOutput ? (
                <pre>
                  {String(submissionResult.stderr ?? submissionResult.errorOutput)}
                </pre>
              ) : (
                <p>No error output was produced.</p>
              )}
              {submissionResult?.exitCode != null && (
                <span>Exit code: {submissionResult.exitCode}</span>
              )}
            </section>
          )}

          {latestStatus !== "ACCEPTED" && firstFailure && (
            <section className={styles.failedCase}>
              <h2>First failed public test case</h2>
              <div className={styles.exampleField}>
                <span>Input</span>
                <pre>{pretty(firstFailure.input)}</pre>
              </div>
              <div className={styles.exampleField}>
                <span>Expected output</span>
                <pre>
                  {pretty(firstFailure.expectedOutput ?? firstFailure.expected_output)}
                </pre>
              </div>
              <div className={styles.exampleField}>
                <span>Your output</span>
                <pre>
                  {pretty(firstFailure.actualOutput ?? firstFailure.actual_output ?? firstFailure.stdout)}
                </pre>
              </div>
            </section>
          )}

          {latestStatus !== "ACCEPTED" && !firstFailure && (
            <p className={styles.muted}>
              The API did not include details for a failed public test case.
              Hidden test case details must remain private.
            </p>
          )}
        </div>
      )}

      {submitPollingTimedOut && (
        <p className={styles.inlineError}>
          Judging is taking longer than expected.
        </p>
      )}
    </section>
  );
}
