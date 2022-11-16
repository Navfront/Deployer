import { Request, RequestHandler, Response } from 'express'

export type OnCallback = (...args: any[]) => Promise<void>

export interface Options {
  port: number
}

export interface ExpressCallBack extends RequestHandler {
  (req: Request, res: Response): Promise<void>
}
