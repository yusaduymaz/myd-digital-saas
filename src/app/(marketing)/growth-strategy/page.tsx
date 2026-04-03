import Link from "next/link";

const strategies = [
  {
    icon: "target",
    title: "Market Positioning",
    description: "Define your unique value proposition and carve out your space in the market with data-backed positioning strategies.",
  },
  {
    icon: "trending_up",
    title: "Demand Generation",
    description: "Build predictable pipeline with multi-channel demand gen campaigns that attract and convert high-intent buyers.",
  },
  {
    icon: "psychology",
    title: "Customer Intelligence",
    description: "Deep-dive into your ICP with behavioral analytics, intent signals, and predictive lead scoring.",
  },
  {
    icon: "speed",
    title: "Conversion Optimization",
    description: "Maximize every touchpoint with A/B testing, funnel analysis, and personalized buyer journeys.",
  },
];

export default function GrowthStrategyPage() {
  return (
    <div className="animate-page">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 kinetic-grid opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="max-w-3xl">
            <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
              Growth Strategy
            </p>
            <h1 className="text-5xl md:text-6xl font-bold font-headline text-white mb-6">
              Engineered for{" "}
              <span className="text-primary-container">Predictable Growth</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              We don't do guesswork. Our growth strategies are built on data, tested through experimentation, and optimized for maximum ROI.
            </p>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95"
            >
              Get Your Growth Plan
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Strategies Grid */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline text-white mb-4">
              Our Strategic Pillars
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Four interconnected strategies that work together to accelerate your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {strategies.map((strategy) => (
              <div
                key={strategy.title}
                className="group p-8 rounded-xl border border-outline-variant/10 bg-surface-container hover:border-primary-container/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl text-primary-container">
                    {strategy.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-headline text-white mb-3 group-hover:text-primary-container transition-colors">
                  {strategy.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {strategy.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
            Ready to Build Your Growth Engine?
          </h2>
          <p className="text-gray-400 mb-8">
            Let's discuss how we can engineer a custom growth strategy for your business.
          </p>
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95"
          >
            Schedule Strategy Session
            <span className="material-symbols-outlined">calendar_today</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
