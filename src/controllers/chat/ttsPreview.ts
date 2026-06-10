import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { handleError } from '../../utilities/requestHandler'
import { TTSService } from '../../services/TTS.service'
import { type ITtsPreviewSchema } from '../../schemas/ChatSchema'

/** Direct WAV playback in browser/Swagger (GET opens playable audio). */
export const ttsPreview = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { text } = req.query as unknown as ITtsPreviewSchema
    const { buffer, speakText, mimeType } = await TTSService.synthesizeSpeechBuffer(
      text,
      'wav'
    )

    res.locals.skipCompression = true
    res.status(StatusCodes.OK)
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Length', String(buffer.length))
    res.setHeader('Content-Encoding', 'identity')
    res.setHeader('X-Chat-Speak-Text', encodeURIComponent(speakText.slice(0, 500)))
    res.setHeader('Content-Disposition', 'inline; filename="tts-preview.wav"')
    res.setHeader('Cache-Control', 'no-store')

    return res.send(buffer)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
