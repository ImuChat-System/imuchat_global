'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, X, Sparkles } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: '/monetization', label: t('monetization') },
    { href: '/imufeed', label: t('imufeed') },
    { href: '/tools', label: t('tools') },
    { href: '/live', label: t('live') },
    { href: '/success', label: t('success') },
    { href: '/apply', label: t('apply') },
  ];
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-sm"
            style={{ background: 'var(--color-primary)' }}
          >
            <Sparkles size={15} />
          </span>
          <span className="text-gradient-cr">Creators</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: pathname === href ? 'var(--color-primary)' : 'var(--color-muted)',
                background: pathname === href ? 'rgba(236,72,153,0.08)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href="https://app.imuchat.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white ml-1 cr-btn-primary"
          >
            {t('login')}
          </a>
          <button
            className="lg:hidden p-2 rounded-lg ml-1"
            style={{ color: 'var(--color-muted)' }}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div
          className="lg:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://app.imuchat.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold text-white text-center cr-btn-primary"
          >
            {t('login')}
          </a>
        </div>
      )}
    </header>
  );
}
