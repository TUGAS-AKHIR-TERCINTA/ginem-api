import fs from 'fs'
import { parseDatasetFile, type DatasetCase } from './dataset.schema'
import {
  parseFunctionalDatasetLine,
  type FunctionalTestCase
} from './functionalDataset.schema'

function readLines(filePath: string): string[] {
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
}

/** dataset.json is a single pretty-printed JSON array — see dataset.schema.ts. */
export function loadDataset(filePath: string): DatasetCase[] {
  return parseDatasetFile(fs.readFileSync(filePath, 'utf-8'))
}

export function loadFunctionalDataset(filePath: string): FunctionalTestCase[] {
  return readLines(filePath).map((line, i) => parseFunctionalDatasetLine(line, i + 1))
}
