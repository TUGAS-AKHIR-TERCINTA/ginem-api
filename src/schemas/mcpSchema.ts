import { z } from 'zod'

/** Schema for MCP query endpoint: user message to the device agent */
export const mcpQuerySchema = z.object({
  message: z.string().min(1).max(2000)
})

export type McpQuerySchema = z.infer<typeof mcpQuerySchema>
