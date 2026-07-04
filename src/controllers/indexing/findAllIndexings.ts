import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { PineconeBackupService } from '../../services/PineconeBackup.service'
import { handleError } from '../../utilities/requestHandler'
import { IFindAllIndexing } from '../../schemas/IndexingSchema'

export const findAllIndexings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllIndexing
    const result = await PineconeBackupService.findAllIndexings(payload)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
