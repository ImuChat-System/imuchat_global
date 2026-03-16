import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CGU Créateurs — ImuChat Creators',
    description:
      'Conditions générales d\'utilisation pour les créateurs de contenu ImuChat. Propriété intellectuelle, monétisation, règles de contenu.',
  };
}

export default async function LegalPage() {
  const t = await getTranslations('legal');

  const sections = [
    { title: t('section1Title'), content: t('section1Content') },
    { title: t('section2Title'), content: t('section2Content') },
    { title: t('section3Title'), content: t('section3Content') },
    { title: t('section4Title'), content: t('section4Content') },
    { title: t('section5Title'), content: t('section5Content') },
    { title: t('section6Title'), content: t('section6Content') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto mb-2" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {t('lastUpdated')}
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((sec) => (
          <section key={sec.title} className="cr-card">
            <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-primary)' }}>
              {sec.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              {sec.content}
            </p>
          </section>
        ))}
      </div>

      <div
        className="mt-10 p-5 rounded-2xl text-center"
        style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {t('contact')}
        </p>
      </div>
    </div>
  );
}
