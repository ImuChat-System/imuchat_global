'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export function LandingNav() {
  const t = useTranslations('landing.nav')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-200
        ${scrolled
          ? 'bg-white/90 dark:bg-[#0F0A1E]/90 backdrop-blur-md border-b border-violet-100/60 dark:border-violet-900/40 shadow-sm'
          : 'bg-transparent'}
      `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-sm select-none">
            I
          </div>
          <span className="font-bold text-[15px] text-gray-900 dark:text-white">ImuChat</span>
          <span className="hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Bêta 2026
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-500 dark:text-gray-400">
          <Link href="#features" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {t('features')}
          </Link>
          <Link href="#pricing" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {t('pricing')}
          </Link>
          <Link href="https://office.imuchat.app" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            ImuOffice
          </Link>
          <Link href="https://arena.imuchat.app" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            ImuArena
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 text-[13px] font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm shadow-violet-200 dark:shadow-none"
          >
            {t('register')} →
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-violet-900/40 bg-white dark:bg-[#0F0A1E] px-4 pb-4">
          <div className="flex flex-col gap-1 pt-3">
            {[
              { href: '#features', label: t('features') },
              { href: '#pricing',  label: t('pricing') },
              { href: 'https://office.imuchat.app', label: 'ImuOffice' },
              { href: 'https://arena.imuchat.app',  label: 'ImuArena' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3">
              <Link
                href="/login"
                className="flex-1 text-center py-2 text-[13px] font-medium border border-gray-200 dark:border-violet-800 rounded-lg text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center py-2 text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
