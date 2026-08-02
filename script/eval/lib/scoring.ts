import type { EvalCase, ExpectedBehavior, ToolCall } from '../schemas/dataset.schema'
import { validateToolCallStructure } from '../schemas/tools.schema'
import { scoreParameters, type AliasMap } from '../lib/normalize'

const CLARIFY_RE =
  /\b(klarifikasi|perjelas|maksud|perangkat mana|yang mana|jam berapa|kapan|tolong sebut|lebih spesifik|ambigu|tidak jelas)\b/i

const REJECT_RE =
  /\b(tidak (bisa|dapat|didukung|tersedia)|maaf|tolak|invalid|di luar|unsupported|belum (ada|didukung)|tidak mendukung)\b/i

export function extractToolCalls(message: unknown): ToolCall[] {
  if (!message || typeof message !== 'object') return []
  const m = message as {
    tool_calls?: Array<{
      name?: string
      args?: Record<string, unknown>
      id?: string
      function?: { name?: string; arguments?: string }
    }>
    additional_kwargs?: {
      tool_calls?: Array<{
        id?: string
        function?: { name?: string; arguments?: string }
      }>
    }
  }

  const fromLc = (m.tool_calls ?? []).map((tc) => {
    if (tc.name) {
      return {
        name: tc.name,
        args: (tc.args ?? {}) as Record<string, unknown>,
        id: tc.id
      }
    }
    const name = tc.function?.name ?? ''
    let args: Record<string, unknown> = {}
    if (tc.function?.arguments) {
      try {
        args = JSON.parse(tc.function.arguments) as Record<string, unknown>
      } catch {
        args = {}
      }
    }
    return { name, args, id: tc.id }
  })

  if (fromLc.length > 0) return fromLc.filter((t) => t.name)

  const legacy = m.additional_kwargs?.tool_calls ?? []
  return legacy
    .map((tc) => {
      let args: Record<string, unknown> = {}
      try {
        args = JSON.parse(tc.function?.arguments ?? '{}') as Record<string, unknown>
      } catch {
        args = {}
      }
      return {
        name: tc.function?.name ?? '',
        args,
        id: tc.id
      }
    })
    .filter((t) => t.name)
}

export function inferBehavior(
  toolCalls: ToolCall[],
  assistantText: string,
  expected: ExpectedBehavior
): ExpectedBehavior {
  if (toolCalls.length > 0) return 'execute_tool'
  if (expected === 'unsupported' || expected === 'reject') {
    if (REJECT_RE.test(assistantText) || assistantText.trim().length > 0) {
      // Prefer expected label when text refuses without tool
      return expected
    }
  }
  if (CLARIFY_RE.test(assistantText) || /\?/.test(assistantText)) {
    return 'clarify'
  }
  if (REJECT_RE.test(assistantText)) {
    return expected === 'unsupported' ? 'unsupported' : 'reject'
  }
  // No tool + no clear clarify/reject → treat as clarify for ambiguous, else reject
  if (expected === 'clarify') return 'clarify'
  if (expected === 'unsupported') return 'unsupported'
  if (expected === 'reject') return 'reject'
  return 'execute_tool'
}

export function scoreCase(
  evalCase: EvalCase,
  toolCalls: ToolCall[],
  assistantText: string,
  aliases: AliasMap
): {
  toolCallValid: boolean
  toolNameCorrect: boolean
  parameterCorrectCount: number
  parameterExpectedCount: number
  behaviorMatch: boolean
  validationError: string | null
} {
  const primary = toolCalls[0]
  let toolCallValid = true
  let validationError: string | null = null

  if (primary) {
    const v = validateToolCallStructure(primary.name, primary.args)
    toolCallValid = v.valid
    validationError = v.error
  } else if (evalCase.expectedBehavior === 'execute_tool') {
    toolCallValid = false
    validationError = 'Expected tool call but none produced'
  }

  const expectedName = evalCase.groundTruth.toolName
  let toolNameCorrect = false
  if (expectedName == null) {
    toolNameCorrect = toolCalls.length === 0
  } else {
    toolNameCorrect = primary?.name === expectedName
  }

  const required = evalCase.groundTruth.requiredParameterKeys
  const expectedParams = evalCase.groundTruth.parameters
  let parameterCorrectCount = 0
  let parameterExpectedCount =
    required.length > 0 ? required.length : Object.keys(expectedParams).length

  if (expectedName == null) {
    parameterExpectedCount = 0
    parameterCorrectCount = 0
  } else if (primary) {
    const scored = scoreParameters(expectedParams, required, primary.args, aliases)
    parameterCorrectCount = scored.correct
    parameterExpectedCount = scored.total
  }

  const observed = inferBehavior(toolCalls, assistantText, evalCase.expectedBehavior)
  const behaviorMatch = observed === evalCase.expectedBehavior

  return {
    toolCallValid,
    toolNameCorrect,
    parameterCorrectCount,
    parameterExpectedCount,
    behaviorMatch,
    validationError
  }
}

export function buildUserMessage(evalCase: EvalCase): string {
  const parts: string[] = []
  if (evalCase.ragContext) {
    parts.push(`[RAG Context]\n${evalCase.ragContext}`)
  }
  if (evalCase.conversationContext?.length) {
    parts.push(`[Conversation Context]\n${evalCase.conversationContext.join('\n')}`)
  }
  parts.push(`[User Command]\n${evalCase.command}`)
  return parts.join('\n\n')
}
