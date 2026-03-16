import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Savings.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function SavingsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('Savings');

  const vaults = [
    { name: 'Vacances Ibiza', emoji: '🏖️', current: 850, goal: 1500, color: '#059669' },
    { name: 'Fonds urgence', emoji: '🛡️', current: 2200, goal: 3000, color: '#f59e0b' },
    { name: 'Nouveau Mac', emoji: '💻', current: 650, goal: 1299, color: '#8b5cf6' },
  ];

  const features = ['vaults', 'round', 'scheduled', 'progress'] as const;
  const featureIcons: Record<string, string> = { vaults: '🏦', round: '🔄', scheduled: '⏰', progress: '📊' };

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

      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          {vaults.map((vault) => {
            const pct = Math.round((vault.current / vault.goal) * 100);
            return (
              <div key={vault.name} className="py-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{vault.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{vault.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {vault.current.toLocaleString('en-US')} € / {vault.goal.toLocaleString('en-US')} €
                      </p>
                    </div>
                  </div>
                  <span className="font-bold" style={{ color: vault.color }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: vault.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f} className="py-card">
                <span className="text-3xl mb-3 block">{featureIcons[f]}</span>
                <h3 className="font-bold mb-2">{t(`features.${f}.title`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{t(`features.${f}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
