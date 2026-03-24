import { StatusCodes } from 'http-status-codes'
import {
  DeviceLogInstance,
  IDeviceLogCreationModelAttributes
} from '../models/DeviceLogModel'
import { DeviceModel } from '../models/DeviceModel'
import { DeviceLogModel } from '../models/DeviceLogModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'

/** Options for listing device logs with optional pagination */
export interface FindAllDeviceLogOptions {
  deviceLogDeviceId?: number
  page?: number
  size?: number
  pagination?: boolean
}

/** Result shape for paginated list (matches Pagination.formatData) */
export interface PaginatedDeviceLogResult {
  totalItems: number
  items: DeviceLogInstance[]
  totalPages: number
  currentPage: number
}

export type CreateDeviceLogPayload = IDeviceLogCreationModelAttributes

export interface UpdateDeviceLogPayload {
  deviceLogId: number
  deviceLogDeviceId?: number
  deviceLogData?: string
}

/**
 * Device log service: business logic for device log CRUD.
 * Controllers handle HTTP (validation, status codes, response shape); this layer handles data.
 */
export class DeviceLogService {
  /**
   * Create a new device log. Validates that the device exists.
   * @throws {AppError} AppError.notFound when device does not exist
   */
  static async create(payload: CreateDeviceLogPayload): Promise<DeviceLogInstance> {
    try {
      const deviceExists = await DeviceModel.findOne({
        where: { deleted: 0, deviceId: payload.deviceLogDeviceId }
      })

      if (deviceExists == null) {
        throw AppError.notFound('Device not found')
      }

      const deviceLog = await DeviceLogModel.create(payload)
      return deviceLog
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] create failed: ${String(error)}`)
      throw new AppError('Failed to create device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * List device logs with optional pagination and filter by device.
   */
  static async findAll(
    options: FindAllDeviceLogOptions = {}
  ): Promise<PaginatedDeviceLogResult> {
    try {
      const { deviceLogDeviceId, page = 1, size = 10, pagination = true } = options
      const pager = new Pagination(Number(page) || 0, Number(size) || 10)

      const where: Record<string, unknown> = { deleted: 0 }

      if (deviceLogDeviceId != null) {
        where.deviceLogDeviceId = deviceLogDeviceId
      }

      const result = await DeviceLogModel.findAndCountAll({
        where,
        order: [['deviceLogId', 'desc']],
        ...(pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        }),
        include: [
          {
            model: DeviceModel,
            as: 'device',
            attributes: ['deviceId', 'deviceName', 'deviceType']
          }
        ]
      })

      return pager.formatData(result) as PaginatedDeviceLogResult
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] findAll failed: ${String(error)}`)
      throw new AppError('Failed to fetch device logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Find a single device log by id (non-deleted).
   * @throws {AppError} AppError.notFound when device log does not exist
   */
  static async findById(deviceLogId: number): Promise<DeviceLogInstance> {
    try {
      const deviceLog = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogId },
        include: [
          {
            model: DeviceModel,
            as: 'device',
            attributes: ['deviceId', 'deviceName', 'deviceType', 'deviceStatus']
          }
        ]
      })

      if (deviceLog == null) {
        throw AppError.notFound('Device log not found')
      }

      return deviceLog
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] findById failed: ${String(error)}`)
      throw new AppError('Failed to fetch device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Update an existing device log. Validates device exists if deviceLogDeviceId is provided.
   * @throws {AppError} AppError.notFound when device log or device (if updating) does not exist
   */
  static async update(payload: UpdateDeviceLogPayload): Promise<number> {
    try {
      if (payload.deviceLogDeviceId != null) {
        const deviceExists = await DeviceModel.findOne({
          where: { deleted: 0, deviceId: payload.deviceLogDeviceId }
        })

        if (deviceExists == null) {
          throw AppError.notFound('Device not found')
        }
      }

      const [affectedRows] = await DeviceLogModel.update(payload, {
        where: { deleted: 0, deviceLogId: payload.deviceLogId }
      })

      if (affectedRows === 0) {
        throw AppError.notFound('Device log not found')
      }

      return affectedRows
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] update failed: ${String(error)}`)
      throw new AppError('Failed to update device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Soft-delete a device log.
   * @throws {AppError} AppError.notFound when device log does not exist
   */
  static async remove(deviceLogId: number): Promise<DeviceLogInstance> {
    try {
      const deviceLog = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogId }
      })

      if (deviceLog == null) {
        throw AppError.notFound('Device log not found')
      }

      deviceLog.deleted = true
      await deviceLog.save()
      return deviceLog
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] remove failed: ${String(error)}`)
      throw new AppError('Failed to remove device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Check if a device log exists (non-deleted). Returns false when not found (does not throw).
   */
  static async exists(deviceLogId: number): Promise<boolean> {
    try {
      await this.findById(deviceLogId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if a device exists (non-deleted). Used internally; does not throw.
   */
  static async deviceExists(deviceLogDeviceId: number): Promise<boolean> {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId: deviceLogDeviceId }
    })
    return device != null
  }

  /**
   * Get last N device logs for a device (by deviceId), ordered by deviceLogId desc.
   */
  static async getLastLogsByDeviceId(
    deviceId: number,
    limit: number
  ): Promise<Array<{ deviceLogId: number; deviceLogData: string; createdAt: Date }>> {
    try {
      const items = await DeviceLogModel.findAll({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['deviceLogId', 'desc']],
        limit,
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      return items.map((row: DeviceLogInstance) => ({
        deviceLogId: row.deviceLogId,
        deviceLogData: row.deviceLogData,
        createdAt: row.createdAt as Date
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] getLastLogsByDeviceId failed: ${String(error)}`)
      throw new AppError('Failed to fetch device logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Get the last device log row for a device (by max deviceLogId).
   * @returns The latest row or null if no logs exist
   */
  static async getLastLogByDeviceId(
    deviceId: number
  ): Promise<{ deviceLogId: number; deviceLogData: string; createdAt: Date } | null> {
    try {
      const row = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['deviceLogId', 'desc']],
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      if (row == null) return null

      return {
        deviceLogId: row.deviceLogId,
        deviceLogData: row.deviceLogData,
        createdAt: row.createdAt as Date
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] getLastLogByDeviceId failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch last device log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   * Get the newest device log row for a device (by max createdAt).
   * @returns The newest row or null if no logs exist
   */
  static async getLatestLogByDeviceId(
    deviceId: number
  ): Promise<{ deviceLogId: number; deviceLogData: string; createdAt: Date } | null> {
    try {
      const row = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [
          ['createdAt', 'desc'],
          ['deviceLogId', 'desc']
        ],
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      if (row == null) return null

      return {
        deviceLogId: row.deviceLogId,
        deviceLogData: row.deviceLogData,
        createdAt: row.createdAt as Date
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] getLatestLogByDeviceId failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch latest device log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
