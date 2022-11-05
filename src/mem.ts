import { ex } from './executer.js'

interface Containers {
  id: string
  image: string
  isOnline: boolean
  names: string
  ports: string
  created: string
}

interface GetContainers {
  raw: string
  containers: Containers[]
}

export class Mem {
  private readonly containers: Containers[] = []

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

    return {
      raw,
      containers: this.parseContainers(raw)
    }
  }
}
