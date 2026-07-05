import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { PineconeBackupService } from '../../services/PineconeBackup.service'
import { handleError } from '../../utilities/requestHandler'
import { type IDeleteIndexing } from '../../schemas/IndexingSchema'

export const removeIndexingById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as IDeleteIndexing
    await PineconeBackupService.deleteIndexingById(parseInt(payload.indexingId, 10))

    return res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success({ message: 'Indexing deleted from database and Weaviate.' })
      )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
