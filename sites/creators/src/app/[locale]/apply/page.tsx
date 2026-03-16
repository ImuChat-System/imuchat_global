import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ApplyForm } from '@/components/ApplyForm';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Rejoindre le programme créateur — ImuChat Creators',
    description:
      'Rejoignez le programme créateur ImuChat. 4 niveaux : Starter, Rising, Partner, Star. Candidature gratuite.',
  };
}

export default async function ApplyPage() {
  const t = await getTranslations('apply');

  const tiers = [
    {
      name: t('tier1Name'),
      subscribers: t('tier1Subscribers'),
      desc: t('tier1Desc'),
      features: [t('tier1Feature1'), t('tier1Feature2'), t('tier1Feature3')],
      color: '#9ca3af',
      highlight: false,
    },
    {
      name: t('tier2Name'),
      subscribers: t('tier2Subscribers'),
      desc: t('tier2Desc'),
      features: [t('tier2Feature1'), t('tier2Feature2'), t('tier2Feature3'), t('tier2Feature4')],
      color: '#06b6d4',
      highlight: false,
    },
    {
      name: t('tier3Name'),
      subscribers: t('tier3Subscribers'),
      desc: t('tier3Desc'),
      features: [
        t('tier3Feature1'),
        t('tier3Feature2'),
        t('tier3Feature3'),
        t('tier3Feature4'),
        t('tier3Feature5'),
      ],
      color: '#8b5cf6',
      highlight: true,
    },
    {
      name: t('tier4Name'),
      subscribers: t('tier4Subscribers'),
      desc: t('tier4Desc'),
      features: [
        t('tier4Feature1'),
        t('tier4Feature2'),
        t('tier4Feature3'),
        t('tier4Feature4'),
        t('tier4Feature5'),
      ],
      color: '#ec4899',
      highlight: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Tiers */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="cr-card relative"
              style={
                tier.highlight
                  ? { border: `2px solid ${tier.color}`, background: 'var(--color-bg-alt)' }
                  : {}
              }
            >
              {tier.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 cr-badge text-xs px-3"
                  style={{ background: tier.color, color: 'white' }}
                >
                  Populaire
                </div>
              )}
              <div className="font-black text-2xl mb-1" style={{ color: tier.color }}>
                {tier.name}
              </div>
              <div className="cr-badge mb-3">{tier.subscribers}</div>
              <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
                {tier.desc}
              </p>
              <ul className="space-y-1.5">
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-xs"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <span style={{ color: tier.color }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Application form */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--color-text)' }}>
          {t('formTitle')}
        </h2>
        <ApplyForm />
      </section>
    </div>
  );
}
