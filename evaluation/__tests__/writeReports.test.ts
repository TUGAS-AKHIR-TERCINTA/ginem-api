import fs from 'fs'
import os from 'os'
import path from 'path'
import { resolveRunDirectory, appendRawResult } from '../writers/resultWriter'
import { generateReports } from '../reporters/writeReports'
import type { RawEvaluationRecord } from '../runner/types'

function record(overrides: Partial<RawEvaluationRecord>): RawEvaluationRecord {
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
    outputCostUsd: 0.002,
    totalCostUsd: 0.003,
    attempt: 1,
    errorType: null,
    errorMessage: null,
    rawModelReply: 'ok',
    timestamp: new Date().toISOString(),
    ...overrides
  }
}

describe('generateReports', () => {
  let tmpRoot: string

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-reports-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('writes summary.json and every expected CSV file', () => {
    const { runDir } = resolveRunDirectory(tmpRoot, 'run-fixed')
    appendRawResult(runDir, record({ testCaseId: 'TC001' }))
    appendRawResult(
      runDir,
      record({
        testCaseId: 'TC061',
        category: 'complex',
        toolCorrect: false,
        errorTypes: ['WRONG_TOOL']
      })
    )

    generateReports(runDir)

    const expectedFiles = [
      'summary.json',
      'tool-accuracy.csv',
      'parameter-accuracy.csv',
      'latency.csv',
      'token-cost.csv',
      'complexity.csv',
      'error-distribution.csv',
      'tabel-4.3-ketepatan-tool.csv',
      'tabel-4.4-parameter-struktur.csv',
      'tabel-4.5-latensi.csv',
      'tabel-4.7-token-biaya.csv',
      'tabel-4.8-kompleksitas.csv',
      'tabel-4.9-distribusi-kesalahan.csv'
    ]

    for (const file of expectedFiles) {
      expect(fs.existsSync(path.join(runDir, file))).toBe(true)
    }

    const summary = JSON.parse(
      fs.readFileSync(path.join(runDir, 'summary.json'), 'utf-8')
    )
    expect(summary.modelAggregates[0].totalTests).toBe(2)
    expect(summary.modelAggregates[0].toolCorrectCount).toBe(1)

    const table43 = fs.readFileSync(
      path.join(runDir, 'tabel-4.3-ketepatan-tool.csv'),
      'utf-8'
    )
    expect(table43).toContain(
      'Model LLM,Jumlah Pengujian,Tool Benar,Tool Salah,Ketepatan Tool (%)'
    )
  })
})
