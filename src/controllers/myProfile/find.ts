import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { UserModel } from '../../models/UserModel'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { findMyProfileSchema } from '../../schemas/myProfileSchema'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const findMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    findMyProfileSchema,
    req.query
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await UserModel.findOne({
      where: {
        deleted: 0,
        userId: req.jwtPayload?.userId
      },
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
      const message = 'user not found!'
      const response = ResponseData.error({ message })
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
