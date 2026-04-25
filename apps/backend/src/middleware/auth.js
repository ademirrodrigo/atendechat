export async function authGuard(request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ message: "Não autorizado" });
  }
}
