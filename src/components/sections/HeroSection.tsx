import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 kinetic-grid opacity-50" />
      
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 border border-primary-container/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-primary-container text-sm font-label">Precision Growth Engineering</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight text-white leading-[1.1] mb-6">
            Scale Your B2B Enterprise with{" "}
            <span className="text-primary-container">Data-Driven</span>{" "}
            Performance
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            The Kinetic Architect Framework transforms your marketing into a predictable growth engine. 
            We engineer scalable systems that turn data into revenue.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold text-base hover:bg-primary-fixed transition-all active:scale-95"
            >
              Book Strategy Call
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center gap-2 border border-outline-variant/30 text-white px-8 py-4 rounded-lg font-label font-medium text-base hover:bg-surface-container transition-all"
            >
              View Case Studies
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
            <div>
              <p className="text-3xl font-bold font-headline text-white">312%</p>
              <p className="text-sm text-gray-500 mt-1">Avg. ROI Increase</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-white">50+</p>
              <p className="text-sm text-gray-500 mt-1">B2B Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-white">$2.4M</p>
              <p className="text-sm text-gray-500 mt-1">Revenue Generated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
