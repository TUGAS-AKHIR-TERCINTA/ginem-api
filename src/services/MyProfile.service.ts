import { createHash } from 'crypto'
import { UserModel } from '../models/UserModel'
import type { IUserAttributes } from '../models/UserModel'
import { AppError } from '../utilities/AppError'
import { appConfigs } from '../configs/appConfig'
import logger from '../utilities/logger'
import { IUpdateMyProfile, IUpdateOnboarding } from '../schemas/MyProfileSchema'

export class MyProfileService {
  static async findByUserId(userId: number) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: 0, userId },
        attributes: [
          'userId',
          'userName',
          'userRole',
          'userEmail',
          'userOnboardingStatus',
          'createdAt',
          'updatedAt'
        ]
      })
      if (user == null) {
        throw AppError.notFound('User not found')
      }
      return user
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MyProfileService] findByUserId failed: ${String(error)}`)
      throw AppError.badRequest('Failed to fetch profile')
    }
  }

  static async updateProfile(userId: number, payload: IUpdateMyProfile): Promise<void> {
    try {
      if (payload.userEmail != null && payload.userEmail !== '') {
        const existing = await UserModel.findOne({
          where: { deleted: 0, userEmail: payload.userEmail }
        })
        if (existing != null && existing.userId !== userId) {
          throw AppError.conflict('Email already in use')
        }
      }

      const updateData: Partial<IUserAttributes> = {}
      if (payload.userName != null && payload.userName.length > 0) {
        updateData.userName = payload.userName
      }
      if (payload.userEmail != null && payload.userEmail.length > 0) {
        updateData.userEmail = payload.userEmail
      }
      if (payload.userPassword != null && payload.userPassword.length > 0) {
        const secret = appConfigs.secret.passwordEncryption ?? ''
        updateData.userPassword = createHash('sha1')
          .update(payload.userPassword + secret)
          .digest('hex')
      }

      if (Object.keys(updateData).length === 0) {
        return
      }

      const [affectedRows] = await UserModel.update(updateData, {
        where: { deleted: 0, userId }
      })
      if (affectedRows === 0) {
        throw AppError.notFound('User not found')
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MyProfileService] updateProfile failed: ${String(error)}`)
      throw AppError.badRequest('Failed to update profile')
    }
  }

  static async updateOnboardingStatus(userId: number, payload: IUpdateOnboarding) {
    try {
      const user = await UserModel.findOne({
        where: { deleted: 0, userId }
      })
      if (user == null) {
        throw AppError.notFound('User not found')
      }
      user.userOnboardingStatus = payload.userOnboardingStatus
      await user.save()
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MyProfileService] updateOnboardingStatus failed: ${String(error)}`)
      throw AppError.badRequest('Failed to update onboarding status')
    }
  }
}
