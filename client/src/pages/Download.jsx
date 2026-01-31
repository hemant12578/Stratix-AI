import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Download as DownloadIcon, ArrowLeft, FileText, Code, Database, CheckCircle } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function Download() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('files')
  const [trainingCode, setTrainingCode] = useState('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`/api/process/status/${jobId}`)
        setStatus(response.data)
      } catch (error) {
        console.error('Failed to fetch status:', error)
      }
    }

    fetchStatus()
  }, [jobId])

  const handleDownload = async (fileType = 'zip') => {
    setDownloading(true)
    try {
      const outputFormat = status?.output_format || status?.outputFormat || ''
      const isJsonPreferred = outputFormat === 'json'
      const preferParam = (fileType === 'train' || fileType === 'test')
        ? `&format=${isJsonPreferred ? 'json' : 'csv'}`
        : ''

      const response = await axios.get(`/api/download/${jobId}?file_type=${fileType}${preferParam}`, {
        responseType: 'blob',
        headers: fileType === 'zip' ? {} : { Accept: 'application/json' }
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const contentDisposition = response.headers['content-disposition']
        let filename = `stratix_${jobId}.${fileType === 'zip' ? 'zip' : fileType}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) filename = filenameMatch[1]
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const fetchTrainingCode = async () => {
    if (trainingCode || loadingCode) return
    setLoadingCode(true)
    try {
      const response = await axios.get(`/api/download/${jobId}?file_type=code`, {
        responseType: 'text',
      })
      // Axios with responseType 'text' may still wrap data; ensure string
      const codeText = typeof response.data === 'string'
        ? response.data
        : new TextDecoder().decode(response.data)
      setTrainingCode(codeText)
    } catch (error) {
      console.error('Failed to load training code:', error)
    } finally {
      setLoadingCode(false)
    }
  }

  const handleCopyCode = async () => {
    if (!trainingCode) return
    try {
      await navigator.clipboard.writeText(trainingCode)
      setCopyLabel('Copied!')
      setTimeout(() => setCopyLabel('Copy'), 1500)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  if (!status || status.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Processing not complete yet...</p>
          <button
            onClick={() => navigate(`/processing/${jobId}`)}
            className="px-4 py-2 bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            View Status
          </button>
        </div>
      </div>
    )
  }

  const stats = status.stats || {}
  const metadata = status.metadata || {}
  const outputFormat = status.output_format || status.outputFormat || 'csv'
  const trainName = outputFormat === 'json' ? 'train.json' : 'train.csv'
  const testName = outputFormat === 'json' ? 'test.json' : 'test.csv'
  const bothLabel = outputFormat === 'both' ? ' (CSV + JSON)' : ''

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <AuroraBackground />
      <ParticlesBackground count={50} />
      
      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          <div className="flex items-center gap-3">
            <img src="/assets/transparent.png" alt="Stratix AI" className="h-8 w-auto" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Stratix AI
            </h1>
          </div>
        </div>

        {/* Success Message */}
        <FadeInText delay={0}>
          <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6 mb-8 shadow-lg shadow-green-500/20 animate-pulse-slow">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-400 animate-bounce" />
              <h2 className="text-2xl font-bold">
                <GradientText text="Your data is ready!" />
              </h2>
            </div>
            <p className="text-gray-300">
              Quality Score: <span className="font-semibold text-green-400">
                {metadata.data_quality?.overall_quality || 'N/A'}/100
              </span>
            </p>
          </div>
        </FadeInText>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <FadeInText delay={200}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-primary-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-primary-400 animate-pulse" />
                <h3 className="text-lg font-semibold">Training Samples</h3>
              </div>
              <p className="text-3xl font-bold text-primary-400">{stats.train_samples?.toLocaleString() || 'N/A'}</p>
            </div>
          </FadeInText>
          <FadeInText delay={400}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-purple-400 animate-pulse" />
                <h3 className="text-lg font-semibold">Test Samples</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">{stats.test_samples?.toLocaleString() || 'N/A'}</p>
            </div>
          </FadeInText>
          <FadeInText delay={600}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-yellow-400 animate-pulse" />
                <h3 className="text-lg font-semibold">Features</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{stats.total_features || 'N/A'}</p>
            </div>
          </FadeInText>
        </div>

        {/* Tabs: Files / Training Code */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 mb-8">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
              className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'files'
                  ? 'border-b-2 border-primary-500 text-primary-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('files')}
            >
              <FileText className="w-4 h-4" />
              Data Files
            </button>
            <button
              className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'border-b-2 border-primary-500 text-primary-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => {
                setActiveTab('code')
                fetchTrainingCode()
              }}
            >
              <Code className="w-4 h-4" />
              Training Code
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'files' && (
              <>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary-400" />
                  Files Ready
                </h3>
                <div className="space-y-3">
                  {status.files && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary-400" />
                          <span>{outputFormat === 'both' ? 'train.csv / train.json' : trainName}{bothLabel}</span>
                        </div>
                        <span className="text-gray-400">{stats.train_samples?.toLocaleString()} samples</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <span>{outputFormat === 'both' ? 'test.csv / test.json' : testName}{bothLabel}</span>
                        </div>
                        <span className="text-gray-400">{stats.test_samples?.toLocaleString()} samples</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-yellow-400" />
                          <span>metadata.json</span>
                        </div>
                        <span className="text-gray-400">Dataset information</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Code className="w-5 h-5 text-green-400" />
                          <span>training_code.py</span>
                        </div>
                        <span className="text-gray-400">Ready-to-use code</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {activeTab === 'code' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold">Dev-Ready Training Script</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => handleDownload('code')}
                      className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm flex items-center justify-center gap-1"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download .py
                    </button>
                    <button
                      onClick={handleCopyCode}
                      disabled={!trainingCode}
                      className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {copyLabel}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Auto-generated using pandas and scikit-learn based on your processed dataset.
                </div>
                <div className="relative bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 text-xs text-gray-400 bg-gray-900/80">
                    <span>training_code.py</span>
                    {loadingCode && <span className="animate-pulse">Loading...</span>}
                  </div>
                  <pre className="max-h-96 overflow-auto text-sm p-4 text-gray-100">
                    <code>
                      {trainingCode || (!loadingCode && '# Click "Training Code" to load the generated script.')}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => handleDownload('zip')}
            disabled={downloading}
            className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg shadow-primary-500/50 flex items-center justify-center gap-2"
          >
            <DownloadIcon className="w-5 h-5" />
            {downloading ? 'Downloading...' : 'Download All as ZIP'}
          </button>
          <button
            onClick={() => handleDownload('train')}
            className="px-6 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Train
          </button>
          <button
            onClick={() => handleDownload('test')}
            className="px-6 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Test
          </button>
        </div>

        {/* Metadata Preview */}
        {metadata.dataset_info && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Dataset Information</h3>
            <div className="space-y-2 text-gray-300">
              <p><span className="font-semibold">Title:</span> {metadata.dataset_info.title}</p>
              <p><span className="font-semibold">Description:</span> {metadata.dataset_info.description}</p>
              <p><span className="font-semibold">Domain:</span> {metadata.dataset_info.domain}</p>
              <p><span className="font-semibold">Use Cases:</span> {metadata.dataset_info.use_cases?.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Download
