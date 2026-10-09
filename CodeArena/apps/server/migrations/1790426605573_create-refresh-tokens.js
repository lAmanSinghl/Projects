export const up = (pgm) => {
    pgm.createTable("refresh_tokens", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        user_id: {
            type: "bigint",
            notNull: true,
            references: "users",
        },
        token_hash: {
            type: "text",
            notNull: true,
            unique: true,
        },
        family_id: {
            type: "uuid",
            notNull: true,
        },
        expires_at: {
            type: "timestamp",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        revoked_at: {
            type: "timestamp",
        },
    });

    pgm.createIndex("refresh_tokens", "user_id");
};

export const down = (pgm) => {
    pgm.dropTable("refresh_tokens");
};