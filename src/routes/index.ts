import path from 'path'
import { Router } from 'express'
import express from 'express'

import { StatusCodes } from 'http-status-codes'
import swaggerUi from 'swagger-ui-express'

import RoutesRegistry from './registry'
import logger from '../utilities/logger'
import { ResponseData } from '../utilities/response'
import swaggerSpec from '../configs/swagger'

const routers = Router()

const swaggerUiPluginDir = path.join(process.cwd(), 'resources', 'swagger-ui')
routers.use('/api/v1/docs-static', express.static(swaggerUiPluginDir))

routers.use('/api/v1/', RoutesRegistry.HealthRoute)
routers.use('/api/v1/logs', RoutesRegistry.AppLogRoute)
routers.use('/api/v1/scheduler-logs', RoutesRegistry.SchedulerLogRoute)
routers.use('/api/v1/devices', RoutesRegistry.DeviceRoute)
routers.use('/api/v1/devices/logs', RoutesRegistry.DeviceLogRoute)
routers.use('/api/v1/chat', RoutesRegistry.ChatRoute)
routers.use('/api/v1/auth', RoutesRegistry.AuthRoute)
routers.use('/api/v1/my-profiles', RoutesRegistry.MyProfileRoute)
routers.use('/api/v1/otp', RoutesRegistry.OtpRoute)
routers.use('/api/v1/stats', RoutesRegistry.StatsRoute)
routers.use('/api/v1/indexing', RoutesRegistry.IndexingRoute)
routers.use('/api/v1/whatsapp', RoutesRegistry.WhatsAppRoute)

routers.use(
  '/api/v1/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    // Runtime supports a single URL; @types/swagger-ui-express only types `string`.
    customJs: '/api/v1/docs-static/swagger-qr-preview.js'
  })
)

routers.use((req, res) => {
  const message = `Route not found!`
  logger.warn(message)
  const response = ResponseData.error({ message })
  return res.status(StatusCodes.NOT_FOUND).json(response)
})

export default routers
