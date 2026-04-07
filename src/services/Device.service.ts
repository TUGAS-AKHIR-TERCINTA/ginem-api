import { StatusCodes } from 'http-status-codes'
import { DeviceLogModel } from '../models/DeviceLogModel'
import { DeviceModel } from '../models/DeviceModel'
import type { IDeviceAttributes } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'
import { ICreateDevice, IFindAllDevice, IUpdateDevice } from '../schemas/DeviceSchema'
import { v4 as uuidv4 } from 'uuid'
import { Op, WhereOptions } from 'sequelize'

export class DeviceService {
  static async create(payload: ICreateDevice) {
    try {
      const existingDevice = await DeviceModel.findOne({
        where: { deviceName: payload.deviceName.toLocaleUpperCase() }
      })

      if (existingDevice) {
        throw AppError.conflict('Device already exists')
      }

      await DeviceModel.create({
        ...payload,
        deviceStatus: payload.deviceStatus ?? 'offline',
        deviceToken: `fck_${uuidv4()}`
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceService] create failed: ${String(error)}`)
      throw new AppError('Failed to create device', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAll(payload: IFindAllDevice) {
    try {
      const { page = 1, size = 10, pagination = true, search } = payload
      const pager = new Pagination(Number(page) || 1, Number(size) || 10)

      let where: WhereOptions<IDeviceAttributes> = {
        deleted: 0
      }

      if (search != null) {
        const term = `%${search.trim()}%`
        where = {
          ...where,
          [Op.or]: [{ deviceName: { [Op.like]: term } }]
        }
      }

      const result = await DeviceModel.findAndCountAll({
        where,
        include: [
          {
            model: DeviceLogModel,
            as: 'deviceLogs',
            attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
          }
        ],
        distinct: true,
        order: [['deviceId', 'desc']],
        ...(pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceService] findAll failed: ${String(error)}`)
      throw new AppError('Failed to fetch devices', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById(deviceId: number) {
    try {
      const device = await DeviceModel.findOne({
        where: { deleted: 0, deviceId },
        include: [
          {
            model: DeviceLogModel,
            as: 'deviceLogs',
            attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
          }
        ]
      })

      if (device == null) {
        throw AppError.notFound('Device not found')
      }

      return device
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceService] findById failed: ${String(error)}`)
      throw new AppError('Failed to fetch device', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async update(payload: IUpdateDevice) {
    try {
      const device = await DeviceModel.findOne({
        where: { deleted: 0, deviceId: payload.deviceId }
      })

      if (device == null) {
        throw AppError.notFound('Device not found')
      }

      const updateData: Partial<IDeviceAttributes> = {}

      if (payload.deviceName != null) {
        updateData.deviceName = payload.deviceName
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
        return
      }

      await device.update(updateData)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceService] update failed: ${String(error)}`)
      throw new AppError('Failed to update device', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async remove(deviceId: number) {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId }
    })

    if (device == null) {
      throw AppError.notFound('Device not found')
    }

    device.deleted = true
    await device.save()
    return device
  }

  static async exists(deviceId: number): Promise<boolean> {
    try {
      await this.findById(deviceId)
      return true
    } catch {
      return false
    }
  }

  static async findByName(deviceName: string) {
    try {
      const device = await DeviceModel.findOne({
        where: { deleted: 0, deviceName }
      })

      if (device == null) {
        throw AppError.notFound('Device not found')
      }

      return device
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[DeviceService] findByName failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch device by name',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
