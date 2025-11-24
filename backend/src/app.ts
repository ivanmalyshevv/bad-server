import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import { apiLimiter } from './middlewares/rate-limit'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

app.use(helmet())

// Применить лимитинг запросов ко всем API маршрутам
app.use(apiLimiter)

const corsOptions = ORIGIN_ALLOW
    ? { origin: ORIGIN_ALLOW.split(','), credentials: true }
    : undefined
app.use(cors(corsOptions))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

// CSRF защита встроена: SameSite=strict cookies + JWT в Authorization header
app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
