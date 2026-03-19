import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { AppError } from '../../../../utilities/AppError'
import { DeviceService } from '../../../Device.service'
import { serializeDevice } from './serializeDevice'

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
      page: z.number().int().min(0).optional().describe('Zero-based page index'),
      size: z.number().int().min(1).max(100).optional().describe('Page size (default 10)')
    })
  }
)

export const getDeviceByIdTool = tool(
  async ({ deviceId }) => {
    try {
      const device = await DeviceService.findById(deviceId)
      return serializeDevice(
        device.get({ plain: true }) as unknown as Record<string, unknown>
      )
    } catch (err) {
      if (err instanceof AppError) {
        return JSON.stringify({ error: err.message, deviceId })
      }
      throw err
    }
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
