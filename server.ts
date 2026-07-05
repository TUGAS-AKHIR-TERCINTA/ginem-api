import app from './src/app'
import { appConfigs } from './src/configs/appConfig'
import { resumeWhatsappSessionsOnBoot } from './src/services/whatsapp'
import { stopDeviceScheduleWorker } from './src/services/scheduler/deviceSchedule.worker'
import logger from './src/utilities/logger'

const PORT = Number(appConfigs.app.port ?? 8000)

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`)
  void resumeWhatsappSessionsOnBoot()
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.')
  void stopDeviceScheduleWorker()
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
