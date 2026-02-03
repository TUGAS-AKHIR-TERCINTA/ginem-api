import { Router } from 'express'
import { DeviceController } from '../controllers/device'

const DeviceRoute = Router()

DeviceRoute.get('/', DeviceController.findAll)
DeviceRoute.get('/detail/:deviceId', DeviceController.findDetail)
DeviceRoute.post('/', DeviceController.create)
DeviceRoute.patch('/', DeviceController.update)
DeviceRoute.delete('/', DeviceController.remove)

export default DeviceRoute
