# 📦 Stratégie Modulaire Mobile — Mini-Apps & Store ImuChat

> **Date de création** : 27 février 2026  
> **Statut** : Phase de planification — aucune implémentation mobile encore  
> **Pré-requis** : `supabase_modules_unification.sql` exécuté en production  
> **Réf** : [ARCHITECTURE_MODULES_AUDIT.md](../docs/ARCHITECTURE_MODULES_AUDIT.md) · [MOBILE_TODO_TRACKER.md](MOBILE_TODO_TRACKER.md) DEV-027

---

## 📋 Table des matières

1. [Contexte — Ce qui existe déjà côté web](#1-contexte--ce-qui-existe-déjà-côté-web)
2. [État actuel du mobile](#2-état-actuel-du-mobile)
3. [Architecture cible mobile](#3-architecture-cible-mobile)
4. [Classification des modules pour le mobile](#4-classification-des-modules-pour-le-mobile)
5. [Stratégie de chargement dynamique sur React Native](#5-stratégie-de-chargement-dynamique-sur-react-native)
6. [Backend partagé — Ce qui est réutilisable immédiatement](#6-backend-partagé--ce-qui-est-réutilisable-immédiatement)
7. [Plan d'implémentation mobile](#7-plan-dimplémentation-mobile)
8. [Store mobile — Du mock au réel](#8-store-mobile--du-mock-au-réel)
9. [Contraintes & Différences mobile vs web](#9-contraintes--différences-mobile-vs-web)
10. [Risques & Atténuation](#10-risques--atténuation)

---

## 1. Contexte — Ce qui existe déjà côté web

L'application web a terminé **Phases A, B, C** de la migration modulaire (voir [ARCHITECTURE_MODULES_AUDIT.md](../docs/ARCHITECTURE_MODULES_AUDIT.md)) :

### 1.1 Mini-apps web extraites (23)

| Phase | Nb  | Exemples                                                           |  Build  | Sandbox |
| :---: | :-: | ------------------------------------------------------------------ | :-----: | :-----: |
|   A   |  1  | `imu-games` (pilote)                                               | ✅ Vite | iframe  |
|   B   | 13  | `imu-dating`, `imu-finance`, `imu-sports`, `imu-worlds`...         | ✅ Vite | iframe  |
|   C   |  9  | `imu-events`, `imu-music`, `imu-watch`, `imu-admin`, `imu-news`... | ✅ Vite | iframe  |

Chaque mini-app web est un **projet Vite standalone** avec :

- Son propre `package.json`, build indépendant
- Port dev dédié (3200-3222)
- Communication via `postMessage` + `HostBridge`
- Hébergement sur Supabase Storage / CDN

### 1.2 Composants web clés

| Composant           | Fichier                                                      | Rôle                                                                                                           |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **MiniAppHost**     | `web-app/src/components/miniapps/MiniAppHost.tsx` (428 lig.) | Charge les mini-apps dans un iframe sandboxé, gère le cycle de vie complet (load → connect → bridge → cleanup) |
| **HostBridge**      | `web-app/src/services/host-bridge.ts`                        | Communication bidirectionnelle postMessage entre l'app mère et les mini-apps                                   |
| **Loader**          | `web-app/src/services/loader.ts` (139 lig.)                  | `loadFromStore()`, `resolveEntryUrl()`, `resolveSandbox()` — chargement dynamique depuis CDN                   |
| **Module Review**   | `web-app/src/services/moduleReview.ts`                       | Vérification SHA-256 + RSA avant installation                                                                  |
| **ModulesContext**  | `web-app/src/contexts/ModulesContext.tsx`                    | Context React unifié : 9 modules core statiques + catalogue Supabase + auto-install                            |
| **Module Registry** | `web-app/src/lib/module-registry.ts`                         | Registre hybride (28 statiques + cache Supabase)                                                               |

### 1.3 Modules natifs web (14) — restent dans le bundle

```
chat · calls · notifications · hometab · store · wallet
themes · profile · comms · customize · stories · help
contacts · settings
```

### 1.4 Pattern de chargement web (3-tier)

Chaque page de module suit le pattern :

```tsx
// Pattern 3-tier (web) :
// 1. Tente de charger via MiniAppHost (mini-app iframe sandboxée)
// 2. Fallback Supabase (manifest DB → CDN bundle)
// 3. Fallback legacy (composant monolithique importé statiquement)
```

---

## 2. État actuel du mobile

### 2.1 Store tab — 100% Mock

Le fichier `app/(tabs)/store.tsx` (587 lignes) est entièrement mock :

- Catalogue hardcodé (`MOCK_CATALOG` avec 12 items fictifs)
- Tabs (All/Apps/Contents/Services/Bundles) — UI fonctionnelle
- SearchBar + Filtres + Tri — UI fonctionnelle
- `PurchaseModal` — simulation d'achat
- **Aucune connexion à Supabase, aucune API réelle**

### 2.2 Modules codés en dur dans les tabs

Le mobile a le même syndrome que le web avant la migration :

| Tab    | Fichier             | Lignes | Statut                                            |
| ------ | ------------------- | :----: | ------------------------------------------------- |
| Home   | `(tabs)/index.tsx`  |  683   | 100% Mock (carousel, stories, explorer, podcasts) |
| Store  | `(tabs)/store.tsx`  |  587   | 100% Mock (catalogue, purchase modal)             |
| Watch  | `(tabs)/watch.tsx`  |  518   | 100% Mock (watch parties, featured)               |
| Social | `(tabs)/social.tsx` |  654   | ✅ Réel Supabase (mais monolithique)              |

### 2.3 Aucune infrastructure de modules

- ❌ Pas de module loader
- ❌ Pas de sandbox (React Native n'a pas d'iframe natif)
- ❌ Pas de `ModulesContext` ou registre de modules
- ❌ Pas de système d'installation/désinstallation
- ❌ Le tab `Store` ne charge pas le catalogue Supabase

---

## 3. Architecture cible mobile

```
┌──────────────────────────────────────────────────────┐
│            ImuChat Mobile Core (natif RN)             │
│                                                      │
│   chat · calls · contacts · notifications · profile  │
│   comms · settings · stories · themes · help         │
│                                                      │
├──────────────────────────────────────────────────────┤
│           Module Runtime Mobile / Sandbox             │
│                                                      │
│   ┌──────────────┐   ┌──────────────────────┐       │
│   │ WebView RN   │   │ Native Module (RN)   │       │
│   │ (mini-apps   │   │ (modules premium     │       │
│   │  HTML/JS)    │   │  haute performance)  │       │
│   └──────────────┘   └──────────────────────┘       │
│                                                      │
│   Mini-apps chargées dynamiquement depuis le Store   │
│   Isolation, permissions, communication via Bridge    │
│                                                      │
├──────────────────────────────────────────────────────┤
│             Store API (partagé avec web)              │
│                                                      │
│   Supabase : tables modules + user_modules           │
│   Bundles sur Supabase Storage / CDN                 │
│   Triggers auto-install existants                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 4. Classification des modules pour le mobile

### 4.1 Modules CORE natifs (implémentation React Native — 12)

Ces modules font partie du bundle mobile et s'exécutent nativement :

| Module          |         Route mobile         | Statut actuel  | Notes                                   |
| --------------- | :--------------------------: | :------------: | --------------------------------------- |
| `chat`          | `(tabs)/chats` + `chat/[id]` |     ✅ 95%     | 17 composants, offline queue, réactions |
| `calls`         |  `(tabs)/calls` + `call/*`   |     ✅ 70%     | Stream Video SDK intégré                |
| `contacts`      |      `(tabs)/contacts`       |     ✅ 90%     | 3 sub-tabs, demandes                    |
| `notifications` |    `(tabs)/notifications`    |     ✅ 90%     | 3-layer bridge, Expo + FCM              |
| `profile`       | `(tabs)/profile` + settings  |     ✅ 85%     | StatusPicker, visibility, stats         |
| `comms`         |       Dans social.tsx        |     ✅ 85%     | Groupes, modération, invitations        |
| `stories`       |         `stories/*`          |    ✅ Done     | CRUD, viewer, stories-store Zustand     |
| `themes`        |        Dans settings         |     ✅ 80%     | 6 thèmes, ThemeProvider, system mode    |
| `help`          |        Dans settings         |   ⚠️ Basique   | Lien externe, pas de FAQ intégrée       |
| `store`         |        `(tabs)/store`        |    🔲 Mock     | **À connecter au backend Supabase**     |
| `hometab`       |        `(tabs)/index`        |    🔲 Mock     | **100% mock — à implémenter**           |
| `wallet`        |             N/A              | 🔴 Non démarré | **Module à créer**                      |

### 4.2 Mini-apps via WebView (23 web existantes — réutilisables)

Les 23 mini-apps Vite extraites côté web sont des applications web autonomes. Elles peuvent être chargées **telles quelles** dans un `react-native-webview` :

| Catégorie           | Mini-apps                                               | Priorité mobile |        Effort d'adaptation        |
| ------------------- | ------------------------------------------------------- | :-------------: | :-------------------------------: |
| **Productivité**    | `imu-admin`                                             | P4 (admin only) |        Faible — responsive        |
| **Social**          | `imu-dating`, `imu-social-hub`                          |       P3        |         Moyen — touch UX          |
| **Médias**          | `imu-music`, `imu-watch`, `imu-podcasts`, `imu-news`    |       P3        | Moyen — lecteur natif souhaitable |
| **Créativité**      | `imu-stickers`, `imu-creator-studio`                    |       P3        |              Faible               |
| **Education**       | `imu-formations`, `imu-library`                         |       P4        |         Faible — lecture          |
| **Vie quotidienne** | `imu-mobility`, `imu-smart-home`, `imu-style-beauty`    |       P4        |        Moyen — géoloc, IoT        |
| **Divertissement**  | `imu-games`, `imu-contests`, `imu-sports`, `imu-worlds` |       P3        |           Moyen — perf            |
| **Services**        | `imu-services`, `imu-resources`, `imu-voom`             |       P4        |              Faible               |
| **Finance**         | `imu-finance`                                           |       P3        |         Moyen — sécurité          |
| **Événements**      | `imu-events`                                            |       P2        |    Faible — déjà mobile-ready     |

### 4.3 Modules à implémenter nativement (si nécessaire)

Certains modules bénéficieraient d'une **implémentation React Native native** plutôt que WebView pour des raisons de performance ou d'accès aux APIs natives :

| Module       | Raison d'un impl. native                                  | Priorité |
| ------------ | --------------------------------------------------------- | :------: |
| `music`      | Lecteur audio background, contrôles lockscreen (expo-av)  |    P3    |
| `watch`      | Lecteur vidéo plein écran, PiP (expo-av / expo-video)     |    P3    |
| `mobility`   | Géolocalisation continue, cartes (react-native-maps)      |    P4    |
| `smart-home` | Bluetooth, NFC, notifications locales                     |   P4+    |
| `games`      | Performance graphique (expo-gl, react-native-game-engine) |    P4    |

---

## 5. Stratégie de chargement dynamique sur React Native

### 5.1 Le problème : pas d'iframe en React Native

Sur le web, les mini-apps sont chargées dans un **iframe sandboxé** avec CSP strict. React Native n'a pas d'iframe natif.

### 5.2 Solution : `react-native-webview` comme sandbox

```
┌──────────────────────────────────┐
│     ImuChat Mobile (RN)          │
│                                  │
│  ┌────────────────────────────┐  │
│  │   MiniAppHostMobile.tsx    │  │
│  │                            │  │
│  │   ┌──────────────────┐    │  │
│  │   │  WebView          │    │  │
│  │   │  (mini-app HTML)  │    │  │
│  │   │                   │    │  │
│  │   │  postMessage ↕️   │    │  │
│  │   └──────────────────┘    │  │
│  │                            │  │
│  │  MobileBridge.ts           │  │
│  │  (analogue HostBridge web) │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### 5.3 API du `MiniAppHostMobile`

```tsx
// Composant à créer : components/miniapps/MiniAppHostMobile.tsx
interface MiniAppHostMobileProps {
  manifest: StoredModuleManifest; // Même type que le web
  grantedPermissions: string[];
  onReady?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

// → Charge l'URL du bundle mini-app dans un <WebView>
// → Injecte le SDK JavaScript via injectedJavaScript
// → Communique via onMessage / postMessage (même protocole que le web)
```

### 5.4 Points clés de la WebView sandbox

| Aspect            |    Web (iframe)    |                Mobile (WebView)                 |   Compatible ?    |
| ----------------- | :----------------: | :---------------------------------------------: | :---------------: |
| **Isolation DOM** | ✅ Sandbox native  |               ✅ Processus séparé               |        ✅         |
| **Communication** |   `postMessage`    |        `onMessage` / `injectJavaScript`         | ✅ Même protocole |
| **CSP**           |   Header strict    | `originWhitelist` + `allowsInlineMediaPlayback` |   ✅ Adaptable    |
| **Permissions**   | Attributs sandbox  |   Props WebView (`geolocationEnabled`, etc.)    |        ✅         |
| **Performance**   |       Bonne        |   Correcte (overhead WebView ~50-100ms init)    |   ⚠️ Acceptable   |
| **APIs natives**  | Limited (web only) |    Bridge vers RN (camera, géoloc, fichiers)    |   ✅ Extensible   |
| **Offline**       |   Service Worker   |       `cacheEnabled` + bundle pré-chargé        | ⚠️ À implémenter  |

### 5.5 SDK mini-app mobile

Le SDK injecté dans la WebView exposera les mêmes namespaces que le web :

```typescript
// SDK injecté dans la WebView (window.ImuChat)
interface ImuChatMobileSdk {
  auth: { getUser(); getToken() }; // Identité utilisateur
  storage: { get(key); set(key, value) }; // Stockage isolé par app
  theme: { getCurrent(); onChange(cb) }; // Thème (6 presets)
  ui: { showToast(); showAlert(); close() }; // Actions UI
  wallet: { getBalance(); requestPayment() }; // ImuWallet
  chat: { sendMessage(); openChat() }; // Intégration chat
  notifications: { requestPermission(); send() }; // Push
}
```

---

## 6. Backend partagé — Ce qui est réutilisable immédiatement

### 6.1 Tables Supabase existantes

Créées par `supabase_modules_unification.sql` (310 lignes) :

| Table          | Colonnes clés                                                                                                                                       | Utilisable par mobile ? |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------: |
| `modules`      | `id`, `name`, `version`, `entry_url`, `category`, `icon`, `permissions`, `bundle_size`, `is_published`, `is_verified`, `default_enabled`, `is_core` |     ✅ Directement      |
| `user_modules` | `user_id`, `module_id`, `installed_version`, `is_active`, `granted_permissions`                                                                     |     ✅ Directement      |

### 6.2 Fonctions SQL existantes

| Fonction                                     | Rôle                                                          |        Mobile ?        |
| -------------------------------------------- | ------------------------------------------------------------- | :--------------------: |
| `auto_install_default_modules(user_id)`      | Pré-installe les modules default_enabled pour un nouveau user | ✅ Trigger automatique |
| `backfill_default_modules_all_users()`       | Migration pour users existants                                |      ✅ One-shot       |
| Trigger `on_profile_created_install_modules` | Auto-install au signup                                        |     ✅ Transparent     |

### 6.3 API platform-core existante

| Endpoint                            | Rôle                                  | Mobile ? |
| ----------------------------------- | ------------------------------------- | :------: |
| `GET /api/modules`                  | Liste catalogue modules               |    ✅    |
| `POST /api/modules/:id/install`     | Installe un module pour l'user        |    ✅    |
| `DELETE /api/modules/:id/uninstall` | Désinstalle un module                 |    ✅    |
| `GET /api/modules/user`             | Modules installés pour l'user courant |    ✅    |

### 6.4 Module Registry serveur (`platform-core/src/modules/ModuleRegistry.ts`, 336 lig.)

Registry centralisé avec :

- `register()` / `unregister()` — enregistrement modules
- Validation de dépendances
- Protection des modules core (pas de désinstallation)
- `EventBus` pour communication inter-modules
- Compatible mobile car c'est du backend pur

**Conclusion : 100% du backend est réutilisable par le mobile sans modification.**

---

## 7. Plan d'implémentation mobile

### Phase M1 — Connecter le Store au backend (1-2 semaines)

**Objectif** : Remplacer le mock du Store par le catalogue Supabase réel.

- [ ] Créer `services/modules-api.ts` — CRUD modules (fetch catalogue, install, uninstall)
- [ ] Créer `stores/modules-store.ts` — Zustand avec persist (catalogue + modules installés)
- [ ] Modifier `app/(tabs)/store.tsx` — remplacer `MOCK_CATALOG` par `modules-store`
- [ ] Ajouter `PurchaseModal` réel — appel API install au lieu de simulation
- [ ] Afficher les modules installés dans un onglet "Mes apps"
- [ ] Supporter le pull-to-refresh sur le catalogue

### Phase M2 — Module Runtime Mobile (2-3 semaines)

**Objectif** : Charger et exécuter des mini-apps dans une WebView sandboxée.

- [ ] Installer `react-native-webview`
- [ ] Créer `components/miniapps/MiniAppHostMobile.tsx` — WebView + cycle de vie
- [ ] Créer `services/mobile-bridge.ts` — communication postMessage (même protocole que web)
- [ ] Créer `services/module-loader-mobile.ts` — `resolveEntryUrl()` + `loadFromStore()`
- [ ] Implémenter le SDK injecté (`window.ImuChat`) — auth, storage, theme, ui
- [ ] Écran de transition loading / error pour les mini-apps

### Phase M3 — Intégration Store + Runtime (1-2 semaines)

**Objectif** : Cycle complet browse → install → load → use → uninstall.

- [ ] Navigation `/store/:moduleId` → `MiniAppHostMobile`
- [ ] Gestion des permissions (modal avant installation)
- [ ] Détection online/offline (désactiver install si offline)
- [ ] Badge "Installé" / "Update disponible" dans le catalogue
- [ ] Deep-link vers les mini-apps installées
- [ ] Ajout des mini-apps installées dans le tab bar ou menu dédié

### Phase M4 — Modules natifs prioritaires (4-6 semaines)

**Objectif** : Implémenter nativement les modules qui nécessitent des APIs natives.

- [ ] **Music** — expo-av, contrôles lockscreen, background audio
- [ ] **Watch** — expo-video, PiP, lecteur plein écran
- [ ] **Home tab** — connecter l'accueil au vrai feed (remplacer le mock)
- [ ] **Wallet** — implémentation ImuWallet (Stripe, ImuCoin)

---

## 8. Store mobile — Du mock au réel

### 8.1 Ce qui existe (mock)

```
store.tsx (587 lig.)
├── DynamicHero          — Bannière animée (mock)
├── StoreSearch          — Barre de recherche (UI ok, pas connectée)
├── StoreFilterBar       — Filtres/tri (UI ok, pas connectée)
├── MixedContentGrid     — Grille d'items (MOCK_CATALOG hardcodé)
├── PurchaseModal        — Modal d'achat (simulation)
└── Tabs: All/Apps/Contents/Services/Bundles
```

### 8.2 Ce qu'il faut changer

| Composant    |       Avant (mock)        |                      Après (réel)                       |
| ------------ | :-----------------------: | :-----------------------------------------------------: |
| Catalogue    | `MOCK_CATALOG` (12 items) |           `Supabase.from('modules').select()`           |
| Recherche    |   Filtre local sur mock   |         `modules.where('name', 'ilike', query)`         |
| Installation |   `alert('Installé !')`   |    `POST /api/modules/:id/install` + `user_modules`     |
| Mes apps     |       Non existant        | `Supabase.from('user_modules').select()` + join modules |
| Prix         |         Hardcodé          |          `modules.price` + Stripe / ImuWallet           |
| Reviews      |       Non existant        |             Nouvelle table `module_reviews`             |

### 8.3 Catalogue enrichi

Une fois connecté, le Store affichera les **37 modules du catalogue Supabase** :

- 12 core (marqués "Installé" par défaut)
- 3 default_enabled non-core (imu-events, imu-music, imu-watch — pré-installés)
- 22 optionnels (installables à la demande)

---

## 9. Contraintes & Différences mobile vs web

| Aspect                | Web                         | Mobile                                      | Implication                                           |
| --------------------- | --------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| **Sandbox**           | iframe                      | WebView RN                                  | Même protocole postMessage, API légèrement différente |
| **Performance**       | Excellente                  | Overhead WebView (~50-100ms)                | Préférer natif pour les modules fréquents             |
| **Offline**           | Service Worker              | AsyncStorage + cache bundles                | Pré-télécharger les bundles installés                 |
| **Permissions**       | CSP standard                | APIs natives (camera, géoloc, etc.)         | Bridge natif → WebView nécessaire                     |
| **Taille**            | Bundles légers (172-580 KB) | Même taille + overhead WebView runtime      | Acceptable                                            |
| **Mise à jour**       | Immédiate (CDN)             | Background download + hot swap              | Implémenter le check de version                       |
| **App Store reviews** | N/A                         | Apple/Google policies sur le code dynamique | WebView ✅ autorisé (pas de JS injection arbitraire)  |
| **Deep links**        | URL routing natif           | Expo Router `app/miniapp/[id]`              | À implémenter                                         |

### 9.1 Politique App Store (Apple)

Apple autorise le chargement de contenu web dans des WebView tant que :

- Le contenu ne réplique pas l'App Store (notre Store est interne, pas de vrais IAP concurrents)
- Les fonctionnalités core ne dépendent pas exclusivement de contenu distant
- Pas d'exécution de code arbitraire téléchargé (les mini-apps sont reviewées)

### 9.2 Politique Play Store (Google)

Google est plus permissif. Les WebView avec contenu dynamique sont autorisées.

---

## 10. Risques & Atténuation

| Risque                            | Impact | Probabilité | Atténuation                                                                               |
| --------------------------------- | :----: | :---------: | ----------------------------------------------------------------------------------------- |
| **Performance WebView**           | Moyen  |   Moyenne   | Benchmarks, impl. native pour modules critiques (music, watch)                            |
| **UX non-native dans WebView**    | Élevé  |   Élevée    | Mini-apps responsive + SDK theme pour style cohérent                                      |
| **Rejet App Store (Apple)**       | Élevé  |   Faible    | Mini-apps reviewées, contenu ImuChat interne (pas d'App Store concurrent)                 |
| **Taille de l'app**               | Moyen  |   Faible    | Bundles téléchargés à la demande, pas dans le binaire                                     |
| **Offline**                       | Moyen  |   Moyenne   | Pré-télécharger les bundles installés, cache AsyncStorage                                 |
| **Sécurité sandbox WebView**      | Élevé  |   Moyenne   | `originWhitelist`, pas de `javaScriptCanOpenWindowsAutomatically`, permissions explicites |
| **Fragmentation Android WebView** | Moyen  |   Moyenne   | Version minimum WebView, polyfills si nécessaire                                          |

---

## 📎 Documents de référence

| Document                                                                     | Contenu                                                          |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [ARCHITECTURE_MODULES_AUDIT.md](../docs/ARCHITECTURE_MODULES_AUDIT.md)       | Audit complet de l'architecture modulaire web (Phases A-C)       |
| [MOBILE_TODO_TRACKER.md](MOBILE_TODO_TRACKER.md)                             | DEV-027 (Store & Modules Registry) · Groupe 10                   |
| [AGE_SEGMENTATION_ARCHITECTURE.md](../docs/AGE_SEGMENTATION_ARCHITECTURE.md) | Segmentation par âge (`min_age_tier` sur modules)                |
| `supabase_modules_unification.sql`                                           | Schema SQL : tables modules/user_modules, triggers, functions    |
| `web-app/src/components/miniapps/MiniAppHost.tsx`                            | Implémentation web du host (428 lig.) — référence pour le mobile |
| `web-app/src/services/loader.ts`                                             | Loader web (139 lig.) — `loadFromStore()`, `resolveEntryUrl()`   |
| `web-app/src/services/host-bridge.ts`                                        | Bridge web postMessage — protocole à adapter pour WebView        |
| `platform-core/src/modules/ModuleRegistry.ts`                                | Registry serveur (336 lig.) — backend réutilisable               |

---

> **Prochaine étape recommandée** : Phase M1 — Connecter le Store au backend Supabase. C'est la plus simple (1-2 semaines) et donne des résultats visibles immédiatement (catalogue réel dans l'onglet Store). Les Phases M2-M3 (runtime WebView + intégration) suivront naturellement.

---

_Document créé — 27 février 2026_
