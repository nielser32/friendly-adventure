import { z } from 'zod'

export const relationshipTypeSchema = z.enum(['relates_to', 'supports', 'contradicts', 'derives_from'])

export const nodeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const edgeSchema = z.object({
  id: z.string().uuid(),
  type: relationshipTypeSchema,
  description: z.string().optional(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  createdAt: z.string(),
})

export const traverseSchema = z.object({
  startId: z.string().uuid(),
  depth: z.number().int(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
})

export type NodeResponse = z.infer<typeof nodeSchema>
export type EdgeResponse = z.infer<typeof edgeSchema>
export type TraverseResponse = z.infer<typeof traverseSchema>
