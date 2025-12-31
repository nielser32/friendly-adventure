import { Router } from 'express'
import { z } from 'zod'

import { GraphService } from '../services/graphService'

const pathQuerySchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
})

const traverseBodySchema = z.object({
  startId: z.string().uuid(),
  depth: z.number().int().min(1).max(5),
})

export function createGraphRouter(service: GraphService) {
  const router = Router()

  router.get('/path', (req, res, next) => {
    try {
      const query = pathQuerySchema.parse(req.query)
      const path = service.findPath(query.sourceId, query.targetId)
      res.json({ path })
    } catch (error) {
      next(error)
    }
  })

  router.post('/traverse', (req, res, next) => {
    try {
      const input = traverseBodySchema.parse(req.body)
      const result = service.traverse(input.startId, input.depth)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  return router
}
