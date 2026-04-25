# SaaS Secretária Virtual com IA + WhatsApp (Evolution API)

## 1) Visão do produto

Este documento detalha a implementação de um SaaS para automação de atendimento e agenda com IA, integrado ao WhatsApp via Evolution API, com execução local (Windows com Docker Desktop) e em produção (VPS Linux).

Objetivos principais:
- Automatizar agendamentos e lembretes.
- Reduzir faltas e atrasos em compromissos.
- Diminuir trabalho operacional de atendimento.
- Permitir operação multicliente (modelo SaaS).

## 2) Público-alvo

- Advogados
- Contadores
- Dentistas
- Médicos
- Pequenos negócios com agenda recorrente

## 3) Stack técnica

### Backend
- Node.js + Fastify
- PostgreSQL
- Prisma ORM
- JWT para autenticação

### Frontend
- Next.js
- Tailwind CSS

### IA
- Ollama (padrão local)
- Gemini (fallback)
- DeepSeek (opcional)

### Mensageria e automação
- Evolution API (WhatsApp self-hosted)
- BullMQ + Redis (fila de envio e retries)
- Cron scheduler (checagem a cada 60 segundos)

### Infraestrutura
- Docker Compose (ambiente completo)
- Nginx (reverse proxy)
- VPS Linux (produção)

## 4) Arquitetura de serviços (Docker)

Serviços recomendados no `docker-compose.yml`:
- `app_backend`
- `app_frontend`
- `postgres`
- `redis`
- `evolution_api`
- `ollama`
- `nginx`

Observações:
- Em desenvolvimento local no Windows, usar volumes nomeados para persistência de Postgres/Redis/Evolution.
- Em VPS Linux, publicar somente Nginx e portas estritamente necessárias entre containers.

## 5) Módulos e telas

Telas principais:
- Login / Cadastro
- Dashboard
- Agenda
- Clientes
- Tarefas / Financeiro
- Integração WhatsApp
- Assistente IA
- Configurações

Tela crítica (extra):
- **Integração WhatsApp**
  - Conectar número por QR Code
  - Exibir status da sessão
  - Testar envio de mensagem
  - Configurar mensagens automáticas

## 6) Modelo de dados (MVP)

### Tabela `whatsapp_sessions`
- `id` (uuid)
- `user_id` (uuid, FK users)
- `session_name` (varchar)
- `status` (varchar) // ex.: `connecting`, `open`, `closed`
- `qr_code` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Atualização em `clients`
- `whatsapp_number` (varchar, obrigatório para automação)

### Atualização em `appointments`
- `reminder_sent` (boolean, default `false`)

### Tabela adicional sugerida: `message_logs`
- `id` (uuid)
- `user_id` (uuid)
- `client_id` (uuid)
- `appointment_id` (uuid, nullable)
- `session_name` (varchar)
- `message_type` (varchar) // appointment_reminder, confirmation, finance_reminder
- `payload` (jsonb)
- `status` (varchar) // queued, sent, failed
- `provider_message_id` (varchar, nullable)
- `error` (text, nullable)
- `created_at` (timestamp)

## 7) Fluxos essenciais

### Fluxo 1: Conectar WhatsApp
1. Usuário abre tela de integração.
2. Backend cria sessão na Evolution API.
3. Backend solicita QR Code.
4. Frontend atualiza QR em tempo real (polling/websocket).
5. Usuário escaneia QR.
6. Backend confirma status `open` e persiste sessão ativa.

### Fluxo 2: Criar compromisso com lembrete
1. Usuário cria compromisso.
2. Registro é salvo em `appointments` com `reminder_sent = false`.
3. Job de lembrete identifica horário de disparo (30 minutos antes).

### Fluxo 3: Envio de lembrete via WhatsApp
1. Cron roda a cada 60 segundos.
2. Busca compromissos dentro da janela (agora + 30 min) com `reminder_sent = false`.
3. Valida se cliente possui `whatsapp_number` e sessão ativa.
4. Enfileira envio no BullMQ.
5. Worker envia mensagem pela Evolution API.
6. Em sucesso, marca `reminder_sent = true` e grava em `message_logs`.
7. Em falha, aplica retry com backoff e registra erro.

