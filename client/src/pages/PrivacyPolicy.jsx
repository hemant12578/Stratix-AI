import Footer from '../components/Footer'

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-300 mb-4">
          We respect your privacy. This summary is for preview only. Replace with your legal policy before launch.
        </p>
        <div className="space-y-4 text-gray-300">
          <p>• We collect account info (email, auth identifiers) to provide the service.</p>
          <p>• We store usage metadata (search queries, processing jobs) to improve quality and provide history.</p>
          <p>• We do not sell your data. We use secure storage and restrict access.</p>
          <p>• You can request deletion of your account data by contacting support.</p>
        </div>
        <p className="text-gray-400 text-sm mt-6">Last updated: Jan 2026</p>
      </div>
      <Footer />
    </div>
  )
}

export default PrivacyPolicy
