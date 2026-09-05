import express, { type Express } from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import compression from 'compression'
import routers from './routes/index'
import { MiddleWares } from './middlewares/index'
import { MQTTService } from './services/mqtt/MQTT.service'
import { TelemetryService } from './services/mqtt/Telemetry.service'
import { initializeDeviceSchedule } from './services/mcp/DeviceSchedule.service'
import { ChatMessageBroker } from './services/rabbitmq/ChatMessageBroker.service'
import { RuleManagementService } from './services/rule'
import logger from './utilities/logger'

const app: Express = express()

MQTTService.registerMessageHandlers()
MQTTService.initialize()
TelemetryService.initialize()
void initializeDeviceSchedule()
void RuleManagementService.refreshCache().catch((error) => {
  logger.error(`[app] Rule cache load failed: ${String(error)}`)
})
void ChatMessageBroker.initialize().catch((error) => {
  logger.error(`[app] ChatMessageBroker initialize failed: ${String(error)}`)
})

app.use(helmet())
app.use(MiddleWares.corsOrigin())
app.use(MiddleWares.loggerMidleWare())

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(
  compression({
    filter: (req, res) => {
      if (res.locals.skipCompression === true) {
        return false
      }
      const contentType = res.getHeader('Content-Type')
      if (contentType != null && String(contentType).startsWith('audio/')) {
        return false
      }
      return compression.filter(req, res)
    }
  })
)

app.use(routers)

export default app
