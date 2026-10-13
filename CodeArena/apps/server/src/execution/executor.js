
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import languages from "./languages.js";
import { runSandbox } from "./sandbox.js";

export const executeSubmission = async ({
    language,
    sourceCode,
    testCases = [],
    onTestCaseResult,
}) => {
    const strategy = languages[language];

    if (!strategy) {
        throw new Error(`Unsupported language: ${language}`);
    }

    if (typeof sourceCode !== "string" || !sourceCode.trim()) {
        throw new Error("Source code must be a non-empty string");
    }

    if (!Array.isArray(testCases)) {
        throw new Error("Test cases must be an array");
    }

    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "codearena-")
    );

    try {
        const sourcePath = path.join(
            tempDir,
            path.basename(strategy.sourceFile)
        );

        // The submitted source now contains the complete program,
        // including the problem setter's main() and input parsing.
        await fs.writeFile(sourcePath, sourceCode, "utf8");

        // The executor treats test input as opaque text.
        // Each language's main() handles its own input format.
        const normalizedTestCases = testCases.map((testCase, index) => {
            if (
                !testCase ||
                typeof testCase.input !== "string"
            ) {
                throw new Error(
                    `Test case ${index + 1} must have a string input`
                );
            }

            return testCase;
        });

        return await runSandbox({
            image: strategy.image,
            sourceDir: tempDir,
            compileCommand: strategy.compile,
            runCommand: strategy.run,
            testCases: normalizedTestCases,
            onTestCaseResult,
        });
    } finally {
        await fs.rm(tempDir, {
            recursive: true,
            force: true,
        });
    }
};

const normalize = (value) => {
    if (Array.isArray(value)) {
        return value.map(normalize);
    }

    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .map((key) => [key, normalize(value[key])])
        );
    }

    return value;
};

export const judgeOutput = (actualOutput, expectedOutput) => {
    const actual = JSON.stringify(normalize(actualOutput));
    const expected = JSON.stringify(normalize(expectedOutput));

    return actual === expected
        ? "ACCEPTED"
        : "WRONG_ANSWER";
};
