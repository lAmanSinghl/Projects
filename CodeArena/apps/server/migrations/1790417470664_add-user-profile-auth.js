export const up = (pgm) => {
    pgm.addColumns("users", {
        display_name: {
            type: "varchar(100)",
        },
        avatar_url: {
            type: "text",
        },
        bio: {
            type: "text",
        },
        role: {
            type: "varchar(20)",
            notNull: true,
            default: "USER",
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.alterColumn("users", "password_hash", {
        notNull: false,
    });
};

export const down = (pgm) => {
    pgm.alterColumn("users", "password_hash", {
        notNull: true,
    });

    pgm.dropColumns("users", [
        "display_name",
        "avatar_url",
        "bio",
        "role",
        "updated_at",
    ]);
};