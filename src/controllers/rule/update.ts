import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RuleManagementService } from '../../services/rule'
import { handleError } from '../../utilities/requestHandler'
import type { IUpdateRule } from '../../schemas/RuleSchema'

export const updateRule = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as IUpdateRule
    const result = await RuleManagementService.update(payload)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data: result, message: 'Rule updated successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
