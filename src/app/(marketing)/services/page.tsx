import Link from "next/link";

const services = [
  {
    icon: "insights",
    title: "Growth Analytics",
    description: "Real-time dashboards, predictive analytics, and custom reporting that turn your data into actionable growth strategies.",
    features: ["Custom KPI Dashboards", "Predictive Lead Scoring", "Attribution Modeling", "Revenue Forecasting"],
    href: "/services/analytics",
  },
  {
    icon: "campaign",
    title: "Performance Marketing",
    description: "Multi-channel campaigns engineered for maximum ROI with continuous A/B optimization and budget allocation.",
    features: ["Paid Search & Social", "Programmatic Display", "Retargeting Campaigns", "Creative Optimization"],
    href: "/services/performance-marketing",
  },
  {
    icon: "hub",
    title: "Marketing Automation",
    description: "Intelligent workflows that nurture leads, accelerate your sales pipeline, and scale your operations.",
    features: ["Lead Nurturing Sequences", "Behavioral Triggers", "CRM Integration", "Sales Enablement"],
    href: "/services/automation",
  },
  {
    icon: "brand_awareness",
    title: "Brand Strategy",
    description: "Position your B2B brand as an industry leader with strategic messaging, visual identity, and thought leadership.",
    features: ["Brand Positioning", "Messaging Framework", "Visual Identity", "Content Strategy"],
    href: "/services/brand-strategy",
  },
  {
    icon: "language",
    title: "Web Development",
    description: "High-performance websites and landing pages optimized for conversions, speed, and search visibility.",
    features: ["Conversion-Focused Design", "Performance Optimization", "SEO Architecture", "CMS Implementation"],
    href: "/services/web-development",
  },
  {
    icon: "search",
    title: "SEO & Content",
    description: "Organic growth strategies that build authority, drive qualified traffic, and establish thought leadership.",
    features: ["Technical SEO Audits", "Content Strategy", "Link Building", "Keyword Research"],
    href: "/services/seo",
  },
];

export default function ServicesPage() {
  return (
    <div className="animate-page">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 kinetic-grid opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="max-w-3xl">
            <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
              Our Services
            </p>
            <h1 className="text-5xl md:text-6xl font-bold font-headline text-white mb-6">
              Full-Stack{" "}
              <span className="text-primary-container">Growth Services</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Everything you need to scale your B2B business, delivered by specialists who understand your market.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group p-8 rounded-xl border border-outline-variant/10 bg-surface-container hover:border-primary-container/30 transition-all duration-300 flex flex-col"
              >
                <div className="w-14 h-14 rounded-lg bg-primary-container/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl text-primary-container">
                    {service.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-headline text-white mb-3 group-hover:text-primary-container transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="material-symbols-outlined text-primary-container text-base">check</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
            Not Sure Where to Start?
          </h2>
          <p className="text-gray-400 mb-8">
            Book a free consultation and we'll help you identify the highest-impact opportunities for your business.
          </p>
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95"
          >
            Get Free Consultation
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
