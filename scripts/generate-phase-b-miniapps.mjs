#!/usr/bin/env node

/**
 * Phase B — Génération automatisée des mini-apps
 *
 * Ce script crée les projets Vite+React pour chaque module optionnel
 * à extraire de la web-app monolithique.
 *
 * Usage : node scripts/generate-phase-b-miniapps.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Définition des modules à extraire ────────────────────────

const MODULES = [
  {
    moduleId: 'voom',
    miniappId: 'imu-voom',
    name: 'ImuVoom',
    description: 'Short video platform — Create, share, and discover short-form video content.',
    category: 'video',
    icon: '🎬',
    port: 3201,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'storage:read', 'storage:write'],
    dependencies: [],
  },
  {
    moduleId: 'resources',
    miniappId: 'imu-resources',
    name: 'ImuResources',
    description: 'Community resources — Discover anime, manga, games, movies, and guild content.',
    category: 'tools',
    icon: '📚',
    port: 3202,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'storage:read'],
    dependencies: ['library'],
  },
  {
    moduleId: 'worlds',
    miniappId: 'imu-worlds',
    name: 'ImuWorlds',
    description: 'Virtual worlds — Explore, create, and join immersive 3D worlds.',
    category: 'entertainment',
    icon: '🌍',
    port: 3203,
    permissions: ['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
    dependencies: ['profile'],
  },
  {
    moduleId: 'contests',
    miniappId: 'imu-contests',
    name: 'ImuContests',
    description: 'Competitions & contests — Participate, challenge friends, and win prizes.',
    category: 'games',
    icon: '🏆',
    port: 3204,
    permissions: ['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
    dependencies: ['games'],
  },
  {
    moduleId: 'dating',
    miniappId: 'imu-dating',
    name: 'ImuDate',
    description: 'Find your match — Discover people nearby, swipe, chat, and connect.',
    category: 'social',
    icon: '💕',
    port: 3205,
    permissions: ['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'chat:send', 'storage:read', 'storage:write'],
    dependencies: ['profile'],
  },
  {
    moduleId: 'smart-home',
    miniappId: 'imu-smart-home',
    name: 'ImuHome',
    description: 'Connected home — Control your smart devices, security, and energy usage.',
    category: 'lifestyle',
    icon: '🏠',
    port: 3206,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
    dependencies: [],
  },
  {
    moduleId: 'mobility',
    miniappId: 'imu-mobility',
    name: 'ImuMove',
    description: 'Transport & mobility — Ride-sharing, public transport, EV charging, and more.',
    category: 'lifestyle',
    icon: '🚗',
    port: 3207,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
    dependencies: ['smart-home'],
  },
  {
    moduleId: 'style-beauty',
    miniappId: 'imu-style-beauty',
    name: 'ImuStyle',
    description: 'Fashion & beauty — Virtual try-on, AI stylist, trends, tutorials, and shopping.',
    category: 'lifestyle',
    icon: '💅',
    port: 3208,
    permissions: ['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
    dependencies: [],
  },
  {
    moduleId: 'sports',
    miniappId: 'imu-sports',
    name: 'ImuSports',
    description: 'Sports hub — Live scores, news, standings, betting, and watch parties.',
    category: 'entertainment',
    icon: '⚽',
    port: 3209,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write', 'wallet:read'],
    dependencies: [],
  },
  {
    moduleId: 'formations',
    miniappId: 'imu-formations',
    name: 'ImuLearn',
    description: 'Education platform — Courses, lessons, quizzes, and certificates.',
    category: 'education',
    icon: '🎓',
    port: 3210,
    permissions: ['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'storage:read', 'storage:write'],
    dependencies: ['library'],
  },
  {
    moduleId: 'finance',
    miniappId: 'imu-finance',
    name: 'ImuFinance',
    description: 'Finance & crypto — Banking, investments, group funds, and cryptocurrency.',
    category: 'finance',
    icon: '💰',
    port: 3211,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'wallet:read', 'storage:read', 'storage:write'],
    dependencies: ['wallet'],
  },
  {
    moduleId: 'library',
    miniappId: 'imu-library',
    name: 'ImuLibrary',
    description: 'Media library — Books, audiobooks, comics, novels, and stories reader.',
    category: 'entertainment',
    icon: '📖',
    port: 3212,
    permissions: ['auth:read', 'theme:read', 'ui:toast', 'ui:modal', 'storage:read', 'storage:write'],
    dependencies: [],
  },
  {
    moduleId: 'services',
    miniappId: 'imu-services',
    name: 'ImuServices',
    description: 'Professional services marketplace — Find pros, book appointments, and manage requests.',
    category: 'tools',
    icon: '🔧',
    port: 3213,
    permissions: ['auth:read', 'auth:profile', 'theme:read', 'ui:toast', 'ui:modal', 'notifications:send', 'chat:send', 'wallet:read', 'storage:read', 'storage:write'],
    dependencies: ['profile'],
  },
];

// ─── Templates ────────────────────────────────────────────────

function makeManifest(mod) {
  return JSON.stringify({
    id: mod.miniappId,
    name: mod.name,
    version: '1.0.0',
    description: mod.description,
    category: mod.category,
    icon: mod.icon,
    author: 'ImuChat Team',
    license: 'MIT',
    entry: 'index.html',
    permissions: mod.permissions,
    dependencies: mod.dependencies,
    size: 0,
    defaultEnabled: false,
    config: {
      sandbox: 'iframe',
      maxStorageSize: 10485760,
      allowedDomains: ['placehold.co', 'picsum.photos', 'api.dicebear.com'],
    },
  }, null, 2);
}

function makePackageJson(mod) {
  return JSON.stringify({
    name: `@imuchat/${mod.moduleId}`,
    version: '1.0.0',
    private: true,
    description: mod.description,
    author: 'ImuChat Team',
    license: 'MIT',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc -b && vite build',
      'build:miniapp': 'NODE_ENV=production tsc -b && vite build',
      'deploy:local': `pnpm build:miniapp && mkdir -p ../web-app/public/miniapps/${mod.miniappId} && cp -r dist/* ../web-app/public/miniapps/${mod.miniappId}/`,
      preview: 'vite preview',
      lint: 'eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0',
      format: 'prettier --write "src/**/*.{ts,tsx,css,json}"',
      'type-check': 'tsc --noEmit',
      clean: 'rm -rf dist node_modules',
    },
    dependencies: {
      '@imuchat/miniapp-sdk': 'workspace:*',
      'lucide-react': '^0.400.0',
      react: '^18.3.0',
      'react-dom': '^18.3.0',
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.3.0',
      autoprefixer: '^10.4.0',
      eslint: '^8.57.0',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-react-refresh': '^0.4.0',
      postcss: '^8.4.0',
      prettier: '^3.2.0',
      tailwindcss: '^3.4.0',
      typescript: '^5.4.0',
      vite: '^5.4.0',
    },
  }, null, 2);
}

