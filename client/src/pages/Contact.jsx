import { useState } from 'react'
import { Mail, MessageSquare, Send } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      <AuroraBackground />
      <ParticlesBackground count={50} />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <FadeInText delay={0}>
            <h1 className="text-5xl font-bold mb-6 text-center">
              <GradientText text="Get in Touch" />
            </h1>
          </FadeInText>

          <FadeInText delay={200}>
            <p className="text-xl text-gray-300 mb-12 text-center">
              Have questions? We'd love to hear from you.
            </p>
          </FadeInText>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <FadeInText delay={400}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Mail className="w-10 h-10 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                <p className="text-gray-400 mb-4">Send us an email anytime</p>
                <a href="mailto:support@stratix.ai" className="text-primary-400 hover:text-primary-300">
                  support@stratix.ai
                </a>
              </div>
            </FadeInText>

            <FadeInText delay={500}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <MessageSquare className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Support</h3>
                <p className="text-gray-400 mb-4">Get help with your account</p>
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Visit Support Center
                </a>
              </div>
            </FadeInText>
          </div>

          <FadeInText delay={600}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              {submitted ? (
                <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400 text-center">
                  Thank you! We'll get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </FadeInText>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Contact
