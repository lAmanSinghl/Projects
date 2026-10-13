
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import languages from "./languages.js";
import { runSandbox } from "./sandbox.js";

const generateJavaScriptProgram = ({
    sourceCode,
    functionName,
}) => {
    if (
        typeof functionName !== "string" ||
        !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(functionName)
    ) {
        throw new Error("Invalid function name");
    }

    return `
${sourceCode}

const __fs = require("node:fs");

try {
    const __args = JSON.parse(
        __fs.readFileSync(0, "utf8")
    );

    if (!Array.isArray(__args)) {
        throw new Error("Test input must be a JSON array of arguments");
    }

    const __result = ${functionName}(...__args);
    const __serialized = JSON.stringify(__result);

    if (__serialized === undefined) {
        throw new Error("Function returned a non-serializable value");
    }

    process.stdout.write(__serialized);
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
`;
};

export const executeSubmission = async ({
    language,
    sourceCode,
    testCases = [],
    functionName,
    functionConfig,
    onTestCaseResult,
}) => {
    const strategy = languages[language];

    if (!strategy) {
        throw new Error(`Unsupported language: ${language}`);
    }

    if (language !== "javascript") {
        throw new Error(
            `Function-based execution is not implemented for ${language} yet`
        );
    }

    if (!functionConfig || !Array.isArray(functionConfig.parameters)) {
        throw new Error("Invalid function configuration");
    }

    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "codearena-")
    );

    try {
        const sourcePath = path.join(
            tempDir,
            path.basename(strategy.sourceFile)
        );

        const generatedSource = generateJavaScriptProgram({
            sourceCode,
            functionName,
        });

        await fs.writeFile(
            sourcePath,
            generatedSource,
            "utf8"
        );

        const normalizedTestCases = testCases.map((testCase, index) => {
            let args;

            try {
                args = JSON.parse(testCase.input);
            } catch {
                throw new Error(
                    `Test case ${index + 1} input must be valid JSON`
                );
            }

            if (!Array.isArray(args)) {
                throw new Error(
                    `Test case ${index + 1} input must be a JSON array`
                );
            }

            return {
                ...testCase,
                input: JSON.stringify(args),
            };
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
