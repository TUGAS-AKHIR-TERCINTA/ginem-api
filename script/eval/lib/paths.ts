import fs from 'node:fs'
import path from 'node:path'
import { datasetSchema, type EvalDataset } from '../schemas/dataset.schema'

export const EVAL_ROOT = path.resolve(__dirname, '..')

export interface ModelConfig {
  id: string
  provider: 'openai' | 'deepseek' | string
  modelName: string
  temperature: number
  maxTokens: number
  inputPricePerMillion: number
  outputPricePerMillion: number
  enabled: boolean
}

export interface EvalRuntimeConfig {
  repetitions: number
  llmTimeoutMs: number
  mqttAckTimeoutMs: number
  integrationTimeoutMs: number
  defaultMode: 'dry-run' | 'real-device'
  requireEnableRealDeviceFlag?: boolean
  datasetPath: string
  modelsPath: string
  outputDir: string
  deviceAliases: Record<string, string>
  systemPrompt: string
  evalUserId?: number
}

export function readJsonFile<T>(absolutePath: string): T {
  const raw = fs.readFileSync(absolutePath, 'utf8')
  return JSON.parse(raw) as T
}

export function loadEvalConfig(
  configRelativePath = 'config/eval.config.json'
): EvalRuntimeConfig {
  return readJsonFile<EvalRuntimeConfig>(path.join(EVAL_ROOT, configRelativePath))
}

export function loadModelsConfig(modelsPath: string): ModelConfig[] {
  const absolute = path.isAbsolute(modelsPath)
    ? modelsPath
    : path.join(EVAL_ROOT, modelsPath)
  const data = readJsonFile<{ models: ModelConfig[] }>(absolute)
  return data.models.filter((m) => m.enabled)
}

export function loadDataset(datasetPath: string): EvalDataset {
  const absolute = path.isAbsolute(datasetPath)
    ? datasetPath
    : path.join(EVAL_ROOT, datasetPath)
  const parsed = datasetSchema.parse(readJsonFile(absolute))
  return parsed
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true })
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

export function writeText(filePath: string, data: string): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, data, 'utf8')
}

export function appendLog(filePath: string, line: string): void {
  ensureDir(path.dirname(filePath))
  fs.appendFileSync(filePath, `${line}\n`, 'utf8')
}

export function timestampSlug(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-')
}

export function resolveOutputPaths(outputDir: string, runId: string) {
  const root = path.isAbsolute(outputDir) ? outputDir : path.join(EVAL_ROOT, outputDir)
  return {
    root,
    raw: path.join(root, 'raw', runId),
    processed: path.join(root, 'processed', runId),
    logs: path.join(root, 'logs', runId)
  }
}
