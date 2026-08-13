import { DeviceLogModel } from '../../models/DeviceLogModel'
import { RuleModel } from '../../models/RuleModel'
import { RuleExecutionLogModel } from '../../models/RuleExecutionLogModel'
import { MQTTService } from '../mqtt/MQTT.service'
import logger from '../../utilities/logger'
import {
  RuleCache,
  type CachedRule,
  type CachedRuleCondition,
  type SensorEvent
} from './RuleCache.service'
import { resolveMetricReading } from './telemetryMetrics'

export function evaluateOperator(
  reading: number,
  operator: CachedRuleCondition['operator'],
  threshold: number
): boolean {
  switch (operator) {
    case '>':
      return reading > threshold
    case '>=':
      return reading >= threshold
    case '<':
      return reading < threshold
    case '<=':
      return reading <= threshold
    case '==':
      return reading === threshold
    case '!=':
      return reading !== threshold
    default:
      return false
  }
}

export function isInCooldown(rule: CachedRule, now: Date): boolean {
  if (rule.cooldownSec <= 0 || rule.lastTriggeredAt == null) return false
  const elapsedMs = now.getTime() - new Date(rule.lastTriggeredAt).getTime()
  return elapsedMs < rule.cooldownSec * 1000
}

/**
 * Deterministic ECA evaluator. Does not call the LLM.
 */
export class RuleEngine {
  static async evaluate(event: SensorEvent): Promise<void> {
    const started = Date.now()
    const candidates = RuleCache.findByTriggerDevice(event.deviceId)
    if (candidates.length === 0) return

    for (const rule of candidates) {
      try {
        await RuleEngine.evaluateOne(rule, event, started)
      } catch (error) {
        logger.error(
          `[RuleEngine] ruleId=${rule.ruleId} evaluation failed: ${String(error)}`
        )
        try {
          await RuleExecutionLogModel.create({
            ruleId: rule.ruleId,
            eventSnapshot: {
              deviceId: event.deviceId,
              metrics: event.metrics,
              receivedAt: event.receivedAt.toISOString()
            },
            success: false,
            errorMessage: String(error),
            latencyMs: Date.now() - started,
            deleted: false
          })
        } catch (logError) {
          logger.error(`[RuleEngine] failed to write execution log: ${String(logError)}`)
        }
      }
    }
  }

  private static async evaluateOne(
    rule: CachedRule,
    event: SensorEvent,
    started: number
  ): Promise<void> {
    const now = new Date()

    const triggerReading = resolveMetricReading(event.metrics, rule.trigger.metric)
    if (triggerReading == null) {
      return
    }

    if (isInCooldown(rule, now)) {
      logger.info(
        `[RuleEngine] ruleId=${rule.ruleId} skipped (cooldown ${rule.cooldownSec}s)`
      )
      return
    }

    const conditionDetails: Array<Record<string, unknown>> = []
    const results: boolean[] = []

    for (const condition of rule.conditions) {
      let reading: number | null = null
      if (condition.deviceId === event.deviceId) {
        reading = resolveMetricReading(event.metrics, condition.metric)
      } else {
        reading = await RuleEngine.readLastDeviceMetric(
          condition.deviceId,
          condition.metric
        )
      }

      const ok =
        reading != null &&
        evaluateOperator(reading, condition.operator, condition.threshold)
      results.push(ok)
      conditionDetails.push({
        deviceId: condition.deviceId,
        metric: condition.metric,
        operator: condition.operator,
        threshold: condition.threshold,
        reading,
        ok
      })
    }

    const passed =
      rule.conditionLogic === 'AND' ? results.every(Boolean) : results.some(Boolean)

    if (!passed) {
      return
    }

    const actionResults: Array<Record<string, unknown>> = []
    for (const action of rule.actions) {
      const skip = await RuleEngine.shouldSkipAction(action.deviceId, action.state)
      if (skip) {
        actionResults.push({
          deviceId: action.deviceId,
          state: action.state,
          skipped: true,
          reason: 'target already in desired state'
        })
        continue
      }

      MQTTService.publishActuatorState(action.deviceId, action.state)
      actionResults.push({
        deviceId: action.deviceId,
        state: action.state,
        skipped: false,
        published: true
      })
    }

    const firedAt = new Date()
    await RuleModel.update(
      { lastTriggeredAt: firedAt },
      { where: { ruleId: rule.ruleId } }
    )
    RuleCache.touchLastTriggered(rule.ruleId, firedAt)

    await RuleExecutionLogModel.create({
      ruleId: rule.ruleId,
      eventSnapshot: {
        deviceId: event.deviceId,
        metrics: event.metrics,
        receivedAt: event.receivedAt.toISOString(),
        rawPayload: event.rawPayload ?? null
      },
      conditionResult: {
        logic: rule.conditionLogic,
        details: conditionDetails,
        passed: true
      },
      actionResult: { actions: actionResults },
      success: true,
      errorMessage: null,
      latencyMs: Date.now() - started,
      deleted: false
    })

    logger.info(
      `[RuleEngine] ruleId=${rule.ruleId} fired actions=${actionResults.length}`
    )
  }

  private static async shouldSkipAction(
    deviceId: number,
    desired: 'on' | 'off'
  ): Promise<boolean> {
    try {
      const last = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['createdAt', 'DESC']],
        attributes: ['deviceLogData']
      })
      if (last != null) {
        const data = String(last.deviceLogData ?? '')
        const current: 'on' | 'off' | null =
          data === '1' || data.toLowerCase() === 'on'
            ? 'on'
            : data === '0' || data.toLowerCase() === 'off'
              ? 'off'
              : null
        if (current != null) return current === desired
      }

      const mqttState = MQTTService.getLastDeviceState(deviceId)
      if (mqttState?.payload != null && typeof mqttState.payload === 'object') {
        const state = (mqttState.payload as { state?: unknown }).state
        if (typeof state === 'string') {
          return state.toLowerCase() === desired
        }
      }
      return false
    } catch {
      return false
    }
  }

  private static async readLastDeviceMetric(
    deviceId: number,
    metric: string
  ): Promise<number | null> {
    try {
      const row = await DeviceLogModel.findOne({
        where: { deleted: 0, deviceLogDeviceId: deviceId },
        order: [['createdAt', 'DESC']]
      })
      if (row == null) return null
      const n = Number(row.deviceLogData)
      if (Number.isFinite(n)) return n
      try {
        const parsed = JSON.parse(row.deviceLogData) as Record<string, unknown>
        const key = metric.toLowerCase()
        const raw = parsed[key] ?? parsed.value
        const v = Number(raw)
        return Number.isFinite(v) ? v : null
      } catch {
        return null
      }
    } catch {
      return null
    }
  }
}
