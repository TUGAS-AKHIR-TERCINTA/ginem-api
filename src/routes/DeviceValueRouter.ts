import { Router } from 'express'
import { DeviceValueController } from '../controllers/deviceValue'

const DeviceValueRoute = Router()

DeviceValueRoute.get('/', DeviceValueController.findAll)
DeviceValueRoute.get('/detail/:deviceValueId', DeviceValueController.findDetail)
DeviceValueRoute.post('/', DeviceValueController.create)
DeviceValueRoute.patch('/:deviceValueId', DeviceValueController.update)
DeviceValueRoute.delete('/:deviceValueId', DeviceValueController.remove)

export default DeviceValueRoute
