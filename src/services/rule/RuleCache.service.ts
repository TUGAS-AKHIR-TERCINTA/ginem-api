import type { RuleConditionLogic } from '../../models/RuleModel'
import type { RuleOperator } from '../../models/RuleConditionModel'

export interface CachedRuleTrigger {
  deviceId: number
  deviceName: string
  metric: string
  eventType: 'telemetry'
}

export interface CachedRuleCondition {
  deviceId: number
  deviceName: string
  metric: string
  operator: RuleOperator
  threshold: number
  unit?: string | null
}

export interface CachedRuleAction {
  deviceId: number
  deviceName: string
  actionType: 'set_state'
  state: 'on' | 'off'
}

export interface CachedRule {
  ruleId: number
  name: string
  originalPrompt: string
  conditionLogic: RuleConditionLogic
  isActive: boolean
  cooldownSec: number
  lastTriggeredAt: Date | null
  trigger: CachedRuleTrigger
  conditions: CachedRuleCondition[]
  actions: CachedRuleAction[]
}

export interface SensorEvent {
  deviceId: number
  /** Extracted numeric metrics from telemetry payload. */
  metrics: Record<string, number>
  receivedAt: Date
  rawPayload?: unknown
}

/**
 * In-memory cache of active automation rules.
 * Refreshed on create/update/delete/toggle and at app boot.
 */
export class RuleCache {
  private static rules: CachedRule[] = []
  private static loaded = false

  static isLoaded(): boolean {
    return RuleCache.loaded
  }

  static getAll(): CachedRule[] {
    return RuleCache.rules
  }

  static getActive(): CachedRule[] {
    return RuleCache.rules.filter((r) => r.isActive)
  }

  /** Rules whose trigger device matches the event device. */
  static findByTriggerDevice(deviceId: number): CachedRule[] {
    return RuleCache.getActive().filter((r) => r.trigger.deviceId === deviceId)
  }

  static setRules(rules: CachedRule[]): void {
    RuleCache.rules = rules
    RuleCache.loaded = true
  }

  static clear(): void {
    RuleCache.rules = []
    RuleCache.loaded = false
  }

  static touchLastTriggered(ruleId: number, at: Date): void {
    const rule = RuleCache.rules.find((r) => r.ruleId === ruleId)
    if (rule != null) {
      rule.lastTriggeredAt = at
    }
  }
}
