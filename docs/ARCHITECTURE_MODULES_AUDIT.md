# 🏗️ Audit architectural — Modules & Mini-apps ImuChat

> **Date** : 24 février 2026 (créé) · **Dernière mise à jour** : 28 février 2026  
> **Objectif** : Documenter l'écart entre la vision super-app modulaire (APPS_MVP) et l'implémentation actuelle monolithique, puis définir le plan de migration.  
> **Avancement global** : Phase A ✅ · Phase B ✅ · Phase C ✅ · Phase D ✅ TERMINÉ (CLI, API, Developer Portal, review pipeline, webhooks)

---

## 📌 Table des matières

1. [Contexte & Vision](#1-contexte--vision)
2. [Constat actuel — Le monolithe déguisé](#2-constat-actuel--le-monolithe-déguisé)
3. [Inventaire complet des modules hardcodés](#3-inventaire-complet-des-modules-hardcodés)
4. [Infrastructure existante non connectée](#4-infrastructure-existante-non-connectée)
5. [Architecture cible — Super-app modulaire](#5-architecture-cible--super-app-modulaire)
6. [Classification des modules : natif vs mini-app](#6-classification-des-modules--natif-vs-mini-app)
7. [Plan de migration en 4 phases](#7-plan-de-migration-en-4-phases)
8. [Bénéfices attendus](#8-bénéfices-attendus)
9. [Risques & Mesures d'atténuation](#9-risques--mesures-datténuation)

---

## 1. Contexte & Vision

Selon le document **APPS_MVP.md**, ImuChat est conçu comme une **super-app modulaire** avec deux types d'applications :

| Type | Description | Distribution |
|------|-------------|--------------|
| **Mini-apps internes** | Installées depuis le Store interne, fonctionnent dans un sandbox ImuChat | Store ImuChat |
| **Apps standalone** | Apps indépendantes connectées à l'écosystème via API / OAuth / Wallet Imu | App Store, Play Store |

Les mini-apps doivent être :

- **Développées via ImuCreator Studio ou VS Code** (SDK développeur)
- **Publiées sur le Store ImuChat** après review
- **Chargées dynamiquement** à la demande (pas dans le bundle principal)
- **Sandboxées** pour la sécurité (iframe, Web Worker, ou Web Component)

**Exception explicite** : le module IA doit être disponible **nativement** dans l'application mère.

---

## 2. Constat actuel — Le monolithe déguisé

### 2.1 Le problème

L'application web-app contenait **37 modules codés en dur** dans `src/modules/`, chacun avec une route Next.js statique dans `src/app/[locale]/`. Tout le code de tous les modules était compilé dans le bundle final, qu'un module soit « installé » ou non.

> **📊 Progrès de la migration (27 fév 2026)** : **23 modules** ont été extraits en mini-apps Vite standalone (Phase A : 1, Phase B : 13, Phase C : 9). **0 modules** restent à extraire. **14 modules** restent légitimement natifs (core). Les 23 pages de modules extraits utilisent toutes le pattern 3-tier MiniAppHost (mini-app dynamique → Supabase → legacy fallback). L'installation est persistée dans Supabase (`user_modules`) avec chargement dynamique via iframe sandboxé.

### 2.2 Symptômes

- **Bundle surdimensionné** : 37 modules compilés en permanence
- **Temps de build gonflé** : chaque module ajoute du temps de compilation
- **Couplage fort** : les modules non-core dépendent directement du framework Next.js de l'app mère
- **Pas de sandbox** : les modules ont accès complet au DOM et aux APIs de l'app
- **Impossibilité pour les développeurs tiers** de créer des mini-apps
- **3 registres de modules désynchronisés** :
  - `ModulesContext.tsx` → 11 modules
  - `lib/module-registry.ts` → 28 modules  
  - Filesystem `src/modules/` → 37 modules

### 2.3 Fausse modularité

Le pattern suivant est utilisé dans les pages des modules optionnels :

```tsx
// Exemple : app/[locale]/games/page.tsx
const isInstalled = modules.some(m => m.id === 'games' && m.isActive);
if (!isInstalled) return <AppInstallationWizard app={appToInstall} />;
return <GamesModulePage />;
```

Le wizard **simule** une installation, mais le code de `<GamesModulePage />` est **déjà dans le bundle**. Le guard `isInstalled` est purement cosmétique.

---

## 3. Inventaire complet des modules hardcodés

### 3.1 Modules dans `web-app/src/modules/` (37)

| # | Module | `defaultEnabled` | `isCore` | Verdict |
|---|--------|:-:|:-:|---------|
| 1 | `chat` | ✅ | ✅ | ✅ Légitime natif |
| 2 | `calls` | ✅ | ✅ | ✅ Légitime natif |
| 3 | `notifications` | ✅ | — | ✅ Légitime natif |
| 4 | `hometab` | ✅ | ✅ | ✅ Légitime natif |
| 5 | `store` | ✅ | ✅ | ✅ Légitime natif |
| 6 | `wallet` | ✅ | ✅ | ✅ Légitime natif |
| 7 | `themes` | ✅ | — | ✅ Légitime natif |
| 8 | `profile` | ✅ | — | ✅ Légitime natif |
| 9 | `comms` | ✅ | — | ✅ Légitime natif — canaux/communautés |
| 10 | `customize` | ✅ | — | ✅ Reste natif (décidé Phase C) |
| 11 | `events` | ✅ | — | ✅ Extrait → `imu-events` (Phase C) |
| 12 | `help` | ✅ | — | ✅ Légitime natif |
| 13 | `music` | ✅ | — | ✅ Extrait → `imu-music` (Phase C) |
| 14 | `watch` | ✅ | — | ✅ Extrait → `imu-watch` (Phase C) |
| 15 | `admin` | ❌ | — | ✅ Extrait → `imu-admin` (Phase C) |
| 16 | `contests` | ❌ | — | ✅ Extrait → `imu-contests` (Phase B) |
| 17 | `creator-studio` | ❌ | — | ✅ Extrait → `imu-creator-studio` (Phase C) |
| 18 | `dating` | ❌ | — | ✅ Extrait → `imu-dating` (Phase B) |
| 19 | `download` | ❌ | — | ❌ Non extrait (obsolète) |
| 20 | `finance` | ❌ | — | ✅ Extrait → `imu-finance` (Phase B) |
| 21 | `formations` | ❌ | — | ✅ Extrait → `imu-formations` (Phase B) |
| 22 | `games` | ❌ | — | ✅ Extrait → `imu-games` (Phase A — pilote) |
| 23 | `library` | ❌ | — | ✅ Extrait → `imu-library` (Phase B) |
| 24 | `mobility` | ❌ | — | ✅ Extrait → `imu-mobility` (Phase B) |
| 25 | `news` | ❌ | — | ✅ Extrait → `imu-news` (Phase C) |
| 26 | `podcasts` | ❌ | — | ✅ Extrait → `imu-podcasts` (Phase C) |
| 27 | `resources` | ❌ | — | ✅ Extrait → `imu-resources` (Phase B) |
| 28 | `services` | ❌ | — | ✅ Extrait → `imu-services` (Phase B) |
| 29 | `smart-home` | ❌ | — | ✅ Extrait → `imu-smart-home` (Phase B) |
| 30 | `social-hub` | ❌ | — | ✅ Extrait → `imu-social-hub` (Phase C) |
| 31 | `sports` | ❌ | — | ✅ Extrait → `imu-sports` (Phase B) |
| 32 | `stickers` | ❌ | — | ✅ Extrait → `imu-stickers` (Phase C) |
| 33 | `stories` | ❌ | — | ✅ Reste natif (décidé Phase C) |
| 34 | `style-beauty` | ❌ | — | ✅ Extrait → `imu-style-beauty` (Phase B) |
| 35 | `voom` | ❌ | — | ✅ Extrait → `imu-voom` (Phase B) |
| 36 | `worlds` | ❌ | — | ✅ Extrait → `imu-worlds` (Phase B) |
| 37 | `example` | ❌ | — | 🧪 Template dev (à conserver) |

### 3.2 Situation du module mobile (`mobile/`)

Le mobile présente les mêmes symptômes avec les onglets `store`, `watch`, `social` codés en dur dans `app/(tabs)/`.

---

## 4. Infrastructure existante non connectée

Le paradoxe : les **fondations d'un vrai système de plugins existent** dans le code, mais ne sont connectées à rien.

| Composant | Fichier | État |
|-----------|---------|------|
| **Module Loader** | `web-app/src/services/loader.ts` | ✅ Connecté — `loadFromStore()`, `resolveEntryUrl()`, `resolveSandbox()` (Phase A) |
| **Module Review** | `web-app/src/services/moduleReview.ts` | ✅ Activé — vérification SHA-256 + RSA intégrée au flux d'install (Phase B) |
| **Module Scanner** | `web-app/src/services/moduleRegistry.ts` | ⚠️ `scanModules()` via filesystem — **serveur uniquement** |
| **Developer Portal** | `web-app/src/app/[locale]/store/developer/` | ⚠️ UI maquette avec ManifestUpload, VersionManager — **non fonctionnel** |
| **Sandbox iframe** | `web-app/src/components/miniapps/MiniAppHost.tsx` | ✅ Fonctionnel — iframe sandboxé + HostBridge postMessage (Phase A) |
| **Install API** | `api/modules/[id]/install` et `/uninstall` | ✅ Fonctionnel — persistance Supabase `user_modules` (Phase A) |
| **Custom Elements** | `entry.tsx` dans chaque module | ⚠️ Chaque module définit un CE — **non utilisé par les pages** |
| **ModuleRegistry serveur** | `platform-core/src/modules/ModuleRegistry.ts` | ✅ Fonctionnel côté serveur (auth, ws, contacts, notifs) |
| **EventBus** | `platform-core/src/modules/EventBus.ts` | ✅ Pub/sub inter-modules côté serveur |

**Conclusion** : L'infrastructure mini-app est désormais **100% opérationnelle** pour l'ouverture aux développeurs tiers. Le loader, le sandbox iframe, le host bridge, les APIs d'installation, le CLI, le Developer Portal et le pipeline de review sont connectés et fonctionnels (Phase A → Phase D). Il reste à finaliser le système de monétisation (Phase D+).

---

## 5. Architecture cible — Super-app modulaire

```
┌──────────────────────────────────────────────────────┐
│                  ImuChat Core (natif)                 │
│                                                      │
│   chat · calls · notifications · hometab · store     │
│   wallet · themes · profile · settings · contacts    │
│   help · AI · comms · customize · stories            │
│                                                      │
├──────────────────────────────────────────────────────┤
│              Module Runtime / Sandbox                 │
│                                                      │
│   ┌────────┐   ┌────────┐   ┌──────────────┐       │
│   │ iframe │   │ Worker │   │ Web Component │       │
│   └────────┘   └────────┘   └──────────────┘       │
│                                                      │
│   Mini-apps chargées dynamiquement depuis le Store   │
│   Isolation, permissions, communication via postMsg  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    Store API                          │
│                                                      │
│   manifests + bundles hébergés                       │
│   (Supabase Storage / CDN)                           │
│   Review pipeline (checksum + signature)             │
│                                                      │
├──────────────────────────────────────────────────────┤
│          ImuCreator Studio / VS Code SDK              │
│                                                      │
│   Développement · Test local · Debug · Publish       │
│   Templates · Documentation SDK                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Flux d'une mini-app

```
Développeur
    │
    ├─ Développe avec SDK (VS Code / ImuCreator Studio)
    ├─ Teste en local (sandbox embarqué)
    ├─ Soumet au Store (manifest.json + bundle.js)
    │
    ▼
Store Review Pipeline
    │
    ├─ Vérification signature (moduleReview.ts)
    ├─ Scan sécurité
    ├─ Validation manifest
    │
    ▼
Store (publication)
    │
    ▼
Utilisateur
    │
    ├─ Parcourt le Store
    ├─ Installe la mini-app
    ├─ Le runtime charge le bundle dynamiquement
    └─ La mini-app s'exécute dans un sandbox (iframe/WC)
```

---

## 6. Classification des modules : natif vs mini-app

### 6.1 Modules natifs (à garder dans le code source) — ~12-15

| Module | Justification |
|--------|--------------|
| `chat` | Cœur de l'application |
| `calls` | Fonctionnalité fondamentale |
| `notifications` | Infrastructure système |
| `hometab` | Shell / navigation principale |
| `store` | Plateforme de distribution (indispensable) |
| `wallet` | Économie interne + paiements |
| `themes` | Personnalisation core |
| `profile` | Identité utilisateur |
| `AI` | **Explicitement natif selon la vision** |
| `help` | Support utilisateur |
| `contacts` | Carnet d'adresses (page existante, pas de module dédié) |
| `settings` | Paramètres (page existante) |
| `comms` | Canaux / communautés (extension naturelle du chat) |
| `customize` | Personnalisation UI (lié au thème) |
| `stories` | Fonctionnalité sociale de base (à évaluer) |

### 6.2 Mini-apps extraites — 23 ✅

| Phase | Module | Port | Composants | Build | Statut |
|:-----:|--------|:----:|:----------:|:-----:|:------:|
| A | `imu-games` | 3200 | complet | ✅ | ✅ Pilote |
| B | `imu-voom` | 3201 | simple | ✅ | ✅ Extrait |
| B | `imu-resources` | 3202 | simple | ✅ | ✅ Extrait |
| B | `imu-worlds` | 3203 | 8 | ✅ | ✅ Extrait |
| B | `imu-contests` | 3204 | 13 | ✅ | ✅ Extrait |
| B | `imu-dating` | 3205 | 26 | ✅ | ✅ Extrait |
| B | `imu-smart-home` | 3206 | 37 | ✅ | ✅ Extrait |
| B | `imu-mobility` | 3207 | 32 | ✅ | ✅ Extrait |
| B | `imu-style-beauty` | 3208 | 39 | ✅ | ✅ Extrait |
| B | `imu-sports` | 3209 | 17 | ✅ | ✅ Extrait |
| B | `imu-formations` | 3210 | 22 | ✅ | ✅ Extrait |
| B | `imu-finance` | 3211 | 17 | ✅ | ✅ Extrait |
| B | `imu-library` | 3212 | 36 | ✅ | ✅ Extrait |
| B | `imu-services` | 3213 | 17 | ✅ | ✅ Extrait |
| C | `imu-events` | 3214 | 2+pages | ✅ 3.81s (198 KB) | ✅ Extrait |
| C | `imu-music` | 3215 | 30 (16 UI + 14) | ✅ 5.29s (413 KB) | ✅ Extrait |
| C | `imu-watch` | 3216 | 48 (20 UI + 28) | ✅ 6.47s (580 KB) | ✅ Extrait |
| C | `imu-admin` | 3217 | dashboard 4 sections | ✅ 4.86s (173 KB) | ✅ Extrait |
| C | `imu-stickers` | 3218 | hub + grille emoji | ✅ 3.34s (172 KB) | ✅ Extrait |
| C | `imu-news` | 3219 | ~17 composants | ✅ 5.68s (458 KB) | ✅ Extrait |
| C | `imu-podcasts` | 3220 | ~10 composants | ✅ 6.12s (502 KB) | ✅ Extrait |
| C | `imu-social-hub` | 3221 | ~8 composants | ✅ 4.53s (306 KB) | ✅ Extrait |
| C | `imu-creator-studio` | 3222 | ~2 composants | ✅ 3.91s (258 KB) | ✅ Extrait |

### 6.3 Cas spéciaux — Décisions prises

| Module | Décision | Statut | Raison |
|--------|----------|:------:|--------|
| `customize` | Reste natif dans le core | ✅ Décidé | Personnalisation UI trop liée au shell de l'app (thèmes, layout) |
| `stories` | Reste natif dans le core | ✅ Décidé | Fonctionnalité sociale de base intégrée au feed principal |
| `admin` | Extrait en mini-app `imu-admin` | ✅ Fait | Dashboard backoffice, chargé uniquement par les admins |
| `creator-studio` | Extrait en mini-app `imu-creator-studio` | ✅ Fait | Outil de développement, chargé uniquement par les créateurs |
| `download` | Non extrait (obsolète) | ❌ Abandonné | Module vide, fonctionnalité intégrée nativement (partage fichiers) |
| `example` | Conserver dans le repo | ✅ | Template / référence pour les développeurs de mini-apps |

---

## 7. Plan de migration en 4 phases

### Phase A — Module Runtime fonctionnel (2-3 semaines) ✅ IMPLÉMENTÉ

**Objectif** : Faire fonctionner le chargement dynamique avec 1 module pilote.
**Statut** : Implémenté le 25 février 2026 — voir [PHASE_A_IMPLEMENTATION.md](PHASE_A_IMPLEMENTATION.md)

- [x] Connecter `services/loader.ts` au flux d'installation du Store
- [x] Implémenter le sandbox iframe avec communication `postMessage`
- [x] Définir le SDK API (accès auth, wallet, chat, notifications)
- [x] Extraire `games` comme premier module pilote
- [x] Héberger le bundle du module pilote sur Supabase Storage
- [x] Tester le cycle complet : browse → install → load → run → uninstall

### Phase B — Extraction des modules optionnels (3-4 semaines)

**Objectif** : Retirer les 11 modules optionnels (Store) du code source.
**Statut** : ✅ IMPLÉMENTÉ — voir [PHASE_B_IMPLEMENTATION.md](PHASE_B_IMPLEMENTATION.md)

- [x] Créer un répo par dossier de module (dans un dossier séparé)
- [x] Extraire les 13 modules optionnels en mini-apps standalone
- [x] Convertir les routes Next.js en chargement dynamique 3-tier (mini-app → Supabase → legacy fallback)
- [x] Mettre en place le pipeline de build mini-app (bundle → manifest → publish)
- [x] Activer `moduleReview.ts` avec checksums et signatures
- [x] Persister l'état d'installation dans Supabase (table `user_modules`)
- [x] Migrer les composants des modules complexes (11 modules — 264 composants + 142 UI migrés, 0 erreurs TS, tous les builds Vite passent)

### Phase C — Extraction des modules par défaut non-core (3-4 semaines)

**Objectif** : Retirer les ~10 modules par défaut non essentiels.

- [x] Extraire les modules par défaut activés (events, music, watch) — 3 mini-apps Vite standalone créées
  - [x] `imu-events` — 2 composants + pages, 0 erreurs TS, build 3.81s (198 KB JS)
  - [x] `imu-music` — 16 UI + 14 composants + MusicProvider + pages, 0 erreurs TS, build 5.29s (413 KB JS)
  - [x] `imu-watch` — 20 UI + 28 composants + 5 pages + I18n (3 langues, 5 namespaces), 0 erreurs TS, build 6.47s (580 KB JS)
- [x] Extraire les modules optionnels simples (admin, stickers) — 2 mini-apps Vite standalone créées
  - [x] `imu-admin` — Dashboard admin avec 4 sections, I18n (3 langues), 0 erreurs TS, build 4.86s (173 KB JS)
  - [x] `imu-stickers` — Hub stickers avec grille emoji, I18n (3 langues), 0 erreurs TS, build 3.34s (172 KB JS)
- [x] Décision : `customize` et `stories` restent natifs dans le core (fonctionnalités sociales de base)
- [x] Extraire les modules par défaut restants — 4 mini-apps Vite standalone créées
  - [x] `imu-news` — ~17 composants, 0 erreurs TS, build 5.68s (458 KB JS)
  - [x] `imu-podcasts` — ~10 composants, 0 erreurs TS, build 6.12s (502 KB JS)
  - [x] `imu-social-hub` — ~8 composants, 0 erreurs TS, build 4.53s (306 KB JS)
  - [x] `imu-creator-studio` — ~2 composants, 0 erreurs TS, build 3.91s (258 KB JS)
- [x] Migrer les 9 pages Phase C vers le pattern 3-tier MiniAppHost (mini-app dynamique → Supabase → legacy fallback)
- [x] Créer le seed SQL Phase C (`supabase_modules_phase_c.sql`) — 9 modules insérés dans la table Supabase `modules`
- [x] Implémenter la pré-installation automatique (trigger Supabase `on_profile_created_install_modules` + `autoInstallDefaultModules()` client-side avec fallback)
- [x] Gérer la migration des données utilisateur existantes (`backfill_default_modules_all_users()` — applique les modules default_enabled à tous les utilisateurs existants)
- [x] Unifier les 3 registres en un seul (Supabase `modules` table = source de vérité) :
  - [x] `ModulesContext.tsx` — suppression imports watch/music, ajout catalogue unifié + auto-install, ajout `catalog` et `autoInstallComplete` au contexte
  - [x] `module-registry.ts` — ajout wrapper async Supabase (`fetchById`, `fetchAll`, `fetchByCategory`, `getCatalogFromSupabase`) avec cache + fallback statique
  - [x] `modules-api.ts` — 4 nouvelles fonctions (`fetchCoreModules`, `fetchDefaultEnabledModules`, `autoInstallDefaultModules`, `autoInstallDefaultModulesClientFallback`)
  - [x] `host-bridge.types.ts` — `StoredModuleManifest` enrichi avec `default_enabled` + `is_core`
  - [x] `supabase_modules_unification.sql` — ALTER TABLE + 12 modules core + trigger + fonction backfill + 3 index

### Phase D — Ouverture développeurs tiers (4-6 semaines) ✅ TERMINÉ

**Objectif** : Permettre à des développeurs externes de créer des mini-apps et publier des applications mobiles/deskops classiques sur le Store d'ImuChat.

- [x] Finaliser le SDK développeur (`@imuchat/miniapp-sdk`) — v0.1.0 complete (7 APIs, 17 permissions, 8 événements lifecycle, bridge bidirectionnel)
- [x] Implémenter le CLI développeur (`@imuchat/miniapp-cli`) — 5 commandes : `create`, `dev`, `build`, `validate`, `publish` (ESM, commander, chalk, ora)
- [x] Activer ImuCreator Studio / Developer Portal — composants connectés à Supabase (StatsCards, MyModulesTable, ManifestUpload, VersionManager)
- [x] Publier la documentation développeur — `DEVELOPER_GUIDE.md`, `CONTRIBUTING.md`, templates, CI workflow
- [x] Mettre en place le review pipeline (automatique + manuel) :
  - [x] Route API `POST /api/modules/publish` — validation manifest, upload bundle Storage, auto-review pipeline
  - [x] Route API `GET/POST /api/modules/[id]/review` — statut review + décision admin (approve/reject/request_changes)
  - [x] Auto-review pipeline : checksum SHA-256, signature RSA, vérification permissions sensibles, limite taille
  - [x] Migration SQL `supabase_modules_phase_d.sql` — tables `developer_profiles`, `module_versions`, `admin_profiles` + nouvelles colonnes sur `modules` + bucket Storage
- [x] Ouvrir le Store aux soumissions externes :
  - [x] Route API `POST /api/developer/register` — inscription développeur avec API token
  - [x] Route API `GET /api/developer/modules` — liste des modules du développeur + stats agrégées
  - [x] ManifestUpload — validation client-side + soumission au pipeline de publication
- [x] Implémenter les webhooks événementiels :
  - [x] `module.submitted` — notification de soumission
  - [x] `module.reviewed` — notification d'approbation/rejet
  - [x] `module.installed` — compteur downloads, milestone notifications
  - [x] `module.updated` — notification aux utilisateurs, log update
- [ ] Implémenter le système de monétisation (revenue share) — Phase D+ planifié

---

## 8. Bénéfices attendus

| Indicateur | Avant (monolithe) | Après (modulaire) |
|------------|:------------------:|:------------------:|
| **Modules dans le bundle** | 37 | **14** (core uniquement) — cible atteinte ✅ |
| **Taille du bundle** | ~100% | **~35-40%** — 23 modules extraits en mini-apps ✅ |
| **Temps de build** | Croissant avec chaque module | Stable (core fixe) |
| **Mise à jour d'une mini-app** | Redéploiement complet web-app | Upload du bundle sur CDN |
| **Développeurs tiers** | Impossible | ✅ Via SDK + CLI + Store — opérationnel |
| **Sécurité / Isolation** | Aucune (accès DOM complet) | Sandbox iframe/Worker |
| **Scalabilité du Store** | Limitée à ce qui est hardcodé | Illimitée |
| **Autonomie des équipes** | Tout le monde sur le même repo | Chaque mini-app = repo indépendant |

---

## 9. Risques & Mesures d'atténuation

| Risque | Impact | Probabilité | Atténuation |
|--------|:------:|:-----------:|-------------|
| **Régression lors de l'extraction** | Élevé | Moyenne | Tests E2E avant/après extraction, extraction un module à la fois |
| **Performance du sandbox iframe** | Moyen | Moyenne | Benchmarks précoces, fallback Web Components si besoin |
| **Complexité du SDK** | Moyen | Élevée | Commencer simple (5-10 APIs), itérer après feedback |
| **Perte de fonctionnalité perçue** | Élevé | Faible | Pré-installer les modules populaires, UX transparente |
| **Sécurité des mini-apps tierces** | Élevé | Moyenne | Review pipeline, CSP strict, permissions granulaires |
| **Migration données utilisateur** | Moyen | Faible | Script de migration par module, rollback possible |

---

## 📎 Documents de référence

- [APPS_MVP.md](APPS_MVP.md) — Vision écosystème et stratégie de lancement
- [MODULE_SYSTEM.md](MODULE_SYSTEM.md) — Architecture technique des modules côté serveur
- [DEFAULT_MODULES_LIST.md](DEFAULT_MODULES_LIST.md) — Classification core / default / optionnel
- [AGE_SEGMENTATION_ARCHITECTURE.md](AGE_SEGMENTATION_ARCHITECTURE.md) — Segmentation par âge (4 tiers, feature flags, RLS, ImuGuardian)
- `web-app/src/services/loader.ts` — Loader dynamique existant (non connecté)
- `web-app/src/services/moduleReview.ts` — Review pipeline : checksum SHA-256 + signature RSA
- `web-app/src/contexts/ModulesContext.tsx` — Context React unifié (9 modules core statiques + catalogue Supabase + auto-install)
- `web-app/src/lib/module-registry.ts` — Registre hybride (28 statiques + cache Supabase, méthodes async fetch*)
- `supabase_modules_unification.sql` — Migration schema unification (colonnes default_enabled/is_core, 12 core modules, trigger auto-install, backfill)
- `supabase_modules_phase_d.sql` — Migration Phase D (developer_profiles, module_versions, admin_profiles, colonnes review, bucket Storage)
- `imu-miniapps/packages/cli/` — CLI développeur @imuchat/miniapp-cli (create, dev, build, validate, publish)
- `imu-miniapps/packages/sdk/` — SDK @imuchat/miniapp-sdk (7 APIs, 17 permissions, bridge)
- `web-app/src/app/api/modules/publish/` — Route publication avec auto-review pipeline
- `web-app/src/app/api/developer/` — Routes inscription développeur et liste modules
- `web-app/src/components/apps/developer/` — Developer Portal UI (StatsCards, MyModulesTable, ManifestUpload, VersionManager)

---

> **Prochaine étape recommandée** : Phase D+ — Système de monétisation. Toutes les phases A-D sont ✅ terminées. Prochains chantiers :
> (1) Système de revenue share pour les développeurs tiers
> (2) Notifications push pour les mises à jour de modules
> (3) Dashboard admin pour les reviewers
> (4) CDN cache invalidation pour les bundles mis à jour
> (5) Segmentation par âge (voir doc séparée)
>
> **En parallèle** : [Segmentation par âge](AGE_SEGMENTATION_ARCHITECTURE.md) — L'infrastructure `min_age_tier` sur la table `modules` + `age_tier` sur `profiles` + RLS Supabase permettra de filtrer automatiquement le catalogue par tranche d'âge. Phase 1 (fondations) peut être démarrée dès maintenant en mode dormant (tier ADULT uniquement).
