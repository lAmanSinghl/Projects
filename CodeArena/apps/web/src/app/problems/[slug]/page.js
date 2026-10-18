
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteNavbar from "../../../components/app/SiteNavbar";
import { apiFetch } from "../../../lib/api";
import styles from "./page.module.css";

const API_URL = "/api";
const POLL_INTERVAL = 1500;
const MAX_POLL_TIME = 120000;

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", extension: "js" },
  { id: "python", label: "Python", extension: "py" },
  { id: "cpp", label: "C++17", extension: "cpp" },
  { id: "c", label: "C17", extension: "c" },
  { id: "java", label: "Java 21", extension: "java" },
  { id: "go", label: "Go", extension: "go" },
  { id: "rust", label: "Rust", extension: "rs" },
];

const STARTER_CODE = {
  javascript: `function twoSum(nums, target) {
  // Write your solution here
}`,
  python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
  cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
}`,
  c: `// Write your solution here`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  go: `func twoSum(nums []int, target int) []int {
    // Write your solution here
    return nil
}`,
  rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    // Write your solution here
    vec![]
}`,
};

const TERMINAL_STATES = new Set([
  "ACCEPTED", "WRONG_ANSWER", "COMPILATION_ERROR",
  "COMPILATION_TIME_LIMIT_EXCEEDED", "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR", "OUTPUT_LIMIT_EXCEEDED",
  "INTERNAL_ERROR", "FAILED",
]);

function Icon({ name, size = 16 }) {
  const paths = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>,
    code: <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></>,
    play: <path d="m8 5 12 7-12 7V5Z" />,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7h.01" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.code}
    </svg>
  );
}

function Difficulty({ value }) {
  const level = String(value || "MEDIUM").toUpperCase();

  return (
    <span className={`${styles.difficulty} ${styles[`difficulty${level}`] || ""}`}>
      <span />
      {level.charAt(0) + level.slice(1).toLowerCase()}
    </span>
  );
}

function pretty(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return JSON.stringify(value);

  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
}

function normaliseCases(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.testCases)) return data.testCases;
  if (Array.isArray(data?.test_cases)) return data.test_cases;
  return [];
}

function resultPayload(data) {
  return data?.result && typeof data.result === "object" ? data.result : data;
}

function getCaseResults(data) {
  const result = resultPayload(data);
  const cases =
    result?.publicTestCases ??
    result?.testCaseResults ??
    result?.test_case_results ??
    result?.results ??
    data?.publicTestCases ??
    data?.testCaseResults ??
    data?.test_case_results ??
    data?.results ??
    [];

  return Array.isArray(cases) ? cases : [];
}

function statusOf(data) {
  const result = resultPayload(data);
  return String(data?.verdict ?? result?.verdict ?? data?.status ?? "").toUpperCase();
}

function isTerminal(data) {
  return TERMINAL_STATES.has(statusOf(data));
}

function isPassed(item) {
  return ["ACCEPTED", "PASSED", "PASS", "CORRECT"].includes(
    String(item?.status || item?.verdict || "").toUpperCase()
  );
}

function firstFailedCase(data) {
  const result = resultPayload(data);
  return (
    getCaseResults(data).find((item) => !isPassed(item)) ||
    result?.firstFailedPublicCase ||
    result?.first_failed_public_case ||
    null
  );
}

function ResizeHandle({ direction, onPointerDown, label }) {
  return (
    <div
      className={
        direction === "horizontal"
          ? styles.horizontalResizeHandle
          : styles.verticalResizeHandle
      }
      role="separator"
      aria-label={label}
      aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      title={`Drag to resize ${label}`}
    >
      <span />
    </div>
  );
}

