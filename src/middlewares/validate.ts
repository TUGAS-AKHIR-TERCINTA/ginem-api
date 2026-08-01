import { type ZodTypeAny } from 'zod'
import { type Request, type Response, type NextFunction } from 'express'

type RequestPart = 'body' | 'query' | 'params'

type SchemaMap = Partial<Record<RequestPart, ZodTypeAny>>

function getRequestPart(req: Request, location: RequestPart): unknown {
  if (location === 'body') return req.body
  if (location === 'query') return req.query
  return req.params
}

function setRequestPart(req: Request, location: RequestPart, value: unknown): void {
  if (location === 'body') {
    req.body = value
    return
  }
  if (location === 'query') {
    req.query = value as Request['query']
    return
  }
  req.params = value as Request['params']
}

export const validate =
  (schemas: SchemaMap) => (req: Request, res: Response, next: NextFunction) => {
    const locations: RequestPart[] = ['body', 'query', 'params']

    for (const location of locations) {
      const schema = schemas[location]
      if (schema == null) continue

      const result = schema.safeParse(getRequestPart(req, location))

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.error.flatten()
        })
      }

      setRequestPart(req, location, result.data)
    }

    next()
  }
