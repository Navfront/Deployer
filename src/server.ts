import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Application, RequestHandler } from 'express'
import http, { createServer } from 'http'
import { Server } from 'socket.io'
import { ExpressCallBack, OnCallback, Options } from './types/socket-server-types'

export class SocketServer {
  private readonly expressApp: Application
  private readonly httpServer: http.Server
  private readonly io: Server
  private readonly port: string

  constructor (options: Options) {
    this.expressApp = express().use(cors()).use(express.json()).use(bodyParser.urlencoded({ extended: true }))
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

  async onPath (path: string, type: 'get' | 'post' = 'get', callback: ExpressCallBack): Promise<void> {
    switch (type) {
      case 'post':
        this.expressApp.post(path, callback as unknown as RequestHandler)
        break
      default:
        this.expressApp.get(path, callback as unknown as RequestHandler)
        break
    }
  }
}
