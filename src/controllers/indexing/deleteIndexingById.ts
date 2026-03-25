import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { PineconeBackupService } from '../../services/PineconeBackup.service'
import { handleError } from '../../utilities/requestHandler'
import { IDeleteIndexingParams } from '../../schemas/VectorIndexesSchema'

export const removeIndexingById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.params as unknown as IDeleteIndexingParams

  try {
    await PineconeBackupService.deleteIndexingById(parseInt(params.id, 10))

    return res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success({ message: 'Indexing deleted from database and Weaviate.' })
      )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
