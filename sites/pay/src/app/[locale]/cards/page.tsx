import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';
import CardPreview from '@/components/CardPreview';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Cards.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function CardsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Cards');

  const virtualFeatures = t.raw('virtual.features') as string[];
  const physicalFeatures = t.raw('physical.features') as string[];
  const controls = ['block', 'limits', 'geo', 'cashback'] as const;
  const controlIcons: Record<string, string> = { block: '🔒', limits: '📊', geo: '🌍', cashback: '💰' };

  return (
    <>
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
              <p className="text-xl mb-8" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
              <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary">{t('cta')}</a>
            </div>
            <div className="flex-1 flex justify-center">
              <CardPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="py-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{t('virtual.title')}</h2>
                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>{t('virtual.subtitle')}</p>
              </div>
              <span className="text-4xl">💳</span>
            </div>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t('virtual.desc')}</p>
            <ul className="flex flex-col gap-2">
              {virtualFeatures.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--color-primary)' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary mt-6 block text-center">{t('cta')}</a>
          </div>

          <div className="py-card" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{t('physical.title')}</h2>
                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-accent)' }}>{t('physical.subtitle')}</p>
              </div>
              <span className="text-4xl">🪪</span>
            </div>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t('physical.desc')}</p>
            <ul className="flex flex-col gap-2">
              {physicalFeatures.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--color-primary)' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary mt-6 block text-center">{t('cta')}</a>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-10">{t('controls.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {controls.map((c) => (
              <div key={c} className="py-card">
                <span className="text-3xl mb-3 block">{controlIcons[c]}</span>
                <h3 className="font-bold mb-2">{t(`controls.${c}.title`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t(`controls.${c}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
