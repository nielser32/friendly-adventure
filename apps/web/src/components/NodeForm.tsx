import { useEffect, useMemo, useState } from 'react'

import type { NodePayload } from '../api/client'
import { normalizeTags } from '../lib/tags'

type NodeFormProps = {
  initialValue: NodePayload
  onSubmit: (values: NodePayload) => void | Promise<void>
  isSaving: boolean
  mode: 'create' | 'edit'
  error?: string | null
  success?: string | null
}

function NodeForm({ initialValue, onSubmit, isSaving, mode, error, success }: NodeFormProps) {
  const [title, setTitle] = useState(initialValue.title)
  const [summary, setSummary] = useState(initialValue.summary)
  const [tagsText, setTagsText] = useState(initialValue.tags.join(', '))
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setTitle(initialValue.title)
    setSummary(initialValue.summary)
    setTagsText(initialValue.tags.join(', '))
  }, [initialValue])

  const derivedError = useMemo(() => {
    if (!touched) return null
    if (!title.trim()) return 'Title is required'
    if (!summary.trim()) return 'Summary is required'
    return null
  }, [summary, title, touched])

  const submitLabel = mode === 'create' ? 'Create node' : 'Save changes'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)

    if (derivedError) return

    const payload: NodePayload = {
      title: title.trim(),
      summary: summary.trim(),
      tags: normalizeTags(tagsText),
    }

    await onSubmit(payload)
  }

  return (
    <form className="form" onSubmit={handleSubmit} aria-describedby="form-hint">
      <p id="form-hint" className="muted">
        Fields marked with * are required. Tags are comma-separated to keep keyboard entry simple.
      </p>

      <label className="field">
        <span>
          Title <span aria-hidden="true" className="required">*</span>
        </span>
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => setTouched(true)}
          required
          aria-required="true"
          placeholder="Explainable AI"
        />
      </label>

      <label className="field">
        <span>
          Summary <span aria-hidden="true" className="required">*</span>
        </span>
        <textarea
          name="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          required
          aria-required="true"
          placeholder="A quick overview of why this concept matters in your knowledge graph."
        />
      </label>

      <label className="field">
        <span>Tags (comma separated)</span>
        <input
          name="tags"
          value={tagsText}
          onChange={(event) => setTagsText(event.target.value)}
          placeholder="research, ai, design"
        />
        <span className="muted">We use tags to help filter and connect related topics.</span>
      </label>

      <div className="form-actions">
        <div aria-live="polite" className="status">
          {derivedError && <span className="error">{derivedError}</span>}
          {error && <span className="error">{error}</span>}
          {success && <span className="success">{success}</span>}
        </div>
        <button type="submit" className="button primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default NodeForm
