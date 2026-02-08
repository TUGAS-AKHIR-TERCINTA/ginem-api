import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { DeviceService } from '../../DeviceServices'
import { DeviceItemService } from '../../DeviceItemServices'

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

/** All device MCP tools (for agent binding). */
export const deviceTools = [
  listDevicesTool,
  getDeviceByIdTool,
  getLastValueByDeviceNameTool,
  getLast10ValuesByDeviceNameTool,
  createDeviceItemByDeviceNameTool,
  setActuatorStateByDeviceNameTool
]
