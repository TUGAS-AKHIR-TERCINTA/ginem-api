import { Router } from 'express'
import { SchedulerLogController } from '../controllers/schedulerLog'

const SchedulerLogRoute = Router()

SchedulerLogRoute.get('/', SchedulerLogController.findAll)
SchedulerLogRoute.get('/detail/:schedulerLogId', SchedulerLogController.findDetail)

export default SchedulerLogRoute
