import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';
import FAQAccordion from '@/components/FAQAccordion';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'FAQ.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function FAQPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('FAQ');

  const categoryKeys = ['security', 'wallet', 'cards', 'payments', 'imucoins', 'invest', 'merchants', 'disputes'] as const;
  const categories = categoryKeys.map((key) => ({
    title: t(`categories.${key}.title`),
    questions: t.raw(`categories.${key}.questions`) as Array<{ q: string; a: string }>,
  }));

  return (
    <>
      <section className="py-20" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">{t('hero.title')}</h1>
          <p className="text-xl" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FAQAccordion categories={categories} />
      </section>
    </>
  );
}
