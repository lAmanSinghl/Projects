
export const up = (pgm) => {
    pgm.addColumn("problems", {
        language_templates: {
            type: "jsonb",
            notNull: true,
            default: pgm.func("'{}'::jsonb"),
        },
    });
};

export const down = (pgm) => {
    pgm.dropColumn("problems", "language_templates");
};