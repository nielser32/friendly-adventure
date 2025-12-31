import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useNodesQuery } from '../api/queries'
import type { NodeResponse } from '../api/schemas'

function filterNodes(nodes: NodeResponse[], search: string) {
  if (!search.trim()) return nodes
  const term = search.trim().toLowerCase()

  return nodes.filter((node) => {
    const inTitle = node.title.toLowerCase().includes(term)
    const inSummary = node.summary.toLowerCase().includes(term)
    const inTags = node.tags.some((tag) => tag.toLowerCase().includes(term))
    return inTitle || inSummary || inTags
  })
}

function NodeListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error } = useNodesQuery()

  const filtered = useMemo(() => filterNodes(data ?? [], search), [data, search])

  return (
    <div className="panel">
      <header className="panel-header">
        <p className="eyebrow">Semantic network</p>
        <h1>Browse nodes</h1>
        <p className="lede">
          Find and filter knowledge nodes. Use the search field to match titles, summaries, or tags before
          drilling into a node.
        </p>
      </header>

      <div className="toolbar">
        <label className="field search-field">
          <span className="label">Search nodes</span>
          <input
            id="node-search"
            name="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, summary, or tag"
            autoComplete="off"
          />
        </label>
        <div className="toolbar-actions">
          <Link className="button ghost" to="/nodes/new">
            Add node
          </Link>
        </div>
      </div>

      <p role="status" aria-live="polite" className="muted">
        {isLoading
          ? 'Loading nodes…'
          : `Showing ${filtered.length} of ${data?.length ?? 0} nodes${search ? ` for “${search}”` : ''}.`}
      </p>

      {isError && <div className="alert">Could not load nodes. {error instanceof Error ? error.message : ''}</div>}

      {isLoading ? (
        <div className="skeleton-grid" aria-hidden>
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton-card" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <ul className="node-grid" aria-label="Nodes">
          {filtered.map((node) => (
            <li key={node.id}>
              <article className="card">
                <div className="card-header">
                  <p className="eyebrow">Node</p>
                  <h2>
                    <Link to={`/nodes/${node.id}`} className="quiet-link">
                      {node.title}
                    </Link>
                  </h2>
                  <p className="muted">{node.summary}</p>
                </div>
                <div className="tag-row" aria-label="Tags">
                  {node.tags.length === 0 ? <span className="muted">No tags yet</span> : null}
                  {node.tags.map((tag) => (
                    <span className="pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="card-actions">
                  <Link to={`/nodes/${node.id}`} className="button link">
                    Open detail
                  </Link>
                  <Link to={`/nodes/${node.id}/edit`} className="button ghost">
                    Edit
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p className="lead">No nodes match your filters.</p>
          <p className="muted">Adjust the search term or add a new node to start mapping concepts.</p>
        </div>
      )}
    </div>
  )
}

export default NodeListPage
