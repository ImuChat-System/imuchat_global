import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Send.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function SendPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Send');

  const features = ['send', 'request', 'split', 'pool', 'instant', 'international'] as const;
  const featureIcons: Record<string, string> = {
    send: '➡️', request: '📨', split: '✂️', pool: '🎯', instant: '⚡', international: '🌍',
  };

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

      <section className="max-w-md mx-auto px-4 py-8">
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-bold mb-4 text-center">Envoyer de l&apos;argent</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'var(--color-primary)' }}>S</div>
            <div>
              <p className="font-semibold text-sm">Sophie Martin</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>@sophie.m</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>50,00 €</p>
              <p className="text-xs" style={{ color: '#059669' }}>✓ Instantané</p>
            </div>
          </div>
          <div className="text-center py-2">
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Commission : 0,00 €</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f} className="py-card">
              <span className="text-3xl mb-3 block">{featureIcons[f]}</span>
              <h3 className="font-bold mb-2">{t(`features.${f}.title`)}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t(`features.${f}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
