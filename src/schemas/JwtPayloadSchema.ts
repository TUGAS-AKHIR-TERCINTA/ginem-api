import { z } from 'zod'

export const jwtPayloadSchema = z
  .object({
    userId: z.number().optional(),
    userRole: z.string().optional(),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
    iat: z.unknown().optional()
  })
  .optional()

export type JwtPayload = z.infer<typeof jwtPayloadSchema>
