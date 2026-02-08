import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { DeviceService } from '../../DeviceServices'
import { DeviceItemService } from '../../DeviceItemServices'
import {
  scheduleActuatorState,
  scheduleSensorData,
  getScheduledJob,
  listScheduledJobs
} from '../DeviceScheduleService'

/**
 * MCP tools for device domain.
 * Exposes device table data to LLM agents via list_devices and get_device_by_id.
 */

function serializeDevice(device: Record<string, unknown>): string {
  return JSON.stringify(device, null, 2)
}

export const listDevicesTool = tool(
  async ({ page, size }) => {
    const result = await DeviceService.findAll({
      page: page ?? 0,
      size: size ?? 10,
      pagination: true
    })
    const summary = {
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      items: result.items.map((row) => row.get({ plain: true }))
    }
    return serializeDevice(summary as unknown as Record<string, unknown>)
  },
  {
    name: 'list_devices',
    description:
      'List devices from the database with pagination. Use this when the user asks for device list, all devices, or paginated devices.',
    schema: z.object({
      page: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe('Zero-based page index'),
      size: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Page size (default 10)')
    })
  }
)

export const getDeviceByIdTool = tool(
  async ({ deviceId }) => {
    const device = await DeviceService.findById(deviceId)
    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceId })
    }
    return serializeDevice(device.get({ plain: true }) as unknown as Record<string, unknown>)
  },
  {
    name: 'get_device_by_id',
    description:
      'Get a single device by its numeric deviceId. Use this when the user asks for one device or details of a specific device.',
    schema: z.object({
      deviceId: z.number().int().positive().describe('The device ID')
    })
  }
)

export const getLastValueByDeviceNameTool = tool(
  async ({ deviceName }) => {
    const device = await DeviceService.findByName(deviceName)
    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }
    const items = await DeviceItemService.getLastValuesByDeviceId(device.deviceId, 1)
    const last = items[0]
    if (last == null) {
      return JSON.stringify({
        deviceName,
        deviceId: device.deviceId,
        message: 'No device item values recorded yet',
        lastValue: null
      })
    }
    return JSON.stringify({
      deviceName,
      deviceId: device.deviceId,
      lastValue: last.deviceItemValue,
      deviceItemId: last.deviceItemId,
      createdAt: last.createdAt
    }, null, 2)
  },
  {
    name: 'get_last_value_by_device_name',
    description:
      'Get the latest (most recent) single value for a device by its name. Use when the user asks for the last value, current value, or latest reading of a device by name.',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (from Device table)')
    })
  }
)

export const getLast10ValuesByDeviceNameTool = tool(
  async ({ deviceName }) => {
    const device = await DeviceService.findByName(deviceName)
    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }
    const items = await DeviceItemService.getLastValuesByDeviceId(device.deviceId, 10)
    return JSON.stringify({
      deviceName,
      deviceId: device.deviceId,
      count: items.length,
      values: items.map((v) => ({
        deviceItemId: v.deviceItemId,
        deviceItemValue: v.deviceItemValue,
        createdAt: v.createdAt
      }))
    }, null, 2)
  },
  {
    name: 'get_last_10_values_by_device_name',
    description:
      'Get the last 10 values (most recent first) for a device by its name. Use when the user asks for last 10 values, recent readings, or history of values for a device by name.',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (from Device table)')
    })
  }
)

export const createDeviceItemByDeviceNameTool = tool(
  async ({ deviceName, deviceItemValue }) => {
    const device = await DeviceService.findByName(deviceName)
    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }
    const deviceItem = await DeviceItemService.create({
      deviceItemDeviceId: device.deviceId,
      deviceItemValue
    })
    return JSON.stringify({
      success: true,
      message: 'Device item created',
      deviceName,
      deviceId: device.deviceId,
      deviceItemId: deviceItem.deviceItemId,
      deviceItemValue: deviceItem.deviceItemValue,
      createdAt: deviceItem.createdAt
    }, null, 2)
  },
  {
    name: 'create_device_item',
    description:
      'Create a new device item (value) for a device. Use the device name (deviceName) to identify the device, not deviceId. Use when the user wants to add a value, record a reading, or create a device item for a device by name. Do NOT use for turn on/off (hidupkan/matikan) — use set_actuator_state_by_device_name instead.',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (identifies which device to add the value to)'),
      deviceItemValue: z.string().min(1).describe('The value to store for this device item')
    })
  }
)

