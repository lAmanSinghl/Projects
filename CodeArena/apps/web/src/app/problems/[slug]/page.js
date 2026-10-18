"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteNavbar from "../../../components/app/SiteNavbar";
import { apiFetch } from "../../../lib/api";
import styles from "./page.module.css";
import ProblemInfoPanel from "./components/ProblemInfoPanel";
import CodeWorkspacePanel from "./components/CodeWorkspacePanel";
import { ResizeHandle } from "./components/WorkspacePrimitives";
import {
  API_URL,
  POLL_INTERVAL,
  MAX_POLL_TIME,
  WS_URL,
  LANGUAGES,
  STARTER_CODE,
  verdictMessage,
  pretty,
  normaliseCases,
  resultPayload,
  getCaseResults,
  completedEventSnapshot,
  statusOf,
  isTerminal,
  isPassed,
  firstFailedCase,
} from "./workspaceUtils";

export default function ProblemWorkspacePage() {
  const { slug } = useParams();
  const workspaceRef = useRef(null);
  const pollTimer = useRef(null);
  const pollSequence = useRef(0);
  const dragRef = useRef(null);
  const socketRef = useRef(null);
  const socketAuthenticatedRef = useRef(false);
  const activeSubmissionRef = useRef({
    id: null,
    mode: null,
  });
  // Buffer a fast completion event received before the POST response assigns
  // activeSubmissionRef.current.id. This lives in browser memory only.
  const pendingCompletionEventsRef = useRef(new Map());
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
  // busyMode is only an execution lock for the Run/Submit buttons.
  // Each flow owns its own result, error and timeout state.
  const [busyMode, setBusyMode] = useState(null);
  const [submission, setSubmission] = useState(null); // Submit-only result
  const [submitError, setSubmitError] = useState("");
  const [submitPollingTimedOut, setSubmitPollingTimedOut] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);

  const [runSummary, setRunSummary] = useState(null); // Run-only status
  const [runError, setRunError] = useState("");
  const [runPollingTimedOut, setRunPollingTimedOut] = useState(false);
  const [runBusy, setRunBusy] = useState(false);
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
  const passedCount =
    submissionResult?.passedTestCases ??
    submissionResult?.passedEvaluatedCount ??
    submissionResult?.passedCount ??
    submissionResult?.passed_count ??
    (submissionCases.length
      ? submissionCases.filter(isPassed).length
      : null);
  const totalCount =
    submissionResult?.totalTestCases ??
    submissionResult?.evaluatedCount ??
    submissionResult?.totalPublicCases ??
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
  const applySubmissionSnapshot = useCallback((data, mode) => {
    const result = resultPayload(data);
    const cases = getCaseResults(data);
    const normalized = {
      ...data,
      verdict: data?.verdict ?? result?.verdict,
      result,
    };

    const active = activeSubmissionRef.current;
    const isMatchingActive = String(active.id) === String(data.id);
    const explicitlyFailed = String(data?.status || "").toUpperCase() === "FAILED";

    if (mode === "run") {
      // Run owns only the Run summary/results. Never mutate Submit's result tab.
      setRunSummary(normalized);
      if (cases.length > 0) setRunResults(cases);

      if (!isTerminal(normalized)) return false;

      setRunBusy(false);
      setRunPollingTimedOut(false);
      setBusyMode(null);
      stopPolling();
      pollSequence.current += 1;

      // An HTTP summary does not include per-case results. Keep the active ID
      // until the worker's WebSocket event supplies the actual array.
      if (isMatchingActive && (cases.length > 0 || explicitlyFailed)) {
        activeSubmissionRef.current = { id: null, mode: null };
      }

      return true;
    }

    // Submit owns only the left-side Result tab and its summary.
    setSubmission(normalized);

    if (!isTerminal(normalized)) return false;

    setSubmitBusy(false);
    setSubmitPollingTimedOut(false);
    setShowResultTab(true);
    setActiveTab("result");
    setBusyMode(null);
    stopPolling();
    pollSequence.current += 1;

    if (isMatchingActive) {
      activeSubmissionRef.current = { id: null, mode: null };
    }

    return true;
  }, [stopPolling]);
  const fetchSubmissionSnapshot = useCallback(
    async (submissionId, mode, isCurrent = () => true) => {
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
      // Ignore responses belonging to an outdated submission or polling cycle.
      if (!isCurrent()) {
        return { data, finished: false, stale: true };
      }
      const finished = applySubmissionSnapshot(data, mode);
      return { data, finished, stale: false };
    },
    [applySubmissionSnapshot]
  );
  const startPolling = useCallback((submissionId, mode) => {
    stopPolling();
    const sequence = ++pollSequence.current;
    const startedAt = Date.now();
    async function poll() {
      if (pollSequence.current !== sequence) return;
      if (Date.now() - startedAt > MAX_POLL_TIME) {
        if (mode === "run") {
          setRunPollingTimedOut(true);
          setRunBusy(false);
          setRunError("Judging is taking longer than expected.");
        } else {
          setSubmitPollingTimedOut(true);
          setSubmitBusy(false);
          setSubmitError("Judging is taking longer than expected.");
        }
        setBusyMode(null);
        return;
      }
      try {
        const snapshot = await fetchSubmissionSnapshot(
          submissionId,
          mode,
          () =>
            pollSequence.current === sequence &&
            String(activeSubmissionRef.current.id) ===
            String(submissionId)
        );
        if (
          snapshot.stale ||
          snapshot.finished ||
          pollSequence.current !== sequence
        ) {
          return;
        }
      } catch (error) {
        if (pollSequence.current !== sequence) return;
        const message = error.message || "Unable to refresh submission status.";
        if (mode === "run") {
          setRunError(message);
          setRunBusy(false);
        } else {
          setSubmitError(message);
          setSubmitBusy(false);
        }
        setBusyMode(null);
        return;
      }
      pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    }
    poll();
  }, [stopPolling, fetchSubmissionSnapshot]);
  useEffect(() => {
    let disposed = false;
    let reconnectTimer = null;
    let retryAttempt = 0;
    const connect = () => {
      if (disposed) return;
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        reconnectTimer = window.setTimeout(connect, 5000);
        return;
      }
      let socket;
      try {
        socket = new WebSocket(WS_URL);
      } catch (error) {
        console.error("Unable to create WebSocket:", error);
        reconnectTimer = window.setTimeout(connect, 5000);
        return;
      }
      socketRef.current = socket;
      socketAuthenticatedRef.current = false;
      socket.addEventListener("open", () => {
        if (
          socketRef.current === socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send(JSON.stringify({
            type: "AUTH",
            token,
          }));
        }
      });
      socket.addEventListener("message", (messageEvent) => {
        let event;
        try {
          event = JSON.parse(messageEvent.data);
        } catch {
          return;
        }
        if (event.type === "AUTH_ERROR") {
          socketAuthenticatedRef.current = false;
          socket.close();
          return;
        }
        if (event.type === "AUTH_SUCCESS") {
          if (socketRef.current !== socket) return;
          socketAuthenticatedRef.current = true;
          retryAttempt = 0;
          // Reconcile the current submission after reconnecting.
          const active = activeSubmissionRef.current;
          if (active.id == null) return;
          const isCurrent = () =>
            !disposed &&
            socketRef.current === socket &&
            socketAuthenticatedRef.current &&
            String(activeSubmissionRef.current.id) === String(active.id) &&
            activeSubmissionRef.current.mode === active.mode;
          void fetchSubmissionSnapshot(
            active.id,
            active.mode,
            isCurrent
          )
            .then(({ finished, stale }) => {
              if (finished || stale || !isCurrent()) return;
              // The API confirms the latest state; continue via WebSocket.
              stopPolling();
              pollSequence.current += 1;
            })
            .catch(() => {
              if (isCurrent()) {
                startPolling(active.id, active.mode);
              }
            });
          return;
        }
        if (event.type !== "SUBMISSION_STATUS") return;
        const active = activeSubmissionRef.current;
        const eventSubmissionId = String(event.submissionId ?? "");
        if (
          active.id == null ||
          String(event.submissionId) !== String(active.id)
        ) {
          // A job may finish before the POST response assigns the active ID.
          // Buffer completion events in memory so execute() can consume a match.
          if (
            event.status === "COMPLETED" &&
            eventSubmissionId &&
            Array.isArray(event.publicTestCases)
          ) {
            const pending = pendingCompletionEventsRef.current;
            pending.set(eventSubmissionId, event);
            // Bound the buffer if events arrive for unrelated submissions.
            while (pending.size > 10) {
              const oldestKey = pending.keys().next().value;
              pending.delete(oldestKey);
            }
          }
          return;
        }
        const isCurrent = () =>
          !disposed &&
          socketRef.current === socket &&
          socketAuthenticatedRef.current &&
          String(activeSubmissionRef.current.id) === String(active.id) &&
          activeSubmissionRef.current.mode === active.mode;
        if (event.status === "PROCESSING") {
          if (active.mode === "run") {
            setRunSummary((current) => {
              if (!current || String(current.id) !== String(active.id)) {
                return current;
              }
              return { ...current, status: "PROCESSING" };
            });
          } else {
            setSubmission((current) => {
              if (!current || String(current.id) !== String(active.id)) {
                return current;
              }
              return { ...current, status: "PROCESSING" };
            });
          }
          return;
        }
        if (event.status === "COMPLETED") {
          if (!isCurrent()) return;
          // The worker includes the complete public-case result array in the
          // Redis Pub/Sub -> WebSocket completion event. Use it directly; no
          // result-cache or extra HTTP result request is needed.
          if (Array.isArray(event.publicTestCases)) {
            const eventSnapshot = completedEventSnapshot(event, active.id);
            // Fall back to the active mode if an older worker event omits it.
            eventSnapshot.result.executionType ||= active.mode;
            applySubmissionSnapshot(eventSnapshot, active.mode);
            return;
          }
          // Backward-compatible fallback while the worker is being updated.
          void fetchSubmissionSnapshot(active.id, active.mode, isCurrent)
            .then(({ finished, stale }) => {
              if (finished || stale || !isCurrent()) return;
              startPolling(active.id, active.mode);
            })
            .catch(() => {
              if (isCurrent()) startPolling(active.id, active.mode);
            });
          return;
        }
        if (event.status === "FAILED") {
          if (!isCurrent()) return;
          applySubmissionSnapshot(
            {
              id: active.id,
              status: "FAILED",
              verdict: "FAILED",
              result: {
                verdict: "FAILED",
                errorOutput: event.message || "The judge could not finish this submission.",
              },
            },
            active.mode
          );
        }
      });
      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
          socketAuthenticatedRef.current = false;
        }
        if (disposed) return;
        // Recover status updates while the connection is unavailable.
        const active = activeSubmissionRef.current;
        if (active.id != null) {
          startPolling(active.id, active.mode);
        }
        retryAttempt += 1;
        const delay = Math.min(
          1000 * 2 ** Math.min(retryAttempt, 5),
          30000
        );
        reconnectTimer = window.setTimeout(connect, delay);
      });
      socket.addEventListener("error", () => {
        if (socket.readyState < WebSocket.CLOSING) {
          socket.close();
        }
      });
    };
    connect();
    return () => {
      disposed = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      socketAuthenticatedRef.current = false;
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close();
      }
    };
  }, [applySubmissionSnapshot, fetchSubmissionSnapshot, startPolling, stopPolling]);
  const execute = async (mode) => {
    if (busyMode || !problem) return;

    if (!sourceCode.trim()) {
      const message = "Write some code before running it.";
      if (mode === "run") setRunError(message);
      else setSubmitError(message);
      return;
    }

    stopPolling();
    pollSequence.current += 1;
    activeSubmissionRef.current = { id: null, mode: null };
    setBusyMode(mode);

    if (mode === "run") {
      // Reset Run's own state only. Do not clear or switch the left Result tab.
      setRunBusy(true);
      setRunSummary(null);
      setRunError("");
      setRunPollingTimedOut(false);
      setRunResults([]);
      setActiveRunResult(0);
      setBottomTab("testcases");
    } else {
      // Reset Submit's own state only. Preserve all Run results and its tab.
      setSubmitBusy(true);
      setSubmission(null);
      setSubmitError("");
      setSubmitPollingTimedOut(false);
      setShowResultTab(true);
      setActiveTab("result");
    }
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
      if (data.id === undefined || data.id === null) {
        throw new Error("The API did not return an execution ID.");
      }
      const submissionId = String(data.id);
      activeSubmissionRef.current = {
        id: submissionId,
        mode,
      };
      if (mode === "run") {
        setRunSummary(data);
      } else {
        setSubmission(data);
      }
      const earlyCompletion = pendingCompletionEventsRef.current.get(submissionId);
      if (earlyCompletion) {
        pendingCompletionEventsRef.current.delete(submissionId);
        if (Array.isArray(earlyCompletion.publicTestCases)) {
          const eventSnapshot = completedEventSnapshot(
            earlyCompletion,
            submissionId
          );
          eventSnapshot.result.executionType ||= mode;
          applySubmissionSnapshot(eventSnapshot, mode);
          return;
        }
      }
      const isCurrent = () =>
        String(activeSubmissionRef.current.id) === submissionId &&
        activeSubmissionRef.current.mode === mode;
      if (socketAuthenticatedRef.current) {
        // Check once in case execution finished before the browser registered
        // the active submission. Subsequent updates arrive via WebSocket.
        void fetchSubmissionSnapshot(data.id, mode, isCurrent)
          .then(({ finished, stale }) => {
            if (finished || stale || !isCurrent()) return;
            if (!socketAuthenticatedRef.current) {
              startPolling(data.id, mode);
            }
          })
          .catch(() => {
            if (isCurrent()) {
              startPolling(data.id, mode);
            }
          });
      } else {
        // No authenticated socket yet: fall back to polling.
        startPolling(data.id, mode);
      }
    } catch (error) {
      const message = error.message || "Execution failed.";
      if (mode === "run") {
        setRunError(message);
        setRunBusy(false);
      } else {
        setSubmitError(message);
        setSubmitBusy(false);
      }
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
          <ProblemInfoPanel
            problem={problem}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showResultTab={showResultTab}
            descriptionProps={{
              problem,
              formattedDescription,
              testCases,
              pretty,
              onViewTestCase: (index) => {
                setActiveTestCase(index);
                setBottomTab("testcases");
              },
            }}
            submissionResultProps={{
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
            }}
          />

          <ResizeHandle
            direction="horizontal"
            label="description and code panels"
            onPointerDown={(event) => startResize(event, "horizontal")}
          />

          <CodeWorkspacePanel
            editorHeight={editorHeight}
            onResize={startResize}
            codeEditorProps={{
              language,
              languages: LANGUAGES,
              languageMeta,
              sourceCode,
              onSourceChange: (value) =>
                setSourceByLanguage((current) => ({
                  ...current,
                  [language]: value,
                })),
              onLanguageChange: setLanguage,
              onReset: () => {
                setSourceByLanguage((current) => ({
                  ...current,
                  [language]:
                    starterByLanguage[language] ?? STARTER_CODE[language] ?? "",
                }));
                setRunError("");
                setSubmitError("");
              },
              busyMode,
              onRun: () => execute("run"),
              onSubmit: () => execute("submit"),
            }}
            executionResultsProps={{
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
            }}
          />
        </div>
      </main>
    </div>
  );
}
