import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type MqttDeviceIdParam } from '../../schemas/MqttSchema'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { MQTTService } from '../../services/mqtt/MQTT.service'

export const getLastStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as MqttDeviceIdParam
    const last = MQTTService.getLastDeviceState(payload.deviceId)

    return res.status(StatusCodes.OK).json(ResponseData.success({ data: last }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
