import fs from 'fs'
import os from 'os'
import path from 'path'
import { resolveRunDirectory, appendFunctionalResult } from '../writers/resultWriter'
import { generateFunctionalReports } from '../reporters/writeFunctionalReports'
import type { FunctionalEvaluationRecord } from '../runner/functionalTypes'

function record(
  overrides: Partial<FunctionalEvaluationRecord>
): FunctionalEvaluationRecord {
  return {
    runId: 'run-test',
    testCaseId: 'FT01',
    kind: 'device_control',
    inputText: 'Nyalakan lampu ruang tamu',
    requestStartedAt: new Date().toISOString(),
    responseCompletedAt: new Date().toISOString(),
    apiRoundTripMs: 100,
    reply: 'Lampu sudah dinyalakan.',
    deviceId: 1,
    deviceName: 'Lampu Ruang Tamu',
    expectedFinalState: '1',
    mqttAckAt: new Date().toISOString(),
    ackReceived: true,
    finalDeviceStatus: { payload: { state: '1' } },
    endToEndLatencyMs: 250,
    integrationSuccess: true,
    mqttSuccess: true,
    errorMessage: null,
    timestamp: new Date().toISOString(),
    ...overrides
  }
}

describe('generateFunctionalReports', () => {
  let tmpRoot: string
  const datasetPath = path.join(__dirname, '..', 'datasets', 'functional-dataset.jsonl')

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-functional-reports-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('writes Tabel 4.1, Tabel 4.2, and a JSON summary from functional-results.jsonl', () => {
    const { runDir } = resolveRunDirectory(tmpRoot, 'run-fixed')
    appendFunctionalResult(runDir, record({ testCaseId: 'FT01', kind: 'device_control' }))
    appendFunctionalResult(
      runDir,
      record({
        testCaseId: 'FT08',
        kind: 'invalid',
        reply: 'Perangkat tidak terdaftar.',
        ackReceived: false,
        endToEndLatencyMs: null,
        mqttSuccess: true
      })
    )

    generateFunctionalReports(runDir, datasetPath)

    const table41 = fs.readFileSync(
      path.join(runDir, 'tabel-4.1-pengujian-fungsional.csv'),
      'utf-8'
    )
    expect(table41).toContain(
      'No,Skenario,Perintah,Hasil yang Diharapkan,Hasil Aktual,Status,Catatan'
    )
    expect(table41).toContain('Kontrol perangkat ON')
    expect(table41).toContain('Perintah tidak valid')

    const table42 = fs.readFileSync(
      path.join(runDir, 'tabel-4.2-integrasi-e2e.csv'),
      'utf-8'
    )
    expect(table42).toContain(
      'No,Skenario,Integrasi MQTT,Hasil Eksekusi,Latensi E2E (ms),Status'
    )
    expect(table42).not.toContain('Perintah tidak valid')

    const summary = JSON.parse(
      fs.readFileSync(path.join(runDir, 'functional-summary.json'), 'utf-8')
    )
    expect(summary.totalScenarios).toBe(2)
    expect(summary.successCount).toBe(2)
  })
})
