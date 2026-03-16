'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const locales = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ja', label: 'JA' },
  ];
  return (
    <div className="flex items-center gap-0.5">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          className="px-2 py-1 rounded text-xs font-medium transition-colors"
          style={{
            color: locale === code ? 'var(--color-primary)' : 'var(--color-muted)',
            fontWeight: locale === code ? 700 : 400,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
