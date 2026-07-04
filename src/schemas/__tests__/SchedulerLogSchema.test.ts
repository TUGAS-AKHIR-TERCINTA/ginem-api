import { findAllSchedulerLogSchema, findDetailSchedulerLogSchema } from '../SchedulerLogSchema'

describe('SchedulerLogSchema', () => {
  describe('findAllSchedulerLogSchema', () => {
    it('applies pagination defaults', () => {
      const result = findAllSchedulerLogSchema.parse({
        jwtPayload: { userId: 1 }
      })

      expect(result.page).toBe(1)
      expect(result.size).toBe(20)
    })

    it('accepts scheduler filters', () => {
      const result = findAllSchedulerLogSchema.parse({
        jwtPayload: { userId: 1 },
        type: 'actuator',
        category: 'repeat',
        status: 'completed',
        deviceName: 'fan_relay'
      })

      expect(result.type).toBe('actuator')
      expect(result.category).toBe('repeat')
      expect(result.status).toBe('completed')
      expect(result.deviceName).toBe('fan_relay')
    })
  })

  describe('findDetailSchedulerLogSchema', () => {
    it('requires positive schedulerLogId', () => {
      const result = findDetailSchedulerLogSchema.safeParse({
        jwtPayload: { userId: 1 },
        schedulerLogId: 0
      })

      expect(result.success).toBe(false)
    })

    it('accepts valid detail query', () => {
      const result = findDetailSchedulerLogSchema.parse({
        jwtPayload: { userId: 1 },
        schedulerLogId: 10
      })

      expect(result.schedulerLogId).toBe(10)
    })
  })
})
