import { type Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ResponseData } from '../../utilities/response'
import {
  handleServerError,
  handleValidationError,
  validateRequest
} from '../../utilities/requestHandler'
import logger from '../../logs'
import { type IAuthenticatedRequest } from '../../interfaces/shared/request.interface'
import { updateArticleSchema } from '../../schemas/articleSchema'
import { ArticleModel } from '../../models/articleModel'

export const updateArticle = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { error: validationError, value: validatedData } = validateRequest(
    updateArticleSchema,
    req.body
  )

  if (validationError) return handleValidationError(res, validationError)
  try {
    const existingArtilce = await ArticleModel.findOne({
      where: {
        deleted: 0,
        articleId: validatedData.articleId
      }
    })

    if (existingArtilce === null) {
      const message = `Article not found with ID: ${validatedData.articleId}`
      logger.warn(message)
      return res.status(StatusCodes.NOT_FOUND).json(ResponseData.error({ message }))
    }

    await ArticleModel.update(validatedData, {
      where: { deleted: 0, articleId: validatedData.articleId }
    })

    const response = ResponseData.success({ message: 'Article updated successfully' })
    logger.info('Article updated successfully')
    return res.status(StatusCodes.OK).json(response)
  } catch (serverError) {
    return handleServerError(res, serverError)
  }
}
