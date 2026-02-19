import { z } from 'zod'

export const requestOtpSchema = z.object({
  whatsappNumber: z.string().min(10).max(15),
  otpType: z.enum(['register', 'reset'])
})

export const verifyOtpSchema = z.object({
  whatsappNumber: z.string().min(10).max(15),
  otpCode: z.string().max(100)
})

export type RequestOtpSchema = z.infer<typeof requestOtpSchema>
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>
