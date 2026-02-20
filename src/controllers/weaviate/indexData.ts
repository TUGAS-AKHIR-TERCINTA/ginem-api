import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { IndexToWeaviateSchema } from '../../schemas/weaviateSchema'
import { WeaviateService } from '../../services/WeaviateService'
import { handleError } from '../../utilities/requestHandler'

export const indexToWeaviate = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const payload = req.body as IndexToWeaviateSchema

  try {
    const result = await WeaviateService.indexData(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
