import {
  mqttDeviceIdParamSchema,
  mqttPublishStatusSchema,
  mqttSendCommandSchema
} from '../MqttSchema'

describe('MqttSchema', () => {
  describe('mqttSendCommandSchema', () => {
    it('accepts command 0 or 1', () => {
      expect(mqttSendCommandSchema.parse({ deviceId: 1, command: '1' }).command).toBe('1')
      expect(mqttSendCommandSchema.parse({ deviceId: 1, command: '0' }).command).toBe('0')
    })

    it('rejects non-binary command values', () => {
      const result = mqttSendCommandSchema.safeParse({
        deviceId: 1,
        command: 'ON'
      })

      expect(result.success).toBe(false)
    })
  })

  describe('mqttPublishStatusSchema', () => {
    it('accepts status payload', () => {
      const result = mqttPublishStatusSchema.parse({
        deviceId: 2,
        status: 'online'
      })

      expect(result.status).toBe('online')
    })
  })

  describe('mqttDeviceIdParamSchema', () => {
    it('accepts integer deviceId', () => {
      const result = mqttDeviceIdParamSchema.parse({ deviceId: 5 })

      expect(result.deviceId).toBe(5)
    })
  })
})
