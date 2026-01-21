import Footer from '../components/Footer'
import { GradientText } from '../components/AnimatedText'

function Support() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-primary-300 text-sm uppercase tracking-wide mb-2">Support</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText text="Need help? We’re here." />
          </h1>
          <p className="text-gray-300">
            Reach us for onboarding, integrations, or troubleshooting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Email</h3>
            <p className="text-gray-300 text-sm mb-4">support@stratix.ai</p>
            <p className="text-gray-400 text-sm">Typical response: <span className="text-white">24h</span></p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Status</h3>
            <p className="text-gray-300 text-sm mb-4">status.stratix.ai</p>
            <p className="text-gray-400 text-sm">Uptime, incidents, and maintenance.</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Docs</h3>
            <p className="text-gray-300 text-sm mb-4">Guides, API reference, examples.</p>
            <p className="text-primary-300 text-sm">See Documentation →</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Support
