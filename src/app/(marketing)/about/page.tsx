import Link from "next/link";

const team = [
  {
    name: "Alex Chen",
    role: "Founder & CEO",
    bio: "Former growth lead at Stripe. 10+ years scaling B2B companies.",
  },
  {
    name: "Sarah Miller",
    role: "Head of Strategy",
    bio: "Ex-McKinsey consultant specializing in go-to-market strategy.",
  },
  {
    name: "David Park",
    role: "Technical Director",
    bio: "Full-stack marketer with deep expertise in marketing automation.",
  },
  {
    name: "Emma Wilson",
    role: "Creative Director",
    bio: "Award-winning designer focused on B2B brand experiences.",
  },
];

const values = [
  {
    icon: "science",
    title: "Data-Driven",
    description: "Every decision backed by data. Every strategy validated through experimentation.",
  },
  {
    icon: "handshake",
    title: "Partnership",
    description: "We're an extension of your team, not just another vendor.",
  },
  {
    icon: "trending_up",
    title: "Results-Focused",
    description: "We measure success by your revenue growth, not vanity metrics.",
  },
  {
    icon: "lightbulb",
    title: "Innovation",
    description: "Constantly testing new channels, tools, and tactics to stay ahead.",
  },
];

export default function AboutPage() {
  return (
    <div className="animate-page">
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 kinetic-grid opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="max-w-3xl">
            <p className="text-primary-container font-label font-bold text-sm uppercase tracking-wider mb-4">
              About Us
            </p>
            <h1 className="text-5xl md:text-6xl font-bold font-headline text-white mb-6">
              We're{" "}
              <span className="text-primary-container">Growth Engineers</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              MYD Digital was founded on a simple belief: B2B marketing should be a predictable growth engine, not a guessing game. We combine data science, creative excellence, and deep industry expertise to help ambitious companies scale.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl border border-outline-variant/10 bg-surface-container text-center"
              >
                <div className="w-14 h-14 rounded-lg bg-primary-container/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary-container">
                    {value.icon}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-headline text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline text-white mb-4">
              Meet the Team
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experienced operators who've scaled companies from startup to enterprise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="p-6 rounded-xl border border-outline-variant/10 bg-surface-container"
              >
                <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary-container">
                    person
                  </span>
                </div>
                <h3 className="text-lg font-bold font-headline text-white text-center">
                  {member.name}
                </h3>
                <p className="text-primary-container text-sm text-center mb-2">
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm text-center">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
            Let's Build Something Great Together
          </h2>
          <p className="text-gray-400 mb-8">
            Ready to transform your marketing into a growth engine?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95"
            >
              Book a Call
              <span className="material-symbols-outlined">calendar_today</span>
            </Link>
            <Link
              href="/careers"
              className="inline-flex items-center justify-center gap-2 border border-outline-variant/30 text-white px-8 py-4 rounded-lg font-label font-medium hover:bg-surface-container transition-all"
            >
              Join Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
