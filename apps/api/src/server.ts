import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'

import { healthRouter } from './routes/health'

dotenv.config()

export function createServer() {
  const app = express()

  app.use(express.json())
  app.use(cors())
  app.use(helmet())

  app.use('/health', healthRouter)

  app.get('/', (_req, res) => {
    res.json({
      name: 'friendly-adventure',
      message: 'API ready',
      docs: '/health',
    })
  })

  return app
}
