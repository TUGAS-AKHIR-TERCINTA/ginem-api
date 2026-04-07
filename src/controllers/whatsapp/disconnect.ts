import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { WhatsappService } from '../../services/whatsapp'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

export const disconnectWhatsapp = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.jwtPayload?.userId

  if (userId == null) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error({ message: 'Unauthorized' }))
  }

  try {
    const session = WhatsappService.forUser(userId)
    await session.disconnect()
    const data = {
      connectionStatus: session.connectionStatus,
      ...(session.lastDisconnectReason != null
        ? { lastDisconnectReason: session.lastDisconnectReason }
        : {})
    }
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data, message: 'WhatsApp disconnected' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
