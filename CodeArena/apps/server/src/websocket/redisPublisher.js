import Redis from "ioredis";

const publisher = new Redis({
    host: "localhost",
    port: 6379
});

export const publishSubmissionEvent = async (event) => {
    await publisher.publish(
        "submission-events",
        JSON.stringify(event)
    );
};