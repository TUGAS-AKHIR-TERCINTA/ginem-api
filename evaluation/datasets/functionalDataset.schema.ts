import { z } from 'zod'

/**
 * BAB 4.2 dataset — deliberately small and separate from dataset.json (BAB 4.3).
 * This one drives the REAL pipeline (HTTP -> RabbitMQ -> ChatService -> real tools
 * -> real MQTT -> real ESP32) per poin 3/4 of the brief. 'device_control' kinds get
 * ACK-polled against GET /api/v1/mqtt/devices/:deviceId/status; everything else is
 * scored purely on whether the pipeline behaved as expected.
 */
export const functionalTestKindSchema = z.enum([
  'device_control',
  'sensor_read',
  'device_status',
  'scheduler',
  'rule',
  'ambiguous',
  'invalid'
])
export type FunctionalTestKind = z.infer<typeof functionalTestKindSchema>

export const functionalTestCaseSchema = z.object({
  id: z.string().min(1),
  kind: functionalTestKindSchema,
  input: z.string().min(1),
  notes: z.string().optional(),
  /** Required for kind='device_control' — the device to poll for an ACK/state change. */
  deviceName: z.string().optional(),
  /** Expected final MQTT state payload value ('1' | '0') after the command is applied. */
  expectedFinalState: z.enum(['1', '0']).optional(),
  /** Whether the pipeline is expected to actually act (false for ambiguous/invalid cases). */
  expectExecution: z.boolean()
})
export type FunctionalTestCase = z.infer<typeof functionalTestCaseSchema>

export function parseFunctionalDatasetLine(
  line: string,
  lineNumber: number
): FunctionalTestCase {
  let json: unknown
  try {
    json = JSON.parse(line)
  } catch (err) {
    throw new Error(
      `functional-dataset.jsonl line ${lineNumber}: invalid JSON — ${String(err)}`
    )
  }
  const result = functionalTestCaseSchema.safeParse(json)
  if (!result.success) {
    throw new Error(
      `functional-dataset.jsonl line ${lineNumber}: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
    )
  }
  return result.data
}
