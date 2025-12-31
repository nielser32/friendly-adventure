import { Router } from 'express'
import { z } from 'zod'

import { GraphService } from '../services/graphService'

const relationshipTypeSchema = z.enum(['relates_to', 'supports', 'contradicts', 'derives_from'])

const edgeInputSchema = z.object({
  type: relationshipTypeSchema,
  description: z.string().trim().max(500).optional(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
})

const edgeUpdateSchema = z
  .object({
    type: relationshipTypeSchema.optional(),
    description: z.string().trim().max(500).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field must be provided' })

export function createEdgesRouter(service: GraphService) {
  const router = Router()

  router.get('/', (_req, res) => {
    const edges = service.listEdges()
    res.json(edges)
  })

  router.post('/', (req, res, next) => {
    try {
      const input = edgeInputSchema.parse(req.body)
      const edge = service.createEdge(input)
      res.status(201).json(edge)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params)
      const edge = service.getEdge(params.id)
      res.json(edge)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params)
      const input = edgeUpdateSchema.parse(req.body)
      const edge = service.updateEdge(params.id, {
        ...input,
        description: input.description ?? undefined,
      })
      res.json(edge)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params)
      service.deleteEdge(params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  return router
}
