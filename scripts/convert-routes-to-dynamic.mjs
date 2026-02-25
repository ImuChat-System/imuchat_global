#!/usr/bin/env node

/**
 * Phase B — Convert all legacy route pages to dynamic MiniAppHost loading.
 *
 * This script replaces the static module import pattern with the dynamic
 * three-tier loading pattern: MiniApp → Supabase → Legacy fallback.
 *
 * Usage: node scripts/convert-routes-to-dynamic.mjs
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ROUTES_BASE = join(ROOT, 'web-app', 'src', 'app', '[locale]');

const MODULES = [
  { moduleId: 'voom', miniappId: 'imu-voom', importName: 'VoomModulePage', functionName: 'VoomLoaderPage' },
  { moduleId: 'resources', miniappId: 'imu-resources', importName: 'ResourcesModulePage', functionName: 'ResourcesLoaderPage' },
  { moduleId: 'worlds', miniappId: 'imu-worlds', importName: 'WorldsModulePage', functionName: 'WorldsLoaderPage' },
  { moduleId: 'contests', miniappId: 'imu-contests', importName: 'ContestsModulePage', functionName: 'ContestsLoaderPage' },
  { moduleId: 'dating', miniappId: 'imu-dating', importName: 'DatingModulePage', functionName: 'DatingLoaderPage' },
  { moduleId: 'smart-home', miniappId: 'imu-smart-home', importName: 'SmartHomeModulePage', functionName: 'SmartHomeLoaderPage' },
  { moduleId: 'mobility', miniappId: 'imu-mobility', importName: 'MobilityModulePage', functionName: 'MobilityLoaderPage' },
  { moduleId: 'style-beauty', miniappId: 'imu-style-beauty', importName: 'StyleBeautyModulePage', functionName: 'StyleBeautyLoaderPage' },
  { moduleId: 'sports', miniappId: 'imu-sports', importName: 'SportsModulePage', functionName: 'SportsLoaderPage' },
  { moduleId: 'formations', miniappId: 'imu-formations', importName: 'FormationsModulePage', functionName: 'FormationsLoaderPage' },
  { moduleId: 'finance', miniappId: 'imu-finance', importName: 'FinanceModulePage', functionName: 'FinanceLoaderPage' },
  { moduleId: 'library', miniappId: 'imu-library', importName: 'LibraryModulePage', functionName: 'LibraryLoaderPage' },
  { moduleId: 'services', miniappId: 'imu-services', importName: 'ServicesModulePage', functionName: 'ServicesLoaderPage' },
];

function makeDynamicPage({ moduleId, miniappId, importName, functionName }) {
  return `'use client';

import { AppInstallationWizard } from '@/components/apps/install/AppInstallationWizard';
import MiniAppHost from '@/components/miniapps/MiniAppHost';
import { useModules } from '@/contexts/ModulesContext';
import type { ModuleDefinition } from '@/lib/module-registry';
import { moduleRegistry } from '@/lib/module-registry';
import type { StoredModuleManifest } from '@/services/host-bridge.types';
import * as modulesApi from '@/services/modules-api';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const MODULE_ID = '${moduleId}';
const MINIAPP_ID = '${miniappId}';

export default function ${functionName}() {
  const { modules, miniApps } = useModules();
  const router = useRouter();
  const [showInstallWizard, setShowInstallWizard] = useState(false);
  const [appToInstall, setAppToInstall] = useState<ModuleDefinition | null>(null);
  const [miniAppManifest, setMiniAppManifest] = useState<StoredModuleManifest | null>(null);
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Priority 1: Check dynamic mini-app from context (loaded from Supabase)
  const dynamicMiniApp = miniApps.find(
    (ma) => ma.manifest.id === MINIAPP_ID && ma.isActive,
  );

  // Fallback: Check legacy module system
  const isLegacyInstalled = modules.some((m) => m.id === MODULE_ID && m.isActive);

  useEffect(() => {
    async function checkMiniApp() {
      setLoading(true);

      // Priority 1: Dynamic mini-app already loaded in context
      if (dynamicMiniApp) {
        setMiniAppManifest(dynamicMiniApp.manifest);
        setGrantedPermissions(dynamicMiniApp.userModule.granted_permissions);
        setLoading(false);
        return;
      }

      // Priority 2: Fetch manifest from Supabase
      try {
        const manifest = await modulesApi.fetchModuleById(MINIAPP_ID);
        if (manifest) {
          const installed = await modulesApi.isModuleInstalled(MINIAPP_ID);
          if (installed) {
            setMiniAppManifest(manifest);
            setGrantedPermissions(manifest.permissions);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Supabase unavailable — fallback to legacy
      }

      // Priority 3: Legacy fallback (hardcoded module)
      if (isLegacyInstalled) {
        setLoading(false);
        return;
      }

      // Not installed → show install wizard
      const appData = moduleRegistry.getById(MODULE_ID);
      if (appData) {
        setAppToInstall(appData);
        setShowInstallWizard(true);
      } else {
        router.replace(\`/store/detail/\${MODULE_ID}\`);
      }
      setLoading(false);
    }

    checkMiniApp();
  }, [dynamicMiniApp, isLegacyInstalled, router]);

  const handleWizardClose = () => {
    setShowInstallWizard(false);
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Not installed → install wizard
  if (!miniAppManifest && !isLegacyInstalled) {
    if (showInstallWizard && appToInstall) {
      return (
        <AppInstallationWizard
          app={appToInstall}
          onClose={handleWizardClose}
        />
      );
    }
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Dynamic loading via MiniAppHost (new architecture)
  if (miniAppManifest) {
    return (
      <MiniAppHost
        manifest={miniAppManifest}
        grantedPermissions={grantedPermissions}
        height="100vh"
        onClose={() => router.back()}
        onError={(error) => {
          console.error('[${miniappId} MiniApp Error]', error);
        }}
      />
    );
  }

  // Legacy fallback: load from bundle (temporary backward compatibility)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ${importName} = require('@/modules/${moduleId}/ui/page').default;
  return <${importName} />;
}
`;
}

// ─── Main ─────────────────────────────────────────────────────

function main() {
  console.log('🔄 Phase B — Converting route pages to dynamic loading...\n');

  for (const mod of MODULES) {
    const pagePath = join(ROUTES_BASE, mod.moduleId, 'page.tsx');
    const content = makeDynamicPage(mod);
    writeFileSync(pagePath, content);
    console.log(`   ✅ ${mod.moduleId}/page.tsx → dynamic MiniAppHost`);
  }

  console.log(`\n✨ Done! Converted ${MODULES.length} route pages.`);
}

main();
