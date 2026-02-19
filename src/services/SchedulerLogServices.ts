import { SchedulerLogModel } from '../models/SchedulerLogModel'
import type { SchedulerLogInstance } from '../models/SchedulerLogModel'
import { Op } from 'sequelize'
import { Pagination } from '../utilities/pagination'

export type SchedulerLogType = 'actuator' | 'sensor_data'
export type SchedulerLogStatus = 'pending' | 'completed' | 'failed'

export interface FindAllSchedulerLogOptions {
  type?: SchedulerLogType | string
  status?: SchedulerLogStatus | string
  deviceName?: string
  page?: number
  size?: number
  pagination?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface PaginatedSchedulerLogResult {
  totalItems: number
  items: SchedulerLogInstance[]
  totalPages: number
  currentPage: number
}

export class SchedulerLogService {
  static async findAll(
    options: FindAllSchedulerLogOptions = {}
  ): Promise<PaginatedSchedulerLogResult> {
    const {
      type,
      status,
      deviceName,
      page = 0,
      size = 20,
      pagination = true,
      dateFrom,
      dateTo
    } = options
    const pager = new Pagination(Number(page) || 0, Number(size) || 20)

    const where: Record<string, unknown> = { deleted: 0 }
    if (type != null && type !== '') {
      where.type = type
    }
    if (status != null && status !== '') {
      where.status = status
    }
    if (deviceName != null && deviceName !== '') {
      where.deviceName = deviceName
    }
    if (dateFrom != null || dateTo != null) {
      where.scheduledAt = {}
      if (dateFrom != null) {
        ;(where.scheduledAt as Record<string, unknown>)[Op.gte] = new Date(dateFrom)
      }
      if (dateTo != null) {
        ;(where.scheduledAt as Record<string, unknown>)[Op.lte] = new Date(dateTo)
      }
    }

    const result = await SchedulerLogModel.findAndCountAll({
      where,
      order: [['schedulerLogId', 'desc']],
      ...(pagination === true && {
        limit: pager.limit,
        offset: pager.offset
      })
    })

    return pager.formatData(result) as PaginatedSchedulerLogResult
  }

  static async findById(schedulerLogId: number): Promise<SchedulerLogInstance | null> {
    const log = await SchedulerLogModel.findOne({
      where: { deleted: 0, schedulerLogId }
    })
    return log
  }
}
