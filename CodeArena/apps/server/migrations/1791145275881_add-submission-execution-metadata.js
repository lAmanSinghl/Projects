export const up = (pgm) => {
    pgm.addColumns("submissions", {
        started_at: {
            type: "timestamp",
            notNull: false
        },

        completed_at: {
            type: "timestamp",
            notNull: false
        },

        execution_time_ms: {
            type: "integer",
            notNull: false
        },

        memory_used_bytes: {
            type: "bigint",
            notNull: false
        }
    });
};

export const down = (pgm) => {
    pgm.dropColumns("submissions", [
        "started_at",
        "completed_at",
        "execution_time_ms",
        "memory_used_bytes"
    ]);
};