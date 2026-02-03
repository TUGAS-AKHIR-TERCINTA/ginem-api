import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { updateOnboardingSchema } from '../../schemas/myProfileSchema'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { ValidationError } from 'joi'
import { UserModel } from '../../models/userModel'
import logger from '../../logs'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'

export const updateOnboardingStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<any> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateOnboardingSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const newData = {
      ...(validatedData?.userOnboardingStatus!.length > 0 && {
        userOnboardingStatus: validatedData?.userOnboardingStatus
      })
    }

    await UserModel.update(newData, {
      where: {
        deleted: 0,
        userId: req?.jwtPayload?.userId
      }
    })

    const response = ResponseData.success({
      message: 'Onboarding status updated successfully'
    })
    logger.info('onboarding status updated successfully')
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
