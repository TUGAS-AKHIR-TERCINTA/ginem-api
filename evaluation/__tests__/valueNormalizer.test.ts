import { semanticEqual } from '../metrics/valueNormalizer'

describe('semanticEqual', () => {
  it('treats numeric strings and numbers as equal', () => {
    expect(semanticEqual(30, '30')).toBe(true)
    expect(semanticEqual('18', 18)).toBe(true)
  })

  it('normalizes whitespace in strings', () => {
    expect(semanticEqual('Smart Lamp Bedroom', '  Smart   Lamp Bedroom ')).toBe(true)
  })

  it('is case-insensitive for device-name-like strings (matches DB collation behavior)', () => {
    expect(semanticEqual('Lampu ruang tamu', 'lampu ruang tamu')).toBe(true)
  })

  it('compares arrays of objects order-insensitively', () => {
    const expected = [
      { deviceName: 'A', state: 'on' },
      { deviceName: 'B', state: 'off' }
    ]
    const actual = [
      { deviceName: 'B', state: 'off' },
      { deviceName: 'A', state: 'on' }
    ]
    expect(semanticEqual(expected, actual)).toBe(true)
  })

  it('detects a mismatched array element', () => {
    const expected = [{ deviceName: 'A', state: 'on' }]
    const actual = [{ deviceName: 'A', state: 'off' }]
    expect(semanticEqual(expected, actual)).toBe(false)
  })

  it('detects extra or missing array elements', () => {
    expect(semanticEqual([{ a: 1 }], [{ a: 1 }, { a: 2 }])).toBe(false)
  })

  it('compares nested objects recursively', () => {
    const expected = { trigger: { deviceName: 'Temp', metric: 'temperature' } }
    const actual = { trigger: { deviceName: 'Temp', metric: 'temperature' } }
    expect(semanticEqual(expected, actual)).toBe(true)
  })

  it('ignores extra valid fields the model adds beyond what the ground truth specifies', () => {
    // e.g. a rule condition where the model also fills in the optional
    // `unit`/`deviceName` schema fields (RuleSchema.ts) that the dataset didn't bother to assert
    const expected = { metric: 'temperature', operator: '==', threshold: 25 }
    const actual = {
      metric: 'temperature',
      operator: '==',
      threshold: 25,
      unit: 'celsius',
      deviceName: 'Suhu ruangan'
    }
    expect(semanticEqual(expected, actual)).toBe(true)
  })

  it('still detects a missing or wrong value for a key the ground truth does specify', () => {
    const expected = { metric: 'temperature', operator: '==', threshold: 25 }
    expect(semanticEqual(expected, { metric: 'temperature', operator: '==' })).toBe(false)
    expect(
      semanticEqual(expected, { metric: 'temperature', operator: '==', threshold: 30 })
    ).toBe(false)
  })

  it('treats undefined and null as equal to each other but not to 0 or empty string', () => {
    expect(semanticEqual(undefined, null)).toBe(true)
    expect(semanticEqual(undefined, 0)).toBe(false)
    expect(semanticEqual(null, '')).toBe(false)
  })
})
