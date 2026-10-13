
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
    const __args = JSON.parse(__fs.readFileSync(0, "utf8"));

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

const cppTypes = {
    number: "int",
    "number[]": "std::vector<int>",
};

const getCppType = (type) => {
    const cppType = cppTypes[type];

    if (!cppType) {
        throw new Error(`Unsupported C++ function type: ${type}`);
    }

    return cppType;
};

const generateCppProgram = ({
    sourceCode,
    functionName,
    functionConfig,
}) => {
    if (
        typeof functionName !== "string" ||
        !/^[A-Za-z_][A-Za-z0-9_]*$/.test(functionName)
    ) {
        throw new Error("Invalid C++ function name");
    }

    if (
        !functionConfig ||
        !Array.isArray(functionConfig.parameters) ||
        typeof functionConfig.returnType !== "string"
    ) {
        throw new Error("Invalid function configuration");
    }

    const argumentDeclarations = functionConfig.parameters.map(
        (parameter, index) => {
            const cppType = getCppType(parameter.type);

            return `
        ${cppType} __arg${index} =
            __args.at(${index}).get<${cppType}>();
`;
        }
    );

    const argumentNames = functionConfig.parameters.map(
        (_, index) => `__arg${index}`
    );

    const returnType = getCppType(functionConfig.returnType);

    return `
#include <bits/stdc++.h>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

${sourceCode}

int main() {
    try {
        json __args;
        cin >> __args;

        if (!__args.is_array()) {
            throw runtime_error(
                "Test input must be a JSON array of arguments"
            );
        }

        if (__args.size() != ${functionConfig.parameters.length}) {
            throw runtime_error(
                "Incorrect number of function arguments"
            );
        }

        ${argumentDeclarations.join("\n")}

        Solution __solution;

        ${returnType} __result =
            __solution.${functionName}(
                ${argumentNames.join(", ")}
            );

        json __output = __result;
        cout << __output.dump();

        return 0;
    } catch (const exception& error) {
        cerr << error.what() << endl;
        return 1;
    }
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

    if (language !== "javascript" && language !== "cpp") {
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

        let generatedSource;

        if (language === "javascript") {
            generatedSource = generateJavaScriptProgram({
                sourceCode,
                functionName,
            });
        } else {
            generatedSource = generateCppProgram({
                sourceCode,
                functionName,
                functionConfig,
            });
        }

        await fs.writeFile(sourcePath, generatedSource, "utf8");

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

            if (args.length !== functionConfig.parameters.length) {
                throw new Error(
                    `Test case ${index + 1} has an incorrect number of arguments`
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
