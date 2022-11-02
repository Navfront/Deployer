import dotenv from 'dotenv'
import { Server } from './main.js'

dotenv.config()
const port = process.env.PORT ?? '1234'

const server = new Server(port)
server.run()
