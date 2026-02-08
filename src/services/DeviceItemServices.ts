import { DeviceItemModel } from '../models/DeviceItemModel'
import type {
  DeviceItemInstance,
  IDeviceItemCreationAttributes
} from '../models/DeviceItemModel'
import { DeviceModel } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'

export interface FindAllDeviceItemOptions {
  deviceItemDeviceId?: number
  page?: number
  size?: number
  pagination?: boolean
}

export interface PaginatedDeviceItemResult {
  totalItems: number
  items: DeviceItemInstance[]
  totalPages: number
  currentPage: number
}

export type CreateDeviceItemPayload = IDeviceItemCreationAttributes

export interface UpdateDeviceItemPayload {
  deviceItemId: number
  deviceItemDeviceId?: number
  deviceItemValue?: string
}

export class DeviceItemService {
  static async create(payload: CreateDeviceItemPayload): Promise<DeviceItemInstance> {
    const deviceItem = await DeviceItemModel.create(payload)
    return deviceItem
  }

  static async findAll(
    options: FindAllDeviceItemOptions = {}
  ): Promise<PaginatedDeviceItemResult> {
    const { deviceItemDeviceId, page = 0, size = 10, pagination = true } = options
    const pager = new Pagination(Number(page) || 0, Number(size) || 10)

    const where: Record<string, unknown> = { deleted: 0 }
    if (deviceItemDeviceId != null) {
      where.deviceItemDeviceId = deviceItemDeviceId
    }

    const result = await DeviceItemModel.findAndCountAll({
      where,
      order: [['deviceItemId', 'desc']],
      ...(pagination === true && {
        limit: pager.limit,
        offset: pager.offset
      }),
      include: [{ model: DeviceModel, as: 'Device', attributes: ['deviceId', 'deviceName', 'deviceType'] }]
    })

    return pager.formatData(result) as PaginatedDeviceItemResult
  }

  static async findById(deviceItemId: number): Promise<DeviceItemInstance | null> {
    const deviceItem = await DeviceItemModel.findOne({
      where: { deleted: 0, deviceItemId },
      include: [{ model: DeviceModel, as: 'Device', attributes: ['deviceId', 'deviceName', 'deviceType', 'deviceStatus'] }]
    })
    return deviceItem
  }

  static async update(payload: UpdateDeviceItemPayload): Promise<number> {
    const [affectedRows] = await DeviceItemModel.update(payload, {
      where: { deleted: 0, deviceItemId: payload.deviceItemId }
    })
    return affectedRows
  }

  static async remove(deviceItemId: number): Promise<DeviceItemInstance | null> {
    const deviceItem = await DeviceItemModel.findOne({
      where: { deleted: 0, deviceItemId }
    })
    if (deviceItem == null) return null
    deviceItem.deleted = true
    await deviceItem.save()
    return deviceItem
  }

  static async exists(deviceItemId: number): Promise<boolean> {
    const deviceItem = await this.findById(deviceItemId)
    return deviceItem != null
  }

  static async deviceExists(deviceItemDeviceId: number): Promise<boolean> {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId: deviceItemDeviceId }
    })
    return device != null
  }
}
