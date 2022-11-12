
import { Job, Mem } from './mem.js'
import { SocketServer } from './server.js'
import { Socket } from 'socket.io'
import { Service } from './service/service.js'

interface DeployerOptions {
  port: number
}

export enum MsgTypes {
  message = 'message'
}

export type EmitAll = (type: string, data: Promise<string> | string | undefined) => Promise<void>

export class Deployer {
  private readonly server: SocketServer
  private readonly mem: Mem
  connections: Set<Socket>
  service: Service

  constructor (options: DeployerOptions) {
    this.server = new SocketServer({ port: options.port })
    this.mem = new Mem()
    this.service = new Service(this.mem, this.emitAll.bind(this))
    this.connections = new Set()
  }

  private async emitAll (type: string, data: Promise<string> | string | undefined): Promise<void> {
    for (const socket of this.connections) {
      const message = await data
      socket.emit(type, message)
    }
  }

  async run (): Promise<void> {
    // Deploy hand logic
    void this.server.onPath('/dploy', 'post', async (req, res) => {
      const job = req.body as Job
      await this.emitAll(MsgTypes.message, `${String(new Date().toISOString())} JOB: Commit: ${job.commit ?? 'undefined'} Deploy: ${Object.keys(job.runs.services).join(' ')}`)
      // Push job to mem-queue
      await this.mem.pushJob(job)

      res.status(203).send('Job pushed')
    })

    // On connect socket logic
    this.server.on('connect', async (socket: Socket) => {
      console.log(`connected id: ${socket.id}`)

      this.connections.add(socket)
      console.log(`Online: ${this.connections.size}`)

      socket.on('disconnect', (reason: string) => {
        console.log(`disconected id: ${socket.id}, reason: ${reason}`)
        this.connections.delete(socket)
        console.log(`Online: ${this.connections.size}`)
      })
    })

    this.server.run()
  }
}
