import Redis from 'ioredis'
import { appConfigs } from './appConfig'
import logger from '../utilities/logger'

const redisClient = new Redis({
  host: appConfigs.redis.host ?? '127.0.0.1',
  port: Number(appConfigs.redis.port ?? 6379)
})

redisClient.on('connect', () => {
  logger.info('[Redis] Connected')
})

redisClient.on('error', (err: Error) => {
  logger.error(`[Redis] Error: ${err.message}`, { stack: err.stack })
})

export default redisClient
