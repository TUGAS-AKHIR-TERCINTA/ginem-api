import app from './src/app'
import { appConfigs } from './src/configs/appConfig'
import { resumeWhatsappSessionsOnBoot } from './src/services/whatsapp'
import { stopDeviceScheduleWorker } from './src/services/scheduler/deviceSchedule.worker'
import { ChatMessageBroker } from './src/services/rabbitmq/ChatMessageBroker.service'
import { ChatSocketService } from './src/websocket/ChatSocket.service'
import logger from './src/utilities/logger'

const PORT = Number(appConfigs.app.port ?? 8000)

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`)
  void resumeWhatsappSessionsOnBoot()
})

ChatSocketService.initialize(server)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.')
  void stopDeviceScheduleWorker()
  void ChatMessageBroker.shutdown()
  void ChatSocketService.shutdown()
  server.close(() => {
    logger.info('HTTP server closed.')
  })
})

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})
