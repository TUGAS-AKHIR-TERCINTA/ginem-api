import { StatusCodes } from 'http-status-codes'
import { DeviceLogModel } from '../../models/DeviceLogModel'
import { DeviceModel } from '../../models/DeviceModel'
import type { IDeviceAttributes } from '../../models/DeviceModel'
import { Pagination } from '../../utilities/pagination'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import {
  type ICreateDevice,
  type IFindAllDevice,
  type IUpdateDevice
} from '../../schemas/DeviceSchema'
import { v4 as uuidv4 } from 'uuid'
import { Op, type WhereOptions, type Order } from 'sequelize'

export class DeviceService {
  private static buildFindAllWhere(payload: IFindAllDevice) {
    let where: WhereOptions<IDeviceAttributes> = {
      deleted: 0
    }

    if (payload.search != null) {
      const term = `%${payload.search.trim()}%`
      where = {
        ...where,
        [Op.or]: [
          { deviceName: { [Op.like]: term } },
          { deviceDescription: { [Op.like]: term } }
        ]
      }
    }
    return where
  }

  static async findAll(payload: IFindAllDevice) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await DeviceModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        include: [
          {
            model: DeviceLogModel,
            as: 'deviceLogs' as const,
            attributes: ['deviceLogId', 'deviceLogData', 'createdAt'],
            separate: true,
            limit: 10,
            order: [['createdAt', 'DESC']] satisfies Order
          }
        ],
        distinct: true,
        order: [['deviceId', 'desc']],
        ...(payload.pagination && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to list devices', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById(deviceId: number) {
    try {
      const result = await DeviceModel.findOne({
        where: { deleted: 0, deviceId },
        include: [
          {
            model: DeviceLogModel,
            as: 'deviceLogs' as const,
            attributes: ['deviceLogId', 'deviceLogData', 'createdAt'],
            separate: true,
            limit: 10,
            order: [['createdAt', 'DESC']] satisfies Order
          }
        ]
      })

      if (result == null) {
        throw AppError.notFound('Device not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceService] findById failed: ${String(serviceError)}`)
      throw new AppError('Failed to get device by id', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findByName(deviceName: string) {
    try {
      const result = await DeviceModel.findOne({
        where: { deleted: 0, deviceName }
      })

      if (result == null) {
        throw AppError.notFound('Device not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceService] findByName failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to get device by name',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async create(payload: ICreateDevice) {
    try {
      const existingDevice = await DeviceModel.findOne({
        where: { deviceName: payload.deviceName.toLocaleUpperCase() }
      })

      if (existingDevice != null) {
        throw AppError.conflict('Device already exists')
      }

      await DeviceModel.create({
        ...payload,
        deviceStatus: payload.deviceStatus ?? 'offline',
        deviceToken: `fck_${uuidv4()}`
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create new device', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async update(payload: IUpdateDevice) {
    try {
      const updateData: Partial<IDeviceAttributes> = {}

      if (payload.deviceName != null) {
        updateData.deviceName = payload.deviceName
      }

      if (payload.deviceDescription != null) {
        updateData.deviceDescription = payload.deviceDescription
      }

      if (payload.deviceStatus != null) {
        updateData.deviceStatus = payload.deviceStatus
      }

      if (payload.deviceFirmwareVersion != null) {
        updateData.deviceFirmwareVersion = payload.deviceFirmwareVersion
      }

      if (payload.deviceMetadata != null) {
        updateData.deviceMetadata = payload.deviceMetadata
      }

      if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [affectedRows] = await DeviceModel.update(updateData, {
        where: { deleted: 0, deviceId: payload.deviceId }
      })

      if (affectedRows === 0) {
        throw AppError.notFound('Device not found')
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceService] update failed: ${String(serviceError)}`)
      throw new AppError('Failed to update device', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async remove(deviceId: number) {
    try {
      const result = await DeviceModel.findOne({
        where: { deleted: 0, deviceId }
      })

      if (result == null) {
        throw AppError.notFound('Device not found')
      }

      await result.destroy()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[DeviceService] remove failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove device', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async exists(deviceId: number): Promise<boolean> {
    try {
      await this.findById(deviceId)
      return true
    } catch {
      return false
    }
  }
}
