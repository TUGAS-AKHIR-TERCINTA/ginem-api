import type { ExpectedBehavior } from '../datasets/dataset.schema'
import type { ToolComparisonResult } from './toolComparator'

export const ERROR_TYPES = [
  'WRONG_TOOL',
  'INVALID_OR_MISSING_PARAMETER',
  'INVALID_STRUCTURE',
  'FAILED_CLARIFICATION',
  'UNNECESSARY_TOOL_CALL',
  'OTHER'
] as const
export type ErrorType = (typeof ERROR_TYPES)[number]

export interface ErrorClassificationInput {
  expectedBehavior: ExpectedBehavior
  toolComparison: ToolComparisonResult
  /** Undefined when there were no matched tool-call pairs to check (nothing to evaluate). */
  parameterCorrect?: boolean
  structureValid?: boolean
}

/**
 * Poin 15 (Error Classification). A record can carry more than one error tag.
 *
 * Mapping notes (see evaluation/README.md for the full rationale):
 * - "tool tidak dipanggil padahal seharusnya dipanggil" (poin 8) has no dedicated
 *   bucket among the five named categories, so it is folded into WRONG_TOOL — it is
 *   still fundamentally a tool-selection failure, just one of omission rather than
 *   substitution.
 * - Any actual tool call the ground truth did not ask for — whether the whole test
 *   case expected no tool call at all, or extra calls beyond what was needed —
 *   is UNNECESSARY_TOOL_CALL.
 */
export function classifyErrors(input: ErrorClassificationInput): ErrorType[] {
  const errors: ErrorType[] = []
  const { expectedBehavior, toolComparison } = input
  const calledAnyTool = toolComparison.actualTools.length > 0

  if (expectedBehavior === 'clarification') {
    if (calledAnyTool) {
      errors.push('FAILED_CLARIFICATION', 'UNNECESSARY_TOOL_CALL')
    }
    return errors
  }

  if (expectedBehavior === 'reject_or_no_tool') {
    if (calledAnyTool) {
      errors.push('UNNECESSARY_TOOL_CALL')
    }
    return errors
  }

  // expectedBehavior === 'tool_call'
  if (toolComparison.missingTools.length > 0) {
    errors.push('WRONG_TOOL')
  }
  if (toolComparison.extraTools.length > 0) {
    errors.push('UNNECESSARY_TOOL_CALL')
  }
  if (
    toolComparison.missingTools.length === 0 &&
    toolComparison.extraTools.length === 0
  ) {
    if (input.parameterCorrect === false) {
      errors.push('INVALID_OR_MISSING_PARAMETER')
    }
    if (input.structureValid === false) {
      errors.push('INVALID_STRUCTURE')
    }
  }

  return errors
}
