export const up = (pgm) => {
    pgm.createTable("outbox_events", {
        id: {
            type: "bigserial",
            primaryKey: true
        },

        event_type: {
            type: "varchar(100)",
            notNull: true
        },

        aggregate_id: {
            type: "bigint",
            notNull: true
        },

        payload: {
            type: "jsonb",
            notNull: true
        },

        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },

        published_at: {
            type: "timestamp"
        }
    });

    pgm.createIndex(
        "outbox_events",
        "created_at",
        {
            name: "idx_outbox_events_unpublished",
            where: "published_at IS NULL"
        }
    );
};

export const down = (pgm) => {
    pgm.dropTable("outbox_events");
};