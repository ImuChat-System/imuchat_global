import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Store Créateur — ImuChat Creators',
    description:
      'Créez et vendez des stickers, thèmes, emojis animés, sons, mini-apps, templates. 70% des revenus pour vous.',
  };
}

export default async function StorePage() {
  const t = await getTranslations('store');

  const categories = [
    { title: t('category1'), desc: t('category1Desc'), icon: '🎭' },
    { title: t('category2'), desc: t('category2Desc'), icon: '🎨' },
    { title: t('category3'), desc: t('category3Desc'), icon: '😊' },
    { title: t('category4'), desc: t('category4Desc'), icon: '🎵' },
    { title: t('category5'), desc: t('category5Desc'), icon: '📱' },
    { title: t('category6'), desc: t('category6Desc'), icon: '📋' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Revenue share highlight */}
      <div
        className="mb-12 rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
          border: '1px solid rgba(16,185,129,0.3)',
        }}
      >
        <div className="text-3xl font-black mb-1" style={{ color: '#10b981' }}>
          {t('revenueShare')}
        </div>
        <div className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {t('revenueDesc')}
        </div>
      </div>

      {/* Categories grid */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="cr-card">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--color-text)' }}>
                {cat.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Publish info */}
      <section className="mb-8">
        <div className="cr-card">
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text)' }}>
            {t('publishTitle')}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
            {t('publishDesc')}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://store.imuchat.app"
              target="_blank"
              rel="noopener noreferrer"
              className="cr-btn-primary text-sm"
            >
              {t('storeLink')}
            </a>
            <a
              href="https://developers.imuchat.app"
              target="_blank"
              rel="noopener noreferrer"
              className="cr-btn-secondary text-sm"
            >
              {t('devLink')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
