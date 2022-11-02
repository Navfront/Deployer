import express from 'express'
import cors from 'cors'

export class Server {
  private readonly server = express().use(cors())
}
