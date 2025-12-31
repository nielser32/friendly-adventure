import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'

import { errorHandler } from './middleware/errorHandler'
import { createEdgesRouter } from './routes/edges'
import { createGraphRouter } from './routes/graph'
import { healthRouter } from './routes/health'
import { createNodesRouter } from './routes/nodes'
import { GraphService } from './services/graphService'

dotenv.config()

export interface ServerOptions {
  graphService?: GraphService
}

export function createServer(options?: ServerOptions) {
  const app = express()
  const graphService = options?.graphService ?? new GraphService()

  app.use(express.json())
  app.use(cors())
  app.use(helmet())

  app.use('/health', healthRouter)
  app.use('/nodes', createNodesRouter(graphService))
  app.use('/edges', createEdgesRouter(graphService))
  app.use('/graph', createGraphRouter(graphService))

  app.get('/', (_req, res) => {
    res.json({
      name: 'friendly-adventure',
      message: 'API ready',
      docs: ['/health', '/nodes', '/edges', '/graph'],
    })
  })

  app.use(errorHandler)

  return app
}