/**
 * Turn on (value 1) or off (value 0) an actuator by device name.
 * Only devices with deviceType = 'actuator' are allowed. "Hidupkan" / turn on → 1, "Matikan" / turn off → 0.
 */
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
        message: 'Only devices with deviceType "actuator" can be turned on or off. Use create_device_item for other devices.'
      })
    }
    const deviceItemValue = state === 'on' ? '1' : '0'
    const deviceItem = await DeviceItemService.create({
      deviceItemDeviceId: device.deviceId,
      deviceItemValue
    })
    return JSON.stringify({
      success: true,
      message: state === 'on' ? 'Device turned on (value 1)' : 'Device turned off (value 0)',
      deviceName,
      deviceId: device.deviceId,
      deviceType: device.deviceType,
      deviceItemId: deviceItem.deviceItemId,
      deviceItemValue: deviceItem.deviceItemValue,
      createdAt: deviceItem.createdAt
    }, null, 2)
  },
  {
    name: 'set_actuator_state_by_device_name',
    description:
      'Turn ON or OFF an actuator device by its name. First checks that the device exists and has deviceType "actuator". "Hidupkan" / turn on / nyalakan → creates device item with value "1". "Matikan" / turn off / padamkan → creates device item with value "0". Use this when the user says hidupkan (device name), matikan (device name), turn on, turn off, nyalakan, padamkan, or similar instructions to control an actuator.',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (must be an actuator)'),
      state: z.enum(['on', 'off']).describe('on = hidupkan / value 1, off = matikan / value 0')
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
    return JSON.stringify({
      success: true,
      message: `Scheduled: ${state === 'on' ? 'Turn on' : 'Turn off'} "${deviceName}" in ${delayMinutes} minute(s)`,
      jobId: job.id,
      deviceName: job.deviceName,
      state: job.state,
      delayMinutes: job.delayMinutes,
      runAt: job.runAt.toISOString()
    }, null, 2)
  },
  {
    name: 'schedule_actuator_state_after_minutes',
    description:
      'Schedule turning ON or OFF an actuator device after a delay in minutes. Use when the user says "hidupkan (device name) 1 menit lagi", "matikan (device name) 5 menit lagi", "turn on Smart Lamp in 1 minute", "tolong hidupin device X di Y menit lagi", etc. Only works for devices with deviceType "actuator".',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (must be an actuator)'),
      state: z.enum(['on', 'off']).describe('on = hidupkan, off = matikan'),
      delayMinutes: z.number().int().min(1).max(1440).describe('Delay in minutes (1–1440) before executing')
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
    return JSON.stringify({
      success: true,
      message: `Scheduled: fetch data for "${deviceName}" in ${delayMinutes} minute(s). Use get_scheduled_job_result with jobId to get the result after it runs.`,
      jobId: job.id,
      deviceName: job.deviceName,
      delayMinutes: job.delayMinutes,
      runAt: job.runAt.toISOString()
    }, null, 2)
  },
  {
    name: 'schedule_sensor_data_after_minutes',
    description:
      'Schedule fetching sensor/device data (last 10 values) after a delay in minutes. Use when the user says "kasih data sensor A 5 menit lagi", "tolong kasih data sensor X Y menit lagi", "give me sensor data in 5 minutes", etc. After the delay, the job runs and stores the result; user can get it with get_scheduled_job_result(jobId).',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name to fetch data from'),
      delayMinutes: z.number().int().min(1).max(1440).describe('Delay in minutes (1–1440) before fetching data')
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
    return JSON.stringify({
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
    }, null, 2)
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
    return JSON.stringify({
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
    }, null, 2)
  },
  {
    name: 'list_scheduled_jobs',
    description:
      'List recent scheduled jobs (actuator on/off or sensor data). Use when the user asks "apa saja jadwal yang ada", "list scheduled tasks", or to see status of scheduled jobs.',
    schema: z.object({
      limit: z.number().int().min(1).max(100).optional().describe('Max number of jobs to return (default 20)')
    })
  }
)

/** All device MCP tools (for agent binding). */
export const deviceTools = [
  listDevicesTool,
  getDeviceByIdTool,
  getLastValueByDeviceNameTool,
  getLast10ValuesByDeviceNameTool,
  createDeviceItemByDeviceNameTool,
  setActuatorStateByDeviceNameTool,
  scheduleActuatorStateAfterMinutesTool,
  scheduleSensorDataAfterMinutesTool,
  getScheduledJobResultTool,
  listScheduledJobsTool
]
