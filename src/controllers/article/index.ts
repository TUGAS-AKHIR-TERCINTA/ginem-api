import { createArticle } from './create'
import { findAllArticle } from './findAll'
import { removeArticle } from './remove'
import { updateArticle } from './update'

export const ArticleController = {
  findAll: findAllArticle,
  create: createArticle,
  update: updateArticle,
  remove: removeArticle
}
