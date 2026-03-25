import morgan from 'morgan'
import logger from '../utilities/logger'

export const loggerMidleWare = () =>
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  })
