import Redis from "ioredis";

const subscriber = new Redis({
    host: "localhost",
    port: 6379
});

export const startRedisSubscriber = (onMessage) => {
    subscriber.subscribe("submission-events");

    subscriber.on("message", (channel, message) => {
        if (channel !== "submission-events") {
            return;
        }

        const event = JSON.parse(message);

        onMessage(event);
    });
};