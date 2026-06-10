import { Router } from 'express'
import { MiddleWares } from '../middlewares/index'
import { chatSchema, ttsPreviewSchema } from '../schemas/ChatSchema'
import { ChatController } from '../controllers/chat/index'

const ChatRoute = Router()

ChatRoute.use(MiddleWares.useAuthorization)

ChatRoute.get(
  '/tts-preview',
  MiddleWares.validate({ query: ttsPreviewSchema }),
  ChatController.ttsPreview
)

ChatRoute.post('/', MiddleWares.validate({ body: chatSchema }), ChatController.query)

export default ChatRoute
