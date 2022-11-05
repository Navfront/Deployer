import cors from 'cors'
import express, { Application } from 'express'
import http, { createServer } from 'http'
import { Server } from 'socket.io'

type OnCallback = (...args: any[]) => Promise<void>
interface Options {
  port: number
}

export class SocketServer {
  private readonly expressApp: Application
  private readonly httpServer: http.Server
  private readonly io: Server
  private readonly port: string

  constructor (options: Options) {
    this.expressApp = express().use(cors())
    this.expressApp.use(express.static('./public'))
    this.httpServer = createServer(this.expressApp)
    this.io = new Server(this.httpServer)
    this.port = String(options.port)
  }

  run (): void {
    this.httpServer.listen(this.port, () => {
      console.log(`Server started on ${this.port} port`)
    })
  }

  on (type: string, callback: OnCallback): void {
    this.io.on(type, callback)
  }
}
