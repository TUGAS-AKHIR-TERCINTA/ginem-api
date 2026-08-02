import { z } from 'zod'

/**
 * Tool schemas mirrored for evaluation (Zod validation of raw LLM tool calls).
 * Aligned with CORE/src/services/mcp/tools/device/* — do not modify production tools.
 */

export const scheduleCategorySchema = z.object({
  category: z.enum(['once', 'repeat'])
})

export const scheduleDateTimeSchema = z.object({
  hour: z.coerce.number().int().min(0).max(23),
  minute: z.coerce.number().int().min(0).max(59),
  date: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  day: z.coerce.number().int().min(1).max(31).optional()
})

export const listDevicesArgsSchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    size: z.coerce.number().int().positive().optional()
  })
  .passthrough()

export const getDeviceByIdArgsSchema = z
  .object({
    deviceId: z.coerce.number().int().positive()
  })
  .passthrough()

export const deviceNameArgsSchema = z
  .object({
    deviceName: z.string().min(1)
  })
  .passthrough()

export const createDeviceLogArgsSchema = z
  .object({
    deviceName: z.string().min(1),
    deviceLogData: z.union([z.string(), z.record(z.string(), z.unknown())])
  })
  .passthrough()

export const setActuatorArgsSchema = z
  .object({
    deviceName: z.string().min(1),
    state: z.enum(['on', 'off'])
  })
  .passthrough()

export const scheduleActuatorArgsSchema = z
  .object({
    deviceName: z.string().min(1),
    state: z.enum(['on', 'off'])
  })
  .merge(scheduleCategorySchema)
  .merge(scheduleDateTimeSchema)
  .passthrough()

export const scheduleSensorArgsSchema = z
  .object({
    deviceName: z.string().min(1)
  })
  .merge(scheduleCategorySchema)
  .merge(scheduleDateTimeSchema)
  .passthrough()

export const getScheduledJobResultArgsSchema = z
  .object({
    jobId: z.string().min(1)
  })
  .passthrough()

export const listScheduledJobsArgsSchema = z
  .object({
    limit: z.coerce.number().int().positive().optional()
  })
  .passthrough()

export const TOOL_ARG_SCHEMAS: Record<string, z.ZodTypeAny> = {
  list_devices: listDevicesArgsSchema,
  get_device_by_id: getDeviceByIdArgsSchema,
  get_last_log_by_device_name: deviceNameArgsSchema,
  get_last_10_logs_by_device_name: deviceNameArgsSchema,
  create_device_log: createDeviceLogArgsSchema,
  set_actuator_state_by_device_name: setActuatorArgsSchema,
  schedule_actuator_state_at: scheduleActuatorArgsSchema,
  schedule_sensor_data_at: scheduleSensorArgsSchema,
  get_scheduled_job_result: getScheduledJobResultArgsSchema,
  list_scheduled_jobs: listScheduledJobsArgsSchema
}

/** OpenAI/LangChain tool binding defs (JSON-schema style via Zod). */
export const EVAL_TOOL_DEFINITIONS = [
  {
    name: 'list_devices',
    description: 'List devices with optional pagination (page, size).',
    schema: listDevicesArgsSchema
  },
  {
    name: 'get_device_by_id',
    description: 'Get a single device by its numeric deviceId.',
    schema: getDeviceByIdArgsSchema
  },
  {
    name: 'get_last_log_by_device_name',
    description: 'Get the latest single log for a device by its name.',
    schema: deviceNameArgsSchema
  },
  {
    name: 'get_last_10_logs_by_device_name',
    description: 'Get the last 10 logs for a device by its name.',
    schema: deviceNameArgsSchema
  },
  {
    name: 'create_device_log',
    description: 'Create a new device log. Do NOT use for turn on/off actuators.',
    schema: createDeviceLogArgsSchema
  },
  {
    name: 'set_actuator_state_by_device_name',
    description: 'Turn ON or OFF an actuator by device name. state=on|off.',
    schema: setActuatorArgsSchema
  },
  {
    name: 'schedule_actuator_state_at',
    description:
      'Schedule actuator ON/OFF. category once|repeat, hour, minute (WIB). Optional date/year/month/day for once.',
    schema: scheduleActuatorArgsSchema
  },
  {
    name: 'schedule_sensor_data_at',
    description: 'Schedule sensor data fetch. category once|repeat, hour, minute (WIB).',
    schema: scheduleSensorArgsSchema
  },
  {
    name: 'get_scheduled_job_result',
    description: 'Get status/result of a scheduled job by jobId.',
    schema: getScheduledJobResultArgsSchema
  },
  {
    name: 'list_scheduled_jobs',
    description: 'List recent scheduled jobs.',
    schema: listScheduledJobsArgsSchema
  }
] as const

export function validateToolCallStructure(
  name: string,
  args: Record<string, unknown>
): { valid: boolean; error: string | null } {
  const schema = TOOL_ARG_SCHEMAS[name]
  if (!schema) {
    return { valid: false, error: `Unknown tool: ${name}` }
  }
  const parsed = schema.safeParse(args)
  if (!parsed.success) {
    return {
      valid: false,
      error: parsed.error.issues.map((i) => i.message).join('; ')
    }
  }
  return { valid: true, error: null }
}
