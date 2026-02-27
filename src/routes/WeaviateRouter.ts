import { Router } from 'express'
import { WeaviateController } from '../controllers/weaviate'
import { MiddleWares } from '../middlewares'
import { indexToWeaviateSchema } from '../schemas/weaviateSchema'

const WeaviateRoute = Router()

WeaviateRoute.use(MiddleWares.useAuthorization)

WeaviateRoute.post(
  '/index',
  MiddleWares.validate({ body: indexToWeaviateSchema }),
  WeaviateController.indexToWeaviate
)

export default WeaviateRoute
