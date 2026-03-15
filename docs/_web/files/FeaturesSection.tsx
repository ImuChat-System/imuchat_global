'use client'

import { useTranslations } from 'next-intl'

/* ─── Stats Bar ─────────────────────────────────────────────────────── */
export function StatsBar() {
  const t = useTranslations('landing.stats')

  const stats = [
    { value: '100%', label: t('eu')      },
    { value: '18+',  label: t('modules') },
    { value: 'RGPD', label: t('rgpd')    },
    { value: '6',    label: t('platforms')},
    { value: '0€',   label: t('free')    },
  ]

  return (
    <div className="border-y border-gray-100 dark:border-violet-900/30 bg-gray-50/60 dark:bg-[#0B0617]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-center gap-x-10 gap-y-3">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-[19px] font-black text-violet-600 dark:text-violet-400 leading-none">{value}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Features Grid ─────────────────────────────────────────────────── */
export function FeaturesGrid() {
  const t = useTranslations('landing.features')

  const features: {
    icon: string
    key: string
    color: string
    badgeColor: string
    borderColor: string
  }[] = [
    {
      icon: '💬',
      key: 'messaging',
      color: 'bg-violet-50 dark:bg-violet-900/30',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
      borderColor: 'border-t-violet-600',
    },
    {
      icon: '🤖',
      key: 'alice',
      color: 'bg-cyan-50 dark:bg-cyan-900/20',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
      borderColor: 'border-t-cyan-500',
    },
    {
      icon: '📄',
      key: 'office',
      color: 'bg-emerald-50 dark:bg-emerald-900/20',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      borderColor: 'border-t-emerald-600',
    },
    {
      icon: '🛍️',
      key: 'store',
      color: 'bg-amber-50 dark:bg-amber-900/20',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      borderColor: 'border-t-amber-500',
    },
    {
      icon: '🏆',
      key: 'arena',
      color: 'bg-red-50 dark:bg-red-900/20',
      badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      borderColor: 'border-t-red-500',
    },
    {
      icon: '🎨',
      key: 'themes',
      color: 'bg-pink-50 dark:bg-pink-900/20',
      badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
      borderColor: 'border-t-pink-500',
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-10">
          <p className="text-[11px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase mb-3">
            {t('label')}
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-black text-gray-900 dark:text-white leading-tight mb-3">
            {t('title_1')}<br />
            <span className="text-violet-600 dark:text-violet-400">{t('title_2')}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[15px] max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon, key, color, badgeColor, borderColor }) => (
            <div
              key={key}
              className={`
                rounded-xl border border-gray-100 dark:border-violet-900/30
                border-t-[3px] ${borderColor}
                bg-white dark:bg-[#0F0A1E]
                p-5 hover:shadow-md dark:hover:shadow-violet-950/40
                transition-shadow duration-200
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-xl`}>
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-[14px] text-gray-900 dark:text-white mb-0.5">
                    {t(`${key}.name`)}
                  </p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                    {t(`${key}.badge`)}
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {t(`${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Module ecosystem chips ─────────────────────────────────────────── */
export function ModulesStrip() {
  const t = useTranslations('landing.modules')

  const modules = [
    { icon: '💬', label: 'Chat' },
    { icon: '📞', label: 'Appels' },
    { icon: '🤖', label: 'Alice IA',   highlight: true },
    { icon: '📄', label: 'ImuDocs' },
    { icon: '📊', label: 'ImuSheets' },
    { icon: '📽️', label: 'ImuSlides' },
    { icon: '☁️', label: 'ImuDrive' },
    { icon: '🛍️', label: 'Store' },
    { icon: '🏆', label: 'Arena' },
    { icon: '🎮', label: 'Gaming' },
    { icon: '📸', label: 'ImuFeed' },
    { icon: '💰', label: 'Finance' },
    { icon: '🎓', label: 'Éducation' },
    { icon: '👨‍👩‍👧', label: 'Famille' },
    { icon: '🗓️', label: 'Agenda' },
    { icon: '✅', label: 'Tâches' },
    { icon: '🎵', label: 'Musique' },
    { icon: '🔒', label: 'Sécurité' },
  ]

  return (
    <div className="border-y border-gray-100 dark:border-violet-900/30 bg-gray-50/60 dark:bg-[#0B0617]/60 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase">{t('label')}</p>
            <p className="font-bold text-[15px] text-gray-900 dark:text-white mt-0.5">{t('title')}</p>
          </div>
          <a
            href="https://store.imuchat.app"
            className="text-[12px] font-medium text-violet-600 dark:text-violet-400 hover:underline"
          >
            {t('cta')} →
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {modules.map(({ icon, label, highlight }) => (
            <div
              key={label}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                transition-colors cursor-default select-none
                ${highlight
                  ? 'border border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold'
                  : 'border border-gray-200 dark:border-violet-900/30 bg-white dark:bg-[#0F0A1E] text-gray-600 dark:text-gray-400 hover:border-violet-200 dark:hover:border-violet-700'}
              `}
            >
              <span className="text-[14px]">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Sovereignty pillars ─────────────────────────────────────────────── */
export function SovereigntyPillars() {
  const t = useTranslations('landing.sovereignty')

  const pillars = [
    { icon: '🇪🇺', key: 'eu',    accent: 'border-l-violet-600' },
    { icon: '🔒', key: 'privacy', accent: 'border-l-emerald-600' },
    { icon: '🧩', key: 'open',    accent: 'border-l-cyan-500' },
  ]

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-4">
        {pillars.map(({ icon, key, accent }) => (
          <div
            key={key}
            className={`
              border-l-[3px] ${accent}
              bg-white dark:bg-[#0F0A1E]
              border border-gray-100 dark:border-violet-900/30
              rounded-xl p-5
            `}
          >
            <p className="text-2xl mb-3">{icon}</p>
            <h3 className="font-bold text-[15px] text-gray-900 dark:text-white mb-2">
              {t(`${key}.title`)}
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
              {t(`${key}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
