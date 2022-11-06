
import { Job, Mem } from './mem.js'
import { SocketServer } from './server.js'
import { ex } from './executer.js'
import { Socket } from 'socket.io'

interface DeployerOptions {
  port: number
}

export class Deployer {
  private readonly server: SocketServer
  private readonly mem: Mem
  private readonly connections: Socket[]

  constructor (options: DeployerOptions) {
    this.server = new SocketServer({ port: options.port })
    this.mem = new Mem()
    this.connections = []
  }

  private async emitAll (type: string, data: Promise<string> | string | undefined): Promise<void> {
    for (const socket of this.connections) {
      socket.emit(type, await data)
    }
  }

  async run (): Promise<void> {
    await this.server.onPath('/dploy', 'post', (req, res) => {
      const job = req.body as Job
      this.mem.pushJob(job)
      void this.emitAll('message', `${String(new Date().toISOString())} JOB: Commit: ${job.commit ?? 'undefined'} Deploy: ${job.use.join(' | ')}`).then().catch()
      res.status(203).send('ok')
    })

    this.server.on('connect', async (socket) => {
      this.connections.push(socket)
      console.log(`Online: ${this.connections.length}`)
    })

    this.server.on('disconnect', async () => {
      console.log('disconnected!')
    })

    this.server.run()
  }
}
