import express from 'express'
import statusRouter from './routes/status.route.js'
import authRouter from './routes/auth.route.js'
import mongoDB from './config/db.config.js'
import cors from 'cors'
import errorHandlerMiddleware from './middlewares/errorHandler.middleware.js'
import contactsRouter from './routes/contacts.route.js'
import messagesRouter from './routes/messages.route.js'
import { customCorsMiddleware } from './middlewares/cors.middleware.js'


const PORT = 3000
const app = express()


app.use(customCorsMiddleware)


//Middleware que habilita las consultas de origen cruzado
app.use(cors())

app.use(express.json({ limit: '2mb' }));

app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)
app.use('/api/contacts', contactsRouter)
app.use('/api/messages', messagesRouter)


app.use(errorHandlerMiddleware)

app.listen(PORT, ()=> {
    console.log(`El servidor se esta ejecutando en http://localhost:${PORT}`)
})