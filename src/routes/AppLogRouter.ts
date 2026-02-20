import { Router } from 'express'
import { AppLogController } from '../controllers/appLog'
import { MiddleWares } from '../middlewares'
import { createAppLogSchema, findAllAppLogsSchema } from '../schemas/AppLogSchema'

const AppLogRoute = Router()

AppLogRoute.use(MiddleWares.useAuthorization)

AppLogRoute.post(
  '/',
  MiddleWares.validate({ body: createAppLogSchema }),
  AppLogController.create
)
AppLogRoute.get(
  '/',
  MiddleWares.validate({ query: findAllAppLogsSchema }),
  AppLogController.findAll
)

export default AppLogRoute
