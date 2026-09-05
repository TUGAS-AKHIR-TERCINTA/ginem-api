import type { ChatToolCallTrace } from '../../src/services/chat/Chat.service'
import type { DatasetCase } from '../datasets/dataset.schema'

export interface ToolPairing {
  tool: string
  expectedParameters: Record<string, unknown>
  actualParameters: Record<string, unknown>
}

export interface ToolComparisonResult {
  toolCorrect: boolean
  expectedTools: string[]
  actualTools: string[]
  /** Expected tool calls with no matching actual call — tool never invoked when it should have been. */
  missingTools: string[]
  /** Actual tool calls with no matching expected call — a tool invoked when it wasn't needed. */
  extraTools: string[]
  /** Expected/actual call pairs matched by tool name, for downstream parameter/structure checks. */
  matchedPairs: ToolPairing[]
}

/**
 * Formula 1 (A_tool, Bab III 3.11.3): compares the multiset of tool names called against
 * ground truth. Order does not matter (a test case may legitimately expect two calls to
 * the same tool, e.g. TC075's daily-on + daily-off schedule pair).
 */
export function compareTools(
  expected: DatasetCase['expected'],
  actualToolCalls: ChatToolCallTrace[]
): ToolComparisonResult {
  const actualTools = actualToolCalls.map((c) => c.name)

  if (expected.behavior !== 'tool_call') {
    return {
      toolCorrect: actualTools.length === 0,
      expectedTools: [],
      actualTools,
      missingTools: [],
      extraTools: [...actualTools],
      matchedPairs: []
    }
  }

  const expectedCalls = expected.toolCalls ?? []
  const expectedTools = expectedCalls.map((c) => c.tool)

  const remainingActual = actualToolCalls.map((c, index) => ({ ...c, index }))
  const matchedPairs: ToolPairing[] = []
  const missingTools: string[] = []

  for (const expectedCall of expectedCalls) {
    const matchIndex = remainingActual.findIndex((c) => c.name === expectedCall.tool)
    if (matchIndex === -1) {
      missingTools.push(expectedCall.tool)
      continue
    }
    const [matched] = remainingActual.splice(matchIndex, 1)
    matchedPairs.push({
      tool: expectedCall.tool,
      expectedParameters: expectedCall.parameters,
      actualParameters: matched.args
    })
  }

  const extraTools = remainingActual.map((c) => c.name)

  return {
    toolCorrect: missingTools.length === 0 && extraTools.length === 0,
    expectedTools,
    actualTools,
    missingTools,
    extraTools,
    matchedPairs
  }
}
