import { executeSubmission } from "./executor.js";
import { judgeOutput } from "./judge.js";

export const runSubmission = async ({
    language,
    sourceCode,
    testCases
}) => {
    const execution = await executeSubmission({
        language,
        sourceCode,
        testCases
    });
    if (execution.status === "OUTPUT_LIMIT") {
    return {
        verdict: "OUTPUT_LIMIT_EXCEEDED"
    };
}
    if (execution.status === "COMPILATION_ERROR") {
        return {
            verdict: "COMPILATION_ERROR",
            stderr: execution.stderr,
            exitCode: execution.exitCode
        };
    }

    if (execution.status === "COMPILATION_TIMEOUT") {
        return {
            verdict: "COMPILATION_TIME_LIMIT_EXCEEDED"
        };
    }

    if (execution.status === "TIME_LIMIT") {
        return {
            verdict: "TIME_LIMIT_EXCEEDED"
        };
    }

    if (execution.status === "MEMORY_LIMIT") {
        return {
            verdict: "MEMORY_LIMIT_EXCEEDED"
        };
    }

    if (execution.status === "RUNTIME_ERROR") {
        return {
            verdict: "RUNTIME_ERROR",
            stderr: execution.stderr,
            exitCode: execution.exitCode
        };
    }

    // Judge every test case.
    for (let i = 0; i < testCases.length; i++) {
        const result = execution.results[i];
        const testCase = testCases[i];

        const verdict = judgeOutput(
            result.stdout,
            testCase.expected_output
        );

        if (verdict === "WRONG_ANSWER") {
            return {
                verdict: "WRONG_ANSWER",
                failedTestCase: i + 1,
                stdout: result.stdout
            };
        }
    }

    return {
        verdict: "ACCEPTED"
    };
};