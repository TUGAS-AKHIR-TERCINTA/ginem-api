import { Router } from 'express'

import { AdminController } from '../controllers/admin'
import { MiddleWares } from '../middlewares'
import {
  adminUserIdParamSchema,
  createAdminBodySchema,
  findAllAdminQuerySchema,
  updateAdminBodySchema
} from '../schemas/AdminSchema'

const AdminRoute = Router()

AdminRoute.use(MiddleWares.useAuthorization)
AdminRoute.use(MiddleWares.allowAppRoles('admin'))

AdminRoute.get(
  '/',
  MiddleWares.validate({ query: findAllAdminQuerySchema }),
  AdminController.findAll
)

AdminRoute.get(
  '/detail/:userId',
  MiddleWares.validate({ params: adminUserIdParamSchema }),
  AdminController.findDetail
)

AdminRoute.post(
  '/',
  MiddleWares.validate({ body: createAdminBodySchema }),
  AdminController.create
)

AdminRoute.patch(
  '/',
  MiddleWares.validate({ body: updateAdminBodySchema }),
  AdminController.update
)

AdminRoute.delete(
  '/:userId',
  MiddleWares.validate({ params: adminUserIdParamSchema }),
  AdminController.remove
)

export default AdminRoute
