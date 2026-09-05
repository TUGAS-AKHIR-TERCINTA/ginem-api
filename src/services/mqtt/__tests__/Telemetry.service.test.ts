import { TelemetryService } from '../Telemetry.service'
import { DeviceService, DeviceLogService } from '../../device'
import { MQTTService } from '../MQTT.service'
import { RuleEngine } from '../../rule'

jest.mock('../../device', () => ({
  DeviceService: { exists: jest.fn() },
  DeviceLogService: { create: jest.fn() }
}))

jest.mock('../../rule', () => ({
  RuleEngine: { evaluate: jest.fn().mockResolvedValue(undefined) }
}))

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

const mockedExists = jest.mocked(DeviceService.exists)
const mockedCreate = jest.mocked(DeviceLogService.create)
const mockedEvaluate = jest.mocked(RuleEngine.evaluate)

describe('TelemetryService + RuleEngine hook', () => {
  let telemetryHandler: (deviceId: number, payload: unknown) => Promise<void>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(MQTTService, 'onDeviceTelemetry').mockImplementation((listener) => {
      telemetryHandler = async (deviceId, payload) => {
        const maybePromise = (
          listener as (id: number, p: unknown) => void | Promise<void>
        )(deviceId, payload)
        await maybePromise
      }
      return () => undefined
    })
    TelemetryService.initialize()
  })

  it('persists log and triggers RuleEngine', async () => {
    mockedExists.mockResolvedValue(true)
    mockedCreate.mockResolvedValue({} as never)

    await telemetryHandler(5, { value: '28.5', metric: 'temperature' })

    expect(mockedCreate).toHaveBeenCalledWith({
      deviceLogDeviceId: 5,
      deviceLogData: '28.5'
    })
    expect(mockedEvaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: 5,
        metrics: expect.objectContaining({ temperature: 28.5 })
      })
    )
  })

  it('still succeeds when RuleEngine rejects', async () => {
    mockedExists.mockResolvedValue(true)
    mockedCreate.mockResolvedValue({} as never)
    mockedEvaluate.mockRejectedValueOnce(new Error('engine down'))

    await telemetryHandler(5, { value: '22' })

    expect(mockedCreate).toHaveBeenCalled()
  })

  it('skips unknown devices', async () => {
    mockedExists.mockResolvedValue(false)

    await telemetryHandler(99, { value: '1' })

    expect(mockedCreate).not.toHaveBeenCalled()
    expect(mockedEvaluate).not.toHaveBeenCalled()
  })
})
