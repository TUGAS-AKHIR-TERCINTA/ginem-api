import { serializeDevice } from '../../mcp/tools/device/serializeDevice'

describe('serializeDevice', () => {
  it('pretty-prints device objects as JSON', () => {
    const serialized = serializeDevice({
      deviceId: 1,
      deviceName: 'fan_relay',
      deviceType: 'actuator'
    })

    expect(serialized).toBe(
      JSON.stringify(
        {
          deviceId: 1,
          deviceName: 'fan_relay',
          deviceType: 'actuator'
        },
        null,
        2
      )
    )
  })
})
