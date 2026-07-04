import { Router } from 'express'
import { MiddleWares } from '../middlewares/index'
import { IndexingController } from '../controllers/indexing/index'
import {
  findAllIndexingsSchema,
  deleteIndexingParamsSchema
} from '../schemas/IndexingSchema'

const IndexingRouter = Router()

IndexingRouter.use(MiddleWares.useAuthorization)

IndexingRouter.get(
  '/',
  MiddleWares.validate({ query: findAllIndexingsSchema }),
  IndexingController.findAllIndexings
)

IndexingRouter.post(
  '/',
  // MiddleWares.validate({ body: createIndexingBodySchema }),
  IndexingController.indexingTextDocuments
)

IndexingRouter.delete(
  '/:indexingId',
  MiddleWares.validate({ params: deleteIndexingParamsSchema }),
  IndexingController.removeIndexingById
)

export default IndexingRouter
