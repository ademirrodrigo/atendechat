import { z } from "zod";
import { authGuard } from "../middleware/auth.js";
import { checkStatus, createSession, getQRCode, sendMessage } from "../modules/whatsapp.service.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

export async function whatsappRoutes(app) {
  app.addHook("onRequest", authGuard);

  app.post("/connect", async request => {
    const userId = request.user.sub;
    await createSession(env.EVOLUTION_INSTANCE);
    const qrData = await getQRCode(env.EVOLUTION_INSTANCE);

    await prisma.whatsappSession.upsert({
      where: { userId },
      update: {
        sessionName: env.EVOLUTION_INSTANCE,
        status: "connecting",
        qrCode: qrData.base64 || qrData.qrcode || null
      },
      create: {
        userId,
        sessionName: env.EVOLUTION_INSTANCE,
        status: "connecting",
        qrCode: qrData.base64 || qrData.qrcode || null
      }
    });

    return { qrCode: qrData.base64 || qrData.qrcode || null };
  });

  app.get("/status", async request => {
    const userId = request.user.sub;
    const status = await checkStatus(env.EVOLUTION_INSTANCE);

    await prisma.whatsappSession.upsert({
      where: { userId },
      update: { status: status.instance?.state || "unknown" },
      create: { userId, sessionName: env.EVOLUTION_INSTANCE, status: status.instance?.state || "unknown" }
    });

    return status;
  });

  app.post("/test-send", async request => {
    const body = z.object({ phone: z.string().min(8), message: z.string().min(1) }).parse(request.body);
    const data = await sendMessage({ phone: body.phone, message: body.message });
    return data;
  });
}
