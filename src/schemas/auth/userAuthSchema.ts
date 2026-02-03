import Joi from 'joi'

export const userLoginSchema = Joi.object({
  userEmail: Joi.string().required(),
  userPassword: Joi.string().required(),
})

export const employeeRegistrationSchema = Joi.object({
  userName: Joi.string().optional().allow(''),
  userEmail: Joi.string().required(),
  userPassword: Joi.string().min(6).required(),
})

export const userUpdatePasswordSchema = Joi.object({
  userPassword: Joi.string().min(6).required(),
  userEmail: Joi.string().required()
})
