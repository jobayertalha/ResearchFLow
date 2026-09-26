import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Papers from './components/Papers'
import PaperDetail from './components/PaperDetail'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" replace />
}

export const App = () => (
  <BrowserRouter>
    <ToastContainer position="top-right" autoClose={2200} />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navbar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/papers"
        element={
          <ProtectedRoute>
            <Navbar />
            <Papers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/papers/:paperId"
        element={
          <ProtectedRoute>
            <Navbar />
            <PaperDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
)
