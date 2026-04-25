import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/api'
import { Search, Sparkles, Database, Zap, User, LogOut } from 'lucide-react'
import { LoginModal } from '../components/LoginModal'
import { AuroraBackground, ParticlesBackground, GridBackground, WaveBackground } from '../components/AnimatedBackground'
import { TypewriterText, FadeInText, GradientText, SplitText } from '../components/AnimatedText'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

function Landing() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    // Check if user is logged in
    if (!currentUser) {
      setShowLogin(true)
      return
    }

    setLoading(true)
    try {
      const response = await axios.get('/api/search', {
        params: { query: query.trim(), limit: 20 },
        timeout: 120000
      })
      
      // Store results in sessionStorage
      sessionStorage.setItem('searchResults', JSON.stringify(response.data))
      sessionStorage.setItem('userQuery', query.trim())
      
      navigate('/results')
    } catch (error) {
      console.error('Search failed:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Search failed. Please check your connection and try again.'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Backgrounds */}
      <AuroraBackground />
      <GridBackground />
      <ParticlesBackground count={80} />
      <WaveBackground />

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <img src="/assets/stratix-logo.png" alt="Stratix AI" className="h-10 w-auto" />
          </div>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all font-medium flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Dashboard
              </button>
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{currentUser.displayName || currentUser.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/70 transform hover:scale-105"
            >
              Login
            </button>
          )}
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <SplitText 
              text="Find ML Training Data in Seconds" 
              className="text-white"
            />
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            <FadeInText 
              text="Describe your ML project, get training-ready data instantly." 
              delay={500}
            />
            <br />
            <FadeInText 
              text="AI-powered dataset discovery, Strategy Hub for market research, and dev-ready training code." 
              delay={1000}
            />
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-16">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I need sentiment analysis data with 50k samples, positive/negative labels"
                className="w-full px-6 py-4 pr-14 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {loading && (
              <p className="mt-4 text-gray-400">Searching datasets...</p>
            )}
          </form>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-8 mt-20">
            <FadeInText delay={1200}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-primary-500/50 transition-all hover:transform hover:scale-105">
                <Database className="w-10 h-10 text-primary-400 mb-4 mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="500,000+ Datasets" />
                </h3>
                <p className="text-gray-400">Indexed from Kaggle, HuggingFace, and more</p>
              </div>
            </FadeInText>
            <FadeInText delay={1400}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
                <Sparkles className="w-10 h-10 text-purple-400 mb-4 mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="AI-Powered Matching" />
                </h3>
                <p className="text-gray-400">Intelligent dataset discovery using Gemini AI</p>
              </div>
            </FadeInText>
            <FadeInText delay={1600}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all hover:transform hover:scale-105">
                <Zap className="w-10 h-10 text-yellow-400 mb-4 mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="Training-Ready in 60s" />
                </h3>
                <p className="text-gray-400">Automatic cleaning, formatting, and splitting</p>
              </div>
            </FadeInText>
            <FadeInText delay={1800}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all hover:transform hover:scale-105">
                <Sparkles className="w-10 h-10 text-emerald-400 mb-4 mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="Strategy Hub Insights" />
                </h3>
                <p className="text-gray-400">
                  Market research for India: consumer gaps, revenue models, and SWOT in seconds.
                </p>
              </div>
            </FadeInText>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <Footer />
    </div>
  )
}

export default Landing
