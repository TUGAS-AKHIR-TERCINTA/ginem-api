import { Router } from 'express'
import { WeaviateController } from '../controllers/weaviate'
import { MiddleWares } from '../middlewares'
import { indexToWeaviateSchema } from '../schemas/weaviateSchema'

const WeaviateRoute = Router()

WeaviateRoute.post(
  '/index',
  MiddleWares.useAuthorization,
  MiddleWares.validate({ body: indexToWeaviateSchema }),
  WeaviateController.indexToWeaviate
)

export default WeaviateRoute
