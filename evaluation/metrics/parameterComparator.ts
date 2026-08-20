import { semanticEqual } from './valueNormalizer'
import type { ToolPairing } from './toolComparator'

export interface ParameterMismatch {
  tool: string
  key: string
  expected: unknown
  actual: unknown
}

export interface ParameterComparisonResult {
  parameterCorrect: boolean
  parametersChecked: number
  parametersCorrect: number
  missingParameters: Array<{ tool: string; key: string }>
  mismatchedParameters: ParameterMismatch[]
}

/**
 * Formula 2 (A_parameter, Bab III 3.11.3). Only checks parameters the ground truth
 * actually declares — "N_parameter diuji adalah jumlah seluruh parameter yang
 * seharusnya dihasilkan" (poin 9: not a raw string diff, missing/incomplete
 * parameters count as wrong).
 */
export function compareParameters(
  matchedPairs: ToolPairing[]
): ParameterComparisonResult {
  const missingParameters: Array<{ tool: string; key: string }> = []
  const mismatchedParameters: ParameterMismatch[] = []
  let parametersChecked = 0
  let parametersCorrect = 0

  for (const pair of matchedPairs) {
    for (const [key, expectedValue] of Object.entries(pair.expectedParameters)) {
      parametersChecked += 1
      const hasKey = Object.prototype.hasOwnProperty.call(pair.actualParameters, key)
      const actualValue = pair.actualParameters[key]

      if (!hasKey || actualValue === undefined) {
        missingParameters.push({ tool: pair.tool, key })
        continue
      }

      if (semanticEqual(expectedValue, actualValue)) {
        parametersCorrect += 1
      } else {
        mismatchedParameters.push({
          tool: pair.tool,
          key,
          expected: expectedValue,
          actual: actualValue
        })
      }
    }
  }

  return {
    parameterCorrect: missingParameters.length === 0 && mismatchedParameters.length === 0,
    parametersChecked,
    parametersCorrect,
    missingParameters,
    mismatchedParameters
  }
}
