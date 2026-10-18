import styles from "../page.module.css";
import { Icon } from "./WorkspacePrimitives";
import { isPassed, pretty, statusOf } from "../workspaceUtils";

function CaseResults({ items, activeIndex, onSelect }) {
  if (!items.length) return null;

  const selectedIndex = Math.min(activeIndex, items.length - 1);
  const item = items[selectedIndex];
  const state = String(item?.status || item?.verdict || "UNKNOWN").toUpperCase();
  const passed = isPassed(item);
  const notRun = state === "NOT_RUN";
  const stderr = String(item?.stderr ?? "").trim();

  const selectedStatusClass = passed
    ? styles.passLabel
    : notRun
      ? styles.muted
      : styles.failLabel;

  return (
    <div className={styles.caseResultsPanel}>
      <div className={styles.caseSelector} role="tablist" aria-label="Public test case results">
        {items.map((resultItem, index) => {
          const resultStatus = String(
            resultItem?.status || resultItem?.verdict || "UNKNOWN"
          ).toUpperCase();
          const resultPassed = isPassed(resultItem);
          const resultNotRun = resultStatus === "NOT_RUN";
          const resultClass = resultPassed
            ? styles.passLabel
            : resultNotRun
              ? styles.muted
              : styles.failLabel;
          const resultLabel = resultPassed
            ? "✓ Passed"
            : resultNotRun
              ? "— Not run"
              : `× ${resultStatus.replaceAll("_", " ")}`;

          return (
            <button
              key={resultItem.testCaseId ?? resultItem.test_case_id ?? index}
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              className={selectedIndex === index ? styles.activeCase : ""}
              onClick={() => onSelect(index)}
            >
              Case {index + 1}
              <span className={resultClass}> · {resultLabel}</span>
            </button>
          );
        })}
      </div>

      <article className={styles.caseDetail} role="tabpanel">
        <div className={styles.runResultHeading}>
          <strong>Case {selectedIndex + 1}</strong>
          <span className={selectedStatusClass}>
            {passed
              ? "✓ Passed"
              : notRun
                ? "— Not run"
                : `× ${state.replaceAll("_", " ")}`}
          </span>
        </div>

        {item.input !== undefined && (
          <div className={styles.exampleField}>
            <span>Input</span>
            <pre>{pretty(item.input)}</pre>
          </div>
        )}

        {item.expectedOutput !== undefined && item.expectedOutput !== null && (
          <div className={styles.exampleField}>
            <span>Expected output</span>
            <pre>{pretty(item.expectedOutput)}</pre>
          </div>
        )}

        <div className={styles.exampleField}>
          <span>Your output</span>
          <pre>{pretty(item.actualOutput ?? item.actual_output ?? item.stdout)}</pre>
        </div>

        {stderr && (
          <div className={`${styles.exampleField} ${styles.diagnosticField}`}>
            <span>Error output</span>
            <pre>{stderr}</pre>
          </div>
        )}

        {item.exitCode !== undefined && item.exitCode !== null && item.exitCode !== 0 && (
          <div className={styles.exitCode}>Exit code: {item.exitCode}</div>
        )}
      </article>
    </div>
  );
}

export default function ExecutionResultsPanel({
  bottomTab,
  setBottomTab,
  testCases,
  activeTestCase,
  setActiveTestCase,
  currentCase,
  runBusy,
  runError,
  runSummary,
  runPollingTimedOut,
  runResults,
  activeRunResult,
  setActiveRunResult,
}) {
  return (
    <section className={styles.resultsPanel}>
      <header className={styles.panelHeader}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={bottomTab === "testcases" ? styles.activeTab : ""}
            onClick={() => setBottomTab("testcases")}
          >
            Testcase
          </button>
          <button
            type="button"
            className={bottomTab === "testresult" ? styles.activeTab : ""}
            onClick={() => setBottomTab("testresult")}
          >
            Testcase Result
            {runResults.length > 0 && (
              <span className={styles.tabCount}>{runResults.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className={styles.resultsBody}>
        {bottomTab === "testcases" ? (
          testCases.length === 0 ? (
            <div className={styles.emptyState}>No public test cases configured.</div>
          ) : (
            <>
              <div className={styles.caseSelector}>
                {testCases.map((item, index) => (
                  <button
                    key={item.id ?? index}
                    type="button"
                    className={activeTestCase === index ? styles.activeCase : ""}
                    onClick={() => setActiveTestCase(index)}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>

              {currentCase && (
                <div className={styles.caseDetail}>
                  <div className={styles.exampleField}>
                    <span>Input</span>
                    <pre>{pretty(currentCase.input)}</pre>
                  </div>
                  <div className={styles.exampleField}>
                    <span>Expected output</span>
                    <pre>{pretty(currentCase.expected_output)}</pre>
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          <>
            {runBusy && (
              <div className={styles.waitingInline}>
                <span className={styles.spinnerSmall} />
                Running public test cases…
              </div>
            )}

            {runError && <p className={styles.inlineError}>{runError}</p>}

            {(runSummary?.result?.stderr || runSummary?.result?.errorOutput || runSummary?.result?.exitCode != null) && (
              <section className={styles.diagnosticPanel}>
                <h2>
                  {statusOf(runSummary) === "COMPILATION_ERROR"
                    ? "Compiler output"
                    : "Execution diagnostics"}
                </h2>
                {runSummary?.result?.stderr || runSummary?.result?.errorOutput ? (
                  <pre>{String(runSummary.result.stderr ?? runSummary.result.errorOutput)}</pre>
                ) : (
                  <p>No error output was produced.</p>
                )}
                {runSummary?.result?.exitCode != null && (
                  <span>Exit code: {runSummary.result.exitCode}</span>
                )}
              </section>
            )}

            {runPollingTimedOut && (
              <p className={styles.inlineError}>Judging is taking longer than expected.</p>
            )}

            {!runBusy && runResults.length === 0 && !runError && !runSummary?.result?.stderr && !runSummary?.result?.errorOutput && (
              <div className={styles.emptyState}>
                <Icon name="play" size={22} />
                <strong>No testcase results received yet</strong>
                <p>Click Run to evaluate the public test cases.</p>
              </div>
            )}

            <CaseResults
              items={runResults}
              activeIndex={activeRunResult}
              onSelect={setActiveRunResult}
            />
          </>
        )}
      </div>
    </section>
  );
}
