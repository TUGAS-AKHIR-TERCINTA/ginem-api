jest.mock('../../mqtt/client', () => ({
  mqttClient: {
    publish: jest.fn()
  }
}))

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}))

import { mqttClient } from '../../mqtt/client'
import {
  publishDeviceCommand,
  publishDeviceState,
  publishDeviceTelemetry,
  toMqttValueEnvelope
} from '../../mqtt/publisher'

describe('mqtt publisher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('toMqttValueEnvelope', () => {
    it('wraps primitive values', () => {
      expect(toMqttValueEnvelope('1')).toEqual({ value: '1' })
      expect(toMqttValueEnvelope(42)).toEqual({ value: '42' })
    })

    it('extracts value field from object payloads', () => {
      expect(toMqttValueEnvelope({ value: 1 })).toEqual({ value: '1' })
      expect(toMqttValueEnvelope({ value: null })).toEqual({ value: '' })
    })

    it('returns empty string for nullish payloads', () => {
      expect(toMqttValueEnvelope(null)).toEqual({ value: '' })
      expect(toMqttValueEnvelope(undefined)).toEqual({ value: '' })
    })
  })

  describe('publish helpers', () => {
    it('publishes device command envelope', () => {
      publishDeviceCommand(5, '1')

      expect(mqttClient.publish).toHaveBeenCalledWith(
        'iot/v1/device/5/command',
        JSON.stringify({ value: '1' })
      )
    })

    it('publishes device state payload', () => {
      publishDeviceState(5, 'online')

      expect(mqttClient.publish).toHaveBeenCalledWith(
        'iot/v1/device/5/state',
        JSON.stringify({ state: 'online' })
      )
    })

    it('publishes device telemetry envelope', () => {
      publishDeviceTelemetry(5, { value: '28.5' })

      expect(mqttClient.publish).toHaveBeenCalledWith(
        'iot/v1/device/5/telemetry',
        JSON.stringify({ value: '28.5' })
      )
    })
  })
})
