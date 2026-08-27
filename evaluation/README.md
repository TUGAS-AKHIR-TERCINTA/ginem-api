# Evaluation Module

Data-collection tool for BAB IV of the thesis *"Rancang Bangun dan Implementasi AI Agent Berbasis LLM untuk Kontrol dan Monitoring Perangkat IoT Menggunakan Natural Language"*. This module **does not duplicate** production logic — it calls the real `ChatService`/`LLMService`/tools in `src/services/**` directly (in-process for BAB 4.3, over HTTP for BAB 4.2), so what's being tested is the system users actually use, not a reimplementation of it.

## 1. Purpose

Two kinds of testing that are **deliberately kept separate** (see methodology point 34):

| | BAB 4.2 — Functional & End-to-End | BAB 4.3/4.4 — LLM Evaluation |
|---|---|---|
| What's tested | The full system: AI Agent → tool → backend → MQTT → ESP32 → ACK | Quality of the LLM's decisions: tool selection, parameters, output structure |
| Physical hardware | Yes, required (real ESP32 + DHT11 + relay) | No — MQTT publish & DB writes are *dry-run* |
| Runner | `evaluation/runner/functionalRunner.ts` | `evaluation/runner/llmEvalRunner.ts` |
| Dataset | `evaluation/datasets/functional-dataset.jsonl` (8 scenarios) | `evaluation/datasets/dataset.json` (100 cases) |
| CLI | `npm run evaluate -- --mode functional` | `npm run evaluate -- --mode llm-eval` (default) |

MQTT/ESP32 failures are **never** counted as a model error — BAB 4.3 never touches MQTT at all (see §9 "Dry-run" below).

## 2. Dataset structure

### `dataset.json` (BAB 4.3, 100 cases — 20 simple / 20 medium / 20 complex / 20 ambiguous / 20 invalid)

A single pretty-printed JSON array (2-space indent) so it's easy to read/edit directly — **not** JSON Lines. Example entry:

```json
{
  "id": "TC001",
  "category": "simple",
  "input": "Nyalakan lampu ruang tamu",
  "expected": {
    "behavior": "tool_call",
    "toolCalls": [
      {
        "tool": "set_actuator_state_by_device_name",
        "parameters": { "deviceName": "Lampu ruang tamu", "state": "on" }
      }
    ]
  }
}
```

- `expected.behavior`: `tool_call` | `clarification` | `reject_or_no_tool`.
- `expected.toolCalls`: array (can be >1 for complex cases, e.g. TC075 turn-on + schedule-off).
- `expected.schedule` / `expected.rule`: additional structured representation for `scheduleComparator`/`ruleComparator` (Schedule Accuracy / Dynamic Rule Accuracy in Table 4.4).
- Full schema + validation: `evaluation/datasets/dataset.schema.ts` (Zod, `parseDatasetFile` function). The whole array is auto-validated by `evaluation/__tests__/dataset.test.ts`.
- **Device names in the dataset follow `resources/seeders/2_deviceSeeder.js` exactly**: `Lampu ruang tamu` (actuator), `Suhu ruangan` (sensor), `Kipas` (actuator) — only 3 devices, matching exactly (including capitalization) what `functional-dataset.jsonl` below uses, because `DeviceService.findByName` is an exact match. If you change the seeder's names/contents again, `dataset.json` needs to be updated accordingly.

### `functional-dataset.jsonl` (BAB 4.2, 8 cases — matches Table 4.1 exactly)

Kept as JSON Lines (one line = one case) since it's only 8 short lines — already easy enough to read as-is, no need to convert it like `dataset.json`. Command phrasing and scenario order have been matched exactly to Table 4.1 (`Nyalakan lampu ruang tamu`, `Nyalakan kipas jika suhu di atas 30 °C`, etc.). Extra fields: `deviceName` (for ACK polling), `expectedFinalState` (`"1"`/`"0"`), `expectExecution`.

The devices used — `Lampu ruang tamu`, `Suhu ruangan`, `Kipas` — are **exactly the same** as `dataset.json`/BAB 4.3 and your current `resources/seeders/2_deviceSeeder.js`. If your real device names differ (e.g. the seeder gets edited again), update `deviceName`/`input` in both dataset files so they still match the target DB exactly.

## 3. How to run

