import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Check, AlertCircle, Download, Eye } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function Results() {
  const [results, setResults] = useState(null)
  const [selectedDatasets, setSelectedDatasets] = useState([])
  const [processing, setProcessing] = useState(false)
  const [outputFormat, setOutputFormat] = useState(() => sessionStorage.getItem('outputFormat') || 'csv')
  const navigate = useNavigate()

  useEffect(() => {
    const stored = sessionStorage.getItem('searchResults')
    if (stored) {
      setResults(JSON.parse(stored))
    } else {
      navigate('/')
    }
  }, [navigate])

  const toggleDataset = (datasetId) => {
    setSelectedDatasets(prev =>
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    )
  }

  const handleProcess = async () => {
    if (selectedDatasets.length === 0) {
      alert('Please select at least one dataset')
      return
    }

    setProcessing(true)
    try {
      sessionStorage.setItem('outputFormat', outputFormat)
      const response = await axios.post('/api/process', {
        dataset_ids: selectedDatasets,
        requirements: {
          ...(results?.requirements || {}),
          output_format: outputFormat
        }
      })

      navigate(`/processing/${response.data.job_id}`)
    } catch (error) {
      console.error('Processing failed:', error)
      alert('Failed to start processing. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!results) return null

  const matches = results.matches || []

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <AuroraBackground />
      <ParticlesBackground count={40} />
      
      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              New Search
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img src="/assets/transparent.png" alt="Stratix AI" className="h-8 w-auto" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Stratix AI
            </h1>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm text-gray-400">Download format</label>
          <div className="inline-flex rounded-lg bg-gray-800/60 border border-gray-700 p-1">
            {['csv', 'json', 'both'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setOutputFormat(fmt)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  outputFormat === fmt
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">Both = CSV + JSON in ZIP</span>
        </div>

        {/* Query Display */}
        <div className="mb-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <FadeInText delay={100}>
            <p className="text-gray-400 mb-2">Search Query:</p>
            <p className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              {sessionStorage.getItem('userQuery')}
            </p>
            <p className="text-gray-400 mt-4">
              Found {matches.length} matching dataset{matches.length !== 1 ? 's' : ''}
            </p>
          </FadeInText>
        </div>

        {/* Results List */}
        <div className="space-y-4 mb-8">
          {matches.map((match, index) => (
            <div
              key={match.dataset_id || match.id}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 transition-all hover:scale-[1.02] ${
                selectedDatasets.includes(match.dataset_id || match.id)
                  ? 'border-primary-500 bg-primary-900/20 shadow-lg shadow-primary-500/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{match.name || match.dataset_name}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-600/20 text-primary-300">
                      Score: {match.match_score || match.quality_score || 'N/A'}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{match.description || 'No description available'}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <span>{match.sample_count?.toLocaleString() || 'N/A'} samples</span>
                    <span>•</span>
                    <span className="capitalize">{match.source || 'unknown'}</span>
                    <span>•</span>
                    <span>{match.license || 'Unknown license'}</span>
                  </div>

                  {/* Match Reasons */}
                  {match.match_reasons && match.match_reasons.length > 0 && (
                    <div className="mb-3">
                      {match.match_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-green-400 text-sm mb-1">
                          <Check className="w-4 h-4" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Concerns */}
                  {match.concerns && match.concerns.length > 0 && (
                    <div>
                      {match.concerns.map((concern, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                          <AlertCircle className="w-4 h-4" />
                          {concern}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
                  <button
                    onClick={() => toggleDataset(match.dataset_id || match.id)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedDatasets.includes(match.dataset_id || match.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {selectedDatasets.includes(match.dataset_id || match.id) ? 'Selected' : 'Select'}
                  </button>
                  <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Process Button */}
        {selectedDatasets.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 animate-bounce-subtle">
            <FadeInText delay={500}>
              <button
                onClick={handleProcess}
                disabled={processing}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-base sm:text-lg shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/70 transform sm:hover:scale-105 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {processing ? 'Processing...' : `Process ${selectedDatasets.length} Dataset${selectedDatasets.length !== 1 ? 's' : ''}`}
              </button>
            </FadeInText>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Results
