import express from 'express'
import { getContactsByUserId, getContactById, addMessageToContact, getMessagesByContactId, createContact, deleteContact } from '../controllers/contacts.controller.js'

const contactsRouter = express.Router()

contactsRouter.get('/:userId', getContactsByUserId)
contactsRouter.get('/data/:_id', getContactById)
contactsRouter.post('/:id/mensajes', addMessageToContact)
contactsRouter.get('/:id/mensajes', getMessagesByContactId)
contactsRouter.post('/', createContact)
contactsRouter.put('/:id', deleteContact)


export default contactsRouter
