import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { PineconeService } from '../../services/Pinecone.service'
import { PineconeBackupService } from '../../services/PineconeBackup.service'
import { handleError } from '../../utilities/requestHandler'
import { ICreateIndexing } from '../../schemas/IndexingSchema'

export const indexingTextDocuments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ICreateIndexing[]
    await new PineconeService().addDocuments(payload)
    await PineconeBackupService.saveIndexingBackup(payload, 'json')

    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        message: `document(s) indexed to Pinecone successfully.`
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
