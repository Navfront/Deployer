import { ex } from './executer.js'

interface Containers {
  id: string
  image: string
  isOnline: boolean
  names: string
  ports: string
  created: string
}

interface Job {
  'commit': string | null
  'kill': string[]
  'delete': string[]
  'use': string[]
}

interface GetContainers {
  raw: string
  containers: Containers[]
}

export class Mem {
  private containers: Containers[] = []
  private readonly jobStack: Job[] = []

  private parseContainers (str: string): any[] {
    const result = str.split(/\n/).slice(1).filter(it => it !== '')
    return result.map(rawContainer => {
      const splitted = rawContainer.split(/\s{3,}/)
      return {
        id: splitted[0],
        images: splitted[1],
        isOnline: !/Exited/gi.test(splitted[4]),
        ports: splitted[5]
      }
    })
  }

  async getContainers (): Promise<GetContainers> {
    const raw = await ex('docker ps -a')
    this.containers = this.parseContainers(raw)
    return {
      raw,
      containers: this.containers
    }
  }

  pushJob (job: Job): void {
    console.log('Pushing job..', job)
    this.jobs.push(job)
  }

  get jobs (): Job[] {
    return this.jobStack
  }

  clearJobs (): void {
    console.log('Clear all jobs..')
    this.jobStack.length = 0
  }
}
