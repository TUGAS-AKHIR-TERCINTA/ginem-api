import { Router } from 'express'
import { McpController } from '../controllers/mcp'

const McpRoute = Router()

McpRoute.post('/', McpController.query)

export default McpRoute
