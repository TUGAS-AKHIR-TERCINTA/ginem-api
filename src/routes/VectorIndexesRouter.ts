import { Router } from 'express'
import { VectorIndexesController } from '../controllers/vectorIndexes'
import { MiddleWares } from '../middlewares'
import { findAllVectorIndexesSchema } from '../schemas/VectorIndexesSchema'

const VectorIndexesRoute = Router()

VectorIndexesRoute.use(MiddleWares.useAuthorization)

VectorIndexesRoute.get(
  '/',
  MiddleWares.validate({ query: findAllVectorIndexesSchema }),
  VectorIndexesController.findAll
)

export default VectorIndexesRoute
