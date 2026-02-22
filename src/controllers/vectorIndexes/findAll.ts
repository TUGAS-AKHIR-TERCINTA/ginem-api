import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindAllVectorIndexesInput } from '../../schemas/VectorIndexesSchema'
import { VectorIndexesService } from '../../services/VectorIndexesService'
import { handleError } from '../../utilities/requestHandler'

export const findAllVectorIndexes = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as FindAllVectorIndexesInput
    const { page = 1, size = 20, pagination, source, search } = query

    const result = await VectorIndexesService.findAll({
      page,
      size,
      pagination: pagination ? 'true' : undefined,
      source: source ?? undefined,
      search: search ?? undefined
    })

    const response = ResponseData.success({
      data: result,
      message: 'Vector indexes retrieved successfully'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
