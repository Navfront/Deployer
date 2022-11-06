import { exec } from 'child_process'

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
