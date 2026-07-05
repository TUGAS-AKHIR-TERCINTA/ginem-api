# AI Agent IoT Platform — Backend API

Node.js / Express backend for controlling and monitoring IoT devices using natural language (web chat & WhatsApp), MQTT, and an LLM-based AI agent.

**Stack:** TypeScript · Express · MySQL · Redis · BullMQ · HiveMQ Cloud · OpenAI · Pinecone

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| npm | 9+ |
| MySQL | 8 (local or Docker) |
| Redis | 7 (local or Docker) |
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
# Edit .env — fill DB, Redis, HiveMQ, OpenAI, Pinecone credentials

# 3. Run migrations
npm run migrate:up

# 4. Start dev server (hot reload)
npm run dev
```

API runs at **http://localhost:8000**  
Swagger docs: **http://localhost:8000/api/v1/docs**

---

## Docker

Docker Compose runs **MySQL**, **Redis**, and the **app**. MQTT uses **HiveMQ Cloud** from `.env` (not containerized).

```bash
cp .env.docker.example .env   # or adjust .env for Docker hostnames
docker compose up -d --build  # production image
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

> Docker Compose overrides `DB_HOST=mysql` and `REDIS_HOST=redis` inside the container.  
> Set `RUN_MIGRATIONS=true` to auto-run migrations on startup.

**Useful commands:**

```bash
docker compose logs -f app
docker compose exec app sh
docker compose down        # stop
docker compose down -v     # stop + remove volumes
```

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
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `OPENAI_API_KEY` | OpenAI (LLM + TTS) |
| `PINECONE_API_KEY` | Pinecone vector DB |
| `PINECONE_INDEX_NAME` / `PINECONE_NAMESPACE` | Pinecone config |
| `MQTT_BROKER_URL` | HiveMQ Cloud URL (`mqtts://...:8883`) |
| `MQTT_USERNAME` / `MQTT_PASSWORD` | HiveMQ credentials |
| `RUN_MIGRATIONS` | Auto-migrate on Docker start (`true`/`false`) |

Never commit `.env` to version control.

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

## Project Structure

```text
CORE/
├── server.ts              # Entry point
├── src/
│   ├── app.ts             # Express bootstrap
│   ├── configs/           # App, MQTT, Redis, Swagger
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Auth, validation, CORS
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── schemas/           # Zod validation
│   ├── services/          # Business logic
│   └── utilities/         # Helpers, logger, JWT
├── resources/
│   ├── migrations/        # Sequelize migrations
│   └── seeders/           # Seed data
├── settings/              # LLM model config (JSON)
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

GitHub Actions (`.github/workflows/ci.yml`) runs **lint + tests** on every push and pull request.

---

## Production Notes

- Use `npm run build && node build/server.js` or the production Docker image.
- MQTT must point to **HiveMQ Cloud** (`mqtts://`) — not a local broker.
- WhatsApp uses Baileys (unofficial); use an official API for production messaging.
- Migrations read DB config from `.env` via `resources/config.js`.

---

