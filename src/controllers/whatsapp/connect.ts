import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type WhatsappConnectQueryInput } from '../../schemas/WhatsAppSchema'
import { WhatsappService } from '../../services/whatsapp'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'

function jsonStatusPayload(
  session: WhatsappService,
  connectionStatus: string,
  timedOut: boolean,
  extra?: Record<string, unknown>
): Record<string, unknown> {
  return {
    connectionStatus,
    timedOut,
    ...(session.lastDisconnectReason != null
      ? { lastDisconnectReason: session.lastDisconnectReason }
      : {}),
    ...extra
  }
}

export const connectWhatsapp = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.jwtPayload?.userId
  const query = req.query as unknown as WhatsappConnectQueryInput

  if (userId == null) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ResponseData.error({ message: 'Unauthorized' }))
  }

  try {
    const session = WhatsappService.forUser(userId)
    const format = query.type

    if (format === 'base64' || format === 'image') {
      const outcome = await session.connectAwaitingPairingQr(query.timeoutMs)

      if (outcome.connectionStatus === 'connected') {
        return res.status(StatusCodes.OK).json(
          ResponseData.success({
            data: jsonStatusPayload(session, 'connected', outcome.timedOut, {
              message: 'Already connected; no pairing QR'
            }),
            message: 'WhatsApp already connected'
          })
        )
      }

      if (outcome.connectionStatus === 'error') {
        return res.status(StatusCodes.OK).json(
          ResponseData.success({
            data: jsonStatusPayload(session, 'error', outcome.timedOut),
            message: 'WhatsApp connection error'
          })
        )
      }

      const qrRaw = outcome.pairingQrRaw
      if (qrRaw == null || qrRaw.length === 0) {
        return res.status(StatusCodes.OK).json(
          ResponseData.success({
            data: jsonStatusPayload(
              session,
              outcome.connectionStatus,
              outcome.timedOut,
              {
                message: outcome.timedOut
                  ? 'QR not received before timeout'
                  : 'Pairing QR not available'
              }
            ),
            message: 'WhatsApp connect'
          })
        )
      }

      const png = await session.renderPairingQrPng(qrRaw)

      if (format === 'image') {
        return res.status(StatusCodes.OK).type('image/png').send(png)
      }

      return res.status(StatusCodes.OK).json(
        ResponseData.success({
          data: jsonStatusPayload(
            session,
            outcome.connectionStatus,
            outcome.timedOut,
            {
              mimeType: 'image/png',
              qrImageBase64: png.toString('base64')
            }
          ),
          message: 'WhatsApp pairing QR'
        })
      )
    }

    await session.connect()
    const data = {
      connectionStatus: session.connectionStatus,
      ...(session.lastDisconnectReason != null
        ? { lastDisconnectReason: session.lastDisconnectReason }
        : {})
    }
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data, message: 'WhatsApp connect diproses' }))
  } catch (err) {
    return handleError(res, err)
  }
}
