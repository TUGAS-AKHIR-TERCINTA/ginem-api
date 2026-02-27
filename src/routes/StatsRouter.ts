import { Router } from 'express'
import { StatsController } from '../controllers/stats'
import { MiddleWares } from '../middlewares'

const StatsRoute = Router()

StatsRoute.use(MiddleWares.useAuthorization)

StatsRoute.get('/', StatsController.getCounts)

export default StatsRoute
