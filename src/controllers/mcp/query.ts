import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { McpQuerySchema } from '../../schemas/mcpSchema'
import { DeviceAgentService } from '../../services/mcp'
import { handleError } from '../../utilities/requestHandler'

export const queryMcp = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as McpQuerySchema

  try {
    const answer = await DeviceAgentService.query(payload.message)
    const response = ResponseData.success({
      data: { answer },
      message: 'MCP query completed successfully'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
