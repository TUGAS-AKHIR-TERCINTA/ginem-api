# Evaluation Module

Alat bantu pengambilan data BAB IV untuk skripsi *"Rancang Bangun dan Implementasi AI Agent Berbasis LLM untuk Kontrol dan Monitoring Perangkat IoT Menggunakan Natural Language"*. Modul ini **tidak menduplikasi** logic produksi — ia memanggil `ChatService`/`LLMService`/tool asli di `src/services/**` secara langsung (in-process untuk BAB 4.3, lewat HTTP untuk BAB 4.2), sehingga yang diuji adalah sistem yang benar-benar dipakai pengguna, bukan tiruannya.

## 1. Tujuan

Dua jenis pengujian yang **sengaja dipisah** (lihat poin 34 metodologi):

| | BAB 4.2 — Functional & End-to-End | BAB 4.3/4.4 — LLM Evaluation |
|---|---|---|
| Yang diuji | Sistem penuh: AI Agent → tool → backend → MQTT → ESP32 → ACK | Kualitas keputusan LLM: pemilihan tool, parameter, struktur output |
| Perangkat fisik | Ya, wajib (ESP32 + DHT11 + relay nyata) | Tidak — MQTT publish & DB write di-*dry-run* |
| Runner | `evaluation/runner/functionalRunner.ts` | `evaluation/runner/llmEvalRunner.ts` |
| Dataset | `evaluation/datasets/functional-dataset.jsonl` (8 skenario) | `evaluation/datasets/dataset.jsonl` (100 kasus) |
| CLI | `npm run evaluate -- --mode functional` | `npm run evaluate -- --mode llm-eval` (default) |

Kegagalan MQTT/ESP32 **tidak pernah** dihitung sebagai kesalahan model — BAB 4.3 tidak menyentuh MQTT sama sekali (lihat §9 "Dry-run" di bawah).

## 2. Struktur dataset

### `dataset.jsonl` (BAB 4.3, 100 kasus — 35 sederhana / 25 menengah / 20 kompleks / 10 ambigu / 10 tidak valid)

```json
{"id":"TC001","category":"simple","input":"Nyalakan lampu kamar","expected":{"behavior":"tool_call","toolCalls":[{"tool":"set_actuator_state_by_device_name","parameters":{"deviceName":"Smart Lamp Bedroom","state":"on"}}]}}
```

- `expected.behavior`: `tool_call` | `clarification` | `reject_or_no_tool`.
- `expected.toolCalls`: array (bisa >1 untuk kasus kompleks, mis. TC075 nyalakan+jadwalkan-mati).
- `expected.schedule` / `expected.rule`: representasi terstruktur tambahan untuk `scheduleComparator`/`ruleComparator` (Ketepatan Jadwal / Ketepatan Dynamic Rule di Tabel 4.4).
- Skema penuh + validasi: `evaluation/datasets/dataset.schema.ts` (Zod). Setiap baris divalidasi otomatis oleh `evaluation/__tests__/dataset.test.ts`.
- **Nama device di dataset mengikuti `resources/seeders/2_deviceSeeder.js`** (`Smart Lamp Bedroom`, `Temperature Sensor Living Room`, `Humidity Sensor Greenhouse`, `Smart Gate Controller`). Kalau database evaluasi Anda punya device dengan nama berbeda, edit `dataset.jsonl` langsung (plain JSONL, satu baris = satu kasus, gampang diedit teks biasa) — ground truth harus cocok persis dengan apa yang ada di DB target.

### `functional-dataset.jsonl` (BAB 4.2, 8 kasus — persis Tabel 4.1)

Kalimat perintah dan urutan skenarionya sudah disamakan persis dengan Tabel 4.1 (`Nyalakan lampu ruang tamu`, `Nyalakan kipas jika suhu di atas 30 °C`, dst). Field tambahan: `deviceName` (untuk polling ACK), `expectedFinalState` (`"1"`/`"0"`), `expectExecution`.

