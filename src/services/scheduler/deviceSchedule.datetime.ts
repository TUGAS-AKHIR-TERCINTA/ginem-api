import { AppError } from '../../utilities/AppError'

/** WIB (UTC+7), aligned with DB timezone in appConfig. */
const SCHEDULE_TIMEZONE = '+07:00'

export interface ScheduleDateTimeInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * Build an absolute run time from calendar parts (year, month, day, hour, minute) in WIB.
 * @throws AppError when the datetime is invalid or not in the future.
 */
export function parseScheduleDateTime(input: ScheduleDateTimeInput): Date {
  const { year, month, day, hour, minute } = input

  if (month < 1 || month > 12) {
    throw AppError.badRequest('Month must be between 1 and 12')
  }
  if (day < 1 || day > 31) {
    throw AppError.badRequest('Day must be between 1 and 31')
  }
  if (hour < 0 || hour > 23) {
    throw AppError.badRequest('Hour must be between 0 and 23')
  }
  if (minute < 0 || minute > 59) {
    throw AppError.badRequest('Minute must be between 0 and 59')
  }

  const iso = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00${SCHEDULE_TIMEZONE}`
  const runAt = new Date(iso)

  if (Number.isNaN(runAt.getTime())) {
    throw AppError.badRequest('Invalid schedule date/time')
  }

  if (runAt.getTime() <= Date.now()) {
    throw AppError.badRequest('Schedule time must be in the future (WIB / UTC+7)')
  }

  return runAt
}

export function minutesUntilRun(scheduledAt: Date, runAt: Date): number {
  return Math.max(1, Math.round((runAt.getTime() - scheduledAt.getTime()) / 60_000))
}
