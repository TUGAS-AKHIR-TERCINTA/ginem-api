import { MQTTService } from '../../src/services/mqtt/MQTT.service'
import { DeviceLogService } from '../../src/services/device'
import type * as DeviceScheduleServiceType from '../../src/services/mcp/DeviceSchedule.service'

type ScheduledJob = DeviceScheduleServiceType.ScheduledJob

/**
 * `import * as X` compiles through TypeScript's `__importStar` helper, which wraps
 * the module in a read-only getter-backed copy to emulate ES module namespace
 * semantics — so its properties can't be reassigned even though this repo compiles
 * to CommonJS. `require()` returns the module's raw (mutable) exports object instead,
 * which is exactly what src/services/mcp/tools/**'s named imports read from at each
 * call site, so patching it here is what actually redirects those tools.
 */
const mutableSchedule =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../src/services/mcp/DeviceSchedule.service') as typeof DeviceScheduleServiceType

/**
 * Swaps out exactly the side-effecting calls the device tools make (MQTT publish,
 * device-log writes, scheduler persistence) for in-memory no-ops, WITHOUT touching
 * src/services/mcp/tools/**. Every other call the tools make — DeviceService.findByName,
 * Zod schema validation, RuleManagementService.create — runs for real against the
 * configured database, because those are exactly the decisions BAB 4.3 evaluates
 * (does the LLM resolve the right device? build a valid rule?).
 *
 * RuleManagementService writes are deliberately left real (see evaluation/README.md):
 * a rule row has no physical effect (it only fires later from live MQTT telemetry,
 * which this runner never sends), and faking its 4-table transaction would duplicate
 * production logic. Run evaluation against a disposable database, not production.
 */

export interface DryRunSideEffects {
  mqttPublishes: Array<{ deviceId: number; state: 'on' | 'off' }>
  deviceLogsCreated: Array<{ deviceLogDeviceId: number; deviceLogData: string }>
  schedulesCreated: Array<{
    deviceName: string
    type: 'actuator' | 'sensor_data'
    category: 'once' | 'repeat'
  }>
}

function emptySideEffects(): DryRunSideEffects {
  return { mqttPublishes: [], deviceLogsCreated: [], schedulesCreated: [] }
}

let active = false
let sideEffects = emptySideEffects()
let jobCounter = 0

const originals = {
  publishActuatorState: MQTTService.publishActuatorState.bind(MQTTService),
  deviceLogCreate: DeviceLogService.create.bind(DeviceLogService),
  scheduleActuatorState: mutableSchedule.scheduleActuatorState,
  scheduleActuatorStateRepeat: mutableSchedule.scheduleActuatorStateRepeat,
  scheduleSensorData: mutableSchedule.scheduleSensorData,
  scheduleSensorDataRepeat: mutableSchedule.scheduleSensorDataRepeat
}

function nextJobId(): string {
  jobCounter += 1
  return `dryrun-${Date.now()}-${jobCounter}`
}

export function enableDryRun(): void {
  if (active) return
  active = true
  sideEffects = emptySideEffects()

  MQTTService.publishActuatorState = (deviceId: number, state: 'on' | 'off'): void => {
    sideEffects.mqttPublishes.push({ deviceId, state })
  }

  DeviceLogService.create = (async (payload: {
    deviceLogDeviceId: number
    deviceLogData: string
  }) => {
    sideEffects.deviceLogsCreated.push(payload)
    return {
      deviceLogId: -sideEffects.deviceLogsCreated.length,
      deviceLogDeviceId: payload.deviceLogDeviceId,
      deviceLogData: payload.deviceLogData,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: 0,
      deletedAt: null
    }
  }) as unknown as typeof DeviceLogService.create

  mutableSchedule.scheduleActuatorState = (async (
    deviceName: string,
    state: 'on' | 'off',
    category: 'once' | 'repeat',
    runAt: Date,
    cronPattern?: string
  ): Promise<ScheduledJob> => {
    sideEffects.schedulesCreated.push({ deviceName, type: 'actuator', category })
    return {
      id: nextJobId(),
      type: 'actuator',
      category,
      deviceName,
      state,
      scheduledAt: new Date(),
      runAt,
      cronPattern,
      timezone: 'Asia/Jakarta',
      status: category === 'repeat' ? 'active' : 'pending'
    }
  }) as typeof DeviceScheduleServiceType.scheduleActuatorState

  mutableSchedule.scheduleActuatorStateRepeat = (async (
    deviceName: string,
    state: 'on' | 'off',
    hour: number,
    minute: number
  ): Promise<ScheduledJob> => {
    sideEffects.schedulesCreated.push({
      deviceName,
      type: 'actuator',
      category: 'repeat'
    })
    return {
      id: nextJobId(),
      type: 'actuator',
      category: 'repeat',
      deviceName,
      state,
      scheduledAt: new Date(),
      runAt: new Date(),
      cronPattern: `${minute} ${hour} * * *`,
      timezone: 'Asia/Jakarta',
      status: 'active'
    }
  }) as typeof DeviceScheduleServiceType.scheduleActuatorStateRepeat

  mutableSchedule.scheduleSensorData = (async (
    deviceName: string,
    category: 'once' | 'repeat',
    runAt: Date,
    cronPattern?: string
  ): Promise<ScheduledJob> => {
    sideEffects.schedulesCreated.push({ deviceName, type: 'sensor_data', category })
    return {
      id: nextJobId(),
      type: 'sensor_data',
      category,
      deviceName,
      scheduledAt: new Date(),
      runAt,
      cronPattern,
      timezone: 'Asia/Jakarta',
      status: category === 'repeat' ? 'active' : 'pending'
    }
  }) as typeof DeviceScheduleServiceType.scheduleSensorData

  mutableSchedule.scheduleSensorDataRepeat = (async (
    deviceName: string,
    hour: number,
    minute: number
  ): Promise<ScheduledJob> => {
    sideEffects.schedulesCreated.push({
      deviceName,
      type: 'sensor_data',
      category: 'repeat'
    })
    return {
      id: nextJobId(),
      type: 'sensor_data',
      category: 'repeat',
      deviceName,
      scheduledAt: new Date(),
      runAt: new Date(),
      cronPattern: `${minute} ${hour} * * *`,
      timezone: 'Asia/Jakarta',
      status: 'active'
    }
  }) as typeof DeviceScheduleServiceType.scheduleSensorDataRepeat
}

export function disableDryRun(): void {
  if (!active) return
  active = false
  MQTTService.publishActuatorState = originals.publishActuatorState
  DeviceLogService.create = originals.deviceLogCreate
  mutableSchedule.scheduleActuatorState = originals.scheduleActuatorState
  mutableSchedule.scheduleActuatorStateRepeat = originals.scheduleActuatorStateRepeat
  mutableSchedule.scheduleSensorData = originals.scheduleSensorData
  mutableSchedule.scheduleSensorDataRepeat = originals.scheduleSensorDataRepeat
}

export function isDryRunActive(): boolean {
  return active
}

export function getDryRunSideEffects(): DryRunSideEffects {
  return sideEffects
}

export function resetDryRunSideEffects(): void {
  sideEffects = emptySideEffects()
}