Device yang dipakai — `Lampu Ruang Tamu`, `Sensor Suhu Ruangan`, `Kipas` — **sengaja beda nama dari seeder** (`resources/seeders/2_deviceSeeder.js` dipakai `dataset.jsonl`/BAB 4.3, dalam bahasa Inggris) supaya kedua dataset tidak saling bentrok. Karena BAB 4.2 menyasar perangkat fisik sungguhan, **pastikan device dengan nama-nama tersebut benar-benar terdaftar di database yang dipakai ESP32 Anda** sebelum menjalankan — kalau nama device asli Anda berbeda, edit `deviceName`/`input` di file ini langsung (plain JSONL, gampang diedit) agar cocok persis. Skenario No.6 (Kipas) butuh device actuator baru — seeder tidak menyediakannya secara default.

## 3. Cara menjalankan

```bash
npm run evaluate                                    # llm-eval, semua model, 3 repetisi, seluruh dataset
npm run evaluate -- --model all --repetitions 3
npm run evaluate -- --model openai:gpt-5.6-terra --category simple,ambiguous
npm run evaluate -- --mode functional               # BAB 4.2, butuh ESP32 nyata online
npm run evaluate -- --mode report --resume run-2026-08-19-1200   # regenerate CSV/summary tanpa run ulang
```

Opsi CLI (`evaluation/cli/args.ts`): `--mode llm-eval|functional|report`, `--model all|<key1,key2,...>`, `--dataset <path>`, `--repetitions <n>`, `--category <cat1,cat2,...>`, `--output <dir>`, `--resume <runId>`, `--concurrency <n>`, `--max-retries <n>`, `--dry-run` (diterima untuk kompatibilitas, tidak melakukan apa-apa — lihat §9).

## 4. Environment variables

Lihat blok `# Evaluation runner` di `.env.example`. Yang **wajib** diisi sebelum run sungguhan:

| Var | Untuk | Catatan |
|---|---|---|
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY` | llm-eval | Sudah ada di `.env.example`; `ANTHROPIC_API_KEY` baru ditambahkan modul ini (§8). |
| `EVAL_OPENAI_MODEL`, `EVAL_ANTHROPIC_MODEL`, `EVAL_DEEPSEEK_MODEL` | llm-eval | **Isi dengan model id resmi dari akun API Anda** — default di `models.config.ts` (`gpt-5.6-terra`, `claude-sonnet-5`, `deepseek-v4-flash`) adalah tebakan terbaik dari nama di Tabel 3.10, BUKAN string API yang sudah diverifikasi. |
| `EVAL_API_EMAIL`, `EVAL_API_PASSWORD` | functional | Akun login yang sudah terdaftar di sistem (dipakai untuk `POST /api/v1/auth/login`). |
| `EVAL_API_BASE_URL` | functional | Default `http://localhost:8000`. |
| `DB_*`, `REDIS_*` | keduanya | **Sangat disarankan pakai database terpisah/disposable untuk evaluasi** — lihat §9, `RuleManagementService` tetap menulis ke DB sungguhan saat llm-eval. |
| `EVAL_REPETITIONS`, `EVAL_CONCURRENCY`, `EVAL_MAX_RETRIES`, `EVAL_RETRY_BASE_DELAY_MS` | llm-eval | Default 3 / 2 / 2 / 1000ms — konservatif terhadap rate limit provider (poin 27). |
| `EVAL_MQTT_ACK_TIMEOUT_MS`, `EVAL_MQTT_ACK_POLL_INTERVAL_MS` | functional | Default 10000ms / 500ms. |
| `EVAL_USD_TO_IDR` | reporting | Opsional, konversi manual saat menulis laporan — semua angka mentah tetap USD. |

## 5. Model configuration

`evaluation/config/models.config.ts` — persis Tabel 3.10 (`temperature=0.2`, `maxTokens=1024`, tanpa fine-tuning, integrasi API). `evaluation/config/pricing.json` — persis Tabel 3.13 (tanggal acuan 2 Agustus 2026); **update file ini sebelum run final** kalau tarif provider berubah, jangan hardcode di logic perhitungan (poin 18).

## 6. Output

```
evaluation/results/run-YYYY-MM-DD-HHmm/
  config.json                        # snapshot konfigurasi run ini
  raw-results.jsonl                  # 1 baris = 1 (dataset x model x repetisi), ditulis incremental
  errors.jsonl                       # subset raw-results yang gagal transport (retry habis)
  summary.json                       # aggregate per model + per (model x kompleksitas)
  tool-accuracy.csv, parameter-accuracy.csv, latency.csv,
  token-cost.csv, complexity.csv, error-distribution.csv   # data mentah utk analisis ulang (poin 23)
  tabel-4.3-ketepatan-tool.csv       # siap tempel ke BAB IV (poin 24), kolom sama persis
  tabel-4.4-parameter-struktur.csv
  tabel-4.5-latensi.csv
  tabel-4.7-token-biaya.csv
  tabel-4.8-kompleksitas.csv
  tabel-4.9-distribusi-kesalahan.csv
```

