import Joi from 'joi'

/** Schema for MCP query endpoint: user message to the device agent */
export const mcpQuerySchema = Joi.object({
  message: Joi.string().min(1).max(2000).required().messages({
    'string.empty': 'message is required',
    'string.max': 'message must not exceed 2000 characters'
  })
})