function makeViteConfig(mod) {
  return `import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  root: '.',
  base: process.env.NODE_ENV === 'production' ? '/miniapps/${mod.miniappId}/' : '/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    minify: true,
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    port: ${mod.port},
    open: false,
  },
});
`;
}

function makeTsConfig() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }],
  }, null, 2);
}

function makeTsConfigNode() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2023'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['vite.config.ts'],
  }, null, 2);
}

function makeIndexHtml(mod) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${mod.name} — ImuChat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function makePostcssConfig() {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function makeTailwindConfig() {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
`;
}

function makeMainTsx(mod) {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { I18nProvider } from './providers/I18nProvider';
import { ImuChatProvider } from './providers/ImuChatProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ImuChatProvider appId="${mod.miniappId}">
      <I18nProvider>
        <App />
      </I18nProvider>
    </ImuChatProvider>
  </React.StrictMode>,
);
`;
}

function makeImuChatProvider() {
  return `import type { ImuChat } from '@imuchat/miniapp-sdk';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ImuChatContextValue {
  app: ImuChat | null;
  isConnected: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    locale: string;
  } | null;
}

const ImuChatContext = createContext<ImuChatContextValue>({
  app: null,
  isConnected: false,
  user: null,
});

export function useImuChat() {
  return useContext(ImuChatContext);
}

interface Props {
  appId: string;
  children: ReactNode;
}

export function ImuChatProvider({ appId, children }: Props) {
  const [app, setApp] = useState<ImuChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<ImuChatContextValue['user']>(null);

  useEffect(() => {
    let instance: ImuChat | null = null;

    async function init() {
      try {
        const { ImuChat: SDK } = await import('@imuchat/miniapp-sdk');
        instance = SDK.init({ appId });
        await instance.ready();
        setApp(instance);

        const currentUser = await instance.auth.getUser();
        setUser(currentUser);
        setIsConnected(true);
      } catch {
        console.warn(\`[\${appId}] Running in standalone mode (no ImuChat host detected)\`);
        setUser({
          id: 'dev-user',
          username: 'dev',
          displayName: 'Developer',
          avatarUrl: null,
          locale: navigator.language.split('-')[0] || 'en',
        });
        setIsConnected(true);
      }
    }

    init();
    return () => { instance?.destroy(); };
  }, [appId]);

  return (
    <ImuChatContext.Provider value={{ app, isConnected, user }}>
      {children}
    </ImuChatContext.Provider>
  );
}
`;
}

function makeI18nProvider() {
  return `import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import ja from '../i18n/ja.json';
import { useImuChat } from './ImuChatProvider';

type Locale = 'en' | 'fr' | 'ja';
type Messages = typeof en;

const messagesMap: Record<Locale, Messages> = { en, fr, ja };

interface I18nContextValue {
  locale: Locale;
  t: (namespace: string, key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: () => '',
  setLocale: () => {},
});

export function useTranslations(namespace: string): (key: string) => string;
export function useTranslations(): { t: (namespace: string, key: string) => string; locale: Locale };
export function useTranslations(namespace?: string) {
  const { t, locale } = useContext(I18nContext);
  if (namespace) {
    return (key: string) => t(namespace, key);
  }
  return { t, locale };
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

interface Props {
  children: ReactNode;
}

export function I18nProvider({ children }: Props) {
  const { user } = useImuChat();
  const detectedLocale = user?.locale || navigator.language.split('-')[0] || 'en';
  const [locale, setLocale] = useState<Locale>(
    (detectedLocale in messagesMap ? detectedLocale : 'en') as Locale,
  );

  useEffect(() => {
    if (user?.locale && user.locale in messagesMap) {
      setLocale(user.locale as Locale);
    }
  }, [user?.locale]);

  const t = (namespace: string, key: string): string => {
    const msgs = messagesMap[locale] as Record<string, unknown>;
    const parts = namespace ? [...namespace.split('.'), ...key.split('.')] : key.split('.');
    let current: unknown = msgs;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return \`\${namespace}.\${key}\`;
      }
    }
    return typeof current === 'string' ? current : \`\${namespace}.\${key}\`;
  };

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
`;
}

function makeIndexCss() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    margin: 0;
    min-height: 100vh;
  }
  #root {
    min-height: 100vh;
  }
}
`;
}

function makeUtilsTs() {
  return `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
}

