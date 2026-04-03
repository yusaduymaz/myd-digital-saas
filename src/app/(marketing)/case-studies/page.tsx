import Link from "next/link";

const caseStudies = [
  {
    client: "TechScale SaaS",
    industry: "B2B SaaS",
    title: "312% increase in qualified leads in 6 months",
    description: "How we transformed a struggling demand gen program into a predictable growth engine using the Kinetic Architect Framework.",
    metrics: [
      { label: "Lead Increase", value: "312%" },
      { label: "CAC Reduction", value: "45%" },
      { label: "Pipeline Value", value: "$2.4M" },
    ],
    image: "/case-studies/techscale.jpg",
    slug: "techscale-saas",
  },
  {
    client: "Enterprise Cloud Co",
    industry: "Cloud Infrastructure",
    title: "From 0 to 50 enterprise demos per month",
    description: "Building an ABM program from scratch that consistently delivers high-value enterprise opportunities.",
    metrics: [
      { label: "Monthly Demos", value: "50+" },
      { label: "Deal Size Increase", value: "67%" },
      { label: "Sales Cycle", value: "-30 days" },
    ],
    image: "/case-studies/enterprise-cloud.jpg",
    slug: "enterprise-cloud",
  },
  {
    client: "FinTech Solutions",
    industry: "Financial Services",
    title: "Scaled content program to 100K monthly visitors",
    description: "SEO and content strategy that positioned a fintech startup as an industry thought leader.",
    metrics: [
      { label: "Organic Traffic", value: "100K/mo" },
      { label: "Domain Authority", value: "+35" },
      { label: "Inbound Leads", value: "400%" },
    ],
    image: "/case-studies/fintech.jpg",
    slug: "fintech-solutions",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="animate-page">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 kinetic-grid opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="max-w-3xl">
            <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
              Case Studies
            </p>
            <h1 className="text-5xl md:text-6xl font-bold font-headline text-white mb-6">
              Real Results for{" "}
              <span className="text-primary-container">Real Businesses</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              See how we've helped B2B companies achieve predictable, scalable growth through data-driven strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-8">
          <div className="space-y-16">
            {caseStudies.map((study, index) => (
              <div
                key={study.slug}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 mb-4">
                    <span className="text-primary-container text-sm font-label">{study.industry}</span>
                  </div>
                  <h2 className="text-3xl font-bold font-headline text-white mb-4">
                    {study.title}
                  </h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {study.description}
                  </p>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {study.metrics.map((metric) => (
                      <div key={metric.label}>
                        <p className="text-2xl font-bold font-headline text-primary-container">
                          {metric.value}
                        </p>
                        <p className="text-sm text-gray-500">{metric.label}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="inline-flex items-center gap-2 text-primary-container font-label font-bold hover:underline"
                  >
                    Read Full Case Study
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </Link>
                </div>

                {/* Image Placeholder */}
                <div className={`aspect-video rounded-xl bg-surface-container border border-outline-variant/10 flex items-center justify-center ${index % 2 === 1 ? "md:order-1" : ""}`}>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-2">image</span>
                    <p className="text-gray-500 text-sm">{study.client}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
            Want Results Like These?
          </h2>
          <p className="text-gray-400 mb-8">
            Let's discuss how we can engineer similar growth for your business.
          </p>
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95"
          >
            Book Your Strategy Call
            <span className="material-symbols-outlined">calendar_today</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
