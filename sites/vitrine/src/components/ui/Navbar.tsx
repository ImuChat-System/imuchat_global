'use client';

import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const LOCALES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'ja', label: 'JA', name: '日本語' },
];

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    if (['fr', 'en', 'de', 'es', 'ja'].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 hover:border-primary text-sm font-medium"
      >
        <Globe size={14} />
        {locale.toUpperCase()}
        <ChevronDown size={12} className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 py-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
          {LOCALES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => switchLocale(l.code)}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 flex items-center justify-between ${locale === l.code ? 'text-primary font-semibold' : 'text-slate-700'}`}
            >
              <span>{l.name}</span>
              <span className="text-xs text-slate-400">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navbar');
  const locale = useLocale();

  const navLinks = [
    { href: `/${locale}/product`, label: t('product') },
    { href: `/${locale}/features`, label: t('features') },
    { href: `/${locale}/ai`, label: t('ai') },
    { href: `/${locale}/developers`, label: t('developers') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl text-slate-900 hover:text-primary-600 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center text-white font-bold">
              I
            </div>
            ImuChat
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button + Language + Theme (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href={`/${locale}/contact`} className="px-6 py-2 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
              {t('cta')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-4 pt-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <Link href={`/${locale}/contact`} className="block w-full mt-4 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition-all text-center">
              {t('cta')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
