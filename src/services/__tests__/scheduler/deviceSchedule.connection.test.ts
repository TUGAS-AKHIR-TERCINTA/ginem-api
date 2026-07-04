import {
  DEVICE_SCHEDULE_QUEUE_NAME,
  getBullMqConnection
} from '../../scheduler/deviceSchedule.connection'

jest.mock('../../../configs/appConfig', () => ({
  appConfigs: {
    redis: {
      host: 'redis-host',
      port: '6380'
    }
  }
}))

describe('deviceSchedule.connection', () => {
  it('exposes queue name constant', () => {
    expect(DEVICE_SCHEDULE_QUEUE_NAME).toBe('device-schedule')
  })

  it('builds BullMQ connection config from app config', () => {
    expect(getBullMqConnection()).toEqual({
      host: 'redis-host',
      port: 6380,
      maxRetriesPerRequest: null
    })
  })
})