BAB 4.2 (`--mode functional`) menulis `functional-results.jsonl` di direktori run yang sama (tidak menghasilkan tabel BAB IV otomatis karena hanya 8 kasus — lihat Tabel 3.11-style ringkasan manual dari file ini).

## 7. Cara resume

`npm run evaluate -- --resume run-2026-08-19-1200 ...` (flag lain harus sama seperti run pertama — model/dataset/repetitions). Runner membaca `raw-results.jsonl` yang sudah ada dan **hanya melewati** record yang `errorType == null` (sukses) — record yang gagal setelah retry habis akan dicoba ulang, sesuai poin 26.

## 8. Perubahan pada kode produksi (additive, tidak mengubah default behavior)

1. **`src/services/llm/LLM.service.ts`** — tambah `provider: 'anthropic'` (dependency `@langchain/anthropic`). Default tetap `'openai'`; jalur produksi (`ChatService.defaultAgent`, yang memanggil `LLMService.create()` tanpa argumen) tidak berubah sama sekali.
2. **`src/services/chat/Chat.service.ts`** — `ChatQueryTrace` dapat field opsional `tokenUsage` (`inputTokens`/`outputTokens`/`totalTokens`), diekstrak dari `usage_metadata` LangChain. Hanya terisi saat `captureTrace: true` — flag yang sudah ada sebelumnya khusus untuk evaluasi/eksperimen, tidak pernah aktif di jalur HTTP produksi (`ChatMessageBroker` tidak meneruskan `trace` ke reply RPC).

Tidak ada tabel/migration MySQL baru — seluruh output evaluasi adalah file (poin 23).

## 9. Dry-run (BAB 4.3) — apa yang di-*mock*, apa yang tetap nyata

`evaluation/agent/dryRunGuard.ts` menukar **hanya** fungsi bersisi-efek-samping dengan versi in-memory, tanpa mengubah `src/services/mcp/tools/**`:

| Fungsi asli | Diintersep? | Alasan |
|---|---|---|
| `MQTTService.publishActuatorState` | Ya | Satu-satunya titik yang benar-benar mengirim command ke device fisik. |
| `DeviceLogService.create` | Ya | Mencegah polusi `device_logs` DAN mencegah state bocor antar repetisi (baca ulang oleh `get_last_log_by_device_name` di repetisi berikutnya). |
| `scheduleActuatorState`/`scheduleActuatorStateRepeat`/`scheduleSensorData`/`scheduleSensorDataRepeat` (DeviceSchedule.service) | Ya | Menghindari tulis `scheduler_logs` + enqueue BullMQ/Redis sungguhan; mengembalikan objek job palsu yang bentuknya tetap valid. |
| `DeviceService.findByName` (resolusi device) | **Tidak** | Ini justru bagian yang dievaluasi — apakah LLM menyebut nama device yang benar. |
| Validasi Zod tiap tool | **Tidak** | Reused apa adanya dari `src/services/mcp/tools/**`. |
| `RuleManagementService.create/setActive/remove` | **Tidak** | Baris rule tidak berefek fisik (baru aktif kalau ada telemetry MQTT asli, yang tidak pernah dikirim runner ini) dan meniru transaksi 4-tabelnya akan menduplikasi logic produksi. **Konsekuensi: jalankan evaluasi terhadap database terpisah/disposable**, bukan production DB. |

**Temuan penting (runtime, wajib dijaga)**: CLI dijalankan dengan **`ts-node --transpile-only`, bukan `tsx`**. `tsx` (esbuild) mengompilasi named export jadi *accessor property* read-only (`configurable:false`, tanpa setter) demi meniru live-binding ESM murni, sehingga `dryRunGuard.ts` gagal total saat runtime dengan error `Cannot set property ... which has only a getter` — walau lolos di bawah `ts-jest` (yang memakai transform `tsc` asli, hasilnya property biasa yang bisa ditimpa; ini sempat lolos semua unit test tapi baru ketahuan gagal saat sample run CLI sungguhan, sehingga verifikasi Tahap 5 ini penting). `--transpile-only` dipakai karena `ts-node` full-type-check bisa >60 detik hanya untuk boot (banyak modul produksi ter-import transitif) — transpile-only tetap menghasilkan bentuk CJS yang sama (property biasa, bisa ditimpa), hanya melewati proses type-check saat start. Jangan ganti `"evaluate"` script di `package.json` kembali ke `tsx` tanpa merombak ulang mekanisme dry-run, dan jangan hapus `--transpile-only` tanpa menerima boot time yang jauh lebih lambat.

