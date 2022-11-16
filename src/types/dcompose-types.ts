import { Version } from './utils-types'

export interface DComposeEnvironment {
  [key: string]: string
}

export interface DComposeService {
  name: string
  image: string
  version: Version | null
  portIn: number
  portOut: number
  restart: string
  environment?: DComposeEnvironment
  depends_on?: string
}

export interface DComposeNode {
  version: number
  services: DComposeService[]
}
