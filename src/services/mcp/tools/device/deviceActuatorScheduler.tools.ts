import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { DeviceService } from '../../../Device.service'
import { DeviceLogService } from '../../../DeviceLog.service'
import {
  scheduleActuatorState,
  scheduleSensorData,
  getScheduledJob,
  listScheduledJobs
} from '../../DeviceSchedule.service'
import { MQTTService } from '../../../mqtt/MQTT.service'
import {
  formatScheduleWib,
  resolveScheduleDateTime
} from '../../../scheduler/deviceSchedule.datetime'
import { AppError } from '../../../../utilities/AppError'

const scheduleDateTimeSchema = z.object({
  hour: z
    .number()
    .int()
    .min(0)
    .max(23)
    .describe('Hour 0–23 (24h, WIB). Required. e.g. "jam 10:11" → hour=10'),
  minute: z
    .number()
    .int()
    .min(0)
    .max(59)
    .describe('Minute 0–59. Required. e.g. "jam 10:11" → minute=11'),
  date: z
    .string()
    .optional()
    .describe(
      'Optional specific date DD-MM-YYYY (e.g. "09-06-2026") or YYYY-MM-DD. Omit when user only says a time (defaults to today WIB).'
    ),
  year: z
    .number()
    .int()
    .min(2024)
    .max(2100)
    .optional()
    .describe(
      'Optional year. Omit for today. Use with month+day if not using date string.'
    ),
  month: z
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .describe('Optional month 1–12. Omit for today.'),
  day: z
    .number()
    .int()
    .min(1)
    .max(31)
    .optional()
    .describe('Optional day 1–31. Omit for today.')
})

function buildScheduleResponse(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  timeOnly: boolean
}) {
  return {
    ...parts,
    timezone: 'WIB (UTC+7)',
    label: formatScheduleWib(parts),
    inferredDate: parts.timeOnly
      ? 'today (or tomorrow if time already passed)'
      : 'explicit'
  }
}

export const setActuatorStateByDeviceNameTool = tool(
  async ({ deviceName, state }) => {
    const device = await DeviceService.findByName(deviceName)

    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }

    if (device.deviceType !== 'actuator') {
      return JSON.stringify({
        error: 'Device is not an actuator',
        deviceName,
        deviceType: device.deviceType,
        message:
          'Only devices with deviceType "actuator" can be turned on or off. Use create_device_value for other devices.'
      })
    }

    const deviceLogData = state === 'on' ? '1' : '0'

    const deviceLog = await DeviceLogService.create({
      deviceLogDeviceId: device.deviceId,
      deviceLogData
    })

    MQTTService.publishActuatorState(device.deviceId, state)

    return JSON.stringify(
      {
        success: true,
        message:
          state === 'on' ? 'Device turned on (value 1)' : 'Device turned off (value 0)',
        deviceName,
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        deviceLogId: deviceLog.deviceLogId,
        deviceLogData: deviceLog.deviceLogData,
        createdAt: deviceLog.createdAt,
        mqtt: {
          topic: `iot/v1/device/${device.deviceId}/command`,
          value: deviceLogData,
          brokerConnected: MQTTService.isConnected()
        }
      },
      null,
      2
    )
  },
  {
    name: 'set_actuator_state_by_device_name',
    description:
      'Turn ON or OFF an actuator device by its name. First checks that the device exists and has deviceType "actuator". "Hidupkan" / turn on / nyalakan → creates device value with value "1". "Matikan" / turn off / padamkan → creates device value with value "0". Use this when the user says hidupkan (device name), matikan (device name), turn on, turn off, nyalakan, padamkan, or similar instructions to control an actuator.',
    schema: z.object({
      deviceName: z
        .string()
        .min(1)
        .describe('The exact device name (must be an actuator)'),
      state: z
        .enum(['on', 'off'])
        .describe('on = hidupkan / value 1, off = matikan / value 0')
    })
  }
)

/**
 * Schedule turning on/off an actuator at a specific date and time (WIB).
 */