// ─── Module-specific App.tsx generators ───────────────────────

function makeAppTsx(mod) {
  // Simple placeholder modules get a basic UI
  if (mod.moduleId === 'voom' || mod.moduleId === 'resources') {
    return makeSimpleApp(mod);
  }
  // All others get a scaffold with navigation
  return makeScaffoldApp(mod);
}

function makeSimpleApp(mod) {
  const pageName = mod.name + 'Page';
  return `import { useImuChat } from './providers/ImuChatProvider';
import { ${pageName} } from './pages/${pageName}';

export default function App() {
  const { isConnected } = useImuChat();

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return <${pageName} />;
}
`;
}

function makeScaffoldApp(mod) {
  return `import { useState } from 'react';
import { useImuChat } from './providers/ImuChatProvider';
import { ${mod.name}Hub } from './pages/${mod.name}Hub';

/**
 * ${mod.name} — Mini-app router.
 * 
 * Routes:
 *   /         → Hub (main page)
 *   /:slug    → Detail page
 */
export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const { isConnected } = useImuChat();

  const navigate = (path: string) => setCurrentRoute(path);
  const goBack = () => setCurrentRoute('/');

  const slug = currentRoute !== '/' ? currentRoute.replace('/', '') : null;

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return <${mod.name}Hub onNavigate={navigate} currentRoute={currentRoute} onBack={goBack} />;
}
`;
}

