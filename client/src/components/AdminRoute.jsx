import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const isAdminEmail = (email = '') => {
  const allowList = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowList.length > 0) {
    return allowList.includes(email.toLowerCase())
  }

  // Fallback: simple heuristic
  return email.toLowerCase().includes('admin')
}

export function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/admin-login" replace />
  }

  if (!isAdminEmail(currentUser.email)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