export const scheduleActuatorStateAtDatetimeTool = tool(
  async ({ deviceName, state, hour, minute, date, year, month, day }) => {
    try {
      const device = await DeviceService.findByName(deviceName)

      if (device == null) {
        return JSON.stringify({ error: 'Device not found', deviceName })
      }

      if (device.deviceType !== 'actuator') {
        return JSON.stringify({
          error: 'Device is not an actuator',
          deviceName,
          deviceType: device.deviceType,
          message: 'Only actuators can be scheduled to turn on/off.'
        })
      }

      const resolved = resolveScheduleDateTime({ hour, minute, date, year, month, day })
      const job = await scheduleActuatorState(deviceName, state, resolved.runAt)

      return JSON.stringify(
        {
          success: true,
          message: `Scheduled: ${state === 'on' ? 'Turn on' : 'Turn off'} "${deviceName}" at ${formatScheduleWib(resolved)}`,
          jobId: job.id,
          deviceName: job.deviceName,
          state: job.state,
          runAt: job.runAt.toISOString(),
          schedule: buildScheduleResponse(resolved)
        },
        null,
        2
      )
    } catch (err) {
      if (err instanceof AppError) {
        return JSON.stringify({ error: err.message })
      }
      throw err
    }
  },
  {
    name: 'schedule_actuator_state_at',
    description:
      'Schedule turning ON or OFF an actuator at a time (WIB). TWO modes: (1) TIME ONLY — user says "hidupkan lampu depan di jam 10:11 WIB" → set hour=10, minute=11, leave date/year/month/day empty (schedules TODAY at 10:11 WIB; if that time already passed, schedules TOMORROW). (2) SPECIFIC DATE — user says "hidupkan lampu depan di 09-06-2026 jam 10:11" → set date="09-06-2026", hour=10, minute=11. Also works for "besok jam 8" (compute tomorrow date), "10 Juni 2026 jam 14:30", etc.',
    schema: z
      .object({
        deviceName: z
          .string()
          .min(1)
          .describe('The exact device name (must be an actuator)'),
        state: z.enum(['on', 'off']).describe('on = hidupkan, off = matikan')
      })
      .merge(scheduleDateTimeSchema)
  }
)

/**
 * Schedule fetching sensor/device data at a specific date and time (WIB).
 */
export const scheduleSensorDataAtDatetimeTool = tool(
  async ({ deviceName, hour, minute, date, year, month, day }) => {
    try {
      const device = await DeviceService.findByName(deviceName)

      if (device == null) {
        return JSON.stringify({ error: 'Device not found', deviceName })
      }

      const resolved = resolveScheduleDateTime({ hour, minute, date, year, month, day })
      const job = await scheduleSensorData(deviceName, resolved.runAt)

      return JSON.stringify(
        {
          success: true,
          message: `Scheduled: fetch data for "${deviceName}" at ${formatScheduleWib(resolved)}. Use get_scheduled_job_result with jobId after it runs.`,
          jobId: job.id,
          deviceName: job.deviceName,
          runAt: job.runAt.toISOString(),
          schedule: buildScheduleResponse(resolved)
        },
        null,
        2
      )
    } catch (err) {
      if (err instanceof AppError) {
        return JSON.stringify({ error: err.message })
      }
      throw err
    }
  },
  {
    name: 'schedule_sensor_data_at',
    description:
      'Schedule fetching sensor/device data (last 10 values) at a time (WIB). TIME ONLY: "kasih data sensor jam 9:00" → hour=9, minute=0, no date (today WIB). SPECIFIC DATE: "kasih data sensor 09-06-2026 jam 10:11" → date="09-06-2026", hour=10, minute=11. After the scheduled time, use get_scheduled_job_result(jobId).',
    schema: z
      .object({
        deviceName: z.string().min(1).describe('The exact device name to fetch data from')
      })
      .merge(scheduleDateTimeSchema)
  }
)

/**
 * Get the result of a scheduled job by jobId (returned when scheduling).
 */
export const getScheduledJobResultTool = tool(
  async ({ jobId }) => {
    const job = await getScheduledJob(jobId)

    if (job == null) {
      return JSON.stringify({ error: 'Scheduled job not found', jobId })
    }

    return JSON.stringify(
      {
        jobId: job.id,
        type: job.type,
        deviceName: job.deviceName,
        state: job.state,
        scheduledAt: job.scheduledAt.toISOString(),
        runAt: job.runAt.toISOString(),
        status: job.status,
        result: job.result,
        error: job.error
      },
      null,
      2
    )
  },
  {
    name: 'get_scheduled_job_result',
    description:
      'Get the status and result of a scheduled job by its jobId. Use when the user asks for the result of a scheduled task, or "apa hasil job X", or after a scheduled sensor data job has run.',
    schema: z.object({
      jobId: z.string().min(1).describe('The job ID returned when the task was scheduled')
    })
  }
)

/**
 * List recent scheduled jobs (pending, completed, or failed).
 */
export const listScheduledJobsTool = tool(
  async ({ limit }) => {
    const list = await listScheduledJobs(limit ?? 20)
    return JSON.stringify(
      {
        count: list.length,
        jobs: list.map((j) => ({
          jobId: j.id,
          type: j.type,
          deviceName: j.deviceName,
          state: j.state,
          scheduledAt: j.scheduledAt.toISOString(),
          runAt: j.runAt.toISOString(),
          status: j.status,
          result: j.result,
          error: j.error
        }))
      },
      null,
      2
    )
  },
  {
    name: 'list_scheduled_jobs',
    description:
      'List recent scheduled jobs (actuator on/off or sensor data). Use when the user asks "apa saja jadwal yang ada", "list scheduled tasks", or to see status of scheduled jobs.',
    schema: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Max number of jobs to return (default 20)')
    })
  }
)
