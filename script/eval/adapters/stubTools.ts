import { tool } from '@langchain/core/tools'
import { EVAL_TOOL_DEFINITIONS } from '../schemas/tools.schema'

/**
 * Bindable LangChain tools that NEVER execute side effects.
 * Used only so the model can emit structured tool_calls for evaluation.
 */
export function createEvalStubTools() {
  return EVAL_TOOL_DEFINITIONS.map((def) =>
    tool(
      async () =>
        JSON.stringify({
          dryRun: true,
          message: 'Eval stub — tool not executed'
        }),
      {
        name: def.name,
        description: def.description,
        schema: def.schema
      }
    )
  )
}
