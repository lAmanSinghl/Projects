
const cppTypes = {
    number: "int",
    "number[]": "std::vector<int>",
};

const getCppType = (type) => {
    const cppType = cppTypes[type];

    if (!cppType) {
        throw new Error(`Unsupported C++ parameter type: ${type}`);
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

    const parameters = functionConfig.parameters;

    const argumentDeclarations = parameters
        .map((parameter, index) => {
            if (
                !parameter ||
                typeof parameter.name !== "string" ||
                !/^[A-Za-z_][A-Za-z0-9_]*$/.test(parameter.name)
            ) {
                throw new Error(
                    `Invalid C++ parameter name at index ${index}`
                );
            }

            const cppType = getCppType(parameter.type);

            return `
    ${cppType} ${parameter.name} =
        __codearena_args.at(${index}).get<${cppType}>();
`;
        })
        .join("\n");

    const argumentNames = parameters
        .map((parameter) => parameter.name)
        .join(", ");

    const returnType = getCppType(functionConfig.returnType);

    return `
#include <bits/stdc++.h>
#include <nlohmann/json.hpp>

using namespace std;
using nlohmann::json;

${sourceCode}

int main() {
    try {
        json __codearena_args;
        cin >> __codearena_args;

        if (!__codearena_args.is_array()) {
            throw runtime_error(
                "Test input must be a JSON array of arguments"
            );
        }

        if (__codearena_args.size() != ${parameters.length}) {
            throw runtime_error(
                "Incorrect number of function arguments"
            );
        }

        ${argumentDeclarations}

        Solution __codearena_solution;

        ${returnType} __codearena_result =
            __codearena_solution.${functionName}(${argumentNames});

        json __codearena_output = __codearena_result;
        cout << __codearena_output.dump();

        return 0;
    } catch (const exception& __codearena_error) {
        cerr << __codearena_error.what() << endl;
        return 1;
    }
}
`;
};

const cppStrategy = {
    name: "cpp",

    image: "codearena-cpp:14",

    sourceFile: "/tmp/codearena/main.cpp",

    compile: [
        "g++",
        "/tmp/codearena/main.cpp",
        "-O2",
        "-std=c++17",
        "-o",
        "/tmp/program",
    ],

    run: [
        "/tmp/program",
    ],

    generateProgram: generateCppProgram,
};

export default cppStrategy;
