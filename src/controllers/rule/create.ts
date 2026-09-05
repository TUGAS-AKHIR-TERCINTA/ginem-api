import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RuleManagementService } from '../../services/rule'
import { handleError } from '../../utilities/requestHandler'
import type { ICreateRule } from '../../schemas/RuleSchema'

export const createRule = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ICreateRule
    const result = await RuleManagementService.create({
      ...payload,
      userId: payload.userId ?? req.jwtPayload?.userId
    })
    return res
      .status(StatusCodes.CREATED)
      .json(ResponseData.success({ data: result, message: 'Rule created successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
