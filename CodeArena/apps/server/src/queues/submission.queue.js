import { Queue } from "bullmq";

const submissionQueue = new Queue("submissions", {
    connection: {
        host: "localhost",
        port: 6379
    }
});

export default submissionQueue;