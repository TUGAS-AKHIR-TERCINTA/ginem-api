import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { WhatsAppService } from '../../services/WhatsApp.service'
import { type WhatsAppQrQueryInput } from '../../schemas/WhatsAppSchema'

export const getWhatsAppQrBase64 = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.jwtPayload?.userId
  const payload = req.query as WhatsAppQrQueryInput

  if (!userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error({ message: 'Unauthorized' }))
  }

  try {
    const qrPng = await WhatsAppService.getQrCodePng(userId, payload.timeoutMs)
    const base64 = qrPng.toString('base64')

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: { base64: `data:image/png;base64,${base64}` },
        message: 'QR rendered as base64'
      })
    )
  } catch (err) {
    return handleError(res, err)
  }
}
