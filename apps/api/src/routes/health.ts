import { Router } from 'express'
import { z } from 'zod'

const healthSchema = z.object({
  service: z.string(),
  status: z.literal('ok'),
  timestamp: z.string(),
  environment: z.string(),
})

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  const payload = {
    service: 'friendly-adventure-api',
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  }

  const result = healthSchema.parse(payload)

  res.json(result)
})
