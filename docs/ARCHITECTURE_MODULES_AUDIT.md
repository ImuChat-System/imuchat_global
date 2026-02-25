# 🏗️ Audit architectural — Modules & Mini-apps ImuChat

> **Date** : 24 février 2026  
> **Objectif** : Documenter l'écart entre la vision super-app modulaire (APPS_MVP) et l'implémentation actuelle monolithique, puis définir le plan de migration.

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

L'application web-app contient **37 modules codés en dur** dans `src/modules/`, chacun avec une route Next.js statique dans `src/app/[locale]/`. **Tout le code de tous les modules est compilé dans le bundle final**, qu'un module soit « installé » ou non.

L'« installation » d'un module via le Store est une simple **bascule d'état React** dans un Context — aucun chargement dynamique réel.

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
| 9 | `comms` | ✅ | — | ⚠️ À évaluer — canaux/communautés |
| 10 | `customize` | ✅ | — | ⚠️ À évaluer — personnalisation UI |
| 11 | `events` | ✅ | — | ❌ Mini-app (ImuEvents) |
| 12 | `help` | ✅ | — | ✅ Légitime natif |
| 13 | `music` | ✅ | — | ❌ Mini-app |
| 14 | `watch` | ✅ | — | ❌ Mini-app (ImuWatch) |
| 15 | `admin` | ❌ | — | ❌ Mini-app (backoffice) |
| 16 | `contests` | ❌ | — | ❌ Mini-app |
| 17 | `creator-studio` | ❌ | — | ⚠️ Spécial — outil dev |
| 18 | `dating` | ❌ | — | ❌ Mini-app |
| 19 | `download` | ❌ | — | ❌ Mini-app |
| 20 | `finance` | ❌ | — | ❌ Mini-app |
| 21 | `formations` | ❌ | — | ❌ Mini-app |
| 22 | `games` | ❌ | — | ❌ Mini-app |
| 23 | `library` | ❌ | — | ❌ Mini-app |
| 24 | `mobility` | ❌ | — | ❌ Mini-app |
| 25 | `news` | ❌ | — | ❌ Mini-app |
| 26 | `podcasts` | ❌ | — | ❌ Mini-app |
| 27 | `resources` | ❌ | — | ❌ Mini-app |
| 28 | `services` | ❌ | — | ❌ Mini-app |
| 29 | `smart-home` | ❌ | — | ❌ Mini-app |
| 30 | `social-hub` | ❌ | — | ❌ Mini-app |
| 31 | `sports` | ❌ | — | ❌ Mini-app |
| 32 | `stickers` | ❌ | — | ❌ Mini-app |
| 33 | `stories` | ❌ | — | ⚠️ À évaluer — peut être natif |
| 34 | `style-beauty` | ❌ | — | ❌ Mini-app |
| 35 | `voom` | ❌ | — | ❌ Mini-app |
| 36 | `worlds` | ❌ | — | ❌ Mini-app |
| 37 | `example` | ❌ | — | 🧪 Template dev (à conserver) |

### 3.2 Situation du module mobile (`mobile/`)

Le mobile présente les mêmes symptômes avec les onglets `store`, `watch`, `social` codés en dur dans `app/(tabs)/`.

---

## 4. Infrastructure existante non connectée

Le paradoxe : les **fondations d'un vrai système de plugins existent** dans le code, mais ne sont connectées à rien.

| Composant | Fichier | État |
|-----------|---------|------|
| **Module Loader** | `web-app/src/services/loader.ts` | ⚠️ Supporte iframe, Worker, Custom Element — **non utilisé** |
| **Module Review** | `web-app/src/services/moduleReview.ts` | ⚠️ Vérification SHA-256 + RSA — **aucun module n'a de signature** |
| **Module Scanner** | `web-app/src/services/moduleRegistry.ts` | ⚠️ `scanModules()` via filesystem — **serveur uniquement** |
| **Developer Portal** | `web-app/src/app/[locale]/store/developer/` | ⚠️ UI maquette avec ManifestUpload, VersionManager — **non fonctionnel** |
| **Sandbox iframe** | Dans `store/developer/page.tsx` | ⚠️ Placeholder `<iframe srcDoc="">` — **vide** |
| **Install API** | `api/modules/[id]/install` et `/update` | ⚠️ Routes existantes — **sans persistance DB** |
| **Custom Elements** | `entry.tsx` dans chaque module | ⚠️ Chaque module définit un CE — **non utilisé par les pages** |
| **ModuleRegistry serveur** | `platform-core/src/modules/ModuleRegistry.ts` | ✅ Fonctionnel côté serveur (auth, ws, contacts, notifs) |
| **EventBus** | `platform-core/src/modules/EventBus.ts` | ✅ Pub/sub inter-modules côté serveur |

