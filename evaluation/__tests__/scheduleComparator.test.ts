import { compareSchedule } from '../metrics/scheduleComparator'

describe('compareSchedule', () => {
  it('is trivially correct when the case has no schedule expectation', () => {
    expect(compareSchedule(undefined, [])).toMatchObject({
      scheduleCorrect: true,
      expectedCount: 0
    })
  })

  it('matches device/action/category/hour/minute against a schedule tool call', () => {
    const result = compareSchedule(
      [
        {
          deviceName: 'Smart Lamp Bedroom',
          action: 'on',
          category: 'repeat',
          hour: 18,
          minute: 0,
          timezone: 'Asia/Jakarta'
        }
      ],
      [
        {
          name: 'schedule_actuator_state_at',
          args: {
            deviceName: 'Smart Lamp Bedroom',
            state: 'on',
            category: 'repeat',
            hour: 18,
            minute: 0
          }
        }
      ]
    )

    expect(result.scheduleCorrect).toBe(true)
  })

  it('fails when the actual hour differs from ground truth', () => {
    const result = compareSchedule(
      [
        {
          deviceName: 'Smart Lamp Bedroom',
          action: 'on',
          category: 'once',
          hour: 18,
          minute: 0,
          timezone: 'Asia/Jakarta'
        }
      ],
      [
        {
          name: 'schedule_actuator_state_at',
          args: {
            deviceName: 'Smart Lamp Bedroom',
            state: 'on',
            category: 'once',
            hour: 19,
            minute: 0
          }
        }
      ]
    )

    expect(result.scheduleCorrect).toBe(false)
    expect(result.unmatched).toHaveLength(1)
  })

  it('matches two independent schedule entries (daily on + daily off)', () => {
    const result = compareSchedule(
      [
        {
          deviceName: 'Smart Lamp Bedroom',
          action: 'on',
          category: 'repeat',
          hour: 18,
          minute: 0,
          timezone: 'Asia/Jakarta'
        },
        {
          deviceName: 'Smart Lamp Bedroom',
          action: 'off',
          category: 'repeat',
          hour: 6,
          minute: 0,
          timezone: 'Asia/Jakarta'
        }
      ],
      [
        {
          name: 'schedule_actuator_state_at',
          args: {
            deviceName: 'Smart Lamp Bedroom',
            state: 'on',
            category: 'repeat',
            hour: 18,
            minute: 0
          }
        },
        {
          name: 'schedule_actuator_state_at',
          args: {
            deviceName: 'Smart Lamp Bedroom',
            state: 'off',
            category: 'repeat',
            hour: 6,
            minute: 0
          }
        }
      ]
    )

    expect(result.scheduleCorrect).toBe(true)
    expect(result.matchedCount).toBe(2)
  })

  it('ignores non-schedule tool calls when matching', () => {
    const result = compareSchedule(
      [
        {
          deviceName: 'Smart Lamp Bedroom',
          action: 'on',
          category: 'once',
          hour: 18,
          minute: 0,
          timezone: 'Asia/Jakarta'
        }
      ],
      [
        { name: 'list_devices', args: {} },
        {
          name: 'schedule_actuator_state_at',
          args: {
            deviceName: 'Smart Lamp Bedroom',
            state: 'on',
            category: 'once',
            hour: 18,
            minute: 0
          }
        }
      ]
    )

    expect(result.scheduleCorrect).toBe(true)
  })
})
