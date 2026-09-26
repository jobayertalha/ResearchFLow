import axios from 'axios'

export const ENDPOINTS = {
  LOGIN: () => '/users/login',
  PAPERS: () => '/papers',
  PAPER: (id) => `/papers/${id}`,
  TASKS: (paperId) => `/papers/${paperId}/tasks`,
  TASK: (paperId, taskId) => `/papers/${paperId}/tasks/${taskId}`,
}

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)
