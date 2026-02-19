import { type ZodTypeAny } from 'zod'
import { type Request, type Response, type NextFunction } from 'express'

type RequestPart = 'body' | 'query' | 'params'

type SchemaMap = Partial<Record<RequestPart, ZodTypeAny>>

export const validate =
  (schemas: SchemaMap) => (req: Request, res: Response, next: NextFunction) => {
    const locations: RequestPart[] = ['body', 'query', 'params']

    for (const location of locations) {
      const schema = schemas[location]
      if (schema == null) continue

      const result = schema.safeParse((req as any)[location])

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.error.flatten()
        })
      }

      ;(req as any)[location] = result.data
    }

    return next()
  }
