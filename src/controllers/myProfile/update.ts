import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { UpdateMyProfileSchema } from '../../schemas/MyProfileSchema'
import { MyProfileService } from '../../services/MyProfile.service'

export const updateMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as UpdateMyProfileSchema

  try {
    await MyProfileService.updateProfile(payload.jwtPayload!.userId!, {
      userName: payload.userName,
      userPassword: payload.userPassword,
      userEmail: payload.userEmail
    })
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Profile updated successfully' }))
  } catch (err) {
    return handleError(res, err)
  }
}