Mensagem exemplo:
- "Olá João, lembrete da sua consulta amanhã às 14h."

### Fluxo 4: IA cria compromisso por texto
Entrada:
- "marcar consulta com Maria sexta às 10h"

Processo:
1. Backend chama provider de IA.
2. Parser extrai intenção, nome, data/hora e tipo de evento.
3. Resolve data relativa com timezone do usuário.
4. Cria cliente se inexistente.
5. Cria compromisso e mantém `reminder_sent = false`.
6. Retorna confirmação para usuário.

### Fluxo 5: Lembrete financeiro
1. Usuário cria tarefa financeira com vencimento.
2. Cron identifica tarefas do dia.
3. Worker envia lembrete via WhatsApp.

Mensagem exemplo:
- "Você tem uma conta para pagar hoje: aluguel."

## 8) Integração Evolution API (contrato de aplicação)

Operações mínimas esperadas:
- Criar sessão
- Obter QR Code
- Verificar status da sessão
- Enviar mensagem

Boas práticas:
- Isolar cliente HTTP da Evolution em um serviço único no backend.
- Implementar timeout, retry e circuit breaker para robustez.
- Registrar request/response sanitizados (sem segredos em log).

## 9) Segurança

- Autenticação JWT com refresh token.
- Criptografia de credenciais/tokens da Evolution API em repouso.
- Rate limiting por IP/usuário em endpoints críticos.
- Validação de assinatura de webhook (quando disponível).
- Auditoria de ações sensíveis (login, conexão/disconexão WhatsApp, disparos).

## 10) IA aplicada ao produto

Funcionalidades iniciais:
- Parser de linguagem natural para agenda.
- Sugestão de horários livres.
- Resumo da agenda do dia.
- Criação automática de tarefas por contexto.

Estratégia de providers:
1. Tentar Ollama local.
2. Em indisponibilidade/timeout, fallback para Gemini.
3. DeepSeek opcional conforme configuração do tenant.

## 11) Customizações por usuário

- Templates de mensagens personalizados.
- Janela de envio de lembretes.
- Tom de comunicação (formal/informal).
- Timezone e formato de data/hora.

## 12) Observabilidade e escala

- Fila de envio com BullMQ + Redis.
- Retry automático com backoff exponencial.
- DLQ (dead letter queue) para falhas persistentes.
- Métricas: mensagens enviadas, falhas, tempo de resposta e entregas por tenant.
- Logs estruturados com `request_id`/`tenant_id`.

## 13) Testes obrigatórios (MVP)

1. Conectar WhatsApp por QR Code.
2. Criar compromisso.
3. Receber lembrete automático no WhatsApp.
4. Testar criação de evento via IA por texto.

Sugestão adicional:
- Testes de integração para cron + fila + provider de mensagens com mocks.

## 14) Roadmap de implementação

### Fase 1 (MVP funcional)
- Auth, usuários e tenants.
- CRUD de clientes e agenda.
- Integração básica Evolution (sessão + envio).
- Cron de lembretes.
- Tela de integração WhatsApp.

### Fase 2 (IA e produtividade)
- Parser de linguagem natural.
- Resumo diário inteligente.
- Sugestão automática de horários.

### Fase 3 (escala SaaS)
- BullMQ completo com retries e DLQ.
- Métricas e observabilidade.
- Políticas avançadas de segurança e auditoria.

## 15) Critérios de pronto

- Docker Compose sobe todos os serviços necessários.
- Usuário conecta WhatsApp e visualiza status em tempo real.
- Lembrete de compromisso é enviado automaticamente sem intervenção manual.
- IA converte texto em agendamento válido com confirmação ao usuário.
- Logs e rastreabilidade mínimos disponíveis para suporte.
