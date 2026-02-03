import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import logger from '../../logs'
import { IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { createArticleSchema } from '../../schemas/articleSchema'
import { ArticleModel } from '../../models/articleModel'

export const createArticle = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    createArticleSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)

  try {
    await ArticleModel.create(validatedData)
    const response = ResponseData.success({})

    logger.info('Article created successfully')
    return res.status(StatusCodes.CREATED).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
