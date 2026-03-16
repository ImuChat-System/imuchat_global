'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer style={{ background: '#060606', borderTop: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* ImuPay */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <span className="font-bold text-sm">
                Imu<span style={{ color: 'var(--color-primary)' }}>Pay</span>
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>{t('tagline')}</p>
            <div className="flex flex-col gap-1.5">
              {[
                { href: '/wallet' as const, label: t('links.wallet') },
                { href: '/send' as const, label: t('links.send') },
                { href: '/cards' as const, label: t('links.cards') },
                { href: '/savings' as const, label: t('links.savings') },
                { href: '/invest' as const, label: t('links.invest') },
                { href: '/imucoins' as const, label: t('links.imucoins') },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--color-muted)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('resources')}</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { href: '/security' as const, label: t('resourceLinks.security') },
                { href: '/pricing' as const, label: t('resourceLinks.pricing') },
                { href: '/faq' as const, label: t('resourceLinks.faq') },
                { href: '/contact' as const, label: t('resourceLinks.contact') },
                { href: '/legal' as const, label: t('resourceLinks.legal') },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--color-muted)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Ecosystem */}
          <div>
            <h3 className="font-semibold text-sm mb-4">{t('ecosystem')}</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { href: 'https://app.imuchat.app', label: t('ecosystemLinks.app') },
                { href: 'https://store.imuchat.app', label: t('ecosystemLinks.store') },
                { href: 'https://creators.imuchat.app', label: t('ecosystemLinks.creators') },
                { href: 'https://developers.imuchat.app', label: t('ecosystemLinks.developers') },
                { href: 'https://help.imuchat.app', label: t('ecosystemLinks.help') },
                { href: 'https://enterprise.imuchat.app', label: t('ecosystemLinks.enterprise') },
              ].map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--color-muted)' }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Sécurité</h3>
            <div className="flex flex-col gap-2">
              {['PCI DSS Level 1', 'AES-256', 'TLS 1.3', 'RGPD Conforme'].map((badge) => (
                <span key={badge} className="py-trust-badge text-xs w-fit">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t('copyright')}</p>
          <div className="flex gap-4">
            <Link href="/legal" className="text-xs hover:opacity-80" style={{ color: 'var(--color-muted)' }}>{t('legal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
