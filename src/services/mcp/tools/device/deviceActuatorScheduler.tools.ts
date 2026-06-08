import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { DeviceService } from '../../../Device.service'
import { DeviceLogService } from '../../../DeviceLog.service'
import {
  scheduleActuatorState,
  scheduleActuatorStateRepeat,
  scheduleSensorData,
  scheduleSensorDataRepeat,
  getScheduledJob,
  listScheduledJobs
} from '../../DeviceSchedule.service'
import { MQTTService } from '../../../mqtt/MQTT.service'
import {
  buildDailyCronPattern,
  formatRepeatScheduleWib,
  formatScheduleWib,
  resolveNextDailyRun,
  resolveScheduleDateTime
} from '../../../scheduler/deviceSchedule.datetime'
import { AppError } from '../../../../utilities/AppError'

const scheduleCategorySchema = z.object({
  category: z
    .enum(['once', 'repeat'])
    .describe(
      'once = run ONE time only (e.g. "hidupkan lampu jam 18:00" today, or "20-06-2026 jam 18:00"). repeat = EVERY DAY at hour:minute WIB (e.g. "setiap hari jam 18:00", "setiap jam 06:00 matikan").'
    )
})

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
      'For category=once only. Specific date DD-MM-YYYY (e.g. "20-06-2026") or YYYY-MM-DD. Omit for time-only (defaults to today WIB).'
    ),
  year: z.number().int().min(2024).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional()
})

function buildOnceScheduleResponse(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  timeOnly: boolean
}) {
  return {
    category: 'once' as const,
    ...parts,
    timezone: 'WIB (UTC+7)',
    label: formatScheduleWib(parts),
    inferredDate: parts.timeOnly
      ? 'today (or tomorrow if time already passed)'
      : 'explicit'
  }
}

function buildRepeatScheduleResponse(hour: number, minute: number) {
  const next = resolveNextDailyRun(hour, minute)
  return {
    category: 'repeat' as const,
    hour,
    minute,
    cronPattern: buildDailyCronPattern(hour, minute),
    timezone: 'WIB (UTC+7)',
    label: formatRepeatScheduleWib(hour, minute),
    nextRunAt: next.runAt.toISOString(),
    nextRunLabel: formatScheduleWib(next)
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
      'Turn ON or OFF an actuator device immediately by its name. Use for instant control without scheduling.',
    schema: z.object({
      deviceName: z
        .string()
        .min(1)
        .describe('The exact device name (must be an actuator)'),
      state: z.enum(['on', 'off']).describe('on = hidupkan, off = matikan')
    })
  }
)

