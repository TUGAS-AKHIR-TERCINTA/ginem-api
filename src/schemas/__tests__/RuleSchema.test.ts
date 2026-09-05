import { createRuleSchema, findAllRulesSchema } from '../../schemas/RuleSchema'

describe('RuleSchema', () => {
  it('accepts a valid create payload', () => {
    const parsed = createRuleSchema.parse({
      originalPrompt: 'hidupkan kipas jika suhu > 25',
      trigger: { deviceName: 'Temp Sensor', metric: 'temperature' },
      conditions: [{ metric: 'temperature', operator: '>', threshold: 25, unit: 'C' }],
      actions: [{ deviceName: 'Fan Relay', state: 'on' }]
    })

    expect(parsed.conditionLogic).toBe('AND')
    expect(parsed.cooldownSec).toBe(60)
    expect(parsed.isActive).toBe(true)
    expect(parsed.actions[0].state).toBe('on')
  })

  it('rejects empty actions', () => {
    expect(() =>
      createRuleSchema.parse({
        originalPrompt: 'x',
        trigger: { deviceName: 'A', metric: 'temperature' },
        conditions: [{ metric: 'temperature', operator: '>', threshold: 1 }],
        actions: []
      })
    ).toThrow()
  })

  it('parses findAll query defaults', () => {
    const parsed = findAllRulesSchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.size).toBe(20)
    expect(parsed.pagination).toBe(true)
  })
})