// ─── Page generators ──────────────────────────────────────────

function makeHubPage(mod) {
  const iconMap = {
    voom: 'Video',
    resources: 'FolderSearch',
    worlds: 'Globe',
    contests: 'Trophy',
    dating: 'Heart',
    'smart-home': 'Home',
    mobility: 'Car',
    'style-beauty': 'Sparkles',
    sports: 'Dumbbell',
    formations: 'GraduationCap',
    finance: 'Wallet',
    library: 'BookOpen',
    services: 'Wrench',
  };

  const icon = iconMap[mod.moduleId] || 'Box';

  if (mod.moduleId === 'voom') {
    return `import { useTranslations } from '../providers/I18nProvider';
import { ${icon} } from 'lucide-react';

export function ImuVoomPage() {
  const t = useTranslations('hub');

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <${icon} className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
        <div className="mt-6 rounded-lg bg-secondary/50 p-3">
          <p className="text-xs text-muted-foreground">{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
`;
  }

  if (mod.moduleId === 'resources') {
    return `import { useTranslations } from '../providers/I18nProvider';
import { ${icon}, Search } from 'lucide-react';
import { useState } from 'react';

const FILTERS = ['all', 'anime', 'manga', 'games', 'movies', 'officialGuilds'];

export function ImuResourcesPage() {
  const t = useTranslations('hub');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={\`rounded-lg px-3 py-2 text-sm font-medium transition-colors \${
                  activeFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }\`}
              >
                {t(filter)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <${icon} className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">{t('placeholder')}</p>
        </div>
      </div>
    </div>
  );
}
`;
  }

  // Generic hub page for complex modules
  return `import { useTranslations } from '../providers/I18nProvider';
import { ${icon} } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  currentRoute: string;
  onBack: () => void;
}

export function ${mod.name}Hub({ onNavigate }: Props) {
  const t = useTranslations('hub');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 p-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <${icon} className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature cards */}
          {['feature1', 'feature2', 'feature3'].map((feature) => (
            <button
              key={feature}
              onClick={() => onNavigate(\`/\${feature}\`)}
              className="group rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary">
                {t(\`\${feature}.title\`)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(\`\${feature}.description\`)}
              </p>
            </button>
          ))}
        </div>

        {/* Coming soon banner */}
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
          <${icon} className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-foreground">{t('comingSoon')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('comingSoonDesc')}</p>
        </div>
      </div>
    </div>
  );
}
`;
}

// ─── I18n generators ──────────────────────────────────────────

