import { DataTypes, type Model } from 'sequelize'
import { sequelizeInit } from '../configs/database'
import { BaseModelFields, type IBaseModelFields } from '../interfaces/baseModelFields'

export type ChatMessageRole = 'user' | 'assistant'
export type ChatMessageSource = 'web' | 'whatsapp'

export interface IChatMessageAttributes extends IBaseModelFields {
  chatMessageId: number
  userId: number
  sessionId: string
  role: ChatMessageRole
  content: string
  source: ChatMessageSource
}

export type IChatMessageCreationAttributes = Omit<
  IChatMessageAttributes,
  'chatMessageId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export interface ChatMessageInstance
  extends Model<IChatMessageAttributes, IChatMessageCreationAttributes>,
    IChatMessageAttributes {}

export const ChatMessageModel = sequelizeInit.define<ChatMessageInstance>(
  'ChatMessages',
  {
    ...BaseModelFields,
    chatMessageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sessionId: {
      type: DataTypes.STRING(191),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM('web', 'whatsapp'),
      allowNull: false,
      defaultValue: 'web'
    }
  },
  {
    tableName: 'chat_messages',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        name: 'chat_messages_user_session_created_idx',
        fields: ['user_id', 'session_id', 'created_at']
      }
    ]
  }
)
