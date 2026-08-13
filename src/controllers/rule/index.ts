export { createRule } from './create'
export { findAllRules } from './findAll'
export { findDetailRule } from './findDetail'
export { updateRule } from './update'
export { setRuleActive } from './setActive'
export { removeRule } from './remove'
export { findRuleExecutionLogs } from './findExecutionLogs'

import { createRule } from './create'
import { findAllRules } from './findAll'
import { findDetailRule } from './findDetail'
import { updateRule } from './update'
import { setRuleActive } from './setActive'
import { removeRule } from './remove'
import { findRuleExecutionLogs } from './findExecutionLogs'

export const RuleController = {
  create: createRule,
  findAll: findAllRules,
  findDetail: findDetailRule,
  update: updateRule,
  setActive: setRuleActive,
  remove: removeRule,
  findExecutionLogs: findRuleExecutionLogs
}
