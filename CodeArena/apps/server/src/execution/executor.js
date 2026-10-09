import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import languages from "./languages.js";
import { runSandbox } from "./sandbox.js";

export const executeSubmission = async ({
    language,
    sourceCode,
    testCases = []
}) => {
    const strategy = languages[language];

    if (!strategy) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), "codearena-")
    );

    try {
        const sourcePath = path.join(
            tempDir,
            path.basename(strategy.sourceFile)
        ); 

        await fs.writeFile(
            sourcePath,
            sourceCode,
            "utf8"
        );

        return await runSandbox({
            image: strategy.image,
            sourceDir: tempDir,
            compileCommand: strategy.compile,
            runCommand: strategy.run,
            testCases
        });

    } finally {
        await fs.rm(tempDir, {
            recursive: true,
            force: true
        });
    }
};