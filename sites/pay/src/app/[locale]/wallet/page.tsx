import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';
import WalletPreview from '@/components/WalletPreview';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Wallet.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function WalletPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Wallet');

  const features = ['currencies', 'imucoins', 'unified', 'history', 'notifications', 'topup'] as const;
  const featureIcons: Record<string, string> = {
    currencies: '💱', imucoins: '🪙', unified: '📊', history: '🗂️', notifications: '🔔', topup: '⚡',
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {['EUR', 'USD', 'GBP', 'JPY', 'CHF'].map((cur) => (
                <span key={cur} className="py-trust-badge text-sm">{cur}</span>
              ))}
              <span className="py-trust-badge text-sm">ImuCoins</span>
            </div>
            <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary">
              {t('cta')}
            </a>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <WalletPreview />
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-10">{t('features.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f} className="py-card">
                <span className="text-3xl mb-3 block">{featureIcons[f]}</span>
                <h3 className="font-bold mb-2">{t(`features.${f}.title`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t(`features.${f}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl p-10" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)' }}>
          <span className="text-4xl mb-4 block">🪙</span>
          <h2 className="text-2xl font-bold mb-3">{t('features.imucoins.title')}</h2>
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>100 IC = 1€</p>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>{t('features.imucoins.desc')}</p>
          <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary">{t('cta')}</a>
        </div>
      </section>
    </>
  );
}
