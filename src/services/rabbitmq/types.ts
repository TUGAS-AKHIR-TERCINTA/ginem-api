import type { ChatAudioPayload } from '../chat'

export type ChatMessageSource = 'web' | 'whatsapp'

export interface WhatsappQuotedKey {
  remoteJid: string
  id: string
  fromMe?: boolean
  participant?: string
}

export interface WhatsappChatMeta {
  userId: number
  chatJid: string
  quotedKey?: WhatsappQuotedKey
}

export interface ChatQueueRequest {
  messageId: string
  source: ChatMessageSource
  message: string
  withAudio?: boolean
  whatsapp?: WhatsappChatMeta
}

export interface ChatQueueSuccessReply {
  messageId: string
  ok: true
  reply: string
  audio?: ChatAudioPayload
}

export interface ChatQueueErrorReply {
  messageId: string
  ok: false
  error: string
  statusCode?: number
}

export type ChatQueueReply = ChatQueueSuccessReply | ChatQueueErrorReply
