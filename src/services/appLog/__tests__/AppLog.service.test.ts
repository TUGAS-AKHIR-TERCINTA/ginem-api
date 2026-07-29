import { StatusCodes } from 'http-status-codes'
import { AppLogModel } from '../../../models/AppLogModel'
import { AppLogService } from '..'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../models/AppLogModel', () => ({
  AppLogModel: {
    findAndCountAll: jest.fn(),
    create: jest.fn()
  }
}))

const mockedAppLogModel = AppLogModel as jest.Mocked<typeof AppLogModel>

describe('AppLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('returns paginated app logs', async () => {
      mockedAppLogModel.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [{ appLogId: 1 }, { appLogId: 2 }]
      } as never)

      const result = await AppLogService.findAll({
        page: 1,
        size: 10,
        pagination: true,
        level: undefined,
        search: undefined
      })

      expect(result.totalItems).toBe(2)
      expect(result.items).toHaveLength(2)
    })

    it('wraps unexpected errors', async () => {
      mockedAppLogModel.findAndCountAll.mockRejectedValue(new Error('db error'))

      await expect(
        AppLogService.findAll({
          page: 1,
          size: 10,
          pagination: false,
          level: undefined,
          search: undefined
        })
      ).rejects.toMatchObject({
        message: 'Failed to fetch logs',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
      })
    })
  })

  describe('create', () => {
    it('creates an app log entry', async () => {
      mockedAppLogModel.create.mockResolvedValue({ appLogId: 1 } as never)

      const result = await AppLogService.create({
        appLogLevel: 'error',
        appLogMessage: 'Something failed',
        appLogSource: 'test',
        appLogMeta: null
      })

      expect(result).toEqual({ appLogId: 1 })
      expect(mockedAppLogModel.create).toHaveBeenCalledWith({
        appLogLevel: 'error',
        appLogMessage: 'Something failed',
        appLogSource: 'test',
        appLogMeta: null
      })
    })
  })
})
