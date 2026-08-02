# Thesis Evaluation Module — LLM IoT Agent

Testing & evaluation toolkit for the thesis project (LLM agent for natural-language IoT control/monitoring).

**Location:** `CORE/script/eval/`

## What is tested

### Primary path (recommended): End-to-end via `ChatService`

```text
dataset command
  → ChatService.query()          // NO RabbitMQ
      → ChatMemory (optional session)
      → Pinecone RAG
      → LangChain agent + real deviceTools (MCP)
          → MySQL / Scheduler / MQTT → ESP32
  → tool-call trace + reply
  → MQTT ACK check (for actuator tools)
  → JSON/CSV scoring
```

This uses the **same production code** as the live chat API (`CORE/src/services/chat/Chat.service.ts`), with optional model override from `LLMService.create({...})`.

### Secondary paths (still available)

| CLI | Purpose |
|---|---|
| `run-e2e-eval.ts` | **Real** ChatService + tools + MQTT (requires `--enable-real-device`) |
| `run-llm-eval.ts` | Isolated LLM + stub tools (no ChatService / no MQTT) — good for token/cost accounting |
| `run-integration.ts` | Mock or direct-MQTT integration harness (legacy/supplementary) |

---

## Folder structure

```
script/eval/
  config/          models.json, eval.config.json
  data/            dataset.json (ID + ground truth)
  schemas/         Zod schemas
  lib/             bootstrap, normalize, metrics, scoring, paths
  adapters/        isolated LangChain adapters + stub tools
  runners/
    e2eChat.runner.ts      # ChatService E2E
    llmEval.runner.ts      # isolated LLM
    integration.runner.ts  # mock/direct MQTT
  cli/
    run-e2e-eval.ts
    run-llm-eval.ts
    run-integration.ts
    validate-dataset.ts
  output/          raw / processed / logs
  README.md
```

---

## Production code changes (safe defaults)

To support multi-model E2E without breaking the app:

- `LLMService.create()` — still defaults to OpenAI `gpt-4o`; optional `{ provider, model, ... }` for eval.
- `ChatService.query(options)` — optional `model` and `captureTrace`; omitted ⇒ identical to previous production behavior (default agent, reply only).

RabbitMQ / HTTP routes are unchanged.

---

## Installation

```bash
cd CORE
npm install
```

Uses existing deps: langchain, `@langchain/openai`, `@langchain/deepseek`, mqtt, zod (transitive), tsx.

---

## Environment variables

Same as the running app:

| Variable | Required for E2E |
|---|---|
| `OPENAI_API_KEY` | OpenAI models |
| `DEEPSEEK_API_KEY` | DeepSeek models |
| DB_* / Sequelize env | Device tools + chat memory |
| MQTT broker env (`mqtt` config) | Real device commands |
| Pinecone env | Live RAG |

---

## Commands

From `CORE/`:

```bash
# Validate dataset
npx tsx script/eval/cli/validate-dataset.ts

# E2E (REAL devices / MQTT) — explicit flag required
npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device

# Start small
npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device \
  --models openai-gpt-4o-mini \
  --cases S01,S02,S03

# Isolated LLM only (no ChatService, no MQTT)
npx tsx script/eval/cli/run-llm-eval.ts --models openai-gpt-4o-mini --cases S01,A01

# Mock integration harness
npx tsx script/eval/cli/run-integration.ts --mode dry-run
```

**Safety:** `run-e2e-eval` refuses to start without `--enable-real-device` because tool calls publish real MQTT commands.

---

## Scoring rules

| Metric | Formula |
|---|---|
| Tool accuracy | correct tool selections / total tests × 100% |
| Parameter accuracy | correct expected parameters / total expected parameters × 100% |
| LLM / E2E latency | response timestamp − request timestamp |
| Average latency | total latency / number of tests |
| Total tokens | input + output *(isolated runner; E2E may report 0 if agent hides usage)* |
| API cost | input/1e6×inPrice + output/1e6×outPrice |

E2E also reports: `functionalSuccess`, `integrationSuccess`, `mqttSuccess`, broker connected.

---

## Configuration

- `config/models.json` — model ids, providers, token prices  
- `config/eval.config.json` — timeouts, aliases, `evalUserId`  
- Prices are **not** hard-coded in runners  

---

## Output structure

```
output/
  raw/<runId>/e2e-results.json
  processed/<runId>/
    e2e-results.csv
    summary-by-model.json|.csv
    summary-by-category.json|.csv
    system-integration-summary.json|.csv
    summary.json
  logs/<runId>/errors.log
```

---

## Dataset notes

- Categories: simple / medium / complex / ambiguous / invalid (Bahasa Indonesia)  
- Ground truth matches production tool schemas (`state`, `category`, `hour`, `minute`, …)  
- ECA / schedule update-delete are `unsupported` / `reject` (no production tools yet)  
- E2E uses **live Pinecone**; dataset `ragContext` is only an optional hint prepended to the user message  

---

## Reproducibility tips

1. Keep `temperature: 0` in `models.json`.  
2. Run a small `--cases` subset first on a lab broker/ESP32.  
3. Ensure seeded device names match dataset aliases / DB.  
4. Do not enable RabbitMQ for this path — chat is invoked in-process.
