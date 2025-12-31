import { randomUUID } from 'node:crypto'

export type RelationshipType = 'relates_to' | 'supports' | 'contradicts' | 'derives_from'

export interface NodeRecord {
  id: string
  title: string
  summary: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface EdgeRecord {
  id: string
  type: RelationshipType
  description?: string
  sourceId: string
  targetId: string
  createdAt: Date
}

export interface CreateNodeInput {
  title: string
  summary: string
  tags?: string[]
}

export interface UpdateNodeInput {
  title?: string
  summary?: string
  tags?: string[]
}

export interface CreateEdgeInput {
  type: RelationshipType
  description?: string
  sourceId: string
  targetId: string
}

export interface UpdateEdgeInput {
  type?: RelationshipType
  description?: string | null
}

export class GraphRepository {
  private nodes = new Map<string, NodeRecord>()
  private edges = new Map<string, EdgeRecord>()

  listNodes(): NodeRecord[] {
    return Array.from(this.nodes.values())
  }

  getNode(id: string): NodeRecord | null {
    return this.nodes.get(id) ?? null
  }

  createNode(input: CreateNodeInput): NodeRecord {
    const id = randomUUID()
    const now = new Date()
    const record: NodeRecord = {
      id,
      title: input.title,
      summary: input.summary,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }

    this.nodes.set(id, record)
    return record
  }

  updateNode(id: string, input: UpdateNodeInput): NodeRecord | null {
    const existing = this.nodes.get(id)
    if (!existing) {
      return null
    }

    const updated: NodeRecord = {
      ...existing,
      ...input,
      tags: input.tags ?? existing.tags,
      updatedAt: new Date(),
    }

    this.nodes.set(id, updated)
    return updated
  }

  deleteNode(id: string): boolean {
    const removed = this.nodes.delete(id)
    if (removed) {
      // also remove edges connected to this node
      for (const [edgeId, edge] of this.edges.entries()) {
        if (edge.sourceId === id || edge.targetId === id) {
          this.edges.delete(edgeId)
        }
      }
    }

    return removed
  }

  listEdges(): EdgeRecord[] {
    return Array.from(this.edges.values())
  }

  getEdge(id: string): EdgeRecord | null {
    return this.edges.get(id) ?? null
  }

  createEdge(input: CreateEdgeInput): EdgeRecord {
    const id = randomUUID()
    const now = new Date()
    const record: EdgeRecord = {
      id,
      createdAt: now,
      ...input,
    }

    this.edges.set(id, record)
    return record
  }

  updateEdge(id: string, input: UpdateEdgeInput): EdgeRecord | null {
    const existing = this.edges.get(id)
    if (!existing) {
      return null
    }

    const updated: EdgeRecord = {
      ...existing,
      ...input,
      description: input.description ?? existing.description,
    }

    this.edges.set(id, updated)
    return updated
  }

  deleteEdge(id: string): boolean {
    return this.edges.delete(id)
  }

  getEdgesFrom(sourceId: string): EdgeRecord[] {
    return this.listEdges().filter((edge) => edge.sourceId === sourceId)
  }
}
