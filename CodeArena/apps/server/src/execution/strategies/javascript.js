
const generateJavaScriptProgram = ({
    sourceCode,
    functionName,
    functionConfig,
}) => {
    if (
        typeof functionName !== "string" ||
        !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(functionName)
    ) {
        throw new Error("Invalid JavaScript function name");
    }

    if (
        !functionConfig ||
        !Array.isArray(functionConfig.parameters) ||
        typeof functionConfig.returnType !== "string"
    ) {
        throw new Error("Invalid function configuration");
    }

    return `
${sourceCode}

const __codearena_fs = require("node:fs");

try {
    const __codearena_args = JSON.parse(
        __codearena_fs.readFileSync(0, "utf8")
    );

    if (!Array.isArray(__codearena_args)) {
        throw new Error("Test input must be a JSON array of arguments");
    }

    if (__codearena_args.length !== ${functionConfig.parameters.length}) {
        throw new Error("Incorrect number of function arguments");
    }

    const __codearena_result = ${functionName}(
        ...__codearena_args
    );

    if (__codearena_result instanceof Promise) {
        throw new Error("Async functions are not supported yet");
    }

    const __codearena_output = JSON.stringify(__codearena_result);

    if (__codearena_output === undefined) {
        throw new Error("Function returned a non-JSON-serializable value");
    }

    process.stdout.write(__codearena_output);
} catch (__codearena_error) {
    console.error(
        __codearena_error instanceof Error
            ? __codearena_error.message
            : String(__codearena_error)
    );

    process.exitCode = 1;
}
`;
};

const javascriptStrategy = {
    name: "javascript",

    image: "node:22-alpine",

    sourceFile: "/tmp/codearena/main.js",

    compile: null,

    run: [
        "node",
        "/tmp/codearena/main.js",
    ],

    generateProgram: generateJavaScriptProgram,
};

export default javascriptStrategy;
