import { Router } from 'express'
import { DeviceItemController } from '../controllers/deviceItem'

const DeviceItemRoute = Router()

DeviceItemRoute.get('/', DeviceItemController.findAll)
DeviceItemRoute.get('/detail/:deviceItemId', DeviceItemController.findDetail)
DeviceItemRoute.post('/', DeviceItemController.create)
DeviceItemRoute.patch('/:deviceItemId', DeviceItemController.update)
DeviceItemRoute.delete('/:deviceItemId', DeviceItemController.remove)

export default DeviceItemRoute