function makeI18n(mod, locale) {
  const titles = {
    en: {
      voom: { title: 'Voom', description: 'Short video platform', comingSoon: 'Coming soon — Start creating short videos!' },
      resources: { title: 'Resources', description: 'Explore community resources', searchPlaceholder: 'Search resources...', all: 'All', anime: 'Anime', manga: 'Manga', games: 'Games', movies: 'Movies', officialGuilds: 'Official Guilds', placeholder: 'Resources will appear here' },
      worlds: { title: 'Worlds', subtitle: 'Explore virtual worlds', comingSoon: 'More worlds coming soon', comingSoonDesc: 'Create and explore immersive 3D worlds with your community.', feature1: { title: 'Explore', description: 'Discover new virtual worlds' }, feature2: { title: 'Create', description: 'Build your own world' }, feature3: { title: 'Events', description: 'Join world events' } },
      contests: { title: 'Contests', subtitle: 'Compete and win', comingSoon: 'More contests coming soon', comingSoonDesc: 'Participate in challenges and win prizes.', feature1: { title: 'Active', description: 'Current competitions' }, feature2: { title: 'Create', description: 'Start a new contest' }, feature3: { title: 'Archive', description: 'Past contests' } },
      dating: { title: 'ImuDate', subtitle: 'Find your match', comingSoon: 'More features coming soon', comingSoonDesc: 'Swipe, match, and connect with people near you.', feature1: { title: 'Discover', description: 'Find new people' }, feature2: { title: 'Matches', description: 'Your matches' }, feature3: { title: 'Events', description: 'Dating events' } },
      'smart-home': { title: 'ImuHome', subtitle: 'Smart home control', comingSoon: 'More devices coming soon', comingSoonDesc: 'Control your smart devices, security, and energy.', feature1: { title: 'Devices', description: 'Manage devices' }, feature2: { title: 'Scenes', description: 'Automation scenes' }, feature3: { title: 'Security', description: 'Home security' } },
      mobility: { title: 'ImuMove', subtitle: 'Transport & mobility', comingSoon: 'More routes coming soon', comingSoonDesc: 'Ride-sharing, public transport, and EV charging.', feature1: { title: 'Ride', description: 'Book a ride' }, feature2: { title: 'Transit', description: 'Public transport' }, feature3: { title: 'EV', description: 'EV charging' } },
      'style-beauty': { title: 'ImuStyle', subtitle: 'Fashion & beauty', comingSoon: 'More styles coming soon', comingSoonDesc: 'Virtual try-on, AI stylist, and shopping.', feature1: { title: 'Try-On', description: 'Virtual try-on' }, feature2: { title: 'Trends', description: 'Latest trends' }, feature3: { title: 'Shop', description: 'Beauty shop' } },
      sports: { title: 'ImuSports', subtitle: 'Sports hub', comingSoon: 'More sports coming soon', comingSoonDesc: 'Live scores, news, standings, and watch parties.', feature1: { title: 'Live', description: 'Live scores' }, feature2: { title: 'News', description: 'Sports news' }, feature3: { title: 'Betting', description: 'Sports betting' } },
      formations: { title: 'ImuLearn', subtitle: 'Education platform', comingSoon: 'More courses coming soon', comingSoonDesc: 'Courses, lessons, quizzes, and certificates.', feature1: { title: 'Courses', description: 'Browse courses' }, feature2: { title: 'My Learning', description: 'Your progress' }, feature3: { title: 'Certificates', description: 'Your achievements' } },
      finance: { title: 'ImuFinance', subtitle: 'Finance & crypto', comingSoon: 'More features coming soon', comingSoonDesc: 'Banking, investments, and cryptocurrency.', feature1: { title: 'Bank', description: 'ImuBank' }, feature2: { title: 'Invest', description: 'ImuInvest' }, feature3: { title: 'Crypto', description: 'ImuCrypto' } },
      library: { title: 'ImuLibrary', subtitle: 'Media library', comingSoon: 'More content coming soon', comingSoonDesc: 'Books, audiobooks, comics, and stories.', feature1: { title: 'Books', description: 'Browse books' }, feature2: { title: 'Audiobooks', description: 'Listen to audiobooks' }, feature3: { title: 'Comics', description: 'Read comics' } },
      services: { title: 'ImuServices', subtitle: 'Professional services', comingSoon: 'More services coming soon', comingSoonDesc: 'Find professionals, book appointments.', feature1: { title: 'Browse', description: 'Find professionals' }, feature2: { title: 'Bookings', description: 'Your appointments' }, feature3: { title: 'Emergency', description: 'Emergency services' } },
    },
    fr: {
      voom: { title: 'Voom', description: 'Plateforme de vidéos courtes', comingSoon: 'Bientôt disponible — Créez des vidéos courtes !' },
      resources: { title: 'Ressources', description: 'Explorez les ressources communautaires', searchPlaceholder: 'Rechercher...', all: 'Tout', anime: 'Anime', manga: 'Manga', games: 'Jeux', movies: 'Films', officialGuilds: 'Guildes officielles', placeholder: 'Les ressources apparaîtront ici' },
      worlds: { title: 'Mondes', subtitle: 'Explorez des mondes virtuels', comingSoon: 'Plus de mondes bientôt', comingSoonDesc: 'Créez et explorez des mondes 3D immersifs.', feature1: { title: 'Explorer', description: 'Découvrir de nouveaux mondes' }, feature2: { title: 'Créer', description: 'Construire votre monde' }, feature3: { title: 'Événements', description: 'Événements des mondes' } },
      contests: { title: 'Concours', subtitle: 'Participez et gagnez', comingSoon: 'Plus de concours bientôt', comingSoonDesc: 'Participez à des défis et gagnez des prix.', feature1: { title: 'Actifs', description: 'Compétitions en cours' }, feature2: { title: 'Créer', description: 'Lancer un concours' }, feature3: { title: 'Archives', description: 'Concours passés' } },
      dating: { title: 'ImuDate', subtitle: 'Trouvez votre match', comingSoon: 'Plus de fonctionnalités bientôt', comingSoonDesc: 'Swipez, matchez et connectez-vous.', feature1: { title: 'Découvrir', description: 'Trouver des personnes' }, feature2: { title: 'Matchs', description: 'Vos matchs' }, feature3: { title: 'Événements', description: 'Événements dating' } },
      'smart-home': { title: 'ImuHome', subtitle: 'Maison connectée', comingSoon: 'Plus d\'appareils bientôt', comingSoonDesc: 'Contrôlez vos appareils, sécurité et énergie.', feature1: { title: 'Appareils', description: 'Gérer les appareils' }, feature2: { title: 'Scènes', description: 'Scènes d\'automatisation' }, feature3: { title: 'Sécurité', description: 'Sécurité du domicile' } },
      mobility: { title: 'ImuMove', subtitle: 'Transport & mobilité', comingSoon: 'Plus de trajets bientôt', comingSoonDesc: 'Covoiturage, transports et bornes de recharge.', feature1: { title: 'Trajet', description: 'Réserver un trajet' }, feature2: { title: 'Transport', description: 'Transports en commun' }, feature3: { title: 'VE', description: 'Recharge VE' } },
      'style-beauty': { title: 'ImuStyle', subtitle: 'Mode & beauté', comingSoon: 'Plus de styles bientôt', comingSoonDesc: 'Essayage virtuel, styliste IA et shopping.', feature1: { title: 'Essayage', description: 'Essayage virtuel' }, feature2: { title: 'Tendances', description: 'Dernières tendances' }, feature3: { title: 'Shop', description: 'Boutique beauté' } },
      sports: { title: 'ImuSports', subtitle: 'Hub sportif', comingSoon: 'Plus de sports bientôt', comingSoonDesc: 'Scores en direct, actualités et paris.', feature1: { title: 'Direct', description: 'Scores en direct' }, feature2: { title: 'Actualités', description: 'Actualités sportives' }, feature3: { title: 'Paris', description: 'Paris sportifs' } },
      formations: { title: 'ImuLearn', subtitle: 'Plateforme éducative', comingSoon: 'Plus de cours bientôt', comingSoonDesc: 'Cours, leçons, quiz et certificats.', feature1: { title: 'Cours', description: 'Parcourir les cours' }, feature2: { title: 'Mon parcours', description: 'Votre progression' }, feature3: { title: 'Certificats', description: 'Vos réalisations' } },
      finance: { title: 'ImuFinance', subtitle: 'Finance & crypto', comingSoon: 'Plus de fonctionnalités bientôt', comingSoonDesc: 'Banque, investissements et cryptomonnaie.', feature1: { title: 'Banque', description: 'ImuBank' }, feature2: { title: 'Investir', description: 'ImuInvest' }, feature3: { title: 'Crypto', description: 'ImuCrypto' } },
      library: { title: 'ImuLibrary', subtitle: 'Bibliothèque', comingSoon: 'Plus de contenu bientôt', comingSoonDesc: 'Livres, audiobooks, comics et histoires.', feature1: { title: 'Livres', description: 'Parcourir les livres' }, feature2: { title: 'Audiobooks', description: 'Écouter des audiobooks' }, feature3: { title: 'Comics', description: 'Lire des comics' } },
      services: { title: 'ImuServices', subtitle: 'Services professionnels', comingSoon: 'Plus de services bientôt', comingSoonDesc: 'Trouvez des professionnels et réservez.', feature1: { title: 'Parcourir', description: 'Trouver un professionnel' }, feature2: { title: 'Réservations', description: 'Vos rendez-vous' }, feature3: { title: 'Urgence', description: 'Services d\'urgence' } },
    },
    ja: {
      voom: { title: 'Voom', description: 'ショートビデオプラットフォーム', comingSoon: '近日公開 — ショートビデオを作成しよう！' },
      resources: { title: 'リソース', description: 'コミュニティリソースを探索', searchPlaceholder: '検索...', all: 'すべて', anime: 'アニメ', manga: 'マンガ', games: 'ゲーム', movies: '映画', officialGuilds: '公式ギルド', placeholder: 'リソースがここに表示されます' },
      worlds: { title: 'ワールド', subtitle: '仮想世界を探索', comingSoon: 'さらなるワールドが近日登場', comingSoonDesc: '没入型3Dワールドを作成・探索。', feature1: { title: '探索', description: '新しいワールドを発見' }, feature2: { title: '作成', description: 'あなたのワールドを構築' }, feature3: { title: 'イベント', description: 'ワールドイベント' } },
      contests: { title: 'コンテスト', subtitle: '参加して勝とう', comingSoon: 'さらなるコンテストが近日登場', comingSoonDesc: 'チャレンジに参加して賞品を獲得。', feature1: { title: '進行中', description: '現在の大会' }, feature2: { title: '作成', description: 'コンテストを開始' }, feature3: { title: 'アーカイブ', description: '過去のコンテスト' } },
      dating: { title: 'ImuDate', subtitle: 'マッチを見つけよう', comingSoon: 'さらなる機能が近日登場', comingSoonDesc: 'スワイプ、マッチ、コネクト。', feature1: { title: '発見', description: '新しい人を見つける' }, feature2: { title: 'マッチ', description: 'あなたのマッチ' }, feature3: { title: 'イベント', description: 'デートイベント' } },
      'smart-home': { title: 'ImuHome', subtitle: 'スマートホーム', comingSoon: 'さらなるデバイスが近日登場', comingSoonDesc: 'デバイス、セキュリティ、エネルギーを制御。', feature1: { title: 'デバイス', description: 'デバイス管理' }, feature2: { title: 'シーン', description: '自動化シーン' }, feature3: { title: 'セキュリティ', description: 'ホームセキュリティ' } },
      mobility: { title: 'ImuMove', subtitle: '交通・モビリティ', comingSoon: 'さらなるルートが近日登場', comingSoonDesc: 'ライドシェア、公共交通機関、EV充電。', feature1: { title: 'ライド', description: 'ライドを予約' }, feature2: { title: '交通', description: '公共交通機関' }, feature3: { title: 'EV', description: 'EV充電' } },
      'style-beauty': { title: 'ImuStyle', subtitle: 'ファッション＆ビューティー', comingSoon: 'さらなるスタイルが近日登場', comingSoonDesc: 'バーチャル試着、AIスタイリスト、ショッピング。', feature1: { title: '試着', description: 'バーチャル試着' }, feature2: { title: 'トレンド', description: '最新トレンド' }, feature3: { title: 'ショップ', description: 'ビューティーショップ' } },
      sports: { title: 'ImuSports', subtitle: 'スポーツハブ', comingSoon: 'さらなるスポーツが近日登場', comingSoonDesc: 'ライブスコア、ニュース、スタンディング。', feature1: { title: 'ライブ', description: 'ライブスコア' }, feature2: { title: 'ニュース', description: 'スポーツニュース' }, feature3: { title: 'ベッティング', description: 'スポーツベッティング' } },
      formations: { title: 'ImuLearn', subtitle: '教育プラットフォーム', comingSoon: 'さらなるコースが近日登場', comingSoonDesc: 'コース、レッスン、クイズ、証明書。', feature1: { title: 'コース', description: 'コースを閲覧' }, feature2: { title: 'マイ学習', description: 'あなたの進捗' }, feature3: { title: '証明書', description: 'あなたの実績' } },
      finance: { title: 'ImuFinance', subtitle: 'ファイナンス＆クリプト', comingSoon: 'さらなる機能が近日登場', comingSoonDesc: '銀行、投資、暗号通貨。', feature1: { title: '銀行', description: 'ImuBank' }, feature2: { title: '投資', description: 'ImuInvest' }, feature3: { title: 'クリプト', description: 'ImuCrypto' } },
      library: { title: 'ImuLibrary', subtitle: 'メディアライブラリ', comingSoon: 'さらなるコンテンツが近日登場', comingSoonDesc: '書籍、オーディオブック、コミック。', feature1: { title: '書籍', description: '書籍を閲覧' }, feature2: { title: 'オーディオブック', description: 'オーディオブックを聴く' }, feature3: { title: 'コミック', description: 'コミックを読む' } },
      services: { title: 'ImuServices', subtitle: 'プロフェッショナルサービス', comingSoon: 'さらなるサービスが近日登場', comingSoonDesc: 'プロを見つけて予約。', feature1: { title: '閲覧', description: 'プロを見つける' }, feature2: { title: '予約', description: 'あなたの予約' }, feature3: { title: '緊急', description: '緊急サービス' } },
    },
  };

  return JSON.stringify({ hub: titles[locale]?.[mod.moduleId] || titles.en[mod.moduleId] || {} }, null, 2);
}

