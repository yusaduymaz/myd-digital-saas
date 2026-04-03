import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/10 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-headline">
              MYD Digital
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Transforming businesses through strategic digital solutions and innovative marketing.
            </p>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-white font-label font-bold text-sm mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/web-development" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/services/digital-marketing" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link href="/services/brand-strategy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Brand Strategy
                </Link>
              </li>
              <li>
                <Link href="/services/seo" className="text-gray-400 hover:text-white transition-colors text-sm">
                  SEO Optimization
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-label font-bold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-label font-bold text-sm mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="text-gray-400 text-sm">
                hello@myddigital.com
              </li>
              <li className="text-gray-400 text-sm">
                +1 (555) 123-4567
              </li>
            </ul>
            <Link
              href="/consultation"
              className="inline-block mt-6 bg-primary-container text-on-primary-container px-5 py-2 rounded-md font-label font-bold text-sm hover:bg-primary-fixed transition-all active:scale-95"
            >
              Book a Call
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} MYD Digital. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-400 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-400 transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
