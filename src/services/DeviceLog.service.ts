import { StatusCodes } from 'http-status-codes'
import {
  type DeviceLogInstance,
  type IDeviceLogCreationModelAttributes,
  DeviceLogModel
} from '../models/DeviceLogModel'
import { DeviceModel } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'
import {
  type ICreateDeviceLog,
  type IFindAllDeviceLog,
  type IUpdateDeviceLog
} from '../schemas/DeviceLogSchema'
import { type WhereOptions } from 'sequelize'

export class DeviceLogService {
  private static buildFindAllWhere(payload: IFindAllDeviceLog) {
    const where: WhereOptions<IDeviceLogCreationModelAttributes> = { deleted: 0 }

    if (payload.deviceLogDeviceId != null) {
      where.deviceLogDeviceId = payload.deviceLogDeviceId
    }

    return where
  }

  static async findAll(payload: IFindAllDeviceLog) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await DeviceLogModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        include: [
          {
            model: DeviceModel,
            as: 'device',
            attributes: ['deviceId', 'deviceName', 'deviceType']
          }
        ],
        order: [['deviceLogId', 'desc']],
        ...(payload.pagination && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceLogService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to list device logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById(deviceLogId: number) {
    try {
      const result = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogId },
        include: [
          {
            model: DeviceModel,
            as: 'device',
            attributes: ['deviceId', 'deviceName', 'deviceType', 'deviceStatus']
          }
        ]
      })

      if (result == null) {
        throw AppError.notFound('Device log not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceLogService] findById failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to get device log by id',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async create(payload: ICreateDeviceLog) {
    try {
      const deviceExists = await DeviceModel.findOne({
        where: { deleted: 0, deviceId: payload.deviceLogDeviceId }
      })

      if (deviceExists == null) {
        throw AppError.notFound('Device not found')
      }

      return await DeviceLogModel.create(payload)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceLogService] create failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to create new device log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async update(payload: IUpdateDeviceLog) {
    try {
      const updateData: Partial<IDeviceLogCreationModelAttributes> = {}

      if (payload.deviceLogDeviceId != null) {
        updateData.deviceLogDeviceId = payload.deviceLogDeviceId
      }

      if (payload.deviceLogData != null) {
        updateData.deviceLogData = payload.deviceLogData
      }

      if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [affectedRows] = await DeviceLogModel.update(updateData, {
        where: { deleted: 0, deviceLogId: payload.deviceLogId }
      })

      if (affectedRows === 0) {
        throw AppError.notFound('Device log not found')
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceLogService] update failed: ${String(serviceError)}`)
      throw new AppError('Failed to update device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async remove(deviceLogId: number) {
    try {
      const result = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogId }
      })

      if (result == null) {
        throw AppError.notFound('Device log not found')
      }

      await result.destroy()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceLogService] remove failed: ${String(serviceError)}`)
      throw new AppError('Failed to delete device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async exists(deviceLogId: number) {
    try {
      await this.findById(deviceLogId)
      return true
    } catch {
      return false
    }
  }

  static async deviceExists(deviceLogDeviceId: number): Promise<boolean> {
    const result = await DeviceModel.findOne({
      where: { deleted: 0, deviceId: deviceLogDeviceId }
    })
    return result != null
  }

  static async findLastLogsByDeviceId(deviceId: number, limit: number) {
    try {
      const result = await DeviceLogModel.findAll({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['deviceLogId', 'desc']],
        limit,
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      return result.map((row: DeviceLogInstance) => ({
        deviceLogId: row.deviceLogId,
        deviceLogData: row.deviceLogData,
        createdAt: row.createdAt as Date
      }))
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[DeviceLogService] getLastLogsByDeviceId failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to list last device logs',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async getLastLogByDeviceId(deviceId: number) {
    try {
      const result = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['deviceLogId', 'desc']],
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      if (result == null) {
        throw AppError.notFound('Device log not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[DeviceLogService] getLastLogByDeviceId failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to get last device log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findLatestLogByDeviceId(deviceId: number) {
    try {
      const result = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [
          ['createdAt', 'desc'],
          ['deviceLogId', 'desc']
        ],
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      if (result == null) {
        throw AppError.notFound('Device log not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[DeviceLogService] getLatestLogByDeviceId failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to get latest device log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