All commands are run from the repo root via `npm run evaluate --`. The `--` separator is **required**
— without it, flags like `--model` get swallowed by `npm` itself instead of being passed to the CLI.

### 3.1 Available flags

Source: `evaluation/cli/args.ts`.

| Flag | Value | Default | Notes |
|---|---|---|---|
| `--mode` | `llm-eval` \| `functional` \| `report` | `llm-eval` | `llm-eval` = BAB 4.3 (dry-run, no hardware). `functional` = BAB 4.2 (needs a real ESP32 online, see §12 "Test Environment"). `report` = regenerate CSV/summary from an existing run without calling the LLM/API again. |
| `--model` | `all` or a comma-separated list of keys | `all` | Valid model keys: `openai:gpt-5.6-terra`, `anthropic:claude-sonnet-5`, `deepseek:deepseek-v4-flash` (see `evaluation/config/models.config.ts`). |
| `--dataset` | file path | `./evaluation/datasets/dataset.json` (from `EVAL_DATASET_PATH`) | Swap the dataset in use, e.g. `evaluation/datasets/10_dataset.json` for a quick check before running the full 100-case dataset. |
| `--repetitions` | integer ≥ 1 | 3 (from `EVAL_REPETITIONS`) | How many times each case is repeated per model, to compute average metrics (methodology point 27). |
| `--category` | comma-separated category list | all categories | Valid values: `simple`, `medium`, `complex`, `ambiguous`, `invalid`. Can be combined, e.g. `--category simple,ambiguous`. |
| `--output` | folder path | `evaluation/results/run-<timestamp>` | Custom output folder for the run's results. |
| `--resume` | `<runId>` | — | Continue a run that was interrupted (skips cases already completed), or, combined with `--mode report`, regenerate the report from that run without re-running it. |
| `--concurrency` | integer ≥ 1 | 2 (from `EVAL_CONCURRENCY`) | Number of parallel requests to the model API. |
| `--max-retries` | integer ≥ 0 | 2 (from `EVAL_MAX_RETRIES`) | Automatic retries on API error/timeout. |
| `--dry-run` | — | — | Accepted for compatibility, **does nothing** — `llm-eval` is always dry-run and `functional` is always real by design (see §9). |

### 3.2 Ready-to-use commands

```bash
# Quick check with 10 cases (all categories represented) before running the full 100, 1 repetition
EVAL_DATASET_PATH=./evaluation/datasets/10_dataset.json npm run evaluate -- --model all --repetitions 1

# Full BAB 4.3: 100 cases x 3 models x 3 repetitions (project default, most complete for Tables 4.3-4.9)
npm run evaluate

# Same as above but explicit
npm run evaluate -- --model all --repetitions 3

# BAB 4.3 for a single model only
npm run evaluate -- --model openai:gpt-5.6-terra --repetitions 3
npm run evaluate -- --model anthropic:claude-sonnet-5 --repetitions 3
npm run evaluate -- --model deepseek:deepseek-v4-flash --repetitions 3

# BAB 4.3 for specific categories only (e.g. focus on hard cases first)
npm run evaluate -- --model all --category complex,ambiguous,invalid

# BAB 4.2: functional/E2E testing — REQUIRES an online ESP32, never dry-run
npm run evaluate -- --mode functional

# Resume a run that was interrupted mid-way (skips cases already recorded)
npm run evaluate -- --resume run-2026-08-21-0003

# Regenerate CSV/summary from an old run without calling the API again
npm run evaluate -- --mode report --resume run-2026-08-19-1200

# Custom: different dataset, custom output folder, lower concurrency (to save on rate limits)
npm run evaluate -- --dataset evaluation/datasets/10_dataset.json --output evaluation/results/uji-coba --concurrency 1
```

## 4. Environment variables

See the `# Evaluation runner` block in `.env.example`. **Required** before a real run:

