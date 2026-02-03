import { Router } from 'express'
import { appChekController } from '../controllers/appCheck'

const HealthRoute = Router()

HealthRoute.get('/', appChekController.mainApp)
HealthRoute.get('/health', appChekController.healthCheck)

export default HealthRoute
