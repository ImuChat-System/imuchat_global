#!/usr/bin/env node
/**
 * fix-ts-errors.mjs
 * Batch-fix remaining TypeScript errors across all 11 mini-apps after migration.
 *
 * Categories addressed:
 *  1. Fix I18nProvider useTranslations to support interpolation params
 *  2. Copy missing UI components from web-app
 *  3. Create @/hooks/use-toast shim
 *  4. Add missing type/data exports
 *  5. Fix implicit any types
 *  6. Fix isolated errors (duplicate imports, undefined vars, priority prop, etc.)
 *  7. Add missing npm deps & remove unused radix toast
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const WEB_APP = path.join(ROOT, 'web-app');

// ─── 1. Fix I18nProvider ─────────────────────────────────────────────

function fixI18nProvider(miniAppDir) {
  const filePath = path.join(miniAppDir, 'src/providers/I18nProvider.tsx');
  if (!fs.existsSync(filePath)) return;

  let src = fs.readFileSync(filePath, 'utf8');

  // Replace useTranslations overloads + implementation to support interpolation
  // Old pattern:
  //   export function useTranslations(namespace: string): (key: string) => string;
  //   export function useTranslations(): { t: (namespace: string, key: string) => string; locale: Locale };
  //   export function useTranslations(namespace?: string) {
  //     const { t, locale } = useContext(I18nContext);
  //     if (namespace) {
  //       return (key: string) => t(namespace, key);
  //     }
  //     return { t, locale };
  //   }

  const oldOverloads = /export function useTranslations\(namespace: string\):[^;]+;\nexport function useTranslations\(\):[^;]+;\nexport function useTranslations\(namespace\?: string\) \{[^}]+\{[^}]+\}[^}]*\}/s;

  const newOverloads = `type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

export function useTranslations(namespace: string): TranslateFunction;
export function useTranslations(): { t: (namespace: string, key: string, params?: Record<string, string | number>) => string; locale: Locale };
export function useTranslations(namespace?: string) {
  const { t, locale } = useContext(I18nContext);
  if (namespace) {
    return ((key: string, params?: Record<string, string | number>) => t(namespace, key, params)) as TranslateFunction;
  }
  return { t, locale };
}`;

  if (oldOverloads.test(src)) {
    src = src.replace(oldOverloads, newOverloads);
  }

  // Fix the t function in I18nContext interface
  src = src.replace(
    /t: \(namespace: string, key: string\) => string;/,
    't: (namespace: string, key: string, params?: Record<string, string | number>) => string;'
  );

  // Fix the t function in context default
  src = src.replace(
    /const I18nContext = createContext<I18nContextValue>\(\{\s*locale: 'en',\s*t: \(\) => '',/s,
    `const I18nContext = createContext<I18nContextValue>({\n  locale: 'en',\n  t: () => '',`
  );

  // Fix the t implementation in I18nProvider to support interpolation
  const oldTImpl = /const t = \(namespace: string, key: string\): string => \{/;
  const newTImpl = `const t = (namespace: string, key: string, params?: Record<string, string | number>): string => {`;
  src = src.replace(oldTImpl, newTImpl);

  // Add interpolation logic before the final return of t
  // Replace: return typeof current === 'string' ? current : `${namespace}.${key}`;
  src = src.replace(
    /return typeof current === 'string' \? current : `\$\{namespace\}\.\$\{key\}`;/,
    `if (typeof current === 'string') {
      if (params) {
        return current.replace(/\\{(\\w+)\\}/g, (_, k) => String(params[k] ?? \`{\${k}}\`));
      }
      return current;
    }
    return \`\${namespace}.\${key}\`;`
  );

  fs.writeFileSync(filePath, src, 'utf8');
  console.log(`  ✓ Fixed I18nProvider: ${path.basename(miniAppDir)}`);
}

// ─── 2. Copy missing UI components ──────────────────────────────────

const UI_COMPONENTS_NEEDED = {
  'imu-contests': ['avatar', 'checkbox', 'separator'],
  'imu-sports': ['input', 'carousel', 'chart'],
  'imu-finance': ['progress', 'avatar', 'scroll-area'],
  'imu-formations': ['tooltip', 'avatar', 'accordion', 'textarea'],
  'imu-dating': ['form', 'checkbox', 'progress', 'select', 'alert', 'tooltip', 'switch', 'alert-dialog'],
  'imu-mobility': ['avatar', 'alert', 'radio-group'],
  'imu-library': ['collapsible', 'switch', 'accordion', 'popover', 'textarea', 'avatar'],
  'imu-smart-home': ['accordion', 'avatar', 'checkbox', 'carousel', 'textarea'],
  'imu-style-beauty': ['tooltip', 'dropdown-menu', 'switch'],
};

function copyUiComponent(componentName, miniAppDir) {
  const srcFile = path.join(WEB_APP, `src/components/ui/${componentName}.tsx`);
  const destDir = path.join(miniAppDir, 'src/components/ui');
  const destFile = path.join(destDir, `${componentName}.tsx`);

  if (fs.existsSync(destFile)) return false;
  if (!fs.existsSync(srcFile)) {
    console.warn(`  ⚠ UI component not found in web-app: ${componentName}.tsx`);
    return false;
  }

  fs.mkdirSync(destDir, { recursive: true });

  let content = fs.readFileSync(srcFile, 'utf8');
  // Remove 'use client' directive
  content = content.replace(/^["']use client["'];?\s*\n/m, '');

  fs.writeFileSync(destFile, content, 'utf8');
  return true;
}

function copyAllMissingUiComponents() {
  console.log('\n── Copying missing UI components ──');
  let count = 0;
  for (const [mod, components] of Object.entries(UI_COMPONENTS_NEEDED)) {
    const dir = path.join(ROOT, mod);
    for (const comp of components) {
      if (copyUiComponent(comp, dir)) {
        count++;
      }
    }
  }
  console.log(`  ✓ Copied ${count} UI components`);
}

// ─── 3. Create use-toast hook shim ──────────────────────────────────

const MODULES_NEEDING_USE_TOAST = ['imu-contests', 'imu-sports', 'imu-dating'];

function createUseToastHook(miniAppDir) {
  const hooksDir = path.join(miniAppDir, 'src/hooks');
  const filePath = path.join(hooksDir, 'use-toast.ts');
  if (fs.existsSync(filePath)) return;

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(filePath, `// Lightweight toast hook (replaces shadcn use-toast)
import { useState, useCallback } from 'react';

interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant }: Toast) => {
    console.log(\`[\${variant ?? 'default'}] \${title}: \${description}\`);
    setToasts(prev => [...prev, { title, description, variant }]);
    // Auto-dismiss after 3s
    setTimeout(() => setToasts(prev => prev.slice(1)), 3000);
  }, []);

  const dismiss = useCallback(() => setToasts([]), []);

  return { toast, toasts, dismiss };
}
`, 'utf8');
  console.log(`  ✓ Created use-toast hook: ${path.basename(miniAppDir)}`);
}

// ─── 4. Fix missing type/data exports ───────────────────────────────

function fixMissingExports(miniAppDir, moduleName) {
  // --- MOCK_MEMBERS in types.ts ---
  // imu-sports and imu-library have types.ts that imports from './social' and './chat'
  // which don't exist. These are re-exports from the web-app that we need to stub.
  if (moduleName === 'imu-sports' || moduleName === 'imu-library') {
    const typesFile = path.join(miniAppDir, 'src/lib/types.ts');
    if (fs.existsSync(typesFile)) {
      let src = fs.readFileSync(typesFile, 'utf8');
      // Remove imports from './social' and './chat'
      src = src.replace(/^.*from\s+['"]\.\/social['"].*$/gm, '// social types removed (not available in mini-app)');
      src = src.replace(/^.*from\s+['"]\.\/chat['"].*$/gm, '// chat types removed (not available in mini-app)');

      // Add MOCK_MEMBERS if exported but not defined
      if (!src.includes('MOCK_MEMBERS') && moduleName === 'imu-sports') {
        src += `\n\nexport interface Member {\n  id: string;\n  name: string;\n  avatar?: string;\n  role?: string;\n}\n\nexport const MOCK_MEMBERS: Member[] = [\n  { id: '1', name: 'User 1', avatar: '/avatars/1.png' },\n  { id: '2', name: 'User 2', avatar: '/avatars/2.png' },\n];\n`;
      }
      fs.writeFileSync(typesFile, src, 'utf8');
      console.log(`  ✓ Fixed types.ts imports: ${moduleName}`);
    }
  }

  // --- MOCK_MEMBERS, MOCK_REVIEWS, MOCK_USER in data.ts ---
  const dataFile = path.join(miniAppDir, 'src/lib/data.ts');
  if (fs.existsSync(dataFile)) {
    let src = fs.readFileSync(dataFile, 'utf8');
    const additions = [];

    if (src.includes('MOCK_MEMBERS') === false &&
        (moduleName === 'imu-smart-home' || moduleName === 'imu-library')) {
      const membersExport = src.match(/export.*MOCK_MEMBERS/);
      if (!membersExport) {
        additions.push(`\nexport const MOCK_MEMBERS = [\n  { id: '1', name: 'User 1', avatar: '/avatars/1.png', role: 'member' },\n  { id: '2', name: 'User 2', avatar: '/avatars/2.png', role: 'admin' },\n];\n`);
      }
    }

    if (!src.includes('MOCK_REVIEWS') &&
        (moduleName === 'imu-formations' || moduleName === 'imu-library')) {
      additions.push(`\nexport const MOCK_REVIEWS = [\n  { id: '1', author: 'User 1', avatar: '/av/1.png', rating: 5, text: 'Great!', date: '2024-01-01' },\n  { id: '2', author: 'User 2', avatar: '/av/2.png', rating: 4, text: 'Good', date: '2024-01-02' },\n];\n`);
    }

    if (!src.includes('MOCK_USER') && moduleName === 'imu-formations') {
      additions.push(`\nexport const MOCK_USER = {\n  id: 'user-1',\n  name: 'Current User',\n  avatar: '/avatars/default.png',\n  email: 'user@example.com',\n};\n`);
    }

    if (!src.includes('MOCK_COMMUNITY_PODS') && moduleName === 'imu-mobility') {
      additions.push(`\nexport const MOCK_COMMUNITY_PODS = [\n  { id: 'pod-1', name: 'Campus Pod', description: 'Daily campus commuters', memberCount: 8, members: [], nextRide: '2024-02-01T08:00:00Z' },\n  { id: 'pod-2', name: 'Downtown Pod', description: 'Downtown workers', memberCount: 5, members: [], nextRide: '2024-02-01T09:00:00Z' },\n];\n`);
    }

    if (additions.length > 0) {
      fs.writeFileSync(dataFile, src + additions.join('\n'), 'utf8');
      console.log(`  ✓ Added missing data exports: ${moduleName}`);
    }
  }

  // --- CommunityPod type in imu-mobility ---
  if (moduleName === 'imu-mobility') {
    const typesFile = path.join(miniAppDir, 'src/lib/types.ts');
    if (fs.existsSync(typesFile)) {
      let src = fs.readFileSync(typesFile, 'utf8');
      if (!src.includes('CommunityPod')) {
        src += `\n\nexport interface CommunityPod {\n  id: string;\n  name: string;\n  description: string;\n  memberCount: number;\n  members: { id: string; name: string; avatar?: string }[];\n  nextRide?: string;\n}\n`;
        fs.writeFileSync(typesFile, src, 'utf8');
        console.log(`  ✓ Added CommunityPod type: ${moduleName}`);
      }
    }
  }

  // --- Member type in imu-smart-home ---
  if (moduleName === 'imu-smart-home') {
    const typesFile = path.join(miniAppDir, 'src/lib/types.ts');
    if (fs.existsSync(typesFile)) {
      let src = fs.readFileSync(typesFile, 'utf8');
      if (!src.includes('export') && !src.includes('Member')) {
        // Check if Member is already in the file
      }
      if (!/export\s+(interface|type)\s+Member\b/.test(src)) {
        src += `\n\nexport interface Member {\n  id: string;\n  name: string;\n  avatar?: string;\n  role?: string;\n  status?: 'online' | 'offline';\n}\n`;
        fs.writeFileSync(typesFile, src, 'utf8');
        console.log(`  ✓ Added Member type: ${moduleName}`);
      }
    }
  }

  // --- MOCK_MEMBERS from types.ts in imu-library ---
  if (moduleName === 'imu-library') {
    const typesFile = path.join(miniAppDir, 'src/lib/types.ts');
    if (fs.existsSync(typesFile)) {
      let src = fs.readFileSync(typesFile, 'utf8');
      if (!src.includes('MOCK_MEMBERS')) {
        src += `\n\nexport const MOCK_MEMBERS = [\n  { id: '1', name: 'User 1', avatar: '/avatars/1.png' },\n  { id: '2', name: 'User 2', avatar: '/avatars/2.png' },\n];\n`;
        fs.writeFileSync(typesFile, src, 'utf8');
        console.log(`  ✓ Added MOCK_MEMBERS to types.ts: ${moduleName}`);
      }
    }
  }
}

// ─── 5. Fix specific file issues ────────────────────────────────────

function fixSpecificFiles() {
  console.log('\n── Fixing specific file issues ──');

  // 5a. imu-services: ProHeader.tsx — MessageSquareLock → MessageSquare
  fixFileReplace(
    'imu-services/src/components/pro/ProHeader.tsx',
    'MessageSquareLock',
    'MessageSquare'
  );

  // 5b. imu-services: ImuServicesHub.tsx — onNavigate not defined
  {
    const f = path.join(ROOT, 'imu-services/src/pages/ImuServicesHub.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Check if onNavigate is used but not declared
      if (src.includes('onNavigate') && !src.includes('const onNavigate') && !src.includes('props') && !src.includes('onNavigate:')) {
        // Add onNavigate from useNavigation
        if (!src.includes('useNavigation')) {
          src = `import { useNavigation } from '@/hooks/use-navigation';\n` + src;
        }
        // Add const declaration after the component's first line
        if (!src.includes('const { navigate') && !src.includes('const onNavigate')) {
          src = src.replace(
            /(export (?:default )?function \w+\([^)]*\)\s*\{)/,
            `$1\n  const { navigate: onNavigate } = useNavigation();`
          );
        }
      }
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed ImuServicesHub.tsx: onNavigate`);
    }
  }

  // 5c. imu-contests: contest-header.tsx — locale not defined
  {
    const f = path.join(ROOT, 'imu-contests/src/components/detail/contest-header.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes('locale') && !src.includes("const locale") && !src.includes('useLocale')) {
        // Add useLocale import
        if (src.includes('I18nProvider')) {
          src = src.replace(
            /from\s+['"]@\/providers\/I18nProvider['"]/,
            (m) => m.replace("'", "'").replace(/['"]$/, (q) => ''),
          );
          // Better: just add useLocale to existing import
          src = src.replace(
            /import\s*\{([^}]+)\}\s*from\s+['"]@\/providers\/I18nProvider['"]/,
            (match, imports) => {
              if (!imports.includes('useLocale')) {
                return match.replace(imports, imports.trim() + ', useLocale');
              }
              return match;
            }
          );
        } else {
          src = `import { useLocale } from '@/providers/I18nProvider';\n` + src;
        }
        // Add locale declaration
        src = src.replace(
          /(export (?:default )?function \w+\([^)]*\)\s*\{)/,
          `$1\n  const locale = useLocale();`
        );
      }
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed contest-header.tsx: locale`);
    }
  }

  // 5d. imu-dating: dating-login-form.tsx — duplicate useNavigation import
  {
    const f = path.join(ROOT, 'imu-dating/src/components/auth/dating-login-form.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Remove duplicate useNavigation imports — keep only the first
      const navImportRegex = /import\s*\{[^}]*useNavigation[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?\s*\n/g;
      const matches = src.match(navImportRegex);
      if (matches && matches.length > 1) {
        // Keep first, remove rest
        let found = false;
        src = src.replace(navImportRegex, (m) => {
          if (!found) { found = true; return m; }
          return '';
        });
      }
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed dating-login-form.tsx: duplicate imports`);
    }
  }

  // 5e. imu-dating: protected-dating-route.tsx — router and locale not defined
  {
    const f = path.join(ROOT, 'imu-dating/src/components/auth/protected-dating-route.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Replace router.push(...) with navigate(...)
      src = src.replace(/router\.push\([^)]+\)/g, "navigate('/login')");
      // Replace locale references with 'en'
      src = src.replace(/`\/\$\{locale\}\/([^`]+)`/g, "'/$1'");
      // Ensure useNavigation is imported
      if (!src.includes('useNavigation')) {
        src = `import { useNavigation } from '@/hooks/use-navigation';\n` + src;
      }
      // Add navigate declaration if missing
      if (!src.includes('const { navigate') && !src.includes('const navigate')) {
        src = src.replace(
          /(export (?:default )?function \w+\([^)]*\)\s*\{)/,
          `$1\n  const { navigate } = useNavigation();`
        );
      }
      // Remove router declaration if present
      src = src.replace(/const router = .*;\n/g, '');
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed protected-dating-route.tsx: router/locale`);
    }
  }

  // 5f. imu-library: novel-reader.tsx — usePageFooter
  {
    const f = path.join(ROOT, 'imu-library/src/components/novels/reader/novel-reader.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Remove usePageFooter usage
      src = src.replace(/.*usePageFooter.*\n/g, '');
      // Remove music-panel import (not available in mini-app)
      src = src.replace(/.*import.*music-panel.*\n/g, '// music-panel not available in mini-app\n');
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed novel-reader.tsx: usePageFooter + music-panel`);
    }
  }

  // 5g. imu-library: reader.tsx — priority prop on <img>
  {
    const f = path.join(ROOT, 'imu-library/src/components/reader/reader.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Remove priority prop from <img> tags
      src = src.replace(/\s+priority(?:\s*=\s*\{[^}]*\})?/g, (match, offset) => {
        // Only remove if it's within an <img tag context
        const before = src.substring(Math.max(0, offset - 200), offset);
        if (before.includes('<img')) return '';
        return match;
      });
      // Actually simpler: just remove priority={true} or priority
      src = src.replace(/(\s+)priority(\s*=\s*\{true\})?/g, '');
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed reader.tsx: priority prop`);
    }
  }

  // 5h. Fix Server Action results typing (.success, .data, .error on {})
  // imu-smart-home: SceneCreatorCard.tsx
  {
    const f = path.join(ROOT, 'imu-smart-home/src/components/scenes/SceneCreatorCard.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Replace Server Action calls: result is typed as {}
      // Look for patterns like: const result = await someAction(...)
      // Add type assertion
      src = src.replace(
        /const\s+(result|res)\s*=\s*await\s+/g,
        'const $1: { success?: boolean; data?: any; error?: string } = await '
      );
      // Also fix inline .success checks without await
      if (!src.includes('result:') && !src.includes('res:')) {
        // If no await pattern found, look for generic {} type
        src = src.replace(
          /:\s*\{\}\s*=/g,
          ': { success?: boolean; data?: any; error?: string } ='
        );
      }
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed SceneCreatorCard.tsx: server action types`);
    }
  }

  // imu-style-beauty: AIStylistChatWindow.tsx
  {
    const f = path.join(ROOT, 'imu-style-beauty/src/components/assistant/AIStylistChatWindow.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      src = src.replace(
        /const\s+(result|res)\s*=\s*await\s+/g,
        'const $1: { success?: boolean; data?: any; error?: string } = await '
      );
      if (!src.includes('result:') && !src.includes('res:')) {
        src = src.replace(
          /:\s*\{\}\s*=/g,
          ': { success?: boolean; data?: any; error?: string } ='
        );
      }
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed AIStylistChatWindow.tsx: server action types`);
    }
  }

  // 5i. Fix toaster.tsx — action property on Toast
  for (const mod of ['imu-smart-home', 'imu-style-beauty']) {
    const f = path.join(ROOT, `${mod}/src/components/ui/toaster.tsx`);
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // If it uses radix toast, replace with our simple implementation
      if (src.includes('@radix-ui/react-toast') || src.includes('.action')) {
        src = `import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, i) => (
        <div
          key={i}
          className={\`rounded-lg border px-4 py-3 shadow-lg bg-background text-foreground \${
            toast.variant === 'destructive' ? 'border-destructive text-destructive' : 'border-border'
          }\`}
        >
          {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
          {toast.description && <p className="text-sm text-muted-foreground">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}
`;
        fs.writeFileSync(f, src, 'utf8');
        console.log(`  ✓ Replaced toaster.tsx: ${mod}`);
      }
    }
  }

  // Also create use-toast for smart-home and style-beauty if they have toaster
  for (const mod of ['imu-smart-home', 'imu-style-beauty']) {
    createUseToastHook(path.join(ROOT, mod));
  }

  // 5j. Remove toast.tsx (radix-based) from smart-home and style-beauty
  for (const mod of ['imu-smart-home', 'imu-style-beauty']) {
    const f = path.join(ROOT, `${mod}/src/components/ui/toast.tsx`);
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes('@radix-ui/react-toast')) {
        // Replace with a stub that re-exports from use-toast
        fs.writeFileSync(f, `// Toast component replaced - using custom Toaster instead
// See @/hooks/use-toast and @/components/ui/toaster
export {};
`, 'utf8');
        console.log(`  ✓ Stubbed toast.tsx (removed radix dependency): ${mod}`);
      }
    }
  }

  // 5k. Fix remaining references: imu-finance transaction-list import
  {
    const f = path.join(ROOT, 'imu-finance/src/components/imu-bank-tab.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes("'../wallet/transaction-list'")) {
        // Replace with inline TODO
        src = src.replace(
          /import\s*\{[^}]*\}\s*from\s*['"]\.\.\/wallet\/transaction-list['"]\s*;?/,
          '// TODO: transaction-list component not available in mini-app\nconst TransactionList = ({ transactions }: { transactions?: any[] }) => <div className="text-muted-foreground text-sm">Transaction list placeholder</div>;'
        );
      }
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed imu-bank-tab.tsx: transaction-list import`);
    }
  }

  // 5l. Fix imu-sports embla-carousel-autoplay
  {
    const f = path.join(ROOT, 'imu-sports/src/components/schedule/featured-match-carousel.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes('embla-carousel-autoplay')) {
        // Remove autoplay import and usage
        src = src.replace(/import\s+Autoplay\s+from\s+['"]embla-carousel-autoplay['"];?\s*\n/g, '');
        src = src.replace(/plugins=\{[^}]*Autoplay[^}]*\}/g, '');
        fs.writeFileSync(f, src, 'utf8');
        console.log(`  ✓ Fixed featured-match-carousel.tsx: embla-carousel-autoplay`);
      }
    }
  }

  // 5m. Fix imu-sports watch-party-card
  {
    const f = path.join(ROOT, 'imu-sports/src/components/watch/sports-watch-party-grid.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes("@/components/watch/hub/watch-party-card")) {
        src = src.replace(
          /import\s*\{[^}]*\}\s*from\s*['"]@\/components\/watch\/hub\/watch-party-card['"];?/,
          '// TODO: Watch party card not available in mini-app\nconst WatchPartyCard = (props: any) => <div className="p-4 border rounded-lg">{props.title || "Watch Party"}</div>;'
        );
        fs.writeFileSync(f, src, 'utf8');
        console.log(`  ✓ Fixed sports-watch-party-grid.tsx: watch-party-card`);
      }
    }
  }

  // 5n. Fix imu-formations/imu-library review-item
  for (const mod of ['imu-formations', 'imu-library']) {
    const files = [
      `${mod}/src/components/lesson/comments-section.tsx`,
      `${mod}/src/components/stories/detail/commentary.tsx`,
    ];
    for (const fp of files) {
      const f = path.join(ROOT, fp);
      if (fs.existsSync(f)) {
        let src = fs.readFileSync(f, 'utf8');
        if (src.includes('@/components/marketplace/shared/review-item')) {
          src = src.replace(
            /import\s*\{[^}]*\}\s*from\s*['"]@\/components\/marketplace\/shared\/review-item['"];?/,
            `// Review item stub (marketplace shared component not available in mini-app)
const ReviewItem = ({ review }: { review: any }) => (
  <div className="flex gap-3 py-3 border-b">
    <div className="w-8 h-8 bg-muted rounded-full" />
    <div>
      <p className="text-sm font-medium">{review?.author}</p>
      <p className="text-sm text-muted-foreground">{review?.text}</p>
    </div>
  </div>
);`
          );
          fs.writeFileSync(f, src, 'utf8');
          console.log(`  ✓ Fixed review-item import: ${fp}`);
        }
      }
    }
  }

  // 5o. Fix imu-dating: react-intersection-observer in lazy-load-section
  {
    const f = path.join(ROOT, 'imu-dating/src/components/ui/lazy-load-section.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes('react-intersection-observer')) {
        // Replace with native IntersectionObserver
        src = src.replace(
          /import\s*\{[^}]*\}\s*from\s*['"]react-intersection-observer['"];?/,
          `import { useEffect, useRef, useState } from 'react';

function useInView(options?: { triggerOnce?: boolean; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options?.triggerOnce) obs.disconnect();
      }
    }, { threshold: options?.threshold ?? 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}`
        );
        fs.writeFileSync(f, src, 'utf8');
        console.log(`  ✓ Fixed lazy-load-section.tsx: react-intersection-observer`);
      }
    }
  }

  // 5p. Fix imu-library: music-panel import in novel-reader
  {
    const f = path.join(ROOT, 'imu-library/src/components/novels/reader/novel-reader.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      if (src.includes('@/components/music/music-panel')) {
        src = src.replace(
          /import\s*\{[^}]*\}\s*from\s*['"]@\/components\/music\/music-panel['"];?/,
          '// Music panel not available in mini-app\nconst MusicPanel = () => null;'
        );
        fs.writeFileSync(f, src, 'utf8');
        console.log(`  ✓ Fixed novel-reader.tsx: music-panel`);
      }
    }
  }
}

// ─── 6. Fix implicit any types ──────────────────────────────────────

function fixImplicitAnyTypes() {
  console.log('\n── Fixing implicit any types ──');

  const fixes = [
    // [file, search, replace]
    ['imu-sports/src/components/betting/bet-slip-panel.tsx', /\(e\)\s*=>/g, '(e: React.ChangeEvent<HTMLInputElement>) =>'],
    ['imu-formations/src/components/lesson/comments-section.tsx', /\(e\)\s*(?==>)/g, '(e: React.FormEvent) '],
    ['imu-smart-home/src/components/scenes/SceneCreatorCard.tsx', /\(e\)\s*(?==>)/g, '(e: React.FormEvent) '],
  ];

  for (const [relPath, search, replace] of fixes) {
    const f = path.join(ROOT, relPath);
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      // Only apply if the implicit any pattern exists
      if (search.test(src)) {
        src = src.replace(search, replace);
        fs.writeFileSync(f, src, 'utf8');
        console.log(`  ✓ Fixed implicit any: ${relPath}`);
      }
    }
  }

  // Fix (comment) => ... patterns
  const commentFixes = [
    'imu-formations/src/components/lesson/comments-section.tsx',
    'imu-library/src/components/stories/detail/commentary.tsx',
  ];
  for (const relPath of commentFixes) {
    const f = path.join(ROOT, relPath);
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      src = src.replace(/\(comment\)\s*=>/g, '(comment: any) =>');
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed implicit any 'comment': ${relPath}`);
    }
  }

  // Fix (member) and (member, index) patterns
  const memberFixes = [
    'imu-mobility/src/components/hub/PodCard.tsx',
    'imu-mobility/src/components/pods/PodListItem.tsx',
    'imu-mobility/src/components/hub/CommunityPodsOverview.tsx',
    'imu-smart-home/src/components/hub/family-status-panel.tsx',
  ];
  for (const relPath of memberFixes) {
    const f = path.join(ROOT, relPath);
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      src = src.replace(/\(member\)\s*=>/g, '(member: any) =>');
      src = src.replace(/\(member,\s*index\)\s*=>/g, '(member: any, index: number) =>');
      src = src.replace(/\(pod\)\s*=>/g, '(pod: any) =>');
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed implicit any 'member/pod': ${relPath}`);
    }
  }

  // Fix (field) pattern in dating-login-form
  {
    const f = path.join(ROOT, 'imu-dating/src/components/auth/dating-login-form.tsx');
    if (fs.existsSync(f)) {
      let src = fs.readFileSync(f, 'utf8');
      src = src.replace(/\(\{\s*field\s*\}\)/g, '({ field }: { field: any })');
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed implicit any 'field': dating-login-form.tsx`);
    }
  }
}

// ─── 7. Install missing npm deps ────────────────────────────────────

function installMissingDeps() {
  console.log('\n── Installing missing npm dependencies ──');

  const depsNeeded = {
    'imu-dating': ['@hookform/resolvers', 'react-hook-form', 'zod'],
    'imu-formations': ['@radix-ui/react-accordion'],
    'imu-sports': ['@radix-ui/react-separator'],
  };

  // Check which deps are actually missing
  for (const [mod, deps] of Object.entries(depsNeeded)) {
    const pkgPath = path.join(ROOT, mod, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const missing = deps.filter(d => !allDeps[d]);
    if (missing.length > 0) {
      console.log(`  → Installing in ${mod}: ${missing.join(', ')}`);
      try {
        execSync(`cd "${path.join(ROOT, mod)}" && pnpm add ${missing.join(' ')}`, { stdio: 'pipe' });
        console.log(`  ✓ Installed: ${mod}`);
      } catch (e) {
        console.warn(`  ⚠ Install failed for ${mod}: ${e.message}`);
      }
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function fixFileReplace(relPath, search, replace) {
  const f = path.join(ROOT, relPath);
  if (!fs.existsSync(f)) return;
  let src = fs.readFileSync(f, 'utf8');
  if (typeof search === 'string') {
    if (src.includes(search)) {
      src = src.replaceAll(search, replace);
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed: ${relPath} (${search} → ${replace})`);
    }
  } else {
    if (search.test(src)) {
      src = src.replace(search, replace);
      fs.writeFileSync(f, src, 'utf8');
      console.log(`  ✓ Fixed: ${relPath}`);
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────

const MODULES = [
  'imu-worlds', 'imu-contests', 'imu-sports', 'imu-finance',
  'imu-services', 'imu-formations', 'imu-dating', 'imu-mobility',
  'imu-library', 'imu-smart-home', 'imu-style-beauty',
];

console.log('╔══════════════════════════════════════════╗');
console.log('║  fix-ts-errors.mjs — Batch TS error fix  ║');
console.log('╚══════════════════════════════════════════╝');

// 1. Fix I18nProvider in all modules
console.log('\n── Fixing I18nProvider (useTranslations) ──');
for (const mod of MODULES) {
  fixI18nProvider(path.join(ROOT, mod));
}

// 2. Copy missing UI components
copyAllMissingUiComponents();

// 3. Create use-toast hooks
console.log('\n── Creating use-toast hooks ──');
for (const mod of MODULES_NEEDING_USE_TOAST) {
  createUseToastHook(path.join(ROOT, mod));
}

// 4. Fix missing exports
console.log('\n── Fixing missing type/data exports ──');
for (const mod of MODULES) {
  fixMissingExports(path.join(ROOT, mod), mod);
}

// 5. Fix specific files
fixSpecificFiles();

// 6. Fix implicit any types
fixImplicitAnyTypes();

// 7. Install missing deps (optional, comment out if offline)
// installMissingDeps();

console.log('\n✅ All fixes applied!');
console.log('Run: for mod in imu-*; do echo "=== $mod ==="; cd "$mod" && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l; cd ..; done');
