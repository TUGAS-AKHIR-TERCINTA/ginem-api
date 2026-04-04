import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type MqttDeviceIdParam } from '../../schemas/MqttSchema'
import { AppError } from '../../utilities/AppError'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { MQTTService } from '../../services/mqtt/MQTT.service'

export const getLastStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { deviceId } = req.params as unknown as MqttDeviceIdParam

  try {
    const last = MQTTService.getLastDeviceState(deviceId)
    if (last == null) {
      throw AppError.notFound('No status has been recorded for this device yet')
    }
    const response = ResponseData.success({
      data: last,
      message: 'Last device status retrieved'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
