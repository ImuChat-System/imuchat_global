import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';
import TrustBar from '@/components/TrustBar';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Security.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function SecurityPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Security');

  const features = ['encryption', 'pci', 'eme', 'segregated', 'secure3d', 'antifraud', 'insurance', 'audit'] as const;
  const featureIcons: Record<string, string> = {
    encryption: '🔐', pci: '🏆', eme: '📋', segregated: '🏛️', secure3d: '🔒', antifraud: '🤖', insurance: '🛡️', audit: '🔍',
  };

  return (
    <>
      <section className="py-24" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="py-badge mb-4 inline-flex">{t('hero.badge')}</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
          <p className="text-xl mb-8" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
        </div>
      </section>

      <TrustBar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f} className="py-card">
              <span className="text-3xl mb-3 block">{featureIcons[f]}</span>
              <h3 className="font-bold mb-2">{t(`features.${f}.title`)}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t(`features.${f}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <a href="https://app.imuchat.app" target="_blank" rel="noopener noreferrer" className="py-btn-primary">{t('cta')}</a>
      </section>
    </>
  );
}
