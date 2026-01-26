import { useState } from 'react'
import axios from 'axios'
import { Lightbulb, Target, IndianRupee, Shield, AlertTriangle, TrendingUp, BarChart3, Sparkles } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function StrategyHub() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post('/api/strategy/analyze', { query })
      setResult(response.data.data)
    } catch (err) {
      console.error('Strategy analysis failed:', err)
      const serverMsg = err?.response?.data?.detail
      setError(serverMsg || 'Analysis failed. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const sectionCard = (title, icon, children, accent = 'from-primary-500 to-purple-500') => (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-primary-500/60 transition-all hover:shadow-lg hover:shadow-primary-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${accent} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )

  const listPills = (items = []) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 text-sm text-gray-200"
        >
          {item}
        </span>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      <AuroraBackground />
      <ParticlesBackground count={40} />

      <div className="relative z-10 container mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-10 text-center">
          <FadeInText delay={0}>
            <p className="uppercase tracking-[0.3em] text-primary-300 text-xs mb-3">
              Strategy Hub
            </p>
          </FadeInText>
          <FadeInText delay={100}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <GradientText text="Market Research for Indian Founders" />
            </h1>
          </FadeInText>
          <FadeInText delay={200}>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Type any business idea or market question and get instant insights on consumer gaps,
              monetization models, and SWOT—tailored for India.
            </p>
          </FadeInText>
        </header>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-10">
          <form
            onSubmit={handleAnalyze}
            className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-xl shadow-black/40"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business Idea or Market Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Example: 'Subscription app for tier-2 city students to prepare for government exams using AI tutors.'"
              disabled={loading}
            />

            <div className="mt-4 flex items-center justify-between gap-4 flex-col sm:flex-row">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary-400" />
                Powered by Gemini – optimized for Indian market context
              </p>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/40"
              >
                <Lightbulb className="w-4 h-4" />
                {loading ? 'Analyzing...' : 'Analyze Strategy'}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Consumer Gap */}
            <FadeInText delay={0}>
              {sectionCard(
                'Consumer Gap in India',
                <Target className="w-5 h-5 text-white" />,
                <>
                  <p className="text-gray-200 mb-4 text-sm">
                    {result.consumer_gap?.summary}
                  </p>
                  <div className="space-y-3 text-sm">
                    {result.consumer_gap?.key_pain_points?.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1 text-xs uppercase tracking-[0.2em]">
                          Key Pain Points
                        </p>
                        {listPills(result.consumer_gap.key_pain_points)}
                      </div>
                    )}
                    {result.consumer_gap?.current_alternatives?.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1 text-xs uppercase tracking-[0.2em]">
                          Current Alternatives
                        </p>
                        {listPills(result.consumer_gap.current_alternatives)}
                      </div>
                    )}
                    {result.consumer_gap?.target_segments?.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1 text-xs uppercase tracking-[0.2em]">
                          Target Segments
                        </p>
                        {listPills(result.consumer_gap.target_segments)}
                      </div>
                    )}
                  </div>
                </>,
                'from-primary-500 to-emerald-500'
              )}
            </FadeInText>

            {/* Revenue Model */}
            <FadeInText delay={150}>
              {sectionCard(
                'Revenue Model (India)',
                <IndianRupee className="w-5 h-5 text-white" />,
                <>
                  <p className="text-gray-200 mb-4 text-sm">
                    {result.revenue_model?.summary}
                  </p>
                  <div className="space-y-3 text-sm">
                    {result.revenue_model?.primary_streams?.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1 text-xs uppercase tracking-[0.2em]">
                          Primary Streams
                        </p>
                        {listPills(result.revenue_model.primary_streams)}
                      </div>
                    )}
                    {result.revenue_model?.secondary_streams?.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1 text-xs uppercase tracking-[0.2em]">
                          Secondary Streams
                        </p>
                        {listPills(result.revenue_model.secondary_streams)}
                      </div>
                    )}
                    {result.revenue_model?.pricing_suggestions?.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1 text-xs uppercase tracking-[0.2em]">
                          Pricing Suggestions
                        </p>
                        {listPills(result.revenue_model.pricing_suggestions)}
                      </div>
                    )}
                  </div>
                </>,
                'from-purple-500 to-pink-500'
              )}
            </FadeInText>

            {/* SWOT */}
            <FadeInText delay={300}>
              {sectionCard(
                'SWOT Snapshot',
                <Shield className="w-5 h-5 text-white" />,
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-emerald-600/40">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="font-semibold text-emerald-300">Strengths</span>
                    </div>
                    <ul className="space-y-1 text-gray-200">
                      {result.swot_analysis?.strengths?.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-amber-500/40">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3 text-amber-300" />
                      <span className="font-semibold text-amber-200">Weaknesses</span>
                    </div>
                    <ul className="space-y-1 text-gray-200">
                      {result.swot_analysis?.weaknesses?.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-sky-500/40">
                    <div className="flex items-center gap-1 mb-1">
                      <BarChart3 className="w-3 h-3 text-sky-300" />
                      <span className="font-semibold text-sky-200">Opportunities</span>
                    </div>
                    <ul className="space-y-1 text-gray-200">
                      {result.swot_analysis?.opportunities?.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-red-500/40">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-300" />
                      <span className="font-semibold text-red-200">Threats</span>
                    </div>
                    <ul className="space-y-1 text-gray-200">
                      {result.swot_analysis?.threats?.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>,
                'from-sky-500 to-indigo-500'
              )}
            </FadeInText>
          </div>
        )}

        {/* Empty state hint */}
        {!result && !loading && (
          <FadeInText delay={150}>
            <div className="max-w-xl mx-auto text-center text-sm text-gray-400 bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-5">
              <p>Tip: Be specific about your target user, problem, and India focus to get sharper insights.</p>
            </div>
          </FadeInText>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default StrategyHub

