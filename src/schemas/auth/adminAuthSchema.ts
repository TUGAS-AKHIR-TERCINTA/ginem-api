import Joi from 'joi'

export const adminRegisterSchema = Joi.object({
  userName: Joi.string().max(100).required(),
  userEmail: Joi.string().required(),
  userPassword: Joi.string().required()
})


export const adminLoginSchema = Joi.object({
  userEmail: Joi.string().required(),
  userPassword: Joi.string().required()
})

export const updatePasswordSchema = Joi.object({
  userPassword: Joi.string().min(6).required(),
  userEmail: Joi.string().required()
})
