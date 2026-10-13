
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
