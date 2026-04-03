const steps = [
  {
    number: "01",
    title: "Diagnose",
    description: "We audit your current marketing stack, identify bottlenecks, and map your customer journey to find growth opportunities.",
    icon: "search_insights",
  },
  {
    number: "02",
    title: "Architect",
    description: "Design a custom growth system tailored to your market, audience, and business objectives with clear KPIs.",
    icon: "architecture",
  },
  {
    number: "03",
    title: "Build",
    description: "Implement the technical infrastructure, automation workflows, and campaign assets needed for scale.",
    icon: "construction",
  },
  {
    number: "04",
    title: "Optimize",
    description: "Continuous testing, analysis, and iteration to maximize performance and compound your growth over time.",
    icon: "tune",
  },
];

export function FrameworkSection() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
            Our Process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-white mb-4">
            The Kinetic Architect Framework
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A proven methodology for building predictable, scalable B2B growth engines.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-primary-container/30 to-transparent" />
              )}
              
              <div className="relative glass-card p-6 rounded-xl border border-outline-variant/10 hover:border-primary-container/30 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold font-headline text-primary-container/20">
                    {step.number}
                  </span>
                  <span className="material-symbols-outlined text-2xl text-primary-container">
                    {step.icon}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold font-headline text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
