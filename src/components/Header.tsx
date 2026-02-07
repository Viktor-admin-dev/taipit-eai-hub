"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/why", label: "Зачем" },
    { href: "/testimonials", label: "Истории успеха" },
    { href: "/contest", label: "Конкурс" },
    { href: "/voting", label: "Голосование" },
    { href: "/forum", label: "Форум" },
  ];

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(6, 11, 24, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(99, 130, 255, 0.1)' }}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white" style={{ background: 'linear-gradient(135deg, #4a65f0, #6382ff)' }}>
              EAI
            </div>
            <div>
              <div className="font-bold text-lg text-white">EAI Hub</div>
              <div className="text-xs" style={{ color: '#8898b8' }}>Тайпит</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors font-medium"
                style={{ color: '#8898b8' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#6382ff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8898b8'}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contest#apply" className="btn-primary !py-2 !px-5 text-sm">
              Подать заявку
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 pt-4" style={{ borderTop: '1px solid rgba(99, 130, 255, 0.15)' }}>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors font-medium"
                  style={{ color: '#8898b8' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contest#apply"
                className="btn-primary text-center !py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Подать заявку
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
