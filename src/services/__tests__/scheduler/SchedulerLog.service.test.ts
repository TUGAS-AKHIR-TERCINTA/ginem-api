import { StatusCodes } from 'http-status-codes'
import { SchedulerLogModel } from '../../../models/SchedulerLogModel'
import { SchedulerLogService } from '../../scheduler/SchedulerLog.service'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../models/SchedulerLogModel', () => ({
  SchedulerLogModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn()
  }
}))

const mockedSchedulerLogModel = SchedulerLogModel as jest.Mocked<typeof SchedulerLogModel>

describe('SchedulerLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('returns paginated scheduler logs', async () => {
      mockedSchedulerLogModel.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ schedulerLogId: 1 }]
      } as never)

      const result = await SchedulerLogService.findAll({
        page: 1,
        size: 10,
        pagination: true,
        jwtPayload: { userId: 1 },
        type: 'actuator',
        status: 'completed'
      })

      expect(result.totalItems).toBe(1)
    })
  })

  describe('findById', () => {
    it('throws not found when scheduler log is missing', async () => {
      mockedSchedulerLogModel.findOne.mockResolvedValue(null)

      await expect(SchedulerLogService.findById(10)).rejects.toMatchObject({
        message: 'Scheduler log not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })

    it('returns scheduler log when found', async () => {
      mockedSchedulerLogModel.findOne.mockResolvedValue({
        schedulerLogId: 10
      } as never)

      await expect(SchedulerLogService.findById(10)).resolves.toEqual({
        schedulerLogId: 10
      })
    })
  })
})
