import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RevenueSimulator } from '@/components/RevenueSimulator';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Monétisation — ImuChat Creators',
    description:
      'Toutes les façons de gagner de l\'argent sur ImuChat. Pourboires 80%, Abonnements 85%, Ventes 80%, Live Gifts 70%, Store 70%.',
  };
}

export default async function MonetizationPage() {
  const t = await getTranslations('monetization');

  const sources = [
    {
      name: t('tips'),
      share: t('tipsShare'),
      min: t('tipsMin'),
      note: t('tipsNote'),
    },
    {
      name: t('subscriptions'),
      share: t('subscriptionsShare'),
      min: t('subscriptionsMin'),
      note: t('subscriptionsNote'),
    },
    {
      name: t('sales'),
      share: t('salesShare'),
      min: t('salesMin'),
      note: t('salesNote'),
    },
    {
      name: t('liveGifts'),
      share: t('liveGiftsShare'),
      min: t('liveGiftsMin'),
      note: t('liveGiftsNote'),
    },
    {
      name: t('store'),
      share: t('storeShare'),
      min: t('storeMin'),
      note: t('storeNote'),
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

      {/* Revenue table */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          {t('tableTitle')}
        </h2>
        <div className="cr-card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-muted)' }}>
                  {t('source')}
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-muted)' }}>
                  {t('yourShare')}
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-muted)' }}>
                  {t('minPayout')}
                </th>
                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-muted)' }}>
                  {t('notes')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src, i) => (
                <tr
                  key={src.name}
                  style={{
                    borderBottom:
                      i < sources.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <td className="p-4 font-medium" style={{ color: 'var(--color-text)' }}>
                    {src.name}
                  </td>
                  <td className="p-4 font-bold text-gradient-cr">{src.share}</td>
                  <td className="p-4" style={{ color: 'var(--color-muted)' }}>
                    {src.min}
                  </td>
                  <td className="p-4" style={{ color: 'var(--color-muted)' }}>
                    {src.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue simulator */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>
          {t('simulatorTitle')}
        </h2>
        <RevenueSimulator />
      </section>

      {/* Payment schedule */}
      <section>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          {t('paymentTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t('paymentWeekly'), icon: '📅' },
            { label: t('paymentMethods'), icon: '💳' },
            { label: t('paymentMinimum'), icon: '💰' },
          ].map(({ label, icon }) => (
            <div key={label} className="cr-card text-center">
              <div className="text-3xl mb-3">{icon}</div>
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
