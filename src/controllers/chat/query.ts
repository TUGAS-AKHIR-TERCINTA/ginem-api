import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { handleError } from '../../utilities/requestHandler'
import { ChatService } from '../../services/Chat.service'
import { IChatSchema } from '../../schemas/ChatSchema'

export const queryChat = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IChatSchema
    const result = await ChatService.query(payload.message)

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: { reply: result },
        message: 'Chat completed successfully'
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
