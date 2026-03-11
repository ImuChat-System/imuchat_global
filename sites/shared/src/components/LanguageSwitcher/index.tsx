'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface Locale {
  code: string;
  label: string;
  flag?: string;
}

export interface LanguageSwitcherProps {
  /** Available locales */
  locales: Locale[];
  /** Current locale code */
  currentLocale: string;
  /** Whether to show flags */
  showFlags?: boolean;
  /** Label for screen readers */
  label?: string;
  /** Additional class names */
  className?: string;
}

export function LanguageSwitcher({
  locales,
  currentLocale,
  showFlags = true,
  label = 'Change language',
  className,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const currentLocaleObj = locales.find((l) => l.code === currentLocale);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocalizedPath = (localeCode: string) => {
    // Replace current locale in path with new locale
    const segments = pathname.split('/');
    if (locales.some((l) => l.code === segments[1])) {
      segments[1] = localeCode;
    } else {
      segments.splice(1, 0, localeCode);
    }
    return segments.join('/') || '/';
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
          'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
        )}
        aria-label={label}
        aria-expanded={isOpen}
      >
        {showFlags && currentLocaleObj?.flag ? (
          <span className="text-lg">{currentLocaleObj.flag}</span>
        ) : (
          <Globe className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{currentLocaleObj?.label || currentLocale}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {locales.map((locale) => (
            <Link
              key={locale.code}
              href={getLocalizedPath(locale.code)}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                locale.code === currentLocale
                  ? 'text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {showFlags && locale.flag && <span>{locale.flag}</span>}
              {locale.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
