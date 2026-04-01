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

    MQTTService.publishActuatorState(device.deviceName, state)

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
          topic: `device/${device.deviceName}/command`,
          command: deviceLogData,
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
 * Schedule turning on/off an actuator after a delay (minutes).
 * Use when user says "hidupkan Smart Lamp 1 menit lagi", "matikan AC 5 menit lagi", etc.
 */
export const scheduleActuatorStateAfterMinutesTool = tool(
  async ({ deviceName, state, delayMinutes }) => {
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

    const job = scheduleActuatorState(deviceName, state, delayMinutes)
    return JSON.stringify(
      {
        success: true,
        message: `Scheduled: ${state === 'on' ? 'Turn on' : 'Turn off'} "${deviceName}" in ${delayMinutes} minute(s)`,
        jobId: job.id,
        deviceName: job.deviceName,
        state: job.state,
        delayMinutes: job.delayMinutes,
        runAt: job.runAt.toISOString()
      },
      null,
      2
    )
  },
  {
    name: 'schedule_actuator_state_after_minutes',
    description:
      'Schedule turning ON or OFF an actuator device after a delay in minutes. Use when the user says "hidupkan (device name) 1 menit lagi", "matikan (device name) 5 menit lagi", "turn on Smart Lamp in 1 minute", "tolong hidupin device X di Y menit lagi", etc. Only works for devices with deviceType "actuator".',
    schema: z.object({
      deviceName: z
        .string()
        .min(1)
        .describe('The exact device name (must be an actuator)'),
      state: z.enum(['on', 'off']).describe('on = hidupkan, off = matikan'),
      delayMinutes: z
        .number()
        .int()
        .min(1)
        .max(1440)
        .describe('Delay in minutes (1–1440) before executing')
    })
  }
)

/**
 * Schedule fetching sensor/device data after a delay (minutes).
 * Use when user says "kasih data sensor A 5 menit lagi", "tolong kasih data sensor X Y menit lagi", etc.
 */
export const scheduleSensorDataAfterMinutesTool = tool(
  async ({ deviceName, delayMinutes }) => {
    const device = await DeviceService.findByName(deviceName)

    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }

    const job = scheduleSensorData(deviceName, delayMinutes)
    return JSON.stringify(
      {
        success: true,
        message: `Scheduled: fetch data for "${deviceName}" in ${delayMinutes} minute(s). Use get_scheduled_job_result with jobId to get the result after it runs.`,
        jobId: job.id,
        deviceName: job.deviceName,
        delayMinutes: job.delayMinutes,
        runAt: job.runAt.toISOString()
      },
      null,
      2
    )
  },
  {
    name: 'schedule_sensor_data_after_minutes',
    description:
      'Schedule fetching sensor/device data (last 10 values) after a delay in minutes. Use when the user says "kasih data sensor A 5 menit lagi", "tolong kasih data sensor X Y menit lagi", "give me sensor data in 5 minutes", etc. After the delay, the job runs and stores the result; user can get it with get_scheduled_job_result(jobId).',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name to fetch data from'),
      delayMinutes: z
        .number()
        .int()
        .min(1)
        .max(1440)
        .describe('Delay in minutes (1–1440) before fetching data')
    })
  }
)

/**
 * Get the result of a scheduled job by jobId (returned when scheduling).
 */
export const getScheduledJobResultTool = tool(
  async ({ jobId }) => {
    const job = getScheduledJob(jobId)

    if (job == null) {
      return JSON.stringify({ error: 'Scheduled job not found', jobId })
    }

    return JSON.stringify(
      {
        jobId: job.id,
        type: job.type,
        deviceName: job.deviceName,
        state: job.state,
        delayMinutes: job.delayMinutes,
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
      'Get the status and result of a scheduled job by its jobId. Use when the user asks for the result of a scheduled task, or "apa hasil job X", or after waiting for a scheduled sensor data job to complete (e.g. after "kasih data sensor A 5 menit lagi" — wait 5 minutes then call this with the jobId to get the data).',
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
    const list = listScheduledJobs(limit ?? 20)
    return JSON.stringify(
      {
        count: list.length,
        jobs: list.map((j) => ({
          jobId: j.id,
          type: j.type,
          deviceName: j.deviceName,
          state: j.state,
          delayMinutes: j.delayMinutes,
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
