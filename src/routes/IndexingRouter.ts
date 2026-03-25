import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { IndexingController } from '../controllers/indexing'

const IndexingRouter = Router()

IndexingRouter.use(MiddleWares.useAuthorization)

IndexingRouter.post('/index', IndexingController.indexingTextDocuments)
IndexingRouter.get('/index', IndexingController.findAllIndexings)
IndexingRouter.delete('/index/:id', IndexingController.removeIndexingById)

export default IndexingRouter
