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
  try {
    const payload = req.body as MqttSendCommandInput
    MQTTService.sendCommand(payload.deviceId, payload.command)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Command published to MQTT broker' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
