import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { MyProfileService } from '../../services/profile'
import { type IJwtPayload } from '../../interfaces/shared/jwt.interface'

export const findMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.jwtPayload as IJwtPayload
    const result = await MyProfileService.findByUserId(payload.userId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
