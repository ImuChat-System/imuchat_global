import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ImuChat Creators — Créez, Partagez, Gagnez',
    description:
      'La plateforme créateur qui vous met en premier. 80% des revenus, zéro algorithme punitif, outils IA inclus.',
  };
}

export default async function HomePage() {
  const t = await getTranslations('home');

  const pillars = [
    {
      name: t('pillar1Name'),
      commission: t('pillar1Commission'),
      desc: t('pillar1Desc'),
      color: '#ec4899',
    },
    {
      name: t('pillar2Name'),
      commission: t('pillar2Commission'),
      desc: t('pillar2Desc'),
      color: '#8b5cf6',
    },
    {
      name: t('pillar3Name'),
      commission: t('pillar3Commission'),
      desc: t('pillar3Desc'),
      color: '#06b6d4',
    },
    {
      name: t('pillar4Name'),
      commission: t('pillar4Commission'),
      desc: t('pillar4Desc'),
      color: '#f59e0b',
    },
    {
      name: t('pillar5Name'),
      commission: t('pillar5Commission'),
      desc: t('pillar5Desc'),
      color: '#10b981',
    },
  ];

  const creators = [
    {
      name: 'Akira',
      type: 'Vidéaste manga & anime',
      subscribers: '42k',
      avatar: 'A',
      color: '#ec4899',
    },
    {
      name: 'Luna',
      type: 'Artiste digitale',
      subscribers: '18k',
      avatar: 'L',
      color: '#8b5cf6',
    },
    {
      name: 'MechaGamer',
      type: 'Gaming & Esport',
      subscribers: '95k',
      avatar: 'M',
      color: '#06b6d4',
    },
    {
      name: 'Dr. Sophie',
      type: 'Éducation & Science',
      subscribers: '31k',
      avatar: 'S',
      color: '#10b981',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="cr-badge mb-6 mx-auto w-fit">Programme Créateurs ImuChat</div>
        <h1 className="text-5xl sm:text-6xl font-black mb-6 text-gradient-cr leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--color-muted)' }}>
          {t('heroSubtitle')}
        </p>

        {/* Stats bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mb-12 p-5 rounded-2xl max-w-2xl mx-auto"
          style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}
        >
          <div className="text-center">
            <div className="text-2xl font-black text-gradient-cr">80%</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {t('stat1')}
            </div>
          </div>
          <div
            className="hidden sm:block w-px h-10"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="text-center">
            <div className="text-2xl font-black text-gradient-cr">0</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {t('stat2')}
            </div>
          </div>
          <div
            className="hidden sm:block w-px h-10"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="text-center">
            <div className="text-2xl font-black text-gradient-cr">24h</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {t('stat3')}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply" className="cr-btn-primary text-base">
            {t('heroCtaPrimary')}
          </Link>
          <a
            href="https://app.imuchat.app"
            target="_blank"
            rel="noopener noreferrer"
            className="cr-btn-secondary text-base"
          >
            {t('heroCtaSecondary')}
          </a>
        </div>
      </section>

      {/* 5 pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: 'var(--color-text)' }}>
          {t('pillarsTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pillars.map((pillar) => (
            <div key={pillar.name} className="cr-card text-center">
              <div
                className="text-2xl font-black mb-2"
                style={{ color: pillar.color }}
              >
                {pillar.commission}
              </div>
              <div
                className="font-bold text-sm mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                {pillar.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {pillar.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured creators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: 'var(--color-text)' }}>
          {t('featuredTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creators.map((creator) => (
            <div key={creator.name} className="cr-card flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white mb-4"
                style={{ background: creator.color }}
              >
                {creator.avatar}
              </div>
              <div className="font-bold text-base mb-0.5" style={{ color: 'var(--color-text)' }}>
                {creator.name}
              </div>
              <div className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                {creator.type}
              </div>
              <div className="cr-badge">{creator.subscribers} abonnés</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="mx-4 sm:mx-6 mb-16 rounded-3xl p-10 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(236,72,153,0.2)',
        }}
      >
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          {t('ctaTitle')}
        </h2>
        <p className="mb-8 max-w-xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('ctaDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply" className="cr-btn-primary text-base">
            {t('ctaPrimary')}
          </Link>
          <a
            href="https://app.imuchat.app"
            target="_blank"
            rel="noopener noreferrer"
            className="cr-btn-secondary text-base"
          >
            {t('ctaSecondary')}
          </a>
        </div>
      </section>
    </div>
  );
}
