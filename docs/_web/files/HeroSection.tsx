'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function HeroSection() {
  const t = useTranslations('landing.hero')

  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-24 right-0 w-[300px] h-[300px] bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Left column — copy */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[11px] font-bold tracking-wide mb-5">
            🇪🇺 {t('badge')}
          </div>

          <h1 className="text-[40px] sm:text-[52px] font-black leading-[1.06] tracking-tight text-gray-900 dark:text-white mb-5">
            {t('headline_1')}<br />
            <span className="text-violet-600 dark:text-violet-400">
              {t('headline_2')}
            </span>
          </h1>

          <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mb-7">
            {t('subheadline')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-7">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/40 hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('cta_primary')} →
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-medium rounded-xl border border-gray-200 dark:border-violet-800/60 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all"
            >
              {t('cta_secondary')}
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {[t('trust_1'), t('trust_2'), t('trust_3')].map(label => (
              <span key={label} className="flex items-center gap-1 text-[12px] font-semibold text-gray-400 dark:text-gray-500">
                <span className="text-green-500">✓</span> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right column — App mockup */}
        <div className="lg:justify-self-end w-full max-w-[520px]">
          <AppMockup />
        </div>
      </div>
    </section>
  )
}

/* ─── App window mockup ─────────────────────────────────────────────── */
function AppMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-violet-900/50 shadow-2xl shadow-violet-100/50 dark:shadow-violet-950/60 overflow-hidden bg-white dark:bg-[#0F0A1E]">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-violet-900/40 bg-gray-50/80 dark:bg-[#13091F]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">app.imuchat.app</span>
        <div className="w-10" />
      </div>

      {/* App shell */}
      <div className="flex h-[320px]">

        {/* Icon sidebar */}
        <div className="w-12 border-r border-gray-100 dark:border-violet-900/30 flex flex-col items-center py-3 gap-2.5 bg-white dark:bg-[#0F0A1E]">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white text-[12px] font-black">I</div>
          <div className="w-px h-5 bg-gray-100 dark:bg-violet-900/30 rounded-full" />
          {[
            { icon: '💬', active: true },
            { icon: '🤖', active: false },
            { icon: '📄', active: false },
            { icon: '🛍️', active: false },
            { icon: '🏆', active: false },
          ].map(({ icon, active }, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[15px] transition-colors ${
                active
                  ? 'bg-violet-100 dark:bg-violet-900/50'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Conversation list */}
        <div className="w-[150px] border-r border-gray-100 dark:border-violet-900/30 py-3 px-2 bg-white dark:bg-[#0F0A1E] flex flex-col gap-0.5">
          <p className="text-[9px] font-black tracking-widest text-gray-400 dark:text-gray-600 px-2 mb-1.5">MESSAGES</p>
          {[
            { name: 'Alice IA 🤖',   preview: 'Voici le résumé...', active: true },
            { name: 'Équipe Dev',    preview: 'Sprint review à 15h', active: false },
            { name: 'Marie',         preview: 'Merci pour le doc !', active: false },
            { name: 'ImuArena 🏆',  preview: 'Nouveau concours !', active: false },
          ].map(({ name, preview, active }) => (
            <div
              key={name}
              className={`rounded-lg px-2 py-1.5 ${
                active ? 'bg-violet-50 dark:bg-violet-900/30' : ''
              }`}
            >
              <p className={`text-[11px] font-semibold mb-0.5 ${active ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {name}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{preview}</p>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-[#120B20]">
          {/* Chat header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-violet-900/30 bg-white dark:bg-[#0F0A1E]">
            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[11px]">🤖</div>
            <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200">Alice IA</span>
            <span className="ml-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">En ligne</span>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col gap-2.5 p-3 overflow-hidden">
            <div className="flex items-end gap-1.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] flex-shrink-0">🤖</div>
              <div className="bg-white dark:bg-[#1E1230] border border-gray-100 dark:border-violet-900/30 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">Bonjour ! Comment puis-je vous aider&nbsp;?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-violet-600 rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-[11px] text-white leading-relaxed">Résume le doc ImuDocs sur le Q2</p>
              </div>
            </div>
            <div className="flex items-end gap-1.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] flex-shrink-0">🤖</div>
              <div className="bg-white dark:bg-[#1E1230] border border-gray-100 dark:border-violet-900/30 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">● ● ●</p>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="p-2.5 bg-white dark:bg-[#0F0A1E] border-t border-gray-100 dark:border-violet-900/30">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-violet-800/50 bg-gray-50/80 dark:bg-[#1A0D2E]">
              <span className="text-[11px] text-gray-400 flex-1">Écrire un message…</span>
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-white text-[11px] font-bold">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
