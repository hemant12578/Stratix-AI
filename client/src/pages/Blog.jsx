import Footer from '../components/Footer'
import { GradientText } from '../components/AnimatedText'

const posts = [
  { title: 'How to choose the right ML dataset', date: 'Jan 2026', summary: 'A practical checklist to align data quality, licensing, and domain fit.' },
  { title: 'Cleaning pipelines that actually ship', date: 'Dec 2025', summary: 'Patterns for reproducible preprocessing with validation and monitoring.' },
  { title: 'Evaluating synthetic augmentation', date: 'Nov 2025', summary: 'When to generate, when to collect, and how to measure uplift safely.' },
]

function Blog() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <p className="text-primary-300 text-sm uppercase tracking-wide mb-2">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText text="Stratix AI Blog" />
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Insights on data sourcing, cleaning strategies, and production ML.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.title} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-lg">
              <p className="text-sm text-primary-300 mb-2">{post.date}</p>
              <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
              <p className="text-gray-300 text-sm">{post.summary}</p>
              <button className="mt-6 text-primary-300 hover:text-primary-200 text-sm font-semibold">
                Read more →
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Blog
