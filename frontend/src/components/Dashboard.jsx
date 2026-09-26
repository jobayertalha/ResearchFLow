import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { instance, ENDPOINTS } from './api'

function statusForPaper(paper) {
  if (paper.status === 'completed') return ['Completed', 'status-complete']
  if (paper.days_left === null) return ['No deadline', 'status-neutral']
  if (paper.days_left < 0) return ['Deadline passed', 'status-danger']
  const remaining = 100 - paper.progress
  if (paper.days_left <= 14 && remaining >= 35) return ['Need to hurry', 'status-danger']
  if (paper.days_left >= 45 && remaining >= 25) return ['Work thoroughly', 'status-careful']
  return ['Work normally', 'status-normal']
}

export default function Dashboard() {
  const [papers, setPapers] = useState([])

  useEffect(() => {
    instance.get(ENDPOINTS.PAPERS()).then((res) => setPapers(res.data)).catch(() => {})
  }, [])

  const active = papers.filter((p) => p.status !== 'completed')
  const totalTasks = papers.reduce((sum, p) => sum + p.total_tasks, 0)
  const completedTasks = papers.reduce((sum, p) => sum + p.completed_tasks, 0)
  const overall = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
  const nearest = active.filter((p) => p.days_left !== null && p.days_left >= 0).sort((a, b) => a.days_left - b.days_left)[0]

  return (
    <main className="page">
      <section className="hero-row">
        <div>
          <p className="eyebrow">Research dashboard</p>
          <h1>Keep every paper moving.</h1>
          <p className="muted">{active.length} active paper{active.length !== 1 ? 's' : ''} · {overall}% overall task progress</p>
        </div>
        <Link className="primary-btn small" to="/papers">Manage papers</Link>
      </section>

      <section className="stats-grid">
        <div className="stat-card"><span>Active papers</span><strong>{active.length}</strong></div>
        <div className="stat-card"><span>Completed tasks</span><strong>{completedTasks}/{totalTasks}</strong></div>
        <div className="stat-card"><span>Overall progress</span><strong>{overall}%</strong></div>
        <div className="stat-card"><span>Next deadline</span><strong>{nearest ? `${nearest.days_left}d` : '—'}</strong></div>
      </section>

      {nearest && (
        <section className="focus-card">
          <div>
            <p className="eyebrow">Needs attention</p>
            <h2>{nearest.title}</h2>
            <p className="muted">{nearest.days_left} days left · {nearest.progress}% complete</p>
          </div>
          <span className={`status ${statusForPaper(nearest)[1]}`}>{statusForPaper(nearest)[0]}</span>
        </section>
      )}

      <section>
        <div className="section-heading"><h2>Your papers</h2><Link to="/papers">View all →</Link></div>
        <div className="paper-grid">
          {active.slice(0, 6).map((paper) => {
            const [label, cls] = statusForPaper(paper)
            return <Link className="paper-card" key={paper.id} to={`/papers/${paper.id}`}>
              <div className="card-top"><span className="field">{paper.research_field || 'Research'}</span><span className={`status ${cls}`}>{label}</span></div>
              <h3>{paper.title}</h3>
              <div className="progress-track"><span style={{ width: `${paper.progress}%` }} /></div>
              <div className="card-meta"><span>{paper.completed_tasks}/{paper.total_tasks} tasks</span><span>{paper.days_left === null ? 'No deadline' : `${paper.days_left}d left`}</span></div>
            </Link>
          })}
          {!active.length && <div className="empty-card"><h3>Start your first paper</h3><p className="muted">Create a paper and build its research workflow.</p><Link className="primary-btn small" to="/papers">Create paper</Link></div>}
        </div>
      </section>
    </main>
  )
}
