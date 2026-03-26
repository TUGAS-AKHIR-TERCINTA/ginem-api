import { Router } from 'express'
import { SchedulerLogController } from '../controllers/schedulerLog'
import { MiddleWares } from '../middlewares'
import { findDetailSchedulerLogSchema } from '../schemas/SchedulerLogSchema'
import { findAllAppLogsSchema } from '../schemas/AppLogSchema'

const SchedulerLogRoute = Router()

SchedulerLogRoute.use(MiddleWares.useAuthorization)

SchedulerLogRoute.get(
  '/',
  MiddleWares.validate({ query: findAllAppLogsSchema }),
  SchedulerLogController.findAll
)

SchedulerLogRoute.get(
  '/detail/:schedulerLogId',
  MiddleWares.validate({ params: findDetailSchedulerLogSchema }),
  SchedulerLogController.findDetail
)

export default SchedulerLogRoute
