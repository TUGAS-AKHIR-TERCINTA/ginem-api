import { z } from 'zod'

export const findAllLLMModelQuerySchema = z.object({
  search: z.string().optional()
})

export const llmModelIdParamSchema = z.object({
  id: z.string().min(1)
})

export const selectLLMModelBodySchema = z.object({
  modelId: z.string().min(1)
})

export type IFindAllLLMModel = z.infer<typeof findAllLLMModelQuerySchema>
export type ILLMModelIdParam = z.infer<typeof llmModelIdParamSchema>
export type ISelectLLMModel = z.infer<typeof selectLLMModelBodySchema>
