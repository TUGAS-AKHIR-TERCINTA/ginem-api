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

/**
 * Stats service: aggregate counts from devices, users, vector_indexes, scheduler_logs, app_logs.
 */
export class StatsService {
  /**
   * Get total counts for devices, users, vector indexes, scheduler logs, and app logs.
   * Uses Model.count() (paranoid models exclude soft-deleted rows).
   */
  static async getCounts(): Promise<StatsCounts> {
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[StatsService] getCounts failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch stats counts',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
