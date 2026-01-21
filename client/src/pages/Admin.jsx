import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Users, Database, TrendingUp, DollarSign, Settings,
  BarChart3, FileText, AlertCircle, CheckCircle, XCircle,
  Download, Search, Calendar, Zap
} from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

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
  const [employees, setEmployees] = useState([])
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', role: 'analyst' })
  const [featureFlags, setFeatureFlags] = useState({
    datasetSearch: true,
    processing: true,
    downloads: true,
  })

  useEffect(() => {
    // AdminRoute already protects; just end loading
    setLoading(false)
  }, [])

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
              <span className="text-sm text-gray-400">{currentUser?.email}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
              >
                User Dashboard
              </button>
              <button
                onClick={logout}
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
            {/* Recent Users */}
            <FadeInText delay={600}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-400" />
                  Recent Users
                </h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <p>No data loaded. Connect this panel to your admin APIs.</p>
                  <p className="text-xs text-gray-500">Hook up: GET /admin/users, GET /admin/requests</p>
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
                <div className="space-y-3 text-sm text-gray-400">
                  <p>No data loaded. Connect to your request logs endpoint.</p>
                  <p className="text-xs text-gray-500">Hook up: GET /admin/requests</p>
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
                      onClick={() => {
                        if (!employeeForm.email || !employeeForm.name) return
                        setEmployees(list => [...list, { ...employeeForm, id: Date.now().toString() }])
                        setEmployeeForm({ name: '', email: '', role: 'analyst' })
                      }}
                    >
                      Save Employee (wire to API)
                    </button>
                    <p className="text-xs text-gray-500">Hook up: POST /admin/employees</p>
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
                    <button className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-400 transition-colors text-sm font-semibold">
                      Save Toggles (wire to API)
                    </button>
                    <p className="text-xs text-gray-500">Hook up: PUT /admin/features</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeInText>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Admin
