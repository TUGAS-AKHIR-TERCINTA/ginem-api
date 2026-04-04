import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type MqttPublishStatusInput } from '../../schemas/MqttSchema'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { MQTTService } from '../../services/mqtt/MQTT.service'

export const publishStatus = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { deviceId, status } = req.body as MqttPublishStatusInput

  try {
    MQTTService.publishState(deviceId, status)
    const response = ResponseData.success({
      data: {
        deviceId,
        topic: `iot/v1/device/${deviceId}/state`,
        brokerConnected: MQTTService.isConnected()
      },
      message: 'Status published to MQTT broker'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
