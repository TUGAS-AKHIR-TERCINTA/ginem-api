import fs from 'fs'
import os from 'os'
import path from 'path'
import { ChatService } from '../../src/services/chat/Chat.service'
import { runLlmEvaluation } from '../runner/llmEvalRunner'
import { resolveRunDirectory, readRawResults } from '../writers/resultWriter'
import type { DatasetCase } from '../datasets/dataset.schema'
import type { EvalModelConfig } from '../config/models.config'

jest.mock('../../src/services/chat/Chat.service', () => ({
  ChatService: { query: jest.fn() }
}))

jest.mock('../agent/modelAdapter', () => ({
  buildEvalModel: jest.fn(() => ({ id: 'fake-model' }))
}))

// dryRunGuard imports the real MQTTService, which (via ./client) opens a live
// connection to the configured broker at module-load time — stub the client the
// same way src/services/mqtt/__tests__/MQTT.service.test.ts does so tests never
// touch the network, regardless of what's in .env.
jest.mock('../../src/services/mqtt/client', () => ({
  mqttClient: { connected: false, on: jest.fn(), publish: jest.fn(), end: jest.fn() }
}))

jest.mock('../../src/utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

const mockedQuery = ChatService.query as jest.Mock

const model: EvalModelConfig = {
  key: 'openai:gpt-5.6-terra',
  displayName: 'GPT-5.6 Terra',
  provider: 'openai',
  apiModel: 'gpt-5.6-terra',
  temperature: 0.2,
  maxTokens: 1024
}

const simpleCase: DatasetCase = {
  id: 'TC001',
  category: 'simple',
  input: 'Nyalakan lampu kamar',
  expected: {
    behavior: 'tool_call',
    toolCalls: [
      {
        tool: 'set_actuator_state_by_device_name',
        parameters: { deviceName: 'Smart Lamp Bedroom', state: 'on' }
      }
    ]
  }
}

const ambiguousCase: DatasetCase = {
  id: 'TC081',
  category: 'ambiguous',
  input: 'Nyalakan lampunya',
  expected: { behavior: 'clarification' }
}

describe('runLlmEvaluation', () => {
  let tmpRoot: string

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-runner-test-'))
    mockedQuery.mockReset()
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('writes one correct raw record per (case, model, repetition)', async () => {
    mockedQuery.mockResolvedValue({
      reply: 'Lampu sudah dinyalakan.',
      trace: {
        toolCalls: [
          {
            name: 'set_actuator_state_by_device_name',
            args: { deviceName: 'Smart Lamp Bedroom', state: 'on' }
          }
        ],
        agentLatencyMs: 120,
        tokenUsage: { inputTokens: 100, outputTokens: 20, totalTokens: 120 }
      }
    })

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-fixed')
    await runLlmEvaluation({
      runId,
      runDir,
      datasetCases: [simpleCase],
      models: [model],
      repetitions: 2,
      concurrency: 2,
      maxRetries: 1,
      retryBaseDelayMs: 1
    })

    const records = readRawResults(runDir)
    expect(records).toHaveLength(2)
    expect(records.every((r) => r.toolCorrect)).toBe(true)
    expect(records.every((r) => r.parameterCorrect)).toBe(true)
    expect(records.every((r) => r.structureValid)).toBe(true)
    expect(records.every((r) => r.errorTypes.length === 0)).toBe(true)
    expect(records.map((r) => r.repetition).sort((a, b) => a - b)).toEqual([1, 2])
    expect(records[0].totalTokens).toBe(120)
    expect(records[0].totalCostUsd).toBeGreaterThan(0)
  })

  it('flags FAILED_CLARIFICATION + UNNECESSARY_TOOL_CALL when a tool fires on an ambiguous case', async () => {
    mockedQuery.mockResolvedValue({
      reply: 'Lampu sudah dinyalakan.',
      trace: {
        toolCalls: [
          {
            name: 'set_actuator_state_by_device_name',
            args: { deviceName: 'Smart Lamp Bedroom', state: 'on' }
          }
        ],
        agentLatencyMs: 90
      }
    })

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-ambiguous')
    await runLlmEvaluation({
      runId,
      runDir,
      datasetCases: [ambiguousCase],
      models: [model],
      repetitions: 1,
      concurrency: 1,
      maxRetries: 1,
      retryBaseDelayMs: 1
    })

    const [record] = readRawResults(runDir)
    expect(record.errorTypes).toEqual(['FAILED_CLARIFICATION', 'UNNECESSARY_TOOL_CALL'])
  })

  it('records a transport failure as an API_ERROR row instead of throwing', async () => {
    mockedQuery.mockRejectedValue(new Error('provider timeout'))

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-error')
    await runLlmEvaluation({
      runId,
      runDir,
      datasetCases: [simpleCase],
      models: [model],
      repetitions: 1,
      concurrency: 1,
      maxRetries: 1,
      retryBaseDelayMs: 1
    })

    const [record] = readRawResults(runDir)
    expect(record.errorType).toBe('API_ERROR')
    expect(record.errorMessage).toContain('provider timeout')
    expect(record.apiLatencyMs).toBeNull()
    expect(record.attempt).toBe(2)
    expect(mockedQuery).toHaveBeenCalledTimes(2)
  })

  it('resume skips already-completed (testCase, model, repetition) records', async () => {
    mockedQuery.mockResolvedValue({
      reply: 'Lampu sudah dinyalakan.',
      trace: {
        toolCalls: [
          {
            name: 'set_actuator_state_by_device_name',
            args: { deviceName: 'Smart Lamp Bedroom', state: 'on' }
          }
        ],
        agentLatencyMs: 100
      }
    })

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-resume')
    await runLlmEvaluation({
      runId,
      runDir,
      datasetCases: [simpleCase],
      models: [model],
      repetitions: 2,
      concurrency: 2,
      maxRetries: 1,
      retryBaseDelayMs: 1
    })
    expect(mockedQuery).toHaveBeenCalledTimes(2)

    mockedQuery.mockClear()
    await runLlmEvaluation({
      runId,
      runDir,
      datasetCases: [simpleCase],
      models: [model],
      repetitions: 2,
      concurrency: 2,
      maxRetries: 1,
      retryBaseDelayMs: 1
    })

    expect(mockedQuery).not.toHaveBeenCalled()
    expect(readRawResults(runDir)).toHaveLength(2)
  })

  it('calls ChatService.query without userId/sessionId for clean state isolation', async () => {
    mockedQuery.mockResolvedValue({
      reply: 'ok',
      trace: { toolCalls: [], agentLatencyMs: 1 }
    })

    const { runId, runDir } = resolveRunDirectory(tmpRoot, 'run-isolation')
    await runLlmEvaluation({
      runId,
      runDir,
      datasetCases: [ambiguousCase],
      models: [model],
      repetitions: 1,
      concurrency: 1,
      maxRetries: 0,
      retryBaseDelayMs: 1
    })

    const [, options] = mockedQuery.mock.calls[0]
    expect(options.userId).toBeUndefined()
    expect(options.sessionId).toBeUndefined()
    expect(options.captureTrace).toBe(true)
  })
})
