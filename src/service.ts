
import { Mem } from './mem.js'
import { ex } from './executer.js'

interface Container {
  id: string
  image: string
  isOnline: boolean
  names: string
  ports: string
  created: string
}

interface GetContainers {
  raw: string
  containers: Container[]
}

export class Service {
  private containers: Container[] = []
  private readonly mem: Mem

  constructor (mem: Mem) {
    this.mem = mem
    this.mem.subscribePushes(this.work)
  }

  private parseContainers (str: string): Container[] {
    const result = str.split(/\n/).slice(1).filter(it => it !== '')
    return result.map(rawContainer => {
      const splitted = rawContainer.split(/\s{3,}/)
      return {
        id: splitted[0],
        image: splitted[1],
        isOnline: !/Exited/gi.test(splitted[4]),
        ports: splitted[5],
        names: '',
        created: ''
      }
    })
  }

  private async getContainers (): Promise<GetContainers> {
    const raw = await ex('docker ps -a')
    this.containers = this.parseContainers(raw)
    return {
      raw,
      containers: this.containers
    }
  }

  private work (): void {
    let job
    do {
      job = this.mem.shiftJob()
      console.log('doing job', job, 'left: ', this.mem.length)

      // await this.emitAll(MsgTypes.message, `Runing on ${await ex('docker -v')}`)

      // // get current containers
      // const current = await this.mem.getContainers()
      // console.log('curr', current.containers)

      // // killing job
      // for (const containerName of job.kill) {
      //   const condidate = current.containers.find(c => c.image === containerName)
      //   if (condidate != null) {
      //     if (condidate.isOnline) {
      //       await this.emitAll(MsgTypes.message, await ex(`docker stop ${condidate.id}`))
      //     }
      //     await this.emitAll(MsgTypes.message, await ex(`docker rm ${condidate.id}`))
      //   }
      // }

      // // using job
      // await this.emitAll(MsgTypes.message, await ex(`docker run -d -p 80:80 ${job.use[0]}`))
    } while (job != null)
  }
}
