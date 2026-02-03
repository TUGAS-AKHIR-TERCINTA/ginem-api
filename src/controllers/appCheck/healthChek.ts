import { type Request, type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { handleServerError } from '../../utilities/requestHandler'

const startTime: number = Date.now()

export const healthCheck = async (req: Request, res: Response): Promise<Response> => {
  try {
    const uptimeInSeconds: number = Math.floor((Date.now() - startTime) / 1000)

    const data = {
      environment: process.env.NODE_ENV || 'development',
      uptime: `${uptimeInSeconds}s`,
      timestamp: process.uptime()
    }

    const response = ResponseData.success({ data })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
