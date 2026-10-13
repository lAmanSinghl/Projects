
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const COMPILE_TIMEOUT_MS = 10_000;
const EXECUTION_TIMEOUT_MS = 5_000;
const MAX_OUTPUT_BYTES = 1024 * 1024;

const runProcess = (
    command,
    args,
    {
        timeoutMs,
        input,
        maxOutputBytes = MAX_OUTPUT_BYTES,
        onTimeout,
        onOutputLimit,
    }
) =>
    new Promise((resolve, reject) => {

        const child = spawn(command, args, {
            stdio: ["pipe", "pipe", "pipe"],
        });

        const stdoutChunks = [];
        const stderrChunks = [];

        let outputBytes = 0;
        let timedOut = false;
        let outputLimitExceeded = false;
        let settled = false;

        const finish = (result) => {
            if (settled) return;

            settled = true;
            clearTimeout(timeout);

            resolve({
                stdout: Buffer.concat(stdoutChunks).toString("utf8"),
                stderr: Buffer.concat(stderrChunks).toString("utf8"),
                ...result,
            });
        };

        const stopProcess = (reason) => {
            
            if (settled) return;

            if (reason === "TIME_LIMIT") {
                timedOut = true;
                Promise.resolve(onTimeout?.()).catch(() => {});
            } else {
                outputLimitExceeded = true;
                Promise.resolve(onOutputLimit?.()).catch(() => {});
            }

            child.kill("SIGTERM");
        };

        const timeout = setTimeout(() => {
            stopProcess("TIME_LIMIT");
        }, timeoutMs);

        const collectOutput = (stream, chunks) => {
            stream.on("data", (chunk) => {
                if (settled || timedOut || outputLimitExceeded) {
                    return;
                }

                outputBytes += chunk.byteLength;

                if (outputBytes > maxOutputBytes) {
                    stopProcess("OUTPUT_LIMIT");
                    return;
                }

                chunks.push(chunk);
            });
        };

        collectOutput(child.stdout, stdoutChunks);
        collectOutput(child.stderr, stderrChunks);

        child.once("error", (error) => {
            if (settled) return;

            settled = true;
            clearTimeout(timeout);
            reject(error);
        });

        child.once("close", (exitCode, signal) => {
            finish({
                exitCode,
                signal,
                timedOut,
                outputLimitExceeded,
            });
        });

        if (input !== undefined) {
            child.stdin.on("error", () => {});
            child.stdin.end(input);
        } else {
            child.stdin.end();
        }
    });

const killContainer = async (containerId) => {
    if (!containerId) return;

    try {
        await execFileAsync("docker", ["kill", containerId]);
    } catch {
        // The container may already have stopped.
    }
};

const inspectMemoryLimit = async (containerId) => {
    try {
        const { stdout } = await execFileAsync("docker", [
            "inspect",
            "--format={{.State.OOMKilled}}",
            containerId,
        ]);

        return stdout.trim() === "true";
    } catch {
        // An inspection failure is not proof of an OOM kill.
        return false;
    }
};


export const runSandbox = async ({
    image,
    sourceDir,
    compileCommand,
    runCommand,
    testCases = [],
    onTestCaseResult,
}) => {
    let containerId;

    try {
        const { stdout: createOutput } = await execFileAsync(
            "docker",
            [
                "create",
                "-i",
                "--memory=128m",
                "--cpus=0.5",
                "--pids-limit=64",
                "--cap-drop=ALL",
                "--security-opt=no-new-privileges",
                "--network=none",
                "--mount",
                `type=bind,source=${sourceDir},target=/tmp/codearena,readonly`,
                image,
                "sleep",
                "300",
            ]
        );

        containerId = createOutput.trim();

        if (!containerId) {
            throw new Error("Docker did not return a container ID");
        }

        await execFileAsync("docker", ["start", containerId]);

        // Compile once for the entire submission.
        if (compileCommand) {
            const compilation = await runProcess(
                "docker",
                ["exec", containerId, ...compileCommand],
                {
                    timeoutMs: COMPILE_TIMEOUT_MS,
                    onTimeout: () => killContainer(containerId),
                }
            );

            if (compilation.timedOut) {
                return {
                    status: "COMPILATION_TIMEOUT",
                    stdout: compilation.stdout,
                    stderr: compilation.stderr,
                    exitCode: compilation.exitCode,
                    results: [],
                };
            }

            if (compilation.outputLimitExceeded) {
                await killContainer(containerId);

                return {
                    status: "OUTPUT_LIMIT",
                    results: [],
                };
            }

            if (compilation.exitCode !== 0) {
                return {
                    status: "COMPILATION_ERROR",
                    stdout: compilation.stdout,
                    stderr: compilation.stderr,
                    exitCode: compilation.exitCode,
                    results: [],
                };
            }
        }

        const results = [];

        for (let index = 0; index < testCases.length; index++) {
            const testCase = testCases[index];

            const execution = await runProcess(
                "docker",
                ["exec", "-i", containerId, ...runCommand],
                {
                    timeoutMs: EXECUTION_TIMEOUT_MS,
                    input: testCase.input || "",
                    onTimeout: () => killContainer(containerId),
                    onOutputLimit: () => killContainer(containerId),
                }
            );

            const testResult = {
                testCaseId: testCase.id,
                testCaseIndex: index,
                stdout: execution.stdout,
                stderr: execution.stderr,
                exitCode: execution.exitCode,
            };

            if (execution.outputLimitExceeded) {
                const result = {
                    ...testResult,
                    status: "OUTPUT_LIMIT",
                };

                results.push(result);
                await onTestCaseResult?.(result);

                return {
                    status: "OUTPUT_LIMIT",
                    results,
                };
            }

            if (execution.timedOut) {
                const result = {
                    ...testResult,
                    status: "TIME_LIMIT",
                };

                results.push(result);
                await onTestCaseResult?.(result);

                return {
                    status: "TIME_LIMIT",
                    results,
                };
            }

            if (await inspectMemoryLimit(containerId)) {
                const result = {
                    ...testResult,
                    status: "MEMORY_LIMIT",
                };

                results.push(result);
                await onTestCaseResult?.(result);

                return {
                    status: "MEMORY_LIMIT",
                    results,
                };
            }

            if (execution.exitCode !== 0) {
                const result = {
                    ...testResult,
                    status: "RUNTIME_ERROR",
                };

                results.push(result);
                await onTestCaseResult?.(result);

                return {
                    status: "RUNTIME_ERROR",
                    results,
                };
            }

            const result = {
                ...testResult,
                status: "EXECUTED",
            };

            results.push(result);

            // Judge immediately after each successful execution.
            // false means stop without executing the next case.
            const shouldContinue = await onTestCaseResult?.(result);

            if (shouldContinue === false) {
                return {
                    status: "STOPPED",
                    results,
                    stoppedEarly: true,
                };
            }
        }

        return {
            status: "COMPLETED",
            results,
        };
    } catch (error) {
        return {
            status: "RUNTIME_ERROR",
            results: [],
            stderr: error.message,
        };
    } finally {
        if (containerId) {
            try {
                await execFileAsync("docker", [
                    "rm",
                    "-f",
                    containerId,
                ]);
            } catch {
                // Do not replace the execution result with a cleanup error.
            }
        }
    }
};
