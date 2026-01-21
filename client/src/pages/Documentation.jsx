import { Book, Code, Globe, FileText, Zap } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      icon: Zap,
      content: 'Learn how to use Stratix AI to find and process ML datasets'
    },
    {
      title: 'API Reference',
      icon: Globe,
      content: 'Complete API documentation for integrating Stratix AI into your applications'
    },
    {
      title: 'Code Examples',
      icon: Code,
      content: 'Sample code and tutorials for common use cases'
    },
    {
      title: 'Guides',
      icon: Book,
      content: 'Step-by-step guides for advanced features and workflows'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      <AuroraBackground />
      <ParticlesBackground count={30} />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <FadeInText delay={0}>
            <h1 className="text-5xl font-bold mb-6 text-center">
              <GradientText text="Documentation" />
            </h1>
          </FadeInText>

          <FadeInText delay={200}>
            <p className="text-xl text-gray-300 mb-12 text-center">
              Everything you need to get started with Stratix AI
            </p>
          </FadeInText>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {sections.map((section, index) => (
              <FadeInText key={section.title} delay={300 + (index * 100)}>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-primary-500/50 transition-all cursor-pointer">
                  <section.icon className="w-10 h-10 text-primary-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                  <p className="text-gray-400">{section.content}</p>
                </div>
              </FadeInText>
            ))}
          </div>

          <FadeInText delay={700}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Create an Account</h3>
                  <p className="text-gray-400 text-sm">
                    Sign up for free to get started. No credit card required.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Search for Datasets</h3>
                  <p className="text-gray-400 text-sm">
                    Use natural language to describe what you need. Our AI will find matching datasets.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Select and Process</h3>
                  <p className="text-gray-400 text-sm">
                    Choose datasets and let our AI clean, format, and prepare them for training.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Download and Train</h3>
                  <p className="text-gray-400 text-sm">
                    Download your training-ready data with pre-generated code and start training immediately.
                  </p>
                </div>
              </div>
            </div>
          </FadeInText>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Documentation
