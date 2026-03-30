import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { PineconeService, RagDocument } from '../../services/Pinecone.service'
import { PineconeBackupService } from '../../services/PineconeBackup.service'
import { handleError } from '../../utilities/requestHandler'
import { CreateIndexingBodyInput } from '../../schemas/IndexingSchema'

export const indexingTextDocuments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log(req.body)
  const payload = req.body as CreateIndexingBodyInput
  try {
    await new PineconeService().addDocuments(payload)
    await PineconeBackupService.saveIndexingBackup(payload, 'json')

    const response = ResponseData.success({
      message: `document(s) indexed to Pinecone successfully.`
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
