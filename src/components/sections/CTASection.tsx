import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 kinetic-gradient opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative p-12 md:p-16 text-center border border-primary-container/20 rounded-2xl">
            <h2 className="text-3xl md:text-5xl font-bold font-headline text-white mb-4">
              Ready to Architect Your Growth?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
              Schedule a free 30-minute strategy session to discover how the Kinetic Architect 
              Framework can transform your B2B marketing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold text-base hover:bg-primary-fixed transition-all active:scale-95"
              >
                Book Free Strategy Call
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-outline-variant/30 text-white px-8 py-4 rounded-lg font-label font-medium text-base hover:bg-surface-container transition-all"
              >
                Contact Us
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="mt-8 text-sm text-gray-500">
              Trusted by 50+ B2B companies worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
