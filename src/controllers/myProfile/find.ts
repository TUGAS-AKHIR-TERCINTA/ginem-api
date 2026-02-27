import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { MyProfileService } from '../../services/MyProfileService'
import { JwtPayload } from 'jsonwebtoken'

export const findMyProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.jwtPayload as JwtPayload

  try {
    const result = await MyProfileService.findByUserId(payload!.userId!)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
