import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { SchedulerLogModel } from '../models/SchedulerLogModel'
import type { SchedulerLogInstance } from '../models/SchedulerLogModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../../logs'

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
    try {
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
        const scheduledAtCondition: Record<string | symbol, unknown> = {}

        if (dateFrom != null) {
          scheduledAtCondition[Op.gte] = new Date(dateFrom)
        }

        if (dateTo != null) {
          scheduledAtCondition[Op.lte] = new Date(dateTo)
        }

        where.scheduledAt = scheduledAtCondition
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
    } catch (error) {
      logger.error(`[SchedulerLogService] findAll failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch scheduler logs',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findById(schedulerLogId: number): Promise<SchedulerLogInstance | null> {
    try {
      const log = await SchedulerLogModel.findOne({
        where: { deleted: 0, schedulerLogId }
      })

      if (log == null) {
        const message = 'Scheduler log not found!'
        logger.info('Attempt to fetch non-existing scheduler log')
        throw AppError.notFound(message)
      }

      return log
    } catch (error) {
      logger.error(`[SchedulerLogService] findById failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch scheduler log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
