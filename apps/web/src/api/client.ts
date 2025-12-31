import type { ZodSchema } from 'zod'
import { nodeSchema, traverseSchema, type NodeResponse, type TraverseResponse } from './schemas'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

type NodePayload = {
  title: string
  summary: string
  tags: string[]
}

type NodeUpdatePayload = Partial<NodePayload>

async function request<T>(path: string, options: RequestInit, schema?: ZodSchema<T>): Promise<T> {
  const url = new URL(path, API_BASE_URL)

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await extractErrorMessage(response)
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()
  return schema ? schema.parse(data) : (data as T)
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json()
    if (payload && typeof payload.message === 'string') {
      return payload.message
    }
  } catch {
    // ignore parsing failures and fall through to status text
  }

  return `${response.status} ${response.statusText}`
}

export const apiClient = {
  listNodes: async (): Promise<NodeResponse[]> => request('/nodes', { method: 'GET' }, nodeSchema.array()),
  getNode: async (id: string): Promise<NodeResponse> => request(`/nodes/${id}`, { method: 'GET' }, nodeSchema),
  createNode: async (input: NodePayload): Promise<NodeResponse> =>
    request('/nodes', { method: 'POST', body: JSON.stringify(input) }, nodeSchema),
  updateNode: async (id: string, input: NodeUpdatePayload): Promise<NodeResponse> =>
    request(`/nodes/${id}`, { method: 'PUT', body: JSON.stringify(input) }, nodeSchema),
  traverseFromNode: async (startId: string, depth: number): Promise<TraverseResponse> =>
    request('/graph/traverse', { method: 'POST', body: JSON.stringify({ startId, depth }) }, traverseSchema),
}

export type { NodePayload, NodeUpdatePayload }
export { API_BASE_URL }
