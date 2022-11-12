import { exec, spawn } from 'child_process'

export const ex = async (command: string): Promise<string> => {
  const result = new Promise<string>((resolve) => {
    exec(command, (err, message) => {
      if (err != null) {
        resolve(err.message)
      } else if (message !== '') {
        resolve(message)
      } else resolve('...')
    })
  })
  return await result
}

export const exNewTerm = (command: string, mesCb: any, errCb: any): void => {
  const cmd = command.split(' ')
  console.log('runing command', cmd[0], [...cmd.slice(1)])
  try {
    const spawned = spawn(cmd[0], [...cmd.slice(1)])
    spawned.stdout.setEncoding('utf8')
    spawned.stdout.on('data', mesCb)
    spawned.stderr.setEncoding('utf8')
    spawned.stderr.on('data', errCb)
    setTimeout(() => {
      spawned.kill(); console.log('Close spawn process', spawned.pid)
    }, 30000)
  } catch (e) {
    console.log(e)
    errCb(e)
  }
}
