'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

/* ─── Download / Platform CTA ───────────────────────────────────────── */
export function DownloadSection() {
  const t = useTranslations('landing.download')

  const platforms = [
    { icon: '🌐', label: 'Web', href: '/app' },
    { icon: '📱', label: 'iOS', href: 'https://apps.apple.com' },
    { icon: '🤖', label: 'Android', href: 'https://play.google.com' },
    { icon: '💻', label: 'Desktop', href: '/download' },
  ]

  return (
    <section className="py-14 sm:py-20 bg-violet-600 dark:bg-violet-700 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-[28px] sm:text-[34px] font-black text-white mb-2">
          {t('title')}
        </h2>
        <p className="text-violet-200 text-[14px] mb-7">{t('subtitle')}</p>

        <div className="flex flex-wrap justify-center gap-3">
          {platforms.map(({ icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                transition-all hover:-translate-y-0.5
                ${label === 'Web'
                  ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-sm'
                  : 'border border-white/25 text-white hover:bg-white/10'}
              `}
            >
              <span className="text-[15px]">{icon}</span> {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
export function LandingFooter() {
  const t = useTranslations('landing.footer')

  const columns = [
    {
      title: 'Produit',
      links: [
        { label: 'Fonctionnalités', href: '#features' },
        { label: 'Tarifs', href: '#pricing' },
        { label: 'ImuOffice', href: 'https://office.imuchat.app' },
        { label: 'ImuArena', href: 'https://arena.imuchat.app' },
        { label: 'Alice IA', href: 'https://alice.imuchat.app' },
        { label: 'Store', href: 'https://store.imuchat.app' },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { label: 'Documentation', href: 'https://docs.imuchat.app' },
        { label: 'Centre d\'aide', href: 'https://help.imuchat.app' },
        { label: 'Blog', href: 'https://blog.imuchat.app' },
        { label: 'Statut', href: 'https://status.imuchat.app' },
        { label: 'Développeurs', href: 'https://developers.imuchat.app' },
        { label: 'Feedback', href: 'https://feedback.imuchat.app' },
      ],
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'À propos', href: '/about' },
        { label: 'Carrières', href: 'https://careers.imuchat.app' },
        { label: 'Partenaires', href: 'https://partners.imuchat.app' },
        { label: 'Presse', href: 'https://press.imuchat.app' },
        { label: 'Contact', href: '/contact' },
        { label: 'Sécurité', href: 'https://security.imuchat.app' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { label: 'Confidentialité', href: '/legal/privacy' },
        { label: 'CGU', href: '/legal/terms' },
        { label: 'Cookies', href: '/legal/cookies' },
        { label: 'RGPD', href: '/legal/gdpr' },
      ],
    },
  ]

  return (
    <footer className="border-t border-gray-100 dark:border-violet-900/30 bg-white dark:bg-[#0A0614]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">

        {/* Top row: brand + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-sm">I</div>
              <span className="font-bold text-[15px] text-gray-900 dark:text-white">ImuChat</span>
            </Link>
            <p className="text-[12px] text-gray-400 dark:text-gray-600 leading-relaxed max-w-[160px]">
              {t('tagline')}
            </p>
            <p className="text-[11px] text-gray-300 dark:text-gray-700 mt-3">🇪🇺 Hébergé en Europe</p>
          </div>

          {/* Link columns */}
          {columns.map(({ title, links }) => (
            <div key={title}>
              <p className="font-semibold text-[12px] text-gray-800 dark:text-gray-300 mb-3">{title}</p>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[12px] text-gray-400 dark:text-gray-600 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-gray-100 dark:border-violet-900/20 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 dark:text-gray-600">
            © 2026 ImuChat — Super-app européenne souveraine
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-300 dark:text-gray-700">🔒 RGPD natif</span>
            <span className="text-[11px] text-gray-300 dark:text-gray-700">0 publicité</span>
            <span className="text-[11px] text-gray-300 dark:text-gray-700">0 revente de données</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
