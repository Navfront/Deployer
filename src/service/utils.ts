import { Container } from '../types/service-types.js'
import { ex, exNewTerm } from './executer.js'

interface ExecutorReturn {
  error?: string
  message?: string
}

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
      isOnline: !/Exited/gi.test(splitted[4]),
      ports: splitted[5],
      names: '',
      created: ''
    }
  })
}
