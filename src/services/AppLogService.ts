import { Op } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppLogModel, type AppLogLevel } from '../models/AppLogModel'
import { AppError } from '../errors/AppError'
import { Pagination } from '../utilities/pagination'
import logger from '../../logs'

export interface CreateLogParams {
  appLogLevel: AppLogLevel
  appLogMessage: string
  appLogSource?: string | null
  appLogMeta?: string | null
}

export interface FindAllLogsParams {
  page: number
  size: number
  appLogLevel?: AppLogLevel | null
  search?: string | null
  pagination?: string | null
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
      const { page, size, appLogLevel, search, pagination } = params

      const paginationInfo = new Pagination(page, size)

      const where: any = {}

      if (appLogLevel && ['error', 'warn', 'info'].includes(appLogLevel)) {
        where.appLogLevel = appLogLevel
      }

      if (search && String(search).trim()) {
        const term = `%${String(search).trim()}%`
        where[Op.or] = [
          { appLogMessage: { [Op.like]: term } },
          { appLogSource: { [Op.like]: term } }
        ]
      }

      const result = await AppLogModel.findAndCountAll({
        where,
        order: [['appLogId', 'DESC']],
        ...(pagination === 'true' && {
          limit: paginationInfo.limit,
          offset: paginationInfo.offset
        })
      })

      const formatted = paginationInfo.formatData(result)

      return { data: result, formatted }
    } catch (error) {
      logger.error(`[AppLogService] findAll failed: ${String(error)}`)
      throw new AppError('Failed to fetch logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
