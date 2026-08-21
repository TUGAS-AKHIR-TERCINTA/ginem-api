import fs from 'fs'
import os from 'os'
import path from 'path'
import axios from 'axios'
import { runFunctionalEvaluation } from '../runner/functionalRunner'
import { resolveRunDirectory, readFunctionalResults } from '../writers/resultWriter'
import type { FunctionalTestCase } from '../datasets/functionalDataset.schema'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

function makeClient() {
  return {
    defaults: { headers: { common: {} as Record<string, string> } },
    get: jest.fn(),
    post: jest.fn()
  }
}

const controlCase: FunctionalTestCase = {
  id: 'FT01',
  kind: 'device_control',
  input: 'Nyalakan lampu kamar',
  deviceName: 'Smart Lamp Bedroom',
  expectedFinalState: '1',
  expectExecution: true
}

const invalidCase: FunctionalTestCase = {
  id: 'FT08',
  kind: 'invalid',
  input: 'Nyalakan televisi yang tidak terdaftar',
  expectExecution: false
}

const sensorCase: FunctionalTestCase = {
  id: 'FT03',
  kind: 'sensor_read',
  input: 'Berapa suhu ruangan saat ini?',
  deviceName: 'Sensor Suhu Ruangan',
  expectExecution: true
}

describe('runFunctionalEvaluation', () => {
  let tmpRoot: string

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-functional-test-'))
    jest.clearAllMocks()
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('logs in, resolves the device, publishes, and records a successful ACK', async () => {
    const client = makeClient()
    client.post.mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/login') {
        return await Promise.resolve({ data: { data: { accessToken: 'test-token' } } })
      }
      if (url === '/api/v1/chat') {
        return await Promise.resolve({
          data: { data: { reply: 'Lampu sudah dinyalakan.' } }
        })
      }
      throw new Error(`unexpected POST ${url}`)
    })
    client.get.mockImplementation(async (url: string) => {
      if (url === '/api/v1/devices') {
        return await Promise.resolve({
          data: { data: { items: [{ deviceId: 2, deviceName: 'Smart Lamp Bedroom' }] } }
        })
      }
      if (url === '/api/v1/mqtt/devices/2/status') {
        return await Promise.resolve({
          data: {
            data: {
              receivedAt: new Date(Date.now() + 10).toISOString(),
              payload: { state: '1' }
            }
          }
        })
      }
      throw new Error(`unexpected GET ${url}`)
    })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-functional')
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: 'http://localhost:8000',
      email: 'test@example.com',
      password: 'secret',
      testCases: [controlCase],
      ackTimeoutMs: 2000,
      ackPollIntervalMs: 5,
      sensorFreshnessMs: 900000
    })

    const [record] = readFunctionalResults(runDir)
    expect(record.deviceId).toBe(2)
    expect(record.ackReceived).toBe(true)
    expect(record.integrationSuccess).toBe(true)
    expect(record.endToEndLatencyMs).toBeGreaterThanOrEqual(0)
    expect(client.defaults.headers.common.Authorization).toBe('Bearer test-token')
  })

  it('marks ackReceived=false when no state update arrives within the timeout', async () => {
    const client = makeClient()
    client.post.mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/login')
        return await Promise.resolve({ data: { data: { accessToken: 't' } } })
      return await Promise.resolve({ data: { data: { reply: 'ok' } } })
    })
    client.get.mockImplementation(async (url: string) => {
      if (url === '/api/v1/devices') {
        return await Promise.resolve({
          data: { data: { items: [{ deviceId: 2, deviceName: 'Smart Lamp Bedroom' }] } }
        })
      }
      // Always returns a stale receivedAt (before the request started)
      return await Promise.resolve({
        data: { data: { receivedAt: new Date(0).toISOString() } }
      })
    })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-timeout')
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: 'http://localhost:8000',
      email: 'test@example.com',
      password: 'secret',
      testCases: [controlCase],
      ackTimeoutMs: 30,
      ackPollIntervalMs: 10,
      sensorFreshnessMs: 900000
    })

    const [record] = readFunctionalResults(runDir)
    expect(record.ackReceived).toBe(false)
    expect(record.integrationSuccess).toBe(false)
    expect(record.endToEndLatencyMs).toBeNull()
  })

  it('does not attempt device lookup or ACK polling for a non device_control case', async () => {
    const client = makeClient()
    client.post.mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/login')
        return await Promise.resolve({ data: { data: { accessToken: 't' } } })
      return await Promise.resolve({
        data: { data: { reply: 'Perangkat tidak ditemukan.' } }
      })
    })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-invalid')
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: 'http://localhost:8000',
      email: 'test@example.com',
      password: 'secret',
      testCases: [invalidCase],
      ackTimeoutMs: 1000,
      ackPollIntervalMs: 10,
      sensorFreshnessMs: 900000
    })

    expect(client.get).not.toHaveBeenCalled()
    const [record] = readFunctionalResults(runDir)
    expect(record.integrationSuccess).toBe(true)
    expect(record.deviceId).toBeNull()
  })

  it('records an errorMessage row instead of throwing when the chat request fails', async () => {
    const client = makeClient()
    client.post.mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/login')
        return await Promise.resolve({ data: { data: { accessToken: 't' } } })
      return await Promise.reject(new Error('gateway timeout'))
    })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-error')
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: 'http://localhost:8000',
      email: 'test@example.com',
      password: 'secret',
      testCases: [invalidCase],
      ackTimeoutMs: 1000,
      ackPollIntervalMs: 10,
      sensorFreshnessMs: 900000
    })

    const [record] = readFunctionalResults(runDir)
    expect(record.integrationSuccess).toBe(false)
    expect(record.errorMessage).toContain('gateway timeout')
  })

  it('throws a clear error when login does not return an accessToken', async () => {
    const client = makeClient()
    client.post.mockResolvedValue({ data: { data: {} } })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-badlogin')
    await expect(
      runFunctionalEvaluation({
        runId,
        runDir,
        baseUrl: 'http://localhost:8000',
        email: 'test@example.com',
        password: 'wrong',
        testCases: [invalidCase],
        ackTimeoutMs: 1000,
        ackPollIntervalMs: 10,
        sensorFreshnessMs: 900000
      })
    ).rejects.toThrow(/accessToken/)
  })

  it('marks sensor_read as successful when device_logs has a fresh row', async () => {
    const client = makeClient()
    client.post.mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/login')
        return await Promise.resolve({ data: { data: { accessToken: 't' } } })
      return await Promise.resolve({ data: { data: { reply: 'Suhu saat ini 28°C.' } } })
    })
    client.get.mockImplementation(async (url: string) => {
      if (url === '/api/v1/devices') {
        return await Promise.resolve({
          data: { data: { items: [{ deviceId: 3, deviceName: 'Sensor Suhu Ruangan' }] } }
        })
      }
      if (url === '/api/v1/devices/logs/last/3') {
        return await Promise.resolve({
          data: {
            data: {
              deviceLogId: 99,
              deviceLogData: '28',
              createdAt: new Date().toISOString()
            }
          }
        })
      }
      throw new Error(`unexpected GET ${url}`)
    })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-sensor-fresh')
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: 'http://localhost:8000',
      email: 'test@example.com',
      password: 'secret',
      testCases: [sensorCase],
      ackTimeoutMs: 1000,
      ackPollIntervalMs: 10,
      sensorFreshnessMs: 900000
    })

    const [record] = readFunctionalResults(runDir)
    expect(record.integrationSuccess).toBe(true)
    expect(record.mqttSuccess).toBe(true)
    expect(record.endToEndLatencyMs).toBeGreaterThanOrEqual(0)
  })

  it('marks sensor_read as failed when the last device_logs row is stale', async () => {
    const client = makeClient()
    client.post.mockImplementation(async (url: string) => {
      if (url === '/api/v1/auth/login')
        return await Promise.resolve({ data: { data: { accessToken: 't' } } })
      return await Promise.resolve({ data: { data: { reply: 'Suhu saat ini 28°C.' } } })
    })
    client.get.mockImplementation(async (url: string) => {
      if (url === '/api/v1/devices') {
        return await Promise.resolve({
          data: { data: { items: [{ deviceId: 3, deviceName: 'Sensor Suhu Ruangan' }] } }
        })
      }
      if (url === '/api/v1/devices/logs/last/3') {
        return await Promise.resolve({
          data: {
            data: {
              deviceLogId: 1,
              deviceLogData: '27',
              createdAt: new Date(0).toISOString()
            }
          }
        })
      }
      throw new Error(`unexpected GET ${url}`)
    })
    mockedAxios.create.mockReturnValue(client as never)

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-sensor-stale')
    await runFunctionalEvaluation({
      runId,
      runDir,
      baseUrl: 'http://localhost:8000',
      email: 'test@example.com',
      password: 'secret',
      testCases: [sensorCase],
      ackTimeoutMs: 1000,
      ackPollIntervalMs: 10,
      sensorFreshnessMs: 900000
    })

    const [record] = readFunctionalResults(runDir)
    expect(record.integrationSuccess).toBe(false)
    expect(record.mqttSuccess).toBe(false)
    expect(record.endToEndLatencyMs).toBeNull()
  })
})
