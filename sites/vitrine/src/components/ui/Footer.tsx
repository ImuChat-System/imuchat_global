'use client';

import { Github, Globe, Linkedin, Twitter } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();

  const productLinks = [
    { href: `/${locale}/product`, label: t('links.product') },
    { href: `/${locale}/features`, label: t('links.features') },
    { href: `/${locale}/ai`, label: t('links.ai') },
  ];

  const developerLinks = [
    { href: `/${locale}/developers`, label: t('links.developers') },
    { href: '#', label: t('links.api') },
    { href: '#', label: t('links.docs') },
  ];

  const companyLinks = [
    { href: `/${locale}/about`, label: t('links.about') },
    { href: '#', label: t('links.blog') },
    { href: `/${locale}/contact`, label: t('links.contact') },
  ];

  const legalLinks = [
    { href: `/${locale}/privacy`, label: t('links.privacy') },
    { href: `/${locale}/terms`, label: t('links.terms') },
    { href: `/${locale}/legal`, label: t('links.legal') },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center text-white font-bold text-xl">
                I
              </div>
              <span className="font-bold text-xl text-white">ImuChat</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('sections.product')}</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('sections.developers')}</h4>
            <ul className="space-y-2.5">
              {developerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('sections.company')}</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('sections.legal')}</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              {t('copyright')}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {t('incubated')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