| Var | For | Notes |
|---|---|---|
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY` | llm-eval | Already in `.env.example`; `ANTHROPIC_API_KEY` was newly added by this module (§8). |
| `EVAL_OPENAI_MODEL`, `EVAL_ANTHROPIC_MODEL`, `EVAL_DEEPSEEK_MODEL` | llm-eval | **Fill in with the official model id from your API account** — the defaults in `models.config.ts` (`gpt-5.6-terra`, `claude-sonnet-5`, `deepseek-v4-flash`) are best-guesses from the names in Table 3.10, NOT verified API strings. |
| `EVAL_API_EMAIL`, `EVAL_API_PASSWORD` | functional | An account already registered in the system (used for `POST /api/v1/auth/login`). |
| `EVAL_API_BASE_URL` | functional | Defaults to `http://localhost:8000`. |
| `DB_*`, `REDIS_*` | both | **Strongly recommended to use a separate/disposable database for evaluation** — see §9, `RuleManagementService` still writes to the real DB during llm-eval. |
| `EVAL_REPETITIONS`, `EVAL_CONCURRENCY`, `EVAL_MAX_RETRIES`, `EVAL_RETRY_BASE_DELAY_MS` | llm-eval | Defaults 3 / 2 / 2 / 1000ms — conservative against provider rate limits (point 27). |
| `EVAL_MQTT_ACK_TIMEOUT_MS`, `EVAL_MQTT_ACK_POLL_INTERVAL_MS` | functional | Defaults 10000ms / 500ms. |
| `EVAL_USD_TO_IDR` | reporting | Optional, manual conversion when writing reports — all raw figures stay in USD. |

## 5. Model configuration

`evaluation/config/models.config.ts` — matches Table 3.10 exactly (`temperature=0.2`, `maxTokens=1024`, no fine-tuning, API integration). `evaluation/config/pricing.json` — matches Table 3.13 exactly (reference date August 2, 2026); **update this file before the final run** if provider rates change, don't hardcode them in the calculation logic (point 18).

## 6. Output

```
evaluation/results/run-YYYY-MM-DD-HHmm/
  config.json                        # snapshot of this run's configuration
  raw-results.jsonl                  # 1 line = 1 (dataset x model x repetition), written incrementally
  errors.jsonl                       # subset of raw-results that failed transport (retries exhausted)
  summary.json                       # aggregates per model + per (model x complexity)
  tool-accuracy.csv, parameter-accuracy.csv, latency.csv,
  token-cost.csv, complexity.csv, error-distribution.csv   # raw data for re-analysis (point 23)
  tabel-4.3-ketepatan-tool.csv       # ready to paste into BAB IV (point 24), exact same columns
  tabel-4.4-parameter-struktur.csv
  tabel-4.5-latensi.csv
  tabel-4.6-latensi-kompleksitas.csv
  tabel-4.7-token-biaya.csv
  tabel-4.8-kompleksitas.csv
  tabel-4.9-distribusi-kesalahan.csv
```

BAB 4.2 (`--mode functional`) writes `functional-results.jsonl` in the same run directory (no automatic BAB IV table since there are only 8 cases — see the Table 3.11-style manual summary from this file).

## 7. How to resume

`npm run evaluate -- --resume run-2026-08-19-1200 ...` (other flags must match the first run — model/dataset/repetitions). The runner reads the existing `raw-results.jsonl` and **only skips** records where `errorType == null` (successful) — records that failed after exhausting retries will be retried, per point 26.

## 8. Changes to production code (additive, no change to default behavior)

1. **`src/services/llm/LLM.service.ts`** — added `provider: 'anthropic'` (dependency `@langchain/anthropic`). The default stays `'openai'`; the production path (`ChatService.defaultAgent`, which calls `LLMService.create()` with no arguments) is completely unchanged.
2. **`src/services/chat/Chat.service.ts`** — `ChatQueryTrace` gained an optional `tokenUsage` field (`inputTokens`/`outputTokens`/`totalTokens`), extracted from LangChain's `usage_metadata`. Only populated when `captureTrace: true` — a flag that already existed specifically for evaluation/experimentation, never active on the production HTTP path (`ChatMessageBroker` doesn't forward `trace` to the RPC reply).

No new MySQL tables/migrations — all evaluation output is file-based (point 23).

## 9. Dry-run (BAB 4.3) — what's mocked, what stays real

`evaluation/agent/dryRunGuard.ts` swaps out **only** the functions with side effects for in-memory versions, without touching `src/services/mcp/tools/**`:

