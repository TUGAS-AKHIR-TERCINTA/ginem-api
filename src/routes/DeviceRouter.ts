import { Router } from 'express'
import { DeviceController } from '../controllers/device'

const DeviceRoute = Router()

DeviceRoute.get('/', DeviceController.findAll)
DeviceRoute.get('/detail/:deviceId', DeviceController.findDetail)
DeviceRoute.post('/', DeviceController.create)
DeviceRoute.patch('/:deviceId', DeviceController.update)
DeviceRoute.delete('/:deviceId', DeviceController.remove)

export default DeviceRoute
