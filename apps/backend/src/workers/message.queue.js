import { Queue, Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { sendMessage } from "../modules/whatsapp.service.js";
import { prisma } from "../lib/prisma.js";
import { logError, logInfo } from "../lib/logger.js";

export const messageQueue = new Queue("message-reminders", { connection: redis });

export function startMessageWorker() {
  const worker = new Worker(
    "message-reminders",
    async job => {
      const result = await sendMessage(job.data);
      await prisma.messageLog.create({
        data: {
          userId: job.data.userId,
          clientId: job.data.clientId,
          appointmentId: job.data.appointmentId || null,
          taskId: job.data.taskId || null,
          phone: job.data.phone,
          messageType: job.data.messageType,
          status: "sent",
          payload: job.data
        }
      });
      logInfo("queue.sent", { jobId: job.id, phone: job.data.phone });
      return result;
    },
    { connection: redis }
  );

  worker.on("failed", async (job, error) => {
    logError("queue.failed", error, { jobId: job?.id });
    if (!job) return;
    await prisma.messageLog.create({
      data: {
        userId: job.data.userId,
        clientId: job.data.clientId,
        appointmentId: job.data.appointmentId || null,
        taskId: job.data.taskId || null,
        phone: job.data.phone,
        messageType: job.data.messageType,
        status: "failed",
        payload: job.data,
        error: error.message
      }
    });
  });

  return worker;
}
