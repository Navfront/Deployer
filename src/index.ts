import dotenv from 'dotenv'
import { ex } from './executer.js'
import { SocketServer } from './server.js'
import { Mem } from './mem.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? '1234')
const server = new SocketServer({ port: PORT })
const mem = new Mem()

server.on('connect', async (socket) => {
  console.log('connected!')

  socket.emit('message', await ex('docker -v'))
  socket.emit('message', await ex('docker ps -a'))

  // запрос по контейнерам
  socket.on('askcontainers', async () => {
    socket.emit('anscontainers', await mem.getContainers())
  })
})

server.on('disconnect', async () => {
  console.log('disconnected!')
})
server.run()
