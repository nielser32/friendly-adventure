import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useCreateNodeMutation, useNodeQuery, useUpdateNodeMutation } from '../api/queries'
import type { NodeResponse } from '../api/schemas'
import NodeForm from '../components/NodeForm'

type NodeFormPageProps = {
  mode: 'create' | 'edit'
}

const emptyNode: NodeResponse = {
  id: '',
  title: '',
  summary: '',
  tags: [],
  createdAt: '',
  updatedAt: '',
}

function NodeFormPage({ mode }: NodeFormPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const nodeId = id ?? ''

  const { data: node, isLoading } = useNodeQuery(nodeId)
  const createMutation = useCreateNodeMutation()
  const updateMutation = useUpdateNodeMutation()
  const [feedback, setFeedback] = useState<{ error?: string | null; success?: string | null }>({})

  const initialNode = isEdit && node ? node : emptyNode
  const isSaving = createMutation.isPending || updateMutation.isPending

  async function handleSubmit(values: { title: string; summary: string; tags: string[] }) {
    setFeedback({})

    try {
      if (isEdit && nodeId) {
        const updated = await updateMutation.mutateAsync({ id: nodeId, payload: values })
        setFeedback({ success: 'Node updated' })
        navigate(`/nodes/${updated.id}`)
      } else {
        const created = await createMutation.mutateAsync(values)
        setFeedback({ success: 'Node created' })
        navigate(`/nodes/${created.id}`)
      }
    } catch (err) {
      setFeedback({ error: err instanceof Error ? err.message : 'Unable to save node' })
    }
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <p className="eyebrow">{isEdit ? 'Edit node' : 'Add node'}</p>
        <h1>{isEdit ? 'Update node details' : 'Create a new node'}</h1>
        <p className="lede">Capture a concise title, short summary, and tags to make search easier.</p>
      </header>

      {isEdit && isLoading ? (
        <p role="status">Loading node…</p>
      ) : isEdit && !node ? (
        <div className="alert" role="alert">
          Node not found.
        </div>
      ) : (
        <NodeForm
          initialValue={{
            title: initialNode.title,
            summary: initialNode.summary,
            tags: initialNode.tags,
          }}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          mode={mode}
          error={feedback.error}
          success={feedback.success}
        />
      )}

      <div className="button-row">
        <Link to="/" className="button ghost">
          Cancel
        </Link>
        {isEdit && nodeId ? (
          <Link to={`/nodes/${nodeId}`} className="button link">
            Back to detail
          </Link>
        ) : null}
      </div>
    </div>
  )
}

export default NodeFormPage
