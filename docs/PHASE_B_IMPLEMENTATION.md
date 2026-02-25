# Phase B — Extraction des modules optionnels

> **Statut** : ✅ IMPLÉMENTÉ  
> **Date** : Juillet 2025  
> **Prérequis** : Phase A (imu-games pilote, MiniAppHost, HostBridge, Supabase tables)

---

## Résumé

La Phase B extrait **13 modules optionnels** du monolithe `web-app` en mini-apps standalone.
Chaque mini-app est un projet Vite+React indépendant, servi en iframe via `MiniAppHost`.

Les routes Next.js existantes ont été converties en **chargement dynamique à 3 niveaux** :
1. Mini-app dynamique (contexte ModulesContext)
2. Lookup Supabase (table `modules`)
3. Fallback legacy (import bundlé, rétrocompatibilité)

---

## Mini-apps créées

| # | Mini-app ID | Module ID | Port | Catégorie | Complexité |
|---|---|---|---|---|---|
| 1 | `imu-voom` | voom | 3201 | social | Simple (0 composants) |
| 2 | `imu-resources` | resources | 3202 | productivity | Simple (0 composants) |
| 3 | `imu-worlds` | worlds | 3203 | social | Moyen (7 composants) |
| 4 | `imu-contests` | contests | 3204 | entertainment | Moyen (12 composants) |
| 5 | `imu-dating` | dating | 3205 | social | Complexe (26 composants) |
| 6 | `imu-smart-home` | smart-home | 3206 | iot | Très complexe (37 composants) |
| 7 | `imu-mobility` | mobility | 3207 | transport | Complexe (22 composants) |
| 8 | `imu-style-beauty` | style-beauty | 3208 | lifestyle | Très complexe (39 composants) |
| 9 | `imu-sports` | sports | 3209 | health | Moyen (16 composants) |
| 10 | `imu-formations` | formations | 3210 | education | Complexe (20 composants) |
| 11 | `imu-finance` | finance | 3211 | finance | Complexe (24 composants) |
| 12 | `imu-library` | library | 3212 | education | Très complexe (36 composants) |
| 13 | `imu-services` | services | 3213 | marketplace | Complexe (30 composants) |

---

## Graphe de dépendances inter-modules

```
mobility ──→ smart-home
formations ──→ library
finance ──→ wallet (core)
services ──→ profile (core)
library ──→ music (core), marketplace (core)
```

---

## Architecture de chaque mini-app

```
imu-<name>/
├── manifest.json              # Manifest du module (permissions, deps, etc.)
├── package.json               # deps + scripts (dev, build, deploy:local)
├── vite.config.ts             # Vite avec base=/miniapps/imu-<name>/
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── postcss.config.js
├── tailwind.config.js         # Design tokens ImuChat
└── src/
    ├── main.tsx               # Point d'entrée React
    ├── App.tsx                 # Router principal avec pages
    ├── index.css              # Tailwind + variables CSS ImuChat
    ├── lib/
    │   └── utils.ts           # cn() helper
    ├── providers/
    │   ├── ImuChatProvider.tsx # Bridge SDK vers la plateforme hôte
    │   └── I18nProvider.tsx    # Internationalisation (en/fr/ja)
    ├── i18n/
    │   ├── en.json
    │   ├── fr.json
    │   └── ja.json
    └── pages/
        └── <Name>Hub.tsx      # Page principale (scaffold ou composant complet)
```

---

## Permissions par module

| Module | Permissions |
|---|---|
| voom | camera, microphone, storage, notifications, media |
| resources | storage, notifications, search, offline |
| worlds | camera, microphone, storage, notifications, location, ar, media |
| contests | camera, storage, notifications, media, payments, social, analytics, push |
| dating | camera, microphone, storage, notifications, location, contacts, media, social, analytics |
| smart-home | storage, notifications, location, bluetooth, network, iot, background |
| mobility | storage, notifications, location, payments, maps, transport, background |
| style-beauty | camera, storage, notifications, media, ar, social, analytics |
| sports | camera, storage, notifications, location, health, media, social, analytics |
| formations | storage, notifications, media, payments, offline, social, certificates, analytics |
| finance | storage, notifications, payments, biometric, analytics, banking, crypto |
| library | storage, notifications, media, offline, search, bookmarks |
| services | storage, notifications, location, payments, media, contacts, calendar, maps, social, analytics |

---

## Chargement dynamique (3 niveaux)

Chaque page de route (`web-app/src/app/[locale]/<moduleId>/page.tsx`) suit ce pattern :

```tsx
// 1. Mini-app dynamique (contexte React)
const dynamicMiniApp = miniApps.find(
  (ma) => ma.manifest.id === MINIAPP_ID && ma.isActive
);

// 2. Lookup Supabase
const manifest = await modulesApi.fetchModuleById(MINIAPP_ID);
const installed = await modulesApi.isModuleInstalled(MINIAPP_ID);

// 3. Fallback legacy
const LegacyPage = require('@/modules/<moduleId>/ui/page').default;
```

**Avantage** : Zéro downtime pendant la migration progressive. Les composants legacy continuent de fonctionner tant que la mini-app ne les remplace pas complètement.

---

## Vérification d'intégrité (moduleReview)

Le flux d'installation (`/api/modules/[id]/install`) intègre désormais une vérification de checksums :

