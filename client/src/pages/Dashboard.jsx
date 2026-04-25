import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Search, Database, Download, History, Settings, 
  User, LogOut, CreditCard, Zap, TrendingUp, FileText,
  Calendar, BarChart3, Sparkles, Menu, X
} from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'
import axios from '../config/api'

function Dashboard() {
  const { currentUser, logout, userProfile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Load user history from API
    const fetchHistory = async () => {
      try {
        const localHistory = JSON.parse(localStorage.getItem('localHistory') || '[]')
        const token = currentUser ? await currentUser.getIdToken() : null
        const response = await axios.get('/api/user/history', {
          headers: token ? {
            Authorization: `Bearer ${token}`
          } : {}
        })
        const apiHistory = response.data.history || []
        const merged = [...localHistory, ...apiHistory]
        const unique = []
        const seen = new Set()
        for (const item of merged) {
          const key = item.jobId || item.id || `${item.datasetId || ''}-${item.completedAt || ''}`
          if (seen.has(key)) continue
          seen.add(key)
          unique.push(item)
        }
        setHistory(unique)
      } catch (error) {
        console.error('Failed to load history:', error)
        const localHistory = JSON.parse(localStorage.getItem('localHistory') || '[]')
        setHistory(localHistory)
      } finally {
        setLoading(false)
      }
    }
    
    if (currentUser) {
      fetchHistory()
    } else {
      setLoading(false)
      const localHistory = JSON.parse(localStorage.getItem('localHistory') || '[]')
      setHistory(localHistory)
    }
  }, [currentUser])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const localHistory = JSON.parse(localStorage.getItem('localHistory') || '[]')
        if (localHistory.length) {
          setHistory(prev => {
            const merged = [...localHistory, ...prev]
            const unique = []
            const seen = new Set()
            for (const item of merged) {
              const key = item.jobId || item.id || `${item.datasetId || ''}-${item.completedAt || ''}`
              if (seen.has(key)) continue
              seen.add(key)
              unique.push(item)
            }
            return unique
          })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleNewSearch = () => {
    navigate('/')
  }

  const subscriptionTier = userProfile?.subscriptionTier || 'free'
  const requestsUsed = userProfile?.requestsUsed || 0
  const requestsLimit = subscriptionTier === 'free' ? 5 : subscriptionTier === 'pro' ? 50 : Infinity

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <AuroraBackground />
      <ParticlesBackground count={30} />

      <div className="relative z-10 flex">
        {sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-72 lg:w-64 bg-gray-800/80 lg:bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 min-h-screen p-6 transform transition-transform duration-200 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="mb-8 flex items-center justify-between">
            <img src="/assets/transparent.png" alt="Stratix AI" className="h-8 w-auto" />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/30"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{currentUser?.displayName || currentUser?.email}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-primary-900/30 rounded text-xs">
              <Zap className="w-3 h-3 text-primary-400" />
              <span className="capitalize">{subscriptionTier} Plan</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'history', label: 'History', icon: History },
              { id: 'pricing', label: 'Pricing', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'strategy', label: 'Strategy Hub', icon: Sparkles }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'strategy') {
                    navigate('/strategy-hub')
                  } else {
                    setActiveTab(item.id)
                  }
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/50'
                    : 'text-gray-400 hover:bg-gray-700/30 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 hover:bg-gray-800"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/assets/transparent.png" alt="Stratix AI" className="h-7 w-auto" />
              <span className="text-sm font-semibold text-gray-200">Dashboard</span>
            </div>
            <div className="w-10" />
          </div>
          {/* Header */}
          <div className="mb-8">
            <FadeInText delay={0}>
              <h2 className="text-3xl font-bold mb-2">
                <GradientText text="Dashboard" />
              </h2>
              <p className="text-gray-400">Manage your ML datasets and requests</p>
            </FadeInText>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <FadeInText delay={100}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-primary-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Database className="w-8 h-8 text-primary-400" />
                      <span className="text-2xl font-bold text-primary-400">{history.filter(h => h.status === 'completed').length}</span>
                    </div>
                    <p className="text-sm text-gray-400">Completed Requests</p>
                  </div>
                </FadeInText>
                <FadeInText delay={200}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 text-purple-400" />
                      <span className="text-2xl font-bold text-purple-400">{requestsUsed}/{requestsLimit === Infinity ? '∞' : requestsLimit}</span>
                    </div>
                    <p className="text-sm text-gray-400">Requests Used</p>
                  </div>
                </FadeInText>
                <FadeInText delay={300}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-8 h-8 text-yellow-400" />
                      <span className="text-2xl font-bold text-yellow-400">
                        {history.reduce((sum, h) => sum + (h.samples || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Total Samples</p>
                  </div>
                </FadeInText>
                <FadeInText delay={400}>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles className="w-8 h-8 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">
                        {(() => {
                          const scores = history.filter(h => h.qualityScore)
                          const total = scores.reduce((sum, h) => sum + h.qualityScore, 0)
                          const avg = scores.length ? total / scores.length : 0
                          return Math.round(avg) || 0
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Avg Quality Score</p>
                  </div>
                </FadeInText>
              </div>

              {/* Quick Actions */}
              <FadeInText delay={500}>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('/search')}
                      className="p-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg transition-all flex items-center gap-3"
                    >
                      <Search className="w-6 h-6" />
                      <span className="font-semibold">New Dataset Search</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-3 border border-gray-600"
                    >
                      <History className="w-6 h-6" />
                      <span className="font-semibold">View History</span>
                    </button>
                  </div>
                </div>
              </FadeInText>

              {/* Recent Activity */}
              <FadeInText delay={600}>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {history.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.query}</p>
                          <p className="text-sm text-gray-400">{(item.datasets || []).join(', ')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">{item.date}</span>
                          {item.status === 'completed' && (
                            <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                              Completed
                            </span>
                          )}
                          {item.status === 'processing' && (
                            <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs">
                              Processing
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInText>
            </div>
          )}


          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <FadeInText delay={0}>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold mb-4">Request History</h3>
                  {loading ? (
                    <p className="text-gray-400">Loading...</p>
                  ) : history.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No history yet. Start searching for datasets!</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <FadeInText key={item.id} delay={index * 100}>
                          <div className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium mb-1">{item.query}</p>
                                <p className="text-sm text-gray-400 mb-2">
                                  Datasets: {(item.datasets || []).join(', ')}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {item.date}
                                  </span>
                                  {item.samples && (
                                    <span className="text-gray-400">
                                      {item.samples.toLocaleString()} samples
                                    </span>
                                  )}
                                  {item.qualityScore && (
                                    <span className="text-green-400">
                                      Quality: {item.qualityScore}/100
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.status === 'completed' && (
                                  <>
                                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm">
                                      <Download className="w-4 h-4 inline mr-1" />
                                      Download
                                    </button>
                                    <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                                      Completed
                                    </span>
                                  </>
                                )}
                                {item.status === 'processing' && (
                                  <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs">
                                    Processing...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </FadeInText>
                      ))}
                    </div>
                  )}
                </div>
              </FadeInText>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <FadeInText delay={0}>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-2">
                    <GradientText text="Choose Your Plan" />
                  </h3>
                  <p className="text-gray-400">Upgrade to unlock more features</p>
                </div>
              </FadeInText>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Free',
                    price: '₹0',
                    period: 'forever',
                    features: [
                      '5 requests per month',
                      'Max 10,000 samples',
                      'Basic cleaning only',
                      'JSON/CSV export',
                      'Community support'
                    ],
                    current: subscriptionTier === 'free',
                    button: subscriptionTier === 'free' ? 'Current Plan' : 'Current Plan'
                  },
                  {
                    name: 'Pro',
                    price: '₹999',
                    period: 'month',
                    features: [
                      '50 requests per month',
                      'Unlimited samples',
                      'Advanced cleaning + feature engineering',
                      'All export formats',
                      'API access (100 calls/day)',
                      'Priority processing',
                      'Email support'
                    ],
                    current: subscriptionTier === 'pro',
                    button: subscriptionTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
                    popular: true
                  },
                  {
                    name: 'Enterprise',
                    price: '₹9,999',
                    period: 'month',
                    features: [
                      'Unlimited requests',
                      'White-label solution',
                      'Private data sources',
                      'Custom AI models',
                      'Dedicated support',
                      'SLA guarantee (99.9%)',
                      'On-premise deployment',
                      'Team collaboration'
                    ],
                    current: subscriptionTier === 'enterprise',
                    button: subscriptionTier === 'enterprise' ? 'Current Plan' : 'Contact Sales'
                  }
                ].map((plan, index) => (
                  <FadeInText key={plan.name} delay={index * 100}>
                    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 transition-all ${
                      plan.popular 
                        ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
                        : plan.current
                        ? 'border-green-500'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      {plan.popular && (
                        <div className="text-center mb-4">
                          <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-400">/{plan.period}</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          plan.current
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        disabled={plan.current}
                      >
                        {plan.button}
                      </button>
                    </div>
                  </FadeInText>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <FadeInText delay={0}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-6">Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.displayName || ''}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={currentUser?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Tier</label>
                    <div className="px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600">
                      <span className="capitalize">{subscriptionTier} Plan</span>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold">
                    Save Changes
                  </button>
                </div>
              </div>
            </FadeInText>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
