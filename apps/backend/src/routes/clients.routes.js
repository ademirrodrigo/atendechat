import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/auth.js";

const createSchema = z.object({
  name: z.string().min(2),
  whatsappNumber: z.string().min(8)
});

export async function clientsRoutes(app) {
  app.addHook("onRequest", authGuard);

  app.get("/", async request => {
    return prisma.client.findMany({ where: { userId: request.user.sub }, orderBy: { createdAt: "desc" } });
  });

  app.post("/", async request => {
    const body = createSchema.parse(request.body);
    return prisma.client.create({
      data: {
        userId: request.user.sub,
        name: body.name.trim(),
        whatsappNumber: body.whatsappNumber.replace(/\s+/g, "")
      }
    });
  });

  app.put("/:id", async request => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = createSchema.partial().parse(request.body);
    await prisma.client.updateMany({
      where: { id: params.id, userId: request.user.sub },
      data: body
    });
    return prisma.client.findUnique({ where: { id: params.id } });
  });

  app.delete("/:id", async request => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const deleted = await prisma.client.deleteMany({ where: { id: params.id, userId: request.user.sub } });
    return { ok: deleted.count > 0 };
  });
}
