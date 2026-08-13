import { Router } from 'express'
import { RuleController } from '../controllers/rule/index'
import { MiddleWares } from '../middlewares/index'
import {
  createRuleSchema,
  findAllRulesSchema,
  findRuleByIdSchema,
  findRuleExecutionLogsSchema,
  setRuleActiveSchema,
  updateRuleSchema
} from '../schemas/RuleSchema'
import { allowAppRoles } from '../middlewares/appRole'

const RuleRoute = Router()

RuleRoute.use(MiddleWares.useAuthorization)

RuleRoute.get(
  '/',
  MiddleWares.validate({ query: findAllRulesSchema }),
  RuleController.findAll
)

RuleRoute.get(
  '/execution-logs',
  MiddleWares.validate({ query: findRuleExecutionLogsSchema }),
  RuleController.findExecutionLogs
)

RuleRoute.get(
  '/detail/:ruleId',
  MiddleWares.validate({ params: findRuleByIdSchema }),
  RuleController.findDetail
)

RuleRoute.post(
  '/',
  allowAppRoles('admin', 'user', 'superAdmin'),
  MiddleWares.validate({ body: createRuleSchema }),
  RuleController.create
)

RuleRoute.patch(
  '/',
  allowAppRoles('admin', 'user', 'superAdmin'),
  MiddleWares.validate({ body: updateRuleSchema }),
  RuleController.update
)

RuleRoute.patch(
  '/active',
  allowAppRoles('admin', 'user', 'superAdmin'),
  MiddleWares.validate({ body: setRuleActiveSchema }),
  RuleController.setActive
)

RuleRoute.delete(
  '/:ruleId',
  allowAppRoles('admin', 'user', 'superAdmin'),
  MiddleWares.validate({ params: findRuleByIdSchema }),
  RuleController.remove
)

export default RuleRoute
