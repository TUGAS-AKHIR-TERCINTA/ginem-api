import { Router } from 'express'
import { SchedulerLogController } from '../controllers/schedulerLog/index'
import { MiddleWares } from '../middlewares/index'
import {
  findDetailSchedulerLogSchema,
  removeSchedulerLogSchema
} from '../schemas/SchedulerLogSchema'
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

SchedulerLogRoute.delete(
  '/:schedulerLogId',
  MiddleWares.validate({ params: removeSchedulerLogSchema }),
  SchedulerLogController.remove
)

export default SchedulerLogRoute
