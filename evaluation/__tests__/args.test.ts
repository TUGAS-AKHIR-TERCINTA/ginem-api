import { parseCliArgs } from '../cli/args'

describe('parseCliArgs', () => {
  it('defaults to mode=llm-eval and models=all with no flags', () => {
    expect(parseCliArgs([])).toEqual({ mode: 'llm-eval', models: 'all' })
  })

  it('parses --model all --repetitions 3', () => {
    const args = parseCliArgs(['--model', 'all', '--repetitions', '3'])
    expect(args.models).toBe('all')
    expect(args.repetitions).toBe(3)
  })

  it('parses a comma-separated --model list', () => {
    const args = parseCliArgs([
      '--model',
      'openai:gpt-5.6-terra,anthropic:claude-sonnet-5'
    ])
    expect(args.models).toEqual(['openai:gpt-5.6-terra', 'anthropic:claude-sonnet-5'])
  })

  it('parses --dataset --output --resume as plain strings', () => {
    const args = parseCliArgs([
      '--dataset',
      './evaluation/datasets/dataset.json',
      '--output',
      './evaluation/results',
      '--resume',
      'run-2026-08-19-1200'
    ])
    expect(args.dataset).toBe('./evaluation/datasets/dataset.json')
    expect(args.output).toBe('./evaluation/results')
    expect(args.resume).toBe('run-2026-08-19-1200')
  })

  it('parses --category into a validated list of DatasetCategory', () => {
    const args = parseCliArgs(['--category', 'simple,complex'])
    expect(args.categories).toEqual(['simple', 'complex'])
  })

  it('rejects an invalid --category value', () => {
    expect(() => parseCliArgs(['--category', 'not-a-real-category'])).toThrow()
  })

  it('accepts --mode functional and --mode report', () => {
    expect(parseCliArgs(['--mode', 'functional']).mode).toBe('functional')
    expect(parseCliArgs(['--mode', 'report']).mode).toBe('report')
  })

  it('rejects an invalid --mode value', () => {
    expect(() => parseCliArgs(['--mode', 'bogus'])).toThrow()
  })

  it('accepts --dry-run as a no-op flag', () => {
    expect(() => parseCliArgs(['--dry-run'])).not.toThrow()
  })

  it('rejects an unknown flag', () => {
    expect(() => parseCliArgs(['--not-a-flag'])).toThrow('Unknown argument')
  })

  it('rejects a flag missing its value', () => {
    expect(() => parseCliArgs(['--repetitions'])).toThrow('Missing value')
  })

  it('rejects a non-positive --repetitions', () => {
    expect(() => parseCliArgs(['--repetitions', '0'])).toThrow()
  })
})
