'use client';

import { useTranslations } from 'next-intl';

export default function TrustBar() {
  const t = useTranslations('TrustBar');

  const badges = [
    {
      key: 'pci',
      label: t('pci'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      key: 'aes',
      label: t('aes'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      key: 'rgpd',
      label: t('rgpd'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      ),
    },
    {
      key: 'funds',
      label: t('funds'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
    },
    {
      key: 'secure3d',
      label: t('secure3d'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      key: 'antifraud',
      label: 'Anti-fraude IA',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      className="w-full overflow-x-auto"
      style={{ background: 'rgba(5,150,105,0.05)', borderTop: '1px solid rgba(5,150,105,0.15)', borderBottom: '1px solid rgba(5,150,105,0.15)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 min-w-max mx-auto justify-center flex-wrap">
          {badges.map((badge) => (
            <span key={badge.key} className="py-trust-badge">
              {badge.icon}
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
