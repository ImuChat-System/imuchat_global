import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Legal.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function LegalPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Legal');

  const sections = ['intro', 'services', 'eligibility', 'limits', 'liability', 'closure', 'invest_warning', 'contact'] as const;

  return (
    <>
      <section className="py-20" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.05) 0%, transparent 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">{t('hero.title')}</h1>
          <p className="text-base" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section}>
              <h2 className="text-xl font-bold mb-3">{t(`sections.${section}.title`)}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t(`sections.${section}.content`)}</p>
              {section === 'invest_warning' && (
                <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <p className="text-xs" style={{ color: '#fca5a5' }}>
                    ⚠️ Les investissements comportent des risques de perte en capital. Ce document est fourni à titre informatif uniquement.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-xl" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            ImuChat SAS — Capital social : 10 000 € — RCS Paris B XXX XXX XXX — SIREN : XXX XXX XXX
            <br />
            Siège social : 1 rue de la Fintech, 75001 Paris, France
            <br />
            ImuPay est en cours d&apos;obtention de la licence EME (Établissement de Monnaie Électronique) auprès de l&apos;ACPR.
          </p>
        </div>
      </section>
    </>
  );
}
