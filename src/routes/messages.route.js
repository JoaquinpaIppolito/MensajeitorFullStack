import express from 'express'
import { addMessage, getLastMessageByContactId, getMessagesByContactId } from '../controllers/messages.controller.js'

const messagesRouter = express.Router()


messagesRouter.get('/:contactId', getMessagesByContactId)
messagesRouter.post('/:contactId', addMessage)
messagesRouter.get('/ultimo/:contactId', getLastMessageByContactId)
messagesRouter.get('/last/:contactId', getLastMessageByContactId)

export default messagesRouter