- **SHA-256** : checksum du bundle entry calculé à la volée
- **RSA-SHA256** : signature du checksum vérifiée avec `MODULE_REVIEW_PUBLIC_KEY`
- **Progressive** : la vérification ne s'active que si le module a un checksum ET une signature ET que la clé publique est configurée en env
- Les modules Phase B sans checksum passent sans erreur (log warning)

```bash
# Pour activer la vérification :
MODULE_REVIEW_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

---

## Pipeline de build

### Build unique
```bash
cd imu-voom && pnpm deploy:local
```

### Build global (14 mini-apps)
```bash
# Depuis la racine du monorepo
pnpm build:miniapps

# Ou directement :
bash scripts/build-all-miniapps.sh

# Build sélectif :
bash scripts/build-all-miniapps.sh imu-games imu-voom imu-dating
```

Le script :
1. Installe les dépendances (`pnpm install`)
2. Build chaque mini-app via `pnpm deploy:local`
3. Copie les fichiers dans `web-app/public/miniapps/<miniapp-id>/`
4. Génère un manifest global `web-app/public/miniapps/manifest.json`

### Seeding Supabase
```bash
# Phase A (tables + imu-games) :
psql -f supabase_modules.sql

# Phase B (13 modules) :
psql -f supabase_modules_phase_b.sql
```

---

## Statut de migration des composants

| Module | Scaffold | Composants migrés | TS Errors | Build | Status |
|---|:---:|:---:|:---:|:---:|---|
| imu-games | ✅ | ✅ (complet) | 0 | ✅ | Phase A — Pilote |
| imu-voom | ✅ | ✅ (simple) | 0 | ✅ | Complet |
| imu-resources | ✅ | ✅ (simple) | 0 | ✅ | Complet |
| imu-worlds | ✅ | ✅ 8/8 | 0 | ✅ | Migré — 0 erreurs |
| imu-contests | ✅ | ✅ 13/13 | 0 | ✅ | Migré — 0 erreurs |
| imu-dating | ✅ | ✅ 26/26 | 0 | ✅ | Migré — 0 erreurs |
| imu-smart-home | ✅ | ✅ 37/37 | 0 | ✅ | Migré — 0 erreurs |
| imu-mobility | ✅ | ✅ 32/32 | 0 | ✅ | Migré — 0 erreurs |
| imu-style-beauty | ✅ | ✅ 39/39 | 0 | ✅ | Migré — 0 erreurs |
| imu-sports | ✅ | ✅ 17/17 | 0 | ✅ | Migré — 0 erreurs |
| imu-formations | ✅ | ✅ 22/22 | 0 | ✅ | Migré — 0 erreurs |
| imu-finance | ✅ | ✅ 17/17 | 0 | ✅ | Migré — 0 erreurs |
| imu-library | ✅ | ✅ 36/36 | 0 | ✅ | Migré — 0 erreurs |
| imu-services | ✅ | ✅ 17/17 | 0 | ✅ | Migré — 0 erreurs |

> **Migration complète** (264 composants + 142 UI + types + data + i18n + contexts).  
> Tous les 11 modules passent `tsc --noEmit` (0 erreurs) et `vite build` avec succès.  
> Script: `node scripts/migrate-module-components.mjs --all`

---

## Fichiers créés / modifiés

### Nouveaux fichiers
| Fichier | Description |
|---|---|
| `scripts/generate-phase-b-miniapps.mjs` | Script de génération des 13 scaffolds |
| `scripts/convert-routes-to-dynamic.mjs` | Script de conversion des routes en chargement dynamique |
| `scripts/build-all-miniapps.sh` | Pipeline de build global |
| `scripts/migrate-module-components.mjs` | Migration automatisée des composants web-app → mini-apps |
| `scripts/fix-ts-errors.mjs` | Correction batch des erreurs TS post-migration |
| `scripts/fix-i18n-overloads.py` | Fix des overloads useTranslations |
| `scripts/install-missing-deps.mjs` | Installation des dépendances radix-ui manquantes |
| `supabase_modules_phase_b.sql` | Seeds des 13 modules en base |
| `imu-voom/` — `imu-services/` | 13 répertoires de mini-apps |

### Fichiers modifiés
| Fichier | Modification |
|---|---|
| `pnpm-workspace.yaml` | +13 workspace entries |
| `package.json` (racine) | +scripts (build:miniapps, etc.) |
| `web-app/src/app/api/modules/[id]/install/route.ts` | +moduleReview checksum verification |
| 13× `web-app/src/app/[locale]/<module>/page.tsx` | Convertis en chargement dynamique 3-tier |

---

## Prochaines étapes (Phase C)

La Phase C prévue dans l'audit concerne :

1. **Store UI** : Interface de découverte et installation des mini-apps
2. **Migration composants** : Déplacer les composants de `web-app/src/components/<module>/` vers les mini-apps (par ordre de complexité croissante)
3. **Suppression code legacy** : Une fois tous les composants migrés, supprimer les dossiers `web-app/src/modules/<module>/` et `web-app/src/components/<module>/`
4. **CI/CD** : Pipeline de build et déploiement automatique des mini-apps
5. **Checksums** : Générer automatiquement les checksums et signatures lors du build
6. **Hot-reload** : Support du rechargement à chaud des mini-apps en développement via le HostBridge
