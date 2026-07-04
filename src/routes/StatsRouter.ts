import { Router } from 'express'
import { StatsController } from '../controllers/stats/index'
import { MiddleWares } from '../middlewares/index'

const StatsRoute = Router()

StatsRoute.use(MiddleWares.useAuthorization)

StatsRoute.get('/', StatsController.getCounts)

export default StatsRoute
