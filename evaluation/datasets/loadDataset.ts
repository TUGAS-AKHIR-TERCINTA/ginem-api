import fs from 'fs'
import { parseDatasetLine, type DatasetCase } from './dataset.schema'
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

export function loadDataset(filePath: string): DatasetCase[] {
  return readLines(filePath).map((line, i) => parseDatasetLine(line, i + 1))
}

export function loadFunctionalDataset(filePath: string): FunctionalTestCase[] {
  return readLines(filePath).map((line, i) => parseFunctionalDatasetLine(line, i + 1))
}
