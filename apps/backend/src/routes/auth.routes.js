import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function authRoutes(app) {
  app.post("/register", async (request, reply) => {
    const payload = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) return reply.code(409).send({ message: "Email já cadastrado" });

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: { name: payload.name.trim(), email: payload.email.toLowerCase(), passwordHash }
    });

    return { id: user.id, email: user.email };
  });

  app.post("/login", async (request, reply) => {
    const payload = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (!user) return reply.code(401).send({ message: "Credenciais inválidas" });

    const ok = await bcrypt.compare(payload.password, user.passwordHash);
    if (!ok) return reply.code(401).send({ message: "Credenciais inválidas" });

    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  });
}