| Original function | Intercepted? | Reason |
|---|---|---|
| `MQTTService.publishActuatorState` | Yes | The single point that actually sends a command to the physical device. |
| `DeviceLogService.create` | Yes | Prevents polluting `device_logs` AND prevents state leaking across repetitions (re-read by `get_last_log_by_device_name` in a later repetition). |
| `scheduleActuatorState`/`scheduleActuatorStateRepeat`/`scheduleSensorData`/`scheduleSensorDataRepeat` (DeviceSchedule.service) | Yes | Avoids writing `scheduler_logs` + enqueueing real BullMQ/Redis jobs; returns a fake job object shaped exactly like the real one. |
| `DeviceService.findByName` (device resolution) | **No** | This is precisely what's being evaluated — whether the LLM names the correct device. |
| Each tool's Zod validation | **No** | Reused as-is from `src/services/mcp/tools/**`. |
| `RuleManagementService.create/setActive/remove` | **No** | A rule row has no physical effect (it only activates once real MQTT telemetry arrives, which this runner never sends), and faking its 4-table transaction would duplicate production logic. **Consequence: run evaluation against a separate/disposable database**, not the production DB. |

**Important finding (runtime, must be preserved)**: the CLI is run with **`ts-node --transpile-only`, not `tsx`**. `tsx` (esbuild) compiles named exports into read-only *accessor properties* (`configurable:false`, no setter) to mimic pure ESM live-bindings, so `dryRunGuard.ts` fails outright at runtime with `Cannot set property ... which has only a getter` — even though it passes under `ts-jest` (which uses the real `tsc` transform, producing plain overwritable properties; this passed every unit test but only surfaced as a runtime failure during an actual CLI sample run, which is why this Stage 5 verification matters). `--transpile-only` is used because a full-type-check `ts-node` boot can take >60 seconds (many production modules get imported transitively) — transpile-only still produces the same CJS shape (plain, overwritable properties), it just skips type-checking at startup. Don't switch the `"evaluate"` script in `package.json` back to `tsx` without reworking the dry-run mechanism, and don't drop `--transpile-only` without accepting a much slower boot time.

`main()` in `evaluation/cli/evaluate.ts` calls `process.exit(0)` explicitly when done — importing `MQTTService`/BullMQ opens real connections that keep Node from exiting on its own even after all work is finished.

**Important finding**: importing `MQTTService` (via `src/services/mqtt/client.ts`) opens a real MQTT connection to the HiveMQ broker configured in `.env` **at import time**, not lazily. This means the `npm run evaluate` process (in `llm-eval` mode) still opens a real connection to your broker — **it never sends a command** (since `publishActuatorState` is already swapped out), but the connection itself is still established. Unit tests explicitly mock `src/services/mqtt/client` so they never touch the network at all.

## 10. Metric definitions & formulas (matching Bab III 3.11.3 exactly)

| # | Formula | Implementation |
|---|---|---|
| 1 | `A_tool = N_tool_correct / N_tests × 100%` | `evaluation/metrics/toolComparator.ts` + `reporters/aggregate.ts` |
| 2 | `A_parameter = N_parameter_correct / N_parameter_tested × 100%` | `evaluation/metrics/parameterComparator.ts` — **computed per parameter key**, not per record, per the "total number of parameters" definition |
| 3 | `L_LLM,i = t_response,i − t_request,i` | `runner/llmEvalRunner.ts`, `process.hrtime.bigint()` around `ChatService.query` |
| 4 | `L̄_LLM = Σ L_LLM,i / n` | `evaluation/metrics/latencyMetrics.ts` |
| 5 | `T_total,i = T_input,i + T_output,i` | `evaluation/metrics/costCalculator.ts` |
| 6 | `C_i = (T_input,i/1,000,000 × H_input) + (T_output,i/1,000,000 × H_output)` | `evaluation/metrics/costCalculator.ts`, rates from `config/pricing.json` |

