import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import { MQTTService } from '../../services/mqtt/MQTT.service'

export const getConnection = async (
  _req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const response = ResponseData.success({
      data: { connected: MQTTService.isConnected() },
      message: 'MQTT broker connection state'
    })
    return res.status(StatusCodes.OK).json(response)
  } catch (err) {
    return handleError(res, err)
  }
}