`main()` di `evaluation/cli/evaluate.ts` memanggil `process.exit(0)` eksplisit setelah selesai — mengimpor `MQTTService`/BullMQ membuka koneksi nyata yang membuat Node tidak pernah keluar sendiri walau seluruh pekerjaan sudah selesai.

**Temuan penting**: mengimpor `MQTTService` (lewat `src/services/mqtt/client.ts`) membuka koneksi MQTT sungguhan ke broker HiveMQ yang dikonfigurasi di `.env` **pada saat import**, bukan lazy. Ini berarti proses `npm run evaluate` (mode `llm-eval`) tetap membuka koneksi nyata ke broker Anda — **tidak pernah mengirim command** (karena `publishActuatorState` sudah diganti), tapi koneksinya sendiri tetap terbentuk. Test unit me-mock `src/services/mqtt/client` secara eksplisit supaya tidak menyentuh jaringan sama sekali.

## 10. Definisi metrik & rumus (persis Bab III 3.11.3)

| # | Rumus | Implementasi |
|---|---|---|
| 1 | `A_tool = N_tool_benar / N_pengujian × 100%` | `evaluation/metrics/toolComparator.ts` + `reporters/aggregate.ts` |
| 2 | `A_parameter = N_parameter_benar / N_parameter_diuji × 100%` | `evaluation/metrics/parameterComparator.ts` — **dihitung per-key parameter**, bukan per-record, sesuai definisi "jumlah seluruh parameter" |
| 3 | `L_LLM,i = t_respons,i − t_permintaan,i` | `runner/llmEvalRunner.ts`, `process.hrtime.bigint()` di sekitar `ChatService.query` |
| 4 | `L̄_LLM = Σ L_LLM,i / n` | `evaluation/metrics/latencyMetrics.ts` |
| 5 | `T_total,i = T_input,i + T_output,i` | `evaluation/metrics/costCalculator.ts` |
| 6 | `C_i = (T_input,i/1.000.000 × H_input) + (T_output,i/1.000.000 × H_output)` | `evaluation/metrics/costCalculator.ts`, tarif dari `config/pricing.json` |

Metrik tambahan (poin 11–15 brief):
- **Structure validity** (`structureValidator.ts`): divalidasi terhadap Zod schema **asli** tiap tool (`deviceTools[i].schema`), bukan re-implementasi.
- **Schedule/Rule accuracy** (`scheduleComparator.ts`/`ruleComparator.ts`): perbandingan semantik (device/action/waktu/recurrence untuk jadwal; trigger/condition/action untuk rule), array `conditions`/`actions` dibandingkan tanpa peduli urutan.
- **Normalisasi nilai** (`valueNormalizer.ts`): angka vs string-angka dianggap sama (`"30"` == `30`), whitespace dirapikan; nama device tetap *case-sensitive* (mengikuti `DeviceService.findByName` yang exact-match).
- **Error classification** (`errorClassifier.ts`): `WRONG_TOOL | INVALID_OR_MISSING_PARAMETER | INVALID_STRUCTURE | FAILED_CLARIFICATION | UNNECESSARY_TOOL_CALL | OTHER`. Catatan pemetaan: brief menyebut "tool tidak dipanggil padahal seharusnya dipanggil" sebagai kasus terpisah dari "tool salah" — tidak ada bucket khusus di 5 kategori resmi, sehingga digabung ke `WRONG_TOOL` (tetap kegagalan pemilihan tool, hanya jenis omisi bukan substitusi). Satu record bisa punya >1 error (poin 15).
- **Clarification/invalid detection**: `clarificationCorrect`/`invalidCommandHandledCorrect` murni dari **ada/tidaknya tool call** (bukti langsung dari trace, akurat 100%). `clarificationRequested` (field terpisah, bukan penentu kebenaran) adalah **heuristik kata kunci** (`?`, "yang mana", "maksud anda", dst. — lihat `llmEvalRunner.ts`) untuk membedakan reply berupa pertanyaan klarifikasi vs pernyataan biasa; jangan dipakai sebagai ukuran akurasi tanpa spot-check manual.

