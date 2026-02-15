import { DeviceValueModel } from '../models/DeviceValueModel'
import type {
  DeviceValueInstance,
  IDeviceValueCreationAttributes
} from '../models/DeviceValueModel'
import { DeviceModel } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'

export interface FindAllDeviceValueOptions {
  deviceValueDeviceId?: number
  page?: number
  size?: number
  pagination?: boolean
}

export interface PaginatedDeviceValueResult {
  totalItems: number
  items: DeviceValueInstance[]
  totalPages: number
  currentPage: number
}

export type CreateDeviceValuePayload = IDeviceValueCreationAttributes

export interface UpdateDeviceValuePayload {
  deviceValueId: number
  deviceValueDeviceId?: number
  deviceValueValue?: string
}

export class DeviceValueService {
  static async create(payload: CreateDeviceValuePayload): Promise<DeviceValueInstance> {
    const deviceValue = await DeviceValueModel.create(payload)
    return deviceValue
  }

  static async findAll(
    options: FindAllDeviceValueOptions = {}
  ): Promise<PaginatedDeviceValueResult> {
    const { deviceValueDeviceId, page = 0, size = 10, pagination = true } = options
    const pager = new Pagination(Number(page) || 0, Number(size) || 10)

    const where: Record<string, unknown> = { deleted: 0 }
    if (deviceValueDeviceId != null) {
      where.deviceValueDeviceId = deviceValueDeviceId
    }

    const result = await DeviceValueModel.findAndCountAll({
      where,
      order: [['deviceValueId', 'desc']],
      ...(pagination === true && {
        limit: pager.limit,
        offset: pager.offset
      }),
      include: [{ model: DeviceModel, as: 'Device', attributes: ['deviceId', 'deviceName', 'deviceType'] }]
    })

    return pager.formatData(result) as PaginatedDeviceValueResult
  }

  static async findById(deviceValueId: number): Promise<DeviceValueInstance | null> {
    const deviceValue = await DeviceValueModel.findOne({
      where: { deleted: 0, deviceValueId },
      include: [{ model: DeviceModel, as: 'Device', attributes: ['deviceId', 'deviceName', 'deviceType', 'deviceStatus'] }]
    })
    return deviceValue
  }

  static async update(payload: UpdateDeviceValuePayload): Promise<number> {
    const [affectedRows] = await DeviceValueModel.update(payload, {
      where: { deleted: 0, deviceValueId: payload.deviceValueId }
    })
    return affectedRows
  }

  static async remove(deviceValueId: number): Promise<DeviceValueInstance | null> {
    const deviceValue = await DeviceValueModel.findOne({
      where: { deleted: 0, deviceValueId }
    })
    if (deviceValue == null) return null
    deviceValue.deleted = true
    await deviceValue.save()
    return deviceValue
  }

  static async exists(deviceValueId: number): Promise<boolean> {
    const deviceValue = await this.findById(deviceValueId)
    return deviceValue != null
  }

  static async deviceExists(deviceValueDeviceId: number): Promise<boolean> {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId: deviceValueDeviceId }
    })
    return device != null
  }

  /**
   * Get last N device values for a device (by deviceId), ordered by deviceValueId desc.
   */
  static async getLastValuesByDeviceId(
    deviceId: number,
    limit: number
  ): Promise<Array<{ deviceValueId: number; deviceValueValue: string; createdAt: Date }>> {
    const items = await DeviceValueModel.findAll({
      where: { deleted: 0, deviceValueDeviceId: deviceId },
      order: [['deviceValueId', 'desc']],
      limit,
      attributes: ['deviceValueId', 'deviceValueValue', 'createdAt']
    })
    return items.map((row) => ({
      deviceValueId: row.deviceValueId,
      deviceValueValue: row.deviceValueValue,
      createdAt: row.createdAt as Date
    }))
  }
}
