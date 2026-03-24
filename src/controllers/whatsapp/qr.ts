import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { WhatsAppService } from '../../services/WhatsApp.service'
import { type WhatsAppQrQueryInput } from '../../schemas/WhatsAppSchema'

export const getWhatsAppQrPng = async (
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
    const png = await WhatsAppService.getQrCodePng(userId, payload.timeoutMs)

    if (payload.format === 'json') {
      const base64 = png.toString('base64')
      return res.status(StatusCodes.OK).json(
        ResponseData.success({
          data: { image: `data:image/png;base64,${base64}` },
          message: 'QR as data URL (use in Swagger or <img src="...">)'
        })
      )
    }

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-store, max-age=0')
    return res.status(StatusCodes.OK).send(png)
  } catch (err) {
    return handleError(res, err)
  }
}
