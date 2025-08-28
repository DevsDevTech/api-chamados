import express from 'express'
import { createUser, loginUser } from './controllers/authController.js'
import { getUser } from './controllers/userController.js'
import { createTicket, deleteTicket, detailTicket, listTicket, patchTicket, updateTicket } from './controllers/ticketsController.js'
import { createComments, listComments } from './controllers/commentsController.js'

export const authRoute = express.Router()
export const usersRoute = express.Router()
export const ticketsRoute = express.Router()



authRoute.post('/register', createUser)
authRoute.post('/login', loginUser)
usersRoute.get('/me', getUser)
ticketsRoute.post('/', createTicket)
ticketsRoute.get('/', listTicket)
ticketsRoute.get('/:id', detailTicket)
ticketsRoute.patch('/:id', patchTicket)
ticketsRoute.post('/:id/status', updateTicket)
ticketsRoute.delete('/:id', deleteTicket)
ticketsRoute.get('/:id/comments', listComments)
ticketsRoute.post('/:id/comments', createComments)

