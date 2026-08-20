import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  resolveRunDirectory,
  appendRawResult,
  readRawResults
} from '../writers/resultWriter'
import { loadCompletedKeys, makeRecordKey } from '../runner/resume'
import type { RawEvaluationRecord } from '../runner/types'

function baseRecord(overrides: Partial<RawEvaluationRecord>): RawEvaluationRecord {
  return {
    runId: 'run-test',
    testCaseId: 'TC001',
    category: 'simple',
    model: 'GPT-5.6 Terra',
    modelKey: 'openai:gpt-5.6-terra',
    provider: 'openai',
    repetition: 1,
    inputText: 'Nyalakan lampu kamar',
    expectedBehavior: 'tool_call',
    actualBehavior: 'tool_call',
    expectedToolCalls: [],
    actualToolCalls: [],
    toolCorrect: true,
    parameterCorrect: true,
    parametersCheckedCount: 2,
    parametersCorrectCount: 2,
    structureValid: true,
    scheduleCorrect: null,
    dynamicRuleCorrect: null,
    clarificationRequested: false,
    clarificationCorrect: null,
    invalidCommandHandledCorrect: null,
    errorTypes: [],
    apiLatencyMs: 500,
    inputTokens: 100,
    outputTokens: 20,
    totalTokens: 120,
    inputCostUsd: 0.001,
    outputCostUsd: 0.001,
    totalCostUsd: 0.002,
    attempt: 1,
    errorType: null,
    errorMessage: null,
    rawModelReply: 'Lampu sudah dinyalakan.',
    timestamp: new Date().toISOString(),
    ...overrides
  }
}

describe('resultWriter + resume', () => {
  let tmpRoot: string

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('creates a run directory and appends JSONL records incrementally', () => {
    const { runDir } = resolveRunDirectory(tmpRoot, 'run-fixed')
    appendRawResult(runDir, baseRecord({ testCaseId: 'TC001' }))
    appendRawResult(runDir, baseRecord({ testCaseId: 'TC002' }))

    const records = readRawResults(runDir)
    expect(records).toHaveLength(2)
    expect(records.map((r) => r.testCaseId)).toEqual(['TC001', 'TC002'])
  })

  it('routes failed records into errors.jsonl as well as raw-results.jsonl', () => {
    const { runDir } = resolveRunDirectory(tmpRoot, 'run-fixed')
    appendRawResult(
      runDir,
      baseRecord({ testCaseId: 'TC003', errorType: 'API_ERROR', errorMessage: 'timeout' })
    )

    const errorsPath = path.join(runDir, 'errors.jsonl')
    expect(fs.existsSync(errorsPath)).toBe(true)
    const errors = fs.readFileSync(errorsPath, 'utf-8').trim().split('\n')
    expect(errors).toHaveLength(1)
  })

  it('loadCompletedKeys only counts successful records, not failed ones', () => {
    const { runDir } = resolveRunDirectory(tmpRoot, 'run-fixed')
    appendRawResult(runDir, baseRecord({ testCaseId: 'TC001', repetition: 1 }))
    appendRawResult(
      runDir,
      baseRecord({
        testCaseId: 'TC002',
        repetition: 1,
        errorType: 'API_ERROR',
        errorMessage: 'down'
      })
    )

    const completed = loadCompletedKeys(runDir)
    expect(completed.has(makeRecordKey('TC001', 'openai:gpt-5.6-terra', 1))).toBe(true)
    expect(completed.has(makeRecordKey('TC002', 'openai:gpt-5.6-terra', 1))).toBe(false)
  })

  it('returns an empty set when the run directory has no results yet', () => {
    const { runDir } = resolveRunDirectory(tmpRoot, 'run-empty')
    expect(loadCompletedKeys(runDir).size).toBe(0)
  })
})
