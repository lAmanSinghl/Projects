
export const up = (pgm) => {
    pgm.dropColumns("problems", [
        "function_name",
        "function_config",
    ]);
};

export const down = (pgm) => {
    pgm.addColumns("problems", {
        function_name: {
            type: "varchar(100)",
            notNull: false,
        },
        function_config: {
            type: "jsonb",
            notNull: true,
            default: pgm.func("'{}'::jsonb"),
        },
    });
};
