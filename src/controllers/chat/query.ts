import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { ChatSchema } from '../../schemas/ChatSchema'
import { handleError } from '../../utilities/requestHandler'
import { DeviceAgentService } from '../../services/mcp'

export const queryChat = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as ChatSchema

  try {
    const answer = await DeviceAgentService.query(payload.message)
    const response = ResponseData.success({
      data: { reply: answer },
      message: 'Chat completed successfully'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
