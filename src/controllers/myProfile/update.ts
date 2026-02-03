import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { updateMyProfileSchema } from '../../schemas/myProfileSchema'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { ValidationError } from 'joi'
import { IUserAttributes, UserModel } from '../../models/userModel'
import logger from '../../logs'
import { appConfigs } from '../../configs'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const updateMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateMyProfileSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    if ('userEmail' in validatedData) {
      const userNameChek = await UserModel.findOne({
        where: {
          deleted: 0,
          userEmail: validatedData.userEmail
        }
      })

      if (userNameChek !== null) {
        const message = 'email sudah digunakan!'
        logger.info(`Login attempt failed: ${message}`)
        return res.status(StatusCodes.UNAUTHORIZED).json(ResponseData.error({ message }))
      }
    }

    if ('userPassword' in validatedData) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      validatedData.userPassword = require('crypto')
        .createHash('sha1')
        .update(validatedData.userPassword + appConfigs.secret.passwordEncryption)
        .digest('hex')
    }

    const newData: IUserAttributes | any = {
      ...(validatedData?.userName?.length > 0 && {
        userName: validatedData?.userName
      }),
      ...(validatedData?.userPassword?.length > 0 && {
        userPassword: validatedData?.userPassword
      }),
      ...(validatedData?.userEmail?.length > 0 && {
        userEmail: validatedData?.userEmail
      })
    }

    await UserModel.update(newData, {
      where: {
        deleted: 0,
        userId: req?.jwtPayload?.userId
      }
    })

    const response = ResponseData.success({ message: 'Profile updated successfully' })
    logger.info('Profile updated successfully')
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
