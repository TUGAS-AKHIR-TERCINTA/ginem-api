import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { IndexingController } from '../controllers/indexing'
import {
  createIndexingBodySchema,
  findAllIndexingsSchema,
  deleteIndexingParamsSchema
} from '../schemas/IndexingSchema'

const IndexingRouter = Router()

IndexingRouter.use(MiddleWares.useAuthorization)

IndexingRouter.get(
  '/index',
  MiddleWares.validate({ query: findAllIndexingsSchema }),
  IndexingController.findAllIndexings
)

IndexingRouter.post(
  '/index',
  MiddleWares.validate({ body: createIndexingBodySchema }),
  IndexingController.indexingTextDocuments
)

IndexingRouter.delete(
  '/index/:id',
  MiddleWares.validate({ params: deleteIndexingParamsSchema }),
  IndexingController.removeIndexingById
)

export default IndexingRouter
