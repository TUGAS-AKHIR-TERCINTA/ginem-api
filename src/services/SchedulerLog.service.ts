import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import {
  ISchedulerLogModelAttributes,
  SchedulerLogModel
} from '../models/SchedulerLogModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'
import { IFindAllSchedulerLog } from '../schemas/SchedulerLogSchema'

export type SchedulerLogType = 'actuator' | 'sensor_data'
export type SchedulerLogStatus = 'pending' | 'completed' | 'failed'

export class SchedulerLogService {
  private static buildFindAllWhere(payload: IFindAllSchedulerLog) {
    const where: WhereOptions<ISchedulerLogModelAttributes> = { deleted: 0 }

    if (payload.type != null && ['actuator', 'sensor_data'].includes(payload.type)) {
      where.type = payload.type
    }

    if (
      payload.status != null &&
      ['pending', 'completed', 'failed'].includes(payload.status)
    ) {
      where.status = payload.status
    }

    if (payload.deviceName != null && payload.deviceName !== '') {
      where.deviceName = payload.deviceName
    }

    if (payload.dateFrom != null || payload.dateTo != null) {
      const scheduledAtCondition: Record<string | symbol, unknown> = {}

      if (payload.dateFrom != null) {
        scheduledAtCondition[Op.gte] = new Date(payload.dateFrom)
      }

      if (payload.dateTo != null) {
        scheduledAtCondition[Op.lte] = new Date(payload.dateTo)
      }

      where.scheduledAt = scheduledAtCondition
    }

    return where
  }

  static async findAll(payload: IFindAllSchedulerLog) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await SchedulerLogModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['schedulerLogId', 'desc']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SchedulerLogService] findAll failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to list scheduler logs',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findById(schedulerLogId: number) {
    try {
      const result = await SchedulerLogModel.findOne({
        where: { deleted: 0, schedulerLogId }
      })

      if (result == null) {
        throw AppError.notFound('Scheduler log not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[SchedulerLogService] findById failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to get scheduler log by id',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
