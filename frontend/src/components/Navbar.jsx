import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()

  const [dark, setDark] = useState(
    localStorage.getItem('theme') === 'dark',
  )

  const name =
    localStorage.getItem('userName') || 'Researcher'

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
      <NavLink to="/dashboard" className="logo">
        ResearchFlow
      </NavLink>

      <nav>
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/papers">
          Papers
        </NavLink>

        <NavLink to="/conferences">
          Conferences
        </NavLink>

        <NavLink to="/contact">
          Contact
        </NavLink>
      </nav>

      <div className="nav-actions">
        <button
          className="icon-btn"
          onClick={() => setDark((value) => !value)}
          title="Toggle theme"
          type="button"
        >
          {dark ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <span className="user-name">
          {name}
        </span>

        <button
          className="icon-btn"
          onClick={logout}
          title="Logout"
          type="button"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}