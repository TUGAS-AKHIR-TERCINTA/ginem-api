import type { FunctionalTestCase } from '../datasets/functionalDataset.schema'
import type { FunctionalEvaluationRecord } from '../runner/functionalTypes'

interface ScenarioMeta {
  no: number
  skenario: string
  hasilDiharapkan: string
  /** Whether this row belongs in Tabel 4.2 (the 5 scenarios that actually exercise MQTT). */
  inTable42: boolean
}

/**
 * Fixed by test id rather than derived from `kind`, because Tabel 4.1/4.2's row
 * order and wording are fixed by the thesis, not by dataset structure — see
 * evaluation/datasets/functional-dataset.jsonl (FT01..FT08 map 1:1 to Tabel 4.1
 * No.1..8). Update this map if functional-dataset.jsonl's scenario set changes.
 */
const SCENARIO_META: Record<string, ScenarioMeta> = {
  FT01: {
    no: 1,
    skenario: 'Kontrol perangkat ON',
    hasilDiharapkan: 'Relay/lampu berubah menjadi ON',
    inTable42: true
  },
  FT02: {
    no: 2,
    skenario: 'Kontrol perangkat OFF',
    hasilDiharapkan: 'Relay/lampu berubah menjadi OFF',
    inTable42: true
  },
  FT03: {
    no: 3,
    skenario: 'Monitoring sensor',
    hasilDiharapkan: 'Sistem mengembalikan data DHT11 terbaru',
    inTable42: true
  },
  FT04: {
    no: 4,
    skenario: 'Status perangkat',
    hasilDiharapkan: 'Sistem menampilkan status perangkat',
    inTable42: false
  },
  FT05: {
    no: 5,
    skenario: 'Penjadwalan',
    hasilDiharapkan: 'Jadwal tersimpan dan dijalankan sesuai waktu',
    inTable42: true
  },
  FT06: {
    no: 6,
    skenario: 'Dynamic Rule',
    hasilDiharapkan: 'Rule tersimpan dan dijalankan ketika kondisi terpenuhi',
    inTable42: true
  },
  FT07: {
    no: 7,
    skenario: 'Perintah ambigu',
    hasilDiharapkan: 'Sistem meminta klarifikasi',
    inTable42: false
  },
  FT08: {
    no: 8,
    skenario: 'Perintah tidak valid',
    hasilDiharapkan: 'Sistem menolak eksekusi',
    inTable42: false
  }
}

/**
 * A handful of scenarios can't be fully auto-verified from HTTP/MQTT signals alone
 * (see evaluation/README.md): for these, "Status" only reflects "the HTTP call
 * succeeded and produced a reply," not whether the reply's content was actually
 * correct (e.g. did it really ask for clarification, or really refuse?). Marked
 * here so the generated table can flag them for manual read-through instead of
 * silently overstating automated coverage.
 */
const NEEDS_MANUAL_REVIEW = new Set(['FT04', 'FT07', 'FT08'])

function describeDeviceControlOutcome(record: FunctionalEvaluationRecord): string {
  if (!record.ackReceived) {
    return 'Tidak ada perubahan status perangkat terdeteksi dalam batas waktu polling.'
  }
  const targetLabel = record.expectedFinalState === '1' ? 'ON (menyala)' : 'OFF (mati)'
  return `Relay aktif, perangkat berubah menjadi ${targetLabel}. ACK diterima ${record.endToEndLatencyMs ?? '?'} ms setelah perintah dikirim.`
}

function describeSensorOutcome(record: FunctionalEvaluationRecord): string {
  const log = record.finalDeviceStatus as {
    deviceLogData?: string
    createdAt?: string
  } | null
  if (record.ackReceived && log != null) {
    return `Data sensor terbaru: ${log.deviceLogData ?? '?'} (tercatat ${log.createdAt ?? '?'}).`
  }
  return 'Tidak ditemukan data sensor yang cukup baru (lebih tua dari batas freshness yang dikonfigurasi).'
}

function describeGenericOutcome(record: FunctionalEvaluationRecord): string {
  if (record.errorMessage != null) return `Gagal: ${record.errorMessage}`
  const reply = record.reply ?? ''
  return reply.length > 200 ? `${reply.slice(0, 200)}…` : reply
}

function describeActualResult(record: FunctionalEvaluationRecord): string {
  if (record.errorMessage != null) return `Gagal: ${record.errorMessage}`
  if (record.kind === 'device_control') return describeDeviceControlOutcome(record)
  if (record.kind === 'sensor_read') return describeSensorOutcome(record)
  return describeGenericOutcome(record)
}

export interface Table41Row {
  No: number
  Skenario: string
  Perintah: string
  'Hasil yang Diharapkan': string
  'Hasil Aktual': string
  Status: 'Berhasil' | 'Gagal'
  Catatan: string
}

