import { ex } from './executer.js'
import { Job, Mem } from './mem.js'
import { SocketServer } from './server.js'
import { Socket } from 'socket.io'

interface DeployerOptions {
  port: number
}

enum MsgTypes {
  message = 'message'
}

export class Deployer {
  private readonly server: SocketServer
  private readonly mem: Mem
  connections: Set<Socket>

  constructor (options: DeployerOptions) {
    this.server = new SocketServer({ port: options.port })
    this.mem = new Mem()
    this.connections = new Set()
  }

  private async emitAll (type: string, data: Promise<string> | string | undefined): Promise<void> {
    for (const socket of this.connections) {
      socket.emit(type, await data)
    }
  }

  async run (): Promise<void> {
    // Deploy hand logic
    void this.server.onPath('/dploy', 'post', async (req, res) => {
      const job = req.body as Job

      // memorize job to mem-stack
      this.mem.pushJob(job)

      await this.emitAll(MsgTypes.message, `${String(new Date().toISOString())} JOB: Commit: ${job.commit ?? 'undefined'} Deploy: ${job.use.join(' | ')}`)

      await this.emitAll(MsgTypes.message, `Runing on ${await ex('docker -v')}`)

      await this.emitAll(MsgTypes.message, '')

      res.status(203).send('ok')
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
