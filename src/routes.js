import express from 'express'
import { createUser, loginUser } from './controllers/authController.js'
import { getUser, listUsers } from './controllers/userController.js'
import { createTicket, deleteTicket, detailTicket, listTicket, patchTicket, updateTicket } from './controllers/ticketsController.js'
import { createComments, listComments } from './controllers/commentsController.js'
import authorize from '../middlewares/authorizate.js'

export const authRoute = express.Router()
export const usersRoute = express.Router()
export const ticketsRoute = express.Router()



authRoute.post('/register', createUser)
authRoute.post('/login', loginUser)
usersRoute.get('/me', authorize(['user', 'admin']), getUser)
usersRoute.get('/', authorize(['admin']), listUsers)
ticketsRoute.post('/', authorize(['user', 'admin']), createTicket)
ticketsRoute.get('/', authorize(['user', 'admin']), listTicket)
ticketsRoute.get('/:id', authorize(['user', 'admin']), detailTicket)
ticketsRoute.patch('/:id', authorize(['admin']), patchTicket)
ticketsRoute.post('/:id/status', authorize(['admin']), updateTicket)
ticketsRoute.delete('/:id', authorize(['admin']), deleteTicket)
ticketsRoute.get('/:ticketId/comments', authorize(['user', 'admin']), listComments)
ticketsRoute.post('/:ticketId/comments', authorize(['user', 'admin']), createComments)