/** Tabel 4.1 (poin 4.2.1) — one row per functional-dataset.jsonl case, in FT01..FT08 order. */
export function buildTable41(
  dataset: FunctionalTestCase[],
  results: FunctionalEvaluationRecord[]
): Table41Row[] {
  const resultById = new Map(results.map((r) => [r.testCaseId, r]))

  return dataset
    .map((testCase) => {
      const meta = SCENARIO_META[testCase.id]
      const record = resultById.get(testCase.id)
      if (meta == null || record == null) return null

      return {
        No: meta.no,
        Skenario: meta.skenario,
        Perintah: testCase.input,
        'Hasil yang Diharapkan': meta.hasilDiharapkan,
        'Hasil Aktual': describeActualResult(record),
        Status: (record.integrationSuccess ? 'Berhasil' : 'Gagal') as
          | 'Berhasil'
          | 'Gagal',
        Catatan: NEEDS_MANUAL_REVIEW.has(testCase.id)
          ? 'Periksa manual: Status di sini hanya berarti HTTP berhasil, bukan konfirmasi isi balasan benar.'
          : ''
      }
    })
    .filter((row): row is Table41Row => row != null)
    .sort((a, b) => a.No - b.No)
}

export interface Table42Row {
  No: number
  Skenario: string
  'Integrasi MQTT': 'Berhasil' | 'Gagal'
  'Hasil Eksekusi': string
  'Latensi E2E (ms)': number | string
  Status: 'Berhasil' | 'Gagal'
}

function describeExecutionResult(
  kind: FunctionalTestCase['kind'],
  record: FunctionalEvaluationRecord
): string {
  if (kind === 'device_control') {
    if (!record.ackReceived) return 'Tidak ada perubahan status'
    return record.expectedFinalState === '1' ? 'Lampu menyala' : 'Lampu mati'
  }
  if (kind === 'sensor_read') {
    return record.ackReceived ? 'Data diterima' : 'Data tidak diterima / tidak fresh'
  }
  if (kind === 'scheduler') {
    return record.integrationSuccess
      ? 'Jadwal tersimpan dan dijalankan'
      : 'Gagal menyimpan jadwal'
  }
  if (kind === 'rule') {
    return record.integrationSuccess
      ? 'Rule disimpan dan dijalankan'
      : 'Gagal menyimpan rule'
  }
  return record.integrationSuccess ? 'Berhasil' : 'Gagal'
}

/**
 * Tabel 4.2 (poin 4.2.2) — only the 5 scenarios that actually exercise MQTT
 * end-to-end (device ON/OFF, sensor monitoring, scheduler, rule). Latensi E2E is
 * `'_'` for scheduler/rule per poin 4/34: waiting for a schedule/condition to
 * fire is never counted as ordinary end-to-end latency.
 */
export function buildTable42(
  dataset: FunctionalTestCase[],
  results: FunctionalEvaluationRecord[]
): Table42Row[] {
  const resultById = new Map(results.map((r) => [r.testCaseId, r]))

  const rows = dataset
    .map((testCase) => {
      const meta = SCENARIO_META[testCase.id]
      const record = resultById.get(testCase.id)
      if (meta == null || record == null || !meta.inTable42) return null

      const latency: number | string =
        testCase.kind === 'scheduler' || testCase.kind === 'rule'
          ? '_'
          : (record.endToEndLatencyMs ?? '_')

      return {
        sortNo: meta.no,
        Skenario: meta.skenario,
        'Integrasi MQTT': (record.mqttSuccess ? 'Berhasil' : 'Gagal') as
          | 'Berhasil'
          | 'Gagal',
        'Hasil Eksekusi': describeExecutionResult(testCase.kind, record),
        'Latensi E2E (ms)': latency,
        Status: (record.integrationSuccess ? 'Berhasil' : 'Gagal') as 'Berhasil' | 'Gagal'
      }
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => a.sortNo - b.sortNo)

  return rows.map((row, index) => ({
    No: index + 1,
    Skenario: row.Skenario,
    'Integrasi MQTT': row['Integrasi MQTT'],
    'Hasil Eksekusi': row['Hasil Eksekusi'],
    'Latensi E2E (ms)': row['Latensi E2E (ms)'],
    Status: row.Status
  }))
}

export interface FunctionalSummary {
  totalScenarios: number
  successCount: number
  successRatePct: number
  table42AverageLatencyMs: number | null
}

export function buildFunctionalSummary(
  table41: Table41Row[],
  table42: Table42Row[]
): FunctionalSummary {
  const successCount = table41.filter((r) => r.Status === 'Berhasil').length
  const latencies = table42
    .map((r) => r['Latensi E2E (ms)'])
    .filter((v): v is number => typeof v === 'number')

  return {
    totalScenarios: table41.length,
    successCount,
    successRatePct: table41.length === 0 ? 0 : (successCount / table41.length) * 100,
    table42AverageLatencyMs:
      latencies.length === 0
        ? null
        : latencies.reduce((a, b) => a + b, 0) / latencies.length
  }
}
