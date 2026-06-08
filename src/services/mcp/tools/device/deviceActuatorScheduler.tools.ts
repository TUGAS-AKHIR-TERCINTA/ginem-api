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
import { parseScheduleDateTime } from '../../../scheduler/deviceSchedule.datetime'
import { AppError } from '../../../../utilities/AppError'

const scheduleDateTimeSchema = z.object({
  year: z.number().int().min(2024).max(2100).describe('Year, e.g. 2026'),
  month: z.number().int().min(1).max(12).describe('Month 1–12'),
  day: z.number().int().min(1).max(31).describe('Day of month 1–31'),
  hour: z.number().int().min(0).max(23).describe('Hour 0–23 (24h, WIB)'),
  minute: z.number().int().min(0).max(59).describe('Minute 0–59')
})

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
  async ({ deviceName, state, year, month, day, hour, minute }) => {
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

      const runAt = parseScheduleDateTime({ year, month, day, hour, minute })
      const job = await scheduleActuatorState(deviceName, state, runAt)

      return JSON.stringify(
        {
          success: true,
          message: `Scheduled: ${state === 'on' ? 'Turn on' : 'Turn off'} "${deviceName}" at ${runAt.toISOString()} (WIB)`,
          jobId: job.id,
          deviceName: job.deviceName,
          state: job.state,
          runAt: job.runAt.toISOString(),
          schedule: { year, month, day, hour, minute, timezone: 'WIB (UTC+7)' }
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
      'Schedule turning ON or OFF an actuator at a specific date and time (WIB / UTC+7). Use when the user says "hidupkan lampu jam 8 malam besok", "matikan AC tanggal 10 Juni 2026 jam 14:30", "turn on Smart Lamp on 2026-06-08 at 20:00", etc. Provide year, month, day, hour (0–23), and minute (0–59).',
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
  async ({ deviceName, year, month, day, hour, minute }) => {
    try {
      const device = await DeviceService.findByName(deviceName)

      if (device == null) {
        return JSON.stringify({ error: 'Device not found', deviceName })
      }

      const runAt = parseScheduleDateTime({ year, month, day, hour, minute })
      const job = await scheduleSensorData(deviceName, runAt)

      return JSON.stringify(
        {
          success: true,
          message: `Scheduled: fetch data for "${deviceName}" at ${runAt.toISOString()} (WIB). Use get_scheduled_job_result with jobId to get the result after it runs.`,
          jobId: job.id,
          deviceName: job.deviceName,
          runAt: job.runAt.toISOString(),
          schedule: { year, month, day, hour, minute, timezone: 'WIB (UTC+7)' }
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
      'Schedule fetching sensor/device data (last 10 values) at a specific date and time (WIB / UTC+7). Use when the user says "kasih data sensor A besok jam 9 pagi", "tolong kasih data sensor X tanggal 10 Juni jam 14:00", etc. After the scheduled time, use get_scheduled_job_result(jobId) to retrieve the data.',
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
