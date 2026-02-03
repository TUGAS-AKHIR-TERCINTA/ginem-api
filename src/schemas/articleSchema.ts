import Joi from 'joi'
import { jwtPayloadSchema } from './jwtPayloadSchema'

export const createArticleSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  articleId: Joi.number().integer().positive().required(),
  articleTitle: Joi.string().max(100).required().allow(''),
  articleDescription: Joi.string().required().allow('')
})

export const updateArticleSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  articleId: Joi.number().integer().positive().required(),
  articleTitle: Joi.string().max(100).optional().allow(''),
  articleDescription: Joi.string().optional().allow('')
})

export const findDetailArticleSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  articleId: Joi.number().integer().positive().required()
})

export const removeArticleSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  articleId: Joi.number().integer().positive().required()
})

export const findAllArticleSchema = Joi.object({
  jwtPayload: jwtPayloadSchema,
  page: Joi.number().integer().optional(),
  size: Joi.number().integer().optional(),
  search: Joi.string().allow('').optional(),
  pagination: Joi.boolean().optional()
})
