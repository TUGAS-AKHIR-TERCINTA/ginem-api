import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RuleManagementService } from '../../services/rule'
import { handleError } from '../../utilities/requestHandler'

export const removeRule = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const ruleId = Number(req.params.ruleId)
    const result = await RuleManagementService.remove(ruleId)
    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ data: result, message: 'Rule deleted successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
