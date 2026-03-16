import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Live Streaming — ImuChat Creators',
    description:
      'Live streaming sur ImuChat. Gifts animés, co-streaming, replays automatiques, super-chats et monétisation en temps réel.',
  };
}

export default async function LivePage() {
  const t = await getTranslations('live');

  const features = [
    { title: t('feature1Title'), desc: t('feature1Desc'), icon: '🎥' },
    { title: t('feature2Title'), desc: t('feature2Desc'), icon: '🎁' },
    { title: t('feature3Title'), desc: t('feature3Desc'), icon: '👥' },
    { title: t('feature4Title'), desc: t('feature4Desc'), icon: '💬' },
    { title: t('feature5Title'), desc: t('feature5Desc'), icon: '⭐' },
    { title: t('feature6Title'), desc: t('feature6Desc'), icon: '📹' },
  ];

  const monetization = [
    { label: t('gifts70'), value: '70%', color: '#ec4899' },
    { label: t('superchats80'), value: '80%', color: '#8b5cf6' },
    { label: t('subs85'), value: '85%', color: '#10b981' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Features grid */}
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

      {/* Live monetization */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--color-text)' }}>
          {t('monetizationTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {monetization.map(({ label, value, color }) => (
            <div key={label} className="cr-card text-center">
              <div className="text-4xl font-black mb-2" style={{ color }}>
                {value}
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
