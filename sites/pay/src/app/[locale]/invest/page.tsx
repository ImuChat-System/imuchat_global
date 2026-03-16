import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Invest.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function InvestPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Invest');

  const features = ['stocks', 'etf', 'crypto', 'alice', 'education'] as const;
  const featureIcons: Record<string, string> = { stocks: '📈', etf: '📦', crypto: '₿', alice: '🤖', education: '📚' };
  const stocks = [
    { name: 'Apple', ticker: 'AAPL', price: '182,50 €', change: '+1,2%', positive: true },
    { name: 'Tesla', ticker: 'TSLA', price: '248,30 €', change: '+3,4%', positive: true },
    { name: 'LVMH', ticker: 'MC.PA', price: '712,00 €', change: '-0,8%', positive: false },
  ];

  return (
    <>
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
          <p className="text-xl mb-8" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
          <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary">{t('cta')}</a>
        </div>
      </section>

      <section className="max-w-lg mx-auto px-4 py-8">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-muted)' }}>Actions fractionnées — dès 1€</p>
          </div>
          {stocks.map((s, i) => (
            <div key={s.ticker} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: i < stocks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs" style={{ background: 'rgba(5,150,105,0.15)', color: 'var(--color-primary)' }}>
                  {s.ticker.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.ticker}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{s.price}</p>
                <p className="text-xs font-bold" style={{ color: s.positive ? '#059669' : '#ef4444' }}>{s.change}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f} className="py-card">
              <span className="text-3xl mb-3 block">{featureIcons[f]}</span>
              <h3 className="font-bold mb-2">{t(`features.${f}.title`)}</h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-muted)' }}>{t(`features.${f}.desc`)}</p>
              {f === 'alice' && (
                <a href="https://alice.imuchat.app" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {t('aliceLink')} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="rounded-xl p-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-xs leading-relaxed" style={{ color: '#fca5a5' }}>{t('warning')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
