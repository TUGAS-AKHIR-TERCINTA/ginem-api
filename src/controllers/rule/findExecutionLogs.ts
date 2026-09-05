import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RuleManagementService } from '../../services/rule'
import { handleError } from '../../utilities/requestHandler'
import type { IFindRuleExecutionLogs } from '../../schemas/RuleSchema'

export const findRuleExecutionLogs = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindRuleExecutionLogs
    const result = await RuleManagementService.listExecutionLogs(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
