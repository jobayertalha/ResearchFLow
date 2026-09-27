import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { instance, ENDPOINTS } from './api'

const emptyForm = {
  name: '',
  acronym: '',
  research_field: '',
  official_url: '',
  submission_deadline: '',
  conference_date: '',
  location: '',
  source: '',
}

export default function Conferences() {
  const [conferences, setConferences] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await instance.get(ENDPOINTS.CONFERENCES())
      setConferences(res.data)
    } catch (error) {
      console.error('CONFERENCES API ERROR:', error)
      toast.error(
        error.response?.data?.detail || 'Could not load conferences',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredConferences = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return conferences
    }

    return conferences.filter((conference) =>
      [
        conference.name,
        conference.acronym,
        conference.research_field,
        conference.location,
        conference.source,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    )
  }, [conferences, search])

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Please enter a conference name')
      return
    }

    const payload = {
      name: form.name.trim(),
      acronym: form.acronym.trim() || null,
      research_field: form.research_field.trim() || null,
      official_url: form.official_url.trim() || null,
      submission_deadline: form.submission_deadline || null,
      conference_date: form.conference_date || null,
      location: form.location.trim() || null,
      source: form.source.trim() || null,
    }

    try {
      if (editingId) {
        await instance.put(
          ENDPOINTS.CONFERENCE(editingId),
          payload,
        )

        toast.success('Conference updated')
      } else {
        await instance.post(
          ENDPOINTS.CONFERENCES(),
          payload,
        )

        toast.success('Conference added')
      }

      resetForm()
      await load()
    } catch (error) {
      console.error('CONFERENCE SAVE ERROR:', error)

      toast.error(
        error.response?.data?.detail ||
          'Could not save conference',
      )
    }
  }

  const editConference = (conference) => {
    setEditingId(conference.id)

    setForm({
      name: conference.name || '',
      acronym: conference.acronym || '',
      research_field: conference.research_field || '',
      official_url: conference.official_url || '',
      submission_deadline: conference.submission_deadline || '',
      conference_date: conference.conference_date || '',
      location: conference.location || '',
      source: conference.source || '',
    })

    setShowForm(true)
  }

  const removeConference = async (id) => {
    if (!window.confirm('Delete this conference?')) {
      return
    }

    try {
      await instance.delete(
        ENDPOINTS.CONFERENCE(id),
      )

      toast.success('Conference deleted')
      await load()
    } catch (error) {
      console.error('CONFERENCE DELETE ERROR:', error)

      toast.error(
        error.response?.data?.detail ||
          'Could not delete conference',
      )
    }
  }

  const formatDate = (value) => {
    if (!value) return 'Not set'

    return new Date(`${value}T00:00:00`).toLocaleDateString(
      undefined,
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    )
  }

  const daysUntil = (value) => {
    if (!value) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const deadline = new Date(`${value}T00:00:00`)
    return Math.ceil(
      (deadline - today) / (1000 * 60 * 60 * 24),
    )
  }

  return (
    <main className="page conferences-page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Research opportunities</p>

          <h1>Conferences</h1>

          <p className="muted">
            Keep track of conferences, official sources,
            and submission deadlines.
          </p>
        </div>

        <button
          className="primary-btn small"
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setShowForm(true)
            }
          }}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}

          {showForm ? 'Cancel' : 'Add conference'}
        </button>
      </section>

      {showForm && (
        <form
          className="form-card conference-form"
          onSubmit={submit}
        >
          <div>
            <h2>
              {editingId
                ? 'Edit conference'
                : 'Add a conference'}
            </h2>

            <p className="muted">
              Add information from the official conference
              website.
            </p>
          </div>

          <input
            placeholder="Conference name *"
            value={form.name}
            onChange={(e) =>
              updateField('name', e.target.value)
            }
            autoFocus
          />

          <div className="form-grid-2">
            <input
              placeholder="Acronym"
              value={form.acronym}
              onChange={(e) =>
                updateField('acronym', e.target.value)
              }
            />

            <input
              placeholder="Research field"
              value={form.research_field}
              onChange={(e) =>
                updateField(
                  'research_field',
                  e.target.value,
                )
              }
            />
          </div>

          <input
            type="url"
            placeholder="Official conference URL"
            value={form.official_url}
            onChange={(e) =>
              updateField(
                'official_url',
                e.target.value,
              )
            }
          />

          <div className="form-grid-2">
            <label className="date-field">
              <span>Submission deadline</span>

              <input
                type="date"
                value={form.submission_deadline}
                onChange={(e) =>
                  updateField(
                    'submission_deadline',
                    e.target.value,
                  )
                }
              />
            </label>

            <label className="date-field">
              <span>Conference date</span>

              <input
                type="date"
                value={form.conference_date}
                onChange={(e) =>
                  updateField(
                    'conference_date',
                    e.target.value,
                  )
                }
              />
            </label>
          </div>

          <div className="form-grid-2">
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                updateField('location', e.target.value)
              }
            />

            <input
              placeholder="Source (IEEE, ACM, etc.)"
              value={form.source}
              onChange={(e) =>
                updateField('source', e.target.value)
              }
            />
          </div>

          <button className="primary-btn" type="submit">
            {editingId
              ? 'Save changes'
              : 'Add conference'}
          </button>
        </form>
      )}

      <section className="conference-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            placeholder="Search conferences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="muted">
          {filteredConferences.length}{' '}
          {filteredConferences.length === 1
            ? 'conference'
            : 'conferences'}
        </span>
      </section>

      {loading ? (
        <p className="muted">Loading conferences...</p>
      ) : (
        <div className="conference-grid">
          {filteredConferences.map((conference) => {
            const days = daysUntil(
              conference.submission_deadline,
            )

            return (
              <article
                className="conference-card"
                key={conference.id}
              >
                <div className="card-top">
                  <span className="field">
                    {conference.research_field ||
                      'Research'}
                  </span>

                  <div className="conference-actions">
                    <button
                      className="icon-btn"
                      type="button"
                      title="Edit"
                      onClick={() =>
                        editConference(conference)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="danger-icon"
                      type="button"
                      title="Delete"
                      onClick={() =>
                        removeConference(conference.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3>{conference.name}</h3>

                {conference.acronym && (
                  <p className="conference-acronym">
                    {conference.acronym}
                  </p>
                )}

                <div className="conference-details">
                  <div>
                    <span>Submission deadline</span>

                    <strong>
                      {formatDate(
                        conference.submission_deadline,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Conference date</span>

                    <strong>
                      {formatDate(
                        conference.conference_date,
                      )}
                    </strong>
                  </div>

                  {conference.location && (
                    <div>
                      <span>Location</span>

                      <strong>
                        {conference.location}
                      </strong>
                    </div>
                  )}

                  {conference.source && (
                    <div>
                      <span>Source</span>

                      <strong>
                        {conference.source}
                      </strong>
                    </div>
                  )}
                </div>

                {days !== null && (
                  <div
                    className={`deadline-box ${
                      days < 0
                        ? 'deadline-passed'
                        : days <= 14
                          ? 'deadline-soon'
                          : ''
                    }`}
                  >
                    {days < 0
                      ? `Deadline passed ${Math.abs(days)} days ago`
                      : days === 0
                        ? 'Submission deadline is today'
                        : `${days} days until submission deadline`}
                  </div>
                )}

                {conference.official_url && (
                  <a
                    className="conference-link"
                    href={conference.official_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official conference website
                    <ExternalLink size={15} />
                  </a>
                )}
              </article>
            )
          })}

          {!filteredConferences.length && (
            <div className="empty-card">
              <h3>
                {search
                  ? 'No conferences found'
                  : 'No conferences yet'}
              </h3>

              <p className="muted">
                {search
                  ? 'Try a different search term.'
                  : 'Add a conference to start tracking submission deadlines.'}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}