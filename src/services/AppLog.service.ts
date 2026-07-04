import { Op, WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'
import { AppLogModel, IAppLogAttributes } from '../models/AppLogModel'
import { AppError } from '../utilities/AppError'
import { Pagination } from '../utilities/pagination'
import logger from '../utilities/logger'
import { ICreateAppLog, IFindAllAppLogs } from '../schemas/AppLogSchema'

export class AppLogService {
  private static buildFindAllWhere(payload: IFindAllAppLogs) {
    const where: WhereOptions<IAppLogAttributes> = {
      deleted: 0
    }

    if (payload.level != null && ['error', 'warn', 'info'].includes(payload.level)) {
      where.appLogLevel = payload.level
    }

    if (payload.search != null && String(payload.search).trim()) {
      const term = `%${String(payload.search).trim()}%`
      where.appLogMessage = { [Op.like]: term }
    }
    return where
  }

  static async findAll(payload: IFindAllAppLogs) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await AppLogModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['appLogId', 'DESC']],
        ...(payload.pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AppLogService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to fetch logs', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async create(payload: ICreateAppLog) {
    try {
      return await AppLogModel.create({
        appLogLevel: payload.appLogLevel,
        appLogMessage: payload.appLogMessage,
        appLogSource: payload.appLogSource ?? null,
        appLogMeta: payload.appLogMeta ?? null
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AppLogService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create app log', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
