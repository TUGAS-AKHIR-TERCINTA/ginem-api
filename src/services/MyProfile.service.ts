import { createHash } from 'crypto'
import { UserModel } from '../models/UserModel'
import type { IUserAttributes } from '../models/UserModel'
import { AppError } from '../utilities/AppError'
import { appConfigs } from '../configs/appConfig'
import logger from '../utilities/logger'
import { type IUpdateMyProfile, type IUpdateOnboarding } from '../schemas/MyProfileSchema'
import { StatusCodes } from 'http-status-codes'

export class MyProfileService {
  static async findByUserId (userId: number) {
    try {
      const result = await UserModel.findOne({
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

      if (result == null) {
        throw AppError.notFound('User not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[MyProfileService] findByUserId failed: ${String(serviceError)}`)
      throw new AppError('Failed to fetch profile', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateProfile (userId: number, payload: IUpdateMyProfile): Promise<void> {
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
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [affectedRows] = await UserModel.update(updateData, {
        where: { deleted: 0, userId }
      })

      if (affectedRows === 0) {
        throw AppError.notFound('User not found')
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[MyProfileService] updateProfile failed: ${String(serviceError)}`)
      throw new AppError('Failed to update profile', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateOnboardingStatus (userId: number, payload: IUpdateOnboarding) {
    try {
      const result = await UserModel.findOne({
        where: { deleted: 0, userId }
      })
      if (result == null) {
        throw AppError.notFound('User not found')
      }
      result.userOnboardingStatus = payload.userOnboardingStatus
      await result.save()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[MyProfileService] updateOnboardingStatus failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to update onboarding status',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
