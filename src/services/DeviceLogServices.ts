import {
  DeviceLogInstance,
  IDeviceLogCreationModelAttributes
} from '../models/DeviceLogModel'
import { DeviceModel } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'
import { DeviceLogModel } from '../models/DeviceLogModel'

export interface FindAllDeviceLogOptions {
  deviceLogDeviceId?: number
  page?: number
  size?: number
  pagination?: boolean
}

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

export class DeviceLogService {
  static async create(payload: CreateDeviceLogPayload): Promise<DeviceLogInstance> {
    const deviceLog = await DeviceLogModel.create(payload)
    return deviceLog
  }

  static async findAll(
    options: FindAllDeviceLogOptions = {}
  ): Promise<PaginatedDeviceLogResult> {
    const { deviceLogDeviceId, page = 0, size = 10, pagination = true } = options
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
  }

  static async findById(deviceLogId: number): Promise<DeviceLogInstance | null> {
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
    return deviceLog
  }

  static async update(payload: UpdateDeviceLogPayload): Promise<number> {
    const [affectedRows] = await DeviceLogModel.update(payload, {
      where: { deleted: 0, deviceLogId: payload.deviceLogId }
    })
    return affectedRows
  }

  static async remove(deviceLogId: number): Promise<DeviceLogInstance | null> {
    const deviceLog = await DeviceLogModel.findOne({
      where: { deleted: 0, deviceLogId }
    })

    if (deviceLog == null) return null

    deviceLog.deleted = true
    await deviceLog.save()
    return deviceLog
  }

  static async exists(deviceLogId: number): Promise<boolean> {
    const deviceLog = await this.findById(deviceLogId)
    return deviceLog != null
  }

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
  }
}
