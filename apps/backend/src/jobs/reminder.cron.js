import { prisma } from "../lib/prisma.js";
import { messageQueue } from "../workers/message.queue.js";
import { logError, logInfo } from "../lib/logger.js";

export function startReminderCron() {
  setInterval(async () => {
    const now = new Date();
    const nextThirty = new Date(now.getTime() + 30 * 60 * 1000);
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          reminderSent: false,
          completed: false,
          startsAt: { gte: now, lte: nextThirty }
        },
        include: { client: true }
      });

      for (const appointment of appointments) {
        if (!appointment.client?.whatsappNumber) continue;

        await messageQueue.add(
          "appointment-reminder",
          {
            userId: appointment.userId,
            clientId: appointment.clientId,
            appointmentId: appointment.id,
            phone: appointment.client.whatsappNumber,
            messageType: "appointment_reminder",
            message: `Olá ${appointment.client.name}, lembrete do compromisso \"${appointment.title}\" às ${appointment.startsAt.toISOString()}.`
          },
          { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
        );

        await prisma.appointment.update({ where: { id: appointment.id }, data: { reminderSent: true } });
      }

      const tasks = await prisma.task.findMany({
        where: {
          reminderSent: false,
          kind: "finance",
          dueDate: { gte: new Date(now.toDateString()), lte: new Date(`${now.toDateString()}T23:59:59.999Z`) }
        },
        include: { client: true }
      });

      for (const task of tasks) {
        if (!task.client?.whatsappNumber) continue;
        await messageQueue.add(
          "task-reminder",
          {
            userId: task.userId,
            clientId: task.clientId,
            taskId: task.id,
            phone: task.client.whatsappNumber,
            messageType: "finance_reminder",
            message: `Você tem uma conta para pagar hoje: ${task.title}`
          },
          { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
        );
        await prisma.task.update({ where: { id: task.id }, data: { reminderSent: true } });
      }

      logInfo("cron.reminders", { appointments: appointments.length, tasks: tasks.length });
    } catch (error) {
      logError("cron.reminders", error);
    }
  }, 60 * 1000);
}
