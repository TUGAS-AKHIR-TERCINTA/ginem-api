import { createHash } from 'crypto'
import { UserModel } from '../models/UserModel'
import type { UserInstance, IUserAttributes } from '../models/UserModel'
import { AppError } from '../utilities/AppError'
import { appConfigs } from '../configs/appConfig'
import logger from '../utilities/logger'

/** Payload for updating profile (optional fields; password will be hashed in service) */
export interface UpdateMyProfilePayload {
  userName?: string
  userPassword?: string
  userEmail?: string
}

/** Payload for updating onboarding status */
export interface UpdateOnboardingPayload {
  userOnboardingStatus: 'waiting' | 'completed'
}

/**
 * My profile service: business logic for current user profile.
 * Controllers handle HTTP (validation, status codes, response shape); this layer handles data.
 */
export class MyProfileService {
  /**
   * Find profile by user id (non-deleted).
   * @throws {AppError} AppError.notFound when user does not exist
   */
  static async findByUserId(userId: number): Promise<UserInstance> {
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

  /**
   * Update profile. Validates email uniqueness when userEmail is provided; hashes password when userPassword is provided.
   * @throws {AppError} AppError.conflict when email already in use, AppError.notFound when user does not exist
   */
  static async updateProfile(
    userId: number,
    payload: UpdateMyProfilePayload
  ): Promise<void> {
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

  /**
   * Update onboarding status for the user.
   * @throws {AppError} AppError.notFound when user does not exist
   */
  static async updateOnboardingStatus(
    userId: number,
    payload: UpdateOnboardingPayload
  ): Promise<void> {
    try {
      const [affectedRows] = await UserModel.update(
        { userOnboardingStatus: payload.userOnboardingStatus },
        { where: { deleted: 0, userId } }
      )
      if (affectedRows === 0) {
        throw AppError.notFound('User not found')
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[MyProfileService] updateOnboardingStatus failed: ${String(error)}`)
      throw AppError.badRequest('Failed to update onboarding status')
    }
  }
}
