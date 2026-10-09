import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const COMPILE_TIMEOUT_MS = 10000;
const EXECUTION_TIMEOUT_MS = 5000;
const MAX_OUTPUT_BYTES = 1024 * 1024; // 1 MB


export const runSandbox = async ({
    image,
    sourceDir,
    compileCommand,
    runCommand,
    testCases = []
}) => {
    let containerId;

    try {
        // --------------------------------------------------
        // 1. CREATE CONTAINER
        // --------------------------------------------------

        const { stdout: createOutput } = await execFileAsync("docker", [
            "create",
            "-i",

            // Resource limits
            "--memory=128m",
            "--cpus=0.5",
            "--pids-limit=64",

            // Security
            "--cap-drop=ALL",
            "--security-opt=no-new-privileges",

            // No internet access
            "--network=none",

            // Mount submitted source code
            "--mount",
            `type=bind,source=${sourceDir},target=/tmp/codearena,readonly`,

            image,

            // Keep container alive
            "sleep",
            "300"
        ]);

        containerId = createOutput.trim();


        // --------------------------------------------------
        // 2. START CONTAINER
        // --------------------------------------------------

        await execFileAsync("docker", [
            "start",
            containerId
        ]);


        // --------------------------------------------------
        // 3. COMPILE ONCE
        // --------------------------------------------------

        if (compileCommand) {
            const compileProcess = spawn(
                "docker",
                [
                    "exec",
                    containerId,
                    ...compileCommand
                ]
            );

            let compileStdout = "";
            let compileStderr = "";

            compileProcess.stdout.on("data", (data) => {
                compileStdout += data.toString();
            });

            compileProcess.stderr.on("data", (data) => {
                compileStderr += data.toString();
            });

            let compilationTimedOut = false;

            const compileTimeout = setTimeout(async () => {
                compilationTimedOut = true;

                compileProcess.kill("SIGTERM");

                try {
                    await execFileAsync("docker", [
                        "kill",
                        containerId
                    ]);
                } catch {}
            }, COMPILE_TIMEOUT_MS);


            const compileExitCode = await new Promise(
                (resolve, reject) => {

                    compileProcess.on(
                        "close",
                        resolve
                    );

                    compileProcess.on(
                        "error",
                        reject
                    );
                }
            );

            clearTimeout(compileTimeout);


            // Compilation timeout
            if (compilationTimedOut) {
                return {
                    status: "COMPILATION_TIMEOUT",
                    stdout: compileStdout,
                    stderr: compileStderr
                };
            }


            // Compilation error
            if (compileExitCode !== 0) {
                return {
                    status: "COMPILATION_ERROR",
                    stdout: compileStdout,
                    stderr: compileStderr,
                    exitCode: compileExitCode
                };
            }
        }


        // --------------------------------------------------
        // 4. RUN TEST CASES
        // --------------------------------------------------

        const results = [];

        for (const testCase of testCases) {

            const child = spawn(
                "docker",
                [
                    "exec",
                    "-i",
                    containerId,
                    ...runCommand
                ]
            );


            // ----------------------------------------------
            // Output tracking
            // ----------------------------------------------

            const stdoutChunks = [];
            const stderrChunks = [];

            let stdoutBytes = 0;
            let stderrBytes = 0;

            let outputLimitExceeded = false;
            let timedOut = false;
            let terminating = false;


            // ----------------------------------------------
            // Kill everything related to this execution
            // ----------------------------------------------

            const terminateExecution = async () => {

                if (terminating) {
                    return;
                }

                terminating = true;

                try {
                    child.kill("SIGTERM");
                } catch {}

                try {
                    await execFileAsync("docker", [
                        "kill",
                        containerId
                    ]);
                } catch {}
            };


            // ----------------------------------------------
            // STDOUT
            // ----------------------------------------------

            child.stdout.on("data", (data) => {

                if (outputLimitExceeded) {
                    return;
                }

                const chunkSize = data.byteLength;

                stdoutBytes += chunkSize;


                // Output exceeded 1 MB
                if (stdoutBytes > MAX_OUTPUT_BYTES) {

                    outputLimitExceeded = true;

                    // Don't keep accumulating unlimited output.
                    stdoutChunks.length = 0;

                    terminateExecution();

                    return;
                }


                stdoutChunks.push(data);
            });


            // ----------------------------------------------
            // STDERR
            // ----------------------------------------------

            child.stderr.on("data", (data) => {

                if (outputLimitExceeded) {
                    return;
                }

                const chunkSize = data.byteLength;

                stderrBytes += chunkSize;


                // Output exceeded 1 MB
                if (stderrBytes > MAX_OUTPUT_BYTES) {

                    outputLimitExceeded = true;

                    stderrChunks.length = 0;

                    terminateExecution();

                    return;
                }


                stderrChunks.push(data);
            });


            // ----------------------------------------------
            // SEND INPUT
            // ----------------------------------------------

            child.stdin.write(testCase.input || "");
            child.stdin.end();


            // ----------------------------------------------
            // EXECUTION TIMEOUT
            // ----------------------------------------------

            const timeout = setTimeout(() => {

                if (outputLimitExceeded) {
                    return;
                }

                timedOut = true;

                terminateExecution();

            }, EXECUTION_TIMEOUT_MS);


            // ----------------------------------------------
            // WAIT FOR PROCESS
            // ----------------------------------------------

            const exitCode = await new Promise(
                (resolve, reject) => {

                    child.on(
                        "close",
                        resolve
                    );

                    child.on(
                        "error",
                        reject
                    );
                }
            );


            clearTimeout(timeout);


            // ----------------------------------------------
            // OUTPUT LIMIT
            // ----------------------------------------------

            if (outputLimitExceeded) {

                return {
                    status: "OUTPUT_LIMIT",
                    results
                };
            }


            // ----------------------------------------------
            // TIME LIMIT
            // ----------------------------------------------

            if (timedOut) {

                return {
                    status: "TIME_LIMIT",
                    results
                };
            }


            // ----------------------------------------------
            // MEMORY LIMIT
            // ----------------------------------------------

            const {
                stdout: oomResult
            } = await execFileAsync(
                "docker",
                [
                    "inspect",
                    "--format={{.State.OOMKilled}}",
                    containerId
                ]
            );


            if (oomResult.trim() === "true") {

                return {
                    status: "MEMORY_LIMIT",
                    results
                };
            }


            // ----------------------------------------------
            // RUNTIME ERROR
            // ----------------------------------------------

            const stdout = Buffer
                .concat(stdoutChunks)
                .toString("utf8");

            const stderr = Buffer
                .concat(stderrChunks)
                .toString("utf8");


            if (exitCode !== 0) {

                return {
                    status: "RUNTIME_ERROR",
                    results,
                    stdout,
                    stderr,
                    exitCode
                };
            }


            // ----------------------------------------------
            // SUCCESSFUL TEST CASE
            // ----------------------------------------------

            results.push({
                stdout,
                stderr
            });
        }


        // --------------------------------------------------
        // 5. ALL TEST CASES COMPLETED
        // --------------------------------------------------

        return {
            status: "COMPLETED",
            results
        };


    } catch (error) {

        return {
            status: "RUNTIME_ERROR",
            stdout: error.stdout || "",
            stderr: error.stderr || "",
            exitCode: error.code
        };


    } finally {

        // --------------------------------------------------
        // 6. ALWAYS DELETE CONTAINER
        // --------------------------------------------------

        if (containerId) {

            try {

                await execFileAsync(
                    "docker",
                    [
                        "rm",
                        "-f",
                        containerId
                    ]
                );

            } catch {}
        }
    }
};