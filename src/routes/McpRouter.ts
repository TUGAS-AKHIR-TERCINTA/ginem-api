import { Router } from 'express'
import { McpController } from '../controllers/mcp'
import { MiddleWares } from '../middlewares'
import { mcpQuerySchema } from '../schemas/mcpSchema'

const McpRoute = Router()

McpRoute.post('/', MiddleWares.validate({ body: mcpQuerySchema }), McpController.query)

export default McpRoute
