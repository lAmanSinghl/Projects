
const generatePythonProgram = ({
    sourceCode,
    functionName,
    functionConfig,
}) => {
    if (
        typeof functionName !== "string" ||
        !/^[A-Za-z_][A-Za-z0-9_]*$/.test(functionName)
    ) {
        throw new Error("Invalid Python function name");
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

import json as __codearena_json
import sys as __codearena_sys

try:
    __codearena_args = __codearena_json.load(__codearena_sys.stdin)

    if not isinstance(__codearena_args, list):
        raise ValueError("Test input must be a JSON array of arguments")

    if len(__codearena_args) != ${functionConfig.parameters.length}:
        raise ValueError("Incorrect number of function arguments")

    __codearena_result = ${functionName}(*__codearena_args)

    __codearena_output = __codearena_json.dumps(
        __codearena_result,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False
    )

    __codearena_sys.stdout.write(__codearena_output)

except Exception as __codearena_error:
    print(str(__codearena_error), file=__codearena_sys.stderr)
    __codearena_sys.exit(1)
`;
};

const pythonStrategy = {
    name: "python",

    image: "python:3.13-alpine",

    sourceFile: "/tmp/codearena/main.py",

    compile: null,

    run: [
        "python",
        "/tmp/codearena/main.py",
    ],

    generateProgram: generatePythonProgram,
};

export default pythonStrategy;
