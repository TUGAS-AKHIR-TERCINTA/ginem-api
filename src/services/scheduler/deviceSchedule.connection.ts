import { appConfigs } from '../../configs/appConfig'

export const DEVICE_SCHEDULE_QUEUE_NAME = 'device-schedule'

/** BullMQ requires `maxRetriesPerRequest: null` for blocking Redis commands. */
export function getBullMqConnection() {
  return {
    host: appConfigs.redis.host || '127.0.0.1',
    port: Number(appConfigs.redis.port) || 6379,
    maxRetriesPerRequest: null
  }
}
