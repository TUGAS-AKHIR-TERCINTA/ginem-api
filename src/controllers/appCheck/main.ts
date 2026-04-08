import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleError } from '../../utilities/requestHandler'

export const mainApp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = {
      aboutMe: 'Welcome to API TUGAS AKHIR TERCINTA'
    }
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data, executionTime: res.locals.executionTime }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
