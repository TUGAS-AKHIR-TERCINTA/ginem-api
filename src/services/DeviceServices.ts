import { DeviceLogModel } from '../models/DeviceLogModel'
import { DeviceModel } from '../models/DeviceModel'
import type { DeviceInstance, IDeviceCreationAttributes } from '../models/DeviceModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'

/** Options for listing devices with optional pagination */
export interface FindAllDeviceOptions {
  /** 1-based page number (page 1 = first page) */
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

    const existingDevice = await DeviceModel.findOne({
      where: { deviceName: createData.deviceName.toLocaleUpperCase() }
    })

    if (existingDevice) {
      throw AppError.conflict('Device already exists')
    }

    const device = await DeviceModel.create(createData)
    return device
  }

  /**
   * List devices with optional pagination. Page is 1-based (page 1 = first page).
   */
  static async findAll(
    options: FindAllDeviceOptions = {}
  ): Promise<PaginatedDeviceResult> {
    const { page = 1, size = 10, pagination = true } = options
    const pager = new Pagination(Number(page) || 1, Number(size) || 10)

    const result = await DeviceModel.findAndCountAll({
      where: { deleted: 0 },
      include: [
        {
          model: DeviceLogModel,
          as: 'deviceLogs',
          attributes: ['deviceLogId', 'deviceLogData', 'createdAt']
        }
      ],

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
   * @throws {AppError} AppError.notFound when device does not exist
   */
  static async findById(deviceId: number): Promise<DeviceInstance> {
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
  }

  /**
   * Update an existing device.
   * @throws {AppError} AppError.notFound when device does not exist
   */
  static async update(payload: UpdateDevicePayload): Promise<number> {
    const [affectedRows] = await DeviceModel.update(payload, {
      where: { deleted: 0, deviceId: payload.deviceId }
    })
    if (affectedRows === 0) {
      throw AppError.notFound('Device not found')
    }
    return affectedRows
  }

  /**
   * Soft-delete a device.
   * @throws {AppError} AppError.notFound when device does not exist
   */
  static async remove(deviceId: number): Promise<DeviceInstance> {
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

  /**
   * Check if a device exists (non-deleted). Returns false when device not found (does not throw).
   */
  static async exists(deviceId: number): Promise<boolean> {
    try {
      await this.findById(deviceId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Find a single device by name (non-deleted). First match if multiple.
   */
  static async findByName(deviceName: string): Promise<DeviceInstance | null> {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceName }
    })

    return device
  }
}
