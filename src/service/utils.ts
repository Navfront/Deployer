import { ExecutorReturn } from '../types/executor-types.js'
import { Container, Image } from '../types/service-types.js'
import { Version } from '../types/utils-types.js'
import { ex, exNewTerm } from './executer.js'

export function checkOnError (data: ExecutorReturn): boolean {
  if (data.error !== null) {
    return true
  }
  return false
}

export async function getDockerVersion (): Promise<ExecutorReturn> {
  const result = await ex('docker -v')
  if (/Docker version/gi.test(result)) {
    return { message: `Runing on ${result}` }
  }
  return { error: 'Failed to get version!' }
}

export async function stopDockerContainer (id: string): Promise<ExecutorReturn> {
  const result = await ex(`docker stop ${id}`)
  if (/\w{12}/gi.test(result)) {
    return { message: `Stopped container id: ${result}` }
  }
  return { error: result }
}

export async function rmDockerContainer (id: string): Promise<ExecutorReturn> {
  const result = await ex(`docker rm ${id}`)
  if (/\w{12}/gi.test(result)) {
    return { message: `Removed container id: ${result}` }
  }
  return { error: result }
}

export async function rmDockerImage (id: string): Promise<ExecutorReturn> {
  const result = await ex(`docker image rm ${id}`)
  if (/\w{12}/gi.test(result)) {
    console.log(`Removed image id: ${result}`)
    return { message: `Removed image id: ${result}` }
  }
  console.log(`Removed error id: ${result}`)
  return { error: result }
}

export async function dockerRun (command: string, messageCB: (data: any) => Promise<void>, errCB: (err: any) => Promise<void>): Promise<void> {
  exNewTerm(command, messageCB, errCB)
}

export function parseContainers (str: string): Container[] {
  const result = str.split(/\n/).slice(1).filter(it => it !== '')
  return result.map(rawContainer => {
    const splitted = rawContainer.split(/\s{3,}/)
    return {
      id: splitted[0],
      image: splitted[1],
      version: parseVesrion(splitted[1]),
      isOnline: !/Exited/gi.test(splitted[4]),
      ports: splitted[5],
      names: '',
      created: ''
    }
  })
}

export function parseImages (str: string): Image[] {
  const result = str.split(/\n/).slice(1).filter(it => it !== '')
  return result.map(rawContainer => {
    const splitted = rawContainer.split(/\s{3,}/)
    return {
      name: splitted[0],
      version: parseVesrion(splitted[1]),
      id: splitted[2],
      time: splitted[3],
      weight: splitted[4]
    }
  })
}

export function parseVesrion (str: string): Version | null {
  const testRx = /v[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}/i
  if (!testRx.test(str)) {
    return null
  }
  const vmatch = (str.match(testRx) as string[])[0]
  const rxMj = vmatch.match(/(?<=v)[0-9]{1,}/i) as string[]
  const rxMi = vmatch.match(/(?<=\d\.)([0-9]+)\./i) as string[]
  const rxPch = vmatch.match(/(?<=\d\.)[0-9]+$/i) as string[]
  const result = {
    mj: parseInt(rxMj[0]), mi: parseInt(rxMi[1]), pch: parseInt(rxPch[0])
  }
  return result
}

export function getNameFromImage (str: string): string {
  const rx = /\w+\/\w+(?=:v)/i
  const match = str.match(rx)
  if (match !== null) {
    return match[0]
  } else return 'undefined'
}
