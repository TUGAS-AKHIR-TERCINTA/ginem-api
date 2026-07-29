import {
  ALL_DEVICE_STATE,
  ALL_DEVICE_TELEMETRY,
  deviceCommandTopic,
  deviceStateTopic,
  deviceTelemetryTopic
} from '../topics'

describe('mqtt topics', () => {
  it('builds device command topic', () => {
    expect(deviceCommandTopic(42)).toBe('iot/v1/device/42/command')
  })

  it('builds device state topic', () => {
    expect(deviceStateTopic(7)).toBe('iot/v1/device/7/state')
  })

  it('builds device telemetry topic', () => {
    expect(deviceTelemetryTopic(3)).toBe('iot/v1/device/3/telemetry')
  })

  it('exposes wildcard subscription topics', () => {
    expect(ALL_DEVICE_STATE).toBe('iot/v1/device/+/state')
    expect(ALL_DEVICE_TELEMETRY).toBe('iot/v1/device/+/telemetry')
  })
})
