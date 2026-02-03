import Redis from 'ioredis'
import { appConfigs } from '.'

const redisClient = new Redis({
  host: appConfigs.redis.host || '127.0.0.1',
  port: Number(appConfigs.redis.port) || 6379
})

redisClient.on('connect', () => console.log('✅ Connected to Redis'))
redisClient.on('error', (err: any) => console.error('❌ Redis Error:', err))

export default redisClient
