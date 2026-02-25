#!/usr/bin/env node
// =============================================================================
// migrate-module-components.mjs
// Migration automatisée des composants web-app → mini-app standalone
//
// Usage :
//   node scripts/migrate-module-components.mjs worlds
//   node scripts/migrate-module-components.mjs --all
//   node scripts/migrate-module-components.mjs --all --dry-run
// =============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WEB_APP = path.join(ROOT, 'web-app', 'src');

const DRY_RUN = process.argv.includes('--dry-run');
const ALL = process.argv.includes('--all');

// ═══════════════════════════════════════════════════════════════
// Module definitions
// ═══════════════════════════════════════════════════════════════

const MODULES = {
  worlds: {
    miniappDir: 'imu-worlds',
    componentDir: 'worlds',
    moduleId: 'worlds',
    displayName: 'ImuWorlds',
    icon: 'Globe',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'carousel', 'scroll-area', 'input'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'embla-carousel-autoplay': '^8.0.0',
      'embla-carousel-react': '^8.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
    },
    types: ['community'],
    dataFiles: ['community'],
    mockData: ['MOCK_WORLDS'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'events', pageFile: 'ui/events/page.tsx' },
      { path: ':worldId', pageFile: 'ui/[worldId]/page.tsx' },
      { path: ':worldId/nature', pageFile: 'ui/[worldId]/nature/page.tsx' },
      { path: ':worldId/map', pageFile: 'ui/[worldId]/map/page.tsx' },
      { path: ':worldId/astronomy', pageFile: 'ui/[worldId]/astronomy/page.tsx' },
    ],
  },
  contests: {
    miniappDir: 'imu-contests',
    componentDir: 'contests',
    moduleId: 'contests',
    displayName: 'ImuContests',
    icon: 'Trophy',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'carousel', 'scroll-area', 'input', 'dialog', 'tabs', 'form', 'label', 'textarea', 'select'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'embla-carousel-autoplay': '^8.0.0',
      'embla-carousel-react': '^8.0.0',
      'react-hook-form': '^7.50.0',
      '@hookform/resolvers': '^3.3.0',
      'zod': '^3.22.0',
      '@radix-ui/react-dialog': '^1.0.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-label': '^2.0.0',
      '@radix-ui/react-select': '^2.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
    },
    types: ['community'],
    dataFiles: ['community'],
    mockData: ['MOCK_CONTESTS', 'MOCK_SUBMISSIONS'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'archive', pageFile: 'ui/archive/page.tsx' },
      { path: ':contestId', pageFile: 'ui/[contestId]/page.tsx' },
    ],
  },
  sports: {
    miniappDir: 'imu-sports',
    componentDir: 'sports',
    moduleId: 'sports',
    displayName: 'ImuSports',
    icon: 'Trophy',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'table', 'scroll-area', 'separator', 'sheet'],
    npmDeps: {
      'recharts': '^2.12.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
    },
    types: ['sports', 'media'],
    dataFiles: ['sports', 'media'],
    mockData: ['MOCK_BETTING_EVENTS', 'MOCK_LIVE_MATCHES', 'MOCK_MATCHES', 'MOCK_NEWS_ARTICLES', 'MOCK_PLAYER_STATS', 'MOCK_STANDINGS', 'MOCK_UPCOMING_PARTIES'],
    contexts: ['betting-context'],
    hasSubRoutes: false,
  },
  finance: {
    miniappDir: 'imu-finance',
    componentDir: 'finance',
    moduleId: 'finance',
    displayName: 'ImuFinance',
    icon: 'Landmark',
    uiComponents: ['card', 'button', 'badge', 'tabs', 'table', 'separator', 'input', 'select', 'label', 'chart'],
    npmDeps: {
      'recharts': '^2.12.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-label': '^2.0.0',
      '@radix-ui/react-select': '^2.0.0',
    },
    types: ['commerce', 'sports'],
    dataFiles: ['commerce', 'sports'],
    mockData: ['MOCK_TRANSACTIONS', 'MOCK_GROUP_FUNDS'],
    contexts: [],
    hasSubRoutes: false,
  },
  services: {
    miniappDir: 'imu-services',
    componentDir: 'services',
    moduleId: 'services',
    displayName: 'ImuServices',
    icon: 'Wrench',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'input', 'dialog', 'avatar', 'separator', 'calendar', 'popover', 'select', 'label', 'textarea', 'form'],
    npmDeps: {
      '@radix-ui/react-dialog': '^1.0.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-avatar': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-popover': '^1.0.0',
      '@radix-ui/react-select': '^2.0.0',
      '@radix-ui/react-label': '^2.0.0',
      'react-hook-form': '^7.50.0',
      '@hookform/resolvers': '^3.3.0',
      'zod': '^3.22.0',
      'date-fns': '^3.3.0',
      'react-day-picker': '^8.10.0',
    },
    types: ['misc'],
    dataFiles: ['misc'],
    mockData: ['MOCK_PROFESSIONALS'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'favorites', pageFile: 'ui/favorites/page.tsx' },
      { path: 'emergency', pageFile: 'ui/emergency/page.tsx' },
      { path: 'book', pageFile: 'ui/book/page.tsx' },
      { path: 'partners', pageFile: 'ui/partners/page.tsx' },
      { path: 'requests', pageFile: 'ui/requests/page.tsx' },
      { path: 'settings', pageFile: 'ui/settings/page.tsx' },
      { path: 'pro/:proId', pageFile: 'ui/pro/[proId]/page.tsx' },
      { path: ':category', pageFile: 'ui/[category]/page.tsx' },
    ],
  },
  formations: {
    miniappDir: 'imu-formations',
    componentDir: 'formations',
    moduleId: 'formations',
    displayName: 'ImuFormations',
    icon: 'GraduationCap',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'carousel', 'input', 'progress', 'avatar', 'separator', 'radio-group', 'label'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'embla-carousel-autoplay': '^8.0.0',
      'embla-carousel-react': '^8.0.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-progress': '^1.0.0',
      '@radix-ui/react-avatar': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-radio-group': '^1.0.0',
      '@radix-ui/react-label': '^2.0.0',
    },
    types: ['community'],
    dataFiles: ['community'],
    mockData: ['MOCK_COURSES', 'MOCK_QUIZZES'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'my-courses', pageFile: 'ui/my-courses/page.tsx' },
      { path: 'certificats', pageFile: 'ui/certificats/page.tsx' },
      { path: ':courseId', pageFile: 'ui/[courseId]/page.tsx' },
      { path: ':courseId/lecons/:lessonId', pageFile: 'ui/[courseId]/lecons/[lessonId]/page.tsx' },
      { path: ':courseId/quizzes/:quizId', pageFile: 'ui/[courseId]/quizzes/[quizId]/page.tsx' },
    ],
  },
  dating: {
    miniappDir: 'imu-dating',
    componentDir: 'dating',
    moduleId: 'dating',
    displayName: 'ImuDating',
    icon: 'Heart',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'input', 'separator', 'avatar', 'carousel', 'dialog', 'lazy-load-section'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'embla-carousel-autoplay': '^8.0.0',
      'embla-carousel-react': '^8.0.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-avatar': '^1.0.0',
      '@radix-ui/react-dialog': '^1.0.0',
    },
    types: ['dating'],
    dataFiles: ['dating'],
    mockData: ['MOCK_DATING_PROFILES'],
    contexts: ['dating-auth-context'],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'settings', pageFile: 'ui/settings/page.tsx' },
      { path: 'matches', pageFile: 'ui/matches/page.tsx' },
      { path: 'subscriptions', pageFile: 'ui/subscriptions/page.tsx' },
    ],
  },
  mobility: {
    miniappDir: 'imu-mobility',
    componentDir: 'mobility',
    moduleId: 'mobility',
    displayName: 'ImuMobility',
    icon: 'Car',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'input', 'separator', 'progress', 'calendar', 'popover', 'select', 'label', 'slider', 'switch', 'scroll-area'],
    npmDeps: {
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-progress': '^1.0.0',
      '@radix-ui/react-popover': '^1.0.0',
      '@radix-ui/react-select': '^2.0.0',
      '@radix-ui/react-label': '^2.0.0',
      '@radix-ui/react-slider': '^1.0.0',
      '@radix-ui/react-switch': '^1.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
      'date-fns': '^3.3.0',
      'react-day-picker': '^8.10.0',
    },
    types: ['misc'],
    dataFiles: ['misc'],
    mockData: ['MOCK_RIDESHARES'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'ride', pageFile: 'ui/ride/page.tsx' },
      { path: 'ev', pageFile: 'ui/ev/page.tsx' },
      { path: 'history', pageFile: 'ui/history/page.tsx' },
      { path: 'pods', pageFile: 'ui/pods/page.tsx' },
      { path: 'offers', pageFile: 'ui/offers/page.tsx' },
      { path: 'public', pageFile: 'ui/public/page.tsx' },
      { path: 'settings', pageFile: 'ui/settings/page.tsx' },
    ],
  },
  library: {
    miniappDir: 'imu-library',
    componentDir: 'library',
    moduleId: 'library',
    displayName: 'ImuLibrary',
    icon: 'BookOpen',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'input', 'separator', 'carousel', 'progress', 'dialog', 'sheet', 'dropdown-menu', 'scroll-area', 'slider'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'embla-carousel-autoplay': '^8.0.0',
      'embla-carousel-react': '^8.0.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-dialog': '^1.0.0',
      '@radix-ui/react-dropdown-menu': '^2.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
      '@radix-ui/react-slider': '^1.0.0',
      '@radix-ui/react-progress': '^1.0.0',
    },
    types: ['media', 'community'],
    dataFiles: ['media', 'community'],
    mockData: [],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'books', pageFile: 'ui/books/page.tsx' },
      { path: 'novels', pageFile: 'ui/novels/page.tsx' },
      { path: 'audiobooks', pageFile: 'ui/audiobooks/page.tsx' },
      { path: 'stories', pageFile: 'ui/stories/page.tsx' },
      { path: 'comics', pageFile: 'ui/comics/page.tsx' },
      { path: 'my-library', pageFile: 'ui/my-library/page.tsx' },
      { path: 'books/:id', pageFile: 'ui/books/[id]/page.tsx' },
      { path: 'novels/:id', pageFile: 'ui/novels/[id]/page.tsx' },
      { path: 'audiobooks/:id', pageFile: 'ui/audiobooks/[id]/page.tsx' },
      { path: 'stories/:id', pageFile: 'ui/stories/[id]/page.tsx' },
      { path: 'comics/:id', pageFile: 'ui/comics/[id]/page.tsx' },
    ],
  },
  'smart-home': {
    miniappDir: 'imu-smart-home',
    componentDir: 'smart-home',
    moduleId: 'smart-home',
    displayName: 'ImuSmartHome',
    icon: 'Home',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'input', 'separator', 'switch', 'slider', 'dialog', 'select', 'label', 'progress', 'scroll-area', 'table', 'chart', 'toast', 'toaster'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'recharts': '^2.12.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-switch': '^1.0.0',
      '@radix-ui/react-slider': '^1.0.0',
      '@radix-ui/react-dialog': '^1.0.0',
      '@radix-ui/react-select': '^2.0.0',
      '@radix-ui/react-label': '^2.0.0',
      '@radix-ui/react-progress': '^1.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
    },
    types: ['smart-home'],
    dataFiles: ['smart-home'],
    mockData: ['MOCK_DEVICES', 'MOCK_ROOMS', 'MOCK_SCENES', 'MOCK_CAMERAS', 'MOCK_AUTOMATIONS'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'devices', pageFile: 'ui/devices/page.tsx' },
      { path: 'scenes', pageFile: 'ui/scenes/page.tsx' },
      { path: 'automations', pageFile: 'ui/automations/page.tsx' },
      { path: 'family', pageFile: 'ui/family/page.tsx' },
      { path: 'energy', pageFile: 'ui/energy/page.tsx' },
      { path: 'security', pageFile: 'ui/security/page.tsx' },
      { path: 'settings', pageFile: 'ui/settings/page.tsx' },
    ],
  },
  'style-beauty': {
    miniappDir: 'imu-style-beauty',
    componentDir: 'style-beauty',
    moduleId: 'style-beauty',
    displayName: 'ImuStyleBeauty',
    icon: 'Sparkles',
    uiComponents: ['card', 'button', 'badge', 'skeleton', 'tabs', 'input', 'separator', 'dialog', 'avatar', 'carousel', 'select', 'label', 'progress', 'scroll-area', 'slider', 'toast', 'toaster', 'textarea'],
    npmDeps: {
      'framer-motion': '^11.0.0',
      'embla-carousel-autoplay': '^8.0.0',
      'embla-carousel-react': '^8.0.0',
      '@radix-ui/react-tabs': '^1.0.0',
      '@radix-ui/react-separator': '^1.0.0',
      '@radix-ui/react-dialog': '^1.0.0',
      '@radix-ui/react-avatar': '^1.0.0',
      '@radix-ui/react-select': '^2.0.0',
      '@radix-ui/react-label': '^2.0.0',
      '@radix-ui/react-progress': '^1.0.0',
      '@radix-ui/react-scroll-area': '^1.0.0',
      '@radix-ui/react-slider': '^1.0.0',
    },
    types: ['misc', 'commerce'],
    dataFiles: ['misc', 'commerce'],
    mockData: ['MOCK_BEAUTY_PRODUCTS', 'MOCK_TUTORIALS'],
    contexts: [],
    hasSubRoutes: true,
    subRoutes: [
      { path: 'shop', pageFile: 'ui/shop/page.tsx' },
      { path: 'wishlist', pageFile: 'ui/wishlist/page.tsx' },
      { path: 'virtual-tryon', pageFile: 'ui/virtual-tryon/page.tsx' },
      { path: 'profile', pageFile: 'ui/profile/page.tsx' },
      { path: 'tutorials', pageFile: 'ui/tutorials/page.tsx' },
      { path: 'trends', pageFile: 'ui/trends/page.tsx' },
      { path: 'assistant', pageFile: 'ui/assistant/page.tsx' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// Transform utilities
// ═══════════════════════════════════════════════════════════════

/**
 * Transform Next.js-specific imports into Vite-compatible equivalents.
 */
function transformNextImports(content, moduleConfig) {
  let result = content;

  // Remove 'use client' directive
  result = result.replace(/^['"]use client['"];?\s*\n?/gm, '');

  // next/link → <a> or internal navigation
  // Replace `import Link from 'next/link'` 
  result = result.replace(/import\s+Link\s+from\s+['"]next\/link['"];?\s*\n?/g, '');
  
  // Replace <Link href={...}> with <a href={...}>
  result = result.replace(/<Link\s/g, '<a ');
  result = result.replace(/<\/Link>/g, '</a>');

  // next/image → <img>
  result = result.replace(/import\s+Image\s+from\s+['"]next\/image['"];?\s*\n?/g, '');
  // Replace <Image ... /> keeping src, alt, className but removing width/height/fill/priority/quality
  result = result.replace(/<Image\s/g, '<img ');
  result = result.replace(/\bfill\b(?=[\s/>])/g, '');
  result = result.replace(/\bpriority\b(?=[\s/>])/g, '');
  result = result.replace(/\bquality=\{[^}]*\}/g, '');
  result = result.replace(/\bunoptimized\b(?=[\s/>])/g, '');

  // next/navigation → custom hooks
  // usePathname → useLocation
  result = result.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"]next\/navigation['"];?\s*\n?/g,
    (match, imports) => {
      const importList = imports.split(',').map(s => s.trim()).filter(Boolean);
      const replacements = [];
      const removals = ['usePathname', 'useParams', 'useRouter', 'useSearchParams', 'notFound'];
      
      for (const imp of importList) {
        if (!removals.includes(imp)) {
          replacements.push(imp);
        }
      }
      
      // We'll add our own navigation hooks
      let result = '';
      if (importList.includes('usePathname') || importList.includes('useParams') || 
          importList.includes('useRouter') || importList.includes('useSearchParams')) {
        result += `import { useNavigation } from '@/hooks/use-navigation';\n`;
      }
      if (importList.includes('notFound')) {
        result += `import { NotFound } from '@/components/NotFound';\n`;
      }
      return result;
    }
  );

  // Replace usePathname() calls
  result = result.replace(/const\s+pathname\s*=\s*usePathname\(\)/g, 
    'const { pathname } = useNavigation()');
  result = result.replace(/usePathname\(\)/g, 'useNavigation().pathname');

  // Replace useParams() calls
  result = result.replace(/const\s+params\s*=\s*useParams(<[^>]*>)?\(\)/g,
    'const params = useNavigation().params');
  result = result.replace(/useParams(<[^>]*>)?\(\)/g, 'useNavigation().params');

  // Replace useRouter() calls
  result = result.replace(/const\s+router\s*=\s*useRouter\(\)/g,
    'const { navigate: routerPush } = useNavigation()');
  result = result.replace(/router\.push\(/g, 'routerPush(');
  result = result.replace(/router\.replace\(/g, 'routerPush(');
  result = result.replace(/router\.back\(\)/g, 'useNavigation().goBack()');
  result = result.replace(/useRouter\(\)/g, 'useNavigation()');

  // Replace notFound() calls → return <NotFound />
  result = result.replace(/^\s*notFound\(\);?\s*$/gm, '    return <NotFound />;');

  // next-intl → custom i18n
  result = result.replace(
    /import\s*\{\s*useTranslations\s*\}\s*from\s*['"]next-intl['"];?\s*\n?/g,
    `import { useTranslations } from '@/providers/I18nProvider';\n`
  );

  // Remove locale extraction from pathname (common pattern)
  result = result.replace(/const\s+locale\s*=\s*pathname\.split\(['"]\/['"]\)\[1\]\s*\|\|\s*['"][^'"]*['"];?\s*\n?/g, '');

  // Replace href patterns like `/${locale}/module/...` → `/...`
  result = result.replace(/`\/\$\{locale\}\//g, '`/');
  result = result.replace(/`\/\$\{params\.locale\}\//g, '`/');

  // AppLayout → remove (mini-app manages its own layout)
  result = result.replace(/import\s*\{\s*AppLayout\s*\}\s*from\s*['"]@\/components\/layout\/app-layout['"];?\s*\n?/g, '');
  result = result.replace(/<AppLayout>\s*/g, '<>\n');
  result = result.replace(/\s*<\/AppLayout>/g, '\n</>');

  // usePageHeader / usePageFooter → remove (mini-app manages its own header)
  result = result.replace(/import\s*\{\s*usePageHeader\s*\}\s*from\s*['"]@\/contexts\/page-header-context['"];?\s*\n?/g, '');
  result = result.replace(/import\s*\{\s*usePageFooter\s*\}\s*from\s*['"]@\/contexts\/page-footer-context['"];?\s*\n?/g, '');
  result = result.replace(/const\s*\{\s*setHeader,\s*clearHeader\s*\}\s*=\s*usePageHeader\(\);?\s*\n?/g, '');
  result = result.replace(/const\s*\{\s*setFooterActions,\s*clearFooter\s*\}\s*from\s*usePageFooter\(\);?\s*\n?/g, '');
  
  // Remove useEffect blocks that only set/clear headers
  result = result.replace(/useEffect\(\(\)\s*=>\s*\{[^}]*setHeader\([^)]*\);[^}]*return\s*\(\)\s*=>\s*clearHeader\(\);[^}]*\},\s*\[[^\]]*\]\);?\s*\n?/gs, '');

  // @/lib/utils → local
  result = result.replace(
    /from\s*['"]@\/lib\/utils['"]/g,
    `from '@/lib/utils'`
  );

  // @/lib/logger → console wrapper
  result = result.replace(
    /import\s*\{\s*logger\s*\}\s*from\s*['"]@\/lib\/logger['"];?\s*\n?/g,
    `const logger = { debug: console.debug, info: console.info, warn: console.warn, error: console.error };\n`
  );

  // @/lib/types → local types
  result = result.replace(
    /from\s*['"]@\/lib\/types['"]|from\s*['"]@\/lib\/types\/[^'"]*['"]/g,
    `from '@/lib/types'`
  );

  // @/lib/data → local data  
  result = result.replace(
    /from\s*['"]@\/lib\/data['"]|from\s*['"]@\/lib\/data\/[^'"]*['"]/g,
    `from '@/lib/data'`
  );

  // @/lib/mock-data → local data
  result = result.replace(
    /from\s*['"]@\/lib\/mock-data['"]/g,
    `from '@/lib/data'`
  );

  // @/hooks/use-toast → local
  result = result.replace(
    /from\s*['"]@\/hooks\/use-toast['"]/g,
    `from '@/hooks/use-toast'`
  );

  // @/components/ui/* → local UI components
  result = result.replace(
    /from\s*['"]@\/components\/ui\/([^'"]*)['"]/g,
    `from '@/components/ui/$1'`
  );

  // @/components/<componentDir>/* → local components
  result = result.replace(
    new RegExp(`from\\s*['"]@/components/${moduleConfig.componentDir}/([^'"]*)['""]`, 'g'),
    `from '@/components/$1'`
  );

  // @/app/actions → local API calls (Server Actions conversion)
  result = result.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"]@\/app\/actions['"];?\s*\n?/g,
    (match, imports) => {
      const fns = imports.split(',').map(s => s.trim()).filter(Boolean);
      return fns.map(fn => 
        `// TODO: Convert server action to API call\nasync function ${fn}(...args: any[]) { console.warn('${fn} not yet migrated to API'); return {}; }\n`
      ).join('');
    }
  );

  // @/components/ui/lazy-load-section → simple wrapper
  result = result.replace(
    /import\s*\{\s*LazyLoadSection\s*\}\s*from\s*['"]@\/components\/ui\/lazy-load-section['"];?\s*\n?/g,
    `function LazyLoadSection({ children }: { children: React.ReactNode }) { return <>{children}</>; }\n`
  );

  // Clean up empty lines (max 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

// ═══════════════════════════════════════════════════════════════
// File copy & transform utilities
// ═══════════════════════════════════════════════════════════════

function ensureDir(dirPath) {
  if (!DRY_RUN) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  if (DRY_RUN) {
    console.log(`  [DRY] Would write: ${path.relative(ROOT, filePath)}`);
    return;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function copyAndTransform(srcPath, destPath, moduleConfig) {
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠ Source not found: ${path.relative(ROOT, srcPath)}`);
    return false;
  }
  
  let content = fs.readFileSync(srcPath, 'utf8');
  
  if (srcPath.endsWith('.tsx') || srcPath.endsWith('.ts')) {
    content = transformNextImports(content, moduleConfig);
  }
  
  writeFile(destPath, content);
  return true;
}

function copyDirectory(srcDir, destDir, moduleConfig) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`  ⚠ Directory not found: ${path.relative(ROOT, srcDir)}`);
    return 0;
  }
  
  let count = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDirectory(srcPath, destPath, moduleConfig);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.json') || entry.name.endsWith('.css')) {
      if (copyAndTransform(srcPath, destPath, moduleConfig)) {
        count++;
      }
    }
  }
  
  return count;
}

// ═══════════════════════════════════════════════════════════════
// Generate support files
// ═══════════════════════════════════════════════════════════════

function generateNavigationHook(miniappDir) {
  const content = `import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NavigationState {
  pathname: string;
  params: Record<string, string>;
}

interface NavigationContextType extends NavigationState {
  navigate: (path: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>(['/']);
  const [current, setCurrent] = useState('/');

  const extractParams = useCallback((pathname: string): Record<string, string> => {
    const parts = pathname.split('/').filter(Boolean);
    const params: Record<string, string> = {};
    // Simple param extraction — keys are positional
    parts.forEach((part, i) => {
      if (i > 0) params[\`id\${i}\`] = part;
    });
    // Also set common param names
    if (parts.length >= 2) params.id = parts[parts.length - 1];
    return params;
  }, []);

  const navigate = useCallback((path: string) => {
    setHistory(prev => [...prev, current]);
    setCurrent(path);
  }, [current]);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const next = [...prev];
      const last = next.pop() || '/';
      setCurrent(last);
      return next;
    });
  }, []);

  return (
    <NavigationContext.Provider value={{
      pathname: current,
      params: extractParams(current),
      navigate,
      goBack,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

export default useNavigation;
`;
  writeFile(path.join(miniappDir, 'src', 'hooks', 'use-navigation.tsx'), content);
}

function generateNotFoundComponent(miniappDir) {
  const content = `import { useNavigation } from '@/hooks/use-navigation';

export function NotFound() {
  const { goBack } = useNavigation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-foreground">Page non trouvée</h2>
      <p className="text-muted-foreground">La ressource demandée n'existe pas.</p>
      <button
        onClick={goBack}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Retour
      </button>
    </div>
  );
}
`;
  writeFile(path.join(miniappDir, 'src', 'components', 'NotFound.tsx'), content);
}

function generateToastHook(miniappDir) {
  const toastHookContent = `import * as React from 'react';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToastVariant = 'default' | 'destructive';

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'DISMISS'; id: string }
  | { type: 'REMOVE'; id: string };

let count = 0;
function genId() { return (++count).toString(); }

const listeners: Array<(toasts: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function dispatch(action: Action) {
  switch (action.type) {
    case 'ADD':
      memoryState = [action.toast, ...memoryState].slice(0, TOAST_LIMIT);
      break;
    case 'DISMISS':
      memoryState = memoryState.filter(t => t.id !== action.id);
      break;
    case 'REMOVE':
      memoryState = memoryState.filter(t => t.id !== action.id);
      break;
  }
  listeners.forEach(l => l(memoryState));
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = genId();
  dispatch({ type: 'ADD', toast: { ...props, id } });
  setTimeout(() => dispatch({ type: 'REMOVE', id }), props.duration || TOAST_REMOVE_DELAY);
  return id;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: 'DISMISS', id }),
  };
}
`;
  writeFile(path.join(miniappDir, 'src', 'hooks', 'use-toast.ts'), toastHookContent);

  // Simple Toaster component
  const toasterContent = `import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={\`rounded-lg border p-4 shadow-lg bg-card text-card-foreground animate-in slide-in-from-bottom-2 \${
            t.variant === 'destructive' ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-border'
          }\`}
          onClick={() => dismiss(t.id)}
        >
          {t.title && <p className="font-semibold text-sm">{t.title}</p>}
          {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
`;
  writeFile(path.join(miniappDir, 'src', 'components', 'Toaster.tsx'), toasterContent);
}

function generateAppRouter(moduleConfig, miniappDir) {
  const { displayName, icon, moduleId, hasSubRoutes, subRoutes = [], contexts = [] } = moduleConfig;
  
  // Build route entries
  const routeImports = [];
  const routePages = [];
  
  if (hasSubRoutes && subRoutes.length > 0) {
    for (const route of subRoutes) {
      const pageName = route.path
        .replace(/:/g, '')
        .split('/')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('') + 'Page';
      
      routeImports.push(`// TODO: import ${pageName} from sub-route`);
    }
  }

  const hasToast = moduleConfig.uiComponents.includes('toast');
  const hasBetting = contexts.includes('betting-context');
  const hasDatingAuth = contexts.includes('dating-auth-context');

  let wrapperOpen = '';
  let wrapperClose = '';
  let extraImports = '';

  if (hasBetting) {
    extraImports += `import { BettingProvider } from '@/contexts/betting-context';\n`;
    wrapperOpen += '<BettingProvider>';
    wrapperClose = '</BettingProvider>' + wrapperClose;
  }
  if (hasDatingAuth) {
    extraImports += `import { DatingAuthProvider } from '@/contexts/dating-auth-context';\n`;
    wrapperOpen += '<DatingAuthProvider>';
    wrapperClose = '</DatingAuthProvider>' + wrapperClose;
  }
  if (hasToast) {
    extraImports += `import { Toaster } from '@/components/Toaster';\n`;
  }

  const routeMatchCode = hasSubRoutes && subRoutes.length > 0 
    ? `
  // Route matching  
  const renderPage = () => {
    const parts = currentRoute.split('/').filter(Boolean);
    ${subRoutes.map(r => {
      const pattern = r.path.split('/');
      const conditions = pattern.map((p, i) => 
        p.startsWith(':') ? `parts[${i}] !== undefined` : `parts[${i}] === '${p}'`
      ).join(' && ');
      const pageName = r.path
        .replace(/:/g, '')
        .split('/')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('') + 'Page';
      return `if (parts.length === ${pattern.length} && ${conditions}) {
      // TODO: return <${pageName} />;
      return <div className="p-6"><h2>${r.path}</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }`;
    }).join('\n    ')}
    // Default: Hub
    return null;
  };

  const subPage = renderPage();
  if (subPage) return (
      <>
        ${hasToast ? '<Toaster />' : ''}
        {subPage}
      </>
    );`
    : '';

  const content = `import { useState } from 'react';
import { useImuChat } from './providers/ImuChatProvider';
import { NavigationProvider, useNavigation } from './hooks/use-navigation';
${extraImports}
// Hub pages — migrated components
import ${displayName}Hub from './pages/${displayName}Hub';

/**
 * ${displayName} — Mini-app router.
 */
function AppContent() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const { isConnected } = useImuChat();

  const navigate = (path: string) => setCurrentRoute(path);
  const goBack = () => setCurrentRoute('/');

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  ${routeMatchCode}

  return (
    <>
      ${hasToast ? '<Toaster />' : ''}
      <${displayName}Hub onNavigate={navigate} currentRoute={currentRoute} onBack={goBack} />
    </>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      ${wrapperOpen || ''}
      <AppContent />
      ${wrapperClose || ''}
    </NavigationProvider>
  );
}
`;

  writeFile(path.join(miniappDir, 'src', 'App.tsx'), content);
}

// ═══════════════════════════════════════════════════════════════
// Generate Hub page from module's main page
// ═══════════════════════════════════════════════════════════════

function generateHubPage(moduleConfig, miniappDir) {
  const moduleDir = path.join(WEB_APP, 'modules', moduleConfig.moduleId);
  const mainPagePath = path.join(moduleDir, 'ui', 'page.tsx');
  
  if (!fs.existsSync(mainPagePath)) {
    console.warn(`  ⚠ Main page not found: ${path.relative(ROOT, mainPagePath)}`);
    return;
  }

  let content = fs.readFileSync(mainPagePath, 'utf8');
  content = transformNextImports(content, moduleConfig);
  
  // Fix component imports — they now live in @/components/ directly (no module subfolder)
  // Already handled by transformNextImports
  
  // Replace the default export name
  const exportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  const originalName = exportMatch ? exportMatch[1] : `${moduleConfig.displayName}Page`;
  
  // Add navigation props interface
  const propsInterface = `
interface HubProps {
  onNavigate: (path: string) => void;
  currentRoute: string;
  onBack: () => void;
}
`;

  // Replace export to include props
  content = content.replace(
    /export\s+default\s+function\s+\w+\(\s*\)/,
    `${propsInterface}\nexport default function ${moduleConfig.displayName}Hub({ onNavigate, currentRoute, onBack }: HubProps)`
  );

  // Fix href navigation to use onNavigate instead
  // Replace <a href={`/module/...`}> → <button onClick={() => onNavigate('...')}>
  content = content.replace(
    /<a\s+href=\{`\/[^`]*`\}/g,
    (match) => {
      const hrefMatch = match.match(/href=\{`\/[^`]*`\}/);
      if (hrefMatch) {
        const route = hrefMatch[0]
          .replace('href={`/', 'onClick={() => onNavigate(`/')
          .replace(/`\}$/, '`)}');
        return `<a ${route}`;
      }
      return match;
    }
  );

  writeFile(path.join(miniappDir, 'src', 'pages', `${moduleConfig.displayName}Hub.tsx`), content);
}

// ═══════════════════════════════════════════════════════════════
// Copy types and mock data
// ═══════════════════════════════════════════════════════════════

function copyTypes(moduleConfig, miniappDir) {
  const typesDir = path.join(WEB_APP, 'lib', 'types');
  const destDir = path.join(miniappDir, 'src', 'lib');
  
  let allTypes = '';
  
  for (const typeFile of moduleConfig.types) {
    const srcPath = path.join(typesDir, `${typeFile}.ts`);
    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf8');
      // Remove any imports from other type files (make standalone)
      content = content.replace(/import\s+.*from\s+['"]\.\/[^'"]*['"];?\s*\n?/g, '');
      allTypes += `// === ${typeFile} types ===\n${content}\n\n`;
    }
  }
  
  if (allTypes) {
    writeFile(path.join(destDir, 'types.ts'), allTypes);
  } else {
    // Write empty types file
    writeFile(path.join(destDir, 'types.ts'), '// Types will be added as components are migrated\nexport {};\n');
  }
}

function copyMockData(moduleConfig, miniappDir) {
  const dataDir = path.join(WEB_APP, 'lib', 'data');
  const destPath = path.join(miniappDir, 'src', 'lib', 'data.ts');
  const dataFiles = moduleConfig.dataFiles || [];
  
  if (dataFiles.length === 0 && moduleConfig.mockData.length === 0) {
    writeFile(destPath, `import type {} from './types';\n\n// Mock data will be added as components are migrated\nexport {};\n`);
    return;
  }

  let dataContent = '';
  
  // Copy data from domain files matching the module's needs
  for (const df of dataFiles) {
    const srcPath = path.join(dataDir, `${df}.ts`);
    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf8');
      // Fix type imports to point at local types
      content = content.replace(/from\s*['"]\.\.\/types\/[^'"]*['"]/g, `from './types'`);
      content = content.replace(/from\s*['"]\.\.\/types['"]/g, `from './types'`);
      content = content.replace(/from\s*['"]\.\/[^'"]*['"]/g, `from './types'`);
      content = content.replace(/['"]use client['"];?\s*\n?/g, '');
      dataContent += `// === Data from ${df}.ts ===\n${content}\n\n`;
    } else {
      console.warn(`  ⚠ Data file not found: data/${df}.ts`);
    }
  }
  
  if (dataContent) {
    writeFile(destPath, dataContent);
  } else {
    writeFile(destPath, `// Mock data — to be populated\nexport {};\n`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Copy UI components from web-app
// ═══════════════════════════════════════════════════════════════

function copyUIComponents(moduleConfig, miniappDir) {
  const uiSrcDir = path.join(WEB_APP, 'components', 'ui');
  const uiDestDir = path.join(miniappDir, 'src', 'components', 'ui');
  
  let copied = 0;
  for (const comp of moduleConfig.uiComponents) {
    const srcPath = path.join(uiSrcDir, `${comp}.tsx`);
    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf8');
      // Fix imports — ui components use @/lib/utils which we have
      content = content.replace(/['"]use client['"];?\s*\n?/g, '');
      writeFile(path.join(uiDestDir, `${comp}.tsx`), content);
      copied++;
    } else {
      console.warn(`  ⚠ UI component not found: ${comp}.tsx`);
    }
  }
  
  return copied;
}

// ═══════════════════════════════════════════════════════════════
// Copy contexts
// ═══════════════════════════════════════════════════════════════

function copyContexts(moduleConfig, miniappDir) {
  const contextsDir = path.join(WEB_APP, 'contexts');
  const destDir = path.join(miniappDir, 'src', 'contexts');
  
  for (const ctx of moduleConfig.contexts) {
    const srcPath = path.join(contextsDir, `${ctx}.tsx`);
    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf8');
      content = transformNextImports(content, moduleConfig);
      // Fix remaining platform imports
      content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]\.\/ModulesContext['"];?\s*\n?/g, '');
      content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]@\/contexts\/ModulesContext['"];?\s*\n?/g, '');
      writeFile(path.join(destDir, `${ctx}.tsx`), content);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Update package.json with new dependencies
// ═══════════════════════════════════════════════════════════════

function updatePackageJson(moduleConfig, miniappDir) {
  const pkgPath = path.join(miniappDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Add new npm dependencies
  for (const [dep, version] of Object.entries(moduleConfig.npmDeps)) {
    if (!pkg.dependencies[dep]) {
      pkg.dependencies[dep] = version;
    }
  }
  
  // Always ensure these are present
  const required = {
    'clsx': '^2.1.0',
    'tailwind-merge': '^2.2.0',
    'class-variance-authority': '^0.7.0',
    '@radix-ui/react-slot': '^1.0.0',
  };
  
  for (const [dep, version] of Object.entries(required)) {
    if (!pkg.dependencies[dep]) {
      pkg.dependencies[dep] = version;
    }
  }
  
  if (!DRY_RUN) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }
}

// ═══════════════════════════════════════════════════════════════
// Copy i18n messages from module
// ═══════════════════════════════════════════════════════════════

function copyI18nMessages(moduleConfig, miniappDir) {
  const messagesDir = path.join(WEB_APP, 'modules', moduleConfig.moduleId, 'messages');
  const destDir = path.join(miniappDir, 'src', 'i18n');
  
  if (!fs.existsSync(messagesDir)) return;

  for (const lang of ['en', 'fr', 'ja']) {
    const srcPath = path.join(messagesDir, `${lang}.json`);
    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath, 'utf8');
      // Merge with existing i18n (keep existing keys, add new ones from module)
      const destPath = path.join(destDir, `${lang}.json`);
      let existing = {};
      if (fs.existsSync(destPath)) {
        try { existing = JSON.parse(fs.readFileSync(destPath, 'utf8')); } catch {}
      }
      const moduleMessages = JSON.parse(content);
      const merged = { ...existing, ...moduleMessages };
      writeFile(destPath, JSON.stringify(merged, null, 2) + '\n');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Main migration function for one module
// ═══════════════════════════════════════════════════════════════

function migrateModule(moduleId) {
  const config = MODULES[moduleId];
  if (!config) {
    console.error(`❌ Unknown module: ${moduleId}`);
    console.log(`   Available: ${Object.keys(MODULES).join(', ')}`);
    process.exit(1);
  }

  const miniappDir = path.join(ROOT, config.miniappDir);
  
  if (!fs.existsSync(miniappDir)) {
    console.error(`❌ Mini-app directory not found: ${config.miniappDir}`);
    console.log(`   Run 'node scripts/generate-phase-b-miniapps.mjs' first.`);
    process.exit(1);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  🔄 Migrating: ${moduleId} → ${config.miniappDir}`);
  console.log(`${'═'.repeat(60)}`);

  // 1. Copy UI components
  console.log('\n  📦 Copying UI components...');
  const uiCount = copyUIComponents(config, miniappDir);
  console.log(`     → ${uiCount} components`);

  // 2. Copy types
  console.log('  📋 Copying types...');
  copyTypes(config, miniappDir);

  // 3. Copy mock data
  console.log('  📊 Copying mock data...');
  copyMockData(config, miniappDir);

  // 4. Copy real components (the main migration!)
  console.log('  🧩 Migrating module components...');
  const componentSrc = path.join(WEB_APP, 'components', config.componentDir);
  const componentDest = path.join(miniappDir, 'src', 'components');
  const componentCount = copyDirectory(componentSrc, componentDest, config);
  console.log(`     → ${componentCount} component files migrated`);

  // 5. Generate navigation hook
  console.log('  🧭 Generating navigation hook...');
  generateNavigationHook(miniappDir);

  // 6. Generate NotFound component
  console.log('  🚫 Generating NotFound component...');
  generateNotFoundComponent(miniappDir);

  // 7. Generate toast hook (if needed)
  if (config.uiComponents.includes('toast') || config.uiComponents.includes('toaster')) {
    console.log('  🔔 Generating toast system...');
    generateToastHook(miniappDir);
  }

  // 8. Copy contexts
  if (config.contexts.length > 0) {
    console.log('  🔗 Copying contexts...');
    copyContexts(config, miniappDir);
  }

  // 9. Generate Hub page from module's main page
  console.log('  📄 Generating Hub page...');
  generateHubPage(config, miniappDir);

  // 10. Generate App router
  console.log('  🛤️ Generating App router...');
  generateAppRouter(config, miniappDir);

  // 11. Copy i18n messages
  console.log('  🌐 Merging i18n messages...');
  copyI18nMessages(config, miniappDir);

  // 12. Update package.json
  console.log('  📦 Updating package.json...');
  updatePackageJson(config, miniappDir);

  console.log(`\n  ✅ ${moduleId} migration complete!`);
  console.log(`     Components: ${componentCount} files`);
  console.log(`     UI: ${uiCount} components`);
  console.log(`     Contexts: ${config.contexts.length}`);
  console.log(`     Sub-routes: ${config.subRoutes?.length || 0}`);
  
  return { componentCount, uiCount };
}

// ═══════════════════════════════════════════════════════════════
// CLI Entry point
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   🔄 ImuChat Module Migration — Phase B Components  ║');
console.log('╚══════════════════════════════════════════════════════╝');

if (DRY_RUN) console.log('\n⚠️  DRY RUN MODE — no files will be written\n');

let totalComponents = 0;
let totalUI = 0;
let modulesProcessed = 0;

if (ALL) {
  const order = ['worlds', 'contests', 'sports', 'finance', 'services', 'formations', 'dating', 'mobility', 'library', 'smart-home', 'style-beauty'];
  for (const moduleId of order) {
    const result = migrateModule(moduleId);
    totalComponents += result.componentCount;
    totalUI += result.uiCount;
    modulesProcessed++;
  }
} else if (args.length > 0) {
  for (const moduleId of args) {
    const result = migrateModule(moduleId);
    totalComponents += result.componentCount;
    totalUI += result.uiCount;
    modulesProcessed++;
  }
} else {
  console.log('\nUsage:');
  console.log('  node scripts/migrate-module-components.mjs <module-id>');
  console.log('  node scripts/migrate-module-components.mjs --all');
  console.log('  node scripts/migrate-module-components.mjs --all --dry-run');
  console.log('\nAvailable modules:');
  for (const [id, config] of Object.entries(MODULES)) {
    console.log(`  ${id.padEnd(15)} → ${config.miniappDir}`);
  }
  process.exit(0);
}

console.log('\n' + '═'.repeat(60));
console.log(`  📊 Migration Summary`);
console.log('═'.repeat(60));
console.log(`  Modules processed : ${modulesProcessed}`);
console.log(`  Components migrated: ${totalComponents}`);
console.log(`  UI components copied: ${totalUI}`);
console.log('═'.repeat(60));
console.log('\n  Next steps:');
console.log('  1. cd <mini-app-dir> && pnpm install');
console.log('  2. Fix any remaining TypeScript errors');
console.log('  3. Test each mini-app: pnpm dev');
console.log('  4. Build: pnpm build:miniapps\n');
