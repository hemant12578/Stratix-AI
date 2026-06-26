import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'
import { GradientText } from '../components/AnimatedText'

const isAdminEmail = (email = '') => {
  const allowList = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowList.length > 0) {
    return allowList.includes(email.toLowerCase())
  }

  return email.toLowerCase().includes('admin')
}

function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      if (!isAdminEmail(email)) {
        setError('This account is not authorized for admin. Ask an admin to add your email to VITE_ADMIN_EMAILS.')
        setLoading(false)
        return
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err?.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800/60 border border-gray-700 rounded-2xl p-8 shadow-xl">
          <p className="text-sm text-primary-300 uppercase tracking-wide mb-2">Admin Access</p>
          <h1 className="text-3xl font-bold mb-2">
            <GradientText text="Admin Login" />
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Use an authorized admin email. Configure allowed emails via `VITE_ADMIN_EMAILS` (comma-separated).
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none"
                placeholder="admin@yourcompany.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none"
                placeholder="Your password"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary-500 hover:bg-primary-400 transition-colors font-semibold disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="text-xs text-gray-500">
              Tip: Set `VITE_ADMIN_EMAILS=admin@yourcompany.com` in `client/.env` to allow admin access.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminLogin
