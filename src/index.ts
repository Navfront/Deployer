import dotenv from 'dotenv'
import { SocketServer } from './server.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? '1234')

const server = new SocketServer({ port: PORT })

server.on('connect', (socket) => {
  console.log('connected!')

  let counter = 0
  setInterval(() => {
    // отправляем данные клиенту
    socket.emit('hello', ++counter)
  }, 1000)

  // получаем данные от клиента
  socket.on('hi', (data: any) => {
    console.log('hi', data)
  })
})
server.on('disconnect', () => {
  console.log('disconnected!')
})
server.run()
