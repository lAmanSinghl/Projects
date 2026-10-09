export const judgeOutput = (actualOutput, expectedOutput) => {
    const actual = actualOutput.trim();
    const expected = expectedOutput.trim();

    if (actual === expected) {
        return "ACCEPTED";
    }

    return "WRONG_ANSWER";
};
