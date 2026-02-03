import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import logger from '../../logs'
import { ValidationError } from 'joi'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { removeArticleSchema } from '../../schemas/articleSchema'
import { IArticleRemoveRequest } from '../../interfaces/article.request'
import { ArticleModel } from '../../models/articleModel'

export const removeArticle = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    removeArticleSchema,
    req.params
  ) as {
    error: ValidationError
    value: IArticleRemoveRequest
  }

  if (validationError) return handleValidationError(res, validationError)

  try {
    const result = await ArticleModel.findOne({
      where: {
        deleted: 0,
        articleId: validatedData.articleId
      }
    })

    if (result == null) {
      const message = `Article not found with ID: ${validatedData.articleId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    result.deleted = true
    await result.save()

    const response = ResponseData.success({ message: 'Article deleted successfully' })
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
