import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { LLMModelService } from '../../services/llm'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import {
  type IFindAllLLMModel,
  type ILLMModelIdParam,
  type ISelectLLMModel
} from '../../schemas/LLMModelSchema'

export const findAll = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.query as unknown as IFindAllLLMModel
    const result = await LLMModelService.findAll(payload)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}

export const findDetail = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.params as unknown as ILLMModelIdParam
    const result = await LLMModelService.findById(payload.id)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}

export const selectModel = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as ISelectLLMModel
    await LLMModelService.selectModel(payload.modelId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Model selected successfully' }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}

export const getSelectedModel = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const result = await LLMModelService.getSelectedModel()
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (serverError) {
    return handleError(res, serverError)
  }
}
