import dotenv from 'dotenv'
import { ex } from './executer.js'
import { SocketServer } from './server.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? '1234')
const server = new SocketServer({ port: PORT })

server.on('connect', async (socket) => {
  console.log('connected!')

  socket.emit('message', await ex('docker -v'))

  // получаем данные от клиента
  socket.on('hi', (data: any) => {
    console.log('hi', data)
  })
})

server.on('disconnect', async () => {
  console.log('disconnected!')
})
server.run()
