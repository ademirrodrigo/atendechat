import { authGuard } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export async function dashboardRoutes(app) {
  app.addHook("onRequest", authGuard);

  app.get("/summary", async request => {
    const userId = request.user.sub;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [appointmentsToday, pendingTasks, clients] = await Promise.all([
      prisma.appointment.count({ where: { userId, startsAt: { gte: start, lte: end } } }),
      prisma.task.count({ where: { userId, reminderSent: false } }),
      prisma.client.count({ where: { userId } })
    ]);

    return { appointmentsToday, pendingTasks, clients };
  });
}
