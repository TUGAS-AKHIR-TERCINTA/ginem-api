import fs from 'fs'
import path from 'path'
import { parseFunctionalDatasetLine } from '../datasets/functionalDataset.schema'

const datasetPath = path.join(__dirname, '..', 'datasets', 'functional-dataset.jsonl')

function loadFunctionalDataset() {
  const lines = fs
    .readFileSync(datasetPath, 'utf-8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
  return lines.map((line, i) => parseFunctionalDatasetLine(line, i + 1))
}

describe('functional-dataset.jsonl', () => {
  it('parses every line against the schema without error', () => {
    expect(() => loadFunctionalDataset()).not.toThrow()
  })

  it('has unique ids and covers all 8 scenarios from Tabel 4.1', () => {
    const cases = loadFunctionalDataset()
    const ids = cases.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(cases).toHaveLength(8)
  })

  it('every device_control case declares a deviceName for ACK polling', () => {
    const cases = loadFunctionalDataset()
    for (const c of cases) {
      if (c.kind === 'device_control') {
        expect(c.deviceName).toBeTruthy()
        expect(c.expectedFinalState).toMatch(/^[01]$/)
      }
    }
  })

  it('ambiguous and invalid cases never expect execution', () => {
    const cases = loadFunctionalDataset()
    for (const c of cases) {
      if (c.kind === 'ambiguous' || c.kind === 'invalid') {
        expect(c.expectExecution).toBe(false)
      }
    }
  })
})
