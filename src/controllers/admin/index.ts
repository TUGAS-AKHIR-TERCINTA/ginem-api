import { createAdmin } from './create'
import { findAllAdmins } from './findAll'
import { findDetailAdmin } from './findDetail'
import { removeAdmin } from './remove'
import { updateAdmin } from './update'

export const AdminController = {
  findAll: findAllAdmins,
  findDetail: findDetailAdmin,
  create: createAdmin,
  update: updateAdmin,
  remove: removeAdmin
}
