import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'
import { requestOtpSchema } from '../../schemas/otpSchema'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { UserModel } from '../../models/userModel'
import { ResponseData } from '../../utilities/response'
import logger from '../../logs'
import redisClient from '../../configs/redis'

export const requestOtp = async (req: Request, res: Response): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    requestOtpSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const existingUser = await UserModel.findOne({
      where: {
        deleted: { [Op.eq]: 0 },
        userEmail: { [Op.eq]: validatedData.userEmail }
      }
    })

    if (validatedData.otpType === 'reset' && existingUser === null) {
      const message = `whatsapp number ${validatedData.userEmail} is not registered.`
      logger.info(`Registration attempt failed: ${message}`)
      return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error({ message }))
    }

    if (validatedData.otpType === 'register' && existingUser !== null) {
      const message = `whatsapp number ${validatedData.userEmail} is already registered.`
      logger.info(`Registration attempt failed: ${message}`)
      return res.status(StatusCodes.BAD_REQUEST).json(ResponseData.error({ message }))
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const minutes = 5
    await redisClient.setex(`otp:${otpCode}`, minutes * 60, otpCode)

    const message = encodeURIComponent(
      `*${otpCode}* adalah kode verifikasi Anda.\n\n` +
        `Pengingat keamanan: Untuk memastikan keamanan akun Anda, mohon jangan bagikan informasi apa pun tentang akun Anda kepada siapa pun. kode ini akan expire dalam ${minutes} menit`
    )

    const response = ResponseData.success({})

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
