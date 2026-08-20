import { validateStructure } from '../metrics/structureValidator'

// validateStructure imports the real deviceTools, which transitively imports
// MQTTService — and MQTTService's ./client opens a live broker connection at
// module-load time (see evaluation/README.md §9). Stub it the same way
// src/services/mqtt/__tests__/MQTT.service.test.ts does so this test never
// touches the network. jest.mock calls are hoisted above imports by
// babel-plugin-jest-hoist, so this still runs before ../metrics/structureValidator
// (and its transitive deviceTools import) is evaluated.
jest.mock('../../src/services/mqtt/client', () => ({
  mqttClient: { connected: false, on: jest.fn(), publish: jest.fn(), end: jest.fn() }
}))

describe('validateStructure', () => {
  it('validates a correct set_actuator_state_by_device_name payload against the real tool schema', () => {
    const result = validateStructure('set_actuator_state_by_device_name', {
      deviceName: 'Smart Lamp Bedroom',
      state: 'on'
    })

    expect(result.structureValid).toBe(true)
  })

  it('rejects an invalid state enum value', () => {
    const result = validateStructure('set_actuator_state_by_device_name', {
      deviceName: 'Smart Lamp Bedroom',
      state: 'maybe'
    })

    expect(result.structureValid).toBe(false)
    expect(result.errors?.length).toBeGreaterThan(0)
  })

  it('rejects a missing required field', () => {
    const result = validateStructure('set_actuator_state_by_device_name', { state: 'on' })

    expect(result.structureValid).toBe(false)
  })

  it('validates a nested create_automation_rule payload', () => {
    const result = validateStructure('create_automation_rule', {
      originalPrompt: 'Nyalakan lampu kamar jika suhu ruang tamu di atas 30 derajat',
      trigger: { deviceName: 'Temperature Sensor Living Room', metric: 'temperature' },
      conditions: [{ metric: 'temperature', operator: '>', threshold: 30 }],
      actions: [{ deviceName: 'Smart Lamp Bedroom', state: 'on' }]
    })

    expect(result.structureValid).toBe(true)
  })

  it('returns structureValid=false for an unknown tool name', () => {
    const result = validateStructure('not_a_real_tool', {})
    expect(result.structureValid).toBe(false)
    expect(result.errors?.[0]).toContain('Unknown tool')
  })
})
