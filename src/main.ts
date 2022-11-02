/* eslint-disable @typescript-eslint/space-before-function-paren */
import express from 'express'
import cors from 'cors'

export class Server {
  private readonly server = express().use(cors())
  private readonly port: string

  constructor(port: string) {
    this.port = String(port)
  }

  run(): void {
    this.server.listen(this.port, () => {
      console.log(`Server started on port ${this.port}`)
    })
  }
}
