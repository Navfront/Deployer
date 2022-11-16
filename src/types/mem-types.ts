import { DComposeNode } from './dcompose-types'

export interface Job {
  'runs': DComposeNode
}

export type SubscribeCallBack = (() => Promise<void>) | null
