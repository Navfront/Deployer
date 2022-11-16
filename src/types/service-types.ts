import { Version } from './utils-types'

export interface Container {
  id: string
  image: string
  version: Version | null
  isOnline: boolean
  names: string
  ports: string
  created: string
}

export interface Image {
  name: string
  version: Version | null
  id: string
  time: string
  weight: string
}

export interface GetContainers {
  error: string | null
  raw: string
  containers: Container[]
}

export interface GetImages extends Omit<GetContainers, 'containers'> {
  images: Image[]
}
