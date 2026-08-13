import { RuleCache, type CachedRule } from '../RuleCache.service'
import { evaluateOperator, isInCooldown, RuleEngine } from '../RuleEngine.service'

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('../../../models/RuleModel', () => ({
  RuleModel: { update: jest.fn().mockResolvedValue([1]) }
}))

jest.mock('../../../models/RuleExecutionLogModel', () => ({
  RuleExecutionLogModel: { create: jest.fn().mockResolvedValue({}) }
}))

jest.mock('../../../models/DeviceLogModel', () => ({
  DeviceLogModel: { findOne: jest.fn().mockResolvedValue(null) }
}))

jest.mock('../../mqtt/MQTT.service', () => ({
  MQTTService: {
    publishActuatorState: jest.fn(),
    getLastDeviceState: jest.fn().mockReturnValue(null)
  }
}))

const { MQTTService } = jest.requireMock('../../mqtt/MQTT.service')
const { RuleExecutionLogModel } = jest.requireMock(
  '../../../models/RuleExecutionLogModel'
)

function sampleRule(overrides: Partial<CachedRule> = {}): CachedRule {
  return {
    ruleId: 1,
    name: 'Fan on hot',
    originalPrompt: 'hidupkan kipas jika suhu > 25',
    conditionLogic: 'AND',
    isActive: true,
    cooldownSec: 60,
    lastTriggeredAt: null,
    trigger: {
      deviceId: 10,
      deviceName: 'Temp Sensor',
      metric: 'temperature',
      eventType: 'telemetry'
    },
    conditions: [
      {
        deviceId: 10,
        deviceName: 'Temp Sensor',
        metric: 'temperature',
        operator: '>',
        threshold: 25,
        unit: 'C'
      }
    ],
    actions: [
      {
        deviceId: 20,
        deviceName: 'Fan Relay',
        actionType: 'set_state',
        state: 'on'
      }
    ],
    ...overrides
  }
}

describe('evaluateOperator', () => {
  it('compares correctly', () => {
    expect(evaluateOperator(28, '>', 25)).toBe(true)
    expect(evaluateOperator(25, '>', 25)).toBe(false)
    expect(evaluateOperator(25, '>=', 25)).toBe(true)
    expect(evaluateOperator(20, '<', 25)).toBe(true)
    expect(evaluateOperator(25, '==', 25)).toBe(true)
    expect(evaluateOperator(24, '!=', 25)).toBe(true)
  })
})

describe('isInCooldown', () => {
  it('returns false when never triggered', () => {
    expect(isInCooldown(sampleRule(), new Date())).toBe(false)
  })

  it('returns true within cooldown window', () => {
    const now = new Date('2026-08-13T12:00:00Z')
    const rule = sampleRule({
      lastTriggeredAt: new Date('2026-08-13T11:59:30Z'),
      cooldownSec: 60
    })
    expect(isInCooldown(rule, now)).toBe(true)
  })
})

describe('RuleCache', () => {
  afterEach(() => {
    RuleCache.clear()
  })

  it('filters active rules by trigger device', () => {
    RuleCache.setRules([
      sampleRule({ ruleId: 1 }),
      sampleRule({
        ruleId: 2,
        isActive: false,
        trigger: {
          deviceId: 10,
          deviceName: 'Temp Sensor',
          metric: 'temperature',
          eventType: 'telemetry'
        }
      }),
      sampleRule({
        ruleId: 3,
        trigger: {
          deviceId: 99,
          deviceName: 'Other',
          metric: 'humidity',
          eventType: 'telemetry'
        }
      })
    ])

    expect(RuleCache.findByTriggerDevice(10).map((r) => r.ruleId)).toEqual([1])
  })
})

describe('RuleEngine.evaluate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    RuleCache.clear()
  })

  afterEach(() => {
    RuleCache.clear()
  })

  it('publishes actuator command when condition passes', async () => {
    RuleCache.setRules([sampleRule()])

    await RuleEngine.evaluate({
      deviceId: 10,
      metrics: { temperature: 28 },
      receivedAt: new Date()
    })

    expect(MQTTService.publishActuatorState).toHaveBeenCalledWith(20, 'on')
    expect(RuleExecutionLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ ruleId: 1, success: true })
    )
  })

  it('does not publish when condition fails', async () => {
    RuleCache.setRules([sampleRule()])

    await RuleEngine.evaluate({
      deviceId: 10,
      metrics: { temperature: 20 },
      receivedAt: new Date()
    })

    expect(MQTTService.publishActuatorState).not.toHaveBeenCalled()
    expect(RuleExecutionLogModel.create).not.toHaveBeenCalled()
  })

  it('uses bare value fallback for single-metric sensors', async () => {
    RuleCache.setRules([sampleRule()])

    await RuleEngine.evaluate({
      deviceId: 10,
      metrics: { value: 30 },
      receivedAt: new Date()
    })

    expect(MQTTService.publishActuatorState).toHaveBeenCalledWith(20, 'on')
  })

  it('skips when in cooldown', async () => {
    RuleCache.setRules([
      sampleRule({
        lastTriggeredAt: new Date(),
        cooldownSec: 120
      })
    ])

    await RuleEngine.evaluate({
      deviceId: 10,
      metrics: { temperature: 40 },
      receivedAt: new Date()
    })

    expect(MQTTService.publishActuatorState).not.toHaveBeenCalled()
  })
})
