import Link from "next/link";

const services = [
  {
    icon: "insights",
    title: "Growth Analytics",
    description: "Real-time dashboards and predictive analytics that turn your data into actionable growth strategies.",
    href: "/services/analytics",
  },
  {
    icon: "campaign",
    title: "Performance Marketing",
    description: "Multi-channel campaigns engineered for maximum ROI with continuous A/B optimization.",
    href: "/services/performance-marketing",
  },
  {
    icon: "hub",
    title: "Marketing Automation",
    description: "Intelligent workflows that nurture leads and accelerate your sales pipeline automatically.",
    href: "/services/automation",
  },
  {
    icon: "brand_awareness",
    title: "Brand Strategy",
    description: "Position your B2B brand as an industry leader with strategic messaging and visual identity.",
    href: "/services/brand-strategy",
  },
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
            What We Do
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-white mb-4">
            Engineering Growth at Scale
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our services are designed to work together as a unified growth system, 
            not isolated tactics.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group p-8 rounded-xl border border-outline-variant/10 bg-surface-container hover:border-primary-container/30 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary-container">
                    {service.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-headline text-white mb-2 group-hover:text-primary-container transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <span className="material-symbols-outlined text-gray-600 group-hover:text-primary-container group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary-container font-label font-bold hover:underline"
          >
            Explore All Services
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
