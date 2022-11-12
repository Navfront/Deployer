
import { Mem } from '../mem.js'
import { ex } from '../executer.js'
import { EmitAll, MsgTypes } from '../deployer.js'
import { dockerRun, getDockerVersion, rmDockerContainer, stopDockerContainer } from '../utils.js'

interface Container {
  id: string
  image: string
  isOnline: boolean
  names: string
  ports: string
  created: string
}

interface GetContainers {
  error: string | null
  raw: string
  containers: Container[]
}

export class Service {
  private containers: Container[] = []
  private readonly mem: Mem
  emitAll: EmitAll

  constructor (mem: Mem, emitAll: EmitAll) {
    this.mem = mem
    this.mem.subscribePushes(this.work.bind(this))
    this.emitAll = emitAll
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
    if (/error during connect/gi.test(raw)) {
      return {
        error: 'Error durning connect!',
        raw: '',
        containers: []
      }
    }
    this.containers = this.parseContainers(raw)
    return {
      error: null,
      raw,
      containers: this.containers
    }
  }

  private async work (): Promise<void> {
    let job = this.mem.shiftJob()
    if (job === null) {
      console.log('Nothing to do..')
    }
    while (job != null) {
      const version = await getDockerVersion()
      if (version.error != null) {
        await this.emitAll(MsgTypes.message, version.error)
      } else await this.emitAll(MsgTypes.message, version.message)

      console.log('doing job', job, 'left: ', this.mem.length)
      // get current containers
      const current = await this.getContainers()
      if (current.error != null) {
        await this.emitAll(MsgTypes.message, current.error)
      }

      console.log('curr', current.containers)
      // DOCKER STOP CONTAINERS FROM JOB
      for (const containerName of job.stops) {
        const condidate = this.containers.find(c => c.image === containerName)
        if (condidate != null) {
          if (condidate.isOnline) {
            const stopped = await stopDockerContainer(condidate.id)
            if (stopped.message != null) (await this.emitAll(MsgTypes.message, stopped.message))
            else {
              await this.emitAll(MsgTypes.message, stopped.error)
            }
          }
        }
      }

      // DOCKER DELETE CONTAINERS FROM JOB
      for (const conteinerName of job.deletes) {
        const filtredContainers = this.containers.filter(c => c.image === conteinerName)
        for (const condidate of filtredContainers) {
          if (condidate.isOnline) {
            await stopDockerContainer(condidate.id)
          }
          const removed = await rmDockerContainer(condidate.id)
          if (removed.message != null) {
            await this.emitAll(MsgTypes.message, removed.message)
          } else await this.emitAll(MsgTypes.message, removed.error)
        }
      }

      // DOCKER RUN..
      for (const containerName of job.runs) {
        const res = await dockerRun(`docker run -d -p 80:80 ${containerName}`)
        if (res.message !== null) {
          await this.emitAll(MsgTypes.message, res.message?.concat(` Image: ${containerName}`))
        } else await this.emitAll(MsgTypes.message, res.error)
      }
      job = this.mem.shiftJob()
    }
  }
}
