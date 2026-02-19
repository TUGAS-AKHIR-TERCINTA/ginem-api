import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { mcpQuerySchema } from '../../schemas/mcpSchema'
import { DeviceAgentService } from '../../services/mcp'

export const queryMcp = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    mcpQuerySchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const answer = await DeviceAgentService.query(validatedData.message)
    const response = ResponseData.success({
      data: { answer },
      message: 'MCP query completed successfully'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
