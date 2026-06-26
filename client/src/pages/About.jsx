import { Database, Users, Target, Zap } from 'lucide-react'
import { AuroraBackground, ParticlesBackground } from '../components/AnimatedBackground'
import { FadeInText, GradientText } from '../components/AnimatedText'
import Footer from '../components/Footer'

function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      <AuroraBackground />
      <ParticlesBackground count={40} />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <FadeInText delay={0}>
            <h1 className="text-5xl font-bold mb-6 text-center">
              <GradientText text="About Stratix AI" />
            </h1>
          </FadeInText>

          <FadeInText delay={200}>
            <p className="text-xl text-gray-300 mb-12 text-center">
              Revolutionizing how ML engineers find and prepare training data
            </p>
          </FadeInText>

          <div className="space-y-12">
            <FadeInText delay={400}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-300 leading-relaxed">
                  Stratix AI was born from a simple observation: ML developers spend 60-80% of their time 
                  finding, cleaning, and formatting training data. We're here to change that. Our AI-powered 
                  platform automatically discovers, merges, cleans, and formats datasets into ML-ready training 
                  data in seconds, not weeks.
                </p>
              </div>
            </FadeInText>

            <FadeInText delay={600}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold mb-6">What We Do</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <Database className="w-8 h-8 text-primary-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Dataset Discovery</h3>
                      <p className="text-gray-400 text-sm">
                        Search across 500,000+ datasets from Kaggle, HuggingFace, UCI, and more using natural language.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Zap className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">AI-Powered Processing</h3>
                      <p className="text-gray-400 text-sm">
                        Automatically clean, merge, and format datasets using advanced AI algorithms.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Target className="w-8 h-8 text-purple-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Strategy & Market Research</h3>
                      <p className="text-gray-400 text-sm">
                        Use Strategy Hub to analyze business ideas for the Indian market with consumer gaps,
                        revenue models, and SWOT in seconds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="w-8 h-8 text-green-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Training-Ready Output</h3>
                      <p className="text-gray-400 text-sm">
                        Get pre-split train/test/validation sets with rich metadata and dev-ready Auto-ML
                        training code using pandas and scikit-learn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInText>

            <FadeInText delay={800}>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold mb-4">Technology</h2>
                <p className="text-gray-300 mb-4">
                  Built with cutting-edge AI and modern web technologies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Google Gemini AI for intelligent dataset matching and analysis</li>
                  <li>FastAPI backend for high-performance API services</li>
                  <li>React with modern animations and responsive design</li>
                  <li>Firebase for authentication and user management</li>
                  <li>Pandas and Scikit-learn for data processing</li>
                </ul>
              </div>
            </FadeInText>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default About
