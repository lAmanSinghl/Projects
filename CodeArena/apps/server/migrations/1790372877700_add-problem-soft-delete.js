export const up = (pgm) => {
    pgm.addColumn("problems", {
        deleted_at: {
            type: "timestamp",
        },
    });
};

export const down = (pgm) => {
    pgm.dropColumn("problems", "deleted_at");
};