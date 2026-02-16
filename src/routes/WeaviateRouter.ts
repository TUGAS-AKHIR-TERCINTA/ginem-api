import { Router } from 'express'
import { WeaviateController } from '../controllers/weaviate'
import { MiddleWares } from '../middlewares'

const WeaviateRoute = Router()

WeaviateRoute.post(
  '/index',
  MiddleWares.useAuthorization,
  WeaviateController.indexToWeaviate
)

export default WeaviateRoute
