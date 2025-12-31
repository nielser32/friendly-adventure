import request from 'supertest'

import { GraphRepository } from './repositories/graphRepository'
import { createServer } from './server'
import { GraphService } from './services/graphService'

describe('api server', () => {
  const buildServer = () => {
    const repository = new GraphRepository()
    const graphService = new GraphService({ repository })
    const app = createServer({ graphService })

    return { app, repository, graphService }
  }

  it('returns health response', async () => {
    const { app } = buildServer()
    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        service: 'friendly-adventure-api',
        status: 'ok',
        environment: expect.any(String),
      }),
    )
  })

  it('supports node CRUD with validation', async () => {
    const { app } = buildServer()

    const createResponse = await request(app)
      .post('/nodes')
      .send({ title: 'GraphQL', summary: 'A query language', tags: ['api', 'schema'] })
      .expect(201)

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'GraphQL',
        summary: 'A query language',
        tags: ['api', 'schema'],
      }),
    )

    await request(app)
      .post('/nodes')
      .send({ summary: 'Missing title' })
      .expect(400)

    const nodeId = createResponse.body.id

    const fetched = await request(app).get(`/nodes/${nodeId}`).expect(200)
    expect(fetched.body.title).toBe('GraphQL')

    const updated = await request(app)
      .put(`/nodes/${nodeId}`)
      .send({ summary: 'Updated summary' })
      .expect(200)

    expect(updated.body.summary).toBe('Updated summary')

    await request(app).delete(`/nodes/${nodeId}`).expect(204)

    await request(app).get(`/nodes/${nodeId}`).expect(404)
  })

  it('creates edges with validation and lists them', async () => {
    const { app } = buildServer()

    const firstNode = await request(app)
      .post('/nodes')
      .send({ title: 'Node A', summary: 'First node' })
      .expect(201)
    const secondNode = await request(app)
      .post('/nodes')
      .send({ title: 'Node B', summary: 'Second node' })
      .expect(201)

    const edgeResponse = await request(app)
      .post('/edges')
      .send({
        type: 'supports',
        sourceId: firstNode.body.id,
        targetId: secondNode.body.id,
        description: 'Edge between A and B',
      })
      .expect(201)

    expect(edgeResponse.body).toEqual(
      expect.objectContaining({
        type: 'supports',
        sourceId: firstNode.body.id,
        targetId: secondNode.body.id,
      }),
    )

    await request(app)
      .post('/edges')
      .send({
        type: 'relates_to',
        sourceId: firstNode.body.id,
        targetId: '00000000-0000-0000-0000-000000000000',
      })
      .expect(404)

    const edges = await request(app).get('/edges').expect(200)
    expect(edges.body).toHaveLength(1)
  })

  it('returns traversal data for graph queries', async () => {
    const { app } = buildServer()

    const nodeA = await request(app)
      .post('/nodes')
      .send({ title: 'A', summary: 'Start' })
      .then((res) => res.body)
    const nodeB = await request(app)
      .post('/nodes')
      .send({ title: 'B', summary: 'Middle' })
      .then((res) => res.body)
    const nodeC = await request(app)
      .post('/nodes')
      .send({ title: 'C', summary: 'End' })
      .then((res) => res.body)

    await request(app)
      .post('/edges')
      .send({ type: 'relates_to', sourceId: nodeA.id, targetId: nodeB.id })
      .expect(201)

    await request(app)
      .post('/edges')
      .send({ type: 'supports', sourceId: nodeB.id, targetId: nodeC.id })
      .expect(201)

    const pathResponse = await request(app)
      .get('/graph/path')
      .query({ sourceId: nodeA.id, targetId: nodeC.id })
      .expect(200)

    expect(pathResponse.body.path).toHaveLength(3)
    expect(pathResponse.body.path[0].title).toBe('A')

    const traversal = await request(app)
      .post('/graph/traverse')
      .send({ startId: nodeA.id, depth: 2 })
      .expect(200)

    expect(traversal.body.nodes).toHaveLength(3)
    expect(traversal.body.edges).toHaveLength(2)
  })
})
