import {
  createDeviceLogSchema,
  findAllDeviceLogSchema,
  findLastLatestDeviceLogByDeviceIdSchema
} from '../DeviceLogSchema'

describe('DeviceLogSchema', () => {
  describe('createDeviceLogSchema', () => {
    it('accepts valid device log payload', () => {
      const result = createDeviceLogSchema.parse({
        deviceLogDeviceId: 1,
        deviceLogData: 'temperature=28.5'
      })

      expect(result.deviceLogData).toBe('temperature=28.5')
    })

    it('rejects log data longer than 255 characters', () => {
      const result = createDeviceLogSchema.safeParse({
        deviceLogDeviceId: 1,
        deviceLogData: 'x'.repeat(256)
      })

      expect(result.success).toBe(false)
    })
  })

  describe('findAllDeviceLogSchema', () => {
    it('coerces optional device filter and pagination defaults', () => {
      const result = findAllDeviceLogSchema.parse({
        jwtPayload: { userId: 1 },
        deviceLogDeviceId: '7'
      })

      expect(result.deviceLogDeviceId).toBe(7)
      expect(result.page).toBe(1)
      expect(result.size).toBe(20)
    })
  })

  describe('findLastLatestDeviceLogByDeviceIdSchema', () => {
    it('coerces deviceId from string', () => {
      const result = findLastLatestDeviceLogByDeviceIdSchema.parse({ deviceId: '9' })

      expect(result.deviceId).toBe(9)
    })
  })
})
