import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/api'
import { Search, Filter, ArrowLeft, Database, Sparkles, TrendingUp } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

function DatasetSearch() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    domain: '',
    taskType: '',
    minSamples: '',
    maxSamples: '',
    license: '',
    source: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    if (!currentUser) {
      alert('Please login to search datasets')
      navigate('/')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get('/api/search', {
        params: {
          query: query.trim(),
          limit: 50
        },
        timeout: 120000
      })
      
      
      sessionStorage.setItem('searchResults', JSON.stringify(response.data))
      sessionStorage.setItem('userQuery', query.trim())
      
      navigate('/results')
    } catch (error) {
      console.error('Search failed:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Search failed. Please try again.'
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      <AuroraBackground />
      <ParticlesBackground count={60} />

      <div className="relative z-10 container mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 sm:mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <img src="/assets/transparent.png" alt="Stratix AI" className="h-8 w-auto" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Stratix AI
            </h1>
          </div>
        </header>

       
        <div className="max-w-4xl mx-auto text-center mb-12">
          <FadeInText delay={0}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-primary-200 to-purple-200 bg-clip-text text-transparent">
                Search ML Datasets
              </span>
            </h2>
          </FadeInText>
          <FadeInText delay={200}>
            <p className="text-xl text-gray-300 mb-8">
              Find the perfect training data for your machine learning project
            </p>
          </FadeInText>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., sentiment analysis dataset with 50k samples, positive/negative labels"
                className="w-full px-4 sm:px-6 py-4 sm:py-5 pr-24 sm:pr-32 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-lg"
                disabled={loading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-lg transition-all ${
                    showFilters 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="p-3 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            {loading && (
              <p className="mt-4 text-gray-400">Searching datasets...</p>
            )}
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <FadeInText delay={0}>
              <div className="max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-400" />
                  Advanced Filters
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
                    <select
                      value={filters.domain}
                      onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Domains</option>
                      <option value="nlp">NLP</option>
                      <option value="vision">Computer Vision</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Task Type</label>
                    <select
                      value={filters.taskType}
                      onChange={(e) => setFilters({ ...filters, taskType: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Types</option>
                      <option value="classification">Classification</option>
                      <option value="regression">Regression</option>
                      <option value="clustering">Clustering</option>
                      <option value="generation">Generation</option>
                      <option value="detection">Detection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                    <select
                      value={filters.source}
                      onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Sources</option>
                      <option value="kaggle">Kaggle</option>
                      <option value="huggingface">HuggingFace</option>
                      <option value="uci">UCI ML</option>
                      <option value="data_gov">Data.gov</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Samples</label>
                    <input
                      type="number"
                      value={filters.minSamples}
                      onChange={(e) => setFilters({ ...filters, minSamples: e.target.value })}
                      placeholder="e.g., 1000"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Samples</label>
                    <input
                      type="number"
                      value={filters.maxSamples}
                      onChange={(e) => setFilters({ ...filters, maxSamples: e.target.value })}
                      placeholder="e.g., 100000"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">License</label>
                    <select
                      value={filters.license}
                      onChange={(e) => setFilters({ ...filters, license: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Licenses</option>
                      <option value="CC0">CC0 (Public Domain)</option>
                      <option value="MIT">MIT</option>
                      <option value="Apache">Apache</option>
                      <option value="CC-BY">CC-BY</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setFilters({
                    domain: '',
                    taskType: '',
                    minSamples: '',
                    maxSamples: '',
                    license: '',
                    source: ''
                  })}
                  className="mt-4 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </FadeInText>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <FadeInText delay={400}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-primary-500/50 transition-all">
                <Database className="w-10 h-10 text-primary-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="AI-Powered Search" />
                </h3>
                <p className="text-gray-400">Intelligent dataset discovery using advanced AI</p>
              </div>
            </FadeInText>
            <FadeInText delay={500}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all">
                <Sparkles className="w-10 h-10 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="Advanced Filters" />
                </h3>
                <p className="text-gray-400">Filter by domain, task type, size, and more</p>
              </div>
            </FadeInText>
            <FadeInText delay={600}>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all">
                <TrendingUp className="w-10 h-10 text-yellow-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">
                  <GradientText text="Quality Scores" />
                </h3>
                <p className="text-gray-400">See dataset quality ratings before selecting</p>
              </div>
            </FadeInText>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default DatasetSearch
