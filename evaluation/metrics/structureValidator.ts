import type { z } from 'zod'
import { deviceTools } from '../../src/services/mcp/tools/index'

export interface StructureValidationResult {
  structureValid: boolean
  errors?: string[]
}

const schemaByToolName = new Map<string, z.ZodTypeAny>(
  deviceTools.map((t) => [t.name, t.schema as z.ZodTypeAny])
)

/**
 * Poin 10 (Structured Output Validity): validated against the SAME Zod schema the
 * production tool uses (src/services/mcp/tools/device/**), not a reimplementation —
 * "sesuai schema; semua required field tersedia; type benar; dapat diproses oleh
 * application layer tanpa memperbaiki struktur secara manual."
 */
export function validateStructure(
  toolName: string,
  parameters: unknown
): StructureValidationResult {
  const schema = schemaByToolName.get(toolName)
  if (schema == null) {
    return { structureValid: false, errors: [`Unknown tool: ${toolName}`] }
  }

  const result = schema.safeParse(parameters)
  if (result.success) {
    return { structureValid: true }
  }

  return {
    structureValid: false,
    errors: result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    )
  }
}
