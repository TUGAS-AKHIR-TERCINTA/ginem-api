import { z } from 'zod'

export const adminRegisterSchema = z.object({
  userName: z.string().max(100).min(1),
  userEmail: z.string().min(1),
  userPassword: z.string().min(1)
})

export const adminLoginSchema = z.object({
  userEmail: z.string().min(1),
  userPassword: z.string().min(1)
})

export const updatePasswordSchema = z.object({
  userPassword: z.string().min(6),
  userEmail: z.string().min(1)
})

const stringAllowEmpty = () => z.string().or(z.literal(''))

export const userLoginSchema = z.object({
  userEmail: z.string().min(1),
  userPassword: z.string().min(1)
})

export const userRegistrationSchema = z.object({
  userName: stringAllowEmpty().optional(),
  userEmail: z.string().min(1),
  userPassword: z.string().min(6)
})

export const userUpdatePasswordSchema = z.object({
  userPassword: z.string().min(6),
  userEmail: z.string().min(1)
})

export type UserUpdatePasswordInput = z.infer<typeof userUpdatePasswordSchema>

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>

export type UserLoginInput = z.infer<typeof userLoginSchema>

export type AdminUpdatePasswordInput = z.infer<typeof updatePasswordSchema>

export type AdminLoginInput = z.infer<typeof adminLoginSchema>

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>
