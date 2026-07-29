import { AppError } from '../../../utilities/AppError'
import {
  buildDailyCronPattern,
  formatRepeatScheduleWib,
  formatScheduleWib,
  getWibDateParts,
  minutesUntilRun,
  parseDateString,
  resolveNextDailyRun,
  resolveScheduleDateTime
} from '../deviceSchedule.datetime'

describe('deviceSchedule.datetime', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-10T10:00:00+07:00'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('parseDateString', () => {
    it('parses ISO date format', () => {
      expect(parseDateString('2026-06-15')).toEqual({
        year: 2026,
        month: 6,
        day: 15
      })
    })

    it('parses DD-MM-YYYY date format', () => {
      expect(parseDateString('09-06-2026')).toEqual({
        year: 2026,
        month: 6,
        day: 9
      })
    })

    it('throws for invalid date format', () => {
      expect(() => parseDateString('10/06/26')).toThrow(AppError)
    })
  })

  describe('resolveScheduleDateTime', () => {
    it('schedules time-only input for later today', () => {
      const resolved = resolveScheduleDateTime({ hour: 18, minute: 30 })

      expect(resolved.timeOnly).toBe(true)
      expect(resolved.hour).toBe(18)
      expect(resolved.minute).toBe(30)
      expect(resolved.runAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('rolls time-only input to tomorrow when time already passed', () => {
      const resolved = resolveScheduleDateTime({ hour: 8, minute: 0 })

      expect(resolved.timeOnly).toBe(true)
      expect(resolved.day).toBe(11)
    })

    it('accepts explicit future date', () => {
      const resolved = resolveScheduleDateTime({
        date: '15-06-2026',
        hour: 9,
        minute: 15
      })

      expect(resolved.timeOnly).toBe(false)
      expect(resolved.day).toBe(15)
      expect(resolved.month).toBe(6)
    })

    it('rejects schedule time in the past for explicit date', () => {
      expect(() =>
        resolveScheduleDateTime({
          date: '09-06-2026',
          hour: 8,
          minute: 0
        })
      ).toThrow(AppError)
    })
  })

  describe('resolveNextDailyRun', () => {
    it('returns next daily occurrence in WIB', () => {
      const resolved = resolveNextDailyRun(7, 0)

      expect(resolved.hour).toBe(7)
      expect(resolved.minute).toBe(0)
      expect(resolved.runAt.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('formatting helpers', () => {
    it('formats schedule datetime in WIB label', () => {
      expect(
        formatScheduleWib({
          year: 2026,
          month: 6,
          day: 10,
          hour: 18,
          minute: 5
        })
      ).toBe('10-06-2026 18:05 WIB')
    })

    it('formats repeat schedule label', () => {
      expect(formatRepeatScheduleWib(23, 0)).toBe('Every day at 23:00 WIB')
    })

    it('builds daily cron pattern', () => {
      expect(buildDailyCronPattern(6, 30)).toBe('30 6 * * *')
    })

    it('calculates minutes until run with minimum of one minute', () => {
      const scheduledAt = new Date('2026-06-10T10:00:00+07:00')
      const runAt = new Date('2026-06-10T10:00:30+07:00')

      expect(minutesUntilRun(scheduledAt, runAt)).toBe(1)
    })
  })

  describe('getWibDateParts', () => {
    it('returns WIB calendar parts for a given date', () => {
      expect(getWibDateParts(new Date('2026-06-10T10:00:00+07:00'))).toEqual({
        year: 2026,
        month: 6,
        day: 10
      })
    })
  })
})
