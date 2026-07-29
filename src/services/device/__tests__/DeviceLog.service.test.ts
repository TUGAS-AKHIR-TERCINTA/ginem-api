import { StatusCodes } from 'http-status-codes'
import { DeviceLogModel } from '../../../models/DeviceLogModel'
import { DeviceModel } from '../../../models/DeviceModel'
import { DeviceLogService } from '../DeviceLog.service'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../models/DeviceLogModel', () => ({
  DeviceLogModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))

jest.mock('../../../models/DeviceModel', () => ({
  DeviceModel: {
    findOne: jest.fn()
  }
}))

const mockedDeviceLogModel = DeviceLogModel as jest.Mocked<typeof DeviceLogModel>
const mockedDeviceModel = DeviceModel as jest.Mocked<typeof DeviceModel>

describe('DeviceLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('throws not found when device does not exist', async () => {
      mockedDeviceModel.findOne.mockResolvedValue(null)

      await expect(
        DeviceLogService.create({
          deviceLogDeviceId: 1,
          deviceLogData: 'temp=30'
        })
      ).rejects.toMatchObject({
        message: 'Device not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })

    it('creates log when device exists', async () => {
      mockedDeviceModel.findOne.mockResolvedValue({ deviceId: 1 } as never)
      mockedDeviceLogModel.create.mockResolvedValue({ deviceLogId: 10 } as never)

      const result = await DeviceLogService.create({
        deviceLogDeviceId: 1,
        deviceLogData: 'temp=30'
      })

      expect(result).toEqual({ deviceLogId: 10 })
    })
  })

  describe('findById', () => {
    it('throws not found when log is missing', async () => {
      mockedDeviceLogModel.findOne.mockResolvedValue(null)

      await expect(DeviceLogService.findById(10)).rejects.toMatchObject({
        message: 'Device log not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('findLastLogsByDeviceId', () => {
    it('maps latest logs for a device', async () => {
      mockedDeviceLogModel.findAll.mockResolvedValue([
        {
          deviceLogId: 1,
          deviceLogData: 'temp=28',
          createdAt: new Date('2026-06-10T10:00:00Z')
        }
      ] as never)

      const result = await DeviceLogService.findLastLogsByDeviceId(5, 10)

      expect(result).toEqual([
        {
          deviceLogId: 1,
          deviceLogData: 'temp=28',
          createdAt: new Date('2026-06-10T10:00:00Z')
        }
      ])
    })
  })

  describe('deviceExists', () => {
    it('returns true when device exists', async () => {
      mockedDeviceModel.findOne.mockResolvedValue({ deviceId: 1 } as never)

      await expect(DeviceLogService.deviceExists(1)).resolves.toBe(true)
    })
  })

  describe('exists', () => {
    it('returns false when log does not exist', async () => {
      mockedDeviceLogModel.findOne.mockResolvedValue(null)

      await expect(DeviceLogService.exists(99)).resolves.toBe(false)
    })
  })

  describe('update', () => {
    it('throws bad request when no fields provided', async () => {
      await expect(
        DeviceLogService.update({
          deviceLogId: 1
        })
      ).rejects.toMatchObject({
        message: 'No fields to update',
        statusCode: StatusCodes.BAD_REQUEST
      })
    })
  })
})
