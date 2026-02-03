import Joi from 'joi'

export const addTokenSchema = Joi.object({
  contractAddress: Joi.string().length(42).required()
})

export const findAllTokenSchema = Joi.object({
  page: Joi.number().optional(),
  size: Joi.number().optional(),
  pagination: Joi.boolean().default(true)
})
