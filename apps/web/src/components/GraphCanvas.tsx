import { useMemo, useState } from 'react'

import type { EdgeResponse, NodeResponse } from '../api/schemas'

type GraphCanvasProps = {
  startId: string
  nodes: NodeResponse[]
  edges: EdgeResponse[]
  onNodeSelect?: (nodeId: string) => void
  selectedNodeId?: string
}

type PositionedNode = {
  node: NodeResponse
  x: number
  y: number
  level: number
}

const BASE_RADIUS = 120
const CANVAS_WIDTH = 760
const CANVAS_HEIGHT = 460

function computePositions(startId: string, nodes: NodeResponse[], edges: EdgeResponse[]): PositionedNode[] {
  if (nodes.length === 0) return []

  const adjacency = new Map<string, Set<string>>()
  for (const edge of edges) {
    if (!adjacency.has(edge.sourceId)) adjacency.set(edge.sourceId, new Set())
    if (!adjacency.has(edge.targetId)) adjacency.set(edge.targetId, new Set())
    adjacency.get(edge.sourceId)?.add(edge.targetId)
    adjacency.get(edge.targetId)?.add(edge.sourceId)
  }

  const levels = new Map<string, number>([[startId, 0]])
  const queue = [startId]

  while (queue.length > 0) {
    const id = queue.shift()
    if (!id) break
    const level = levels.get(id) ?? 0
    const nextLevel = Math.min(level + 1, 3)
    const neighbors = adjacency.get(id)
    if (!neighbors) continue

    for (const neighbor of neighbors) {
      if (!levels.has(neighbor)) {
        levels.set(neighbor, nextLevel)
        queue.push(neighbor)
      }
    }
  }

  for (const node of nodes) {
    if (!levels.has(node.id)) {
      levels.set(node.id, 2)
    }
  }

  const grouped = new Map<number, NodeResponse[]>()
  for (const [id, level] of levels.entries()) {
    const node = nodes.find((item) => item.id === id)
    if (!node) continue
    const existing = grouped.get(level) ?? []
    grouped.set(level, [...existing, node])
  }

  const positioned: PositionedNode[] = []
  for (const [level, group] of grouped.entries()) {
    if (group.length === 0) continue
    const radius = level === 0 ? 0 : BASE_RADIUS + (level - 1) * 100
    const angleStep = (2 * Math.PI) / group.length

    group.forEach((node, index) => {
      const angle = angleStep * index
      const x = level === 0 ? 0 : Math.cos(angle) * radius
      const y = level === 0 ? 0 : Math.sin(angle) * radius
      positioned.push({ node, x, y, level })
    })
  }

  return positioned
}

function clampZoom(value: number) {
  return Math.min(2.6, Math.max(0.6, value))
}

function GraphCanvas({ startId, nodes, edges, onNodeSelect, selectedNodeId }: GraphCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const positionedNodes = useMemo(() => computePositions(startId, nodes, edges), [edges, nodes, startId])
  const positions = new Map(positionedNodes.map((node) => [node.node.id, node]))

  const viewTransform = `translate(${CANVAS_WIDTH / 2 + pan.x} ${CANVAS_HEIGHT / 2 + pan.y}) scale(${zoom.toFixed(2)})`
  const status = `Pan ${pan.x}px horizontally and ${pan.y}px vertically. Zoom ${Math.round(zoom * 100)}%.`

  const edgeSegments = edges
    .map((edge) => {
      const source = positions.get(edge.sourceId)
      const target = positions.get(edge.targetId)
      if (!source || !target) return null
      return { edge, source, target }
    })
    .filter(Boolean) as Array<{ edge: EdgeResponse; source: PositionedNode; target: PositionedNode }>

  function panBy(deltaX: number, deltaY: number) {
    setPan((current) => ({ x: current.x + deltaX, y: current.y + deltaY }))
  }

  function adjustZoom(delta: number) {
    setZoom((value) => clampZoom(value + delta))
  }

  function handleKeyboard(event: React.KeyboardEvent<HTMLDivElement>) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '+', '-', '='].includes(event.key)) {
      event.preventDefault()
    }

    switch (event.key) {
      case 'ArrowUp':
        panBy(0, -18)
        break
      case 'ArrowDown':
        panBy(0, 18)
        break
      case 'ArrowLeft':
        panBy(-18, 0)
        break
      case 'ArrowRight':
        panBy(18, 0)
        break
      case '+':
      case '=':
        adjustZoom(0.1)
        break
      case '-':
        adjustZoom(-0.1)
        break
      default:
        break
    }
  }

  function handleReset() {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  return (
    <div className="graph-block">
      <div className="graph-toolbar" role="group" aria-label="Graph controls">
        <p className="muted">Use arrow keys to pan and + / - to zoom the canvas.</p>
        <div className="control-row">
          <button type="button" className="button ghost" onClick={() => adjustZoom(0.12)}>
            Zoom in
          </button>
          <button type="button" className="button ghost" onClick={() => adjustZoom(-0.12)}>
            Zoom out
          </button>
          <button type="button" className="button ghost" onClick={handleReset}>
            Reset view
          </button>
        </div>
      </div>

      <div
        className="graph-viewport"
        role="group"
        aria-label="Neighbor graph"
        aria-describedby="graph-status"
        tabIndex={0}
        onKeyDown={handleKeyboard}
      >
        <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="graph-canvas" data-testid="graph-canvas">
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#f8fafc" rx={12} />
          <g transform={viewTransform}>
            {edgeSegments.map(({ edge, source, target }) => (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#cbd5e1"
                strokeWidth={2}
                strokeDasharray={edge.type === 'contradicts' ? '6 6' : undefined}
                aria-hidden="true"
              />
            ))}
            {positionedNodes.map(({ node, x, y, level }) => {
              const isStart = node.id === startId
              const isSelected = selectedNodeId === node.id
              return (
                <g
                  key={node.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onNodeSelect?.(node.id)
                    }
                  }}
                  onClick={() => onNodeSelect?.(node.id)}
                  className="graph-node"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isStart ? 28 : 22}
                    fill={isStart ? '#1d4ed8' : '#fff'}
                    stroke={isSelected ? '#f97316' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : 2}
                    aria-hidden="true"
                  />
                  <text
                    x={x}
                    y={y + (level === 0 ? 46 : 40)}
                    textAnchor="middle"
                    className="graph-label"
                    aria-hidden="true"
                  >
                    {node.title}
                  </text>
                  <title>{node.title}</title>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <p id="graph-status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  )
}

export default GraphCanvas
