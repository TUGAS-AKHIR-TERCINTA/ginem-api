import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import logger from '../../logs'
import { AppError } from '../utilities/AppError'
import { generateAccessToken } from '../utilities/jwt'
import { hashPassword } from '../utilities/scurePassword'
import { sequelizeInit } from '../configs/database'
import { type AdminLoginInput } from '../schemas/AuthSchema'
import {
  type UserRegistrationInput,
  type UserLoginInput,
  type UserUpdatePasswordInput
} from '../schemas/AuthSchema'
import { IUserAttributes, IUserCreationAttributes, UserModel } from '../models/UserModel'

export class AuthService {
  static async loginUser(payload: UserLoginInput) {
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
  }

  static async registerUser(payload: UserRegistrationInput) {
    const validatedData: Partial<IUserCreationAttributes> | any = {
      userName: payload.userName ?? '',
      userEmail: payload.userEmail,
      userPassword: payload.userPassword,
      userRole: 'user',
      userOnboardingStatus: 'waiting'
    }

    const transaction = await sequelizeInit.transaction()

    try {
      const existingUser = await UserModel.findOne({
        where: {
          deleted: { [Op.eq]: 0 },
          userEmail: { [Op.eq]: validatedData.userEmail }
        },
        transaction
      })

      if (existingUser != null) {
        const message = `E-mail ${existingUser.userEmail} sudah terdaftar, gunakan yang lain`
        logger.info(`Registration attempt failed: ${message}`)
        await transaction.rollback()
        throw AppError.badRequest(message)
      }

      validatedData.userPassword = hashPassword(validatedData.userPassword)

      await UserModel.create(validatedData, { transaction })
      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  static async loginAdmin(payload: AdminLoginInput) {
    const { userEmail, userPassword } = payload

    const user = await UserModel.findOne({
      where: {
        deleted: 0,
        userEmail,
        userRole: 'admin'
      }
    })

    if (user == null) {
      const message = 'Account not found. Please register first!'
      logger.info(`Login Administrator attempt failed: ${message}`)
      throw AppError.notFound(message)
    }

    const isPasswordValid = hashPassword(userPassword) === user.userPassword

    if (!isPasswordValid) {
      const message = 'Invalid email and password combination!'
      logger.error(`Login attempt failed: ${message}`)
      throw new AppError(message, StatusCodes.UNAUTHORIZED)
    }

    const token = generateAccessToken({
      userId: user.userId,
      userRole: user.userRole,
      userEmail: user.userEmail
    })

    logger.info(`Administrator ${user.userName} logged in successfully`)

    return {
      accessToken: token,
      refreshToken: ''
    }
  }

  static async updateUserPassword(payload: UserUpdatePasswordInput) {
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
  }
}
