import { ConflictError, NotFoundError } from '../errors'
import {
  CreateEdgeInput,
  CreateNodeInput,
  EdgeRecord,
  GraphRepository,
  NodeRecord,
  RelationshipType,
  UpdateEdgeInput,
  UpdateNodeInput,
} from '../repositories/graphRepository'

export interface NodeResponse {
  id: string
  title: string
  summary: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface EdgeResponse {
  id: string
  type: RelationshipType
  description?: string
  sourceId: string
  targetId: string
  createdAt: string
}

export interface TraverseResult {
  startId: string
  depth: number
  nodes: NodeResponse[]
  edges: EdgeResponse[]
}

export interface GraphServiceOptions {
  repository?: GraphRepository
}

export class GraphService {
  private repository: GraphRepository

  constructor(options?: GraphServiceOptions) {
    this.repository = options?.repository ?? new GraphRepository()
  }

  listNodes(): NodeResponse[] {
    return this.repository.listNodes().map((node) => this.toNodeResponse(node))
  }

  getNode(id: string): NodeResponse {
    const node = this.repository.getNode(id)
    if (!node) {
      throw new NotFoundError('Node not found')
    }
    return this.toNodeResponse(node)
  }

  createNode(input: CreateNodeInput): NodeResponse {
    const node = this.repository.createNode(input)
    return this.toNodeResponse(node)
  }

  updateNode(id: string, input: UpdateNodeInput): NodeResponse {
    const updated = this.repository.updateNode(id, input)
    if (!updated) {
      throw new NotFoundError('Node not found')
    }
    return this.toNodeResponse(updated)
  }

  deleteNode(id: string): void {
    const removed = this.repository.deleteNode(id)
    if (!removed) {
      throw new NotFoundError('Node not found')
    }
  }

  listEdges(): EdgeResponse[] {
    return this.repository.listEdges().map((edge) => this.toEdgeResponse(edge))
  }

  getEdge(id: string): EdgeResponse {
    const edge = this.repository.getEdge(id)
    if (!edge) {
      throw new NotFoundError('Edge not found')
    }
    return this.toEdgeResponse(edge)
  }

  createEdge(input: CreateEdgeInput): EdgeResponse {
    const source = this.repository.getNode(input.sourceId)
    const target = this.repository.getNode(input.targetId)
    if (!source || !target) {
      throw new NotFoundError('Source or target node not found')
    }

    if (input.sourceId === input.targetId) {
      throw new ConflictError('Cannot create a relationship between the same node')
    }

    const edge = this.repository.createEdge(input)
    return this.toEdgeResponse(edge)
  }

  updateEdge(id: string, input: UpdateEdgeInput): EdgeResponse {
    const updated = this.repository.updateEdge(id, input)
    if (!updated) {
      throw new NotFoundError('Edge not found')
    }
    return this.toEdgeResponse(updated)
  }

  deleteEdge(id: string): void {
    const removed = this.repository.deleteEdge(id)
    if (!removed) {
      throw new NotFoundError('Edge not found')
    }
  }

  findPath(sourceId: string, targetId: string): NodeResponse[] {
    const source = this.repository.getNode(sourceId)
    const target = this.repository.getNode(targetId)
    if (!source || !target) {
      throw new NotFoundError('Source or target node not found')
    }

    const visited = new Set<string>()
    const queue: Array<{ id: string; path: NodeRecord[] }> = [{ id: sourceId, path: [source] }]

    while (queue.length > 0) {
      const { id, path } = queue.shift()!
      if (id === targetId) {
        return path.map((node) => this.toNodeResponse(node))
      }

      if (visited.has(id)) {
        continue
      }
      visited.add(id)

      const outgoingEdges = this.repository.getEdgesFrom(id)
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.targetId)) {
          const nextNode = this.repository.getNode(edge.targetId)
          if (nextNode) {
            queue.push({
              id: edge.targetId,
              path: [...path, nextNode],
            })
          }
        }
      }
    }

    return []
  }

  traverse(startId: string, depth: number): TraverseResult {
    const start = this.repository.getNode(startId)
    if (!start) {
      throw new NotFoundError('Start node not found')
    }

    const nodes = new Map<string, NodeRecord>()
    const edges = new Map<string, EdgeRecord>()

    const queue: Array<{ id: string; distance: number }> = [{ id: startId, distance: 0 }]

    while (queue.length > 0) {
      const { id, distance } = queue.shift()!
      if (distance > depth) continue

      const node = this.repository.getNode(id)
      if (node) {
        nodes.set(node.id, node)
      }

      if (distance === depth) continue

      const outgoing = this.repository.getEdgesFrom(id)
      for (const edge of outgoing) {
        edges.set(edge.id, edge)
        queue.push({ id: edge.targetId, distance: distance + 1 })
      }
    }

    return {
      startId,
      depth,
      nodes: Array.from(nodes.values()).map((node) => this.toNodeResponse(node)),
      edges: Array.from(edges.values()).map((edge) => this.toEdgeResponse(edge)),
    }
  }

  private toNodeResponse(node: NodeRecord): NodeResponse {
    return {
      ...node,
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
    }
  }

  private toEdgeResponse(edge: EdgeRecord): EdgeResponse {
    return {
      ...edge,
      createdAt: edge.createdAt.toISOString(),
    }
  }
}