**Conclusion** : ~70% de l'infrastructure mini-app est codée. Il manque principalement l'**intégration bout-en-bout**.

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

### 6.2 Mini-apps à extraire (à publier sur le Store) — ~22

| Priorité | Module | Nom Store | Complexité extraction |
|:--------:|--------|-----------|:----:|
| 🔴 1 | `games` | ImuGames | Faible |
| 🔴 1 | `dating` | ImuDate | Faible |
| 🔴 1 | `smart-home` | ImuHome | Faible |
| 🔴 1 | `mobility` | ImuMove | Faible |
| 🔴 1 | `style-beauty` | ImuStyle | Faible |
| 🔴 1 | `worlds` | ImuWorlds | Faible |
| 🟠 2 | `sports` | ImuSports | Faible |
| 🟠 2 | `contests` | ImuContests | Faible |
| 🟠 2 | `formations` | ImuLearn | Faible |
| 🟠 2 | `finance` | ImuFinance | Moyenne |
| 🟠 2 | `library` | ImuLibrary | Faible |
| 🟠 2 | `resources` | ImuResources | Faible |
| 🟠 2 | `services` | ImuServices | Faible |
| 🟠 2 | `voom` | ImuVoom | Faible |
| 🟡 3 | `news` | ImuNews | Moyenne |
| 🟡 3 | `podcasts` | ImuPodcasts | Moyenne |
| 🟡 3 | `music` | ImuMusic | Moyenne |
| 🟡 3 | `watch` | ImuWatch | Moyenne |
| 🟡 3 | `events` | ImuEvents | Moyenne |
| 🟡 3 | `stickers` | ImuStickers | Moyenne |
| 🟡 3 | `social-hub` | ImuSocial | Moyenne |
| 🟡 3 | `download` | ImuDownload | Faible |

### 6.3 Cas spéciaux

| Module | Décision | Raison |
|--------|----------|--------|
| `creator-studio` | App standalone ou section du Store | Outil de développement, pas une mini-app utilisateur |
| `admin` | Panel séparé ou mini-app admin | Backoffice, accès restreint |
| `example` | Conserver dans le repo | Template / référence pour les développeurs de mini-apps |

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
- [ ] Extraire les modules par défaut restants (news, podcasts, etc.)
- [ ] Implémenter le pré-installation automatique (ces modules sont installés par défaut mais restent des mini-apps)
- [ ] Gérer la migration des données utilisateur existantes
- [ ] Unifier les 3 registres en un seul (Supabase `modules` table)

### Phase D — Ouverture développeurs tiers (4-6 semaines)

**Objectif** : Permettre à des développeurs externes de créer des mini-apps.

- [ ] Finaliser le SDK développeur (`@imuchat/miniapp-sdk`)
- [ ] Activer ImuCreator Studio / VS Code Extension
- [ ] Publier la documentation développeur
- [ ] Mettre en place le review pipeline (automatique + manuel)
- [ ] Ouvrir le Store aux soumissions externes
- [ ] Implémenter le système de monétisation (revenue share)

---

## 8. Bénéfices attendus

| Indicateur | Avant (monolithe) | Après (modulaire) |
|------------|:------------------:|:------------------:|
| **Modules dans le bundle** | 37 | ~12-15 (core uniquement) |
| **Taille du bundle** | ~100% | ~35-40% (estimation) |
| **Temps de build** | Croissant avec chaque module | Stable (core fixe) |
| **Mise à jour d'une mini-app** | Redéploiement complet web-app | Upload du bundle sur CDN |
| **Développeurs tiers** | Impossible | ✅ Via SDK + Store |
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
- `web-app/src/services/loader.ts` — Loader dynamique existant (non connecté)
- `web-app/src/services/moduleReview.ts` — Review pipeline existant (non connecté)
- `web-app/src/contexts/ModulesContext.tsx` — Context React actuel (11 modules hardcodés)
- `web-app/src/lib/module-registry.ts` — Registre statique (28 modules)

---

> **Prochaine étape recommandée** : Démarrer la Phase A avec le module `games` comme pilote pour valider le runtime avant toute extraction massive.
