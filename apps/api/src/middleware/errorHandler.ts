import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import { ConflictError, NotFoundError } from '../errors'

interface ErrorResponse {
  message: string
  details?: unknown
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const payload: ErrorResponse = {
      message: 'Validation failed',
      details: error.flatten(),
    }
    res.status(400).json(payload)
    return
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message })
    return
  }

  if (error instanceof ConflictError) {
    res.status(409).json({ message: error.message })
    return
  }

  res.status(500).json({ message: 'Unexpected error' })
}
