import { z } from 'zod'

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
  userRole: z.enum(['admin', 'user']).default('user'),
  userPassword: z.string().min(6)
})

export const userUpdatePasswordSchema = z.object({
  userPassword: z.string().min(6),
  userEmail: z.string().min(1)
})

export type IUpdateUserPassword = z.infer<typeof userUpdatePasswordSchema>

export type IUserRegistration = z.infer<typeof userRegistrationSchema>

export type IUserLogin = z.infer<typeof userLoginSchema>
