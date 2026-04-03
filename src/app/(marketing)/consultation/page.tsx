"use client";

import { useState } from "react";

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    revenue: "",
    challenge: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-page">
        <div className="max-w-lg mx-auto px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-primary-container">
              check_circle
            </span>
          </div>
          <h1 className="text-3xl font-bold font-headline text-white mb-4">
            Thank You!
          </h1>
          <p className="text-gray-400 mb-8">
            We've received your request and will be in touch within 24 hours to schedule your strategy session.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary-container font-label font-bold hover:underline"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column - Info */}
            <div>
              <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
                Free Consultation
              </p>
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-white mb-6">
                Let's Build Your{" "}
                <span className="text-primary-container">Growth Engine</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed mb-8">
                Book a free 30-minute strategy session with our growth experts. We'll analyze your current marketing, identify opportunities, and outline a roadmap for predictable growth.
              </p>

              {/* What to Expect */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold font-headline text-white">
                  What to Expect:
                </h3>
                {[
                  "Deep-dive into your current marketing challenges",
                  "Analysis of your competitive landscape",
                  "Custom recommendations for your growth stage",
                  "Clear next steps with actionable insights",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary-container text-xl mt-0.5">
                      check_circle
                    </span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>

              {/* Trust Signals */}
              <div className="p-6 rounded-xl border border-outline-variant/10 bg-surface-container">
                <p className="text-gray-400 text-sm mb-4">
                  "MYD Digital transformed our marketing from a cost center into a growth engine. The ROI has been incredible."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Sarah Johnson</p>
                    <p className="text-gray-500 text-sm">CMO, TechScale SaaS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="p-8 rounded-xl border border-outline-variant/10 bg-surface-container">
              <h2 className="text-2xl font-bold font-headline text-white mb-6">
                Request Your Free Strategy Session
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white placeholder:text-gray-500 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white placeholder:text-gray-500 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-400 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white placeholder:text-gray-500 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                      placeholder="Acme Inc"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-400 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white placeholder:text-gray-500 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="revenue" className="block text-sm font-medium text-gray-400 mb-2">
                    Annual Revenue
                  </label>
                  <select
                    id="revenue"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                  >
                    <option value="">Select range</option>
                    <option value="<1m">Less than $1M</option>
                    <option value="1m-5m">$1M - $5M</option>
                    <option value="5m-10m">$5M - $10M</option>
                    <option value="10m-50m">$10M - $50M</option>
                    <option value=">50m">$50M+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="challenge" className="block text-sm font-medium text-gray-400 mb-2">
                    Biggest Marketing Challenge *
                  </label>
                  <select
                    id="challenge"
                    name="challenge"
                    required
                    value={formData.challenge}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
                  >
                    <option value="">Select challenge</option>
                    <option value="lead-gen">Lead Generation</option>
                    <option value="conversion">Conversion Optimization</option>
                    <option value="brand">Brand Awareness</option>
                    <option value="retention">Customer Retention</option>
                    <option value="scale">Scaling Operations</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                    Tell us more about your goals
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant/20 bg-surface text-white placeholder:text-gray-500 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container resize-none"
                    placeholder="What are you hoping to achieve with this consultation?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Book My Free Session
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>

                <p className="text-center text-gray-500 text-sm">
                  No commitment required. We'll reach out within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
