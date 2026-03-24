import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { WhatsAppService } from '../../services/WhatsApp.service'
import { type WhatsAppConnectInput } from '../../schemas/WhatsAppSchema'

export const connectWhatsApp = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.jwtPayload?.userId
  const payload = req.body as WhatsAppConnectInput | undefined

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error({ message: 'Unauthorized' }))
  }

  try {
    const result = await WhatsAppService.connectAndWaitForQr(userId, payload?.timeoutMs)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data: result, message: 'WhatsApp connect started' }))
  } catch (err) {
    return handleError(res, err)
  }
}
