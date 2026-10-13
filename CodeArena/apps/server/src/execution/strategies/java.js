
const generateJavaProgram = ({
    sourceCode,
    functionName,
    functionConfig,
}) => {
    if (
        typeof functionName !== "string" ||
        !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(functionName)
    ) {
        throw new Error("Invalid Java function name");
    }

    if (
        !functionConfig ||
        !Array.isArray(functionConfig.parameters) ||
        typeof functionConfig.returnType !== "string"
    ) {
        throw new Error("Invalid function configuration");
    }

    const javaTypes = {
        number: "int",
        "number[]": "int[]",
    };

    const getJavaType = (type) => {
        const javaType = javaTypes[type];

        if (!javaType) {
            throw new Error(`Unsupported Java function type: ${type}`);
        }

        return javaType;
    };

    const parameters = functionConfig.parameters;

    const argumentDeclarations = parameters
        .map((parameter, index) => {
            if (
                !parameter ||
                typeof parameter.name !== "string" ||
                !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(parameter.name)
            ) {
                throw new Error(
                    `Invalid Java parameter name at index ${index}`
                );
            }

            const javaType = getJavaType(parameter.type);

            if (javaType === "int[]") {
                return `
            int[] ${parameter.name} =
                __mapper.convertValue(
                    __args.get(${index}),
                    int[].class
                );
`;
            }

            return `
            int ${parameter.name} =
                __mapper.convertValue(
                    __args.get(${index}),
                    Integer.class
                );
`;
        })
        .join("\n");

    const argumentNames = parameters
        .map((parameter) => parameter.name)
        .join(", ");

    const returnType = getJavaType(functionConfig.returnType);

    return `
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;

${sourceCode}

public class Main {
    public static void main(String[] args) {
        ObjectMapper __mapper = new ObjectMapper();

        try {
            JsonNode __root = __mapper.readTree(System.in);

            if (__root == null || !__root.isArray()) {
                throw new IllegalArgumentException(
                    "Test input must be a JSON array of arguments"
                );
            }

            if (__root.size() != ${parameters.length}) {
                throw new IllegalArgumentException(
                    "Incorrect number of function arguments"
                );
            }

            java.util.List<JsonNode> __args =
                new java.util.ArrayList<>();

            __root.forEach(__args::add);

            ${argumentDeclarations}

            Solution __solution = new Solution();

            ${returnType} __result =
                __solution.${functionName}(${argumentNames});

            System.out.print(__mapper.writeValueAsString(__result));
        } catch (Exception __error) {
            System.err.println(__error.getMessage());
            System.exit(1);
        }
    }
}
`;
};

const javaStrategy = {
    name: "java",

    image: "codearena-java:21",

    sourceFile: "/tmp/codearena/Main.java",

    compile: [
        "javac",
        "-cp",
        "/opt/codearena/lib/*",
        "-d",
        "/tmp",
        "/tmp/codearena/Main.java",
    ],

    run: [
        "java",
        "-cp",
        "/tmp:/opt/codearena/lib/*",
        "Main",
    ],

    generateProgram: generateJavaProgram,
};

export default javaStrategy;
