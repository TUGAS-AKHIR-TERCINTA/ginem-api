import { StatusCodes } from 'http-status-codes'
import { Op, type WhereOptions } from 'sequelize'
import { sequelizeInit } from '../../configs/database'
import { DeviceModel } from '../../models/DeviceModel'
import {
  RuleModel,
  RuleTriggerModel,
  RuleConditionModel,
  RuleActionModel,
  RuleExecutionLogModel
} from '../../models/ruleAssociations'
import type { IRuleAttributes, RuleInstance } from '../../models/RuleModel'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import { Pagination } from '../../utilities/pagination'
import type {
  ICreateRule,
  IFindAllRules,
  IFindRuleExecutionLogs,
  IUpdateRule
} from '../../schemas/RuleSchema'
import { RuleCache, type CachedRule } from './RuleCache.service'

const TRIGGER_DEVICE_TYPES = new Set(['sensor', 'hybrid'])
const ACTION_DEVICE_TYPES = new Set(['actuator', 'hybrid'])

function serializeRule(rule: RuleInstance): CachedRule {
  const plain = rule.get({ plain: true }) as IRuleAttributes & {
    triggers?: Array<{
      deviceId: number
      metric: string
      eventType: 'telemetry'
      device?: { deviceName?: string }
    }>
    conditions?: Array<{
      deviceId: number
      metric: string
      operator: CachedRule['conditions'][0]['operator']
      threshold: number
      unit?: string | null
      device?: { deviceName?: string }
    }>
    actions?: Array<{
      deviceId: number
      actionType: 'set_state'
      state: 'on' | 'off'
      device?: { deviceName?: string }
    }>
  }

  const triggerRow = plain.triggers?.[0]
  if (triggerRow == null) {
    throw new AppError('Rule is missing trigger', StatusCodes.INTERNAL_SERVER_ERROR)
  }

  return {
    ruleId: plain.ruleId,
    name: plain.name,
    originalPrompt: plain.originalPrompt,
    conditionLogic: plain.conditionLogic,
    isActive: plain.isActive,
    cooldownSec: plain.cooldownSec,
    lastTriggeredAt: plain.lastTriggeredAt ?? null,
    trigger: {
      deviceId: triggerRow.deviceId,
      deviceName: triggerRow.device?.deviceName ?? '',
      metric: triggerRow.metric,
      eventType: triggerRow.eventType
    },
    conditions: (plain.conditions ?? []).map((c) => ({
      deviceId: c.deviceId,
      deviceName: c.device?.deviceName ?? '',
      metric: c.metric,
      operator: c.operator,
      threshold: c.threshold,
      unit: c.unit
    })),
    actions: (plain.actions ?? []).map((a) => ({
      deviceId: a.deviceId,
      deviceName: a.device?.deviceName ?? '',
      actionType: a.actionType,
      state: a.state
    }))
  }
}

const ruleInclude = [
  {
    model: RuleTriggerModel,
    as: 'triggers' as const,
    include: [
      {
        model: DeviceModel,
        as: 'device',
        attributes: ['deviceId', 'deviceName', 'deviceType']
      }
    ]
  },
  {
    model: RuleConditionModel,
    as: 'conditions' as const,
    include: [
      {
        model: DeviceModel,
        as: 'device',
        attributes: ['deviceId', 'deviceName', 'deviceType']
      }
    ]
  },
  {
    model: RuleActionModel,
    as: 'actions' as const,
    include: [
      {
        model: DeviceModel,
        as: 'device',
        attributes: ['deviceId', 'deviceName', 'deviceType']
      }
    ]
  }
]

export class RuleManagementService {
  private static async resolveDeviceByName(deviceName: string) {
    const device = await DeviceModel.findOne({
      where: { deleted: 0, deviceName }
    })
    if (device == null) {
      throw AppError.notFound(`Device not found: ${deviceName}`)
    }
    return device
  }

  private static assertTriggerDevice(device: {
    deviceName: string
    deviceType: string
  }): void {
    if (!TRIGGER_DEVICE_TYPES.has(device.deviceType)) {
      throw new AppError(
        `Device "${device.deviceName}" cannot be a rule trigger (type=${device.deviceType}). Use sensor or hybrid.`,
        StatusCodes.BAD_REQUEST
      )
    }
  }

  private static assertActionDevice(device: {
    deviceName: string
    deviceType: string
  }): void {
    if (!ACTION_DEVICE_TYPES.has(device.deviceType)) {
      throw new AppError(
        `Device "${device.deviceName}" cannot be a rule action target (type=${device.deviceType}). Use actuator or hybrid.`,
        StatusCodes.BAD_REQUEST
      )
    }
  }

