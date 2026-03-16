import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FAQ — ImuChat Creators',
    description:
      'Toutes les réponses à vos questions sur le programme créateurs ImuChat. Programme, revenus, outils, droits d\'auteur.',
  };
}

export default async function FaqPage() {
  const t = await getTranslations('faq');

  const categories = [
    {
      title: t('cat1'),
      questions: [
        { q: t('q1'), a: t('a1') },
        { q: t('q2'), a: t('a2') },
        { q: t('q3'), a: t('a3') },
        { q: t('q4'), a: t('a4') },
      ],
    },
    {
      title: t('cat2'),
      questions: [
        { q: t('q5'), a: t('a5') },
        { q: t('q6'), a: t('a6') },
        { q: t('q7'), a: t('a7') },
        { q: t('q8'), a: t('a8') },
      ],
    },
    {
      title: t('cat3'),
      questions: [
        { q: t('q9'), a: t('a9') },
        { q: t('q10'), a: t('a10') },
        { q: t('q11'), a: t('a11') },
      ],
    },
    {
      title: t('cat4'),
      questions: [
        { q: t('q12'), a: t('a12') },
        { q: t('q13'), a: t('a13') },
        { q: t('q14'), a: t('a14') },
        { q: t('q15'), a: t('a15') },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black mb-4 text-gradient-cr">{t('title')}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((cat) => (
          <section key={cat.title}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
              {cat.title}
            </h2>
            <div className="space-y-3">
              {cat.questions.map(({ q, a }) => (
                <details
                  key={q}
                  className="cr-card group"
                  style={{ cursor: 'pointer' }}
                >
                  <summary
                    className="font-semibold text-sm list-none flex items-center justify-between gap-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <span>{q}</span>
                    <span
                      className="text-lg flex-shrink-0 transition-transform group-open:rotate-45"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      +
                    </span>
                  </summary>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
