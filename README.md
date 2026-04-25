# AtendeChat MVP - Secretária Virtual com IA + WhatsApp

Implementação MVP funcional baseada no blueprint em `docs/saas-secretaria-virtual.md`.

## Estrutura

- `apps/backend`: API Fastify + Prisma + BullMQ + Scheduler
- `apps/frontend`: Next.js + Tailwind (telas essenciais)
- `packages/db`: reexport do client Prisma
- `packages/ai`: reexport do parser IA MVP
- `packages/whatsapp`: reexport do cliente Evolution API
- `docker/docker-compose.yml`: stack local e VPS

## Subir com Docker

```bash
cd docker
docker compose up --build
```

## Fluxo MVP para demo

1. Acesse `http://localhost:3000/login`.
2. Cadastre usuário e faça login.
3. Crie cliente com WhatsApp.
4. Crie compromisso em até 30 min.
5. Conecte WhatsApp na tela `whatsapp` via QR Code.
6. Aguarde o cron (60s) para envio automático do lembrete.

## Variáveis críticas

Backend (`apps/backend/.env.example`):
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE`
- `OLLAMA_URL`

Frontend (`apps/frontend/.env.example`):
- `NEXT_PUBLIC_API_URL`
