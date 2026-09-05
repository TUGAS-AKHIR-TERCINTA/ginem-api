import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { PineconeService, PineconeBackupService } from '../../services/rag'
import { handleError } from '../../utilities/requestHandler'
import { AppError } from '../../utilities/AppError'
import { type ICreateIndexing } from '../../schemas/IndexingSchema'

export const indexingTextDocuments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Handle both array format and object with documents property
    const body = req.body
    let payload: ICreateIndexing[]

    if (Array.isArray(body)) {
      payload = body
    } else if (body != null && Array.isArray(body.documents)) {
      payload = body.documents
    } else {
      throw new AppError(
        'Invalid request body: expected an array of documents or { documents: [...] }',
        StatusCodes.BAD_REQUEST
      )
    }

    if (payload.length === 0) {
      throw new AppError('No documents provided', StatusCodes.BAD_REQUEST)
    }

    await new PineconeService().addDocuments(payload)
    await PineconeBackupService.saveIndexingBackup(payload, 'json')

    return res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success({ message: 'document(s) indexed to Pinecone successfully.' })
      )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
