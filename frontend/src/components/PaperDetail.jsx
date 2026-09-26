import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { instance, ENDPOINTS } from './api'

const categories = ['Planning', 'Literature', 'Methodology', 'Data', 'Experiment', 'Analysis', 'Writing', 'Submission', 'Other']

function workStatus(paper) {
  if (paper.days_left === null) return ['No deadline', 'status-neutral']
  if (paper.days_left < 0) return ['Deadline passed', 'status-danger']
  const remaining = 100 - paper.progress
  if (paper.days_left <= 14 && remaining >= 35) return ['Need to hurry', 'status-danger']
  if (paper.days_left >= 45 && remaining >= 25) return ['Work thoroughly', 'status-careful']
  return ['Work normally', 'status-normal']
}

export default function PaperDetail() {
  const { paperId } = useParams()
  const [paper, setPaper] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState('Other')

  const load = async () => {
    const [paperRes, tasksRes] = await Promise.all([
      instance.get(ENDPOINTS.PAPER(paperId)),
      instance.get(ENDPOINTS.TASKS(paperId)),
    ])
    setPaper(paperRes.data)
    setTasks(tasksRes.data)
  }

  useEffect(() => { load().catch(() => {}) }, [paperId])

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    await instance.post(ENDPOINTS.TASKS(paperId), { title: newTask.trim(), category })
    setNewTask('')
    toast.success('Task added')
    load()
  }

  const toggle = async (task) => {
    await instance.put(ENDPOINTS.TASK(paperId, task.id), { ...task, completed: !task.completed })
    load()
  }

  const remove = async (id) => {
    await instance.delete(ENDPOINTS.TASK(paperId, id))
    load()
  }

  const progress = useMemo(() => tasks.length ? Math.round(tasks.filter((t) => t.completed).length / tasks.length * 100) : 0, [tasks])
  if (!paper) return <main className="page"><p>Loading paper...</p></main>

  const [status, statusClass] = workStatus({ ...paper, progress })

  return <main className="page detail-page">
    <Link className="back-link" to="/papers"><ArrowLeft size={16} /> All papers</Link>
    <section className="paper-header">
      <div><p className="eyebrow">{paper.research_field || 'Research paper'}</p><h1>{paper.title}</h1><p className="muted">{paper.description || 'Build your research one task at a time.'}</p></div>
      <div className="paper-status"><span className={`status ${statusClass}`}>{status}</span>{paper.days_left !== null && <strong>{paper.days_left < 0 ? 'Past deadline' : `${paper.days_left} days left`}</strong>}</div>
    </section>

    <section className="detail-grid">
      <div className="main-panel">
        <div className="panel-heading"><div><h2>Research workflow</h2><p className="muted">Complete tasks sequentially to track this paper's progress.</p></div><strong>{progress}%</strong></div>
        <div className="progress-track large"><span style={{ width: `${progress}%` }} /></div>
        <div className="task-list">
          {tasks.map((task) => <div className={`task-row ${task.completed ? 'done' : ''}`} key={task.id}>
            <button className="check-btn" onClick={() => toggle(task)}>{task.completed && <Check size={15} />}</button>
            <div className="task-content"><span>{task.title}</span><small>{task.category}</small></div>
            <button className="icon-btn" onClick={() => remove(task.id)}><Trash2 size={16} /></button>
          </div>)}
          {!tasks.length && <p className="empty-text">No tasks yet. Start with your first research step.</p>}
        </div>
        <form className="add-task" onSubmit={addTask}>
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a research task..." />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <button className="primary-btn" type="submit"><Plus size={17} /> Add</button>
        </form>
      </div>

      <aside className="side-panel">
        <div className="info-card"><span>Progress</span><strong>{progress}%</strong><p>{tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed</p></div>
        <div className="info-card"><span>Submission</span>{paper.conference_name ? <><strong>{paper.conference_name}</strong><p>{paper.deadline || 'Deadline not set'}</p>{paper.conference_url && <a href={paper.conference_url} target="_blank" rel="noreferrer">Official conference page →</a>}</> : <><strong>No conference</strong><p className="muted">Optional. Add one later to track a submission deadline.</p></>}</div>
        <div className="info-card"><span>Work pace</span><strong>{status}</strong><p>Based on your current task progress and the optional deadline.</p></div>
      </aside>
    </section>
  </main>
}
