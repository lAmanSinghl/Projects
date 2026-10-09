import { publishOutboxEvents } from "./outbox.publisher.js";

const run = async () => {
    try {
        await publishOutboxEvents();
    } catch (error) {
        console.error("Outbox publisher error:", error);
    }
};

setInterval(run, 5000);

run();