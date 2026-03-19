import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type FindAllVectorIndexesInput } from '../../schemas/VectorIndexesSchema'
import { VectorIndexesService } from '../../services/VectorIndexes.service'
import { handleError } from '../../utilities/requestHandler'

export const findAllVectorIndexes = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as FindAllVectorIndexesInput

    const result = await VectorIndexesService.findAll(query)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
