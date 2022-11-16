export interface Container {
  id: string
  image: string
  isOnline: boolean
  names: string
  ports: string
  created: string
}

export interface GetContainers {
  error: string | null
  raw: string
  containers: Container[]
}
