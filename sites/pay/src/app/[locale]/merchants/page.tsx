import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';
import ContactForm from '@/components/ContactForm';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Merchants.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function MerchantsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Merchants');

  const solutions = ['qr', 'nfc', 'terminal', 'dashboard', 'api', 'commission'] as const;
  const solutionIcons: Record<string, string> = { qr: '📱', nfc: '📡', terminal: '🖥️', dashboard: '📊', api: '🔌', commission: '💸' };
  const pricingFeatures = t.raw('pricing.features') as string[];

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-10">{t('solutions.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((s) => (
            <div key={s} className="py-card">
              <span className="text-3xl mb-3 block">{solutionIcons[s]}</span>
              <h3 className="font-bold mb-2">{t(`solutions.${s}.title`)}</h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-muted)' }}>{t(`solutions.${s}.desc`)}</p>
              {s === 'api' && (
                <a href="https://developers.imuchat.app" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {t('apiLink')} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('pricing.title')}</h2>
          <div className="py-12">
            <p className="text-7xl font-extrabold text-gradient-py">{t('pricing.rate')}</p>
            <p className="text-xl mt-2" style={{ color: 'var(--color-muted)' }}>{t('pricing.desc')}</p>
          </div>
          <ul className="flex flex-col gap-3 mb-8">
            {pricingFeatures.map((f: string, i: number) => (
              <li key={i} className="flex items-center justify-center gap-2">
                <span style={{ color: 'var(--color-primary)' }}>✓</span>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-4 text-center">{t('cta')}</h2>
        <p className="text-center mb-8" style={{ color: 'var(--color-muted)' }}>
          Remplissez le formulaire et notre équipe vous contactera sous 24h.
        </p>
        <ContactForm />
      </section>
    </>
  );
}
