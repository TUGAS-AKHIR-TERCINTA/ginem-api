import { z } from 'zod'

export const categorySchema = z.enum([
  'simple',
  'medium',
  'complex',
  'ambiguous',
  'invalid'
])

export const expectedBehaviorSchema = z.enum([
  'execute_tool',
  'clarify',
  'reject',
  'unsupported'
])

export const groundTruthSchema = z.object({
  toolName: z.string().nullable(),
  parameters: z.record(z.string(), z.unknown()).default({}),
  requiredParameterKeys: z.array(z.string()).default([]),
  notes: z.string().optional()
})

export const evalCaseSchema = z.object({
  id: z.string().min(1),
  category: categorySchema,
  command: z.string().min(1),
  conversationContext: z.array(z.string()).optional(),
  ragContext: z.string().optional(),
  expectedToolName: z.string().nullable(),
  expectedParameters: z.record(z.string(), z.unknown()).default({}),
  expectedBehavior: expectedBehaviorSchema,
  groundTruth: groundTruthSchema,
  tags: z.array(z.string()).default([])
})

export const datasetSchema = z.object({
  version: z.string(),
  language: z.string(),
  description: z.string(),
  cases: z.array(evalCaseSchema).min(1)
})

export const toolCallSchema = z.object({
  name: z.string().min(1),
  args: z.record(z.string(), z.unknown()).default({}),
  id: z.string().optional()
})

export const llmCaseResultSchema = z.object({
  caseId: z.string(),
  category: categorySchema,
  modelId: z.string(),
  repetition: z.number().int().nonnegative(),
  command: z.string(),
  rawToolCalls: z.array(toolCallSchema),
  toolCallValid: z.boolean(),
  toolNameCorrect: z.boolean(),
  parameterCorrectCount: z.number().int().nonnegative(),
  parameterExpectedCount: z.number().int().nonnegative(),
  expectedBehavior: expectedBehaviorSchema,
  behaviorMatch: z.boolean(),
  latencyMs: z.number().nonnegative(),
  inputTokens: z.number().nonnegative(),
  outputTokens: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
  error: z.string().nullable(),
  assistantText: z.string().optional()
})

export const integrationCaseResultSchema = z.object({
  caseId: z.string(),
  category: categorySchema,
  mode: z.enum(['dry-run', 'real-device']),
  functionalSuccess: z.boolean(),
  integrationSuccess: z.boolean(),
  mqttSuccess: z.boolean(),
  latencyMs: z.number().nonnegative(),
  error: z.string().nullable(),
  logs: z.array(z.string()).default([])
})

export type EvalCategory = z.infer<typeof categorySchema>
export type ExpectedBehavior = z.infer<typeof expectedBehaviorSchema>
export type EvalCase = z.infer<typeof evalCaseSchema>
export type EvalDataset = z.infer<typeof datasetSchema>
export type ToolCall = z.infer<typeof toolCallSchema>
export type LlmCaseResult = z.infer<typeof llmCaseResultSchema>
export type IntegrationCaseResult = z.infer<typeof integrationCaseResultSchema>
