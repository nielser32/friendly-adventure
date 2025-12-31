import { Router } from 'express'
import { z } from 'zod'

import { GraphService } from '../services/graphService'

const nodeInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  tags: z.array(z.string().trim().min(1)).default([]),
})

const nodeUpdateSchema = nodeInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field must be provided' })

export function createNodesRouter(service: GraphService) {
  const router = Router()

  router.get('/', (_req, res) => {
    const nodes = service.listNodes()
    res.json(nodes)
  })

  router.post('/', (req, res, next) => {
    try {
      const input = nodeInputSchema.parse(req.body)
      const node = service.createNode(input)
      res.status(201).json(node)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params)
      const node = service.getNode(params.id)
      res.json(node)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params)
      const input = nodeUpdateSchema.parse(req.body)
      const node = service.updateNode(params.id, input)
      res.json(node)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', (req, res, next) => {
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params)
      service.deleteNode(params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  return router
}
