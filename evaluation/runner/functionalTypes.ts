import type { FunctionalTestKind } from '../datasets/functionalDataset.schema'

/**
 * BAB 4.2 raw record — poin 4: request_started_at / llm timestamps aren't observable
 * from outside the HTTP boundary without threading trace through the RabbitMQ reply
 * (deliberately not done — see evaluation/README.md "BAB 4.2 trace" decision), so this
 * captures request/response wall-clock plus the polled MQTT ACK, not LLM/tool sub-stages.
 */
export interface FunctionalEvaluationRecord {
  runId: string
  testCaseId: string
  kind: FunctionalTestKind
  inputText: string

  requestStartedAt: string
  responseCompletedAt: string
  apiRoundTripMs: number

  reply: string | null

  deviceId: number | null
  deviceName: string | null
  expectedFinalState: '1' | '0' | null

  /** poin 4: only meaningful for kind='device_control' — polled via GET /mqtt/devices/:id/status. */
  mqttAckAt: string | null
  ackReceived: boolean
  finalDeviceStatus: unknown

  /** requestStartedAt -> mqttAckAt. Null for scheduler/rule/read-only/ambiguous/invalid cases (poin 4/34: not a normal latency). */
  endToEndLatencyMs: number | null

  integrationSuccess: boolean
  mqttSuccess: boolean
  errorMessage: string | null
  timestamp: string
}
