import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";

import { env } from "./lib/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { clientsRoutes } from "./routes/clients.routes.js";
import { appointmentsRoutes } from "./routes/appointments.routes.js";
import { tasksRoutes } from "./routes/tasks.routes.js";
import { whatsappRoutes } from "./routes/whatsapp.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";

export function buildApp() {
  const app = Fastify();

  app.register(cors, { origin: env.FRONTEND_URL });
  app.register(sensible);
  app.register(jwt, { secret: env.JWT_SECRET });

  app.get("/health", async () => ({ ok: true }));

  app.register(authRoutes, { prefix: "/auth" });
  app.register(clientsRoutes, { prefix: "/clients" });
  app.register(appointmentsRoutes, { prefix: "/appointments" });
  app.register(tasksRoutes, { prefix: "/tasks" });
  app.register(whatsappRoutes, { prefix: "/whatsapp" });
  app.register(dashboardRoutes, { prefix: "/dashboard" });
  app.register(aiRoutes, { prefix: "/ai" });

  return app;
}
