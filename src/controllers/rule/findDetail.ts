import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RuleManagementService } from '../../services/rule'
import { handleError } from '../../utilities/requestHandler'

export const findDetailRule = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const ruleId = Number(req.params.ruleId)
    const result = await RuleManagementService.findById(ruleId)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
