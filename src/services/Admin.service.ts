import { Op, type WhereOptions } from 'sequelize'
import { StatusCodes } from 'http-status-codes'

import { UserModel, type UserInstance, type IUserAttributes } from '../models/UserModel'
import { Pagination } from '../utilities/pagination'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'
import { hashPassword } from '../utilities/scurePassword'
import { ICreateAdmin, IFindAllAdmin, IUpdateAdmin } from '../schemas/AdminSchema'

export class AdminService {
  static async findAll(payload: IFindAllAdmin) {
    try {
      const { page = 1, size = 10, pagination = true, search } = payload
      const pager = new Pagination(Number(page) || 1, Number(size) || 10)

      let where: WhereOptions<IUserAttributes> = {
        deleted: 0,
        userRole: 'admin'
      }

      if (search != null && search.trim() !== '') {
        const term = `%${search.trim()}%`
        where = {
          ...where,
          [Op.or]: [{ userName: { [Op.like]: term } }, { userEmail: { [Op.like]: term } }]
        }
      }

      const result = await UserModel.findAndCountAll({
        where,
        order: [['userId', 'DESC']],
        attributes: { exclude: ['userPassword'] },
        ...(pagination === true && {
          limit: pager.limit,
          offset: pager.offset
        })
      })

      return pager.formatData(result)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] findAll failed: ${String(error)}`)
      throw new AppError('Failed to fetch admins', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * @throws {AppError} notFound when user is missing or not an admin
   */
  static async findById(userId: number) {
    try {
      const user = await UserModel.findOne({
        where: { userId, deleted: 0, userRole: 'admin' },
        attributes: { exclude: ['userPassword'] }
      })

      if (user == null) {
        throw AppError.notFound('Admin not found')
      }

      return user
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] findById failed: ${String(error)}`)
      throw new AppError('Failed to fetch admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async create(payload: ICreateAdmin) {
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] create failed: ${String(error)}`)
      throw new AppError('Failed to create admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  static async update(payload: IUpdateAdmin) {
    try {
      const user = await UserModel.findOne({
        where: { userId: payload.userId, deleted: 0, userRole: 'admin' }
      })

      if (user == null) {
        throw AppError.notFound('Admin not found')
      }

      if (payload.userEmail != null && payload.userEmail !== user.userEmail) {
        const taken = await UserModel.findOne({
          where: {
            deleted: 0,
            userEmail: payload.userEmail,
            userId: { [Op.ne]: payload.userId }
          }
        })
        if (taken != null) {
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
        return
      }

      await user.update(updateData)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] update failed: ${String(error)}`)
      throw new AppError('Failed to update admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Soft-delete an admin. Blocks deleting yourself and deleting the last admin.
   */
  static async remove(userId: number, requesterUserId: number): Promise<void> {
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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[AdminService] remove failed: ${String(error)}`)
      throw new AppError('Failed to delete admin', StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
