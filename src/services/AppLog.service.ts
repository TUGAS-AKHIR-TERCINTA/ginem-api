import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppLogModel } from '../models/AppLogModel'
import { AppError } from '../utilities/AppError'
import { Pagination } from '../utilities/pagination'
import logger from '../utilities/logger'
import { ICreateAppLog, IFindAllAppLogs } from '../schemas/AppLogSchema'

export class AppLogService {
  static async create(payload: ICreateAppLog) {
    try {
      return await AppLogModel.create({
        appLogLevel: payload.appLogLevel,
        appLogMessage: payload.appLogMessage,
        appLogSource: payload.appLogSource ?? null,
        appLogMeta: payload.appLogMeta ?? null
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AppLogService] create failed: ${String(error)}`)
      throw new AppError('Failed to create log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAll(payload: IFindAllAppLogs) {
    try {
      const { page = 1, size = 10, level, search, pagination } = payload
      const pager = new Pagination(page, size)

      const where: Record<string, unknown> = {}

      if (level && ['error', 'warn', 'info'].includes(level)) {
        where.appLogLevel = level
      }

      if (search && String(search).trim()) {
        const term = `%${String(search).trim()}%`
        where.appLogMessage = { [Op.like]: term }
      }

      const result = await AppLogModel.findAndCountAll({
        where,
        order: [['appLogId', 'DESC']],
        ...(pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (error) {
      logger.error(`[AppLogService] findAll failed: ${String(error)}`)
      throw new AppError('Failed to fetch logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
