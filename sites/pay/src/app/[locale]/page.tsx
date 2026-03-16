import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/navigation';
import { routing } from '@/navigation';
import TrustBar from '@/components/TrustBar';
import WalletPreview from '@/components/WalletPreview';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  const pillars = [
    { key: 'wallet', icon: '💳' },
    { key: 'send', icon: '💸' },
    { key: 'cards', icon: '🪪' },
    { key: 'savings', icon: '🏦' },
    { key: 'invest', icon: '📈' },
    { key: 'merchants', icon: '🏪' },
  ] as const;

  const testimonials = [
    { key: 't1' },
    { key: 't2' },
    { key: 't3' },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-gradient-py">{t('hero.title')}</span>
              <br />
              <span style={{ color: 'var(--color-text)' }}>{t('hero.title2')}</span>
              <br />
              <span style={{ color: 'var(--color-text)' }}>{t('hero.title3')}</span>
            </h1>
            <p className="text-lg mb-8 max-w-xl leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://app.imuchat.app"
                target="_blank"
                rel="noopener noreferrer"
                className="py-btn-primary"
              >
                {t('hero.cta')}
              </a>
              <Link href="/wallet" className="py-btn-ghost">
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <WalletPreview />
          </div>
        </div>
      </section>

      {/* TrustBar */}
      <TrustBar />

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">{t('pillars.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.key} className="py-card flex flex-col gap-3">
              <span className="text-3xl">{p.icon}</span>
              <h3 className="font-bold text-lg">{t(`pillars.${p.key}.title`)}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {t(`pillars.${p.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section
        className="py-16"
        style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">{t('comparison.title')}</h2>
          <p className="text-center text-lg mb-12 italic" style={{ color: 'var(--color-muted)' }}>
            &quot;{t('comparison.subtitle')}&quot;
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left" style={{ color: 'var(--color-muted)' }}>Fonctionnalité</th>
                  {(['revolut', 'lydia', 'paypal', 'imuchat'] as const).map((app) => (
                    <th
                      key={app}
                      className="py-3 px-4 text-center font-bold"
                      style={{ color: app === 'imuchat' ? 'var(--color-primary)' : 'var(--color-muted)' }}
                    >
                      {t(`comparison.${app}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['wallet', 'p2p', 'cards', 'invest', 'social', 'imucoins'] as const).map((feature, i) => (
                  <tr key={feature} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>{t(`comparison.features.${feature}`)}</td>
                    {['revolut', 'lydia', 'paypal', 'imuchat'].map((app) => (
                      <td key={app} className="py-3 px-4 text-center">
                        {app === 'imuchat' || (app === 'revolut' && ['wallet', 'p2p', 'cards', 'invest'].includes(feature)) || (app === 'lydia' && ['p2p'].includes(feature)) || (app === 'paypal' && ['p2p'].includes(feature)) ? (
                          <span style={{ color: '#059669', fontSize: '18px' }}>✓</span>
                        ) : (
                          <span style={{ color: '#374151', fontSize: '18px' }}>✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">{t('testimonials.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div key={item.key} className="py-card flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: 'var(--color-accent)', fontSize: '14px' }}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-muted)' }}>
                &quot;{t(`testimonials.${item.key}.text`)}&quot;
              </p>
              <div>
                <p className="font-semibold text-sm">{t(`testimonials.${item.key}.name`)}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t(`testimonials.${item.key}.age`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(5,150,105,0.05))' }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">{t('cta.title')}</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-muted)' }}>{t('cta.subtitle')}</p>
          <a
            href="https://app.imuchat.app"
            target="_blank"
            rel="noopener noreferrer"
            className="py-btn-primary text-lg"
          >
            {t('cta.button')}
          </a>
        </div>
      </section>
    </>
  );
}
