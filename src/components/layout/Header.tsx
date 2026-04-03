"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/growth-strategy", label: "Growth Strategy" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "bg-background/95 backdrop-blur-xl border-b border-outline-variant/10"
          : "bg-transparent"
      }`}
    >
      <nav className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto w-full font-headline tracking-tight">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          MYD Digital
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors duration-300 ${
                pathname === link.href
                  ? "text-primary-container"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/consultation"
            className={`hidden sm:inline-flex bg-primary-container text-on-primary-container px-6 py-2.5 rounded-md font-label font-bold text-sm hover:bg-primary-fixed transition-all active:scale-95 ${
              pathname === "/consultation" ? "ring-2 ring-primary-fixed" : ""
            }`}
          >
            Consultation
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-surface-container rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-outline-variant/10 animate-slide-up">
          <div className="px-8 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-3 text-lg font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary-container"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/consultation"
              className="block w-full text-center bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label font-bold mt-4 hover:bg-primary-fixed transition-all active:scale-95"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
