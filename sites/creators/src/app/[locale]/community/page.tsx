import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Communauté — ImuChat Creators',
    description:
      'Channels exclusifs abonnés premium, sondages, Q&A, événements virtuels. Intégration ImuArena.',
  };
}

export default async function CommunityPage() {
  const t = await getTranslations('community');

  const features = [
    { title: t('feature1Title'), desc: t('feature1Desc'), icon: '🔒' },
    { title: t('feature2Title'), desc: t('feature2Desc'), icon: '📊' },
    { title: t('feature3Title'), desc: t('feature3Desc'), icon: '❓' },
    { title: t('feature4Title'), desc: t('feature4Desc'), icon: '🎉' },
    { title: t('feature5Title'), desc: t('feature5Desc'), icon: '🏆' },
    { title: t('feature6Title'), desc: t('feature6Desc'), icon: '🥇' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => (
            <div key={feat.title} className="cr-card">
              <div className="text-3xl mb-3">{feat.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--color-text)' }}>
                {feat.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ImuArena */}
      <section
        className="rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
          border: '1px solid rgba(139,92,246,0.3)',
        }}
      >
        <div className="text-4xl mb-4">🏟️</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
          {t('arenaTitle')}
        </h2>
        <p className="text-base" style={{ color: 'var(--color-muted)' }}>
          {t('arenaDesc')}
        </p>
      </section>
    </div>
  );
}
