import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/auth.js";

const createSchema = z.object({
  title: z.string().min(2),
  dueDate: z.string().datetime().optional(),
  kind: z.enum(["general", "finance"]).default("general"),
  clientId: z.string().uuid().optional()
});

export async function tasksRoutes(app) {
  app.addHook("onRequest", authGuard);

  app.get("/", async request => {
    return prisma.task.findMany({ where: { userId: request.user.sub }, orderBy: { createdAt: "desc" } });
  });

  app.post("/", async request => {
    const body = createSchema.parse(request.body);
    return prisma.task.create({
      data: {
        userId: request.user.sub,
        clientId: body.clientId,
        title: body.title.trim(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        kind: body.kind
      }
    });
  });
}
