import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { AppError } from '../../../../utilities/AppError'
import { RuleManagementService } from '../../../rule'
import {
  createRuleSchema,
  ruleActionInputSchema,
  ruleConditionInputSchema,
  ruleConditionLogicSchema,
  ruleTriggerInputSchema
} from '../../../../schemas/RuleSchema'

function toJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

function errorJson(err: unknown): string {
  if (err instanceof AppError) {
    return toJson({ error: err.message, statusCode: err.statusCode })
  }
  return toJson({ error: String(err) })
}

export const createAutomationRuleTool = tool(
  async (input) => {
    try {
      const parsed = createRuleSchema.parse({
        ...input,
        originalPrompt: input.originalPrompt,
        trigger: input.trigger,
        conditions: input.conditions,
        actions: input.actions
      })
      const rule = await RuleManagementService.create(parsed)
      return toJson({
        success: true,
        message:
          'Automation rule created and stored. It will run when matching sensor events arrive (no LLM needed at execution time).',
        rule
      })
    } catch (err) {
      return errorJson(err)
    }
  },
  {
    name: 'create_automation_rule',
    description:
      'Create an Event-Condition-Action automation rule from natural language intent. Use when the user wants automatic cooperation between devices (e.g. "turn on fan if temperature > 25"). Do NOT use for immediate on/off (use set_actuator_state_by_device_name) or time schedules (use schedule_*). Trigger device must be sensor/hybrid; action devices must be actuator/hybrid. Metric is a string like temperature or humidity.',
    schema: z.object({
      name: z.string().min(1).max(150).optional(),
      originalPrompt: z
        .string()
        .min(1)
        .describe('The user original natural-language request'),
      conditionLogic: ruleConditionLogicSchema.optional().default('AND'),
      cooldownSec: z.number().int().min(0).max(86400).optional().default(60),
      isActive: z.boolean().optional().default(true),
      trigger: ruleTriggerInputSchema,
      conditions: z.array(ruleConditionInputSchema).min(1),
      actions: z.array(ruleActionInputSchema).min(1)
    })
  }
)

export const listAutomationRulesTool = tool(
  async ({ isActive, limit }) => {
    try {
      const result = await RuleManagementService.findAll({
        page: 1,
        size: limit ?? 20,
        pagination: true,
        isActive
      })
      return toJson(result)
    } catch (err) {
      return errorJson(err)
    }
  },
  {
    name: 'list_automation_rules',
    description: 'List stored automation (ECA) rules.',
    schema: z.object({
      isActive: z.boolean().optional(),
      limit: z.number().int().min(1).max(100).optional()
    })
  }
)

export const setAutomationRuleActiveTool = tool(
  async ({ ruleId, isActive }) => {
    try {
      const rule = await RuleManagementService.setActive(ruleId, isActive)
      return toJson({ success: true, rule })
    } catch (err) {
      return errorJson(err)
    }
  },
  {
    name: 'set_automation_rule_active',
    description: 'Enable or disable an automation rule by ruleId.',
    schema: z.object({
      ruleId: z.number().int().positive(),
      isActive: z.boolean()
    })
  }
)

export const deleteAutomationRuleTool = tool(
  async ({ ruleId }) => {
    try {
      const result = await RuleManagementService.remove(ruleId)
      return toJson({ success: true, ...result })
    } catch (err) {
      return errorJson(err)
    }
  },
  {
    name: 'delete_automation_rule',
    description: 'Delete an automation rule by ruleId.',
    schema: z.object({
      ruleId: z.number().int().positive()
    })
  }
)

export const getAutomationRuleTool = tool(
  async ({ ruleId }) => {
    try {
      const rule = await RuleManagementService.findById(ruleId)
      return toJson(rule)
    } catch (err) {
      return errorJson(err)
    }
  },
  {
    name: 'get_automation_rule',
    description: 'Get one automation rule by ruleId.',
    schema: z.object({
      ruleId: z.number().int().positive()
    })
  }
)

export const ruleTools = [
  createAutomationRuleTool,
  listAutomationRulesTool,
  getAutomationRuleTool,
  setAutomationRuleActiveTool,
  deleteAutomationRuleTool
]