  static async refreshCache(): Promise<void> {
    try {
      const rows = await RuleModel.findAll({
        where: { deleted: 0, isActive: true },
        include: ruleInclude
      })
      RuleCache.setRules(rows.map((r) => serializeRule(r)))
    } catch (error) {
      logger.error(`[RuleManagementService] refreshCache failed: ${String(error)}`)
      throw error
    }
  }

  static async create(payload: ICreateRule) {
    try {
      const triggerDevice = await this.resolveDeviceByName(payload.trigger.deviceName)
      this.assertTriggerDevice(triggerDevice)

      const conditionRows: Array<{
        deviceId: number
        metric: string
        operator: ICreateRule['conditions'][number]['operator']
        threshold: number
        unit: string | null
      }> = []
      for (const condition of payload.conditions) {
        const name = condition.deviceName ?? payload.trigger.deviceName
        const device = await this.resolveDeviceByName(name)
        conditionRows.push({
          deviceId: device.deviceId,
          metric: condition.metric.trim().toLowerCase(),
          operator: condition.operator,
          threshold: condition.threshold,
          unit: condition.unit ?? null
        })
      }

      const actionRows: Array<{
        deviceId: number
        actionType: 'set_state'
        state: 'on' | 'off'
      }> = []
      for (const action of payload.actions) {
        const device = await this.resolveDeviceByName(action.deviceName)
        this.assertActionDevice(device)
        actionRows.push({
          deviceId: device.deviceId,
          actionType: 'set_state' as const,
          state: action.state
        })
      }

      const trimmedName = payload.name?.trim()
      const name =
        trimmedName != null && trimmedName !== ''
          ? trimmedName
          : `Rule: ${payload.trigger.deviceName} → ${payload.actions
              .map((a) => a.deviceName)
              .join(', ')}`

      const createdId = await sequelizeInit.transaction(async (tx) => {
        const rule = await RuleModel.create(
          {
            name,
            originalPrompt: payload.originalPrompt,
            conditionLogic: payload.conditionLogic,
            cooldownSec: payload.cooldownSec,
            isActive: payload.isActive,
            userId: payload.userId ?? null,
            deleted: false
          },
          { transaction: tx }
        )

        await RuleTriggerModel.create(
          {
            ruleId: rule.ruleId,
            deviceId: triggerDevice.deviceId,
            metric: payload.trigger.metric.trim().toLowerCase(),
            eventType: 'telemetry',
            deleted: false
          },
          { transaction: tx }
        )

        for (const row of conditionRows) {
          await RuleConditionModel.create(
            { ruleId: rule.ruleId, ...row, deleted: false },
            { transaction: tx }
          )
        }
        for (const row of actionRows) {
          await RuleActionModel.create(
            { ruleId: rule.ruleId, ...row, deleted: false },
            { transaction: tx }
          )
        }

        return rule.ruleId
      })

      await this.refreshCache()
      return await this.findById(createdId)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[RuleManagementService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create rule', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById(ruleId: number) {
    try {
      const rule = await RuleModel.findOne({
        where: { deleted: 0, ruleId },
        include: ruleInclude
      })
      if (rule == null) {
        throw AppError.notFound('Rule not found')
      }
      return serializeRule(rule)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[RuleManagementService] findById failed: ${String(serviceError)}`)
      throw new AppError('Failed to get rule', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findAll(payload: IFindAllRules) {
    try {
      const pager = new Pagination(payload.page, payload.size)
      let where: WhereOptions<IRuleAttributes> = { deleted: 0 }
      if (payload.isActive !== undefined) {
        where = { ...where, isActive: payload.isActive }
      }
      if (payload.search != null && payload.search.trim() !== '') {
        const term = `%${payload.search.trim()}%`
        where = {
          ...where,
          [Op.or]: [
            { name: { [Op.like]: term } },
            { originalPrompt: { [Op.like]: term } }
          ]
        }
      }

      const result = await RuleModel.findAndCountAll({
        where,
        include: ruleInclude,
        distinct: true,
        order: [['ruleId', 'DESC']],
        ...(payload.pagination && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData({
        count: result.count,
        rows: result.rows.map((r) => serializeRule(r))
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[RuleManagementService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to list rules', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async setActive(ruleId: number, isActive: boolean) {
    try {
      const rule = await RuleModel.findOne({ where: { deleted: 0, ruleId } })
      if (rule == null) throw AppError.notFound('Rule not found')
      await rule.update({ isActive })
      await this.refreshCache()
      return await this.findById(ruleId)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[RuleManagementService] setActive failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to update rule active state',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async remove(ruleId: number) {
    try {
      const rule = await RuleModel.findOne({ where: { deleted: 0, ruleId } })
      if (rule == null) throw AppError.notFound('Rule not found')

      await sequelizeInit.transaction(async (tx) => {
        await RuleTriggerModel.update(
          { deleted: true },
          { where: { ruleId }, transaction: tx }
        )
        await RuleConditionModel.update(
          { deleted: true },
          { where: { ruleId }, transaction: tx }
        )
        await RuleActionModel.update(
          { deleted: true },
          { where: { ruleId }, transaction: tx }
        )
        await rule.update({ deleted: true, isActive: false }, { transaction: tx })
        await rule.destroy({ transaction: tx })
      })

      await this.refreshCache()
      return { ruleId, deleted: true }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[RuleManagementService] remove failed: ${String(serviceError)}`)
      throw new AppError('Failed to delete rule', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async update(payload: IUpdateRule) {
    try {
      const existing = await this.findById(payload.ruleId)

      const next: ICreateRule = {
        name: payload.name ?? existing.name,
        originalPrompt: payload.originalPrompt ?? existing.originalPrompt,
        conditionLogic: payload.conditionLogic ?? existing.conditionLogic,
        cooldownSec: payload.cooldownSec ?? existing.cooldownSec,
        isActive: payload.isActive ?? existing.isActive,
        trigger: payload.trigger ?? {
          deviceName: existing.trigger.deviceName,
          metric: existing.trigger.metric
        },
        conditions:
          payload.conditions ??
          existing.conditions.map((c) => ({
            deviceName: c.deviceName,
            metric: c.metric,
            operator: c.operator,
            threshold: c.threshold,
            unit: c.unit ?? undefined
          })),
        actions:
          payload.actions ??
          existing.actions.map((a) => ({
            deviceName: a.deviceName,
            state: a.state
          }))
      }

      const triggerDevice = await this.resolveDeviceByName(next.trigger.deviceName)
      this.assertTriggerDevice(triggerDevice)

      await sequelizeInit.transaction(async (tx) => {
        await RuleModel.update(
          {
            name: next.name,
            originalPrompt: next.originalPrompt,
            conditionLogic: next.conditionLogic,
            cooldownSec: next.cooldownSec,
            isActive: next.isActive
          },
          { where: { ruleId: payload.ruleId }, transaction: tx }
        )

        await RuleTriggerModel.destroy({
          where: { ruleId: payload.ruleId },
          force: true,
          transaction: tx
        })
        await RuleConditionModel.destroy({
          where: { ruleId: payload.ruleId },
          force: true,
          transaction: tx
        })
        await RuleActionModel.destroy({
          where: { ruleId: payload.ruleId },
          force: true,
          transaction: tx
        })

        await RuleTriggerModel.create(
          {
            ruleId: payload.ruleId,
            deviceId: triggerDevice.deviceId,
            metric: next.trigger.metric.trim().toLowerCase(),
            eventType: 'telemetry',
            deleted: false
          },
          { transaction: tx }
        )

        for (const condition of next.conditions) {
          const name = condition.deviceName ?? next.trigger.deviceName
          const device = await this.resolveDeviceByName(name)
          await RuleConditionModel.create(
            {
              ruleId: payload.ruleId,
              deviceId: device.deviceId,
              metric: condition.metric.trim().toLowerCase(),
              operator: condition.operator,
              threshold: condition.threshold,
              unit: condition.unit ?? null,
              deleted: false
            },
            { transaction: tx }
          )
        }

        for (const action of next.actions) {
          const device = await this.resolveDeviceByName(action.deviceName)
          this.assertActionDevice(device)
          await RuleActionModel.create(
            {
              ruleId: payload.ruleId,
              deviceId: device.deviceId,
              actionType: 'set_state',
              state: action.state,
              deleted: false
            },
            { transaction: tx }
          )
        }
      })

      await this.refreshCache()
      return await this.findById(payload.ruleId)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[RuleManagementService] update failed: ${String(serviceError)}`)
      throw new AppError('Failed to update rule', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async listExecutionLogs(payload: IFindRuleExecutionLogs) {
    try {
      const pager = new Pagination(payload.page, payload.size)
      const where: WhereOptions = { deleted: 0 }
      if (payload.ruleId != null) {
        where.ruleId = payload.ruleId
      }

      const result = await RuleExecutionLogModel.findAndCountAll({
        where,
        order: [['ruleExecutionLogId', 'DESC']],
        limit: pager.limit,
        offset: pager.offset
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(
        `[RuleManagementService] listExecutionLogs failed: ${String(serviceError)}`
      )
      throw new AppError(
        'Failed to list rule execution logs',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
