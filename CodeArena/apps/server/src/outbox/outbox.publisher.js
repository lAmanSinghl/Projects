import pool from "../db.js";
import submissionQueue from "../queues/submission.queue.js";

export const publishOutboxEvents = async () => {
    const result = await pool.query(
        `SELECT id, event_type, aggregate_id, payload
         FROM outbox_events
         WHERE published_at IS NULL
         ORDER BY id
         LIMIT 100`
    );

    for (const event of result.rows) {
        if (event.event_type !== "SUBMISSION_CREATED") {
            continue;
        }

        await submissionQueue.add(
            "submission",
            event.payload,
            {
                jobId: `submission-${event.aggregate_id}`
            }
        );

        await pool.query(
            `UPDATE outbox_events
             SET published_at = CURRENT_TIMESTAMP
             WHERE id = $1
             AND published_at IS NULL`,
            [event.id]
        );
    }
};