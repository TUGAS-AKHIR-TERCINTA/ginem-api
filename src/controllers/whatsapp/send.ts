import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { WhatsAppService } from '../../services/WhatsApp.service'
import { type WhatsAppSendMessageInput } from '../../schemas/WhatsAppSchema'

export const sendWhatsAppTextMessage = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.jwtPayload?.userId
  const payload = req.body as WhatsAppSendMessageInput

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error({ message: 'Unauthorized' }))
  }

  try {
    const result = await WhatsAppService.sendTextMessage(
      userId,
      payload.to,
      payload.message
    )
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data: result, message: 'Message sent' }))
  } catch (err) {
    return handleError(res, err)
  }
}
