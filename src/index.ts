import dotenv from 'dotenv'
import { Deployer } from './deployer.js'

dotenv.config()

const PORT = Number(process.env.PORT ?? '1234')

const dp = new Deployer({ port: PORT })

void dp.run()
