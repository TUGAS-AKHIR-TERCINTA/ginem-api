import { AppError } from '../../utilities/AppError'

/** WIB (UTC+7), aligned with DB timezone in appConfig. */
const SCHEDULE_TIMEZONE = '+07:00'
const WIB_TIMEZONE = 'Asia/Jakarta'

export interface ScheduleDateTimeInput {
  hour: number
  minute: number
  /** Omit for today (WIB). */
  year?: number
  month?: number
  day?: number
  /**
   * Alternative to year/month/day.
   * Accepts DD-MM-YYYY (e.g. "09-06-2026") or YYYY-MM-DD.
   */
  date?: string
}

export interface ResolvedScheduleDateTime {
  runAt: Date
  year: number
  month: number
  day: number
  hour: number
  minute: number
  /** True when no explicit date was given (defaults to today, or tomorrow if time passed). */
  timeOnly: boolean
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export function getWibDateParts(from: Date = new Date()): {
  year: number
  month: number
  day: number
} {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: WIB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(from)

  const [year, month, day] = formatted.split('-').map(Number)
  return { year, month, day }
}

export function parseDateString(date: string): {
  year: number
  month: number
  day: number
} {
  const trimmed = date.trim()

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch != null) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3])
    }
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch != null) {
    return {
      year: Number(dmyMatch[3]),
      month: Number(dmyMatch[2]),
      day: Number(dmyMatch[1])
    }
  }

  throw AppError.badRequest(
    'Invalid date format. Use DD-MM-YYYY (e.g. "09-06-2026") or YYYY-MM-DD'
  )
}

function validateTimeParts(hour: number, minute: number): void {
  if (hour < 0 || hour > 23) {
    throw AppError.badRequest('Hour must be between 0 and 23')
  }
  if (minute < 0 || minute > 59) {
    throw AppError.badRequest('Minute must be between 0 and 59')
  }
}

function validateDateParts(month: number, day: number): void {
  if (month < 1 || month > 12) {
    throw AppError.badRequest('Month must be between 1 and 12')
  }
  if (day < 1 || day > 31) {
    throw AppError.badRequest('Day must be between 1 and 31')
  }
}

function buildRunAt(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  validateDateParts(month, day)

  const iso = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00${SCHEDULE_TIMEZONE}`
  const runAt = new Date(iso)

  if (Number.isNaN(runAt.getTime())) {
    throw AppError.badRequest('Invalid schedule date/time')
  }

  return runAt
}

function addDaysWib(
  parts: { year: number; month: number; day: number },
  days: number
): { year: number; month: number; day: number } {
  const anchor = new Date(
    `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}T12:00:00${SCHEDULE_TIMEZONE}`
  )
  const shifted = new Date(anchor.getTime() + days * 86_400_000)
  return getWibDateParts(shifted)
}

function hasExplicitDate(input: ScheduleDateTimeInput): boolean {
  return (
    input.date != null || input.year != null || input.month != null || input.day != null
  )
}

function resolveDateParts(input: ScheduleDateTimeInput): {
  year: number
  month: number
  day: number
  timeOnly: boolean
} {
  if (input.date != null) {
    const parsed = parseDateString(input.date)
    return { ...parsed, timeOnly: false }
  }

  const hasPartialDate = input.year != null || input.month != null || input.day != null

  if (hasPartialDate) {
    if (input.year == null || input.month == null || input.day == null) {
      throw AppError.badRequest(
        'Provide a full date (year, month, day) or use date "DD-MM-YYYY"'
      )
    }
    return { year: input.year, month: input.month, day: input.day, timeOnly: false }
  }

  const today = getWibDateParts()
  return { ...today, timeOnly: true }
}

/**
 * Resolve schedule datetime in WIB.
 * - Time only (hour + minute): today at that time; if already passed, tomorrow.
 * - Explicit date: DD-MM-YYYY / YYYY-MM-DD or year+month+day at given time.
 */
export function resolveScheduleDateTime(
  input: ScheduleDateTimeInput
): ResolvedScheduleDateTime {
  validateTimeParts(input.hour, input.minute)

  const { year, month, day, timeOnly } = resolveDateParts(input)
  let runYear = year
  let runMonth = month
  let runDay = day

  let runAt = buildRunAt(runYear, runMonth, runDay, input.hour, input.minute)

  if (timeOnly && runAt.getTime() <= Date.now()) {
    const tomorrow = addDaysWib({ year, month, day }, 1)
    runYear = tomorrow.year
    runMonth = tomorrow.month
    runDay = tomorrow.day
    runAt = buildRunAt(runYear, runMonth, runDay, input.hour, input.minute)
  }

  if (runAt.getTime() <= Date.now()) {
    throw AppError.badRequest('Schedule time must be in the future (WIB / UTC+7)')
  }

  return {
    runAt,
    year: runYear,
    month: runMonth,
    day: runDay,
    hour: input.hour,
    minute: input.minute,
    timeOnly
  }
}

/** @deprecated Use resolveScheduleDateTime */
export function parseScheduleDateTime(input: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}): Date {
  return resolveScheduleDateTime(input).runAt
}

export function formatScheduleWib(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}): string {
  return `${pad2(parts.day)}-${pad2(parts.month)}-${parts.year} ${pad2(parts.hour)}:${pad2(parts.minute)} WIB`
}

export function minutesUntilRun(scheduledAt: Date, runAt: Date): number {
  return Math.max(1, Math.round((runAt.getTime() - scheduledAt.getTime()) / 60_000))
}

/** Daily cron in WIB: runs every day at hour:minute. */
export function buildDailyCronPattern(hour: number, minute: number): string {
  validateTimeParts(hour, minute)
  return `${minute} ${hour} * * *`
}

/** Next daily occurrence from now in WIB (today or tomorrow). */
export function resolveNextDailyRun(
  hour: number,
  minute: number
): ResolvedScheduleDateTime {
  validateTimeParts(hour, minute)

  const today = getWibDateParts()
  let runYear = today.year
  let runMonth = today.month
  let runDay = today.day

  let runAt = buildRunAt(runYear, runMonth, runDay, hour, minute)

  if (runAt.getTime() <= Date.now()) {
    const tomorrow = addDaysWib(today, 1)
    runYear = tomorrow.year
    runMonth = tomorrow.month
    runDay = tomorrow.day
    runAt = buildRunAt(runYear, runMonth, runDay, hour, minute)
  }

  return {
    runAt,
    year: runYear,
    month: runMonth,
    day: runDay,
    hour,
    minute,
    timeOnly: false
  }
}

export function formatRepeatScheduleWib(hour: number, minute: number): string {
  return `Every day at ${pad2(hour)}:${pad2(minute)} WIB`
}

export const WIB_SCHEDULE_TIMEZONE = WIB_TIMEZONE
