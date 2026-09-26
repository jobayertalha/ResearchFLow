import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { instance, ENDPOINTS } from './api'
import { toast } from 'react-toastify'

export default function Login() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Please enter your name')

    try {
      setLoading(true)
      const res = await instance.post(ENDPOINTS.LOGIN(), { name: name.trim() })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userName', res.data.user.name)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not continue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand-mark">R</div>
        <p className="eyebrow">ResearchFlow</p>
        <h1>Research, organized.</h1>
        <p className="muted">Track every paper, task, and deadline in one place.</p>
        <label>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Talha Jobayer" autoFocus />
        <button className="primary-btn" disabled={loading}>{loading ? 'Starting...' : 'Continue'}</button>
      </form>
    </main>
  )
}
