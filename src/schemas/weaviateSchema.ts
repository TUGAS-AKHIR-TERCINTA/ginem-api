import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

const indexItemSchema = Joi.object({
  text: Joi.string().required().allow(''),
  source: Joi.string().valid('pdf', 'text').required()
})

export const indexToWeaviateSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  objects: Joi.array().items(indexItemSchema).min(1).max(100).required()
})
