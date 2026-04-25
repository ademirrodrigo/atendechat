import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/auth.js";

const createSchema = z.object({
  title: z.string().min(2),
  clientId: z.string().uuid(),
  startsAt: z.string().datetime()
});

export async function appointmentsRoutes(app) {
  app.addHook("onRequest", authGuard);

  app.get("/", async request => {
    return prisma.appointment.findMany({
      where: { userId: request.user.sub },
      include: { client: true },
      orderBy: { startsAt: "asc" }
    });
  });

  app.post("/", async request => {
    const body = createSchema.parse(request.body);
    return prisma.appointment.create({
      data: {
        userId: request.user.sub,
        clientId: body.clientId,
        title: body.title.trim(),
        startsAt: new Date(body.startsAt)
      }
    });
  });

  app.patch("/:id/complete", async request => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    return prisma.appointment.update({
      where: { id: params.id },
      data: { completed: true }
    });
  });
}
