import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  const name = localStorage.getItem('userName') || 'Researcher'

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    navigate('/')
  }

  return (
    <header className="navbar">
      <NavLink to="/dashboard" className="logo">ResearchFlow</NavLink>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/papers">Papers</NavLink>
      </nav>
      <div className="nav-actions">
        <button className="icon-btn" onClick={() => setDark((v) => !v)} title="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span className="user-name">{name}</span>
        <button className="icon-btn" onClick={logout} title="Logout"><LogOut size={18} /></button>
      </div>
    </header>
  )
}
