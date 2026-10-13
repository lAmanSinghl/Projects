
import { executeSubmission } from "./executor.js";
import { judgeOutput } from "./judge.js";

const EXECUTION_VERDICTS = {
    OUTPUT_LIMIT: "OUTPUT_LIMIT_EXCEEDED",
    COMPILATION_ERROR: "COMPILATION_ERROR",
    COMPILATION_TIMEOUT: "COMPILATION_TIME_LIMIT_EXCEEDED",
    TIME_LIMIT: "TIME_LIMIT_EXCEEDED",
    MEMORY_LIMIT: "MEMORY_LIMIT_EXCEEDED",
    RUNTIME_ERROR: "RUNTIME_ERROR",
};

const CASE_VERDICTS = {
    RUNTIME_ERROR: "RUNTIME_ERROR",
    TIME_LIMIT: "TIME_LIMIT_EXCEEDED",
    MEMORY_LIMIT: "MEMORY_LIMIT_EXCEEDED",
    OUTPUT_LIMIT: "OUTPUT_LIMIT_EXCEEDED",
};

export const runSubmission = async ({
    language,
    sourceCode,
    testCases,
    functionName,
    functionConfig,
    mode = "submit",
}) => {
    if (!["run", "submit"].includes(mode)) {
        throw new Error(`Invalid execution mode: ${mode}`);
    }

    const testCaseResults = [];
    let overallVerdict = "ACCEPTED";

    const execution = await executeSubmission({
        language,
        sourceCode,
        testCases,
        functionName,
        functionConfig,

        onTestCaseResult: async (executionResult) => {
            const index = executionResult.testCaseIndex;
            const testCase = testCases[index];

            if (!testCase) {
                overallVerdict = "INTERNAL_ERROR";
                return false;
            }

            let caseVerdict =
                CASE_VERDICTS[executionResult.status];

            let actualOutput = String(
                executionResult.stdout ?? ""
            ).trim();

            if (!caseVerdict) {
                let expectedValue;
                let actualValue;

                try {
                    expectedValue = JSON.parse(
                        testCase.expected_output
                    );
                } catch {
                    overallVerdict = "INTERNAL_ERROR";
                    return false;
                }

                try {
                    actualValue = JSON.parse(actualOutput);
                } catch {
                    caseVerdict = "WRONG_ANSWER";
                }

                if (!caseVerdict) {
                    actualOutput = actualValue;

                    caseVerdict = judgeOutput(
                        actualValue,
                        expectedValue
                    );
                }
            }

            testCaseResults.push({
                testCaseId: testCase.id,
                testCaseIndex: index,
                status: caseVerdict,
                actualOutput,
                stderr: executionResult.stderr ?? "",
                exitCode: executionResult.exitCode ?? null,
            });

            if (caseVerdict === "WRONG_ANSWER") {
                overallVerdict = "WRONG_ANSWER";

                // Run continues after wrong answers.
                // Submit stops at the first wrong answer.
                return mode === "run";
            }

            if (caseVerdict) {
                overallVerdict = caseVerdict;
                return false;
            }

            return true;
        },
    });

    // Sandbox-level failures can occur before a case is judged.
    const executionFailure =
        EXECUTION_VERDICTS[execution.status];

    if (executionFailure) {
        overallVerdict = executionFailure;

        const failedExecution = execution.results?.at(-1);

        if (
            failedExecution &&
            !testCaseResults.some(
                (item) =>
                    String(item.testCaseId) ===
                    String(failedExecution.testCaseId)
            )
        ) {
            testCaseResults.push({
                testCaseId: failedExecution.testCaseId,
                testCaseIndex: failedExecution.testCaseIndex,
                status: executionFailure,
                actualOutput: failedExecution.stdout ?? "",
                stderr: failedExecution.stderr ?? "",
                exitCode: failedExecution.exitCode ?? null,
            });
        }
    } else if (
        execution.status === "RUNTIME_ERROR" ||
        execution.status === "INTERNAL_ERROR"
    ) {
        overallVerdict =
            execution.status === "INTERNAL_ERROR"
                ? "INTERNAL_ERROR"
                : "RUNTIME_ERROR";
    } else if (execution.status === "STOPPED") {
        // The callback already decided the verdict.
    } else if (execution.status !== "COMPLETED") {
        overallVerdict = "RUNTIME_ERROR";
    }

    return {
        mode,
        verdict: overallVerdict,
        testCaseResults,
        stderr: execution.stderr,
        exitCode: execution.exitCode,
    };
};
