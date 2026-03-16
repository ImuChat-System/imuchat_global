'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/wallet', label: t('wallet') },
    { href: '/cards', label: t('cards') },
    { href: '/imucoins', label: t('imucoins') },
    { href: '/security', label: t('security') },
    { href: '/pricing', label: t('pricing') },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
            <span style={{ color: 'var(--color-text)' }}>Imu<span style={{ color: 'var(--color-primary)' }}>Pay</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{
                  color: pathname === link.href ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            <a
              href="https://app.imuchat.app"
              target="_blank"
              rel="noopener noreferrer"
              className="py-btn-primary text-sm"
            >
              {t('openWallet')}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              style={{ background: 'var(--color-text)' }}
            />
            <span
              className={`block w-5 h-0.5 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}
              style={{ background: 'var(--color-text)' }}
            />
            <span
              className={`block w-5 h-0.5 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              style={{ background: 'var(--color-text)' }}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-medium"
                style={{ color: 'var(--color-muted)' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <a
              href="https://app.imuchat.app"
              target="_blank"
              rel="noopener noreferrer"
              className="py-btn-primary text-sm text-center"
            >
              {t('openWallet')}
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
