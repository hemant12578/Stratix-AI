import Footer from '../components/Footer'

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-300 mb-4">
          Preview terms for development. Replace with reviewed legal terms before production.
        </p>
        <div className="space-y-4 text-gray-300">
          <p>• Use the platform responsibly and comply with applicable laws.</p>
          <p>• Do not upload prohibited, malicious, or abusive content.</p>
          <p>• Service is provided “as is”; availability and performance are not guaranteed in preview.</p>
          <p>• You are responsible for API keys and account activity.</p>
        </div>
        <p className="text-gray-400 text-sm mt-6">Last updated: Jan 2026</p>
      </div>
      <Footer />
    </div>
  )
}

export default TermsOfService
