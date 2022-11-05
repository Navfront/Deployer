import { exec } from 'child_process'

export const ex = async (command: string): Promise<String> => {
  const result = new Promise<string>((resolve, reject) => {
    exec(command, (err, message) => {
      if (err != null) {
        reject(err)
      } else if (message !== '') {
        resolve(message)
      } else resolve('...')
    })
  })
  return await result
}
