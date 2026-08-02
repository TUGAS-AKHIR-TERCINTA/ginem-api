import { MQTTService } from '../MQTT.service'

jest.mock('../client', () => ({
  mqttClient: {
    connected: false,
    on: jest.fn(),
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

describe('MQTTService.handleIncomingMessage', () => {
  it('records and parses device state messages', () => {
    MQTTService.handleIncomingMessage(
      'iot/v1/device/10/state',
      Buffer.from(JSON.stringify({ state: 'on' }))
    )

    const lastState = MQTTService.getLastDeviceState(10)

    expect(lastState?.deviceId).toBe(10)
    expect(lastState?.payload).toEqual({ state: 'on' })
    expect(lastState?.receivedAt).toEqual(expect.any(String))
  })

  it('notifies telemetry listeners', () => {
    const listener = jest.fn()

    MQTTService.onDeviceTelemetry(listener)
    MQTTService.handleIncomingMessage(
      'iot/v1/device/4/telemetry',
      Buffer.from(JSON.stringify({ value: '31.2' }))
    )

    expect(listener).toHaveBeenCalledWith(4, { value: '31.2' })
  })

  it('falls back to raw payload when JSON parsing fails', () => {
    const listener = jest.fn()

    MQTTService.onDeviceCommand(listener)
    MQTTService.handleIncomingMessage('iot/v1/device/2/command', Buffer.from('plain-text'))

    expect(listener).toHaveBeenCalledWith(2, 'plain-text')
  })
})
