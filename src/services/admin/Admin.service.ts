import { Op, type WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'

import { UserModel, type IUserAttributes } from '../../models/UserModel'
import { Pagination } from '../../utilities/pagination'
import { AppError } from '../../utilities/AppError'
import logger from '../../utilities/logger'
import { hashPassword } from '../../utilities/scurePassword'
import {
  type ICreateAdmin,
  type IFindAllAdmin,
  type IUpdateAdmin
} from '../../schemas/AdminSchema'

export class AdminService {
  private static buildFindAllWhere (payload: IFindAllAdmin) {
    let where: WhereOptions<IUserAttributes> = {
      deleted: 0,
      userRole: 'admin'
    }

    if (payload.search != null && payload.search.trim() !== '') {
      const term = `%${payload.search.trim()}%`
      where = {
        ...where,
        [Op.or]: [{ userName: { [Op.like]: term } }, { userEmail: { [Op.like]: term } }]
      }
    }
    return where
  }

  static async findAll (payload: IFindAllAdmin) {
    try {
      const pager = new Pagination(payload.page, payload.size)

      const result = await UserModel.findAndCountAll({
        where: this.buildFindAllWhere(payload),
        order: [['userId', 'DESC']],
        attributes: { exclude: ['userPassword'] },
        ...(payload.pagination && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] findAll failed: ${String(serviceError)}`)
      throw new AppError('Failed to list admins', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async findById (userId: number) {
    try {
      const result = await UserModel.findOne({
        where: { userId, deleted: 0, userRole: 'admin' },
        attributes: { exclude: ['userPassword'] }
      })

      if (result == null) {
        throw AppError.notFound('Admin not found')
      }

      return result
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] findById failed: ${String(serviceError)}`)
      throw new AppError('Failed to fetch admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async create (payload: ICreateAdmin) {
    try {
      const existing = await UserModel.findOne({
        where: { deleted: 0, userEmail: payload.userEmail }
      })

      if (existing != null) {
        throw AppError.conflict('Email already registered')
      }

      await UserModel.create({
        userName: payload.userName,
        userEmail: payload.userEmail,
        userPassword: hashPassword(payload.userPassword),
        userRole: 'admin',
        userOnboardingStatus: payload.userOnboardingStatus ?? 'waiting'
      })
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] create failed: ${String(serviceError)}`)
      throw new AppError('Failed to create admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async update (payload: IUpdateAdmin) {
    try {
      if (payload.userEmail != null && payload.userEmail !== '') {
        const existing = await UserModel.findOne({
          where: { deleted: 0, userEmail: payload.userEmail }
        })
        if (existing != null && existing.userId !== payload.userId) {
          throw AppError.conflict('Email already in use')
        }
      }

      const updateData: Partial<IUserAttributes> = {}

      if (payload.userName != null) {
        updateData.userName = payload.userName
      }
      if (payload.userEmail != null) {
        updateData.userEmail = payload.userEmail
      }
      if (payload.userPassword != null) {
        updateData.userPassword = hashPassword(payload.userPassword)
      }
      if (payload.userOnboardingStatus != null) {
        updateData.userOnboardingStatus = payload.userOnboardingStatus
      }

      if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', StatusCodes.BAD_REQUEST)
      }

      const [affectedRows] = await UserModel.update(updateData, {
        where: { userId: payload.userId, deleted: 0, userRole: 'admin' }
      })

      if (affectedRows === 0) {
        throw AppError.notFound('Admin not found')
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] update failed: ${String(serviceError)}`)
      throw new AppError('Failed to update admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async remove (userId: number, requesterUserId: number): Promise<void> {
    try {
      if (userId === requesterUserId) {
        throw AppError.badRequest('Cannot delete your own admin account')
      }

      const user = await UserModel.findOne({
        where: { userId, deleted: 0, userRole: 'admin' }
      })

      if (user == null) {
        throw AppError.notFound('Admin not found')
      }

      const adminCount = await UserModel.count({
        where: { deleted: 0, userRole: 'admin' }
      })

      if (adminCount <= 1) {
        throw AppError.conflict('Cannot delete the last admin account')
      }

      await user.destroy()
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[AdminService] remove failed: ${String(serviceError)}`)
      throw new AppError('Failed to remove admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
