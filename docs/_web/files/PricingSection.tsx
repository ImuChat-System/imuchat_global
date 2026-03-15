'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

type Plan = {
  key: string
  price: string
  per: string
  cta: string
  ctaHref: string
  featured?: boolean
  features: string[]
}

export function PricingSection() {
  const t = useTranslations('landing.pricing')

  const plans: Plan[] = [
    {
      key: 'free',
      price: '0€',
      per: t('per_month'),
      cta: t('free.cta'),
      ctaHref: '/register',
      features: [
        t('free.f1'),
        t('free.f2'),
        t('free.f3'),
        t('free.f4'),
      ],
    },
    {
      key: 'premium',
      price: '4,99€',
      per: t('per_month'),
      cta: t('premium.cta'),
      ctaHref: '/register?plan=premium',
      featured: true,
      features: [
        t('premium.f1'),
        t('premium.f2'),
        t('premium.f3'),
        t('premium.f4'),
        t('premium.f5'),
      ],
    },
    {
      key: 'team',
      price: '9,99€',
      per: t('per_user_month'),
      cta: t('team.cta'),
      ctaHref: '/contact',
      features: [
        t('team.f1'),
        t('team.f2'),
        t('team.f3'),
        t('team.f4'),
        t('team.f5'),
      ],
    },
  ]

  return (
    <section id="pricing" className="py-16 sm:py-20 bg-gray-50/50 dark:bg-[#0B0617]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-10">
          <p className="text-[11px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase mb-3">
            {t('label')}
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-black text-gray-900 dark:text-white leading-tight mb-3">
            {t('title_1')}{' '}
            <span className="text-violet-600 dark:text-violet-400">{t('title_2')}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[15px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.key} plan={plan} t={t} />
          ))}
        </div>

        {/* Enterprise footnote */}
        <p className="text-center text-[12px] text-gray-400 dark:text-gray-600 mt-6">
          {t('enterprise_note')}{' '}
          <Link href="/contact" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
            {t('enterprise_cta')}
          </Link>
        </p>
      </div>
    </section>
  )
}

function PricingCard({
  plan,
  t,
}: {
  plan: Plan
  t: (key: string) => string
}) {
  return (
    <div
      className={`
        relative rounded-xl p-5
        ${plan.featured
          ? 'border-2 border-violet-600 dark:border-violet-500 bg-white dark:bg-[#0F0A1E] shadow-lg shadow-violet-100/60 dark:shadow-violet-950/60'
          : 'border border-gray-200 dark:border-violet-900/30 bg-white dark:bg-[#0F0A1E]'}
      `}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-[10px] font-black rounded tracking-wider uppercase shadow-sm">
          {t('recommended')}
        </div>
      )}

      {/* Plan name */}
      <p
        className={`font-bold text-[13px] mb-3 ${
          plan.featured ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {t(`${plan.key}.name`)}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-[34px] font-black text-gray-900 dark:text-white leading-none">
          {plan.price}
        </span>
        <span className="text-[12px] text-gray-400 dark:text-gray-500">{plan.per}</span>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2.5 mb-5">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2">
            <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-[12px] text-gray-500 dark:text-gray-400">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        className={`
          block w-full text-center py-2.5 text-[13px] font-bold rounded-lg transition-all
          ${plan.featured
            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200 dark:shadow-none hover:-translate-y-0.5'
            : 'border border-gray-200 dark:border-violet-800 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30'}
        `}
      >
        {plan.cta}
        {plan.featured && ' →'}
      </Link>
    </div>
  )
}
