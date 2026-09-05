import { classifyErrors } from '../metrics/errorClassifier'
import type { ToolComparisonResult } from '../metrics/toolComparator'

function toolResult(overrides: Partial<ToolComparisonResult>): ToolComparisonResult {
  return {
    toolCorrect: true,
    expectedTools: [],
    actualTools: [],
    missingTools: [],
    extraTools: [],
    matchedPairs: [],
    ...overrides
  }
}

describe('classifyErrors', () => {
  it('returns no errors for a correct tool_call case', () => {
    const errors = classifyErrors({
      expectedBehavior: 'tool_call',
      toolComparison: toolResult({ toolCorrect: true }),
      parameterCorrect: true,
      structureValid: true
    })
    expect(errors).toEqual([])
  })

  it('flags WRONG_TOOL when the expected tool was never called', () => {
    const errors = classifyErrors({
      expectedBehavior: 'tool_call',
      toolComparison: toolResult({ missingTools: ['set_actuator_state_by_device_name'] })
    })
    expect(errors).toEqual(['WRONG_TOOL'])
  })

  it('flags UNNECESSARY_TOOL_CALL when an unneeded tool was also called', () => {
    const errors = classifyErrors({
      expectedBehavior: 'tool_call',
      toolComparison: toolResult({ extraTools: ['list_devices'] })
    })
    expect(errors).toEqual(['UNNECESSARY_TOOL_CALL'])
  })

  it('flags INVALID_OR_MISSING_PARAMETER only when tool selection itself was correct', () => {
    const errors = classifyErrors({
      expectedBehavior: 'tool_call',
      toolComparison: toolResult({ toolCorrect: true }),
      parameterCorrect: false,
      structureValid: true
    })
    expect(errors).toEqual(['INVALID_OR_MISSING_PARAMETER'])
  })

  it('flags INVALID_STRUCTURE only when tool selection itself was correct', () => {
    const errors = classifyErrors({
      expectedBehavior: 'tool_call',
      toolComparison: toolResult({ toolCorrect: true }),
      parameterCorrect: true,
      structureValid: false
    })
    expect(errors).toEqual(['INVALID_STRUCTURE'])
  })

  it('flags FAILED_CLARIFICATION and UNNECESSARY_TOOL_CALL when a tool fires on an ambiguous case', () => {
    const errors = classifyErrors({
      expectedBehavior: 'clarification',
      toolComparison: toolResult({ actualTools: ['set_actuator_state_by_device_name'] })
    })
    expect(errors).toEqual(['FAILED_CLARIFICATION', 'UNNECESSARY_TOOL_CALL'])
  })

  it('returns no errors when clarification is correctly requested (no tool call)', () => {
    const errors = classifyErrors({
      expectedBehavior: 'clarification',
      toolComparison: toolResult({ actualTools: [] })
    })
    expect(errors).toEqual([])
  })

  it('flags UNNECESSARY_TOOL_CALL when an invalid command still triggers a tool call', () => {
    const errors = classifyErrors({
      expectedBehavior: 'reject_or_no_tool',
      toolComparison: toolResult({ actualTools: ['set_actuator_state_by_device_name'] })
    })
    expect(errors).toEqual(['UNNECESSARY_TOOL_CALL'])
  })

  it('returns no errors when an invalid command is correctly rejected', () => {
    const errors = classifyErrors({
      expectedBehavior: 'reject_or_no_tool',
      toolComparison: toolResult({ actualTools: [] })
    })
    expect(errors).toEqual([])
  })
})
