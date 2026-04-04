import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { LLMModelService } from '../../services/LLMModel.service'
import { handleError } from '../../utilities/requestHandler'
import { ResponseData } from '../../utilities/response'
import {
  IFindAllLLMModel,
  ILLMModelIdParam,
  ISelectLLMModel
} from '../../schemas/LLMModelSchema'

export const findAll = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query = req.query as unknown as IFindAllLLMModel
    const result = await LLMModelService.findAll(query)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}

export const findDetail = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const params = req.params as unknown as ILLMModelIdParam
    const result = await LLMModelService.findById(params.id)
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}

export const selectModel = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body as unknown as ISelectLLMModel
    await LLMModelService.selectModel(payload.modelId)

    return res
      .status(StatusCodes.OK)
      .json(ResponseData.success({ message: 'Model selected successfully' }))
  } catch (err) {
    return handleError(res, err)
  }
}

export const getSelectedModel = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const result = await LLMModelService.getSelectedModel()
    return res.status(StatusCodes.OK).json(ResponseData.success({ data: result }))
  } catch (err) {
    return handleError(res, err)
  }
}
