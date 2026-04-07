import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import logger from '../utilities/logger'
import { AppError } from '../utilities/AppError'
import { generateAccessToken } from '../utilities/jwt'
import { hashPassword } from '../utilities/scurePassword'
import { IUserAttributes, UserModel } from '../models/UserModel'
import { IUserLogin, IUserRegistration, IUpdateUserPassword } from '../schemas/AuthSchema'

export class AuthService {
  static async loginUser(payload: IUserLogin) {
    try {
      const { userEmail, userPassword } = payload

      const user = await UserModel.findOne({
        where: {
          deleted: 0,
          userEmail
        }
      })

      if (user == null) {
        const message = 'Account not found. Please register first!'
        logger.info(`Login attempt failed: ${message}`)
        throw AppError.notFound(message)
      }

      const isPasswordValid = hashPassword(userPassword) === user.userPassword
      if (!isPasswordValid) {
        const message = 'Invalid email numbuer and password combination!'
        logger.error(`Login attempt failed: ${message}`)
        throw new AppError(message, StatusCodes.UNAUTHORIZED)
      }

      const token = generateAccessToken({
        userId: user.userId,
        userRole: user.userRole,
        userEmail: user.userEmail
      })

      logger.info(`User ${user.userName} logged in successfully`)

      return {
        accessToken: token,
        refreshToken: ''
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AuthService] loginUser failed: ${String(error)}`)
      throw new AppError('Failed to login', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async registerUser(payload: IUserRegistration) {
    try {
      const existingUser = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userEmail: { [Op.eq]: payload.userEmail }
        }
      })

      if (existingUser != null) {
        const message = `E-mail ${existingUser.userEmail} sudah terdaftar, gunakan yang lain`
        logger.info(`Registration attempt failed: ${message}`)
        throw AppError.badRequest(message)
      }

      await UserModel.create({
        userName: payload.userName ?? '',
        userEmail: payload.userEmail,
        userPassword: hashPassword(payload.userPassword),
        userRole: payload.userRole,
        userOnboardingStatus: 'waiting'
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AuthService] registerUser failed: ${String(error)}`)
      throw new AppError('Failed to register user', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async updateUserPassword(payload: IUpdateUserPassword) {
    try {
      const { userPassword, userEmail } = payload

      const user = await UserModel.findOne({
        where: {
          deleted: 0,
          userEmail: userEmail,
          userRole: 'user'
        }
      })

      if (user == null) {
        const message = 'User not found!'
        logger.info('Attempt to update non-existing user')
        throw AppError.notFound(message)
      }

      const updatedData: Partial<IUserAttributes | any> = {
        ...(userPassword && { userPassword: hashPassword(userPassword) })
      }

      await UserModel.update(updatedData, {
        where: {
          deleted: { [Op.eq]: 0 },
          userId: { [Op.eq]: user.userId }
        }
      })

      logger.info('Password updated successfully')
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AuthService] updateUserPassword failed: ${String(error)}`)
      throw new AppError('Failed to update password', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
