import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type IUpdateMyProfile } from '../../schemas/MyProfileSchema'
import { MyProfileService } from '../../services/MyProfile.service'

export const updateMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IUpdateMyProfile
    const userId = req.jwtPayload?.userId as number

    await MyProfileService.updateProfile(userId, payload)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Profile updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
