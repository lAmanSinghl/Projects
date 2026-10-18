
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import languages from "./languages.js";
import { runSandbox } from "./sandbox.js";

const buildProgram = (languageTemplate, sourceCode) => {
    if (
        typeof languageTemplate !== "string" ||
        !languageTemplate.trim()
    ) {
        throw new Error("Language template must be a non-empty string");
    }

    const placeholder = "{{USER_SOLUTION}}";
    const occurrences = languageTemplate.split(placeholder).length - 1;

    if (occurrences !== 1) {
        throw new Error(
            `Language template must contain exactly one ${placeholder} placeholder`
        );
    }

    return languageTemplate.replace(placeholder, sourceCode);
};

export const executeSubmission = async ({
    language,
    sourceCode,
    languageTemplate,
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

    const completeProgram = buildProgram(languageTemplate, sourceCode);

    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "codearena-")
    );

    try {
        const sourcePath = path.join(
            tempDir,
            path.basename(strategy.sourceFile)
        );

        await fs.writeFile(sourcePath, completeProgram, "utf8");

        // Test input remains opaque text; the program handles parsing.
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
