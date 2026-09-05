/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'

const { BaseModelFields } = require('../baseModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('rules', {
      ...BaseModelFields,
      rule_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      original_prompt: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      condition_logic: {
        type: DataTypes.ENUM('AND', 'OR'),
        allowNull: false,
        defaultValue: 'AND'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      cooldown_sec: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 60
      },
      last_triggered_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    })

    await queryInterface.createTable('rule_triggers', {
      ...BaseModelFields,
      rule_trigger_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      rule_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'rules',
          key: 'rule_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'device_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metric: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      event_type: {
        type: DataTypes.ENUM('telemetry'),
        allowNull: false,
        defaultValue: 'telemetry'
      }
    })

    await queryInterface.createTable('rule_conditions', {
      ...BaseModelFields,
      rule_condition_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      rule_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'rules',
          key: 'rule_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'device_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metric: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      operator: {
        type: DataTypes.ENUM('>', '>=', '<', '<=', '==', '!='),
        allowNull: false
      },
      threshold: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      unit: {
        type: DataTypes.STRING(32),
        allowNull: true
      }
    })

    await queryInterface.createTable('rule_actions', {
      ...BaseModelFields,
      rule_action_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      rule_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'rules',
          key: 'rule_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'device_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action_type: {
        type: DataTypes.ENUM('set_state'),
        allowNull: false,
        defaultValue: 'set_state'
      },
      state: {
        type: DataTypes.ENUM('on', 'off'),
        allowNull: false
      }
    })

    await queryInterface.createTable('rule_execution_logs', {
      ...BaseModelFields,
      rule_execution_log_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      rule_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'rules',
          key: 'rule_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_snapshot: {
        type: DataTypes.JSON,
        allowNull: false
      },
      condition_result: {
        type: DataTypes.JSON,
        allowNull: true
      },
      action_result: {
        type: DataTypes.JSON,
        allowNull: true
      },
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      latency_ms: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      }
    })

    await queryInterface.addIndex('rules', ['is_active', 'deleted'], {
      name: 'rules_active_deleted_idx'
    })
    await queryInterface.addIndex('rule_triggers', ['device_id', 'metric'], {
      name: 'rule_triggers_device_metric_idx'
    })
    await queryInterface.addIndex('rule_execution_logs', ['rule_id', 'created_at'], {
      name: 'rule_execution_logs_rule_created_idx'
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rule_execution_logs')
    await queryInterface.dropTable('rule_actions')
    await queryInterface.dropTable('rule_conditions')
    await queryInterface.dropTable('rule_triggers')
    await queryInterface.dropTable('rules')
  }
}
