import type { ChatToolCallTrace } from '../../src/services/chat/Chat.service'
import type { ExpectedSchedule } from '../datasets/dataset.schema'
import { semanticEqual } from './valueNormalizer'

export interface ScheduleComparisonResult {
  scheduleCorrect: boolean
  expectedCount: number
  matchedCount: number
  unmatched: ExpectedSchedule[]
}

const SCHEDULE_TOOLS = new Set(['schedule_actuator_state_at', 'schedule_sensor_data_at'])

function toActualSchedule(call: ChatToolCallTrace): ExpectedSchedule | null {
  if (!SCHEDULE_TOOLS.has(call.name)) return null
  const args = call.args
  if (typeof args.deviceName !== 'string') return null
  if (typeof args.hour !== 'number' && typeof args.hour !== 'string') return null
  if (typeof args.minute !== 'number' && typeof args.minute !== 'string') return null
  const category = args.category === 'repeat' ? 'repeat' : 'once'

  return {
    deviceName: args.deviceName,
    action: args.state === 'on' || args.state === 'off' ? args.state : undefined,
    category,
    hour: Number(args.hour),
    minute: Number(args.minute),
    timezone: 'Asia/Jakarta'
  }
}

/**
 * Section 11 (Schedule Accuracy): compares device/action/time/recurrence/timezone
 * for every expected schedule entry, independent of tool/parameter accuracy above —
 * a schedule can only be "correct" if the underlying tool+parameter match already
 * held, but this gives a schedule-specific pass/fail for Tabel 4.4.
 */
export function compareSchedule(
  expectedSchedules: ExpectedSchedule[] | undefined,
  actualToolCalls: ChatToolCallTrace[]
): ScheduleComparisonResult {
  const expected = expectedSchedules ?? []
  if (expected.length === 0) {
    return { scheduleCorrect: true, expectedCount: 0, matchedCount: 0, unmatched: [] }
  }

  const actualSchedules = actualToolCalls
    .map(toActualSchedule)
    .filter((s): s is ExpectedSchedule => s != null)

  const remaining = [...actualSchedules]
  const unmatched: ExpectedSchedule[] = []

  for (const expectedEntry of expected) {
    const matchIndex = remaining.findIndex((actual) =>
      semanticEqual(expectedEntry, actual)
    )
    if (matchIndex === -1) {
      unmatched.push(expectedEntry)
      continue
    }
    remaining.splice(matchIndex, 1)
  }

  return {
    scheduleCorrect: unmatched.length === 0,
    expectedCount: expected.length,
    matchedCount: expected.length - unmatched.length,
    unmatched
  }
}
