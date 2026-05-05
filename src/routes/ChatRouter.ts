import { Router } from 'express'
import { MiddleWares } from '../middlewares/index'
import { chatSchema } from '../schemas/ChatSchema'
import { ChatController } from '../controllers/chat/index'

const ChatRoute = Router()

ChatRoute.use(MiddleWares.useAuthorization)

ChatRoute.post('/', MiddleWares.validate({ body: chatSchema }), ChatController.query)

export default ChatRoute
