export const up = (pgm) => {
    pgm.addColumns("submissions", {
        failed_test_case_id: {
            type: "bigint",
            default: null,
        },
        actual_output: {
            type: "jsonb",
            default: null,
        },
        passed_test_cases: {
            type: "integer",
            notNull: true,
            default: 0,
        },
        total_test_cases: {
            type: "integer",
            notNull: true,
            default: 0,
        },
    });
};

export const down = (pgm) => {
    pgm.dropColumns("submissions", [
        "failed_test_case_id",
        "actual_output",
        "passed_test_cases",
        "total_test_cases",
    ]);
};