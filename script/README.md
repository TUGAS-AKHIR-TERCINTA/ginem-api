# CORE Scripts

Utility and evaluation scripts for the Ginem API thesis project.  
Run all commands from the `CORE/` directory unless noted otherwise.

```bash
cd CORE
```

---

## Contents

| Path | Purpose |
|---|---|
| [`eval/`](./eval/) | Thesis evaluation & system testing (LLM + chat E2E + MQTT) |
| [`eval/README.md`](./eval/README.md) | Full eval documentation (install, env, scoring, outputs) |
| [`colab/`](./colab/) | Google Colab notebook + dummy sample outputs for result visualization |
| `wa-test.ts` | Legacy / exploratory WhatsApp harness (mostly commented out) |

---

## Evaluation testing (`script/eval`)

This module evaluates the **LLM-based IoT agent**: natural-language chat → tools → backend → MQTT → devices.

It does **not** go through RabbitMQ. The primary path calls production `ChatService.query()` in-process, the same chat logic used by the live API.

### What is covered

1. **End-to-end system testing (recommended)**  
   Chat input → short-term memory → Pinecone RAG → LangChain agent → real MCP device tools → MySQL / scheduler / MQTT → ESP32.  
   For actuator commands, the runner also checks MQTT state / ACK within a configurable timeout.

2. **LLM evaluation**  
   Compare configurable providers/models on the same Indonesian dataset and ground truth: tool name accuracy, parameter accuracy, clarify/reject behavior, latency, and (in isolated mode) tokens/cost.

3. **Dataset categories**  
   `simple`, `medium`, `complex`, `ambiguous`, `invalid` — covering on/off, multi-device, status, sensors, schedules, conversation context, clarification, and rejection of unsupported/invalid commands (including ECA rules that are not implemented in production tools).

### How to run

```bash
# Validate dataset + config (offline)
npx tsx script/eval/cli/validate-dataset.ts

# Full E2E via ChatService (REAL tools + MQTT) — flag required
npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device

# Smaller E2E subset
npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device \
  --models openai-gpt-4o-mini \
  --cases S01,S02,S03

# Isolated LLM eval (stub tools only — no ChatService / no MQTT)
npx tsx script/eval/cli/run-llm-eval.ts --models openai-gpt-4o-mini --cases S01,A01

# Mock integration harness (no physical devices)
npx tsx script/eval/cli/run-integration.ts --mode dry-run
```

### Safety

- `run-e2e-eval.ts` **refuses to start** without `--enable-real-device`.
- With that flag, tool calls can publish real MQTT commands and control physical devices.
- Prefer a lab broker/ESP32 and a small `--cases` list first.

### Configuration & outputs

- Models & prices: `script/eval/config/models.json`
- Timeouts / aliases: `script/eval/config/eval.config.json`
- Dataset & ground truth: `script/eval/data/dataset.json`
- Results: `script/eval/output/{raw,processed,logs}/<runId>/`

### Scoring (summary)

| Metric | Definition |
|---|---|
| Tool accuracy | Correct tool selections / total tests × 100% |
| Parameter accuracy | Correct expected parameters / total expected parameters × 100% |
| Latency | Response time − request time (average = total / N) |
| Tokens / cost | Input + output tokens; cost from configurable $/1M prices (isolated LLM runner) |
| E2E extras | `functionalSuccess`, `integrationSuccess`, `mqttSuccess` |

For installation, environment variables, folder layout, and output file details, see **[`eval/README.md`](./eval/README.md)**.

### View results in Google Colab

1. Zip `CORE/script/eval/output` (real runs) **or** `CORE/script/colab/sample_output` (dummy demo data).
2. Open [`colab/eval_results_colab.ipynb`](./colab/eval_results_colab.ipynb) in [Google Colab](https://colab.research.google.com/) (**File → Upload notebook**).
3. Run the setup cells, upload the zip (or mount Drive), select a run, and explore KPIs/charts.

Details: [`colab/README.md`](./colab/README.md).

---

## Prerequisites for E2E runs

Use the same environment as the running app:

- Database (Sequelize / MySQL)
- MQTT broker
- Pinecone (RAG)
- `OPENAI_API_KEY` and/or `DEEPSEEK_API_KEY`
- Seeded devices whose names match the dataset (or aliases in `eval.config.json`)

---

## Notes

- Production defaults stay unchanged when eval options are omitted: `LLMService.create()` → OpenAI `gpt-4o`; `ChatService.query()` without `model` / `captureTrace` behaves as before.
- Optional eval hooks on chat/LLM services exist only to inject models and capture tool-call traces during testing.
- Jest unit tests under `CORE/src/**/__tests__/` are separate from this thesis evaluation suite.
