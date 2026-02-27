import { Router } from 'express'
import { MiddleWares } from '../middlewares'
import { chatSchema } from '../schemas/ChatSchema'
import { ChatController } from '../controllers/chat'

const ChatRoute = Router()

ChatRoute.use(MiddleWares.useAuthorization)

ChatRoute.post('/', MiddleWares.validate({ body: chatSchema }), ChatController.query)

export default ChatRoute
