# Ginem API

Backend REST API for the **Ginem** Smart Home IoT platform — natural language device control, AI Agent, MQTT, scheduler, WhatsApp, and RAG.

Part of the [Ginem organization](https://github.com/YOUR-ORG). See the [org profile README](https://github.com/YOUR-ORG/.github/blob/main/profile/README.md) for full-stack overview.

**Stack:** TypeScript · Express · MySQL · Redis · BullMQ · RabbitMQ · HiveMQ Cloud · OpenAI · Pinecone

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| npm | 9+ |
| MySQL | 8 (local or Docker) |
| Redis | 7 (local or Docker) |
| RabbitMQ | 3.x |
| HiveMQ Cloud | MQTT broker (external) |
| OpenAI API key | LLM + optional TTS |
| Pinecone API key | Optional (RAG) |

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — fill DB, Redis, RabbitMQ, HiveMQ, OpenAI, Pinecone credentials

# 3. Run migrations
npm run migrate:up

# 4. Start dev server (hot reload)
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/api/v1/docs |

---

## Docker

Docker Compose runs **MySQL**, **Redis**, **RabbitMQ**, and the **app**. MQTT uses **HiveMQ Cloud** from `.env` (not containerized).

```bash
cp .env.docker.example .env
docker compose up -d --build
```

**Development (hot reload):**

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

| Service | Container | Port |
|---------|-----------|------|
| App | `ta-backend` | 8000 |
| MySQL | `ta-mysql` | 3306 |
| Redis | `ta-redis` | 6379 |
| RabbitMQ | `ta-rabbitmq` | 5672 (AMQP), 15672 (management UI) |

> Set `DB_HOST=mysql`, `REDIS_HOST=redis`, and `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672` inside Docker.  
> Set `RUN_MIGRATIONS=true` to auto-run migrations on startup.

---

## Chat message broker (RabbitMQ)

Inbound chat from **web** (`POST /api/v1/chat`) and **WhatsApp** is published to the durable queue `chat.llm.requests` before `ChatService` / LLM processing. Callers wait for a reply via RabbitMQ RPC (`correlationId` + exclusive reply queue).

| Variable | Description |
|----------|-------------|
| `RABBITMQ_URL` | AMQP URL (default `amqp://guest:guest@127.0.0.1:5672`) |
| `RABBITMQ_CHAT_QUEUE` | Queue name (default `chat.llm.requests`) |
| `RABBITMQ_CHAT_REPLY_TIMEOUT_MS` | RPC timeout (default `120000`) |

---

## Environment Variables

Copy `.env.example` (local) or `.env.docker.example` (Docker) to `.env`.

| Variable | Description |
|----------|-------------|
| `APP_PORT` | HTTP port (default `8000`) |
| `JWT_TOKEN` | JWT signing secret |
| `PASSWORD_ENCRYPTION` | Password hash salt |
| `CORS_ORIGIN` | Frontend URL (e.g. `http://localhost:5173`) |
| `DB_HOST` / `DB_PORT` | MySQL host & port |
| `DB_NAME` / `DB_USER_NAME` / `DB_PASSWORD` | MySQL credentials |
| `RABBITMQ_URL` | RabbitMQ connection URL (chat → LLM broker) |
| `RABBITMQ_CHAT_QUEUE` | Chat request queue name |
| `RABBITMQ_CHAT_REPLY_TIMEOUT_MS` | Max wait for LLM reply over RabbitMQ |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `OPENAI_API_KEY` | OpenAI (LLM + TTS) |
| `PINECONE_API_KEY` | Pinecone vector DB |
| `PINECONE_INDEX_NAME` / `PINECONE_NAMESPACE` | Pinecone config |
| `MQTT_BROKER_URL` | HiveMQ Cloud URL (`mqtts://...:8883`) |
| `MQTT_USERNAME` / `MQTT_PASSWORD` | HiveMQ credentials |
| `RUN_MIGRATIONS` | Auto-migrate on Docker start (`true`/`false`) |

Never commit `.env` to version control.

---

## MQTT Topics

```text
iot/v1/device/{deviceId}/command
iot/v1/device/{deviceId}/state
iot/v1/device/{deviceId}/telemetry
```

`{deviceId}` is the numeric ID from the `devices` table. Command/telemetry payloads use `{ "value": "..." }`.

---

## API Overview

Base URL: `/api/v1`

| Route | Description |
|-------|-------------|
| `/auth` | Login, register, reset password |
| `/chat` | AI agent query (+ optional TTS) |
| `/devices` | Device CRUD |
| `/devices/logs` | Sensor & telemetry logs |
| `/mqtt` | MQTT publish & status |
| `/whatsapp` | WhatsApp session management |
| `/indexing` | Pinecone text indexing |
| `/scheduler-logs` | Scheduled job history |
| `/stats` | System aggregate counts |
| `/admins` | Admin management |
| `/settings` | LLM model settings |
| `/docs` | Swagger UI |

Most routes require a **Bearer JWT** from `POST /api/v1/auth/login`.

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript → `build/` |
| `npm start` | Build + run production server |
| `npm run migrate:up` | Run database migrations |
| `npm run migrate:undo` | Rollback last migration |
| `npm run seed` | Run database seeders |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage report |

---

## Project Structure

```text
ginem-api/
├── server.ts
├── src/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   │   ├── admin/
│   │   ├── appLog/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── device/
│   │   ├── llm/
│   │   ├── mcp/
│   │   ├── mqtt/
│   │   ├── profile/
│   │   ├── rabbitmq/
│   │   ├── rag/
│   │   ├── scheduler/
│   │   ├── stats/
│   │   └── whatsapp/
│   └── utilities/
├── resources/
│   ├── migrations/
│   └── seeders/
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Testing & CI

```bash
npm test              # 169+ unit tests
npm run lint          # ESLint check
```

GitHub Actions runs **lint + tests** on every push and pull request.

---

## Related Repositories

| Repo | Role |
|------|------|
| [ginem-admin](https://github.com/YOUR-ORG/ginem-admin) | Admin dashboard & web chat |
| [ginem-hardware](https://github.com/YOUR-ORG/ginem-hardware) | ESP32 firmware |
| [.github](https://github.com/YOUR-ORG/.github) | Organization profile |

---

## Production Notes

- Use `npm run build && node build/server.js` or the production Docker image.
- MQTT must point to **HiveMQ Cloud** (`mqtts://`) — not a local broker.
- WhatsApp uses Baileys (unofficial); use an official API for production messaging.
- Set `CORS_ORIGIN` to your deployed `ginem-admin` URL.
