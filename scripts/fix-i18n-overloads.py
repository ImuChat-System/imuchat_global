#!/usr/bin/env python3
"""Fix useTranslations overloads in all I18nProvider.tsx files."""
import re, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = glob.glob(os.path.join(ROOT, 'imu-*/src/providers/I18nProvider.tsx'))

OLD_BLOCK = r'''export function useTranslations\(namespace: string\): \(key: string\) => string;
export function useTranslations\(\): \{ t: \(namespace: string, key: string(?:, params\?: Record<string, string \| number>)?\) => string; locale: Locale \};
export function useTranslations\(namespace\?: string\) \{
  const \{ t, locale \} = useContext\(I18nContext\);
  if \(namespace\) \{
    return \(key: string\) => t\(namespace, key\);
  \}
  return \{ t, locale \};
\}'''

NEW_BLOCK = '''type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

export function useTranslations(namespace: string): TranslateFunction;
export function useTranslations(): { t: (namespace: string, key: string, params?: Record<string, string | number>) => string; locale: Locale };
export function useTranslations(namespace?: string) {
  const { t, locale } = useContext(I18nContext);
  if (namespace) {
    return ((key: string, params?: Record<string, string | number>) => t(namespace, key, params)) as TranslateFunction;
  }
  return { t, locale };
}'''

count = 0
for f in sorted(files):
    with open(f, 'r') as fh:
        src = fh.read()
    
    new_src = re.sub(OLD_BLOCK, NEW_BLOCK, src)
    
    if new_src != src:
        with open(f, 'w') as fh:
            fh.write(new_src)
        count += 1
        print(f'  ✓ Fixed: {os.path.relpath(f, ROOT)}')
    else:
        print(f'  - No match: {os.path.relpath(f, ROOT)}')

print(f'\n{count} files fixed')
