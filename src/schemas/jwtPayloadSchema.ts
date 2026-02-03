import Joi from 'joi'

export const jwtPayloadSchema = Joi.object({
    userId: Joi.number().optional(),
    userRole: Joi.string().optional(),
    userName: Joi.string().optional(),
    userEmail: Joi.string().optional(),
    iat: Joi.any().optional(),
  })