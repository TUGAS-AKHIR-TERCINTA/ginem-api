import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { indexToWeaviateSchema } from '../../schemas/weaviateSchema'
import { WeaviateService } from '../../services/WeaviateService'

export const indexToWeaviate = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    indexToWeaviateSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    const { jwtPayload: _, ...payload } = validatedData
    const result = await WeaviateService.indexData(payload)

    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
