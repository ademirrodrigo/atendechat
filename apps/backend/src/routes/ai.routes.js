import { z } from "zod";
import { authGuard } from "../middleware/auth.js";
import { parseUserInput } from "../modules/ai.service.js";
import { prisma } from "../lib/prisma.js";

export async function aiRoutes(app) {
  app.addHook("onRequest", authGuard);

  app.post("/parse", async request => {
    const { text } = z.object({ text: z.string().min(3) }).parse(request.body);
    const parsed = await parseUserInput(text);

    let client = await prisma.client.findFirst({ where: { userId: request.user.sub, name: parsed.client } });
    if (!client) {
      client = await prisma.client.create({
        data: { userId: request.user.sub, name: parsed.client, whatsappNumber: "5511999999999" }
      });
    }

    if (parsed.type === "task") {
      const task = await prisma.task.create({
        data: {
          userId: request.user.sub,
          clientId: client.id,
          title: parsed.title,
          dueDate: new Date(parsed.date),
          kind: "general"
        }
      });
      return { parsed, created: task };
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: request.user.sub,
        clientId: client.id,
        title: parsed.title,
        startsAt: new Date(parsed.date)
      }
    });

    return { parsed, created: appointment };
  });
}
