import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { WhatsAppService } from '../../services/WhatsApp.service'

export const disconnectWhatsApp = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.jwtPayload?.userId

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error({ message: 'Unauthorized' }))
  }

  try {
    await WhatsAppService.disconnect(userId)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'WhatsApp session disconnected' }))
  } catch (err) {
    return handleError(res, err)
  }
}
