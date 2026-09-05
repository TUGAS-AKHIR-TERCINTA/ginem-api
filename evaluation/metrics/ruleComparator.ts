import type { ChatToolCallTrace } from '../../src/services/chat/Chat.service'
import type { ExpectedRule } from '../datasets/dataset.schema'
import { semanticEqual } from './valueNormalizer'

export interface RuleComparisonResult {
  ruleCorrect: boolean
  expectedCount: number
  matchedCount: number
  unmatched: ExpectedRule[]
}

function toActualRule(call: ChatToolCallTrace): ExpectedRule | null {
  if (call.name !== 'create_automation_rule') return null
  const args = call.args
  const trigger = args.trigger as { deviceName?: string; metric?: string } | undefined
  if (trigger?.deviceName == null || trigger.metric == null) return null

  return {
    triggerDeviceName: trigger.deviceName,
    triggerMetric: trigger.metric,
    conditions: (args.conditions as ExpectedRule['conditions']) ?? [],
    actions: (args.actions as ExpectedRule['actions']) ?? [],
    conditionLogic: (args.conditionLogic as 'AND' | 'OR') ?? 'AND'
  }
}

/**
 * Section 12 (Dynamic Rule Accuracy): compares the Event-Condition-Action structure
 * (trigger, conditions, actions, conditionLogic) after semantic normalization —
 * conditions/actions arrays are order-insensitive since the rule schema doesn't
 * imply a canonical order.
 */
export function compareRule(
  expectedRules: ExpectedRule[] | undefined,
  actualToolCalls: ChatToolCallTrace[]
): RuleComparisonResult {
  const expected = expectedRules ?? []
  if (expected.length === 0) {
    return { ruleCorrect: true, expectedCount: 0, matchedCount: 0, unmatched: [] }
  }

  const actualRules = actualToolCalls
    .map(toActualRule)
    .filter((r): r is ExpectedRule => r != null)

  const remaining = [...actualRules]
  const unmatched: ExpectedRule[] = []

  for (const expectedEntry of expected) {
    const matchIndex = remaining.findIndex((actual) =>
      semanticEqual(expectedEntry, actual)
    )
    if (matchIndex === -1) {
      unmatched.push(expectedEntry)
      continue
    }
    remaining.splice(matchIndex, 1)
  }

  return {
    ruleCorrect: unmatched.length === 0,
    expectedCount: expected.length,
    matchedCount: expected.length - unmatched.length,
    unmatched
  }
}
