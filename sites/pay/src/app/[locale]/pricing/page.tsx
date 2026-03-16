import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Pricing.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function PricingPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Pricing');

  const rows = ['account', 'virtualCard', 'physicalCard', 'p2p', 'conversion', 'atm', 'imucoins', 'merchant', 'investBuy', 'investSell'] as const;

  return (
    <>
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
          <p className="text-xl" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-3 px-6 py-4 text-sm font-bold" style={{ background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
            <span>{t('table.service')}</span>
            <span className="text-center">{t('table.cost')}</span>
            <span className="text-right">{t('table.note')}</span>
          </div>
          {rows.map((row, i) => {
            const cost = t(`rows.${row}.cost`);
            const isFree = cost === 'Gratuit' || cost === 'Free' || cost === 'Kostenlos' || cost === '0%';
            return (
              <div
                key={row}
                className="grid grid-cols-3 px-6 py-4 text-sm items-center"
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span>{t(`rows.${row}.service`)}</span>
                <span className="text-center font-bold" style={{ color: isFree ? 'var(--color-primary)' : 'var(--color-accent)' }}>{cost}</span>
                <span className="text-right text-xs" style={{ color: 'var(--color-muted)' }}>{t(`rows.${row}.note`)}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--color-muted)' }}>{t('note')}</p>
        <div className="text-center mt-8">
          <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary">{t('cta')}</a>
        </div>
      </section>
    </>
  );
}
