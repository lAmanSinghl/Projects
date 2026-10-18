
import { Queue } from "bullmq";

const queue = new Queue("submissions", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

try {
  const job = await queue.getJob("submission-151");

  if (job) {
    console.log("Target job ID:", job.id);
    console.log("Target state:", await job.getState());
    console.log("Attempts made:", job.attemptsMade);
    console.log("Job data:", job.data);
  } else {
    console.log("Target job not found");
  }

  const states = [
    "waiting",
    "active",
    "delayed",
    "completed",
    "failed",
  ];

  for (const state of states) {
    const jobs = await queue.getJobs([state], 0, 500);

    const matches = jobs.filter(
      (item) =>
        String(item.data?.submissionId) === "151"
    );

    for (const item of matches) {
      console.log({
        id: item.id,
        state: await item.getState(),
        attemptsMade: item.attemptsMade,
        data: item.data,
      });
    }
  }
} catch (error) {
  console.error("Queue inspection failed:", error);
} finally {
  await queue.close();
}