export default function ProblemWorkspacePage() {
  const { slug } = useParams();

  const workspaceRef = useRef(null);
  const pollTimer = useRef(null);
  const pollSequence = useRef(0);
  const dragRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [language, setLanguage] = useState("javascript");
  const [sourceByLanguage, setSourceByLanguage] = useState(STARTER_CODE);
  const [starterByLanguage, setStarterByLanguage] = useState(STARTER_CODE);
  const [activeTab, setActiveTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcases");
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeRunResult, setActiveRunResult] = useState(0);
  const [showResultTab, setShowResultTab] = useState(false);

  const [leftWidth, setLeftWidth] = useState(56);
  const [editorHeight, setEditorHeight] = useState(60);

  const [busyMode, setBusyMode] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionError, setSubmissionError] = useState("");
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [runResults, setRunResults] = useState([]);

  const sourceCode = sourceByLanguage[language] ?? STARTER_CODE[language];
  const currentCase = testCases[activeTestCase];
  const languageMeta = LANGUAGES.find((item) => item.id === language);
  const latestStatus = statusOf(submission);
  const terminal = isTerminal(submission);
  const submissionResult = resultPayload(submission);
  const submissionCases = getCaseResults(submission);
  const firstFailure = firstFailedCase(submission);

  const formattedDescription = useMemo(
    () => String(problem?.description || "").replace(/\r\n/g, "\n").split("\n"),
    [problem?.description]
  );

  const executionType = submissionResult?.executionType;

  const passedCount =
    executionType === "submit"
      ? submissionResult?.passedEvaluatedCount ?? null
      : submissionResult?.passedCount ??
      submissionResult?.passed_count ??
      (submissionCases.length
        ? submissionCases.filter(isPassed).length
        : null);

  const totalCount =
    executionType === "submit"
      ? submissionResult?.evaluatedCount ?? null
      : submissionResult?.totalPublicCases ??
      submissionResult?.totalCases ??
      submissionResult?.total_cases ??
      (submissionCases.length || null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = null;
  }, []);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    async function loadProblem() {
      setLoading(true);
      setLoadError("");

      try {
        const encoded = encodeURIComponent(slug);

        const [problemResponse, casesResponse] = await Promise.all([
          apiFetch(`${API_URL}/problems/${encoded}`, {
            signal: controller.signal,
          }),
          apiFetch(`${API_URL}/problems/${encoded}/test-cases`, {
            signal: controller.signal,
          }),
        ]);

        if (!problemResponse.ok) {
          throw new Error(
            problemResponse.status === 404
              ? "This problem does not exist or is unavailable."
              : "Unable to load the problem."
          );
        }

        if (!casesResponse.ok) {
          throw new Error("Unable to load public test cases.");
        }

        const problemData = await problemResponse.json();
        const casesData = await casesResponse.json();

        if (controller.signal.aborted) return;

        const loadedProblem = problemData.problem || problemData;
        setProblem(loadedProblem);
        setTestCases(normaliseCases(casesData));
        setActiveTestCase(0);

        const configuredStarter =
          loadedProblem?.starter_code || loadedProblem?.starterCode;

        // The problem API's starter code is the source of truth for both
        // the initial editor contents and the Reset action.
        const nextStarter =
          configuredStarter && typeof configuredStarter === "object"
            ? { ...STARTER_CODE, ...configuredStarter }
            : STARTER_CODE;

        setStarterByLanguage(nextStarter);
        setSourceByLanguage(nextStarter);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(error.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProblem();

    return () => {
      controller.abort();
      stopPolling();
      pollSequence.current += 1;
    };
  }, [slug, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback((submissionId, mode) => {
    stopPolling();

    const sequence = ++pollSequence.current;
    const startedAt = Date.now();

    async function poll() {
      if (pollSequence.current !== sequence) return;

      if (Date.now() - startedAt > MAX_POLL_TIME) {
        setPollingTimedOut(true);
        setBusyMode(null);
        return;
      }

      try {
        const response = await apiFetch(
          `${API_URL}/submissions/${encodeURIComponent(submissionId)}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session expired. Sign in again to view results."
              : "Unable to fetch submission status."
          );
        }

        const data = await response.json();
        if (pollSequence.current !== sequence) return;

        const result = resultPayload(data);
        const cases = getCaseResults(data);

        setSubmission({
          ...data,
          verdict: data?.verdict ?? result?.verdict,
          result,
        });

        if (mode === "run") setRunResults(cases);

        if (isTerminal({
          ...data,
          verdict: data?.verdict ?? result?.verdict,
        })) {
          if (mode === "run") {
            setBottomTab("testresult");
            setRunResults(cases);
            setActiveRunResult(0);
          }

          if (mode === "submit") {
            setShowResultTab(true);
            setActiveTab("result");
          }

          setBusyMode(null);
          setPollingTimedOut(false);
          return;
        }
      } catch (error) {
        if (pollSequence.current !== sequence) return;

        setSubmissionError(error.message || "Unable to refresh submission status.");
        setBusyMode(null);
        return;
      }

      pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    }

    poll();
  }, [stopPolling]);

  const execute = async (mode) => {
    if (busyMode || !problem) return;

    if (!sourceCode.trim()) {
      setSubmissionError("Write some code before running it.");
      return;
    }

    setBusyMode(mode);
    setSubmission(null);
    setSubmissionError("");
    setPollingTimedOut(false);

    if (mode === "run") {
      setRunResults([]);
      setActiveRunResult(0);
      setBottomTab("testcases");
      setActiveTab("description");
    } else {
      setShowResultTab(true);
      setActiveTab("result");
    }

    // Keep the existing POST request and polling code below this point.

    try {

      const response = await apiFetch(
        `${API_URL}/submissions/${mode === "run" ? "run" : "submit"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemId: problem.id,
            sourceCode,
            language,
          }),
        }
      );


      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          (response.status === 401
            ? "Sign in to submit your solution."
            : "Unable to create the execution.")
        );
      }

      setSubmission(data);

      if (data.id === undefined || data.id === null) {
        throw new Error("The API did not return an execution ID.");
      }

      startPolling(data.id, mode);
    } catch (error) {
      setSubmissionError(error.message || "Execution failed.");
      setBusyMode(null);
    }
  };

  const startResize = useCallback((event, direction) => {
    event.preventDefault();

    const workspace = workspaceRef.current;
    if (!workspace) return;

    const editorStack = workspace.querySelector("[data-editor-stack]");

    dragRef.current = {
      direction,
      workspace,
      editorStack,
    };

    const onMove = (moveEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.direction === "horizontal") {
        const rect = drag.workspace.getBoundingClientRect();
        if (!rect.width) return;

        const percentage =
          ((moveEvent.clientX - rect.left) / rect.width) * 100;

        setLeftWidth(Math.min(75, Math.max(25, percentage)));
      }

      if (drag.direction === "vertical" && drag.editorStack) {
        const rect = drag.editorStack.getBoundingClientRect();
        if (!rect.height) return;

        const percentage =
          ((moveEvent.clientY - rect.top) / rect.height) * 100;

        setEditorHeight(Math.min(80, Math.max(25, percentage)));
      }
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const renderCaseResults = (items) => {
    if (!items.length) return null;

    const selectedIndex = Math.min(activeRunResult, items.length - 1);
    const item = items[selectedIndex];
    const state = String(item?.status || item?.verdict || "UNKNOWN").toUpperCase();
    const passed = isPassed(item);
    const stderr = String(item?.stderr ?? "").trim();

    return (
      <div className={styles.caseResultsPanel}>
        <div className={styles.caseSelector} role="tablist" aria-label="Test case results">
          {items.map((resultItem, index) => {
            const resultStatus = String(
              resultItem?.status || resultItem?.verdict || "UNKNOWN"
            ).toUpperCase();
            const resultPassed = isPassed(resultItem);

            return (
              <button
                key={resultItem.testCaseId ?? resultItem.test_case_id ?? index}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                className={selectedIndex === index ? styles.activeCase : ""}
                onClick={() => setActiveRunResult(index)}
              >
                Case {index + 1}
                <span className={resultPassed ? styles.passLabel : styles.failLabel}>
                  {resultPassed ? " ✓" : ` · ${resultStatus.replaceAll("_", " ")}`}
                </span>
              </button>
            );
          })}
        </div>

        <article className={styles.caseDetail} role="tabpanel">
          <div className={styles.runResultHeading}>
            <strong>Case {selectedIndex + 1}</strong>
            <span className={passed ? styles.passLabel : styles.failLabel}>
              {passed ? "✓ Passed" : `× ${state.replaceAll("_", " ")}`}
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
  };

  if (loading) {
    return (
      <div className={styles.site}>
        <SiteNavbar />
        <main className={styles.stateCard}>
          <span className={styles.spinner} />
          Loading problem workspace…
        </main>
      </div>
    );
  }

  if (loadError || !problem) {
    return (
      <div className={styles.site}>
        <SiteNavbar />
        <main className={styles.errorCard}>
          <h1>Problem unavailable</h1>
          <p>{loadError || "Unable to load this problem."}</p>
          <Link href="/">Back to problems</Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.site}>
      <SiteNavbar />

      <main className={styles.workspace}>
        <div
          ref={workspaceRef}
          className={styles.workspaceGrid}
          style={{
            "--left-width": `${leftWidth}%`,
            "--right-width": `${100 - leftWidth}%`,
          }}
        >
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={activeTab === "description" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("description")}
                >
                  <Icon name="file" />
                  Description
                </button>

                {showResultTab && (
                  <button
                    type="button"
                    className={activeTab === "result" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("result")}
                  >
                    <Icon name="check" />
                    Result
                  </button>
                )}
              </div>

              <Difficulty value={problem.difficulty} />
            </header>

            <div className={styles.leftBody}>
              {activeTab === "description" ? (
                <article className={styles.descriptionBody}>
                  <div className={styles.problemTitleRow}>
                    <h1>{problem.title}</h1>
                  </div>

                  <div className={styles.descriptionText}>
                    {formattedDescription.map((line, index) =>
                      line.trim() ? (
                        <p key={`${index}-${line}`}>{line}</p>
                      ) : (
                        <div className={styles.textGap} key={`gap-${index}`} />
                      )
                    )}
                  </div>

                  {testCases.length > 0 && (
                    <section className={styles.exampleSection}>
                      <div className={styles.sectionHeading}>
                        <h2>Examples</h2>
                        <span>{testCases.length} public</span>
                      </div>

                      {testCases.slice(0, 3).map((item, index) => (
                        <article className={styles.exampleCard} key={item.id ?? index}>
                          <div className={styles.exampleTitle}>
                            <strong>Example {index + 1}</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTestCase(index);
                                setBottomTab("testcases");
                              }}
                            >
                              View test case →
                            </button>
                          </div>

                          <div className={styles.exampleField}>
                            <span>Input</span>
                            <pre>{pretty(item.input)}</pre>
                          </div>

                          <div className={styles.exampleField}>
                            <span>Expected output</span>
                            <pre>{pretty(item.expected_output)}</pre>
                          </div>
                        </article>
                      ))}
                    </section>
                  )}

                  <div className={styles.notice}>
                    <Icon name="info" size={15} />
                    <p>
                      Run evaluates public test cases. Submit evaluates public
                      and hidden test cases.
                    </p>
                  </div>
                </article>
              ) : (
                <section className={styles.submissionResult}>
                  {submissionError ? (
                    <p className={styles.inlineError}>{submissionError}</p>
                  ) : busyMode === "run" ? (
                    <div className={styles.waiting}>
                      <h2>Run in progress</h2>
                      <p>Run results will appear in the Test Result panel below.</p>
                    </div>
                  ) : busyMode === "submit" ? (
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
                          <p>
                            {latestStatus === "ACCEPTED"
                              ? "Your solution passed all evaluated test cases."
                              : "Your solution did not pass all evaluated test cases."}
                          </p>
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

                      {(submissionResult?.stderr || submissionResult?.exitCode != null) && (
                        <section className={styles.diagnosticPanel}>
                          <h2>
                            {latestStatus === "COMPILATION_ERROR"
                              ? "Compiler output"
                              : "Execution diagnostics"}
                          </h2>
                          {submissionResult?.stderr ? (
                            <pre>{String(submissionResult.stderr)}</pre>
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
                          The API did not include details for a failed public
                          test case. Hidden test case details must remain private.
                        </p>
                      )}
                    </div>
                  )}

                  {pollingTimedOut && (
                    <p className={styles.inlineError}>
                      Judging is taking longer than expected.
                    </p>
                  )}
                </section>
              )}
            </div>
          </section>

          <ResizeHandle
            direction="horizontal"
            label="description and code panels"
            onPointerDown={(event) => startResize(event, "horizontal")}
          />

          <section
            className={styles.editorStack}
            data-editor-stack
            style={{
              "--editor-height": `${editorHeight}%`,
              "--tests-height": `${100 - editorHeight}%`,
            }}
          >
            <section className={styles.editorPanel}>
              <header className={styles.panelHeader}>
                <div className={styles.editorTitle}>
                  <span className={styles.liveDot} />
                  <strong>Code</strong>
                </div>

                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => {
                    setSourceByLanguage((current) => ({
                      ...current,
                      [language]: starterByLanguage[language] ?? STARTER_CODE[language] ?? "",
                    }));
                    setSubmissionError("");
                  }}
                  title="Restore the original starter code for this language"
                >
                  Reset code
                </button>

                <label className={styles.languageSelect}>
                  <span className={styles.srOnly}>Programming language</span>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                  >
                    {LANGUAGES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </header>

              <div className={styles.editorInfo}>
                <span>main.{languageMeta?.extension}</span>
                <span>Editable source</span>
              </div>

              <div className={styles.codeEditor}>
                <div className={styles.lineNumbers} aria-hidden="true">
                  {sourceCode.split("\n").map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>

                <textarea
                  className={styles.codeInput}
                  value={sourceCode}
                  onChange={(event) =>
                    setSourceByLanguage((current) => ({
                      ...current,
                      [language]: event.target.value,
                    }))
                  }
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  aria-label="Source code editor"
                  wrap="off"
                />
              </div>

              <div className={styles.editorFooter}>
                <span>
                  <span className={styles.footerDot} />
                  {languageMeta?.label}
                </span>
                <span>{sourceCode.split("\n").length} lines</span>
              </div>

              <div className={styles.actionBar}>
                <div className={styles.actionHint}>
                  {busyMode ? (
                    <>
                      <span className={styles.spinnerSmall} />
                      {busyMode === "run" ? "Running public cases…" : "Submitting…"}
                    </>
                  ) : (
                    <>
                      <span className={styles.readyDot} />
                      Ready to evaluate
                    </>
                  )}
                </div>

                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={styles.runButton}
                    disabled={Boolean(busyMode)}
                    onClick={() => execute("run")}
                  >
                    <Icon name="play" size={14} />
                    Run
                  </button>

                  <button
                    type="button"
                    className={styles.submitButton}
                    disabled={Boolean(busyMode)}
                    onClick={() => execute("submit")}
                  >
                    <Icon name="send" size={14} />
                    Submit
                  </button>
                </div>
              </div>
            </section>

            <ResizeHandle
              direction="vertical"
              label="code and testcases panels"
              onPointerDown={(event) => startResize(event, "vertical")}
            />

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
                    Test Result
                    {runResults.length > 0 && (
                      <span className={styles.tabCount}>{runResults.length}</span>
                    )}
                  </button>
                </div>
              </header>

              <div className={styles.resultsBody}>
                {bottomTab === "testcases" ? (
                  testCases.length === 0 ? (
                    <div className={styles.emptyState}>
                      No public test cases configured.
                    </div>
                  ) : (
                    <>
                      <div className={styles.caseSelector}>
                        {testCases.map((item, index) => (
                          <button
                            key={item.id ?? index}
                            type="button"
                            className={
                              activeTestCase === index ? styles.activeCase : ""
                            }
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
                    {busyMode === "run" && (
                      <div className={styles.waitingInline}>
                        <span className={styles.spinnerSmall} />
                        Running public test cases…
                      </div>
                    )}

                    {submissionError && (
                      <p className={styles.inlineError}>{submissionError}</p>
                    )}

                    {busyMode !== "submit" &&
                      latestStatus &&
                      terminal &&
                      (submissionResult?.stderr || submissionResult?.exitCode != null) && (
                        <section className={styles.diagnosticPanel}>
                          <h2>
                            {latestStatus === "COMPILATION_ERROR"
                              ? "Compiler output"
                              : "Execution diagnostics"}
                          </h2>
                          {submissionResult?.stderr ? (
                            <pre>{String(submissionResult.stderr)}</pre>
                          ) : (
                            <p>No error output was produced.</p>
                          )}
                          {submissionResult?.exitCode != null && (
                            <span>Exit code: {submissionResult.exitCode}</span>
                          )}
                        </section>
                      )}

                    {!busyMode && runResults.length === 0 && !submissionError && !submissionResult?.stderr && (
                      <div className={styles.emptyState}>
                        <Icon name="play" size={22} />
                        <strong>No run results yet</strong>
                        <p>Click Run to evaluate your solution.</p>
                      </div>
                    )}

                    {renderCaseResults(runResults)}
                  </>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
