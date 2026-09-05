import path from 'path'

export const evaluationConfig = {
  /** Tugas Akhir default: setiap data diuji 3 kali per model. */
  defaultRepetitions: Number(process.env.EVAL_REPETITIONS ?? 3),
  /** Conservative default — respects provider rate limits (poin 27). */
  defaultConcurrency: Number(process.env.EVAL_CONCURRENCY ?? 2),
  maxRetries: Number(process.env.EVAL_MAX_RETRIES ?? 2),
  retryBaseDelayMs: Number(process.env.EVAL_RETRY_BASE_DELAY_MS ?? 1000),
  /** Functional runner (BAB 4.2): how long to poll for a device ACK/state change. */
  mqttAckTimeoutMs: Number(process.env.EVAL_MQTT_ACK_TIMEOUT_MS ?? 10000),
  mqttAckPollIntervalMs: Number(process.env.EVAL_MQTT_ACK_POLL_INTERVAL_MS ?? 500),
  /**
   * How old a device_logs row may be to still count as proof MQTT telemetry is
   * flowing for a sensor_read case (poin 34). Default 15 min is a conservative
   * guess — this repo has no ESP32 firmware to read the real push interval from;
   * tighten it if your device pushes more often.
   */
  sensorFreshnessMs: Number(process.env.EVAL_SENSOR_FRESHNESS_MS ?? 900000),
  datasetPath:
    process.env.EVAL_DATASET_PATH ??
    path.join(__dirname, '..', 'datasets', 'dataset.json'),
  resultsRootDir: process.env.EVAL_RESULTS_DIR ?? path.join(__dirname, '..', 'results'),
  /** Backend base URL for the functional (BAB 4.2) runner — real HTTP pipeline. */
  apiBaseUrl: process.env.EVAL_API_BASE_URL ?? 'http://localhost:8000',
  /** Login credentials for an existing account, used only by the functional (BAB 4.2) runner. */
  apiEmail: process.env.EVAL_API_EMAIL,
  apiPassword: process.env.EVAL_API_PASSWORD,
  functionalDatasetPath:
    process.env.EVAL_FUNCTIONAL_DATASET_PATH ??
    path.join(__dirname, '..', 'datasets', 'functional-dataset.jsonl'),
  usdToIdrRate: Number(process.env.EVAL_USD_TO_IDR ?? 0)
}
