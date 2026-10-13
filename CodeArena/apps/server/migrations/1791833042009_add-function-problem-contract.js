
export const up = (pgm) => {
    pgm.addColumn("problems", {
        function_name: {
            type: "varchar(100)",
        },

        function_config: {
            type: "jsonb",
            notNull: true,
            default: pgm.func("'{}'::jsonb"),
        },

        starter_code: {
            type: "jsonb",
            notNull: true,
            default: pgm.func("'{}'::jsonb"),
        },
    });
};

export const down = (pgm) => {
    pgm.dropColumns("problems", [
        "function_name",
        "function_config",
        "starter_code",
    ]);
};
