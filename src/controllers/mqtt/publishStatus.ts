import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type IMqttPublishStatus } from '../../schemas/MqttSchema'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { MQTTService } from '../../services/mqtt/MQTT.service'

export const publishStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IMqttPublishStatus
    MQTTService.publishState(payload.deviceId, payload.status)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Status published to MQTT broker' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
