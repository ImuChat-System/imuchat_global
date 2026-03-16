import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Stories de créateurs — ImuChat Creators',
    description:
      'Découvrez les parcours inspirants de créateurs qui ont trouvé leur audience et gagné leur vie sur ImuChat.',
  };
}

export default async function SuccessPage() {
  const t = await getTranslations('success');

  const creators = [
    {
      name: t('creator1Name'),
      type: t('creator1Type'),
      subscribers: t('creator1Subscribers'),
      revenue: t('creator1Revenue'),
      quote: t('creator1Quote'),
      tip: t('creator1Tip'),
      avatar: 'A',
      color: '#ec4899',
    },
    {
      name: t('creator2Name'),
      type: t('creator2Type'),
      subscribers: t('creator2Subscribers'),
      revenue: t('creator2Revenue'),
      quote: t('creator2Quote'),
      tip: t('creator2Tip'),
      avatar: 'L',
      color: '#8b5cf6',
    },
    {
      name: t('creator3Name'),
      type: t('creator3Type'),
      subscribers: t('creator3Subscribers'),
      revenue: t('creator3Revenue'),
      quote: t('creator3Quote'),
      tip: t('creator3Tip'),
      avatar: 'M',
      color: '#06b6d4',
    },
    {
      name: t('creator4Name'),
      type: t('creator4Type'),
      subscribers: t('creator4Subscribers'),
      revenue: t('creator4Revenue'),
      quote: t('creator4Quote'),
      tip: t('creator4Tip'),
      avatar: 'S',
      color: '#10b981',
    },
    {
      name: t('creator5Name'),
      type: t('creator5Type'),
      subscribers: t('creator5Subscribers'),
      revenue: t('creator5Revenue'),
      quote: t('creator5Quote'),
      tip: t('creator5Tip'),
      avatar: 'K',
      color: '#f59e0b',
    },
    {
      name: t('creator6Name'),
      type: t('creator6Type'),
      subscribers: t('creator6Subscribers'),
      revenue: t('creator6Revenue'),
      quote: t('creator6Quote'),
      tip: t('creator6Tip'),
      avatar: 'N',
      color: '#ef4444',
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <div key={creator.name} className="cr-card flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white flex-shrink-0"
                style={{ background: creator.color }}
              >
                {creator.avatar}
              </div>
              <div>
                <div className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                  {creator.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {creator.type}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div
                className="flex-1 text-center p-2 rounded-xl"
                style={{ background: 'rgba(236,72,153,0.06)' }}
              >
                <div
                  className="text-xs font-medium mb-0.5"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {t('subscribers')}
                </div>
                <div className="font-bold text-sm text-gradient-cr">
                  {creator.subscribers}
                </div>
              </div>
              <div
                className="flex-1 text-center p-2 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.06)' }}
              >
                <div
                  className="text-xs font-medium mb-0.5"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {t('monthlyRevenue')}
                </div>
                <div className="font-bold text-sm" style={{ color: '#10b981' }}>
                  {creator.revenue}
                </div>
              </div>
            </div>

            <blockquote
              className="italic text-sm mb-4 flex-1"
              style={{ color: 'var(--color-muted)', borderLeft: `3px solid ${creator.color}`, paddingLeft: '12px' }}
            >
              &ldquo;{creator.quote}&rdquo;
            </blockquote>

            <div
              className="text-xs p-3 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.08)' }}
            >
              <span className="font-bold" style={{ color: 'var(--color-accent)' }}>
                {t('tip')} :{' '}
              </span>
              <span style={{ color: 'var(--color-muted)' }}>{creator.tip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
