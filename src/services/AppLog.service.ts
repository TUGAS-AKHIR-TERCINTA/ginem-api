import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppLogModel, type AppLogLevel } from '../models/AppLogModel'
import { AppError } from '../utilities/AppError'
import { Pagination } from '../utilities/pagination'
import logger from '../utilities/logger'

export interface CreateLogParams {
  appLogLevel: AppLogLevel
  appLogMessage: string
  appLogSource?: string | null
  appLogMeta?: string | null
}

export interface FindAllLogsParams {
  page: number
  size: number
  level?: AppLogLevel | null
  search?: string | null
  pagination?: boolean | null
}

export class AppLogService {
  static async create(params: CreateLogParams) {
    try {
      return await AppLogModel.create({
        appLogLevel: params.appLogLevel,
        appLogMessage: params.appLogMessage,
        appLogSource: params.appLogSource ?? null,
        appLogMeta: params.appLogMeta ?? null
      })
    } catch (error) {
      logger.error(`[LogService] create failed: ${String(error)}`)
      throw new AppError('Failed to create log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAll(params: FindAllLogsParams) {
    try {
      const { page = 1, size = 10, level, search, pagination } = params

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
