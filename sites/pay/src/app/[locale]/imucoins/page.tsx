import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ImuCoins.meta' });
  return { title: t('title'), description: t('description') };
}

const PACKAGES = [
  { ic: 100, eur: '0,99', badge: null, bonus: null },
  { ic: 500, eur: '4,99', badge: null, bonus: null },
  { ic: 1200, eur: '9,99', badge: 'popular', bonus: '20%' },
  { ic: 3000, eur: '24,99', badge: null, bonus: null },
  { ic: 6500, eur: '49,99', badge: 'pro', bonus: null },
];

export default async function ImuCoinsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('ImuCoins');

  const whatFeatures = ['fixed', 'noCrypto', 'ecosystem'] as const;
  const uses = ['store', 'arena', 'feed', 'gaming', 'chat'] as const;
  const earnMethods = ['buy', 'earn', 'receive'] as const;
  const earnIcons: Record<string, string> = { buy: '🛒', earn: '🏆', receive: '🎁' };
  const useIcons: Record<string, string> = { store: '🏪', arena: '⚔️', feed: '🎥', gaming: '🎮', chat: '💬' };

  return (
    <>
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
          <p className="text-xl mb-4" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-2xl font-extrabold mb-8" style={{ background: 'rgba(5,150,105,0.15)', color: 'var(--color-primary)' }}>
            <span>🪙</span> 100 IC = 1€
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">{t('what.title')}</h2>
        <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t('what.desc')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {whatFeatures.map((f) => (
            <div key={f} className="py-card text-center">
              <h3 className="font-bold mb-2">{t(`what.features.${f}.title`)}</h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{t(`what.features.${f}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-10">{t('uses.title')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {uses.map((u) => (
              <div key={u} className="py-card text-center">
                <span className="text-3xl block mb-2">{useIcons[u]}</span>
                <h3 className="font-bold text-sm mb-1">{t(`uses.${u}.title`)}</h3>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t(`uses.${u}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center">{t('packages.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PACKAGES.map((pkg) => (
            <div key={pkg.ic} className="py-card flex flex-col items-center text-center relative" style={pkg.badge ? { borderColor: 'var(--color-primary)' } : {}}>
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: pkg.badge === 'pro' ? '#f59e0b' : 'var(--color-primary)' }}>
                  {pkg.badge === 'popular' ? t('packages.popular') : 'Pro'}
                </span>
              )}
              <span className="text-3xl mb-1">🪙</span>
              <p className="text-2xl font-extrabold">{pkg.ic.toLocaleString('en-US')} IC</p>
              {pkg.bonus && (
                <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>+{pkg.bonus} {t('packages.bonus')}</p>
              )}
              <p className="text-lg font-bold mt-3" style={{ color: 'var(--color-accent)' }}>{pkg.eur} €</p>
              <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary mt-4 text-sm w-full">{t('cta')}</a>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">{t('earn.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {earnMethods.map((m) => (
              <div key={m} className="py-card text-center">
                <span className="text-3xl block mb-3">{earnIcons[m]}</span>
                <h3 className="font-bold mb-2">{t(`earn.${m}.title`)}</h3>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{t(`earn.${m}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl p-8" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)' }}>
          <h2 className="text-2xl font-bold mb-3">{t('conversion.title')}</h2>
          <p className="mb-5" style={{ color: 'var(--color-muted)' }}>{t('conversion.desc')}</p>
          <a href="https://creators.imuchat.app" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            {t('conversion.link')} →
          </a>
        </div>
      </section>
    </>
  );
}
