import { Router } from 'express'
import { AppLogController } from '../controllers/appLog'

const AppLogRoute = Router()

AppLogRoute.get('/', AppLogController.findAll)
AppLogRoute.get('/detail/:logId', AppLogController.findDetail)

export default AppLogRoute
