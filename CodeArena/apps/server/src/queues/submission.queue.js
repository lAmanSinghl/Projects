
import { Queue } from "bullmq";

const submissionQueue = new Queue("submissions", {
    connection: {
        host: "localhost",
        port: 6379,
    },

    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
});

export default submissionQueue;
