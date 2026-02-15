import { AppLogModel } from '../models/AppLogModel'
import type { AppLogInstance } from '../models/AppLogModel'
import { Op } from 'sequelize'
import { Pagination } from '../utilities/pagination'

export type AppLogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug'

export interface FindAllAppLogOptions {
  level?: AppLogLevel | string
  page?: number
  size?: number
  pagination?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface PaginatedAppLogResult {
  totalItems: number
  items: AppLogInstance[]
  totalPages: number
  currentPage: number
}

export class AppLogService {
  static async findAll(
    options: FindAllAppLogOptions = {}
  ): Promise<PaginatedAppLogResult> {
    const { level, page = 0, size = 20, pagination = true, dateFrom, dateTo } = options
    const pager = new Pagination(Number(page) || 0, Number(size) || 20)

    const where: Record<string, unknown> = { deleted: 0 }
    if (level != null && level !== '') {
      where.level = level
    }
    if (dateFrom != null || dateTo != null) {
      where.createdAt = {}
      if (dateFrom != null) {
        ;(where.createdAt as Record<string, unknown>)[Op.gte] = new Date(dateFrom)
      }
      if (dateTo != null) {
        ;(where.createdAt as Record<string, unknown>)[Op.lte] = new Date(dateTo)
      }
    }

    const result = await AppLogModel.findAndCountAll({
      where,
      order: [['logId', 'desc']],
      ...(pagination === true && {
        limit: pager.limit,
        offset: pager.offset
      })
    })

    return pager.formatData(result) as PaginatedAppLogResult
  }

  static async findById(logId: number): Promise<AppLogInstance | null> {
    const log = await AppLogModel.findOne({
      where: { deleted: 0, logId }
    })
    return log
  }
}
