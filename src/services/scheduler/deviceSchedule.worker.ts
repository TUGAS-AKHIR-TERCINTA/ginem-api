import { QueueScheduler, Worker, type Job } from 'bullmq'
import logger from '../../utilities/logger'
import {
  DEVICE_SCHEDULE_QUEUE_NAME,
  getBullMqConnection
} from './deviceSchedule.connection'
import type { DeviceScheduleJobData } from './deviceSchedule.queue'
import { executeActuatorJob, executeSensorDataJob } from './deviceSchedule.jobs'

let scheduler: QueueScheduler | null = null
let worker: Worker<DeviceScheduleJobData> | null = null

async function processDeviceScheduleJob (job: Job<DeviceScheduleJobData>): Promise<void> {
  const { type, jobId, deviceName } = job.data

  logger.info(`[DeviceScheduleWorker] Processing ${type} job ${jobId} (${deviceName})`)

  if (type === 'actuator') {
    await executeActuatorJob(job.data)
    return
  }

  if (type === 'sensor_data') {
    await executeSensorDataJob(job.data)
    return
  }

  logger.error(`[DeviceScheduleWorker] Unknown job type for ${jobId}`)
}

export function startDeviceScheduleWorker (): void {
  if (worker != null) {
    return
  }

  // BullMQ v1 requires QueueScheduler to promote delayed jobs into the waiting queue.
  scheduler = new QueueScheduler(DEVICE_SCHEDULE_QUEUE_NAME, {
    connection: getBullMqConnection()
  })

  scheduler.on('failed', (jobId, err) => {
    logger.error(`[DeviceScheduleScheduler] Job ${jobId} stalled/failed:`, err)
  })

  worker = new Worker<DeviceScheduleJobData>(
    DEVICE_SCHEDULE_QUEUE_NAME,
    processDeviceScheduleJob,
    { connection: getBullMqConnection() }
  )

  worker.on('completed', (job) => {
    logger.info(`[DeviceScheduleWorker] Completed job ${job.id}`)
  })

  worker.on('failed', (job, err) => {
    logger.error(`[DeviceScheduleWorker] Job ${job?.id ?? 'unknown'} failed:`, err)
  })

  worker.on('error', (err) => {
    logger.error('[DeviceScheduleWorker] Worker error:', err)
  })

  logger.info('[DeviceScheduleWorker] Started (with QueueScheduler for delayed jobs)')
}

export async function stopDeviceScheduleWorker (): Promise<void> {
  if (worker != null) {
    await worker.close()
    worker = null
  }
  if (scheduler != null) {
    await scheduler.close()
    scheduler = null
  }
  logger.info('[DeviceScheduleWorker] Stopped')
}
