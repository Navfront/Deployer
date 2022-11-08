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

      // get current containers
      const current = await this.mem.getContainers()
      console.log('curr', current.containers)

      // killing job
      for (const containerName of job.kill) {
        const condidate = current.containers.find(c => c.image === containerName)
        if (condidate != null) {
          if (condidate.isOnline) {
            await this.emitAll(MsgTypes.message, await ex(`docker stop ${condidate.id}`))
          }
          await this.emitAll(MsgTypes.message, await ex(`docker rm ${condidate.id}`))
        }
      }

      // using job
      await this.emitAll(MsgTypes.message, await ex(`docker run -d -p 80:80 ${job.use[0]}`))
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
