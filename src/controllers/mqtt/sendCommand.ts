import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { type MqttSendCommandInput } from '../../schemas/MqttSchema'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { MQTTService } from '../../services/mqtt/MQTT.service'

export const sendCommand = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { deviceId, command } = req.body as MqttSendCommandInput

  try {
    MQTTService.sendCommand(deviceId, command)
    const response = ResponseData.success({
      data: {
        deviceId,
        topic: `iot/${deviceId}/command`,
        brokerConnected: MQTTService.isConnected()
      },
      message: 'Command published to MQTT broker'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
