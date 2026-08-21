import fs from 'fs'
import path from 'path'
import { parseDatasetFile, type DatasetCategory } from '../datasets/dataset.schema'

const datasetPath = path.join(__dirname, '..', 'datasets', 'dataset.json')

function loadDataset() {
  return parseDatasetFile(fs.readFileSync(datasetPath, 'utf-8'))
}

describe('dataset.json', () => {
  it('parses the whole array against the schema without error', () => {
    expect(() => loadDataset()).not.toThrow()
  })

  it('has unique ids', () => {
    const cases = loadDataset()
    const ids = cases.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('matches the agreed category distribution (35/25/20/10/10)', () => {
    const cases = loadDataset()
    const counts = cases.reduce<Record<DatasetCategory, number>>(
      (acc, c) => {
        acc[c.category] += 1
        return acc
      },
      { simple: 0, medium: 0, complex: 0, ambiguous: 0, invalid: 0 }
    )

    expect(counts).toEqual({
      simple: 35,
      medium: 25,
      complex: 20,
      ambiguous: 10,
      invalid: 10
    })
    expect(cases).toHaveLength(100)
  })

  it('every tool_call case declares at least one expected tool call', () => {
    const cases = loadDataset()
    for (const c of cases) {
      if (c.expected.behavior === 'tool_call') {
        expect(c.expected.toolCalls?.length ?? 0).toBeGreaterThan(0)
      }
    }
  })

  it('ambiguous and invalid cases never expect a tool call', () => {
    const cases = loadDataset()
    for (const c of cases) {
      if (c.category === 'ambiguous' || c.category === 'invalid') {
        expect(c.expected.behavior).not.toBe('tool_call')
      }
    }
  })
})
