import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ImuFeed — ImuChat Creators',
    description:
      'Vidéo courte, longue, stories. Un algorithme qui valorise la qualité, pas le sensationnalisme. ADN manga/anime.',
  };
}

export default async function ImuFeedPage() {
  const t = await getTranslations('imufeed');

  const formats = [
    {
      title: t('shortTitle'),
      desc: t('shortDesc'),
      icon: '⚡',
      color: '#ec4899',
    },
    {
      title: t('longTitle'),
      desc: t('longDesc'),
      icon: '🎬',
      color: '#8b5cf6',
    },
    {
      title: t('storiesTitle'),
      desc: t('storiesDesc'),
      icon: '📸',
      color: '#06b6d4',
    },
  ];

  const differentiators = [
    { title: t('diff1Title'), desc: t('diff1Desc'), icon: '🚫' },
    { title: t('diff2Title'), desc: t('diff2Desc'), icon: '⭐' },
    { title: t('diff3Title'), desc: t('diff3Desc'), icon: '💰' },
    { title: t('diff4Title'), desc: t('diff4Desc'), icon: '🌸' },
    { title: t('diff5Title'), desc: t('diff5Desc'), icon: '🌍' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Formats */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {formats.map((fmt) => (
            <div key={fmt.title} className="cr-card text-center">
              <div className="text-4xl mb-4">{fmt.icon}</div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: fmt.color }}
              >
                {fmt.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {fmt.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Algorithm section */}
      <section
        className="mb-16 rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.1))',
          border: '1px solid rgba(236,72,153,0.2)',
        }}
      >
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
          {t('algoTitle')}
        </h2>
        <p className="text-base" style={{ color: 'var(--color-muted)' }}>
          {t('algoDesc')}
        </p>
      </section>

      {/* 5 differentiators */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--color-text)' }}>
          {t('sectionTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {differentiators.map((diff) => (
            <div key={diff.title} className="cr-card text-center">
              <div className="text-3xl mb-3">{diff.icon}</div>
              <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text)' }}>
                {diff.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {diff.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
