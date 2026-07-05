import { StatusCodes } from 'http-status-codes'
import { UserModel } from '../../models/UserModel'
import { MyProfileService } from '../MyProfile.service'

jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    secret: { passwordEncryption: 'test-password-salt' }
  }
}))

jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../models/UserModel', () => ({
  UserModel: {
    findOne: jest.fn(),
    update: jest.fn()
  }
}))

const mockedUserModel = UserModel as jest.Mocked<typeof UserModel>

describe('MyProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findByUserId', () => {
    it('returns profile without password fields', async () => {
      mockedUserModel.findOne.mockResolvedValue({
        userId: 1,
        userName: 'User',
        userEmail: 'user@example.com'
      } as never)

      const result = await MyProfileService.findByUserId(1)

      expect(result).toMatchObject({
        userId: 1,
        userEmail: 'user@example.com'
      })
    })

    it('throws not found when user is missing', async () => {
      mockedUserModel.findOne.mockResolvedValue(null)

      await expect(MyProfileService.findByUserId(99)).rejects.toMatchObject({
        message: 'User not found',
        statusCode: StatusCodes.NOT_FOUND
      })
    })
  })

  describe('updateProfile', () => {
    it('throws conflict when email is used by another user', async () => {
      mockedUserModel.findOne.mockResolvedValue({ userId: 2 } as never)

      await expect(
        MyProfileService.updateProfile(1, { userEmail: 'taken@example.com' })
      ).rejects.toMatchObject({
        message: 'Email already in use',
        statusCode: StatusCodes.CONFLICT
      })
    })

    it('throws bad request when no fields provided', async () => {
      await expect(MyProfileService.updateProfile(1, {})).rejects.toMatchObject({
        message: 'No fields to update',
        statusCode: StatusCodes.BAD_REQUEST
      })
    })

    it('updates profile fields', async () => {
      mockedUserModel.update.mockResolvedValue([1] as never)

      await MyProfileService.updateProfile(1, { userName: 'New Name' })

      expect(mockedUserModel.update).toHaveBeenCalledWith(
        { userName: 'New Name' },
        { where: { deleted: 0, userId: 1 } }
      )
    })
  })

  describe('updateOnboardingStatus', () => {
    it('updates onboarding status for existing user', async () => {
      const save = jest.fn()
      mockedUserModel.findOne.mockResolvedValue({
        userOnboardingStatus: 'waiting',
        save
      } as never)

      await MyProfileService.updateOnboardingStatus(1, {
        userOnboardingStatus: 'completed'
      })

      expect(save).toHaveBeenCalled()
    })
  })
})
