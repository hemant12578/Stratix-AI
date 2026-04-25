import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Users, Database, TrendingUp, DollarSign, Settings,
  FileText, Search, Zap, Trash2, Save, RefreshCw
} from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'
import axios from '../config/api'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

function Admin() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    totalDatasets: 0,
    revenue: 0,
    activeUsers: 0,
    processingJobs: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState('')
  const [employees, setEmployees] = useState([])
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', role: 'analyst' })
  const [accounts, setAccounts] = useState([])
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ name: '', email: '', subscriptionTier: 'free' })
  const [editingUserId, setEditingUserId] = useState('')
  const [editingUserForm, setEditingUserForm] = useState({ name: '', email: '', subscriptionTier: 'free', active: true })
  const [analytics, setAnalytics] = useState({
    dailyNewUsers: [],
    dailyRequests: [],
    planDistribution: [],
    roles: [],
  })
  const [featureFlags, setFeatureFlags] = useState({
    datasetSearch: true,
    processing: true,
    downloads: true,
    strategyHub: true,
  })

  const adminHeader = {
    headers: {
      'x-admin-email': sessionStorage.getItem('adminEmail') || currentUser?.email || '',
      ...(sessionStorage.getItem('adminToken')
        ? { 'x-admin-token': sessionStorage.getItem('adminToken') }
        : {}),
    },
  }

  const loadAdminData = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    setError('')
    try {
      const [overviewRes, usersRes, accountsRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/overview', adminHeader),
        axios.get('/api/admin/users', adminHeader),
        axios.get('/api/admin/accounts', adminHeader),
        axios.get('/api/admin/analytics', adminHeader),
      ])
      const data = overviewRes.data || {}
      setStats(data.stats || {})
      setRecentUsers(data.recentUsers || [])
      setRecentRequests(data.recentRequests || [])
      setFeatureFlags(data.features || {})
      setEmployees(data.employees || [])
      setUsers(usersRes.data?.users || [])
      setAccounts(accountsRes.data?.accounts || [])
      setAnalytics(analyticsRes.data || { dailyNewUsers: [], dailyRequests: [], planDistribution: [], roles: [] })
      setLastSync(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load admin data')
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  useEffect(() => {
    if (!(currentUser?.email || sessionStorage.getItem('adminToken'))) return
    loadAdminData(true)
    const id = setInterval(() => {
      loadAdminData(false)
    }, 10000)
    return () => clearInterval(id)
  }, [currentUser])

  const handleSaveFeatureFlags = async () => {
    setSaving(true)
    setError('')
    try {
      await axios.put('/api/admin/features', { features: featureFlags }, adminHeader)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save feature toggles')
    } finally {
      setSaving(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!employeeForm.email || !employeeForm.name) return
    setSaving(true)
    setError('')
    try {
      const res = await axios.post('/api/admin/employees', employeeForm, adminHeader)
      setEmployees((list) => [res.data.employee, ...list])
      setEmployeeForm({ name: '', email: '', role: 'analyst' })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add employee')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAccount = async () => {
    if (!accountForm.name || !accountForm.email || !accountForm.password) return
    setSaving(true)
    setError('')
    try {
      const res = await axios.post('/api/admin/accounts', accountForm, adminHeader)
      setAccounts((list) => [res.data.account, ...list])
      setAccountForm({ name: '', email: '', password: '', role: 'employee' })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email) return
    setSaving(true)
    setError('')
    try {
      const res = await axios.post('/api/admin/users', newUser, adminHeader)
      setUsers((list) => [res.data.user, ...list])
      setNewUser({ name: '', email: '', subscriptionTier: 'free' })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add user')
    } finally {
      setSaving(false)
    }
  }

  const startEditUser = (user) => {
    setEditingUserId(user.id)
    setEditingUserForm({
      name: user.name || '',
      email: user.email || '',
      subscriptionTier: user.subscriptionTier || 'free',
      active: !!user.active,
    })
  }

  const cancelEditUser = () => {
    setEditingUserId('')
    setEditingUserForm({ name: '', email: '', subscriptionTier: 'free', active: true })
  }

  const handleUpdateUser = async (userId) => {
    setSaving(true)
    setError('')
    try {
      const res = await axios.put(`/api/admin/users/${userId}`, editingUserForm, adminHeader)
      setUsers((list) => list.map((u) => (u.id === userId ? res.data.user : u)))
      cancelEditUser()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setSaving(true)
    setError('')
    try {
      await axios.delete(`/api/admin/users/${userId}`, adminHeader)
      setUsers((list) => list.filter((u) => u.id !== userId))
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Animated Background */}
      <AuroraBackground />
      <ParticlesBackground count={20} />

      <div className="relative z-10 flex-1">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadAdminData(false)}
                className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-xs flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <span className="text-xs text-gray-500">Live: {lastSync || 'syncing...'}</span>
              <span className="text-sm text-gray-400">{currentUser?.email}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
              >
                User Dashboard
              </button>
              <button
                onClick={async () => {
                  sessionStorage.removeItem('adminToken')
                  sessionStorage.removeItem('adminEmail')
                  sessionStorage.removeItem('adminRole')
                  await logout()
                  navigate('/')
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <FadeInText delay={0}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Users className="w-8 h-8 text-primary-400 mb-2" />
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
            </FadeInText>
            <FadeInText delay={100}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Search className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Total Requests</p>
              </div>
            </FadeInText>
            <FadeInText delay={200}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Database className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold">{stats.totalDatasets}</p>
                <p className="text-sm text-gray-400">Datasets</p>
              </div>
            </FadeInText>
            <FadeInText delay={300}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Revenue</p>
              </div>
            </FadeInText>
            <FadeInText delay={400}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Zap className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-gray-400">Active Users</p>
              </div>
            </FadeInText>
            <FadeInText delay={500}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <TrendingUp className="w-8 h-8 text-pink-400 mb-2" />
                <p className="text-2xl font-bold">{stats.processingJobs}</p>
                <p className="text-sm text-gray-400">Processing</p>
              </div>
            </FadeInText>
          </div>

          {/* Charts and Tables */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Daily New Users</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyNewUsers || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Daily Requests</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dailyRequests || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.planDistribution || []} dataKey="value" nameKey="name" outerRadius={90}>
                      {(analytics.planDistribution || []).map((_, idx) => (
                        <Cell key={`plan-${idx}`} fill={['#22c55e', '#3b82f6', '#a855f7'][idx % 3]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Admin vs Employee Accounts</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.roles || []} dataKey="value" nameKey="name" outerRadius={90}>
                      {(analytics.roles || []).map((_, idx) => (
                        <Cell key={`role-${idx}`} fill={['#f59e0b', '#06b6d4'][idx % 2]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Recent Users */}
            <FadeInText delay={600}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  Recent Users
                </h3>
                <div className="space-y-2 text-sm text-gray-300 max-h-64 overflow-auto">
                  {recentUsers.length === 0 && <p className="text-gray-400">No users yet.</p>}
                  {recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2">
                      <div>
                        <p className="font-medium">{u.name || u.email}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                      <span className="text-xs capitalize text-primary-300">{u.subscriptionTier || 'free'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInText>

            {/* Recent Requests */}
            <FadeInText delay={700}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Recent Requests
                </h3>
                <div className="space-y-2 text-sm text-gray-300 max-h-64 overflow-auto">
                  {recentRequests.length === 0 && <p className="text-gray-400">No requests yet.</p>}
                  {recentRequests.map((r) => (
                    <div key={r.jobId} className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2">
                      <div>
                        <p className="font-medium">Job {r.jobId.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{r.message}</p>
                      </div>
                      <span className="text-xs capitalize text-green-300">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInText>
          </div>

          {/* Management Actions + Employee Add */}
          <FadeInText delay={800}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                Management Actions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-700/20 rounded-lg border border-gray-700 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    User Control
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser((v) => ({ ...v, name: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser((v) => ({ ...v, email: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <select
                      value={newUser.subscriptionTier}
                      onChange={(e) => setNewUser((v) => ({ ...v, subscriptionTier: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddUser}
                    disabled={saving}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-sm font-semibold disabled:opacity-60"
                  >
                    Add User
                  </button>
                  <div className="max-h-44 overflow-auto space-y-2">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
                        {editingUserId === u.id ? (
                          <div className="w-full space-y-2">
                            <input
                              type="text"
                              value={editingUserForm.name}
                              onChange={(e) => setEditingUserForm((v) => ({ ...v, name: e.target.value }))}
                              className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700"
                            />
                            <input
                              type="email"
                              value={editingUserForm.email}
                              onChange={(e) => setEditingUserForm((v) => ({ ...v, email: e.target.value }))}
                              className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700"
                            />
                            <div className="flex gap-2">
                              <select
                                value={editingUserForm.subscriptionTier}
                                onChange={(e) => setEditingUserForm((v) => ({ ...v, subscriptionTier: e.target.value }))}
                                className="px-2 py-1 rounded bg-gray-800 border border-gray-700"
                              >
                                <option value="free">free</option>
                                <option value="pro">pro</option>
                                <option value="enterprise">enterprise</option>
                              </select>
                              <label className="flex items-center gap-1 text-xs text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={editingUserForm.active}
                                  onChange={(e) => setEditingUserForm((v) => ({ ...v, active: e.target.checked }))}
                                />
                                active
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateUser(u.id)} className="px-2 py-1 bg-emerald-600 rounded text-xs flex items-center gap-1">
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                              <button onClick={cancelEditUser} className="px-2 py-1 bg-gray-700 rounded text-xs">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="font-medium">{u.name || u.email}</p>
                              <p className="text-xs text-gray-400">{u.subscriptionTier || 'free'} • {u.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => startEditUser(u)} className="text-xs text-cyan-300 hover:text-cyan-200">Edit</button>
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-700/20 rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-300" />
                    Admin / Employee Accounts (Email + Password)
                  </h4>
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm((v) => ({ ...v, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm((v) => ({ ...v, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={accountForm.password}
                      onChange={(e) => setAccountForm((v) => ({ ...v, password: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <select
                      value={accountForm.role}
                      onChange={(e) => setAccountForm((v) => ({ ...v, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={handleAddAccount}
                      disabled={saving}
                      className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors text-sm font-semibold disabled:opacity-60"
                    >
                      Create Account
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {accounts.length === 0 && <p className="text-gray-400 text-sm">No admin/employee accounts yet.</p>}
                    {accounts.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <p className="text-gray-400">{a.email}</p>
                        </div>
                        <span className="text-cyan-300 text-xs uppercase">{a.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-700/20 rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    Add Employee (Admin-only)
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={employeeForm.name}
                      onChange={e => setEmployeeForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={employeeForm.email}
                      onChange={e => setEmployeeForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    />
                    <select
                      value={employeeForm.role}
                      onChange={e => setEmployeeForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-primary-400 focus:outline-none text-sm"
                    >
                      <option value="analyst">Analyst</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-400 transition-colors text-sm font-semibold"
                      onClick={handleAddEmployee}
                    >
                      Save Employee
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {employees.length === 0 && <p className="text-gray-400 text-sm">No employees added yet.</p>}
                    {employees.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-gray-400">{emp.email}</p>
                        </div>
                        <span className="text-primary-300 text-xs uppercase">{emp.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-700/20 rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-yellow-400" />
                    Feature Toggles
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(featureFlags).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => setFeatureFlags(f => ({ ...f, [key]: !f[key] }))}
                          className="form-checkbox h-4 w-4 text-primary-500"
                        />
                      </label>
                    ))}
                    <button
                      onClick={handleSaveFeatureFlags}
                      disabled={saving}
                      className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-400 transition-colors text-sm font-semibold disabled:opacity-60"
                    >
                      Apply Feature Controls
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeInText>
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Admin
