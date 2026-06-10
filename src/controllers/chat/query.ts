import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { handleError } from '../../utilities/requestHandler'
import { ChatService } from '../../services/Chat.service'
import { TTSService } from '../../services/TTS.service'
import { IChatSchema } from '../../schemas/ChatSchema'

function sendBinaryAudioResponse(
  res: Response,
  reply: string,
  buffer: Buffer,
  mimeType: 'audio/mpeg' | 'audio/wav',
  speakText: string
): Response {
  res.locals.skipCompression = true

  const shortReply = reply.length > 200 ? `${reply.slice(0, 200)}…` : reply

  res.status(StatusCodes.OK)
  res.setHeader('Content-Type', mimeType)
  res.setHeader('Content-Length', String(buffer.length))
  res.setHeader('Content-Encoding', 'identity')
  res.setHeader('X-Chat-Reply', encodeURIComponent(shortReply))
  res.setHeader('X-Chat-Speak-Text', encodeURIComponent(speakText.slice(0, 500)))
  res.setHeader(
    'Content-Disposition',
    `inline; filename="chat-reply.${mimeType === 'audio/wav' ? 'wav' : 'mp3'}"`
  )
  res.setHeader('Cache-Control', 'no-store')

  return res.send(buffer)
}

export const queryChat = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IChatSchema
    const wantsBinaryAudio =
      payload.withAudio === true && payload.audioFormat === 'binary'

    const result = await ChatService.query(payload.message, {
      withAudio: payload.withAudio === true && !wantsBinaryAudio
    })

    if (wantsBinaryAudio) {
      const { buffer, speakText, mimeType } = await TTSService.synthesizeSpeechBuffer(
        result.reply,
        'wav'
      )
      return sendBinaryAudioResponse(res, result.reply, buffer, mimeType, speakText)
    }

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: result,
        message: payload.withAudio
          ? 'Chat completed successfully with voice audio'
          : 'Chat completed successfully'
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
