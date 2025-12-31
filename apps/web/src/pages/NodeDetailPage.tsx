import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import GraphCanvas from '../components/GraphCanvas'
import { useNodeQuery, useTraverseQuery } from '../api/queries'
import type { EdgeResponse } from '../api/schemas'

function NodeDetailPage() {
  const { id } = useParams()
  const nodeId = id ?? ''

  const [selectedNodeId, setSelectedNodeId] = useState(nodeId)

  const { data: node, isLoading, isError, error } = useNodeQuery(nodeId)
  const traverseQuery = useTraverseQuery(nodeId, 2)

  useEffect(() => {
    setSelectedNodeId(nodeId)
  }, [nodeId])

  const neighborList = useMemo(() => {
    if (!traverseQuery.data) return []
    return traverseQuery.data.nodes.filter((item) => item.id !== nodeId)
  }, [nodeId, traverseQuery.data])

  const relationshipCount = traverseQuery.data?.edges.length ?? 0
  const hasGraphData = traverseQuery.data && traverseQuery.data.nodes.length > 0

  const edgeLabelMap = useMemo(() => {
    if (!traverseQuery.data) return new Map<string, EdgeResponse[]>()
    const lookup = new Map<string, EdgeResponse[]>()
    traverseQuery.data.edges.forEach((edge) => {
      const targetId = edge.sourceId === nodeId ? edge.targetId : edge.sourceId
      const existing = lookup.get(targetId) ?? []
      lookup.set(targetId, [...existing, edge])
    })
    return lookup
  }, [nodeId, traverseQuery.data])

  if (!nodeId) {
    return (
      <div className="panel">
        <p className="lead">Choose a node to inspect its neighbors.</p>
        <Link className="button ghost" to="/">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="detail-grid">
      <section className="panel">
        {isLoading ? (
          <div className="skeleton-block" role="status" aria-live="polite">
            Loading node…
          </div>
        ) : isError ? (
          <div className="alert" role="alert">
            Could not load the node. {error instanceof Error ? error.message : ''}
          </div>
        ) : node ? (
          <>
            <div className="panel-header">
              <p className="eyebrow">Node</p>
              <h1>{node.title}</h1>
              <p className="lede">{node.summary}</p>
            </div>
            <dl className="meta-grid">
              <div>
                <dt className="muted">Created</dt>
                <dd>{new Date(node.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="muted">Updated</dt>
                <dd>{new Date(node.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>

            <div className="tag-row" aria-label="Tags">
              {node.tags.length === 0 ? <span className="muted">No tags yet</span> : null}
              {node.tags.map((tag) => (
                <span className="pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="button-row">
              <Link to={`/nodes/${node.id}/edit`} className="button primary">
                Edit node
              </Link>
              <Link to="/" className="button ghost">
                Back to list
              </Link>
            </div>
          </>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Neighbors</p>
          <h2>Graph around this node</h2>
          <p className="muted">
            Visualize adjacent nodes and relationship types. Use the keyboard controls to navigate the canvas.
          </p>
        </div>

        {traverseQuery.isLoading && <p role="status">Loading neighbor graph…</p>}
        {traverseQuery.isError && (
          <div className="alert" role="alert">
            Could not load graph data. {traverseQuery.error instanceof Error ? traverseQuery.error.message : ''}
          </div>
        )}

        {hasGraphData && traverseQuery.data ? (
          <>
            <GraphCanvas
              startId={nodeId}
              nodes={traverseQuery.data.nodes}
              edges={traverseQuery.data.edges}
              onNodeSelect={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />

            <div className="neighbor-list" aria-live="polite">
              <div className="neighbor-summary">
                <p className="muted">
                  {neighborList.length} nearby nodes, {relationshipCount} relationships
                </p>
              </div>
              <ul>
                {neighborList.map((neighbor) => {
                  const edges = edgeLabelMap.get(neighbor.id) ?? []
                  return (
                    <li key={neighbor.id} className={selectedNodeId === neighbor.id ? 'highlight' : ''}>
                      <div className="neighbor-card">
                        <div>
                          <p className="muted">Neighbor</p>
                          <Link to={`/nodes/${neighbor.id}`} className="quiet-link">
                            {neighbor.title}
                          </Link>
                          <p className="muted small">{neighbor.summary}</p>
                        </div>
                        <div className="tag-row">
                          {edges.map((edge) => (
                            <span className="pill subtle" key={edge.id}>
                              {edge.type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </>
        ) : (
          !traverseQuery.isLoading && <p className="muted">No nearby nodes yet.</p>
        )}
      </section>
    </div>
  )
}

export default NodeDetailPage
