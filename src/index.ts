import dotenv from 'dotenv'
import { SocketServer } from './server.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? '1234')

const server = new SocketServer({ port: PORT })

server.on('connect', () => {
  console.log('connected!')
})
server.on('disconnect', () => {
  console.log('disconnected!')
})
server.run()
