import { Router } from 'express'

import { StatusCodes } from 'http-status-codes'
import swaggerUi from 'swagger-ui-express'

import RoutesRegistry from './registry'
import logger from '../logs'
import { ResponseData } from '../utilities/response'
import swaggerSpec from '../configs/swagger'

const routers = Router()

routers.use('/api/v1/', RoutesRegistry.HealthRoute)
routers.use('/api/v1/devices', RoutesRegistry.DeviceRoute)
routers.use('/api/v1/auth', RoutesRegistry.AuthRoute)
routers.use('/api/v1/my-profiles', RoutesRegistry.MyProfileRoute)
routers.use('/api/v1/otp', RoutesRegistry.OtpRoute)

routers.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

routers.use((req, res) => {
  const message = `Route not found!`
  logger.warn(message)
  const response = ResponseData.error({ message })
  return res.status(StatusCodes.NOT_FOUND).json(response)
})

export default routers
