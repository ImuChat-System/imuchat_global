import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';
import ContactForm from '@/components/ContactForm';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Contact.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Contact');

  return (
    <>
      <section className="py-20" style={{ background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">{t('hero.title')}</h1>
          <p className="text-xl" style={{ color: 'var(--color-muted)' }}>{t('hero.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="flex flex-col gap-6">
            <div className="py-card">
              <p className="font-bold mb-1">{t('info.phone.title')}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{t('info.phone.value')}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{t('info.phone.hours')}</p>
            </div>
            <div className="py-card">
              <p className="font-bold mb-1">{t('info.email.title')}</p>
              <a href={`mailto:${t('info.email.value')}`} className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                {t('info.email.value')}
              </a>
            </div>
            <div className="py-card">
              <p className="font-bold mb-1">{t('info.chat.title')}</p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{t('info.chat.value')}</p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
