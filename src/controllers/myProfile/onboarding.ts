import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { MyProfileService } from '../../services/MyProfile.service'
import { type IUpdateOnboarding } from '../../schemas/MyProfileSchema'
import { AppError } from '../../utilities/AppError'

export const updateOnboardingStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IUpdateOnboarding
    const userId = payload.jwtPayload?.userId
    if (userId == null) {
      throw AppError.badRequest('User id is required')
    }

    await MyProfileService.updateOnboardingStatus(userId, {
      userOnboardingStatus: payload.userOnboardingStatus
    })

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Onboarding status updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
