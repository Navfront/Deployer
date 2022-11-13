/* eslint-disable @typescript-eslint/restrict-template-expressions */
import fs from 'fs'

interface DComposeEnvironment {
  [key: string]: string
}

interface DComposeService {
  name: string
  image: string
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

export class DCompose {
  node: null | DComposeNode
  constructor () {
    this.node = null
  }

  writeDCSchemaToYML (dComposeNode: DComposeNode): void {
    const file = fs.createWriteStream('docker-compose.yml', { encoding: 'utf8' })
    file.write(`version: "${dComposeNode.version}"
services:
  `)
    for (const s of dComposeNode.services) {
      file.write(`${s.name}:
    image: "${s.image}"
    ports:
      - "${s.portOut}:${s.portIn}"
    ${(s.depends_on != null)
? `depends_on:
      - ${s.depends_on}`
: ''}
    restart: "${s.restart}"\n  `)
      if (s.environment != null) {
        file.write('  environment:\n')
        Object.entries(s.environment).forEach(([k, v]) => {
          file.write(`      ${k}: "${v}"\n`)
        })
        file.write('  ')
      }
    }
    file.end()
    file.close()
  }
}
