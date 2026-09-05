import {
  buildTable41,
  buildTable42,
  buildFunctionalSummary
} from '../reporters/functionalTables'
import type { FunctionalTestCase } from '../datasets/functionalDataset.schema'
import type { FunctionalEvaluationRecord } from '../runner/functionalTypes'

const dataset: FunctionalTestCase[] = [
  {
    id: 'FT01',
    kind: 'device_control',
    input: 'Nyalakan lampu ruang tamu',
    deviceName: 'Lampu Ruang Tamu',
    expectedFinalState: '1',
    expectExecution: true
  },
  {
    id: 'FT02',
    kind: 'device_control',
    input: 'Matikan lampu ruang tamu',
    deviceName: 'Lampu Ruang Tamu',
    expectedFinalState: '0',
    expectExecution: true
  },
  {
    id: 'FT03',
    kind: 'sensor_read',
    input: 'Berapa suhu ruangan saat ini?',
    deviceName: 'Sensor Suhu Ruangan',
    expectExecution: true
  },
  {
    id: 'FT04',
    kind: 'device_status',
    input: 'Apakah lampu ruang tamu menyala?',
    deviceName: 'Lampu Ruang Tamu',
    expectExecution: true
  },
  {
    id: 'FT05',
    kind: 'scheduler',
    input: 'Nyalakan lampu setiap hari pukul 18.00',
    deviceName: 'Lampu Ruang Tamu',
    expectExecution: true
  },
  {
    id: 'FT06',
    kind: 'rule',
    input: 'Nyalakan kipas jika suhu di atas 30 °C',
    deviceName: 'Kipas',
    expectExecution: true
  },
  { id: 'FT07', kind: 'ambiguous', input: 'Nyalakan lampu', expectExecution: false },
  {
    id: 'FT08',
    kind: 'invalid',
    input: 'Nyalakan televisi yang tidak terdaftar',
    expectExecution: false
  }
]

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

const allSuccessResults: FunctionalEvaluationRecord[] = [
  record({
    testCaseId: 'FT01',
    kind: 'device_control',
    expectedFinalState: '1',
    endToEndLatencyMs: 200
  }),
  record({
    testCaseId: 'FT02',
    kind: 'device_control',
    expectedFinalState: '0',
    endToEndLatencyMs: 220
  }),
  record({
    testCaseId: 'FT03',
    kind: 'sensor_read',
    endToEndLatencyMs: 150,
    finalDeviceStatus: { deviceLogData: '28', createdAt: new Date().toISOString() }
  }),
  record({ testCaseId: 'FT04', kind: 'device_status', reply: 'Lampu dalam kondisi ON.' }),
  record({
    testCaseId: 'FT05',
    kind: 'scheduler',
    endToEndLatencyMs: null,
    reply: 'Jadwal tersimpan.'
  }),
  record({
    testCaseId: 'FT06',
    kind: 'rule',
    endToEndLatencyMs: null,
    reply: 'Rule tersimpan.'
  }),
  record({
    testCaseId: 'FT07',
    kind: 'ambiguous',
    ackReceived: false,
    reply: 'Lampu yang mana yang dimaksud?'
  }),
  record({
    testCaseId: 'FT08',
    kind: 'invalid',
    ackReceived: false,
    reply: 'Perangkat tidak terdaftar.'
  })
]