export const scheduleActuatorStateAtDatetimeTool = tool(
  async ({ deviceName, state, category, hour, minute, date, year, month, day }) => {
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

      if (category === 'repeat') {
        if (date != null || year != null || month != null || day != null) {
          return JSON.stringify({
            error: 'Repeat schedule uses daily time only. Omit date/year/month/day.'
          })
        }

        const job = await scheduleActuatorStateRepeat(deviceName, state, hour, minute)
        const schedule = buildRepeatScheduleResponse(hour, minute)

        return JSON.stringify(
          {
            success: true,
            message: `Scheduled daily: ${state === 'on' ? 'Turn on' : 'Turn off'} "${deviceName}" ${schedule.label}`,
            jobId: job.id,
            deviceName: job.deviceName,
            state: job.state,
            category: job.category,
            status: job.status,
            schedule
          },
          null,
          2
        )
      }

      const resolved = resolveScheduleDateTime({ hour, minute, date, year, month, day })
      const job = await scheduleActuatorState(deviceName, state, 'once', resolved.runAt)

      return JSON.stringify(
        {
          success: true,
          message: `Scheduled once: ${state === 'on' ? 'Turn on' : 'Turn off'} "${deviceName}" at ${formatScheduleWib(resolved)}`,
          jobId: job.id,
          deviceName: job.deviceName,
          state: job.state,
          category: job.category,
          status: job.status,
          runAt: job.runAt.toISOString(),
          schedule: buildOnceScheduleResponse(resolved)
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
      'Schedule actuator ON/OFF with category once or repeat (WIB). ONCE examples: "hidupkan lampu depan di jam 18:00 WIB" → category=once, hour=18, minute=0 (no date). "hidupkan lampu depan di 20-06-2026 jam 18:00" → category=once, date="20-06-2026", hour=18, minute=0. REPEAT examples: "hidupkan lampu depan setiap hari jam 18:00 WIB" → category=repeat, hour=18, minute=0. "matikan lampu depan setiap jam 06:00" → category=repeat, hour=6, minute=0. User may request TWO separate jobs for daily on and daily off.',
    schema: z
      .object({
        deviceName: z
          .string()
          .min(1)
          .describe('The exact device name (must be an actuator)'),
        state: z.enum(['on', 'off']).describe('on = hidupkan, off = matikan')
      })
      .merge(scheduleCategorySchema)
      .merge(scheduleDateTimeSchema)
  }
)

export const scheduleSensorDataAtDatetimeTool = tool(
  async ({ deviceName, category, hour, minute, date, year, month, day }) => {
    try {
      const device = await DeviceService.findByName(deviceName)

      if (device == null) {
        return JSON.stringify({ error: 'Device not found', deviceName })
      }

      if (category === 'repeat') {
        if (date != null || year != null || month != null || day != null) {
          return JSON.stringify({
            error: 'Repeat schedule uses daily time only. Omit date/year/month/day.'
          })
        }

        const job = await scheduleSensorDataRepeat(deviceName, hour, minute)
        const schedule = buildRepeatScheduleResponse(hour, minute)

        return JSON.stringify(
          {
            success: true,
            message: `Scheduled daily: fetch data for "${deviceName}" ${schedule.label}`,
            jobId: job.id,
            deviceName: job.deviceName,
            category: job.category,
            status: job.status,
            schedule
          },
          null,
          2
        )
      }

      const resolved = resolveScheduleDateTime({ hour, minute, date, year, month, day })
      const job = await scheduleSensorData(deviceName, 'once', resolved.runAt)

      return JSON.stringify(
        {
          success: true,
          message: `Scheduled once: fetch data for "${deviceName}" at ${formatScheduleWib(resolved)}`,
          jobId: job.id,
          deviceName: job.deviceName,
          category: job.category,
          status: job.status,
          runAt: job.runAt.toISOString(),
          schedule: buildOnceScheduleResponse(resolved)
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
      'Schedule sensor data fetch with category once or repeat (WIB). ONCE: specific time or date+time. REPEAT: every day at hour:minute (omit date).',
    schema: z
      .object({
        deviceName: z.string().min(1).describe('The exact device name to fetch data from')
      })
      .merge(scheduleCategorySchema)
      .merge(scheduleDateTimeSchema)
  }
)

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
        category: job.category,
        deviceName: job.deviceName,
        state: job.state,
        scheduledAt: job.scheduledAt.toISOString(),
        runAt: job.runAt.toISOString(),
        cronPattern: job.cronPattern,
        timezone: job.timezone,
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
      'Get status/result of a scheduled job. Repeat jobs stay status=active and result shows last execution.',
    schema: z.object({
      jobId: z.string().min(1).describe('The job ID returned when the task was scheduled')
    })
  }
)

export const listScheduledJobsTool = tool(
  async ({ limit }) => {
    const list = await listScheduledJobs(limit ?? 20)
    return JSON.stringify(
      {
        count: list.length,
        jobs: list.map((j) => ({
          jobId: j.id,
          type: j.type,
          category: j.category,
          deviceName: j.deviceName,
          state: j.state,
          scheduledAt: j.scheduledAt.toISOString(),
          runAt: j.runAt.toISOString(),
          cronPattern: j.cronPattern,
          timezone: j.timezone,
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
    description: 'List recent scheduled jobs (once and repeat).',
    schema: z.object({
      limit: z.number().int().min(1).max(100).optional()
    })
  }
)
