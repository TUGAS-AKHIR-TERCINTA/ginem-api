import { findAll } from './llmModel'
import { findDetail } from './llmModel'
import { selectModel } from './llmModel'
import { getSelectedModel } from './llmModel'

export const SettingsController = {
  findAllLLMModel: findAll,
  findDetailLLMModel: findDetail,
  selectLLMModel: selectModel,
  getSelectedLLMModel: getSelectedModel
}
