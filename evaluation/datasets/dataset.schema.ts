import { z } from 'zod'

/**
 * Ground truth is expressed against the REAL tool names implemented in
 * src/services/mcp/tools/device/** (see evaluation/README.md "Tabel 3.8 vs
 * implementasi" for the mapping back to the thesis's conceptual function schema).
 * Kept in sync manually — there is no single source-of-truth export of tool names
 * from the production code today.
 */
export const REAL_TOOL_NAMES = [
  'list_devices',
  'get_device_by_id',
  'get_last_log_by_device_name',
  'get_last_10_logs_by_device_name',
  'create_device_log',
  'set_actuator_state_by_device_name',
  'schedule_actuator_state_at',
  'schedule_sensor_data_at',
  'get_scheduled_job_result',
  'list_scheduled_jobs',
  'create_automation_rule',
  'list_automation_rules',
  'get_automation_rule',
  'set_automation_rule_active',
  'delete_automation_rule'
] as const

export const datasetCategorySchema = z.enum([
  'simple',
  'medium',
  'complex',
  'ambiguous',
  'invalid'
])
export type DatasetCategory = z.infer<typeof datasetCategorySchema>

export const expectedBehaviorSchema = z.enum([
  'tool_call',
  'clarification',
  'reject_or_no_tool'
])
export type ExpectedBehavior = z.infer<typeof expectedBehaviorSchema>

export const expectedToolCallSchema = z.object({
  tool: z.enum(REAL_TOOL_NAMES),
  parameters: z.record(z.string(), z.unknown())
})
export type ExpectedToolCall = z.infer<typeof expectedToolCallSchema>

export const expectedScheduleSchema = z.object({
  deviceName: z.string(),
  action: z.enum(['on', 'off']).optional(),
  category: z.enum(['once', 'repeat']),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  timezone: z.literal('Asia/Jakarta').default('Asia/Jakarta')
})
export type ExpectedSchedule = z.infer<typeof expectedScheduleSchema>

export const expectedRuleSchema = z.object({
  triggerDeviceName: z.string(),
  triggerMetric: z.string(),
  conditions: z
    .array(
      z.object({
        deviceName: z.string().optional(),
        metric: z.string(),
        operator: z.enum(['>', '>=', '<', '<=', '==', '!=']),
        threshold: z.number()
      })
    )
    .min(1),
  actions: z
    .array(
      z.object({
        deviceName: z.string(),
        state: z.enum(['on', 'off'])
      })
    )
    .min(1),
  conditionLogic: z.enum(['AND', 'OR']).default('AND')
})
export type ExpectedRule = z.infer<typeof expectedRuleSchema>

export const datasetCaseSchema = z.object({
  id: z.string().min(1),
  category: datasetCategorySchema,
  input: z.string().min(1),
  notes: z.string().optional(),
  expected: z.object({
    behavior: expectedBehaviorSchema,
    toolCalls: z.array(expectedToolCallSchema).optional(),
    schedule: z.array(expectedScheduleSchema).optional(),
    rule: z.array(expectedRuleSchema).optional()
  })
})
export type DatasetCase = z.infer<typeof datasetCaseSchema>

/**
 * dataset.json is a single pretty-printed JSON array (not JSON Lines) so it's easy
 * to read/edit by hand — see evaluation/README.md. Parses the whole file at once;
 * error messages reference the array index (1-based) of the offending entry.
 */
export function parseDatasetFile(content: string): DatasetCase[] {
  let json: unknown
  try {
    json = JSON.parse(content)
  } catch (err) {
    throw new Error(`dataset.json: invalid JSON — ${String(err)}`)
  }

  if (!Array.isArray(json)) {
    throw new Error('dataset.json: expected a top-level JSON array of test cases')
  }

  return json.map((item, index) => {
    const result = datasetCaseSchema.safeParse(item)
    if (!result.success) {
      throw new Error(
        `dataset.json item ${index + 1}: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
      )
    }
    return result.data
  })
}
