'use client';

import { useRouter, usePathname } from '@/navigation';
import { useLocale } from 'next-intl';

const LOCALES = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => handleChange(l.code)}
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            locale === l.code
              ? 'text-white'
              : 'opacity-50 hover:opacity-80'
          }`}
          style={locale === l.code ? { background: 'var(--color-primary)' } : {}}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
