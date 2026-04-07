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
import {
  ICreateDeviceLog,
  IFindAllDeviceLog,
  IUpdateDeviceLog
} from '../schemas/DeviceLogSchema'
import { WhereOptions } from 'sequelize'

export class DeviceLogService {
  static async create(payload: ICreateDeviceLog) {
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
  static async findAll(payload: IFindAllDeviceLog) {
    try {
      const {
        deviceLogDeviceId,
        page = 1,
        size = 10,
        pagination = true,
        search
      } = payload

      const pager = new Pagination(Number(page) || 0, Number(size) || 10)

      let where: WhereOptions<IDeviceLogCreationModelAttributes> = { deleted: 0 }

      if (deviceLogDeviceId != null) {
        where.deviceLogDeviceId = deviceLogDeviceId
      }

      const result = await DeviceLogModel.findAndCountAll({
        where,
        include: [
          {
            model: DeviceModel,
            as: 'device',
            attributes: ['deviceId', 'deviceName', 'deviceType']
          }
        ],
        order: [['deviceLogId', 'desc']],
        ...(pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] findAll failed: ${String(error)}`)
      throw new AppError('Failed to fetch device logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById(deviceLogId: number) {
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

  static async update(payload: IUpdateDeviceLog) {
    try {
      const deviceLog = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogId: payload.deviceLogId }
      })

      if (deviceLog == null) {
        throw AppError.notFound('Device log not found')
      }

      const updateData: Partial<IDeviceLogCreationModelAttributes> = {}

      if (payload.deviceLogDeviceId != null) {
        updateData.deviceLogDeviceId = payload.deviceLogDeviceId
      }

      if (payload.deviceLogData != null) {
        updateData.deviceLogData = payload.deviceLogData
      }

      if (Object.keys(updateData).length === 0) {
        return
      }

      await deviceLog.update(updateData)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] update failed: ${String(error)}`)
      throw new AppError('Failed to update device log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async remove(deviceLogId: number) {
    try {
      const deviceLog = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogId }
      })

      if (deviceLog == null) {
        throw AppError.notFound('Device log not found')
      }

      deviceLog.deleted = true
      await deviceLog.save()
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] remove failed: ${String(error)}`)
      throw new AppError('Failed to remove device log', StatusCodes.INTERNAL_SERVER_ERROR)
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
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId: deviceLogDeviceId }
    })
    return device != null
  }

  static async findLastLogsByDeviceId(deviceId: number, limit: number) {
    try {
      const deviceLogs = await DeviceLogModel.findAll({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['deviceLogId', 'desc']],
        limit,
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      return deviceLogs.map((row: DeviceLogInstance) => ({
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

  static async getLastLogByDeviceId(deviceId: number) {
    try {
      const deviceLog = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['deviceLogId', 'desc']],
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      if (deviceLog == null) {
        throw AppError.notFound('Device log not found')
      }

      return deviceLog
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceLogService] getLastLogByDeviceId failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch last device log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findLatestLogByDeviceId(deviceId: number) {
    try {
      const deviceLog = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [
          ['createdAt', 'desc'],
          ['deviceLogId', 'desc']
        ],
        attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
      })

      if (deviceLog == null) {
        throw AppError.notFound('Device log not found')
      }

      return deviceLog
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