describe('buildTable41', () => {
  it('produces one row per scenario, in No.1..8 order, with thesis-exact column names', () => {
    const rows = buildTable41(dataset, allSuccessResults)
    expect(rows).toHaveLength(8)
    expect(rows.map((r) => r.No)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(Object.keys(rows[0])).toEqual([
      'No',
      'Skenario',
      'Perintah',
      'Hasil yang Diharapkan',
      'Hasil Aktual',
      'Status',
      'Catatan'
    ])
  })

  it('uses the exact thesis wording for Skenario and Hasil yang Diharapkan', () => {
    const rows = buildTable41(dataset, allSuccessResults)
    expect(rows[0]).toMatchObject({
      Skenario: 'Kontrol perangkat ON',
      'Hasil yang Diharapkan': 'Relay/lampu berubah menjadi ON'
    })
    expect(rows[5]).toMatchObject({
      Skenario: 'Dynamic Rule',
      'Hasil yang Diharapkan': 'Rule tersimpan dan dijalankan ketika kondisi terpenuhi'
    })
  })

  it('flags FT04/FT07/FT08 for manual review, leaves others blank', () => {
    const rows = buildTable41(dataset, allSuccessResults)
    const byId = (id: string) =>
      rows.find((r) => r.Perintah === dataset.find((d) => d.id === id)?.input)
    expect(byId('FT04')?.Catatan).toContain('Periksa manual')
    expect(byId('FT07')?.Catatan).toContain('Periksa manual')
    expect(byId('FT08')?.Catatan).toContain('Periksa manual')
    expect(byId('FT01')?.Catatan).toBe('')
  })

  it('marks Status as Gagal when integrationSuccess is false', () => {
    const results = allSuccessResults.map((r) =>
      r.testCaseId === 'FT01'
        ? { ...r, integrationSuccess: false, ackReceived: false }
        : r
    )
    const rows = buildTable41(dataset, results)
    expect(rows[0].Status).toBe('Gagal')
  })
})

describe('buildTable42', () => {
  it('includes only the 5 MQTT-relevant scenarios, renumbered 1..5', () => {
    const rows = buildTable42(dataset, allSuccessResults)
    expect(rows).toHaveLength(5)
    expect(rows.map((r) => r.No)).toEqual([1, 2, 3, 4, 5])
    expect(rows.map((r) => r.Skenario)).toEqual([
      'Kontrol perangkat ON',
      'Kontrol perangkat OFF',
      'Monitoring sensor',
      'Penjadwalan',
      'Dynamic Rule'
    ])
  })

  it('renders "_" for scheduler/rule latency, a number for device_control/sensor_read', () => {
    const rows = buildTable42(dataset, allSuccessResults)
    expect(rows[0]['Latensi E2E (ms)']).toBe(200)
    expect(rows[2]['Latensi E2E (ms)']).toBe(150)
    expect(rows[3]['Latensi E2E (ms)']).toBe('_')
    expect(rows[4]['Latensi E2E (ms)']).toBe('_')
  })

  it('excludes device_status, ambiguous, and invalid scenarios', () => {
    const rows = buildTable42(dataset, allSuccessResults)
    expect(rows.some((r) => r.Skenario === 'Status perangkat')).toBe(false)
    expect(rows.some((r) => r.Skenario === 'Perintah ambigu')).toBe(false)
    expect(rows.some((r) => r.Skenario === 'Perintah tidak valid')).toBe(false)
  })
})

describe('buildFunctionalSummary', () => {
  it('computes success rate over Tabel 4.1 and average latency over Tabel 4.2 numeric rows only', () => {
    const table41 = buildTable41(dataset, allSuccessResults)
    const table42 = buildTable42(dataset, allSuccessResults)
    const summary = buildFunctionalSummary(table41, table42)

    expect(summary.totalScenarios).toBe(8)
    expect(summary.successCount).toBe(8)
    expect(summary.successRatePct).toBe(100)
    expect(summary.table42AverageLatencyMs).toBeCloseTo((200 + 220 + 150) / 3, 5)
  })

  it('reflects a partial failure in the success rate', () => {
    const results = allSuccessResults.map((r) =>
      r.testCaseId === 'FT08' ? { ...r, integrationSuccess: false } : r
    )
    const table41 = buildTable41(dataset, results)
    const summary = buildFunctionalSummary(table41, buildTable42(dataset, results))
    expect(summary.successCount).toBe(7)
    expect(summary.successRatePct).toBeCloseTo(87.5, 5)
  })
})
