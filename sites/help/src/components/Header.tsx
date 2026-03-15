'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Globe, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
];

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">ImuChat <span className="text-primary-600">Help</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}/getting-started`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              {t('categories.gettingStarted.title')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              {t('contact.button')}
            </Link>

            <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="uppercase text-sm font-medium">{locale}</span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2">
                  {languages.map((lang) => (
                    <Link key={lang.code} href={`/${lang.code}`} className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${locale === lang.code ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setIsLangOpen(false)}>
                      {lang.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:border-primary-400 bg-transparent" />
          </nav>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <Link href={`/${locale}/getting-started`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>{t('categories.gettingStarted.title')}</Link>
              <Link href={`/${locale}/contact`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>{t('contact.button')}</Link>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-sm text-gray-500 mb-2">Language</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Link key={lang.code} href={`/${lang.code}`} className={`px-3 py-1 text-sm rounded-full ${locale === lang.code ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`} onClick={() => setIsMenuOpen(false)}>
                      {lang.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Thème</span>
                <ThemeToggle className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:border-primary-400 bg-transparent" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
