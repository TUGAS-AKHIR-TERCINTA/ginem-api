import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'

export const mainApp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = {
      aboutMe: 'Welcome to NEURO AI API'
    }
    const response = ResponseData.success({
      data,
      executionTime: res.locals.executionTime
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
