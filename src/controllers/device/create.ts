import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type CreateDeviceSchema } from '../../schemas/DeviceSchema'
import { DeviceService } from '../../services/Device.service'
import { v4 as uuidv4 } from 'uuid'
import { handleError } from '../../utilities/requestHandler'

export const createDevice = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as CreateDeviceSchema

    const deviceToken = `fck_${uuidv4()}`

    await DeviceService.create({ ...payload, deviceToken })

    const response = ResponseData.success({})

    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
