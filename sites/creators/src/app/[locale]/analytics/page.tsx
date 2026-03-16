import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Analytics Créateur — ImuChat Creators',
    description:
      'Dashboard créateur en temps réel. Vues, likes, partages, revenus par source. Export CSV et PDF.',
  };
}

export default async function AnalyticsPage() {
  const t = await getTranslations('analytics');

  const metrics = [
    { label: t('metric1'), value: '124,500', change: '+12%', color: '#ec4899' },
    { label: t('metric2'), value: '8,320', change: '+8%', color: '#8b5cf6' },
    { label: t('metric3'), value: '1,240', change: '+22%', color: '#06b6d4' },
    { label: t('metric4'), value: '1 840 €', change: '+15%', color: '#10b981' },
    { label: t('metric5'), value: '520', change: '+5%', color: '#f59e0b' },
    { label: t('metric6'), value: '6.7%', change: '+1.2%', color: '#ec4899' },
  ];

  const revenueBreakdown = [
    { label: t('metric4') + ' — Tips', pct: 30, color: '#ec4899' },
    { label: t('metric4') + ' — Subs', pct: 45, color: '#8b5cf6' },
    { label: t('metric4') + ' — Live', pct: 15, color: '#06b6d4' },
    { label: t('metric4') + ' — Store', pct: 10, color: '#10b981' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Dashboard mockup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          {t('dashboardTitle')}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          {t('dashboardDesc')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="cr-card">
              <div
                className="text-2xl font-black mb-1"
                style={{ color: metric.color }}
              >
                {metric.value}
              </div>
              <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text)' }}>
                {metric.label}
              </div>
              <div className="text-xs text-green-400">{metric.change} ce mois</div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue breakdown */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          {t('revenueBreakdown')}
        </h2>
        <div className="cr-card">
          <div className="flex rounded-full overflow-hidden h-8 mb-4">
            {revenueBreakdown.map((item) => (
              <div
                key={item.label}
                style={{ width: `${item.pct}%`, background: item.color }}
                title={`${item.label}: ${item.pct}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {revenueBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {item.label} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export section */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          {t('exportTitle')}
        </h2>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
          {t('exportDesc')}
        </p>
        <div className="flex gap-4">
          <button className="cr-btn-secondary px-6 py-2.5 text-sm">{t('exportCSV')}</button>
          <button className="cr-btn-secondary px-6 py-2.5 text-sm">{t('exportPDF')}</button>
        </div>
      </section>
    </div>
  );
}
