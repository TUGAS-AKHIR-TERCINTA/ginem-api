import { compareTools } from '../metrics/toolComparator'
import type { DatasetCase, ExpectedToolCall } from '../datasets/dataset.schema'

function toolCallExpected(
  ...tools: Array<{
    tool: ExpectedToolCall['tool']
    parameters?: Record<string, unknown>
  }>
): DatasetCase['expected'] {
  return {
    behavior: 'tool_call',
    toolCalls: tools.map((t) => ({ tool: t.tool, parameters: t.parameters ?? {} }))
  }
}

describe('compareTools', () => {
  it('matches a single correct tool call', () => {
    const result = compareTools(
      toolCallExpected({
        tool: 'set_actuator_state_by_device_name',
        parameters: { state: 'on' }
      }),
      [
        {
          name: 'set_actuator_state_by_device_name',
          args: { deviceName: 'Smart Lamp Bedroom', state: 'on' }
        }
      ]
    )

    expect(result.toolCorrect).toBe(true)
    expect(result.missingTools).toEqual([])
    expect(result.extraTools).toEqual([])
    expect(result.matchedPairs).toHaveLength(1)
  })

  it('flags a missing tool when the expected tool was never called', () => {
    const result = compareTools(
      toolCallExpected({ tool: 'set_actuator_state_by_device_name' }),
      []
    )

    expect(result.toolCorrect).toBe(false)
    expect(result.missingTools).toEqual(['set_actuator_state_by_device_name'])
  })

  it('flags an extra tool when an unexpected tool was called', () => {
    const result = compareTools(
      toolCallExpected({ tool: 'set_actuator_state_by_device_name' }),
      [
        { name: 'set_actuator_state_by_device_name', args: {} },
        { name: 'list_devices', args: {} }
      ]
    )

    expect(result.toolCorrect).toBe(false)
    expect(result.extraTools).toEqual(['list_devices'])
  })

  it('matches two calls to the same tool (e.g. daily on + daily off schedule)', () => {
    const result = compareTools(
      toolCallExpected(
        { tool: 'schedule_actuator_state_at', parameters: { state: 'on', hour: 18 } },
        { tool: 'schedule_actuator_state_at', parameters: { state: 'off', hour: 6 } }
      ),
      [
        { name: 'schedule_actuator_state_at', args: { state: 'on', hour: 18 } },
        { name: 'schedule_actuator_state_at', args: { state: 'off', hour: 6 } }
      ]
    )

    expect(result.toolCorrect).toBe(true)
    expect(result.matchedPairs).toHaveLength(2)
  })

  it('requires zero tool calls when behavior is clarification', () => {
    const noCall = compareTools({ behavior: 'clarification' }, [])
    expect(noCall.toolCorrect).toBe(true)

    const withCall = compareTools({ behavior: 'clarification' }, [
      { name: 'set_actuator_state_by_device_name', args: {} }
    ])
    expect(withCall.toolCorrect).toBe(false)
    expect(withCall.extraTools).toEqual(['set_actuator_state_by_device_name'])
  })

  it('requires zero tool calls when behavior is reject_or_no_tool', () => {
    const result = compareTools({ behavior: 'reject_or_no_tool' }, [
      { name: 'set_actuator_state_by_device_name', args: {} }
    ])
    expect(result.toolCorrect).toBe(false)
  })
})
