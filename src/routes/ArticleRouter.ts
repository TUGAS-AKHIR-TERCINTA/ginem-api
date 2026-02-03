import { Router } from 'express'
import { ArticleController } from '../controllers/article'

const ArticleRoute = Router()

ArticleRoute.get('/', ArticleController.findAll)
ArticleRoute.post('/', ArticleController.create)
ArticleRoute.patch('/', ArticleController.update)
ArticleRoute.delete('/', ArticleController.remove)

export default ArticleRoute
