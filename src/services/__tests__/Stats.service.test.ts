jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../models/AppLogModel', () => ({
  AppLogModel: { count: jest.fn() }
}))

jest.mock('../../models/DeviceModel', () => ({
  DeviceModel: { count: jest.fn() }
}))

jest.mock('../../models/IndexingModel', () => ({
  IndexingModel: { count: jest.fn() }
}))

jest.mock('../../models/SchedulerLogModel', () => ({
  SchedulerLogModel: { count: jest.fn() }
}))

jest.mock('../../models/UserModel', () => ({
  UserModel: { count: jest.fn() }
}))

import { StatusCodes } from 'http-status-codes'
import { AppLogModel } from '../../models/AppLogModel'
import { DeviceModel } from '../../models/DeviceModel'
import { IndexingModel } from '../../models/IndexingModel'
import { SchedulerLogModel } from '../../models/SchedulerLogModel'
import { UserModel } from '../../models/UserModel'
import { StatsService } from '../Stats.service'

describe('StatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns aggregate counts from all models', async () => {
    ;(DeviceModel.count as jest.Mock).mockResolvedValue(5)
    ;(UserModel.count as jest.Mock).mockResolvedValue(3)
    ;(IndexingModel.count as jest.Mock).mockResolvedValue(12)
    ;(SchedulerLogModel.count as jest.Mock).mockResolvedValue(7)
    ;(AppLogModel.count as jest.Mock).mockResolvedValue(20)

    await expect(StatsService.getCounts()).resolves.toEqual({
      devices: 5,
      users: 3,
      vectorIndexes: 12,
      schedulerLogs: 7,
      appLogs: 20
    })
  })

  it('wraps unexpected errors', async () => {
    ;(DeviceModel.count as jest.Mock).mockRejectedValue(new Error('db error'))

    await expect(StatsService.getCounts()).rejects.toMatchObject({
      message: 'Failed to get stats counts',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})
