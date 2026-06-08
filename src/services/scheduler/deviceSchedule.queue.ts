import { Queue } from 'bullmq'
import logger from '../../utilities/logger'
import type { SchedulerCategory } from '../../models/SchedulerLogModel'
import {
  DEVICE_SCHEDULE_QUEUE_NAME,
  getBullMqConnection
} from './deviceSchedule.connection'
import { WIB_SCHEDULE_TIMEZONE } from './deviceSchedule.datetime'

export type DeviceScheduleJobData = {
  jobId: string
  type: 'actuator' | 'sensor_data'
  category: SchedulerCategory
  deviceName: string
  state?: 'on' | 'off'
}

let queue: Queue<DeviceScheduleJobData> | null = null

export function getDeviceScheduleQueue(): Queue<DeviceScheduleJobData> {
  if (queue == null) {
    queue = new Queue<DeviceScheduleJobData>(DEVICE_SCHEDULE_QUEUE_NAME, {
      connection: getBullMqConnection()
    })
  }
  return queue
}

export async function enqueueDeviceScheduleJob(
  data: DeviceScheduleJobData,
  runAt: Date
): Promise<void> {
  const delayMs = Math.max(0, runAt.getTime() - Date.now())
  const q = getDeviceScheduleQueue()

  const existing = await q.getJob(data.jobId)
  if (existing != null) {
    const state = await existing.getState()
    const isOverdue = delayMs === 0 && (state === 'delayed' || state === 'waiting')

    if (isOverdue) {
      await existing.remove()
      logger.warn(
        `[DeviceScheduleQueue] Removed overdue job ${data.jobId} (was ${state}), re-enqueueing`
      )
    } else {
      logger.warn(
        `[DeviceScheduleQueue] Job ${data.jobId} already enqueued (${state}), skipping`
      )
      return
    }
  }

  await q.add(data.type, data, {
    jobId: data.jobId,
    delay: delayMs,
    removeOnComplete: true,
    removeOnFail: { age: 7 * 24 * 3600 }
  })

  logger.info(
    `[DeviceScheduleQueue] Enqueued once ${data.type} job ${data.jobId} for ${data.deviceName} at ${runAt.toISOString()} (delay ${delayMs}ms)`
  )
}

function isRepeatJobRegistered(
  repeatables: Awaited<ReturnType<Queue<DeviceScheduleJobData>['getRepeatableJobs']>>,
  jobId: string
): boolean {
  return repeatables.some((entry) => entry.id === jobId || entry.key.includes(jobId))
}

export async function enqueueRepeatDeviceScheduleJob(
  data: DeviceScheduleJobData,
  cronPattern: string,
  timezone: string = WIB_SCHEDULE_TIMEZONE
): Promise<void> {
  const q = getDeviceScheduleQueue()
  const repeatables = await q.getRepeatableJobs()
  const alreadyScheduled = isRepeatJobRegistered(repeatables, data.jobId)

  if (alreadyScheduled) {
    logger.warn(
      `[DeviceScheduleQueue] Repeat job ${data.jobId} already registered, skipping`
    )
    return
  }

  await q.add(data.type, data, {
    repeat: {
      jobId: data.jobId,
      pattern: cronPattern,
      tz: timezone
    },
    removeOnComplete: true,
    removeOnFail: { age: 7 * 24 * 3600 }
  })

  logger.info(
    `[DeviceScheduleQueue] Registered repeat ${data.type} job ${data.jobId} for ${data.deviceName} (${cronPattern}, ${timezone})`
  )
}

export async function listRepeatableDeviceScheduleJobs() {
  const q = getDeviceScheduleQueue()
  return q.getRepeatableJobs()
}
