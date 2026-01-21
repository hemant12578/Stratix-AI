import Footer from '../components/Footer'
import { GradientText } from '../components/AnimatedText'

function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      desc: 'For students, hobby projects, and early exploration',
      features: [
        '5 requests per month',
        'Max 10,000 samples per dataset',
        'Basic cleaning only',
        'CSV/JSON export',
        'Community support',
      ],
      badge: 'Start for free',
    },
    {
      name: 'Pro',
      price: '₹999',
      period: 'month',
      desc: 'For Indian ML teams shipping models to production',
      features: [
        '50 requests per month',
        'Unlimited samples',
        'Advanced cleaning + feature engineering',
        'All export formats',
        'API access (100 calls/day)',
        'Priority processing',
        'Email support',
      ],
      popular: true,
      badge: 'Most Popular',
    },
    {
      name: 'Enterprise',
      price: '₹9,999',
      period: 'month',
      desc: 'For enterprises and regulated workloads',
      features: [
        'Unlimited requests',
        'White-label solution',
        'Private / on-prem data sources',
        'Custom AI models',
        'Dedicated customer success',
        'SLA guarantee (99.9%)',
        'Team collaboration',
      ],
      badge: 'Talk to us',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="container mx-auto px-6 py-16 flex-1">
        <div className="text-center mb-12">
          <p className="text-primary-300 text-sm uppercase tracking-wide mb-2">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText text="Choose Your Plan" />
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            India-first pricing for students, startups, and enterprise ML teams.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-gray-800/60 border-2 rounded-2xl p-8 shadow-lg flex flex-col ${
                tier.popular
                  ? 'border-primary-500 shadow-primary-500/30'
                  : 'border-gray-700 hover:border-gray-600'
              } transition-all`}
            >
              {tier.badge && (
                <div className="mb-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      tier.popular
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{tier.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-400">/{tier.period}</span>
              </div>
              <ul className="space-y-3 text-gray-300 flex-1 text-sm">
                {tier.features.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {tier.name === 'Free'
                  ? 'Start for Free'
                  : tier.name === 'Enterprise'
                  ? 'Contact Sales'
                  : 'Upgrade to Pro'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Pricing
