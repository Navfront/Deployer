import dotenv from 'dotenv'
import { Deployer } from './deployer.js'
import { DCompose } from './service/dcompose.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? '1234')

const dp = new Deployer({ port: PORT })

void dp.run()

const d = new DCompose()
d.writeDCSchemaToYML({
  version: 3,
  services: [
    {
      dbmongo: {
        image: 'mongo:4.4.6',
        portIn: 27017,
        portOut: 27017,
        restart: 'always'
      }
    },
    {
      scserver: {
        image: 'dikardv/scsrv:0.1.1',
        portIn: 5500,
        portOut: 5500,
        environment: {
          PORT: '5500',
          SECRET: 'qwerty',
          MONGO: 'mongodb://dbmongo:27017'
        },
        depends_on: 'dbmongo',
        restart: 'always'
      }

    },
    {
      sccl: {
        image: 'dikardv/sccl:0.1.1',
        restart: 'always',
        portIn: 80,
        portOut: 3000
      }
    }
  ]
})
