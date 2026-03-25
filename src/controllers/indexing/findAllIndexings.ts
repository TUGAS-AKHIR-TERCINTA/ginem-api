import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  PineconeBackupService,
  type FindAllIndexingsParams
} from '../../services/PineconeBackup.service'
import { handleError } from '../../utilities/requestHandler'

export const findAllIndexings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params = req.query as unknown as FindAllIndexingsParams
  try {
    const result = await PineconeBackupService.findAllIndexings(params)
    const response = ResponseData.success({ data: result })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
