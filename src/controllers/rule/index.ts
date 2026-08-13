import { createRule } from './create'
import { findAllRules } from './findAll'
import { findDetailRule } from './findDetail'
import { updateRule } from './update'
import { setRuleActive } from './setActive'
import { removeRule } from './remove'
import { findRuleExecutionLogs } from './findExecutionLogs'

export {
  createRule,
  findAllRules,
  findDetailRule,
  updateRule,
  setRuleActive,
  removeRule,
  findRuleExecutionLogs
}

export const RuleController = {
  create: createRule,
  findAll: findAllRules,
  findDetail: findDetailRule,
  update: updateRule,
  setActive: setRuleActive,
  remove: removeRule,
  findExecutionLogs: findRuleExecutionLogs
}
