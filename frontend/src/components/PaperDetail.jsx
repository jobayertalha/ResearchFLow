import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { instance, ENDPOINTS } from './api'

const categories = [
  'Planning',
  'Literature',
  'Methodology',
  'Data',
  'Experiment',
  'Analysis',
  'Writing',
  'Submission',
  'Other',
]

function workStatus(paper) {
  if (paper.status === 'completed') {
    return ['Completed', 'status-complete']
  }

  if (
    paper.days_left === null ||
    paper.days_left === undefined
  ) {
    return ['No deadline', 'status-neutral']
  }

  if (paper.days_left < 0) {
    return ['Deadline passed', 'status-danger']
  }

  const remaining = 100 - paper.progress

  if (paper.days_left <= 14 && remaining >= 35) {
    return ['Priority Work', 'status-danger']
  }

  if (paper.days_left >= 45 && remaining >= 25) {
    return ['Deep Work', 'status-careful']
  }

  return ['On Track', 'status-normal']
}

function formatDate(value) {
  if (!value) return 'Not set'

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function deadlineText(days) {
  if (days === null || days === undefined) {
    return 'Deadline not set'
  }

  if (days < 0) {
    return `Deadline passed ${Math.abs(days)} days ago`
  }

  if (days === 0) {
    return 'Submission deadline is today'
  }

  return `${days} days until submission deadline`
}

export default function PaperDetail() {
  const { paperId } = useParams()

  const [paper, setPaper] = useState(null)
  const [tasks, setTasks] = useState([])
  const [conferences, setConferences] = useState([])

  const [newTask, setNewTask] = useState('')
  const [category, setCategory] = useState('Other')

  const [showConferencePicker, setShowConferencePicker] =
    useState(false)

  const [selectedConferenceId, setSelectedConferenceId] =
    useState('')

  const [loadingConferences, setLoadingConferences] =
    useState(false)

  // =========================
  // AI STATE
  // =========================

  const [aiInsight, setAiInsight] = useState(null)
  const [aiNext, setAiNext] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // =========================
  // LOAD PAPER
  // =========================

  const load = async () => {
    const [paperRes, tasksRes] = await Promise.all([
      instance.get(
        ENDPOINTS.PAPER(paperId),
      ),
      instance.get(
        ENDPOINTS.TASKS(paperId),
      ),
    ])

    setPaper(paperRes.data)
    setTasks(tasksRes.data)
  }

  // =========================
  // LOAD CONFERENCES
  // =========================

  const loadConferences = async () => {
    setLoadingConferences(true)

    try {
      const [
        paperConferenceRes,
        allConferenceRes,
      ] = await Promise.all([
        instance.get(
          `${ENDPOINTS.PAPER(paperId)}/conferences`,
        ),
        instance.get(
          ENDPOINTS.CONFERENCES(),
        ),
      ])

      const attachedIds = new Set(
        paperConferenceRes.data.map(
          (conference) => conference.id,
        ),
      )

      const available =
        allConferenceRes.data.filter(
          (conference) =>
            !attachedIds.has(conference.id),
        )

      setConferences(available)
    } catch (error) {
      console.error(
        'CONFERENCE LOAD ERROR:',
        error,
      )

      toast.error(
        error.response?.data?.detail ||
          'Could not load conferences',
      )
    } finally {
      setLoadingConferences(false)
    }
  }

  useEffect(() => {
    load().catch((error) => {
      console.error(
        'PAPER LOAD ERROR:',
        error,
      )
    })
  }, [paperId])

  // =========================
  // TASKS
  // =========================

  const addTask = async (e) => {
    e.preventDefault()

    if (!newTask.trim()) return

    try {
      await instance.post(
        ENDPOINTS.TASKS(paperId),
        {
          title: newTask.trim(),
          category,
        },
      )

      setNewTask('')

      toast.success('Task added')

      await load()

      // Clear old AI result because paper context changed.
      setAiInsight(null)
      setAiNext(null)
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          'Could not add task',
      )
    }
  }

  const toggle = async (task) => {
    try {
      await instance.put(
        ENDPOINTS.TASK(
          paperId,
          task.id,
        ),
        {
          ...task,
          completed: !task.completed,
        },
      )

      await load()

      // Clear old AI result because progress changed.
      setAiInsight(null)
      setAiNext(null)
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          'Could not update task',
      )
    }
  }

  const remove = async (id) => {
    try {
      await instance.delete(
        ENDPOINTS.TASK(
          paperId,
          id,
        ),
      )

      await load()

      // Clear old AI result because task context changed.
      setAiInsight(null)
      setAiNext(null)
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          'Could not delete task',
      )
    }
  }

  // =========================
  // CONFERENCES
  // =========================

  const openConferencePicker = async () => {
    setShowConferencePicker(true)
    setSelectedConferenceId('')

    await loadConferences()
  }

  const addConference = async () => {
    if (!selectedConferenceId) {
      toast.error('Please select a conference')
      return
    }

    try {
      await instance.post(
        `${ENDPOINTS.PAPER(
          paperId,
        )}/conferences/${selectedConferenceId}`,
      )

      toast.success(
        'Conference added to paper',
      )

      setShowConferencePicker(false)
      setSelectedConferenceId('')

      await load()

      // Deadline context changed.
      setAiInsight(null)
      setAiNext(null)
    } catch (error) {
      console.error(
        'CONFERENCE ATTACH ERROR:',
        error,
      )

      toast.error(
        error.response?.data?.detail ||
          'Could not add conference',
      )
    }
  }

  const removeConference = async (
    conferenceId,
  ) => {
    if (
      !window.confirm(
        'Remove this conference from the paper?',
      )
    ) {
      return
    }

    try {
      await instance.delete(
        `${ENDPOINTS.PAPER(
          paperId,
        )}/conferences/${conferenceId}`,
      )

      toast.success('Conference removed')

      await load()

      // Deadline context changed.
      setAiInsight(null)
      setAiNext(null)
    } catch (error) {
      console.error(
        'CONFERENCE REMOVE ERROR:',
        error,
      )

      toast.error(
        error.response?.data?.detail ||
          'Could not remove conference',
      )
    }
  }

  // =========================
  // PROGRESS
  // =========================

  const progress = useMemo(
    () =>
      tasks.length
        ? Math.round(
            (tasks.filter(
              (task) => task.completed,
            ).length /
              tasks.length) *
              100,
          )
        : 0,
    [tasks],
  )

  // =========================
  // AI
  // =========================

  const generateAI = async () => {
    setAiLoading(true)

    try {
      const [
        insightRes,
        nextRes,
      ] = await Promise.all([
        instance.get(
          ENDPOINTS.AI_INSIGHT(paperId),
        ),
        instance.get(
          ENDPOINTS.AI_NEXT(paperId),
        ),
      ])

      setAiInsight(
        insightRes.data.data,
      )

      setAiNext(
        nextRes.data.data,
      )

      toast.success(
        'AI insight generated',
      )
    } catch (error) {
      console.error(
        'AI ERROR:',
        error,
      )

      toast.error(
        error.response?.data?.detail ||
          'Could not generate AI insight',
      )
    } finally {
      setAiLoading(false)
    }
  }

  // =========================
  // LOADING
  // =========================

  if (!paper) {
    return (
      <main className="page">
        <p>Loading paper...</p>
      </main>
    )
  }

  const paperWithProgress = {
    ...paper,
    progress,
  }

  const [
    status,
    statusClass,
  ] = workStatus(
    paperWithProgress,
  )

  const linkedConferences =
    paper.conferences || []

  return (
    <main className="page detail-page">

      <Link
        className="back-link"
        to="/papers"
      >
        <ArrowLeft size={16} />
        All papers
      </Link>

      {/* =========================
          PAPER HEADER
      ========================= */}

      <section className="paper-header">
        <div>
          <p className="eyebrow">
            {paper.research_field ||
              'Research paper'}
          </p>

          <h1>{paper.title}</h1>

          <p className="muted">
            {paper.description ||
              'Build your research one task at a time.'}
          </p>
        </div>

        <div className="paper-status">
          <span
            className={`status ${statusClass}`}
          >
            {status}
          </span>

          {paper.days_left !== null &&
            paper.days_left !== undefined && (
              <strong>
                {paper.days_left < 0
                  ? 'Past deadline'
                  : `${paper.days_left} days left`}
              </strong>
            )}
        </div>
      </section>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <section className="detail-grid">

        <div className="main-panel">

          {/* WORKFLOW */}

          <div className="panel-heading">
            <div>
              <h2>
                Research workflow
              </h2>

              <p className="muted">
                Complete tasks sequentially to
                track this paper's progress.
              </p>
            </div>

            <strong>{progress}%</strong>
          </div>

          <div className="progress-track large">
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="task-list">

            {tasks.map((task) => (
              <div
                className={`task-row ${
                  task.completed
                    ? 'done'
                    : ''
                }`}
                key={task.id}
              >

                <button
                  className="check-btn"
                  type="button"
                  onClick={() =>
                    toggle(task)
                  }
                >
                  {task.completed && (
                    <Check size={15} />
                  )}
                </button>

                <div className="task-content">
                  <span>
                    {task.title}
                  </span>

                  <small>
                    {task.category}
                  </small>
                </div>

                <button
                  className="icon-btn"
                  type="button"
                  onClick={() =>
                    remove(task.id)
                  }
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}

            {!tasks.length && (
              <p className="empty-text">
                No tasks yet. Start with your
                first research step.
              </p>
            )}

          </div>

          {/* ADD TASK */}

          <form
            className="add-task"
            onSubmit={addTask}
          >
            <input
              value={newTask}
              onChange={(e) =>
                setNewTask(e.target.value)
              }
              placeholder="Add a research task..."
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              {categories.map(
                (item) => (
                  <option key={item}>
                    {item}
                  </option>
                ),
              )}
            </select>

            <button
              className="primary-btn"
              type="submit"
            >
              <Plus size={17} />
              Add
            </button>
          </form>

          {/* =========================
              AI INSIGHTS
          ========================= */}

          <section className="ai-panel">

            {/* AI HEADER */}

            <div className="ai-panel-header">

              <div className="ai-header-left">

                <div className="ai-header-icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="ai-label">
                    RESEARCHFLOW AI
                  </p>

                  <h2>
                    Paper progress at a glance
                  </h2>

                  <p className="muted">
                    A quick look at what needs attention.
                  </p>
                </div>

              </div>

              <button
                className="primary-btn small ai-generate-btn"
                type="button"
                onClick={generateAI}
                disabled={aiLoading}
              >
                <Sparkles size={15} />

                {aiLoading
                  ? 'Analyzing...'
                  : aiInsight
                    ? 'Refresh'
                    : 'Generate insight'}
              </button>

            </div>


            {/* AI RESULTS */}

            {aiInsight && (
              <div className="ai-results">

                {/* MAIN INSIGHT */}

                <article className="ai-main-card">

                  <div className="ai-main-top">

                    <div>

                      <span
                        className={`ai-priority ai-priority-${aiInsight.priority?.toLowerCase()}`}
                      >
                        {aiInsight.priority === 'High'
                          ? '🔴'
                          : aiInsight.priority === 'Medium'
                            ? '🟡'
                            : '🟢'}

                        {aiInsight.priority} Priority
                      </span>

                      <h3>
                        {aiInsight.headline}
                      </h3>

                    </div>

                  </div>


                  {/* METRICS */}

                  <div className="ai-metrics">

                    <div className="ai-metric">
                      <strong>{progress}%</strong>
                      <span>Progress</span>
                    </div>

                    <div className="ai-metric">

                      <strong>
                        {tasks.filter(
                          (task) => !task.completed,
                        ).length}
                      </strong>

                      <span>
                        {tasks.filter(
                          (task) => !task.completed,
                        ).length === 1
                          ? 'Task remaining'
                          : 'Tasks remaining'}
                      </span>

                    </div>

                    <div className="ai-metric">

                      <strong>
                        {paper.days_left !== null &&
                        paper.days_left !== undefined
                          ? paper.days_left < 0
                            ? 'Past'
                            : paper.days_left
                          : '—'}
                      </strong>

                      <span>
                        {paper.days_left !== null &&
                        paper.days_left !== undefined
                          ? paper.days_left < 0
                            ? 'Deadline'
                            : 'Days left'
                          : 'Deadline'}
                      </span>

                    </div>

                  </div>


                  {/* SHORT SUMMARY */}

                  <p className="ai-summary">
                    {aiInsight.summary}
                  </p>

                </article>


                {/* WHY + NEXT */}

                <div className="ai-two-column">

                  <div className="ai-small-card">

                    <span className="ai-card-label">
                      WHY
                    </span>

                    <p>
                      {aiInsight.reason}
                    </p>

                  </div>


                  <div className="ai-small-card">

                    <span className="ai-card-label">
                      NEXT
                    </span>

                    <p>
                      {aiInsight.suggestion}
                    </p>

                  </div>

                </div>


                {/* WHAT'S NEXT */}

                {aiNext && (
                  <article className="ai-next-card">

                    <div className="ai-next-top">

                      <div className="ai-next-heading">

                        <span className="ai-next-icon">
                          🎯
                        </span>

                        <div>

                          <span className="ai-card-label">
                            WHAT'S NEXT?
                          </span>

                          <h3>
                            {aiNext.task}
                          </h3>

                        </div>

                      </div>


                      <span
                        className={`ai-urgency ai-urgency-${aiNext.urgency?.toLowerCase()}`}
                      >
                        {aiNext.urgency}
                      </span>

                    </div>


                    <div className="ai-next-content">

                      <p>
                        <strong>Why:</strong>{' '}
                        {aiNext.why}
                      </p>

                      <p>
                        <strong>Action:</strong>{' '}
                        {aiNext.action}
                      </p>

                    </div>

                  </article>
                )}

              </div>
            )}

          </section>


        </div>

        {/* =========================
            SIDE PANEL
        ========================= */}

        <aside className="side-panel">

          {/* PROGRESS */}

          <div className="info-card">

            <span>
              Progress
            </span>

            <strong>
              {progress}%
            </strong>

            <p>
              {
                tasks.filter(
                  (task) =>
                    task.completed,
                ).length
              }{' '}
              of {tasks.length} tasks completed
            </p>

          </div>

          {/* CONFERENCES */}

          <div className="info-card">

            <div className="panel-heading">

              <span>
                Conferences
              </span>

              <button
                className="icon-btn"
                type="button"
                title="Add conference"
                onClick={
                  openConferencePicker
                }
              >
                <Plus size={16} />
              </button>

            </div>

            {linkedConferences.length ? (

              <div className="paper-conferences">

                {linkedConferences.map(
                  (conference) => (

                    <div
                      className="paper-conference"
                      key={conference.id}
                    >

                      <div>

                        <strong>
                          {conference.name}
                        </strong>

                        {conference.acronym && (
                          <small>
                            {conference.acronym}
                          </small>
                        )}

                      </div>

                      <button
                        className="danger-icon"
                        type="button"
                        title="Remove conference"
                        onClick={() =>
                          removeConference(
                            conference.id,
                          )
                        }
                      >
                        <X size={15} />
                      </button>

                      <div className="conference-mini-details">

                        <span>
                          Submission deadline
                        </span>

                        <strong>
                          {formatDate(
                            conference.submission_deadline,
                          )}
                        </strong>

                        {conference.days_until_deadline !==
                          null &&
                          conference.days_until_deadline !==
                            undefined && (
                            <small>
                              {deadlineText(
                                conference.days_until_deadline,
                              )}
                            </small>
                          )}

                      </div>

                      {conference.official_url && (
                        <a
                          href={
                            conference.official_url
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Official conference page
                          <ExternalLink
                            size={13}
                          />
                        </a>
                      )}

                    </div>

                  ),
                )}

              </div>

            ) : (

              <div>

                <strong>
                  No conference
                </strong>

                <p className="muted">
                  Optional. Add a conference
                  later to track a submission
                  deadline.
                </p>

                <button
                  className="primary-btn small"
                  type="button"
                  onClick={
                    openConferencePicker
                  }
                  style={{
                    marginTop: '12px',
                  }}
                >
                  <Plus size={15} />
                  Add conference
                </button>

              </div>

            )}

            {/* CONFERENCE PICKER */}

            {showConferencePicker && (

              <div className="conference-picker">

                <div className="panel-heading">

                  <strong>
                    Add conference
                  </strong>

                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() =>
                      setShowConferencePicker(
                        false,
                      )
                    }
                  >
                    <X size={15} />
                  </button>

                </div>

                {loadingConferences ? (

                  <p className="muted">
                    Loading conferences...
                  </p>

                ) : conferences.length ? (

                  <>

                    <select
                      value={
                        selectedConferenceId
                      }
                      onChange={(e) =>
                        setSelectedConferenceId(
                          e.target.value,
                        )
                      }
                    >

                      <option value="">
                        Select a conference
                      </option>

                      {conferences.map(
                        (conference) => (
                          <option
                            key={conference.id}
                            value={
                              conference.id
                            }
                          >
                            {conference.name}
                            {conference.acronym
                              ? ` (${conference.acronym})`
                              : ''}
                          </option>
                        ),
                      )}

                    </select>

                    <button
                      className="primary-btn"
                      type="button"
                      onClick={
                        addConference
                      }
                    >
                      Add to paper
                    </button>

                  </>

                ) : (

                  <div>

                    <p className="muted">
                      No available conferences.
                    </p>

                    <Link
                      className="conference-link"
                      to="/conferences"
                    >
                      Add one from Conferences
                      <ExternalLink
                        size={14}
                      />
                    </Link>

                  </div>

                )}

              </div>

            )}

          </div>

          {/* WORK STATUS */}

          <div className="info-card">

            <span>
              Work pace
            </span>

            <strong>
              {status}
            </strong>

            <p>
              Based on your current task
              progress and the optional
              submission deadline.
            </p>

          </div>

        </aside>

      </section>

    </main>
  )
}