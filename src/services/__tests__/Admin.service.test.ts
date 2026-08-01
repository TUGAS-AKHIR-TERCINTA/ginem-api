import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../../models/UserModel'
import { AdminService } from '../Admin.service'
import { hashPassword } from '../../utilities/scurePassword'

jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../utilities/scurePassword', () => ({
  hashPassword: jest.fn((password: string) => `hashed_${password}`)
}))

jest.mock('../../models/UserModel', () => ({
  UserModel: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  }
}))

const mockedUserModel = jest.mocked(UserModel)

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('returns paginated admins', async () => {
      mockedUserModel.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ userId: 1, userName: 'Admin' }]
      } as never)

      const result = await AdminService.findAll({
        page: 1,
        size: 10,
        pagination: true
      })

      expect(result.totalItems).toBe(1)
      expect(mockedUserModel.findAndCountAll).toHaveBeenCalled()
    })

    it('wraps unexpected errors', async () => {
      mockedUserModel.findAndCountAll.mockRejectedValue(new Error('db down'))

      await expect(
        AdminService.findAll({
          page: 1,
          size: 10,
          pagination: false
        })
      ).rejects.toMatchObject({
        message: 'Failed to list admins',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
      })
    })
  })

  describe('findById', () => {
    it('throws not found when admin is missing', async () => {
      mockedUserModel.findOne.mockResolvedValue(null)

      await expect(AdminService.findById(99)).rejects.toMatchObject({
        message: 'Admin not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('create', () => {
    it('creates admin when email is available', async () => {
      mockedUserModel.findOne.mockResolvedValue(null)
      mockedUserModel.create.mockResolvedValue({} as never)

      await AdminService.create({
        userName: 'Admin',
        userEmail: 'admin@example.com',
        userPassword: 'secret12'
      })

      expect(hashPassword).toHaveBeenCalledWith('secret12')
      expect(mockedUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: 'admin@example.com',
          userRole: 'admin',
          userPassword: 'hashed_secret12'
        })
      )
    })

    it('throws conflict when email already exists', async () => {
      mockedUserModel.findOne.mockResolvedValue({ userId: 1 } as never)

      await expect(
        AdminService.create({
          userName: 'Admin',
          userEmail: 'admin@example.com',
          userPassword: 'secret12'
        })
      ).rejects.toMatchObject({
        message: 'Email already registered',
        statusCode: StatusCodes.CONFLICT
      })
    })
  })

  describe('update', () => {
    it('throws bad request when no fields provided', async () => {
      await expect(
        AdminService.update({
          userId: 1
        })
      ).rejects.toMatchObject({
        message: 'No fields to update',
        statusCode: StatusCodes.BAD_REQUEST
      })
    })
  })

  describe('remove', () => {
    it('prevents deleting own account', async () => {
      await expect(AdminService.remove(1, 1)).rejects.toMatchObject({
        message: 'Cannot delete your own admin account',
        statusCode: StatusCodes.BAD_REQUEST
      })
    })

    it('prevents deleting the last admin', async () => {
      mockedUserModel.findOne.mockResolvedValue({ destroy: jest.fn() } as never)
      mockedUserModel.count.mockResolvedValue(1)

      await expect(AdminService.remove(2, 1)).rejects.toMatchObject({
        message: 'Cannot delete the last admin account',
        statusCode: StatusCodes.CONFLICT
      })
    })
  })
})
