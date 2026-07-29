import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { DeviceService, DeviceLogService } from '../../../device'

export const getLastLogByDeviceNameTool = tool(
  async ({ deviceName }) => {
    const device = await DeviceService.findByName(deviceName)

    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }

    const items = await DeviceLogService.findLastLogsByDeviceId(device.deviceId, 1)

    const last = items[0]
    if (last == null) {
      return JSON.stringify({
        deviceName,
        deviceId: device.deviceId,
        message: 'No device values recorded yet',
        lastValue: last as { deviceLogData: string } | null
      })
    }

    return JSON.stringify(
      {
        deviceName,
        deviceId: device.deviceId,
        lastValue: last.deviceLogData,
        deviceLogId: last.deviceLogId,
        createdAt: last.createdAt
      },
      null,
      2
    )
  },
  {
    name: 'get_last_log_by_device_name',
    description:
      'Get the latest (most recent) single log for a device by its name. Use when the user asks for the last log, current log, or latest reading of a device by name.',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (from Device table)')
    })
  }
)

export const getLast10LogsByDeviceNameTool = tool(
  async ({ deviceName }) => {
    const device = await DeviceService.findByName(deviceName)

    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }

    const items = await DeviceLogService.findLastLogsByDeviceId(device.deviceId, 10)

    return JSON.stringify(
      {
        deviceName,
        deviceId: device.deviceId,
        count: items.length,
        values: items.map((v) => ({
          deviceLogId: v.deviceLogId,
          deviceLogData: v.deviceLogData,
          createdAt: v.createdAt
        }))
      },
      null,
      2
    )
  },
  {
    name: 'get_last_10_logs_by_device_name',
    description:
      'Get the last 10 logs (most recent first) for a device by its name. Use when the user asks for last 10 logs, recent readings, or history of logs for a device by name.',
    schema: z.object({
      deviceName: z.string().min(1).describe('The exact device name (from Device table)')
    })
  }
)

export const createDeviceLogByDeviceNameTool = tool(
  async ({ deviceName, deviceLogData }) => {
    const device = await DeviceService.findByName(deviceName)

    if (device == null) {
      return JSON.stringify({ error: 'Device not found', deviceName })
    }

    const deviceLog = await DeviceLogService.create({
      deviceLogDeviceId: device.deviceId,
      deviceLogData
    })

    return JSON.stringify(
      {
        success: true,
        message: 'Device log created',
        deviceName,
        deviceId: device.deviceId,
        deviceLogId: deviceLog.deviceLogId,
        deviceLogData: deviceLog.deviceLogData,
        createdAt: deviceLog.createdAt
      },
      null,
      2
    )
  },
  {
    name: 'create_device_log',
    description:
      'Create a new device log for a device. Use the device name (deviceName) to identify the device, not deviceId. Use when the user wants to add a value, record a reading, or create a device log for a device by name. Do NOT use for turn on/off (hidupkan/matikan) — use set_actuator_state_by_device_name instead.',
    schema: z.object({
      deviceName: z
        .string()
        .min(1)
        .describe('The exact device name (identifies which device to add the value to)'),
      deviceLogData: z.string().min(1).describe('The data to store for this device log')
    })
  }
)
