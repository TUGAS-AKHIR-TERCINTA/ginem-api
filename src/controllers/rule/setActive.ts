import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { RuleManagementService } from '../../services/rule'
import { handleError } from '../../utilities/requestHandler'
import type { ISetRuleActive } from '../../schemas/RuleSchema'

export const setRuleActive = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ISetRuleActive
    const result = await RuleManagementService.setActive(
      payload.ruleId,
      payload.isActive
    )
    return res.status(StatusCodes.OK).json(
      ResponseData.success({
        data: result,
        message: payload.isActive ? 'Rule activated' : 'Rule deactivated'
      })
    )
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
