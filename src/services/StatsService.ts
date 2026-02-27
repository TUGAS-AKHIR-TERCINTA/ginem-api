import { StatusCodes } from 'http-status-codes'
import { AppLogModel } from '../models/AppLogModel'
import { DeviceModel } from '../models/DeviceModel'
import { SchedulerLogModel } from '../models/SchedulerLogModel'
import { UserModel } from '../models/UserModel'
import { VectorIndexesModel } from '../models/VectorIndexesModel'
import { AppError } from '../utilities/AppError'
import logger from '../../logs'

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
        VectorIndexesModel.count(),
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
      logger.error(`[StatsService] getCounts failed: ${String(error)}`)
      throw new AppError(
        'Failed to fetch stats counts',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
