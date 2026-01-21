import Footer from '../components/Footer'
import { GradientText } from '../components/AnimatedText'

const tutorials = [
  { title: 'Getting started: search and download', length: '6 min', level: 'Beginner' },
  { title: 'Cleaning pipelines with custom instructions', length: '9 min', level: 'Intermediate' },
  { title: 'Integrating Stratix AI into CI/CD', length: '12 min', level: 'Advanced' },
]

function Tutorials() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <p className="text-primary-300 text-sm uppercase tracking-wide mb-2">Tutorials</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText text="Learn by doing" />
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Short, focused guides to get you from idea to training-ready data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tutorials.map(tut => (
            <div key={tut.title} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">{tut.title}</h3>
              <p className="text-gray-300 text-sm mb-2">Length: {tut.length}</p>
              <p className="text-gray-400 text-sm">Level: {tut.level}</p>
              <button className="mt-6 text-primary-300 hover:text-primary-200 text-sm font-semibold">
                Start tutorial →
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Tutorials
