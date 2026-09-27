import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

import Login from './components/Login'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Papers from './components/Papers'
import PaperDetail from './components/PaperDetail'
import Conferences from './components/Conferences'
import Contact from './components/Contact'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Navbar />
    {children}
  </ProtectedRoute>
)

export const App = () => (
  <BrowserRouter>
    <ToastContainer position="top-right" autoClose={2200} />

    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/papers"
        element={
          <ProtectedLayout>
            <Papers />
          </ProtectedLayout>
        }
      />

      <Route
        path="/papers/:paperId"
        element={
          <ProtectedLayout>
            <PaperDetail />
          </ProtectedLayout>
        }
      />

      <Route
        path="/conferences"
        element={
          <ProtectedLayout>
            <Conferences />
          </ProtectedLayout>
        }
      />

      <Route
        path="/contact"
        element={
          <ProtectedLayout>
            <Contact />
          </ProtectedLayout>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  </BrowserRouter>
)