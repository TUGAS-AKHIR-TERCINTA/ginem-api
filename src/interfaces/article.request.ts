import { IPaginationRequest } from './shared/paginationRequest.interface'

export interface IArticleUpdateRequest {
  articleId: number
  articleTitle: number
  articleDescription: number
}

export interface IArticleFindAllRequest extends IPaginationRequest {}

export interface IArticleFindDetailRequest {
  articleId: number
}

export interface IArticleRemoveRequest extends IArticleFindDetailRequest {}
