import { buildApp } from "./app.js";
import { env } from "./lib/env.js";
import { startReminderCron } from "./jobs/reminder.cron.js";
import { startMessageWorker } from "./workers/message.queue.js";
import { logInfo } from "./lib/logger.js";

const app = buildApp();

const worker = startMessageWorker();
startReminderCron();

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  logInfo("server", { message: `Backend rodando na porta ${env.PORT}` });
});

process.on("SIGTERM", async () => {
  await worker.close();
  await app.close();
  process.exit(0);
});
