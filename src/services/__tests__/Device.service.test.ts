jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}))

jest.mock('../../models/DeviceModel', () => ({
  DeviceModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))

jest.mock('../../models/DeviceLogModel', () => ({
  DeviceLogModel: {}
}))

import { StatusCodes } from 'http-status-codes'
import { DeviceModel } from '../../models/DeviceModel'
import { DeviceService } from '../Device.service'

const mockedDeviceModel = DeviceModel as jest.Mocked<typeof DeviceModel>

describe('DeviceService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('returns paginated devices', async () => {
      mockedDeviceModel.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ deviceId: 1, deviceName: 'Relay' }]
      } as never)

      const result = await DeviceService.findAll({
        page: 1,
        size: 10,
        pagination: true,
        jwtPayload: { userId: 1 }
      })

      expect(result.totalItems).toBe(1)
    })
  })

  describe('findById', () => {
    it('throws not found when device is missing', async () => {
      mockedDeviceModel.findOne.mockResolvedValue(null)

      await expect(DeviceService.findById(99)).rejects.toMatchObject({
        message: 'Device not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('create', () => {
    it('creates device with generated token', async () => {
      mockedDeviceModel.findOne.mockResolvedValue(null)
      mockedDeviceModel.create.mockResolvedValue({} as never)

      await DeviceService.create({
        deviceName: 'Relay',
        deviceType: 'actuator'
      })

      expect(mockedDeviceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceName: 'Relay',
          deviceType: 'actuator',
          deviceStatus: 'offline',
          deviceToken: 'fck_test-uuid'
        })
      )
    })

    it('throws conflict when device already exists', async () => {
      mockedDeviceModel.findOne.mockResolvedValue({ deviceId: 1 } as never)

      await expect(
        DeviceService.create({
          deviceName: 'Relay',
          deviceType: 'actuator'
        })
      ).rejects.toMatchObject({
        message: 'Device already exists',
        statusCode: StatusCodes.CONFLICT
      })
    })
  })

  describe('update', () => {
    it('throws bad request when no fields provided', async () => {
      await expect(
        DeviceService.update({
          deviceId: 1
        })
      ).rejects.toMatchObject({
        message: 'No fields to update',
        statusCode: StatusCodes.BAD_REQUEST
      })
    })
  })

  describe('exists', () => {
    it('returns true when device exists', async () => {
      mockedDeviceModel.findOne.mockResolvedValue({ deviceId: 1 } as never)

      await expect(DeviceService.exists(1)).resolves.toBe(true)
    })

    it('returns false when device does not exist', async () => {
      mockedDeviceModel.findOne.mockResolvedValue(null)

      await expect(DeviceService.exists(1)).resolves.toBe(false)
    })
  })
})
