import { DeviceModel } from '../models/DeviceModel'
import type { DeviceInstance, IDeviceCreationAttributes } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'

/** Options for listing devices with optional pagination */
export interface FindAllDeviceOptions {
  page?: number
  size?: number
  pagination?: boolean
  search?: string
}

/** Result shape for paginated list (matches Pagination.formatData) */
export interface PaginatedDeviceResult {
  totalItems: number
  items: DeviceInstance[]
  totalPages: number
  currentPage: number
}

/** Payload for creating a device (aligned with schema, excluding jwtPayload). deviceStatus is optional (defaults to 'offline'). */
export type CreateDevicePayload = Omit<IDeviceCreationAttributes, 'deviceStatus'> & {
  deviceStatus?: IDeviceCreationAttributes['deviceStatus']
}

/** Payload for updating a device (partial, with deviceId) */
export interface UpdateDevicePayload {
  deviceId: number
  deviceToken?: string
  deviceName?: string
  deviceType?: IDeviceCreationAttributes['deviceType']
  deviceStatus?: IDeviceCreationAttributes['deviceStatus']
  deviceFirmwareVersion?: string
  deviceMetadata?: object
}

/**
 * Device service: business logic for device CRUD.
 * Controllers handle HTTP (validation, status codes, response shape); this layer handles data.
 */
export class DeviceService {
  /**
   * Create a new device.
   */
  static async create(payload: CreateDevicePayload): Promise<DeviceInstance> {
    const createData: IDeviceCreationAttributes = {
      ...payload,
      deviceStatus: payload.deviceStatus ?? 'offline'
    }
    const device = await DeviceModel.create(createData)
    return device
  }

  /**
   * List devices with optional pagination.
   */
  static async findAll(
    options: FindAllDeviceOptions = {}
  ): Promise<PaginatedDeviceResult> {
    const { page = 0, size = 10, pagination = true } = options
    const pager = new Pagination(Number(page) || 0, Number(size) || 10)

    const result = await DeviceModel.findAndCountAll({
      where: { deleted: 0 },
      order: [['deviceId', 'desc']],
      ...(pagination === true && {
        limit: pager.limit,
        offset: pager.offset
      })
    })

    return pager.formatData(result) as PaginatedDeviceResult
  }

  /**
   * Find a single device by id (non-deleted).
   */
  static async findById(deviceId: number): Promise<DeviceInstance | null> {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId }
    })
    return device
  }

  /**
   * Update an existing device. Returns the updated row count (0 if not found).
   */
  static async update(payload: UpdateDevicePayload): Promise<number> {
    const [affectedRows] = await DeviceModel.update(payload, {
      where: { deleted: 0, deviceId: payload.deviceId }
    })
    return affectedRows
  }

  /**
   * Soft-delete a device. Returns the device if found and deleted, null otherwise.
   */
  static async remove(deviceId: number): Promise<DeviceInstance | null> {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceId }
    })
    if (device == null) return null
    device.deleted = true
    await device.save()
    return device
  }

  /**
   * Check if a device exists (non-deleted).
   */
  static async exists(deviceId: number): Promise<boolean> {
    const device = await this.findById(deviceId)
    return device != null
  }
}
