import { compareParameters } from '../metrics/parameterComparator'
import type { ToolPairing } from '../metrics/toolComparator'

describe('compareParameters', () => {
  it('is correct when every ground-truth parameter matches', () => {
    const pairs: ToolPairing[] = [
      {
        tool: 'set_actuator_state_by_device_name',
        expectedParameters: { deviceName: 'Smart Lamp Bedroom', state: 'on' },
        actualParameters: { deviceName: 'Smart Lamp Bedroom', state: 'on' }
      }
    ]

    const result = compareParameters(pairs)
    expect(result.parameterCorrect).toBe(true)
    expect(result.parametersChecked).toBe(2)
    expect(result.parametersCorrect).toBe(2)
  })

  it('flags a missing parameter as incorrect, not just absent', () => {
    const pairs: ToolPairing[] = [
      {
        tool: 'set_actuator_state_by_device_name',
        expectedParameters: { deviceName: 'Smart Lamp Bedroom', state: 'on' },
        actualParameters: { deviceName: 'Smart Lamp Bedroom' }
      }
    ]

    const result = compareParameters(pairs)
    expect(result.parameterCorrect).toBe(false)
    expect(result.missingParameters).toEqual([
      { tool: 'set_actuator_state_by_device_name', key: 'state' }
    ])
  })

  it('flags a mismatched value', () => {
    const pairs: ToolPairing[] = [
      {
        tool: 'schedule_actuator_state_at',
        expectedParameters: { hour: 18, minute: 0 },
        actualParameters: { hour: 19, minute: 0 }
      }
    ]

    const result = compareParameters(pairs)
    expect(result.parameterCorrect).toBe(false)
    expect(result.mismatchedParameters).toEqual([
      { tool: 'schedule_actuator_state_at', key: 'hour', expected: 18, actual: 19 }
    ])
  })

  it('normalizes semantically equal values (numeric string vs number)', () => {
    const pairs: ToolPairing[] = [
      {
        tool: 'create_device_log',
        expectedParameters: { deviceLogData: '28' },
        actualParameters: { deviceLogData: 28 }
      }
    ]

    const result = compareParameters(pairs)
    expect(result.parameterCorrect).toBe(true)
  })

  it('is trivially correct when there are no matched pairs (nothing to check)', () => {
    const result = compareParameters([])
    expect(result.parameterCorrect).toBe(true)
    expect(result.parametersChecked).toBe(0)
  })
})
