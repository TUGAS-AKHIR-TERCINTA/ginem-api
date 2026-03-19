import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { MyProfileService } from '../../services/MyProfile.service'
import { UpdateOnboardingSchema } from '../../schemas/myProfileSchema'

export const updateOnboardingStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as UpdateOnboardingSchema

  try {
    await MyProfileService.updateOnboardingStatus(payload.jwtPayload!.userId!, {
      userOnboardingStatus: payload!.userOnboardingStatus!
    })
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Onboarding status updated successfully' }))
  } catch (err) {
    return handleError(res, err)
  }
}
