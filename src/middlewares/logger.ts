import morgan from 'morgan'
import logger from '../../logs'

export const loggerMidleWare = () =>
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  })