// ─── Write files ──────────────────────────────────────────────

function writeFile(path, content) {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, content);
}

// ─── Main ─────────────────────────────────────────────────────

function main() {
  console.log('🚀 Phase B — Generating mini-app scaffolds...\n');

  let created = 0;

  for (const mod of MODULES) {
    const dir = join(ROOT, mod.miniappId);

    if (existsSync(dir)) {
      console.log(`⏭️  ${mod.miniappId}/ already exists, skipping.`);
      continue;
    }

    console.log(`📦 Creating ${mod.miniappId}/...`);

    // Root configuration files
    writeFile(join(dir, 'manifest.json'), makeManifest(mod));
    writeFile(join(dir, 'package.json'), makePackageJson(mod));
    writeFile(join(dir, 'vite.config.ts'), makeViteConfig(mod));
    writeFile(join(dir, 'tsconfig.json'), makeTsConfig());
    writeFile(join(dir, 'tsconfig.node.json'), makeTsConfigNode());
    writeFile(join(dir, 'index.html'), makeIndexHtml(mod));
    writeFile(join(dir, 'postcss.config.js'), makePostcssConfig());
    writeFile(join(dir, 'tailwind.config.js'), makeTailwindConfig());

    // Source files
    writeFile(join(dir, 'src', 'main.tsx'), makeMainTsx(mod));
    writeFile(join(dir, 'src', 'App.tsx'), makeAppTsx(mod));
    writeFile(join(dir, 'src', 'index.css'), makeIndexCss());
    writeFile(join(dir, 'src', 'lib', 'utils.ts'), makeUtilsTs());

    // Providers
    writeFile(join(dir, 'src', 'providers', 'ImuChatProvider.tsx'), makeImuChatProvider());
    writeFile(join(dir, 'src', 'providers', 'I18nProvider.tsx'), makeI18nProvider());

    // I18n
    writeFile(join(dir, 'src', 'i18n', 'en.json'), makeI18n(mod, 'en'));
    writeFile(join(dir, 'src', 'i18n', 'fr.json'), makeI18n(mod, 'fr'));
    writeFile(join(dir, 'src', 'i18n', 'ja.json'), makeI18n(mod, 'ja'));

    // Page component
    const pageName = (mod.moduleId === 'voom' || mod.moduleId === 'resources')
      ? mod.name + 'Page'
      : mod.name + 'Hub';
    writeFile(join(dir, 'src', 'pages', `${pageName}.tsx`), makeHubPage(mod));

    created++;
    console.log(`   ✅ ${mod.miniappId}/ created (${mod.permissions.length} permissions, port ${mod.port})`);
  }

  console.log(`\n✨ Done! Created ${created} mini-app scaffolds.`);
  console.log('\nNext steps:');
  console.log('  1. Add entries to pnpm-workspace.yaml');
  console.log('  2. Run: pnpm install');
  console.log('  3. Run: scripts/build-all-miniapps.sh');
}

main();
