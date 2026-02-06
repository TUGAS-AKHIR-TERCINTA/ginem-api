import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { DeviceService } from '../../DeviceServices'

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

/** All device MCP tools (for agent binding). */
export const deviceTools = [listDevicesTool, getDeviceByIdTool]
