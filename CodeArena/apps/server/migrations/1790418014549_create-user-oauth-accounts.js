export const up = (pgm) => {
    pgm.createTable("user_oauth_accounts", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        user_id: {
            type: "bigint",
            notNull: true,
            references: "users",
        },
        provider: {
            type: "varchar(20)",
            notNull: true,
        },
        provider_user_id: {
            type: "varchar(255)",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.addConstraint("user_oauth_accounts", "unique_provider_user", {
        unique: ["provider", "provider_user_id"],
    });
};

export const down = (pgm) => {
    pgm.dropTable("user_oauth_accounts");
};