import { ex } from './executer.js'

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

export async function dockerRun (command: string): Promise<ExecutorReturn> {
  const id = await ex(command)
  if (/\w{64}/i.test(id)) {
    return { message: `New container id: ${id}` }
  }
  return { error: 'Failed parse id!' }
}
