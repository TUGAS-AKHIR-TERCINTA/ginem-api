import Joi from 'joi'

export const requestOtpSchema = Joi.object({
  whatsappNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  otpType: Joi.string().valid('register', 'reset').required()
})

export const verifyOtpSchema = Joi.object({
  whatsappNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  otpCode: Joi.string().max(100).required()
})
