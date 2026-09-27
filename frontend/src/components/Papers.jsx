import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { instance, ENDPOINTS } from './api'

const emptyForm = {
  title: '',
  research_field: '',
  description: '',
}

export default function Papers() {
  const [papers, setPapers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const res = await instance.get(ENDPOINTS.PAPERS())
      setPapers(res.data)
    } catch (error) {
      console.error('PAPERS API ERROR:', error)
      setPapers([])
      toast.error('Could not load papers')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (paper) => {
    setEditingId(paper.id)

    setForm({
      title: paper.title || '',
      research_field: paper.research_field || '',
      description: paper.description || '',
    })

    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error('Please enter a paper title')
      return
    }

    setSaving(true)

    const payload = {
      title: form.title.trim(),
      research_field: form.research_field.trim(),
      description: form.description.trim(),
    }

    try {
      if (editingId) {
        await instance.put(
          ENDPOINTS.PAPER(editingId),
          payload,
        )

        toast.success('Paper updated')
      } else {
        await instance.post(
          ENDPOINTS.PAPERS(),
          payload,
        )

        toast.success('Paper created')
      }

      closeForm()
      await load()
    } catch (error) {
      console.error('SAVE PAPER ERROR:', error)

      toast.error(
        error.response?.data?.detail ||
          `Could not ${editingId ? 'update' : 'create'} paper`,
      )
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this paper and its tasks?')) {
      return
    }

    try {
      await instance.delete(ENDPOINTS.PAPER(id))

      toast.success('Paper deleted')

      if (editingId === id) {
        closeForm()
      }

      await load()
    } catch (error) {
      console.error('DELETE PAPER ERROR:', error)

      toast.error(
        error.response?.data?.detail ||
          'Could not delete paper',
      )
    }
  }

  return (
    <main className="page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Research workspace</p>

          <h1>Your papers</h1>

          <p className="muted">
            Manage your papers, research workflows, progress,
            and optional submission deadlines.
          </p>
        </div>

        <button
          className="primary-btn small"
          onClick={openCreate}
          type="button"
        >
          <Plus size={17} />
          New paper
        </button>
      </section>

      {showForm && (
        <form
          className="form-card"
          onSubmit={handleSubmit}
        >
          <div className="panel-heading">
            <div>
              <h2>
                {editingId
                  ? 'Edit paper'
                  : 'Create a paper'}
              </h2>

              <p className="muted">
                {editingId
                  ? 'Update the basic information for this paper.'
                  : 'Start a new research workspace.'}
              </p>
            </div>

            <button
              className="icon-btn"
              type="button"
              onClick={closeForm}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <input
            placeholder="Paper title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            autoFocus
          />

          <input
            placeholder="Research field (optional)"
            value={form.research_field}
            onChange={(e) =>
              setForm({
                ...form,
                research_field: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <div className="form-actions">
            <button
              className="primary-btn"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : 'Create paper'}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="paper-grid">
        {papers.map((paper) => (
          <article
            className="paper-card"
            key={paper.id}
          >
            <div className="card-top">
              <span className="field">
                {paper.research_field || 'Research'}
              </span>

              <div className="card-actions">
                <button
                  className="icon-btn"
                  type="button"
                  title="Edit paper"
                  onClick={() => openEdit(paper)}
                >
                  <Edit3 size={16} />
                </button>

                <button
                  className="danger-icon"
                  type="button"
                  title="Delete paper"
                  onClick={() => remove(paper.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>

            <Link to={`/papers/${paper.id}`}>
              <h3>{paper.title}</h3>
            </Link>

            <p className="muted">
              {paper.description ||
                'No description yet.'}
            </p>

            <div className="progress-track">
              <span
                style={{
                  width: `${paper.progress || 0}%`,
                }}
              />
            </div>

            <div className="card-meta">
              <span>
                {paper.progress || 0}% ·{' '}
                {paper.completed_tasks || 0}/
                {paper.total_tasks || 0} tasks
              </span>

              <span>
                {paper.days_left === null ||
                paper.days_left === undefined
                  ? 'No deadline'
                  : paper.days_left < 0
                    ? 'Deadline passed'
                    : `${paper.days_left}d left`}
              </span>
            </div>

            <Link
              className="paper-open-link"
              to={`/papers/${paper.id}`}
            >
              Open paper →
            </Link>
          </article>
        ))}

        {!papers.length && (
          <div className="empty-card">
            <h3>No papers yet</h3>

            <p className="muted">
              Create your first research paper to start
              tracking work.
            </p>

            <button
              className="primary-btn small"
              type="button"
              onClick={openCreate}
            >
              <Plus size={16} />
              Create paper
            </button>
          </div>
        )}
      </div>
    </main>
  )
}