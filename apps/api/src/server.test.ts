import request from 'supertest'

import { createServer } from './server'

describe('health endpoint', () => {
  const app = createServer()

  it('returns ok response', async () => {
    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        service: 'friendly-adventure-api',
        status: 'ok',
        environment: expect.any(String),
      }),
    )
  })
})
