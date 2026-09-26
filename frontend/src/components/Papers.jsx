import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { instance, ENDPOINTS } from './api'

export default function Papers() {
  const [papers, setPapers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', research_field: '', description: '' })

  const load = () => instance.get(ENDPOINTS.PAPERS()).then((res) => setPapers(res.data)).catch(() => {})
  useEffect(load, [])

  const create = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      await instance.post(ENDPOINTS.PAPERS(), form)
      toast.success('Paper created')
      setForm({ title: '', research_field: '', description: '' })
      setShowForm(false)
      load()
    } catch (error) { toast.error(error.response?.data?.detail || 'Could not create paper') }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this paper and its tasks?')) return
    await instance.delete(ENDPOINTS.PAPER(id))
    toast.success('Paper deleted')
    load()
  }

  return <main className="page">
    <section className="hero-row">
      <div><p className="eyebrow">Research workspace</p><h1>Your papers</h1><p className="muted">Each paper has its own tasks, progress, and optional deadline.</p></div>
      <button className="primary-btn small" onClick={() => setShowForm((v) => !v)}><Plus size={17} /> New paper</button>
    </section>

    {showForm && <form className="form-card" onSubmit={create}>
      <h2>Create a paper</h2>
      <input placeholder="Paper title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
      <input placeholder="Research field (optional)" value={form.research_field} onChange={(e) => setForm({ ...form, research_field: e.target.value })} />
      <textarea placeholder="Short description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button className="primary-btn">Create paper</button>
    </form>}

    <div className="paper-grid">
      {papers.map((paper) => <article className="paper-card" key={paper.id}>
        <div className="card-top"><span className="field">{paper.research_field || 'Research'}</span><button className="danger-icon" onClick={() => remove(paper.id)}><Trash2 size={17} /></button></div>
        <Link to={`/papers/${paper.id}`}><h3>{paper.title}</h3></Link>
        <p className="muted">{paper.description || 'No description yet.'}</p>
        <div className="progress-track"><span style={{ width: `${paper.progress}%` }} /></div>
        <div className="card-meta"><span>{paper.progress}% · {paper.completed_tasks}/{paper.total_tasks} tasks</span><span>{paper.days_left === null ? 'No deadline' : `${paper.days_left}d left`}</span></div>
      </article>)}
      {!papers.length && <div className="empty-card"><h3>No papers yet</h3><p className="muted">Create your first research paper to start tracking work.</p></div>}
    </div>
  </main>
}