## 11. Pemetaan ke BAB IV

- **4.2 Hasil Pengujian Fungsional dan End-to-End** ← `--mode functional`, `functional-results.jsonl`, definisi ACK di §9 `functionalRunner.ts` (polling `GET /api/v1/mqtt/devices/:id/status`, **bukan** ACK protokol asli — lihat §12 poin 2).
- **4.3 Evaluasi dan Perbandingan Model LLM** ← `tabel-4.3-*.csv`, `tabel-4.4-*.csv`, `tabel-4.5-*.csv`, `tabel-4.7-*.csv`.
- **4.4 Analisis Berdasarkan Kompleksitas dan Kesalahan** ← `tabel-4.8-kompleksitas.csv`, `tabel-4.9-distribusi-kesalahan.csv`.

## 12. Ketidaksesuaian implementasi yang perlu diketahui sebelum menulis BAB IV

1. **"MCP" bukan Model Context Protocol asli.** `src/services/mcp/**` adalah tool/function-calling LangChain biasa (Zod + `bindTools`), bukan JSON-RPC MCP client/server sungguhan. Istilah "MCP Client"/"MCP Server" di BAB II/III sebaiknya dijelaskan eksplisit di BAB IV sebagai penamaan arsitektural internal, bukan implementasi protokol resmi Anthropic.
2. **Tidak ada ACK MQTT sungguhan.** `MQTTService.sendCommand` fire-and-forget, tidak ada korelasi command-id ↔ state update. `functionalRunner.ts` mengaproksimasi "ACK" sebagai *state device berubah dalam window T detik setelah command* — didokumentasikan sebagai keterbatasan, bukan disembunyikan.
3. **Tabel 3.8 (Function Schema) vs implementasi nyata**: 15 tools nyata memakai nama berbeda dari 11 *function schema* di Tabel 3.8, dan dua di antaranya (`delete_schedule`, `update_dynamic_rule`) **tidak ada capability-nya sama sekali** di kode (juga tidak ada `get_rule_execution_logs` sebagai tool yang bisa dipanggil LLM, walau endpoint REST-nya ada). Dataset `dataset.jsonl` mengikuti kode nyata (keputusan Anda sebelumnya) — kasus TC097/TC098 sengaja menguji dua gap ini sebagai skenario `invalid`. **Tabel 3.8 di naskah perlu direvisi** agar konsisten dengan Lampiran/BAB IV.
4. **`set_actuator_state_by_device_name` menolak device `hybrid`**, walau system prompt (`DEVICE_CHAT_SYSTEM_PROMPT`) menyebut hybrid didukung. TC095/TC096 menguji perilaku nyata ini (ditolak).
5. **Determinisme RAG**: embedding dihitung ulang tiap request (panggilan API, bukan cache), tanpa score threshold, dengan retry-lalu-fallback-kosong kalau Pinecone gagal 3x. Kalau knowledge base Anda berubah antar sesi pengambilan data, konteks RAG bisa berbeda meski input identik — bukan bug harness, melainkan sifat `PineconeService.search` produksi.
6. **State isolation**: `llmEvalRunner.ts` sengaja tidak mengirim `userId`/`sessionId` supaya `resolveMemoryScope()` mengembalikan `null` (tidak ada memory) — setiap repetisi benar-benar bersih, sesuai poin 21.

## 13. Testing

`evaluation/__tests__/*.test.ts` (Jest, sama seperti `src/`) — mencakup `toolComparator`, `parameterComparator`, `scheduleComparator`, `ruleComparator`, `structureValidator`, `errorClassifier`, `costCalculator`, `latencyMetrics`, `valueNormalizer`, `dryRunGuard`, `retry`, `concurrency`, `resume`/`resultWriter`, `llmEvalRunner`, `functionalRunner`, `aggregate`, `bab4Tables`, `writeReports`, `args`, dan `dataset.jsonl` itu sendiri (validasi skema + distribusi kategori). Jalankan dengan `npm test` (root `jest.config.ts` sudah mencakup `evaluation/` di `roots`).
