import { StatusCodes } from 'http-status-codes'
import { AppLogModel } from '../models/AppLogModel'
import { DeviceModel } from '../models/DeviceModel'
import { SchedulerLogModel } from '../models/SchedulerLogModel'
import { UserModel } from '../models/UserModel'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'
import { IndexingModel } from '../models/IndexingModel'

export interface StatsCounts {
  devices: number
  users: number
  vectorIndexes: number
  schedulerLogs: number
  appLogs: number
}

export class StatsService {
  static async getCounts (): Promise<StatsCounts> {
    try {
      const [devices, users, vectorIndexes, schedulerLogs, appLogs] = await Promise.all([
        DeviceModel.count(),
        UserModel.count(),
        IndexingModel.count(),
        SchedulerLogModel.count(),
        AppLogModel.count()
      ])

      return {
        devices,
        users,
        vectorIndexes,
        schedulerLogs,
        appLogs
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[StatsService] getCounts failed: ${String(serviceError)}`)
      throw new AppError('Failed to get stats counts', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
