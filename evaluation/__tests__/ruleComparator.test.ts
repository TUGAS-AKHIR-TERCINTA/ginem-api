import { compareRule } from '../metrics/ruleComparator'

const expectedRule = [
  {
    triggerDeviceName: 'Temperature Sensor Living Room',
    triggerMetric: 'temperature',
    conditions: [{ metric: 'temperature', operator: '>' as const, threshold: 30 }],
    actions: [{ deviceName: 'Smart Lamp Bedroom', state: 'on' as const }],
    conditionLogic: 'AND' as const
  }
]

describe('compareRule', () => {
  it('is trivially correct when the case has no rule expectation', () => {
    expect(compareRule(undefined, [])).toMatchObject({
      ruleCorrect: true,
      expectedCount: 0
    })
  })

  it('matches a correctly structured create_automation_rule call', () => {
    const result = compareRule(expectedRule, [
      {
        name: 'create_automation_rule',
        args: {
          trigger: {
            deviceName: 'Temperature Sensor Living Room',
            metric: 'temperature'
          },
          conditions: [{ metric: 'temperature', operator: '>', threshold: 30 }],
          actions: [{ deviceName: 'Smart Lamp Bedroom', state: 'on' }],
          conditionLogic: 'AND'
        }
      }
    ])

    expect(result.ruleCorrect).toBe(true)
  })

  it('fails when the operator differs from ground truth', () => {
    const result = compareRule(expectedRule, [
      {
        name: 'create_automation_rule',
        args: {
          trigger: {
            deviceName: 'Temperature Sensor Living Room',
            metric: 'temperature'
          },
          conditions: [{ metric: 'temperature', operator: '<', threshold: 30 }],
          actions: [{ deviceName: 'Smart Lamp Bedroom', state: 'on' }],
          conditionLogic: 'AND'
        }
      }
    ])

    expect(result.ruleCorrect).toBe(false)
  })

  it('matches multi-condition rules regardless of condition array order', () => {
    const multiCondition = [
      {
        triggerDeviceName: 'Temperature Sensor Living Room',
        triggerMetric: 'temperature',
        conditions: [
          { metric: 'temperature', operator: '>' as const, threshold: 30 },
          {
            deviceName: 'Humidity Sensor Greenhouse',
            metric: 'humidity',
            operator: '>' as const,
            threshold: 70
          }
        ],
        actions: [{ deviceName: 'Smart Lamp Bedroom', state: 'on' as const }],
        conditionLogic: 'AND' as const
      }
    ]

    const result = compareRule(multiCondition, [
      {
        name: 'create_automation_rule',
        args: {
          trigger: {
            deviceName: 'Temperature Sensor Living Room',
            metric: 'temperature'
          },
          conditions: [
            {
              deviceName: 'Humidity Sensor Greenhouse',
              metric: 'humidity',
              operator: '>',
              threshold: 70
            },
            { metric: 'temperature', operator: '>', threshold: 30 }
          ],
          actions: [{ deviceName: 'Smart Lamp Bedroom', state: 'on' }],
          conditionLogic: 'AND'
        }
      }
    ])

    expect(result.ruleCorrect).toBe(true)
  })

  it('ignores non-rule tool calls when matching', () => {
    const result = compareRule(expectedRule, [{ name: 'list_devices', args: {} }])
    expect(result.ruleCorrect).toBe(false)
    expect(result.unmatched).toHaveLength(1)
  })
})