Additional metrics (brief points 11–15):
- **Structure validity** (`structureValidator.ts`): validated against each tool's **actual** Zod schema (`deviceTools[i].schema`), not a re-implementation.
- **Schedule/Rule accuracy** (`scheduleComparator.ts`/`ruleComparator.ts`): semantic comparison (device/action/time/recurrence for schedules; trigger/condition/action for rules), `conditions`/`actions` arrays compared order-independently.
- **Value normalization** (`valueNormalizer.ts`): numbers vs numeric strings are treated as equal (`"30"` == `30`), whitespace is normalized; device names are compared case-insensitively (matching MySQL's default collation behavior used by `DeviceService.findByName`).
- **Error classification** (`errorClassifier.ts`): `WRONG_TOOL | INVALID_OR_MISSING_PARAMETER | INVALID_STRUCTURE | FAILED_CLARIFICATION | UNNECESSARY_TOOL_CALL | OTHER`. Mapping note: the brief lists "tool not called when it should have been" as a case separate from "wrong tool" — there's no dedicated bucket for it among the 5 official categories, so it's folded into `WRONG_TOOL` (still fundamentally a tool-selection failure, just an omission rather than a substitution). A single record can carry more than one error (point 15).
- **Clarification/invalid detection**: `clarificationCorrect`/`invalidCommandHandledCorrect` are derived purely from **whether a tool call happened or not** (direct evidence from the trace, 100% accurate). `clarificationRequested` (a separate field, not the source of truth for correctness) is a **keyword heuristic** (`?`, "yang mana", "maksud anda", etc. — see `llmEvalRunner.ts`) used only to distinguish a reply that reads like a clarifying question from an ordinary statement; don't use it as an accuracy measure without manual spot-checking.

## 11. Mapping to BAB IV

- **4.2 Functional and End-to-End Test Results** ← `--mode functional`, `functional-results.jsonl`, ACK definition in §9 `functionalRunner.ts` (polling `GET /api/v1/mqtt/devices/:id/status`, **not** a real protocol-level ACK — see §12 point 2).
- **4.3 LLM Model Evaluation and Comparison** ← `tabel-4.3-*.csv`, `tabel-4.4-*.csv`, `tabel-4.5-*.csv`, `tabel-4.6-*.csv`, `tabel-4.7-*.csv`.
- **4.4 Analysis by Complexity and Error Type** ← `tabel-4.8-kompleksitas.csv`, `tabel-4.9-distribusi-kesalahan.csv`.

## 12. Implementation gaps you should know before writing BAB IV

1. **"MCP" is not the real Model Context Protocol.** `src/services/mcp/**` is ordinary LangChain tool/function-calling (Zod + `bindTools`), not an actual JSON-RPC MCP client/server. The terms "MCP Client"/"MCP Server" in BAB II/III should be explicitly explained in BAB IV as internal architectural naming, not an implementation of Anthropic's official protocol.
2. **No real MQTT ACK.** `MQTTService.sendCommand` is fire-and-forget, with no command-id ↔ state-update correlation. `functionalRunner.ts` approximates "ACK" as *the device's state changing within a T-second window after the command* — documented as a limitation, not hidden.
3. **Table 3.8 (Function Schema) vs. the real implementation**: the 15 real tools use different names than the 11 *function schemas* in Table 3.8, and two of those 11 (`delete_schedule`, `update_dynamic_rule`) **have no corresponding capability at all** in the code (there's also no `get_rule_execution_logs` tool callable by the LLM, even though its REST endpoint exists). The `dataset.json` dataset follows the real code (your earlier decision) — cases TC097/TC098 deliberately test these two gaps as `invalid` scenarios. **Table 3.8 in the manuscript should be revised** to stay consistent with the Appendix/BAB IV.
4. **`set_actuator_state_by_device_name` rejects `hybrid` devices**, even though the system prompt (`DEVICE_CHAT_SYSTEM_PROMPT`) claims hybrid is supported. TC095/TC096 test this real behavior (rejected).
5. **RAG determinism**: embeddings are recomputed on every request (an API call, not cached), with no score threshold, and a retry-then-empty-fallback if Pinecone fails 3 times. If your knowledge base changes between data-collection sessions, RAG context can differ even for identical input — not a harness bug, just a property of production's `PineconeService.search`.
6. **State isolation**: `llmEvalRunner.ts` deliberately never sends `userId`/`sessionId` so `resolveMemoryScope()` returns `null` (no memory) — every repetition is genuinely clean, per point 21.

## 13. Testing

`evaluation/__tests__/*.test.ts` (Jest, same as `src/`) — covers `toolComparator`, `parameterComparator`, `scheduleComparator`, `ruleComparator`, `structureValidator`, `errorClassifier`, `costCalculator`, `latencyMetrics`, `valueNormalizer`, `dryRunGuard`, `retry`, `concurrency`, `resume`/`resultWriter`, `llmEvalRunner`, `functionalRunner`, `aggregate`, `bab4Tables`, `writeReports`, `args`, and `dataset.json` itself (schema validation + category distribution). Run with `npm test` (the root `jest.config.ts` already includes `evaluation/` in `roots`).
