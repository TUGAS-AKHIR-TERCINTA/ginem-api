import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../../../models/UserModel'
import { AuthService } from '../../auth'
import { generateAccessToken } from '../../../utilities/jwt'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../utilities/scurePassword', () => ({
  hashPassword: jest.fn((password: string) => `hashed_${password}`)
}))

jest.mock('../../../utilities/jwt', () => ({
  generateAccessToken: jest.fn(() => 'access-token')
}))

jest.mock('../../../models/UserModel', () => ({
  UserModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))

const mockedUserModel = UserModel as unknown as {
  findOne: jest.Mock
  create: jest.Mock
  update: jest.Mock
}

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loginUser', () => {
    it('returns access token for valid credentials', async () => {
      mockedUserModel.findOne.mockResolvedValue({
        userId: 1,
        userName: 'User',
        userEmail: 'user@example.com',
        userRole: 'user',
        userPassword: 'hashed_secret'
      } as never)

      const result = await AuthService.loginUser({
        userEmail: 'user@example.com',
        userPassword: 'secret'
      })

      expect(generateAccessToken).toHaveBeenCalledWith({
        userId: 1,
        userRole: 'user',
        userEmail: 'user@example.com'
      })
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: ''
      })
    })

    it('throws not found when account does not exist', async () => {
      mockedUserModel.findOne.mockResolvedValue(null)

      await expect(
        AuthService.loginUser({
          userEmail: 'missing@example.com',
          userPassword: 'secret'
        })
      ).rejects.toMatchObject({
        message: 'Account not found. Please register first!',
        statusCode: StatusCodes.NOT_FOUND
      })
    })

    it('throws unauthorized for invalid password', async () => {
      mockedUserModel.findOne.mockResolvedValue({
        userId: 1,
        userName: 'User',
        userEmail: 'user@example.com',
        userRole: 'user',
        userPassword: 'hashed_other'
      } as never)

      await expect(
        AuthService.loginUser({
          userEmail: 'user@example.com',
          userPassword: 'secret'
        })
      ).rejects.toMatchObject({
        statusCode: StatusCodes.UNAUTHORIZED
      })
    })
  })

  describe('registerUser', () => {
    it('creates a new user when email is available', async () => {
      mockedUserModel.findOne.mockResolvedValue(null)
      mockedUserModel.create.mockResolvedValue({} as never)

      await AuthService.registerUser({
        userEmail: 'new@example.com',
        userPassword: 'secret12',
        userRole: 'user'
      })

      expect(mockedUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: 'new@example.com',
          userRole: 'user',
          userPassword: 'hashed_secret12'
        })
      )
    })

    it('throws bad request when email already registered', async () => {
      mockedUserModel.findOne.mockResolvedValue({
        userEmail: 'existing@example.com'
      } as never)

      await expect(
        AuthService.registerUser({
          userEmail: 'existing@example.com',
          userPassword: 'secret12',
          userRole: 'user'
        })
      ).rejects.toMatchObject({
        statusCode: StatusCodes.BAD_REQUEST
      })
    })
  })

  describe('updateUserPassword', () => {
    it('updates password for existing user role user', async () => {
      mockedUserModel.findOne.mockResolvedValue({ userId: 5 } as never)
      mockedUserModel.update.mockResolvedValue([1] as never)

      await AuthService.updateUserPassword({
        userEmail: 'user@example.com',
        userPassword: 'newpass'
      })

      expect(mockedUserModel.update).toHaveBeenCalled()
    })

    it('throws not found when user does not exist', async () => {
      mockedUserModel.findOne.mockResolvedValue(null)

      await expect(
        AuthService.updateUserPassword({
          userEmail: 'missing@example.com',
          userPassword: 'newpass'
        })
      ).rejects.toMatchObject({
        message: 'User not found!',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })
})
