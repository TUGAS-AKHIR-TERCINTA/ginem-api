import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { SchedulerLogModel } from '../models/SchedulerLogModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'
import { IFindAllSchedulerLog } from '../schemas/SchedulerLogSchema'

export type SchedulerLogType = 'actuator' | 'sensor_data'
export type SchedulerLogStatus = 'pending' | 'completed' | 'failed'

export class SchedulerLogService {
  static async findAll(payload: IFindAllSchedulerLog) {
    try {
      const {
        type,
        status,
        deviceName,
        page = 1,
        size = 20,
        pagination = true,
        dateFrom,
        dateTo
      } = payload
      const pager = new Pagination(Number(page) || 1, Number(size) || 20)

      const where: Record<string, unknown> = { deleted: 0 }

      if (type != null && ['actuator', 'sensor_data'].includes(type)) {
        where.type = type
      }

      if (status != null && ['pending', 'completed', 'failed'].includes(status)) {
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

      return pager.formatData(result)
    } catch (serverError) {
      if (serverError instanceof AppError) throw serverError
      logger.error(`[SchedulerLogService] findAll failed: ${String(serverError)}`)
      throw new AppError(
        'Failed to fetch scheduler logs',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async findById(schedulerLogId: number) {
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
    } catch (serverError) {
      if (serverError instanceof AppError) throw serverError
      logger.error(`[SchedulerLogService] findById failed: ${String(serverError)}`)
      throw new AppError(
        'Failed to fetch scheduler log',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
