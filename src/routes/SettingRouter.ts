import { Router } from 'express'

import { SettingsController } from '../controllers/settings'
import { MiddleWares } from '../middlewares'
import {
  findAllLLMModelQuerySchema,
  llmModelIdParamSchema,
  selectLLMModelBodySchema
} from '../schemas/LLMModelSchema'

const SettingRoute = Router()

SettingRoute.use(MiddleWares.useAuthorization)

SettingRoute.get(
  '/',
  MiddleWares.validate({ query: findAllLLMModelQuerySchema }),
  SettingsController.findAllLLMModel
)

SettingRoute.get('/selected', SettingsController.getSelectedLLMModel)

SettingRoute.get(
  '/:id',
  MiddleWares.validate({ params: llmModelIdParamSchema }),
  SettingsController.findDetailLLMModel
)

SettingRoute.post(
  '/select',
  MiddleWares.validate({ body: selectLLMModelBodySchema }),
  SettingsController.selectLLMModel
)

export default SettingRoute
