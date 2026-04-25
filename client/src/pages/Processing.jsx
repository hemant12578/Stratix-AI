import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../config/api'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function Processing() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await axios.get(`/api/process/status/${jobId}`)
        setStatus(response.data)

        if (response.data.status === 'completed') {
          try {
            const stats = response.data.stats || {}
            const metadata = response.data.metadata || {}
            const entry = {
              jobId,
              status: 'completed',
              samples: stats.train_samples || 0,
              qualityScore: metadata.data_quality?.overall_quality || null,
              completedAt: new Date().toISOString()
            }
            const stored = JSON.parse(localStorage.getItem('localHistory') || '[]')
            const filtered = stored.filter(item => item.jobId !== jobId)
            localStorage.setItem('localHistory', JSON.stringify([entry, ...filtered]))
          } catch (e) {
            console.error('Failed to store history:', e)
          }
          setTimeout(() => {
            navigate(`/download/${jobId}`)
          }, 2000)
        } else if (response.data.status === 'failed') {
          // Handle error
        }
      } catch (error) {
        console.error('Failed to fetch status:', error)
      }
    }

    pollStatus()
    const interval = setInterval(pollStatus, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [jobId, navigate])

  const steps = [
    { id: 1, name: 'Analyzing requirements with Gemini...', key: 'analyzing' },
    { id: 2, name: 'Searching datasets...', key: 'searching' },
    { id: 3, name: 'Downloading raw datasets...', key: 'downloading' },
    { id: 4, name: 'Cleaning and formatting...', key: 'cleaning' },
    { id: 5, name: 'Generating train/test splits...', key: 'splitting' },
    { id: 6, name: 'Creating metadata...', key: 'metadata' },
    { id: 7, name: 'Generating training code...', key: 'code' },
    { id: 8, name: 'Finalizing files...', key: 'finalizing' }
  ]

  const getCurrentStep = () => {
    if (!status) return 0
    const progress = status.progress || 0
    return Math.floor((progress / 100) * steps.length)
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <AuroraBackground />
      <ParticlesBackground count={60} />
      
      <div className="relative z-10 max-w-2xl w-full mx-auto px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <FadeInText delay={0}>
            <h2 className="text-3xl font-bold mb-2">
              <GradientText text="Processing your data..." />
            </h2>
          </FadeInText>
          <p className="text-gray-400 mb-8">{status?.message || 'Initializing...'}</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{status?.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${status?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isPending = index > currentStep

              return (
                <FadeInText key={step.id} delay={index * 150}>
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-primary-900/30 border border-primary-500 shadow-lg shadow-primary-500/20 animate-pulse-slow'
                        : isCompleted
                        ? 'bg-green-900/20 border border-green-500/50'
                        : 'bg-gray-700/30 border border-gray-700'
                    }`}
                  >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                    )}
                  </div>
                  <p
                    className={`flex-1 ${
                      isCompleted
                        ? 'text-green-400'
                        : isCurrent
                        ? 'text-primary-400 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                </FadeInText>
              )
            })}
          </div>

          {status?.status === 'failed' && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-semibold text-red-400">Processing Failed</p>
                <p className="text-sm text-red-300">{status.error || 'Unknown error'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Processing
