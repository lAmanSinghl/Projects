export const up = (pgm) => {
    pgm.createTable("users", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        username: {
            type: "varchar(50)",
            notNull: true,
            unique: true,
        },
        email: {
            type: "varchar(255)",
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: "text",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.createTable("problems", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        title: {
            type: "varchar(200)",
            notNull: true,
        },
        slug: {
            type: "varchar(200)",
            notNull: true,
            unique: true,
        },
        description: {
            type: "text",
            notNull: true,
        },
        difficulty: {
            type: "varchar(20)",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.createTable("test_cases", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        problem_id: {
            type: "bigint",
            notNull: true,
            references: "problems",
        },
        input: {
            type: "text",
            notNull: true,
        },
        expected_output: {
            type: "text",
            notNull: true,
        },
        is_hidden: {
            type: "boolean",
            notNull: true,
            default: true,
        },
    });

    pgm.createTable("submissions", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },
        user_id: {
            type: "bigint",
            notNull: true,
            references: "users",
        },
        problem_id: {
            type: "bigint",
            notNull: true,
            references: "problems",
        },
        source_code: {
            type: "text",
            notNull: true,
        },
        language: {
            type: "varchar(30)",
            notNull: true,
        },
        status: {
            type: "varchar(30)",
            notNull: true,
            default: "QUEUED",
        },
        verdict: {
            type: "varchar(40)",
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp"),
        },
    });
};

export const down = (pgm) => {
    pgm.dropTable("submissions");
    pgm.dropTable("test_cases");
    pgm.dropTable("problems");
    pgm.dropTable("users");
};