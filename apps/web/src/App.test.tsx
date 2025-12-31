import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import type { TraverseResponse } from './api/schemas'
import App from './App'
import { renderWithProviders } from './testUtils'

const baseNode = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Graph Theory',
  summary: 'Fundamentals of semantic graphs',
  tags: ['math', 'networks'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

const secondNode = {
  id: '22222222-2222-4222-8222-222222222222',
  title: 'Design Systems',
  summary: 'Patterns that keep UI consistent',
  tags: ['design', 'ui'],
  createdAt: '2024-01-03T00:00:00.000Z',
  updatedAt: '2024-01-04T00:00:00.000Z',
}

const thirdNode = {
  id: '33333333-3333-4333-8333-333333333333',
  title: 'Research Methods',
  summary: 'How to run effective studies',
  tags: ['research'],
  createdAt: '2024-01-05T00:00:00.000Z',
  updatedAt: '2024-01-06T00:00:00.000Z',
}

function buildFetchMock({
  nodes,
  node,
  traverse,
  onUpdate,
}: {
  nodes?: typeof baseNode[]
  node?: typeof baseNode
  traverse?: TraverseResponse
  onUpdate?: (body: unknown) => typeof baseNode
}) {
  const requests: Array<{ path: string; method: string; body: unknown }> = []

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof URL ? input : new URL(typeof input === 'string' ? input : '', 'http://localhost')
    const path = url.pathname
    const method = (init?.method ?? 'GET').toUpperCase()
    const body = init?.body ? JSON.parse(init.body as string) : null
    requests.push({ path, method, body })

    const jsonResponse = (payload: unknown, status = 200) =>
      Promise.resolve(
        new Response(JSON.stringify(payload), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    if (method === 'GET' && path === '/nodes') {
      return jsonResponse(nodes ?? [])
    }

    if (method === 'GET' && path.startsWith('/nodes/')) {
      const targetId = path.replace('/nodes/', '')
      const match = nodes?.find((item) => item.id === targetId) ?? node
      if (!match) {
        return jsonResponse({ message: 'Not found' }, 404)
      }
      return jsonResponse(match)
    }

    if (method === 'POST' && path === '/graph/traverse') {
      return jsonResponse(traverse ?? null)
    }

    if (method === 'PUT' && path.startsWith('/nodes/')) {
      const updated = onUpdate ? onUpdate(body) : { ...(node ?? baseNode), ...(body as object) }
      return jsonResponse({ ...updated, updatedAt: '2024-02-02T00:00:00.000Z' })
    }

    return jsonResponse({ message: 'Unhandled request' }, 404)
  })

  return { fetchMock, requests }
}

describe('App experience', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists nodes and filters by search', async () => {
    const { fetchMock } = buildFetchMock({ nodes: [secondNode, thirdNode] })
    global.fetch = fetchMock as unknown as typeof fetch
    const user = userEvent.setup()

    renderWithProviders(<App />, { route: '/' })

    expect(await screen.findByRole('heading', { name: /browse nodes/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /Design Systems/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /Research Methods/i })).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: /search nodes/i })
    await user.clear(search)
    await user.type(search, 'design')

    await waitFor(() => expect(screen.getByText(/showing 1 of 2 nodes/i)).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /Design Systems/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Research Methods/i })).not.toBeInTheDocument()
  })

  it('shows node details with neighbor graph controls', async () => {
    const traverse = {
      startId: baseNode.id,
      depth: 2,
      nodes: [baseNode, secondNode, thirdNode],
      edges: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          type: 'supports',
          sourceId: baseNode.id,
          targetId: secondNode.id,
          createdAt: baseNode.createdAt,
        },
        {
          id: '55555555-5555-4555-8555-555555555555',
          type: 'relates_to',
          sourceId: baseNode.id,
          targetId: thirdNode.id,
          createdAt: baseNode.createdAt,
        },
      ],
    }

    const { fetchMock } = buildFetchMock({ node: baseNode, traverse })
    global.fetch = fetchMock as unknown as typeof fetch
    const user = userEvent.setup()

    renderWithProviders(<App />, { route: `/nodes/${baseNode.id}` })

    expect(await screen.findByRole('heading', { name: baseNode.title })).toBeInTheDocument()
    expect(screen.getByText(/Fundamentals of semantic graphs/i)).toBeInTheDocument()
    expect(await screen.findByText(/2 nearby nodes, 2 relationships/i)).toBeInTheDocument()

    const graph = screen.getByLabelText(/neighbor graph/i)
    graph.focus()
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getByText(/Pan 18px horizontally/i)).toBeInTheDocument())

    await user.keyboard('+')
    await waitFor(() => expect(screen.getByText(/Zoom 110%/i)).toBeInTheDocument())

    const neighborList = screen.getByRole('list')
    expect(within(neighborList).getAllByText(/Neighbor/i)).toHaveLength(2)
  })

  it('submits the edit form with updated fields', async () => {
    const updatedSummary = 'Updated summary for testing'
    const updatedTags = ['ux', 'research']

    const { fetchMock, requests } = buildFetchMock({
      node: thirdNode,
      onUpdate: (body) => ({
        ...thirdNode,
        ...(body as object),
      }),
    })

    global.fetch = fetchMock as unknown as typeof fetch
    const user = userEvent.setup()

    renderWithProviders(<App />, { route: `/nodes/${thirdNode.id}/edit` })

    const titleInput = await screen.findByLabelText(/Title/i)
    const summaryInput = screen.getByLabelText(/Summary/i)
    const tagsInput = screen.getByLabelText(/Tags/i)

    expect(titleInput).toHaveValue(thirdNode.title)
    await user.clear(summaryInput)
    await user.type(summaryInput, updatedSummary)
    await user.clear(tagsInput)
    await user.type(tagsInput, updatedTags.join(','))

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const putRequest = requests.find((request) => request.method === 'PUT' && request.path.includes(`/nodes/${thirdNode.id}`))
    expect(putRequest?.body).toMatchObject({ summary: updatedSummary, tags: updatedTags })
  })
})
