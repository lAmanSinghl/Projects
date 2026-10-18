export const API_URL = "/api";
export const POLL_INTERVAL = 1500;
export const MAX_POLL_TIME = 120000;

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
    .replace(/^https:/i, "wss:")
    .replace(/^http:/i, "ws:")
    .replace(/\/$/, "");

export const LANGUAGES = [
  { id: "javascript", label: "JavaScript", extension: "js" },
  { id: "python", label: "Python", extension: "py" },
  { id: "cpp", label: "C++17", extension: "cpp" },
  { id: "c", label: "C17", extension: "c" },
  { id: "java", label: "Java 21", extension: "java" },
  { id: "go", label: "Go", extension: "go" },
  { id: "rust", label: "Rust", extension: "rs" },
];

export const STARTER_CODE = {
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

export const TERMINAL_STATES = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILATION_ERROR",
  "COMPILATION_TIME_LIMIT_EXCEEDED",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "OUTPUT_LIMIT_EXCEEDED",
  "INTERNAL_ERROR",
  "FAILED",
  "COMPLETED",
]);

export function verdictMessage(status) {
  const messages = {
    ACCEPTED: "Your solution passed all evaluated test cases.",
    WRONG_ANSWER: "Your solution did not produce the expected output.",
    COMPILATION_ERROR: "Your code could not be compiled.",
    TIME_LIMIT_EXCEEDED: "Your solution exceeded the execution time limit.",
    MEMORY_LIMIT_EXCEEDED: "Your solution exceeded the memory limit.",
    RUNTIME_ERROR: "Your program encountered an error while running.",
    OUTPUT_LIMIT_EXCEEDED: "Your program produced too much output.",
    INTERNAL_ERROR: "The judge encountered an internal error.",
    FAILED: "The judge could not finish this submission. Please try again.",
  };

  return (
    messages[status] ??
    "Execution finished. Review the result details below."
  );
}

export function pretty(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return JSON.stringify(value);

  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
}

export function normaliseCases(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.testCases)) return data.testCases;
  if (Array.isArray(data?.test_cases)) return data.test_cases;
  return [];
}

export function resultPayload(data) {
  return data?.result && typeof data.result === "object" ? data.result : data;
}

export function getCaseResults(data) {
  const result = resultPayload(data);
  const candidates = [
    result?.publicTestCases,
    result?.testCaseResults,
    result?.test_case_results,
    result?.results,
    data?.publicTestCases,
    data?.testCaseResults,
    data?.test_case_results,
    data?.results,
  ];

  // Prefer a populated full array. A single legacy failedTestCase must not
  // masquerade as all case results.
  return (
    candidates.find((candidate) => Array.isArray(candidate) && candidate.length > 0) ??
    candidates.find(Array.isArray) ??
    []
  );
}

export function completedEventSnapshot(event, submissionId) {
  const verdict = String(event?.verdict || "INTERNAL_ERROR").toUpperCase();

  return {
    id: submissionId ?? event?.submissionId,
    status: "COMPLETED",
    verdict,
    result: {
      verdict,
      executionType: event?.executionType,
      executionTimeMs: event?.executionTimeMs ?? null,
      passedTestCases: event?.passedTestCases ?? null,
      totalTestCases:
        event?.totalTestCases ?? event?.publicTestCases?.length ?? null,
      publicTestCases: Array.isArray(event?.publicTestCases)
        ? event.publicTestCases
        : [],
      ...(event?.stderr ? { stderr: event.stderr } : {}),
      ...(event?.exitCode != null ? { exitCode: event.exitCode } : {}),
    },
  };
}

export function statusOf(data) {
  const result = resultPayload(data);
  return String(data?.verdict ?? result?.verdict ?? data?.status ?? "").toUpperCase();
}

export function isTerminal(data) {
  return TERMINAL_STATES.has(statusOf(data));
}

export function isPassed(item) {
  return ["ACCEPTED", "PASSED", "PASS", "CORRECT"].includes(
    String(item?.status || item?.verdict || "").toUpperCase()
  );
}

export function firstFailedCase(data) {
  const result = resultPayload(data);
  const failedPublicCase = getCaseResults(data).find((item) => {
    const status = String(item?.status || item?.verdict || "").toUpperCase();
    return status !== "NOT_RUN" && !isPassed(item);
  });

  return (
    result?.failedTestCase ??
    result?.failed_test_case ??
    result?.firstFailedTestCase ??
    result?.first_failed_test_case ??
    result?.firstFailedPublicCase ??
    result?.first_failed_public_case ??
    failedPublicCase ??
    null
  );
}
