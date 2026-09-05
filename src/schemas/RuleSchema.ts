import { z } from 'zod'

export const ruleOperatorSchema = z.enum(['>', '>=', '<', '<=', '==', '!='])
export const ruleConditionLogicSchema = z.enum(['AND', 'OR'])
export const ruleActuatorStateSchema = z.enum(['on', 'off'])

export const ruleTriggerInputSchema = z.object({
  deviceName: z.string().min(1),
  metric: z.string().min(1).max(64)
})

export const ruleConditionInputSchema = z.object({
  deviceName: z.string().min(1).optional(),
  metric: z.string().min(1).max(64),
  operator: ruleOperatorSchema,
  threshold: z.coerce.number(),
  unit: z.string().max(32).optional()
})

export const ruleActionInputSchema = z.object({
  deviceName: z.string().min(1),
  state: ruleActuatorStateSchema
})

export const createRuleSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  originalPrompt: z.string().min(1),
  conditionLogic: ruleConditionLogicSchema.default('AND'),
  cooldownSec: z.coerce.number().int().min(0).max(86400).default(60),
  isActive: z.boolean().default(true),
  userId: z.coerce.number().int().positive().optional(),
  trigger: ruleTriggerInputSchema,
  conditions: z.array(ruleConditionInputSchema).min(1),
  actions: z.array(ruleActionInputSchema).min(1)
})

export const updateRuleSchema = z.object({
  ruleId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(150).optional(),
  originalPrompt: z.string().min(1).optional(),
  conditionLogic: ruleConditionLogicSchema.optional(),
  cooldownSec: z.coerce.number().int().min(0).max(86400).optional(),
  isActive: z.boolean().optional(),
  trigger: ruleTriggerInputSchema.optional(),
  conditions: z.array(ruleConditionInputSchema).min(1).optional(),
  actions: z.array(ruleActionInputSchema).min(1).optional()
})

export const setRuleActiveSchema = z.object({
  ruleId: z.coerce.number().int().positive(),
  isActive: z.boolean()
})

export const findRuleByIdSchema = z.object({
  ruleId: z.coerce.number().int().positive()
})

export const findAllRulesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  size: z.coerce.number().int().min(1).max(100).optional().default(20),
  pagination: z
    .string()
    .optional()
    .transform((v): boolean => v !== 'false'),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined
      return v === 'true'
    }),
  search: z.string().optional()
})

export const findRuleExecutionLogsSchema = z.object({
  ruleId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  size: z.coerce.number().int().min(1).max(100).optional().default(20)
})

export type ICreateRule = z.infer<typeof createRuleSchema>
export type IUpdateRule = z.infer<typeof updateRuleSchema>
export type ISetRuleActive = z.infer<typeof setRuleActiveSchema>
export type IFindAllRules = z.infer<typeof findAllRulesSchema>
export type IFindRuleExecutionLogs = z.infer<typeof findRuleExecutionLogsSchema>
