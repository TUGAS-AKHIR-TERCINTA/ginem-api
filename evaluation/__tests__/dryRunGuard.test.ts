import { MQTTService } from '../../src/services/mqtt/MQTT.service'
import { DeviceLogService } from '../../src/services/device'
import * as DeviceScheduleService from '../../src/services/mcp/DeviceSchedule.service'
import {
  enableDryRun,
  disableDryRun,
  getDryRunSideEffects,
  resetDryRunSideEffects,
  isDryRunActive
} from '../agent/dryRunGuard'

jest.mock('../../src/services/mqtt/MQTT.service', () => ({
  MQTTService: { publishActuatorState: jest.fn() }
}))

jest.mock('../../src/services/device', () => ({
  DeviceLogService: { create: jest.fn() }
}))

jest.mock('../../src/services/mcp/DeviceSchedule.service', () => ({
  scheduleActuatorState: jest.fn(),
  scheduleActuatorStateRepeat: jest.fn(),
  scheduleSensorData: jest.fn(),
  scheduleSensorDataRepeat: jest.fn()
}))

const originalPublish = MQTTService.publishActuatorState
const originalDeviceLogCreate = DeviceLogService.create
const originalScheduleActuatorState = DeviceScheduleService.scheduleActuatorState

describe('dryRunGuard', () => {
  afterEach(() => {
    disableDryRun()
    resetDryRunSideEffects()
  })

  it('is inactive by default and leaves originals untouched', () => {
    expect(isDryRunActive()).toBe(false)
  })

  it('intercepts MQTT publish without calling the real client', () => {
    enableDryRun()
    MQTTService.publishActuatorState(42, 'on')

    expect(originalPublish).not.toHaveBeenCalled()
    expect(getDryRunSideEffects().mqttPublishes).toEqual([{ deviceId: 42, state: 'on' }])
  })

  it('intercepts DeviceLogService.create and returns a shape-compatible fake row', async () => {
    enableDryRun()
    const row = await DeviceLogService.create({
      deviceLogDeviceId: 7,
      deviceLogData: '1'
    })

    expect(originalDeviceLogCreate).not.toHaveBeenCalled()
    expect(row).toMatchObject({ deviceLogDeviceId: 7, deviceLogData: '1' })
    expect(getDryRunSideEffects().deviceLogsCreated).toEqual([
      { deviceLogDeviceId: 7, deviceLogData: '1' }
    ])
  })

  it('intercepts scheduleActuatorState and records it without persisting', async () => {
    enableDryRun()
    const job = await DeviceScheduleService.scheduleActuatorState(
      'Smart Lamp Bedroom',
      'on',
      'once',
      new Date('2026-01-01T11:00:00Z')
    )

    expect(originalScheduleActuatorState).not.toHaveBeenCalled()
    expect(job).toMatchObject({
      deviceName: 'Smart Lamp Bedroom',
      state: 'on',
      category: 'once'
    })
    expect(getDryRunSideEffects().schedulesCreated).toEqual([
      { deviceName: 'Smart Lamp Bedroom', type: 'actuator', category: 'once' }
    ])
  })

  it('restores the original functions on disableDryRun', () => {
    enableDryRun()
    disableDryRun()

    expect(isDryRunActive()).toBe(false)
    MQTTService.publishActuatorState(1, 'off')
    expect(originalPublish).toHaveBeenCalledWith(1, 'off')
  })

  it('resets side effects between test cases', () => {
    enableDryRun()
    MQTTService.publishActuatorState(1, 'on')
    expect(getDryRunSideEffects().mqttPublishes).toHaveLength(1)

    resetDryRunSideEffects()
    expect(getDryRunSideEffects().mqttPublishes).toHaveLength(0)
  })
})
