import { DeviceModel } from './DeviceModel'
import { RuleModel } from './RuleModel'
import { RuleTriggerModel } from './RuleTriggerModel'
import { RuleConditionModel } from './RuleConditionModel'
import { RuleActionModel } from './RuleActionModel'
import { RuleExecutionLogModel } from './RuleExecutionLogModel'

RuleModel.hasMany(RuleTriggerModel, {
  foreignKey: 'ruleId',
  as: 'triggers'
})
RuleTriggerModel.belongsTo(RuleModel, {
  foreignKey: 'ruleId',
  as: 'rule'
})
RuleTriggerModel.belongsTo(DeviceModel, {
  foreignKey: 'deviceId',
  as: 'device'
})

RuleModel.hasMany(RuleConditionModel, {
  foreignKey: 'ruleId',
  as: 'conditions'
})
RuleConditionModel.belongsTo(RuleModel, {
  foreignKey: 'ruleId',
  as: 'rule'
})
RuleConditionModel.belongsTo(DeviceModel, {
  foreignKey: 'deviceId',
  as: 'device'
})

RuleModel.hasMany(RuleActionModel, {
  foreignKey: 'ruleId',
  as: 'actions'
})
RuleActionModel.belongsTo(RuleModel, {
  foreignKey: 'ruleId',
  as: 'rule'
})
RuleActionModel.belongsTo(DeviceModel, {
  foreignKey: 'deviceId',
  as: 'device'
})

RuleModel.hasMany(RuleExecutionLogModel, {
  foreignKey: 'ruleId',
  as: 'executionLogs'
})
RuleExecutionLogModel.belongsTo(RuleModel, {
  foreignKey: 'ruleId',
  as: 'rule'
})

export {
  RuleModel,
  RuleTriggerModel,
  RuleConditionModel,
  RuleActionModel,
  RuleExecutionLogModel
}
