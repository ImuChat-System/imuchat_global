# 📱 Mobile App - Tracker Complet des Tâches (MVP Phase 2 Élargi)

> **Date de création** : 21 février 2026  
> **Dernière mise à jour** : 27 février 2026  
> **Statut global** : MVP Phase 2 quasi-terminé (Communication ✅ · Social ✅ · Profils ✅ · Auth/Sécurité ✅) — Phase 3 à démarrer
> **Référence** : Basé sur les 50 fonctionnalités (10 groupes), les ~110 écrans complémentaires, et la roadmap 3D/Live2D
> **Métriques** : ~53 500 lignes TS/TSX · 183 fichiers · 51 fichiers de tests · 4 Zustand stores · 15 hooks · 16 services

---

## 📋 Table des Matières

1. [🚨 Anomalies Critiques](#-anomalies-critiques)
2. [⚠️ Bugs et Problèmes Techniques](#️-bugs-et-problèmes-techniques)
3. [🔧 Ajustements et Optimisations](#-ajustements-et-optimisations)
4. [🚧 MVP Phase 2A — Communication Avancée (Groupes 1-2)](#-mvp-phase-2a--communication-avancée-groupes-1-2)
5. [👤 MVP Phase 2B — Profils & Personnalisation (Groupes 3-4)](#-mvp-phase-2b--profils--personnalisation-groupes-3-4)
6. [🌐 MVP Phase 2C — Social & Communautés (Groupe 5 + Écrans complémentaires)](#-mvp-phase-2c--social--communautés-groupe-5--écrans-complémentaires)
7. [🔐 MVP Phase 2D — Auth Avancée, Sécurité & Confidentialité](#-mvp-phase-2d--auth-avancée-sécurité--confidentialité)
8. [🏗️ MVP Phase 3 — Modules, IA, Store, Services (Groupes 6-10)](#️-mvp-phase-3--modules-ia-store-services-groupes-6-10)
9. [� MVP Phase 4 — Modules Vie Quotidienne & Contenus Avancés](#-mvp-phase-4--modules-vie-quotidienne--contenus-avancés)
10. [🗺️ Cartographie Complète des Mini-Apps & Modules](#️-cartographie-complète-des-mini-apps--modules)
11. [🎭 Vision Long Terme — 3D & Live2D](#-vision-long-terme--3d--live2d)
12. [📊 Comparatif Mobile vs Web-App](#-comparatif-mobile-vs-web-app)
13. [🎯 Roadmap & Priorités](#-roadmap--priorités)

---

## 🚨 Anomalies Critiques

### CRIT-001 : Stream Video Token Placeholder ✅

**Priorité** : P0 - Bloquant  
**Impact** : Appels audio/vidéo non fonctionnels  
**Statut** : ✅ Résolu (code complet, config env à finaliser)

**Découverte clé** : Le backend `platform-core` était **déjà complet** :

- ✅ Route `POST /api/v1/stream/token` fonctionnelle (`routes/stream.ts`)
- ✅ Service `services/stream.ts` avec `@stream-io/node-sdk`
- ✅ `verifyIdToken` dans `config/firebase.ts` supporte les tokens **Supabase** (fallback automatique)
- ✅ Mode dev mock quand `STREAM_API_KEY` n'est pas configuré

**Améliorations mobile** (23 fév) :

- ✅ `stream-token.ts` refactoré : capture `apiKey`, cache mémoire, `clearStreamTokenCache()`, `getStreamApiKey()`, logger intégré
- ✅ Type `StreamTokenResponse` aligné sur le backend (`expiresAt: number`)

**Action restante** : Configurer `STREAM_API_KEY` et `STREAM_SECRET_KEY` dans `.env` (depuis getstream.io Dashboard)

**Fichiers modifiés** :

- `services/stream-token.ts` (refactoré)
- `platform-core/.env.example` (documenté)

---

### CRIT-002 : OAuth Non Implémenté → ✅ Configuré (côté mobile)

**Priorité** : P1 - Important  
**Impact** : UX d'inscription limitée  
**Statut** : ✅ Code mobile terminé — config dashboard Supabase restante

**Solution appliquée** (24 fév) :

- ✅ Google Sign-In via `expo-auth-session` + `signInWithIdToken` Supabase
- ✅ Apple Sign-In via `expo-apple-authentication` + `signInWithIdToken` Supabase
- ✅ Client IDs Google configurés dans `.env` (web, iOS, Android depuis Firebase `imuchat-378ad`)
- ✅ Plugin `expo-apple-authentication` ajouté dans `app.json`
- ✅ `REVERSED_CLIENT_ID` ajouté comme `CFBundleURLScheme` iOS
- ✅ `SocialLoginButtons.tsx` présent sur login + register
- ✅ Scheme corrigé : `app.json` scheme `"imuchat"` (redirect URI `imuchat://auth/callback`)

**Fichiers modifiés** :

- `app.json` — scheme, plugins, iOS infoPlist CFBundleURLTypes
- `.env` — Google OAuth Client IDs (3 plateformes)
- `components/auth/SocialLoginButtons.tsx` — validation config + debug logs
- `app/(auth)/register.tsx` — ajout SocialLoginButtons

**Actions restantes (dashboard)** :

- [ ] Configurer Google comme provider OAuth dans Supabase Dashboard
- [ ] Configurer Apple comme provider OAuth dans Supabase Dashboard
- [ ] Vérifier Google OAuth Consent Screen dans Google Cloud Console

**Estimation restante** : ~1h (configuration dashboard uniquement)

---

## ⚠️ Bugs et Problèmes Techniques

### BUG-001 : Console Logs en Production

**Priorité** : P2 - Moyen  
**Impact** : Performance, Sécurité  
**Statut** : ✅ Résolu

**Solution appliquée** :

- ✅ `services/logger.ts` créé avec niveaux debug/info/warn/error
- ✅ Suppression automatique en production via `__DEV__`
- ✅ Buffer circulaire (100 entrées) pour crash reporting (`getRecentLogs()`)
- ✅ Factory `createLogger('Module')` pour logs scopés
- ✅ Timestamps ISO dans chaque entrée
- ⏳ Migration progressive des `console.*` existants vers le logger

**Fichier créé** : `services/logger.ts`

---

### BUG-002 : Offline Queue Partielle

**Priorité** : P1 - Important  
**Impact** : UX hors connexion  
**Statut** : ✅ Résolu

**Problème** :

- Queue de messages offline créée mais non persistée
- Messages perdus si l'app est fermée

**Solution appliquée** :

- ✅ `services/offline-queue.ts` créé avec AsyncStorage
- ✅ Fonctions `addPendingMessage`, `getPendingMessagesForConversation`, `flushPendingMessages`
- ✅ Hook `useChat` expose `pendingMessagesCount` et `flushPendingMessages`
- ✅ Nettoyage des messages expirés (24h)

**Fichiers modifiés** :

- `services/offline-queue.ts`
- `hooks/useChat.ts`

---

### BUG-003 : Notifications Fallback Mock ✅

**Priorité** : P2 - Moyen  
**Impact** : Notifications non réelles  
**Statut** : ✅ Résolu — Bridge unifié implémenté

**Solution implémentée** (23 fév) :

Le hook `useNotifications` a été refactoré en **bridge unifié** connectant les 3 couches :

1. **`services/notifications.ts`** — Expo Notifications (permissions, token, listeners)
2. **`services/notification-api.ts`** — REST client vers platform-core
3. **`stores/notifications-store.ts`** — Zustand (état global persisté)

**Fonctionnalités du bridge** :

- ✅ Token push enregistré dans Supabase (direct) ET via API backend (parallèle)
- ✅ Notifications reçues → ajoutées automatiquement dans Zustand store
- ✅ `markAsRead()` / `markAllAsRead()` synchronisent store Zustand + API backend + badge système
- ✅ `refreshHistory()` récupère l'historique depuis platform-core
- ✅ Sync automatique de l'historique au montage
- ✅ Logger intégré au lieu de `console.*`
- ✅ Désenregistrement token à la déconnexion (Supabase + API)
- ✅ Rétro-compatible avec `NotificationPrompt` (même signature `requestPermission`)

**Fichier modifié** : `hooks/useNotifications.ts`

---

## 🔧 Ajustements et Optimisations

### OPT-001 : Tests Unitaires

**Priorité** : P1 - Important  
**Impact** : Qualité, Maintenabilité  
**Statut** : ⚠️ En cours

**État actuel** :

- Configuration Jest + Detox E2E en place ✅
- **51 fichiers de tests** (progression depuis 24 initiaux)
  - 4 tests écrans app
  - 8 tests root-level (home, media-api, notification-api, etc.)
  - 11 tests composants (Avatar, CallControls, MessageBubble, chat/\*, etc.)
  - 4 tests hooks (useReactions, useChat, useTypingIndicator, useAuth)
  - 10 tests services (messaging, stories-api, groups, events, etc.)
  - 3 tests stores (stories-store, notifications-store, global)
  - 2 tests providers (AuthProvider, ThemeProvider)
  - 1 test utils (markdown-parser)
  - 2 tests E2E Detox (auth, chat)
- Couverture estimée **~25-30%**

**Tests à créer (priorité)** :

- [ ] Hooks : `useAuthV2`, `useNotifications`, `useCalls`, `useCallHistory`
- [ ] Services : `security.ts`, `privacy-center.ts`, `transcription.ts`, `call-signaling.ts`
- [ ] Stores : `user-store.ts`, `ui-store.ts`
- [ ] Composants : `StatusPicker`, `SocialLoginButtons`, `NewChatModal`
- [ ] Écrans : `events/`, `stories/`, `(onboarding)/profile-setup`

**Objectif** : 50% de couverture

**Estimation** : 1 semaine

---

### OPT-002 : i18n Extension

**Priorité** : P3 - Mineur  
**Impact** : Internationalisation  
**Statut** : ✅ Fonctionnel

**État actuel** :

- 3 locales : fr, en, ja
- ~320 clés de traduction

**Comparatif web-app** : ~2300 clés

**À faire** :

- [ ] Aligner les clés avec web-app
- [ ] Ajouter les traductions manquantes
- [ ] Synchroniser les modules secondaires

---

### OPT-003 : Zustand Store

**Priorité** : P2 - Moyen  
**Impact** : Gestion d'état  
**Statut** : ✅ Implémenté

**Stores créés (4)** :

- ✅ `stores/notifications-store.ts` (120 lig.) — Badge, push token, liste de notifications (persist AsyncStorage, 20 dernières)
- ✅ `stores/ui-store.ts` — Tab active, network status, keyboard, search (volatile, pas de persist)
- ✅ `stores/user-store.ts` — Profil + préférences (locale, thème, sons, haptic), persist AsyncStorage
- ✅ `stores/stories-store.ts` (434 lig.) — Groupes stories, viewer state, cache 30s, persist AsyncStorage

**Architecture** :

- Zustand v5 avec middleware `persist` + `createJSONStorage(AsyncStorage)`
- `notifications-store` : buffer de 50 notifs, persist des 20 dernières
- `stories-store` : viewer controls (currentIndex, paused, replyText), groupes par utilisateur, cache TTL
- `user-store` : profil + préférences avec reset
- `ui-store` : état volatile (pas de persist)

---

## 🚧 MVP Phase 2A — Communication Avancée (Groupes 1-2)

> Réf : 50 Fonctionnalités — Groupe 1 (Messagerie) & Groupe 2 (Appels)

### DEV-001 : Chat Avancé ✅ Session du 21 février

**Priorité** : P0 - En cours  
**Impact** : Parité avec web-app  
**Statut** : ✅ Implémenté

**Fonctionnalités ajoutées** :

1. ✅ **FAB "New Chat"** :
   - `components/chat/NewChatModal.tsx` (~310 lignes)
   - Modal de sélection de contacts
   - Support création conversation 1:1 ou groupe
   - FAB flottant ajouté dans `app/(tabs)/chats.tsx`

2. ✅ **Edit/Delete Messages UI** :
   - `MessageContextMenu.tsx` déjà implémenté (Reply, Copy, Forward, Edit, Delete)
   - Limite de 15 minutes pour l'édition
   - Confirmation Alert pour suppression
   - Callbacks connectés dans `app/chat/[id].tsx` :
     - `handleEdit` → `editMessage()` service
     - `handleDelete` → `deleteMessage()` service
     - `handleCopy` → `expo-clipboard`
     - `handleReply` → état `replyingTo`

3. ✅ **Read Receipts UI** :
   - Prop `isRead` ajoutée à `MessageBubble`
   - Indicateur visuel : `✓` (envoyé) ou `✓✓` (lu)
   - Service `getOthersLastReadAt()` dans `messaging.ts`
   - Hook `isMessageRead()` dans `useChat`

**Fichiers modifiés** :

- `mobile/components/chat/NewChatModal.tsx` (nouveau)
- `mobile/components/chat/index.ts`
- `mobile/app/(tabs)/chats.tsx`
- `mobile/app/chat/[id].tsx`
- `mobile/components/MessageBubble.tsx`
- `mobile/hooks/useChat.ts`
- `mobile/services/messaging.ts`
- `mobile/i18n/*.json` (traductions)

---

### DEV-002 : Messages Vocaux Transcrits ✅

**Priorité** : P2 - Moyen  
**Réf** : Groupe 1, Fonc. 2 — "Messages vocaux transcrits automatiquement"  
**Statut** : ✅ Implémenté (pipeline complet)

**Implémentation** (23 fév) — Pipeline 4 couches :

1. **`mobile/hooks/useTranscription.ts`** — Hook React : `transcription`, `loading`, `error`, `transcribe(audioUrl)`
2. **`mobile/services/transcription.ts`** — Client REST : appelle platform-core, cache AsyncStorage (30 jours TTL)
3. **`platform-core/src/routes/transcription.ts`** — Route Fastify : `POST /transcribe`, `POST /message/:messageId`
4. **`platform-core/src/services/transcription.ts`** — Service Whisper : OpenAI `whisper-1`, verbose_json, sauvegarde métadonnées

**Features** :

- ✅ Transcription à la demande via hook `useTranscription`
- ✅ Cache client AsyncStorage (hash URL → résultat, TTL 30 jours)
- ✅ Vérification d'accès conversation côté backend
- ✅ Sauvegarde résultat dans `message.metadata` (Supabase)
- ✅ Mode dev mock quand `OPENAI_API_KEY` n'est pas configuré
- ✅ `VoicePlayer.tsx` a déjà le UI de transcription (prop, toggle, affichage)
- ✅ Route enregistrée dans `platform-core/src/index.ts` + tag Swagger
- ✅ `.env.example` mis à jour avec `OPENAI_API_KEY`

**Action restante** : Configurer `OPENAI_API_KEY` dans `.env`

---

### DEV-003 : Rich Text / Markdown ✅

**Priorité** : P3 - Mineur  
**Réf** : Écart Mobile vs Web — Web a toolbar + renderer Markdown  
**Statut** : ✅ Implémenté

**Implémentation** (23 fév) :

- ✅ `utils/markdown-parser.ts` — Parser léger sans dépendances externes
  - Supporte : **gras**, _italique_, `code`, ~~barré~~, [liens](url)
  - `parseMarkdown()` retourne `TextSegment[]`, `hasMarkdown()` pour pré-check
  - Regex unique avec groupes nommés pour performance
- ✅ `MessageBubble.tsx` modifié :
  - Parsing mémoïsé (`useMemo`)
  - `renderContent()` avec styles par type de segment
  - Liens cliquables via `Linking.openURL()`
  - Couleurs adaptées selon `isOwnMessage`

**Fichiers** :

- `utils/markdown-parser.ts` (créé)
- `components/MessageBubble.tsx` (modifié)

---

### DEV-004 : Pull-to-Refresh

**Priorité** : P2 - Moyen  
**Statut** : ✅ Implémenté (complet)

**Implémentation** :

- ✅ `RefreshControl` sur la liste des conversations (`chats.tsx`) — utilise `refresh` de `useChat`
- ✅ `RefreshControl` sur la liste des messages (`[id].tsx`) — utilise `loadMessages` de `useChat`
- ✅ `RefreshControl` sur les contacts (`contacts.tsx`) — déjà existant avant Phase 2
- ✅ `RefreshControl` sur le tab Social (`social.tsx`) — stories + feed refresh
- ✅ `RefreshControl` sur le profil (`profile.tsx`) — refresh données utilisateur
- ✅ `RefreshControl` sur les appels (`calls.tsx`) — historique d'appels
- ✅ `RefreshControl` sur Watch (`watch.tsx`) — **ajouté 22 fév 2026**
- ✅ `RefreshControl` sur Notifications (`notifications.tsx`) — **ajouté 22 fév 2026**

**Pattern utilisé** : état `refreshing` local + async handler avec try/finally + `tintColor={colors.primary}`

---

### DEV-005 : Search Globale

**Priorité** : P2 - Moyen  
**Statut** : ✅ Déjà implémenté

**Découverte** : L'écran `app/search.tsx` (395 lignes) est **entièrement fonctionnel** :

- ✅ `SearchBar` avec debounce 300ms
- ✅ `globalSearch()` depuis `services/messaging.ts`
- ✅ 3 onglets : Tout / Conversations / Messages
- ✅ `highlightText()` pour surbrillance de la query
- ✅ `formatTimeAgo()` pour timestamps relatifs
- ✅ Navigation vers conversation au tap
- ✅ États vide / loading / résultats

---

### DEV-006 : Appels Audio/Vidéo Complets

**Priorité** : P0 - Bloquant (dépend de CRIT-001)  
**Réf** : Groupe 2 — Appels audio & vidéo (5 fonctionnalités)  
**Statut** : ✅ Infrastructure corrigée — Tests en attente (EAS Build)

**État actuel** :

| Fonctionnalité Groupe 2       | Statut | Détails                                |
| ----------------------------- | ------ | -------------------------------------- |
| 1. Appels audio (1:1/groupe)  | ✅     | Token réel backend, client unifié      |
| 2. Appels vidéo HD            | ✅     | StreamVideo + StreamCall + CallContent |
| 3. Mini-fenêtre flottante PiP | 🔴     | Non démarré                            |
| 4. Partage d'écran            | 🔴     | Non démarré (expo limitation)          |
| 5. Filtre beauté IA + flou    | 🔴     | Non démarré (Phase 3 recommandé)       |

**Corrections apportées (Session DEV-006)** :

- ✅ `CRIT-001` résolu — tokens Stream générés par platform-core backend
- ✅ `active.tsx` — réécrit pour utiliser `calls.ts` + `stream-token.ts` (vrais tokens backend)
- ✅ `active.tsx` — enveloppé avec `<StreamVideo client>` + `<StreamCall>` + `<CallContent>`
- ✅ `useCallManagerHook.tsx` — migré de `stream-video-safe.ts` vers `calls-safe.ts`
- ✅ `chat/[id].tsx` — migré vers `calls-safe.ts` avec `safeEnsureStreamClient()`
- ✅ `calls-safe.ts` — ajout `safeEnsureStreamClient()`, `safeGetStreamClient()`, `safeGenerateCallId()`
- ✅ `stream-video.ts` — DÉPRÉCIÉ, redirige vers nouveau système
- ✅ `stream-video-safe.ts` — DÉPRÉCIÉ, redirige vers nouveau système
- ✅ `EXPO_PUBLIC_STREAM_API_KEY` configuré dans `mobile/.env`
- ✅ Clé API Stream corrigée (`z57h7zb5875r` au lieu de `mmhfdzb5evj2` hardcodé)

**Architecture unifiée** :

```
stream-token.ts  →  Fetch token réel depuis platform-core backend
calls.ts         →  Service principal (initializeStreamClient, createCall, joinCall, etc.)
calls-safe.ts    →  Wrapper Expo Go safe + safeEnsureStreamClient()
useCalls.ts      →  Hook React (utilise calls.ts + stream-token.ts)
useCallsSafe.ts  →  Hook safe wrapper
active.tsx       →  <StreamVideo> + <StreamCall> + <CallContent>
```

**Composants existants** :

- ✅ `CallControls.tsx` — mute/cam/hang up
- ✅ `IncomingCallModal.tsx` — modal appel entrant
- ✅ `ParticipantView.tsx` — vue participant (placeholder vidéo)
- ✅ `useCallManager.ts` / `useCallsSafe.ts` — hooks d'appels
- ✅ `services/call-signaling.ts` — signaling Supabase Realtime

**À implémenter (Phase 2A)** :

- [x] Résoudre CRIT-001 (Stream Video token)
- [x] Unifier système d'appels (ancien vs nouveau)
- [ ] Tester appels 1:1 réels avec EAS Build
- [ ] Appels groupes
- [ ] PiP avec `react-native-pip-android` + `AVPictureInPictureController` (iOS)

**À implémenter (Phase 3)** :

- [ ] Partage d'écran (nécessite native module)
- [ ] Filtre beauté IA (dépend de vision long terme 3D/Live2D)

**Prérequis** : ~~CRIT-001 résolu~~ ✅ Fait

**Estimation** : Tests EAS Build = 1-2 jours

---

### DEV-007 : CallKit / ConnectionService

**Priorité** : P2 - Moyen  
**Réf** : Groupe 2 — Intégration native appels  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] CallKit pour iOS (sonnerie, écran verrouillé)
- [ ] ConnectionService pour Android
- [ ] Intégration avec `IncomingCallModal`

**Prérequis** : Stream Video token fonctionnel (CRIT-001)

**Estimation** : 1 semaine

---

## 👤 MVP Phase 2B — Profils & Personnalisation (Groupes 3-4)

> Réf : 50 Fonctionnalités — Groupe 3 (Profils & Identité) & Groupe 4 (Personnalisation avancée)

### DEV-008 : Profils Avancés ✅

**Priorité** : P2 - Moyen  
**Réf** : Groupe 3 — Profils & Identité (5 fonctionnalités)  
**Statut** : ✅ Phase 2B terminée (24 fév 2026)

**État actuel** :

| Fonctionnalité Groupe 3                 | Statut | Détails                                      |
| --------------------------------------- | ------ | -------------------------------------------- |
| 1. Profils privés/publics/anonymes      | ✅     | Visibilité profil + RLS policy               |
| 2. Multi-profils (perso/pro/créateur)   | 🔴     | Phase 3 — nécessite refonte DB               |
| 3. Avatars 2D/3D personnalisables       | ⚠️     | Avatar photo ✅, pas de 2D/3D (Phase 3)      |
| 4. Statuts animés (emoji/texte/musique) | ✅     | StatusPicker avec emoji + texte + expiration |
| 5. Vérification identité (badge bleu)   | ⚠️     | Badge UI ✅, vérification KYC Phase 3        |

**Implémentation Phase 2B (24 fév)** :

- ✅ Migration SQL `003_advanced_profiles.sql` :
  - ENUM `profile_visibility` (public/private/anonymous)
  - Colonnes : `visibility`, `status_emoji`, `status_expires_at`, `website`, `is_verified`, `contacts_count`, `conversations_count`
  - RLS policy `profiles_visibility_select`
  - Indexes pour visibility et status_expires

- ✅ Fix schema mismatch `full_name` → `display_name` dans 8+ fichiers

- ✅ `stores/user-store.ts` — Extended `UserProfile` interface avec tous les nouveaux champs

- ✅ `app/(tabs)/profile.tsx` — Page profil complète réécrite (530+ lignes) :
  - Avatar avec indicateur online
  - Display name + username + badge vérifié
  - Enriched status (emoji + texte + expiration)
  - Bio + website link
  - Stats row (contacts, conversations, visibility)
  - Action buttons (Edit Profile, Share)
  - Info card (email, last seen)

- ✅ `components/profile/StatusPicker.tsx` — Modal de statut enrichi (340+ lignes) :
  - 24 emojis courants en grille
  - Input texte (80 char max)
  - 6 options d'expiration (30min à jamais)
  - Preview card
  - Clear status
  - Supabase integration

- ✅ `app/(tabs)/settings.tsx` — Section visibilité profil ajoutée :
  - UI 3 boutons (Public 🌍, Private 🔒, Anonymous 👤)
  - `saveProfileVisibility()` function
  - Query étendue pour charger visibility

- ✅ i18n complété (fr, en, ja) :
  - Section `profile` étendue
  - Nouvelle section `statusPicker`
  - Clés settings pour profile visibility

**À implémenter (Phase 3)** :

- [ ] Multi-profils (switch perso/pro/créateur) — nécessite refonte DB
- [ ] Avatars 2D/3D — cf. section Live2D
- [ ] Vérification identité KYC — nécessite backend

**Fichiers créés/modifiés** :

- `migrations/003_advanced_profiles.sql` (NEW)
- `components/profile/StatusPicker.tsx` (NEW)
- `app/(tabs)/profile.tsx` (REWRITTEN)
- `stores/user-store.ts`, `services/messaging.ts`, `services/call-signaling.ts`, `services/stream-video.ts`, `services/stream-video-safe.ts`, `app/search.tsx`, `app/(onboarding)/profile-setup.tsx`, `app/(tabs)/settings.tsx`
- `i18n/fr.json`, `i18n/en.json`, `i18n/ja.json`

---

### DEV-009 : Personnalisation Avancée ✅

**Priorité** : P3 - Mineur  
**Réf** : Groupe 4 — Personnalisation avancée (5 fonctionnalités)  
**Statut** : ✅ Phase 2B terminée (22 fév 2026)

**État actuel** :

| Fonctionnalité Groupe 4      | Statut | Détails                                          |
| ---------------------------- | ------ | ------------------------------------------------ |
| 1. Thèmes visuels            | ✅     | 6 thèmes : Light, Dark, Kawaii, Pro, Neon, Ocean |
| 2. Arrière-plans animés      | 🔴     | Phase 3                                          |
| 3. Police personnalisable    | 🔴     | Phase 3                                          |
| 4. Packs d'icônes et de sons | 🔴     | Phase 3                                          |
| 5. Widget homescreen         | 🔴     | Phase 3                                          |

**Implémentation Phase 2B (22 fév)** :

- ✅ `constants/theme-presets.ts` — 6 palettes de couleurs complètes :
  - **Light** ☀️ — Clair et lumineux
  - **Dark** 🌙 — Sombre par défaut
  - **Kawaii** 🌸 — Rose pastel mignon
  - **Pro** 💼 — Professionnel bleu slate
  - **Neon** ⚡ — Cyberpunk violet/vert néon
  - **Ocean** 🌊 — Calme aquatique teal

- ✅ `stores/user-store.ts` — Support `ThemePreference = ThemePresetId | "system"`

- ✅ `providers/ThemeProvider.tsx` — Refonte complète :
  - `presetId`, `setPreset()`, `setSystemMode()`, `isSystemMode`
  - Couleurs dynamiques via `getThemePreset()`
  - Mode système conservé (auto light/dark)

- ✅ `app/(tabs)/settings.tsx` — Sélecteur de thèmes UI :
  - Grille 3x2 avec aperçu des couleurs
  - Carte par thème (emoji, nom, 3 dots de couleurs)
  - Badge de sélection ✓
  - Toggle mode système séparé
  - Overlay grisé quand mode système actif

- ✅ i18n (fr, en, ja) — Clés ajoutées :
  - `settings.systemTheme`, `settings.chooseTheme`
  - `settings.themeLight`, `themeDark`, `themeKawaii`, `themePro`, `themeNeon`, `themeOcean`

**À implémenter (Phase 3)** :

- [ ] Arrière-plans animés (Lottie / Reanimated pour conversations)
- [ ] Choix de police par conversation
- [ ] Packs d'icônes/sons téléchargeables (via Store)
- [ ] Widget homescreen via `expo-widgets` (expérimental)

**Fichiers créés/modifiés** :

- `constants/theme-presets.ts` (NEW)
- `providers/ThemeProvider.tsx` (REWRITTEN)
- `stores/user-store.ts` (MODIFIED - ThemePreference type)
- `app/(tabs)/settings.tsx` (MODIFIED - Theme selector UI)
- `i18n/fr.json`, `i18n/en.json`, `i18n/ja.json`

---

### DEV-010 : Onboarding Flow

**Priorité** : P2 - Moyen  
**Réf** : Écrans complémentaires — Auth & Sécurité  
**Statut** : ✅ Implémenté

**État actuel** :

- ✅ Dossier `app/(onboarding)/` avec layout + 2 écrans
- ✅ `app/(onboarding)/index.tsx` — 4 slides de présentation (pré-auth)
- ✅ `app/(onboarding)/_layout.tsx` — Stack layout pour le groupe
- ✅ `app/(onboarding)/profile-setup.tsx` — 3 étapes post-signup (nom/username, avatar, thème)
- ✅ Navigation connectée au flow d'inscription (4 états dans `_layout.tsx`)
- ✅ Sélection thème (light/dark/system) avec preview live
- ✅ Choix de pseudo avec validation temps réel (unicité Supabase debounced)
- ✅ Avatar : camera + galerie + crop carré
- ✅ Upload avatar vers Supabase Storage
- ✅ Sauvegarde état onboarding via AsyncStorage (`profile_setup_completed`)
- ✅ ThemeProvider connecté au user-store (persistance du thème)
- ✅ Traductions i18n complètes (fr/en/ja) pour profileSetup

**Corrections appliquées** :

- [x] Créé `app/(onboarding)/_layout.tsx` — Stack layout
- [x] Créé `app/(onboarding)/profile-setup.tsx` — 3 étapes (450+ lignes)
- [x] `_layout.tsx` — ajout 4e état navigation : session + profil incomplet → profile-setup
- [x] `login.tsx` — supprimé redirection manuelle (délégué à `_layout.tsx`)
- [x] `ThemeProvider.tsx` — connecté au user-store + support `system` mode + `useColorScheme`
- [x] `i18n/fr.json`, `en.json`, `ja.json` — ajout section `profileSetup` (20+ clés)

**Flow de navigation complet** :

```
App → Slides onboarding (1ère fois) → Auth (login/signup)
→ Profile Setup (3 étapes) → Tabs (app principale)
```

**Estimation** : ✅ Terminé

---

## 🌐 MVP Phase 2C — Social & Communautés (Groupe 5 + Écrans complémentaires)

> Réf : 50 Fonctionnalités — Groupe 5 (Mini-apps sociales natives)
> Réf : Écrans complémentaires — Gestion avancée communautés/serveurs

### DEV-011 : Stories Réelles ✅

**Priorité** : P1 - Important  
**Réf** : Groupe 5, Fonc. 1 — "Stories 24h (texte, photo, vidéo, glosses kawaii)"  
**Statut** : ✅ Implémenté

**Implémentation réalisée** :

- ✅ `migrations/004_stories.sql` — Tables Supabase : `stories`, `story_views`, `story_replies` avec RLS
- ✅ `services/stories-api.ts` (~450 lignes) — CRUD stories, upload media, vues, réactions, réponses
- ✅ `stores/stories-store.ts` (~310 lignes) — State Zustand avec viewer controls
- ✅ `app/stories/viewer.tsx` (~470 lignes) — Viewer plein écran immersif
  - Timer bar avec progression automatique
  - Navigation tap gauche/droite
  - Long press pour pause
  - Swipe pour fermer
  - Input réponses + réactions (❤️😂😮😢🔥👏)
  - Compteur de vues pour ses propres stories
- ✅ `app/stories/create.tsx` (~530 lignes) — Création multi-mode
  - 4 modes : Photo, Vidéo, Galerie, Texte
  - 12 backgrounds colorés pour stories texte
  - 4 styles de police (default/serif/mono/handwritten)
  - Sélecteur visibilité (public/amis/privé)
  - Toggle "autoriser réponses"
- ✅ `app/stories/_layout.tsx` — Stack navigation (fullScreenModal)
- ✅ `app/(tabs)/social.tsx` — Intégration store remplaçant MOCK_STORY_USERS
- ✅ i18n complet (fr, en, ja)

**Fichiers créés/modifiés** :

- `mobile/migrations/004_stories.sql` (NEW)
- `mobile/services/stories-api.ts` (NEW)
- `mobile/stores/stories-store.ts` (NEW)
- `mobile/app/stories/viewer.tsx` (NEW)
- `mobile/app/stories/create.tsx` (NEW)
- `mobile/app/stories/_layout.tsx` (NEW)
- `mobile/app/(tabs)/social.tsx` (MODIFIED)
- `mobile/services/media-upload.ts` (MODIFIED — ajout takeVideo, uploadMediaToSupabase)
- `mobile/i18n/*.json` (MODIFIED — section stories)

**Date de complétion** : Session actuelle

---

### DEV-012 : Feed Social / Timeline

**Priorité** : P2 - Moyen  
**Réf** : Groupe 5, Fonc. 2 — "Mur social type timeline"  
**Statut** : ✅ Complété

**État actuel** :

- ✅ `app/(tabs)/social.tsx` — Feed réel avec Supabase, likes, partage, infini scroll
- ✅ `services/social-feed.ts` — Service complet CRUD posts + comments (~750 lignes)
- ✅ `app/social/create-post.tsx` — Création de post (texte + images)
- ✅ `app/social/comments/[postId].tsx` — Écran commentaires paginé

**Implémenté** :

- [x] Service `social-feed.ts` avec types Post, Comment, Author
- [x] `fetchFeed()` avec pagination cursor-based et filtres (all/following/news)
- [x] `createPost()`, `deletePost()` — CRUD posts
- [x] `likePost()`, `unlikePost()`, `toggleLike()` — système de likes
- [x] `fetchComments()`, `addComment()`, `deleteComment()` — commentaires
- [x] `sharePost()` — compteur partages
- [x] Écran social.tsx modifié pour utiliser données réelles
- [x] Infinite scroll avec FlatList et onEndReached
- [x] Écran création de post avec image picker
- [x] Écran commentaires avec ajout/suppression
- [x] i18n fr/en/ja (clés social.createPost._, social.comments._)
- [x] Schema SQL fourni dans `FEED_SCHEMA_SQL` constant

**Note** : Le schéma SQL pour les tables `posts`, `post_likes`, `post_comments`, `comment_likes` et les fonctions RPC est disponible dans `services/social-feed.ts` (constant `FEED_SCHEMA_SQL`)

---

### DEV-013 : Événements ✅

**Priorité** : P3 - Mineur  
**Réf** : Groupe 5, Fonc. 4 — "Événements (invites, inscriptions, rappels)"  
**Statut** : ✅ **Implémenté**

**Implémenté** :

- [x] Table Supabase `events` (title, description, start_time, end_time, location, creator_id, max_participants, is_public, is_cancelled)
- [x] Table `event_participants` (event_id, user_id, status: going/interested/declined)
- [x] Service `services/events.ts` — CRUD complet + RSVP + SQL schema inclus
- [x] Écran liste événements (`app/events/index.tsx`) — filtres all/going/interested/past, pagination
- [x] Écran détail événement (`app/events/[eventId].tsx`) — RSVP, participants, actions organisateur
- [x] Création événement (`app/events/create.tsx`) — formulaire complet avec DateTimePicker
- [x] Layout navigation (`app/events/_layout.tsx`)
- [x] i18n traductions FR/EN/JA
- [ ] Rappels push via notifications (Phase ultérieure)

**SQL Schema** : Disponible dans `services/events.ts` (constant `EVENTS_SCHEMA_SQL`)

**Temps réel** : 1 session

---

### DEV-014 : Groupes Avancés / Serveurs ✅

**Priorité** : P2 - Moyen  
**Réf** : Groupe 5, Fonc. 5 + Écrans complémentaires §3 — Communautés/Serveurs  
**Statut** : ✅ **Phase 2C implémentée**

**État actuel** :

- ✅ Groupes de chat via `conversation_members` (multi-participants)
- ✅ `NewChatModal` permet de créer des groupes
- ✅ Gestion de rôles, permissions, modération implémentée

**Implémenté (Phase 2C)** :

- [x] Service `services/groups.ts` — Gestion complète groupes avancés + SQL schema
- [x] Rôles hiérarchisés (owner > admin > moderator > member) avec `ROLE_PRIORITY` map
- [x] Permissions admin : kick, ban/unban, mute/unmute (avec durées)
- [x] Invitations par lien unique — génération, copie, partage, révocation
- [x] Description et règles du groupe — éditables
- [x] Écran gestion groupe (`app/chat/group-settings/[conversationId].tsx`)
- [x] Écran rejoindre groupe (`app/join-group.tsx`) — via code d'invitation
- [x] Transfert de propriété
- [x] i18n traductions FR/EN/JA
- [ ] Avatar/bannière du groupe (image picker à ajouter)

**À implémenter (Phase 3 — style Discord/Slack)** :

- [ ] Serveurs multi-canaux (text + voice channels)
- [ ] Hiérarchie de rôles avec permissions granulaires
- [ ] Journal d'audit administrateur
- [ ] Auto-modération (mots interdits, flood detection)
- [ ] Statistiques engagement serveur

**Estimation** : 3-5 jours (Phase 2C)

---

## 🔐 MVP Phase 2D — Auth Avancée, Sécurité & Confidentialité

> Réf : Écrans complémentaires — §1 Auth & Sécurité, §2 Confidentialité & Conformité

### DEV-015 : OAuth & Auth Multi-Méthodes

**Priorité** : P1 - Important (inclut CRIT-002)  
**Réf** : Écrans complémentaires §1 — "Auth multi-méthodes (email, téléphone, OAuth)"  
**Statut** : ✅ OAuth Google/Apple configuré

**État actuel** :

- ✅ Login email/password (`app/(auth)/login.tsx`)
- ✅ Register (`app/(auth)/register.tsx`)
- ✅ Forgot password (`app/(auth)/forgot-password.tsx`)
- ✅ OAuth Google Sign-In (expo-auth-session + Supabase signInWithIdToken)
- ✅ OAuth Apple Sign-In (expo-apple-authentication + Supabase signInWithIdToken)
- ❌ OTP par téléphone (Phase ultérieure)

**Corrections appliquées** :

- [x] Fix scheme mismatch: `app.json` scheme changé de `"mobile"` à `"imuchat"` (redirect URI `imuchat://auth/callback`)
- [x] Google OAuth Client IDs configurés dans `.env` (web, iOS, Android depuis Firebase `imuchat-378ad`)
- [x] Plugin `expo-apple-authentication` ajouté dans `app.json` plugins (entitlement Sign in with Apple)
- [x] REVERSED_CLIENT_ID ajouté comme CFBundleURLScheme iOS pour Google Sign-In natif
- [x] SocialLoginButtons ajouté à l'écran register (était uniquement sur login)
- [x] Validation des client IDs + logs debug en mode `__DEV__`
- [x] UI boutons sociaux sur login + register screens

**Fichiers modifiés** :

- `app.json` — scheme, plugins, iOS infoPlist CFBundleURLTypes
- `.env` — EXPO_PUBLIC_GOOGLE_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
- `components/auth/SocialLoginButtons.tsx` — validation config, redirect URI debug logs
- `app/(auth)/register.tsx` — ajout SocialLoginButtons

**Reste à faire (côté dashboard/serveur)** :

- [ ] Configurer Google comme provider OAuth dans Supabase Dashboard (Auth → Providers → Google)
- [ ] Configurer Apple comme provider OAuth dans Supabase Dashboard (Auth → Providers → Apple)
- [ ] Vérifier que les Google OAuth Consent Screen est bien configuré dans Google Cloud Console
- [ ] Vérification OTP par SMS (Supabase Auth phone provider — Phase ultérieure)

**Estimation** : ✅ Côté mobile terminé | Reste config dashboard ~1h

---

### DEV-016 : Sécurité Avancée

**Priorité** : P2 - Moyen  
**Réf** : Écrans complémentaires §1 — Sécurité & Sessions  
**Statut** : ✅ Implémenté (Phase 2D)

**Implémenté (22 fév)** :

- [x] Gestion multi-appareils (liste sessions actives via Supabase Auth)
- [x] Révocation globale (déconnexion tous appareils)
- [x] 2FA via TOTP (Supabase MFA — enroll, verify, unenroll)
- [x] Biométrie locale (FaceID/TouchID) via `expo-local-authentication`
- [x] Section Sécurité dans Settings avec UI complète
- [x] Traductions i18n (fr/en/ja — 18 clés)

**Fichiers créés** :

- `services/security.ts` — Service complet (biométrie, MFA, sessions)

**Fichiers modifiés** :

- `app/(tabs)/settings.tsx` — Section Sécurité avec biométrie, 2FA, sessions
- `i18n/fr.json`, `en.json`, `ja.json` — Traductions sécurité

**Dépendances ajoutées** :

- `expo-local-authentication` — Biométrie native
- `expo-secure-store` — Stockage sécurisé

**À implémenter (Phase 3)** :

- [ ] Historique des connexions (IP, device, date)
- [ ] Gestion clés E2EE (génération, rotation)
- [ ] Export journal d'activité sécurisé
- [ ] Révocation session individuelle (nécessite endpoint backend admin)

**Estimation** : ✅ Complété

---

### DEV-017 : Centre de Confidentialité (RGPD)

**Priorité** : P2 - Moyen  
**Réf** : Écrans complémentaires §2 — Confidentialité & Conformité  
**Statut** : ✅ Complété

**État actuel** :

- ✅ Settings privacy : show_online, show_last_seen, read_receipts, search_phone (dans settings.tsx)
- ✅ Suppression de compte (écran existant dans settings)
- ✅ Centre de confidentialité dédié (privacy-center.tsx)

**Implémenté** :

- ✅ Service `services/privacy-center.ts` (~450 lignes)
  - `blockUser()`, `unblockUser()`, `getBlockedUsers()`, `isUserBlocked()`
  - `submitReport()`, `getMyReports()`
  - `getPrivacyConsents()`, `updatePrivacyConsent()`
  - `exportUserData()` avec progression + `shareExportedData()`
  - `requestAccountDeletion()`
- ✅ Écran `app/(tabs)/privacy-center.tsx` (~540 lignes)
  - Section Export données (RGPD Art. 20) avec partage
  - Section Consentements IA (analytics, marketing, ai_processing, third_party)
  - Section Utilisateurs bloqués avec déblocage
  - Section Historique signalements avec statuts
  - Liens légaux (politique confidentialité, CGU, DPO)
- ✅ Bouton accès depuis Settings → "Centre de confidentialité"
- ✅ i18n complet (fr/en/ja) : ~45 clés `privacy.*`

**Estimation** : ✅ Complété

---

## 🏗️ MVP Phase 3 — Modules, IA, Store, Services (Groupes 6-10)

> Ces fonctionnalités sont planifiées pour **après** MVP Phase 2.
> Référencées ici pour assurer la traçabilité avec les 50 fonctionnalités et ADDITIONAL_AND_CORE_MODULES.md.
>
> ⚠️ **Architecture modulaire** : Côté web, 23 mini-apps ont déjà été extraites en apps Vite standalone (Phases A-C terminées). Le backend Supabase (tables `modules` + `user_modules`, triggers auto-install) est **partagé et réutilisable** par le mobile. Voir [📦 MOBILE_MODULES_STRATEGY.md](MOBILE_MODULES_STRATEGY.md) pour la stratégie complète.

### Groupe 6 — Modules avancés (installables via Store)

| #   | Fonctionnalité     | Route   | Statut | Priorité | Notes                           |
| --- | ------------------ | ------- | ------ | -------- | ------------------------------- |
| 1   | Productivity Hub   | /tasks  | 🔴     | P3       | To-do, projets, rappels, boards |
| 2   | Suite Office       | /office | 🔴     | P4       | Texte, tableur, présentation    |
| 3   | Module PDF         | /office | 🔴     | P3       | Viewer/editor PDF, signatures   |
| 4   | Board collaboratif | /tasks  | 🔴     | P4       | Whiteboard, mindmap, kanban     |
| 5   | Cooking & Home     | /home   | 🔴     | P4       | Courses, ménage, repas, alarmes |

### DEV-018 : Module Productivity Hub (/tasks)

**Priorité** : P3  
**Réf** : Groupe 6, Fonc. 1 + ADDITIONAL_AND_CORE_MODULES.md §Organisation  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Table Supabase `tasks` (title, description, due_date, priority, status, assignee_id, project_id)
- [ ] Table `projects` (name, description, owner_id, color, icon)
- [ ] Écran liste projets + création
- [ ] Écran détail projet avec sous-tâches
- [ ] Vue Kanban (colonnes par statut)
- [ ] Rappels via notifications push
- [ ] Intégration avec groupes/conversations

**Estimation** : 3-4 semaines

---

### DEV-019 : Module Office (/office)

**Priorité** : P4  
**Réf** : Groupe 6, Fonc. 2-4 + ADDITIONAL_AND_CORE_MODULES.md §Organisation  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Éditeur texte riche (basé sur Slate ou TipTap)
- [ ] Tableur simple (formules de base)
- [ ] Présentations (slides, templates)
- [ ] Viewer/editor PDF
- [ ] Signatures électroniques
- [ ] Journal personnel privé
- [ ] Export et partage multi-format

**Estimation** : 6-8 semaines

---

### DEV-020 : Module Docs & Storage (/files)

**Priorité** : P3  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Organisation  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Drive cloud intégré (Supabase Storage)
- [ ] Versionning fichiers
- [ ] Partage avec permissions granulaires
- [ ] Sync multi-device
- [ ] Aperçu fichiers (images, PDF, vidéos)
- [ ] Recherche plein texte

**Estimation** : 2-3 semaines

---

### Groupe 7 — Services utilitaires publics

| #   | Fonctionnalité                       | Route     | Statut | Priorité | Notes                  |
| --- | ------------------------------------ | --------- | ------ | -------- | ---------------------- |
| 1   | Horaires métro/tram/bus avec alertes | /mobility | 🔴     | P4       | API transport + géoloc |
| 2   | Info trafic routier temps réel       | /mobility | 🔴     | P4       | API traffic            |
| 3   | Numéros d'urgence géolocalisés       | /mobility | 🔴     | P3       | Base locale            |
| 4   | Annuaire services publics            | /mobility | 🔴     | P4       | CAF, CPAM, etc.        |
| 5   | Suivi colis multi-transporteurs      | /mobility | 🔴     | P3       | API tracking           |

### DEV-021 : Module Mobility (/mobility)

**Priorité** : P3-P4  
**Réf** : Groupe 7 + ADDITIONAL_AND_CORE_MODULES.md §Vie quotidienne  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Covoiturage intégré (matching, paiement)
- [ ] Gestion voiture électrique (niveau batterie, chargeurs à proximité)
- [ ] Suivi trajets GPS
- [ ] Partage localisation en temps réel
- [ ] Horaires transports en commun (API GTFS)
- [ ] Alertes trafic
- [ ] Suivi colis multi-transporteurs

**Estimation** : 3-4 semaines

---

### Groupe 8 — Divertissement & Création

| #   | Fonctionnalité                   | Route     | Statut | Priorité | Notes                    |
| --- | -------------------------------- | --------- | ------ | -------- | ------------------------ |
| 1   | Mini-lecteur musique + playlists | /music    | 🔴     | P3       | API streaming musique    |
| 2   | Podcasts (catalogue + favoris)   | /podcasts | 🔲     | P3       | Mock UI dans Home        |
| 3   | Lecteur vidéo intégré            | /feed     | 🔴     | P3       | Qualité adaptative       |
| 4   | Mini-jeux sociaux                | /store    | 🔴     | P4       | Quiz, dessin, devinettes |
| 5   | Création stickers & emojis       | /design   | 🔴     | P4       | Éditeur intégré          |

### DEV-022 : Module Musique & Audio (/music)

**Priorité** : P3  
**Réf** : Groupe 8, Fonc. 1 + ADDITIONAL_AND_CORE_MODULES.md §Créativité  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Lecteur audio avec contrôles (play, pause, seek, volume)
- [ ] Playlists personnelles
- [ ] Partage sons courts (style TikTok audio)
- [ ] Ambiance sonore (focus, détente, sommeil)
- [ ] Intégration with chat (partage musique en cours)
- [ ] Mini-player persistant

**Estimation** : 2-3 semaines

---

### DEV-023 : Module Podcasts (/podcasts)

**Priorité** : P3  
**Réf** : Groupe 8, Fonc. 2 + ADDITIONAL_AND_CORE_MODULES.md §Social  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Catalogue podcasts (API podcast index)
- [ ] Abonnements et favoris
- [ ] Playlists d'épisodes
- [ ] Lecture avec vitesse variable (0.5x - 2x)
- [ ] Chapitres (si disponibles)
- [ ] Mode offline (téléchargement)
- [ ] Historique d'écoute avec reprise

**Estimation** : 2-3 semaines

---

### Groupe 9 — IA intégrée

| #   | Fonctionnalité                     | Route | Statut | Priorité | Notes                        |
| --- | ---------------------------------- | ----- | ------ | -------- | ---------------------------- |
| 1   | Chatbot multi-personas             | /ai   | 🔴     | P2       | Assistant Alice planifié     |
| 2   | Suggestions intelligentes réponses | /chat | 🔴     | P3       | NLP / LLM                    |
| 3   | Résumé automatisé conversations    | /chat | 🔴     | P3       | LLM summarization            |
| 4   | Modération automatique groupes     | /bots | 🔴     | P3       | Détection spam / toxicité    |
| 5   | Traduction instantanée chats       | /chat | 🔴     | P2       | Google/DeepL API intégration |

### DEV-024 : Assistant IA (Alice) (/ai)

**Priorité** : P2  
**Réf** : Groupe 9, Fonc. 1 + ADDITIONAL_AND_CORE_MODULES.md §IA  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Chat conversationnel avec LLM (OpenAI/Claude/local)
- [ ] Multi-personas (assistant général, santé, études, style, pro)
- [ ] Génération de contenu (texte, résumés, images)
- [ ] Mémoire contextuelle par utilisateur
- [ ] Prompts système personnalisables
- [ ] Live2D avatar animé (Phase avancée)
- [ ] Intégration dans conversations (mention @Alice)

**Estimation** : 4-6 semaines

---

### DEV-025 : Bots de groupe (/bots)

**Priorité** : P3  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §IA  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Framework bots modulaire
- [ ] Bot modération (auto-kick, mute, warnings)
- [ ] Bot quiz (questions/réponses dans les groupes)
- [ ] Bot animation (GIFs, jeux, polls)
- [ ] Bots spécialisés (gaming, études, business)
- [ ] Marketplace bots

**Estimation** : 2-3 semaines

---

### DEV-026 : Traduction Instantanée

**Priorité** : P2  
**Réf** : Groupe 9, Fonc. 5  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Détection automatique de langue
- [ ] Traduction à la demande (bouton sur message)
- [ ] Traduction automatique optionnelle par conversation
- [ ] Support 50+ langues (Google Translate / DeepL API)
- [ ] Cache traductions (économie API)
- [ ] Indicateur "message traduit"

**Estimation** : 1-2 semaines

---

### Groupe 10 — App Store & Écosystème

| #   | Fonctionnalité                       | Route  | Statut | Priorité | Notes                     |
| --- | ------------------------------------ | ------ | ------ | -------- | ------------------------- |
| 1   | Store apps internes/partenaires      | /store | 🔲     | P3       | Mock UI (587 lignes)      |
| 2   | Installation/désinstallation modules | /store | 🔴     | P3       | Module registry           |
| 3   | Permissions par app (granulaire)     | /store | 🔴     | P4       | Sandbox permissions       |
| 4   | Marketplace services                 | /store | 🔴     | P4       | Designers, pros, artisans |
| 5   | Paiement intégré + portefeuille      | /store | 🔴     | P3       | Stripe/Apple/Google Pay   |

### DEV-027 : Store & Modules Registry

**Priorité** : P3  
**Réf** : Groupe 10 + ADDITIONAL_AND_CORE_MODULES.md §Core Store  
**Statut** : 🔲 Mock UI existant  
**Stratégie détaillée** : ➡️ [MOBILE_MODULES_STRATEGY.md](MOBILE_MODULES_STRATEGY.md)

**Backend déjà prêt (à réutiliser)** :

- ✅ Table Supabase `modules` (37 modules, colonnes `default_enabled`, `is_core`)
- ✅ Table Supabase `user_modules` (install/uninstall par user)
- ✅ Trigger auto-install au signup (`on_profile_created_install_modules`)
- ✅ Fonction backfill pour users existants (`backfill_default_modules_all_users()`)
- ✅ API platform-core : `GET /api/modules`, `POST /api/modules/:id/install`, `DELETE /api/modules/:id/uninstall`
- ✅ 23 mini-apps Vite chargeables en WebView (mêmes bundles que le web)

**À implémenter côté mobile** :

- [ ] `services/modules-api.ts` — Client API catalogue + install/uninstall
- [ ] `stores/modules-store.ts` — Zustand persist (catalogue + modules installés)
- [ ] `components/miniapps/MiniAppHostMobile.tsx` — WebView sandboxée (analogue MiniAppHost.tsx web)
- [ ] `services/mobile-bridge.ts` — Communication postMessage WebView ↔ RN
- [ ] Remplacer `MOCK_CATALOG` dans `store.tsx` par le catalogue Supabase
- [ ] Navigation `/store/:moduleId` → MiniAppHostMobile
- [ ] Permissions par module (modal avant installation)
- [ ] Section « Recommandés » & classements
- [ ] Reviews et notes
- [ ] Mini-apps tierces (sandbox sécurisé via WebView)

**Estimation** : 4-6 semaines

---

### DEV-028 : Paiement & Portefeuille

**Priorité** : P3  
**Réf** : Groupe 10, Fonc. 5  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Intégration Stripe (cartes, Apple Pay, Google Pay)
- [ ] Portefeuille ImuWallet (solde interne)
- [ ] Achats in-app (thèmes, modules premium, avatars)
- [ ] Abonnements ImuChat Pro
- [ ] Historique transactions
- [ ] Monnaie virtuelle ImuCoin (gamification)

**Estimation** : 3-4 semaines

---

### Écrans complémentaires Phase 3

| Catégorie                   | # Écrans | Priorité | Notes                                        |
| --------------------------- | -------- | -------- | -------------------------------------------- |
| Wallet & Monétisation       | ~10      | P3       | ImuBank, ImuCoin, abonnements                |
| Store Dev & Créateurs       | ~11      | P3       | Soumission apps, éditeur thèmes              |
| IA Administration           | ~7       | P3       | Personas, mémoire IA, audit                  |
| Analytics & Insights        | ~7       | P3       | Dashboard métriques, export CSV              |
| Gestion fichiers / stockage | ~7       | P3       | Drive personnel, sync multi-device           |
| Paramètres globaux avancés  | ~9       | P2       | Notifications granulaires, A11Y, performance |
| Support & Assistance        | ~8       | P2       | Centre d'aide, tickets, FAQ                  |
| Gamification                | ~6       | P3       | XP, badges, missions, classements            |

---

## � MVP Phase 4 — Modules Vie Quotidienne & Contenus Avancés

> Ces fonctionnalités sont planifiées pour **après** la Phase 3.
> Réf : ADDITIONAL_AND_CORE_MODULES.md — Social & Contenus, Vie quotidienne, Créativité

### DEV-029 : Module News (/news)

**Priorité** : P3  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Social  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Agrégateur d'articles (RSS, API news)
- [ ] Tendances et actualités
- [ ] Filtres par thématiques (tech, sport, entertainment...)
- [ ] Lecteur interne (mode lecture)
- [ ] Sauvegarde / bookmarks
- [ ] Partage dans conversations

**Estimation** : 2-3 semaines

---

### DEV-030 : Module Dating (/dating)

**Priorité** : P4  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Social  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Profil dating **séparé** du profil principal (confidentialité)
- [ ] Système de matching par préférences
- [ ] Algorithme de compatibilité
- [ ] Swipe cards (like/pass/super like)
- [ ] Chat privé après match
- [ ] Plans freemium/premium (boost, voir qui vous a liké)
- [ ] Vérification photo anti-catfish

**Estimation** : 4-6 semaines

---

### DEV-031 : Module Formations (/courses)

**Priorité** : P4  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Social  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Catalogue de cours (vidéos, documents)
- [ ] Suivi de progression par cours
- [ ] Quiz et évaluations
- [ ] Certificats de complétion
- [ ] Notes et marque-pages
- [ ] Forum de discussion par cours
- [ ] Créateur de cours (UGC)

**Estimation** : 4-6 semaines

---

### DEV-032 : Module Style & Beauté (/style)

**Priorité** : P4  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Vie quotidienne  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Conseils mode, beauté, vestimentaires
- [ ] Agent IA de style personnalisé
- [ ] Wardrobe virtuelle (photos vêtements)
- [ ] Suggestions outfits basées sur météo/événement
- [ ] Marketplace looks et thèmes

**Estimation** : 3-4 semaines

---

### DEV-033 : Module Smart Home (/home)

**Priorité** : P4  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Vie quotidienne  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Connexion maison intelligente (lumières, thermostat, caméras)
- [ ] Gestion énergie (consommation, alertes)
- [ ] Module Famille :
  - [ ] Liste de courses partagée
  - [ ] Suivi santé famille
  - [ ] Calendrier enfants (école, activités)
  - [ ] Documents famille (ordonnances, vaccins)
- [ ] Annuaire services maison (baby-sitter, plombier, etc.)

**Estimation** : 4-6 semaines

---

### DEV-034 : Module Design & Media (/design)

**Priorité** : P4  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Créativité  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Éditeur type Canva (templates, images, texte)
- [ ] Montage vidéo simple (coupes, transitions, texte)
- [ ] Bibliothèque d'assets (images, icons, backgrounds)
- [ ] Création stickers & emojis personnalisés
- [ ] Export multi-format (PNG, JPG, MP4, GIF)
- [ ] Partage direct dans conversations/stories

**Estimation** : 4-6 semaines

---

### DEV-035 : Module Organizations (/orgs)

**Priorité** : P4  
**Réf** : ADDITIONAL_AND_CORE_MODULES.md §Organisation  
**Statut** : 🔴 Non démarré

**Templates d'organisation à implémenter** :

- [ ] ONG & Associations (membres, cotisations, événements)
- [ ] Écoles & Formations (classes, profs, devoirs, notes)
- [ ] Garderies & Périscolaire (pointage, activités, photos)
- [ ] Églises & Communautés religieuses (paroisses, événements, dons)
- [ ] PME & Startups (équipes, projets, KPIs)
- [ ] Centres de loisirs (inscriptions, planning, animateurs)

**Fonctionnalités communes** :

- [ ] Tableau de bord par type d'org
- [ ] Rôles et permissions granulaires
- [ ] Communication ciblée (groupes, annonces)
- [ ] Gestion financière (cotisations, paiements)
- [ ] Calendrier partagé

**Estimation** : 6-8 semaines

---

## 🗺️ Cartographie Complète des Mini-Apps & Modules

> Réf : `docs/ADDITIONAL_AND_CORE_MODULES.md` — Vue d'ensemble de l'écosystème ImuChat
> ImuChat = réseau social + hub de vie quotidienne + outils créatifs + apps collaboratives, modulaire via Store
>
> 📦 **Stratégie modulaire mobile détaillée** : [MOBILE_MODULES_STRATEGY.md](MOBILE_MODULES_STRATEGY.md)
> 🏗️ **Audit architecture web (Phases A-C)** : [ARCHITECTURE_MODULES_AUDIT.md](../docs/ARCHITECTURE_MODULES_AUDIT.md)

### 1. CORE — Modules installés par défaut

| Module          | Route     | Description                                                                                                       | Statut  | Réf Tracker                |
| --------------- | --------- | ----------------------------------------------------------------------------------------------------------------- | ------- | -------------------------- |
| **Chats**       | /chat     | Messages (texte, audio, image, vidéo, fichiers), réactions, réponses, citations, épingles, groupes, arrière-plans | ✅ 80%  | DEV-001, DEV-003           |
| **Appels**      | /calls    | Audio/vidéo (3 formats), historique, appels programmés, rappels                                                   | ⚠️ 40%  | DEV-006, DEV-007, CRIT-001 |
| **Contacts**    | /contacts | Carnet d'adresses, sync téléphone/réseaux sociaux, statuts/présence                                               | ✅ 90%  | Existant                   |
| **Communautés** | /comms    | Groupes enrichis (familles, associations, PME, gamers), outils collaboratifs, espaces publics/privés              | ✅ 70%  | DEV-014 ✅                 |
| **Store**       | /store    | Marketplace + App Store fusionnés, thèmes, mini-apps, extensions IA                                               | 🔲 Mock | Groupe 10                  |
| **Profil**      | /me       | Profil social, préférences (thèmes, privacy), comptes multiples                                                   | ✅ 70%  | DEV-008, DEV-009, DEV-010  |

### 2. SOCIAL & CONTENUS — Modules optionnels

| Module         | Route     | Description                                                                            | Statut  | Phase | Estimation   |
| -------------- | --------- | -------------------------------------------------------------------------------------- | ------- | ----- | ------------ |
| **Feed**       | /feed     | Vidéo/audio scroll type TikTok, "Pour Toi", Suivis, Découverte, interactions           | ✅ Done | 2C    | DEV-012 ✅   |
| **News**       | /news     | Articles, tendances, filtres thématiques, lecteur interne, sauvegarde                  | 🔴      | 3     | 2-3 semaines |
| **Podcasts**   | /podcasts | Recherche, abonnements, playlists, vitesse variable, chapitres                         | 🔴      | 3     | 2-3 semaines |
| **Dating**     | /dating   | Profil séparé (confidentialité), matching par préférences/algorithme, freemium/premium | 🔴      | 4     | 4-6 semaines |
| **Formations** | /courses  | Vidéos de cours, documents, suivi progrès, quiz, certifications                        | 🔴      | 4     | 4-6 semaines |

### 3. VIE QUOTIDIENNE — Modules optionnels

| Module             | Route     | Description                                                                                        | Statut | Phase | Estimation   |
| ------------------ | --------- | -------------------------------------------------------------------------------------------------- | ------ | ----- | ------------ |
| **Style & Beauté** | /style    | Conseils mode/beauté/vestimentaires, agent IA de style, marketplace looks/thèmes                   | 🔴     | 4     | 3-4 semaines |
| **Smart Home**     | /home     | Maison connectée (lumières, alarme, énergie), famille (courses, santé, éducation), services maison | 🔴     | 4     | 4-6 semaines |
| **Mobility**       | /mobility | Covoiturage intégré, gestion voiture électrique, suivi trajets, partage localisation               | 🔴     | 3     | 3-4 semaines |
| **Office**         | /office   | Texte, tableur, présentation, PDF & signatures, boards & organisation, journal personnel           | 🔴     | 3     | Groupe 6     |

### 4. CRÉATIVITÉ & MULTIMÉDIA — Modules optionnels

| Module              | Route   | Description                                                                       | Statut | Phase | Estimation    |
| ------------------- | ------- | --------------------------------------------------------------------------------- | ------ | ----- | ------------- |
| **Design & Media**  | /design | Mini-app type Canva, montage vidéo simple, bibliothèque assets                    | 🔴     | 4     | 4-6 semaines  |
| **Musique & Audio** | /music  | Lecteur musique & playlists, partage sons courts (style TikTok), ambiance sonore  | 🔴     | 3     | Groupe 8      |
| **Animations & 3D** | /anim   | Éditeur animations 2D/3D, bibliothèque modèles, intégration stories/présentations | 🔴     | 4+    | Vision Live2D |

### 5. ORGANISATION & PRO — Modules optionnels

| Module                   | Route   | Description                                                                        | Statut  | Phase | Estimation   |
| ------------------------ | ------- | ---------------------------------------------------------------------------------- | ------- | ----- | ------------ |
| **Tasks / Productivity** | /tasks  | To-do lists, projets, rappels, intégration groupes & boards                        | 🔴      | 3     | Groupe 6     |
| **Events**               | /events | Agenda partagé, RSVP, tickets, rappels                                             | ✅ Done | 2C    | DEV-013 ✅   |
| **Docs & Storage**       | /files  | Drive cloud intégré, versionning & partage                                         | 🔴      | 3     | 2-3 semaines |
| **Organizations**        | /orgs   | ONG, associations, écoles, formations, garderies, églises, PME, centres de loisirs | 🔴      | 4     | 4-6 semaines |

### 6. IA & ASSISTANCE — Transversal

| Module                   | Route | Description                                                                                                                     | Statut | Phase | Estimation   |
| ------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | ------------ |
| **Assistant IA (Alice)** | /ai   | Chat conversationnel, conseiller perso (santé, études, style, pro), génération contenu (texte, image, résumé), prompts personas | 🔴     | 3     | Groupe 9     |
| **Bots de groupe**       | /bots | Bots modération, quiz, animation, bots spécialisés (gaming, études, business)                                                   | 🔴     | 3     | 2-3 semaines |

### 7. TRANSVERSAL — Présent partout

| Fonctionnalité                            | Description                                                                                             | Statut  | Réf Tracker            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- | ---------------------- |
| **Thèmes & Layout Editor**                | Choix thèmes (Light, Dark, Kawaii, Pro, Neon, Ocean), layouts personnalisés, créateur & boutique thèmes | ✅ 80%  | DEV-009 ✅             |
| **Notifications**                         | Push (Expo + FCM), bridge 3 couches, badge système                                                      | ✅ 90%  | BUG-003 ✅             |
| **Search global**                         | Messages, conversations (debounce, surbrillance)                                                        | ✅ 100% | DEV-005 ✅             |
| **Paramètres confidentialité & sécurité** | MFA TOTP, biométrie, sessions, privacy center, RGPD, blocage, signalements                              | ✅ 90%  | DEV-016 ✅, DEV-017 ✅ |
| **Mode hors-ligne**                       | Queue offline AsyncStorage, sync automatique                                                            | ✅ 90%  | BUG-002 ✅             |
| **Multi-plateforme**                      | Web, mobile, desktop                                                                                    | ✅      | Existant               |

---

### Récapitulatif Modules par Phase

| Phase             | Modules                                                                        | Priorité | Estimation        |
| ----------------- | ------------------------------------------------------------------------------ | -------- | ----------------- |
| **Phase 2 (MVP)** | Chats, Appels, Contacts, Profil, Communautés (basique), Feed (basique), Events | P0-P2    | ~11 semaines      |
| **Phase 3**       | Store, Office, Tasks, Docs, Mobility, Music, Assistant IA, Bots                | P2-P3    | ~8-12 semaines    |
| **Phase 4**       | News, Podcasts, Dating, Formations, Style, Smart Home, Design, Organizations   | P3-P4    | ~16-24 semaines   |
| **Phase 5+**      | Animations 3D, Live2D, Mode avatar appels vidéo                                | P4       | Vision long terme |

---

## 🎭 Vision Long Terme — 3D & Live2D

> Réf : Document 3D_AND_Live2D.md — Stratégie d'intégration progressive

### Principe

La 3D et le Live2D ne sont pas des gadgets — ils sont la **matérialisation de la vision immersive manga/anime** d'ImuChat. Mais ils doivent rester **modulaires et optionnels**.

### Phases d'intégration

| Phase             | Contenu                                                           | Estimation   | Prérequis                |
| ----------------- | ----------------------------------------------------------------- | ------------ | ------------------------ |
| **Phase 1 (MVP)** | Avatars statiques, infrastructure prête pour Live2D               | ✅ Fait      | -                        |
| **Phase 2**       | Live2D dans profils & assistant IA, avatar animé léger (lip sync) | 2-3 semaines | GPU profiling, EAS Build |
| **Phase 3**       | Espaces 3D optionnels (salons communautaires, watch party)        | 1-2 mois     | Three.js / Expo GL       |

### Cas d'usage stratégiques

1. **Avatar Live2D dans les profils** — Clignement, respiration, micro-expressions
2. **Appels vidéo mode avatar** — Lip sync sans caméra (respect vie privée)
3. **Assistant IA incarné (Alice)** — Persona visuelle animée pendant les réponses
4. **Personnalisation avatar premium** — Vêtements, accessoires, emotes (monétisation)
5. **Espaces communautaires 3D** — Hall virtuel, événements immersifs

### Monétisation potentielle

- Packs d'animations / expressions premium
- Skins et accessoires avatar
- Bundles thématiques (anime, cyberpunk, kawaii)
- Marketplace créateurs de modèles Live2D

---

## 📊 Comparatif Mobile vs Web-App

### Groupe 1 — Messagerie & Communication

| Fonctionnalité (50 fonc.)           | Mobile                          | Web-App              | Écart  |
| ----------------------------------- | ------------------------------- | -------------------- | ------ |
| 1. Messagerie (texte, emojis, GIFs) | ✅ Supabase Realtime            | ✅ Socket.IO         | Parité |
| 2. Messages vocaux transcrits       | ✅ Whisper pipeline (4 couches) | ✅                   | Parité |
| 3. Pièces jointes (photos/vidéos)   | ✅ Caméra + galerie             | ✅ Drag & drop       | Parité |
| 4. Édition/suppression messages     | ✅ Session 21/02                | ✅                   | Parité |
| 5. Réactions rapides                | ✅ Long-press + count           | ✅ Supabase Realtime | Parité |

### Groupe 2 — Appels Audio & Vidéo

| Fonctionnalité (50 fonc.)    | Mobile                                    | Web-App | Écart            |
| ---------------------------- | ----------------------------------------- | ------- | ---------------- |
| 1. Appels audio (1:1/groupe) | ✅ Stream Video SDK, token backend        | ✅      | Parité           |
| 2. Appels vidéo HD           | ✅ StreamVideo + StreamCall + CallContent | ✅      | Parité           |
| 3. Mini-fenêtre PiP          | 🔴                                        | ❌      | Aucun            |
| 4. Partage d'écran           | 🔴                                        | ✅      | **Web > Mobile** |
| 5. Filtre beauté IA + flou   | 🔴                                        | ❌      | Aucun            |

### Groupe 3 — Profils & Identité

| Fonctionnalité (50 fonc.)          | Mobile                                   | Web-App            | Écart            |
| ---------------------------------- | ---------------------------------------- | ------------------ | ---------------- |
| 1. Profils privés/publics/anonymes | ✅ Visibility ENUM + RLS                 | ⚠️ Basique         | **Mobile > Web** |
| 2. Multi-profils                   | 🔴                                       | 🔴                 | Aucun            |
| 3. Avatars 2D/3D                   | ⚠️ Photo + upload Storage                | ⚠️ Photo seulement | Parité           |
| 4. Statuts animés                  | ✅ StatusPicker (emoji+texte+expiration) | 🔴                 | **Mobile > Web** |
| 5. Vérification identité           | ⚠️ Badge UI, KYC Phase 3                 | 🔴                 | **Mobile > Web** |

### Groupe 4 — Personnalisation

| Fonctionnalité (50 fonc.)  | Mobile                                              | Web-App               | Écart       |
| -------------------------- | --------------------------------------------------- | --------------------- | ----------- |
| 1. Thèmes visuels          | ✅ 6 thèmes (Light, Dark, Kawaii, Pro, Neon, Ocean) | ✅ 8 thèmes + density | Parité      |
| 2. Arrière-plans animés    | 🔴                                                  | 🔴                    | Aucun       |
| 3. Police par conversation | 🔴                                                  | 🔴                    | Aucun       |
| 4. Packs d'icônes/sons     | 🔴                                                  | 🔴                    | Aucun       |
| 5. Widget homescreen       | 🔴                                                  | N/A                   | Mobile-only |

### Groupe 5 — Mini-apps Sociales

| Fonctionnalité (50 fonc.) | Mobile                            | Web-App             | Écart         |
| ------------------------- | --------------------------------- | ------------------- | ------------- |
| 1. Stories 24h            | 🔲 Mock UI (social.tsx, 452 lig.) | ⚠️ Fallback mock    | Parité (mock) |
| 2. Mur social / timeline  | 🔲 Mock UI (social.tsx)           | ⚠️ Fallback mock    | Parité (mock) |
| 3. Mini-blogs             | 🔴                                | 🔴                  | Aucun         |
| 4. Événements             | 🔴                                | 🔴                  | Aucun         |
| 5. Groupes avancés        | ⚠️ Groupes basiques               | ⚠️ Groupes basiques | Parité        |

### Auth, Sécurité & Confidentialité (Écrans complémentaires)

| Fonctionnalité               | Mobile                                                    | Web-App    | Écart            |
| ---------------------------- | --------------------------------------------------------- | ---------- | ---------------- |
| OAuth (Google/Apple/Discord) | ✅ Code mobile done (config dashboard restante)           | ✅         | Parité           |
| OTP téléphone                | ❌                                                        | ❌         | Aucun            |
| 2FA / TOTP                   | ✅ Supabase MFA (enroll/verify/unenroll)                  | ❌         | **Mobile > Web** |
| Biométrie (FaceID/TouchID)   | ✅ expo-local-authentication                              | N/A        | Mobile-only      |
| Gestion multi-appareils      | ✅ Sessions actives + révocation globale                  | ❌         | **Mobile > Web** |
| Centre RGPD / Privacy Center | ✅ Complet (export, blocage, signalements, consentements) | ⚠️ Basique | **Mobile > Web** |
| Export données personnelles  | ✅ JSON + partage (RGPD Art. 20)                          | ❌         | **Mobile > Web** |
| Blocage/Signalement          | ✅ Service complet + UI                                   | ❌         | **Mobile > Web** |

### Infrastructure

| Feature            | Mobile                                               | Web-App       | Écart            |
| ------------------ | ---------------------------------------------------- | ------------- | ---------------- |
| Offline queue      | ✅ AsyncStorage                                      | ✅ IndexedDB  | Parité           |
| Logger unifié      | ✅ Factory scopé + buffer circulaire                 | ✅            | Parité           |
| Push notifications | ✅ Expo + bridge 3 couches                           | ✅ FCM        | Parité           |
| i18n               | ✅ ~320 clés (3 langues)                             | ✅ ~2300 clés | **Web > Mobile** |
| Zustand stores     | ✅ 4 stores (notifs, user, stories, ui)              | ✅            | Parité           |
| Tests              | ✅ 51 fichiers (~25-30%)                             | ⚠️ ~7%        | **Mobile > Web** |
| Onboarding         | ✅ 4 slides + profile-setup 3 étapes                 | ❌            | **Mobile > Web** |
| Swipe actions      | ✅                                                   | N/A           | **Mobile > Web** |
| Read receipts      | ✅ ✓✓ visuel                                         | ⚠️            | **Mobile > Web** |
| Rich text/Markdown | ✅ Parser léger (gras, italique, code, barré, liens) | ✅            | Parité           |

---

## 🎯 Roadmap & Priorités

### Vue d'ensemble des phases

```
Phase 2A (Communication)  █████████████░  ~90% fait (DEV-001→006 ✅, CallKit restant)
Phase 2B (Profils)         █████████████░  ~90% (DEV-008 ✅, DEV-009 ✅, DEV-010 ✅)
Phase 2C (Social)          ██████████████  100% (DEV-011→014 tous ✅)
Phase 2D (Auth/Sécurité)   █████████████░  ~90% (DEV-015→017 ✅, config dashboard)
Phase 3  (Modules/IA)      ░░░░░░░░░░░░░░  ~0%  (DEV-018 à DEV-028)
Phase 4  (Vie quotidienne) ░░░░░░░░░░░░░░  ~0%  (DEV-029 à DEV-035)
```

### Sprint actuel — Phase 2A (fin Communication)

| #   | Tâche                    | Réf      | Priorité | Statut | Estimation |
| --- | ------------------------ | -------- | -------- | ------ | ---------- |
| 1   | ~~FAB New Chat~~         | DEV-001  | P0       | ✅     | -          |
| 2   | ~~Edit/Delete messages~~ | DEV-001  | P0       | ✅     | -          |
| 3   | ~~Read receipts~~        | DEV-001  | P0       | ✅     | -          |
| 4   | ~~Stream Video token~~   | CRIT-001 | P0       | ✅     | -          |
| 5   | ~~Pull-to-refresh~~      | DEV-004  | P2       | ✅     | -          |
| 6   | ~~Search globale~~       | DEV-005  | P2       | ✅     | -          |

### Sprint suivant — Phase 2B + 2D (Profils + Auth)

| #   | Tâche                        | Réf     | Priorité | Statut | Estimation     |
| --- | ---------------------------- | ------- | -------- | ------ | -------------- |
| 7   | OAuth Google/Apple           | DEV-015 | P1       | ✅     | ✅ Mobile done |
| 8   | Onboarding flow complet      | DEV-010 | P2       | ✅     | ✅ Terminé     |
| 9   | Profils avancés (visibilité) | DEV-008 | P2       | ✅     | ✅ Phase 2B    |
| 10  | Thèmes étendus (4-6)         | DEV-009 | P3       | ✅     | ✅ Phase 2B    |
| 11  | Sécurité avancée (2FA/bio)   | DEV-016 | P2       | ✅     | ✅ 22 fév      |
| 12  | Centre RGPD                  | DEV-017 | P2       | ✅     | ✅ Terminé     |

### Sprint 3 — Phase 2C (Social réel)

| #   | Tâche                   | Réf     | Priorité | Statut | Estimation |
| --- | ----------------------- | ------- | -------- | ------ | ---------- |
| 13  | ~~Stories réelles~~     | DEV-011 | P1       | ✅     | -          |
| 14  | Feed social / timeline  | DEV-012 | P2       | ✅     | ✅ Terminé |
| 15  | Groupes avancés (rôles) | DEV-014 | P2       | ✅     | ✅ Terminé |
| 16  | Événements              | DEV-013 | P3       | ✅     | ✅ Terminé |

### Backlog infrastructure

| #   | Tâche                          | Priorité | Estimation |
| --- | ------------------------------ | -------- | ---------- |
| 17  | ~~Logger unifié~~              | P2       | ✅         |
| 18  | ~~Zustand stores~~             | P2       | ✅         |
| 19  | Tests unitaires (+30%)         | P1       | 1 semaine  |
| 20  | i18n extension (~500 clés)     | P3       | 2-3 jours  |
| 21  | ~~Messages vocaux transcrits~~ | P2       | ✅         |
| 22  | ~~Rich text/Markdown~~         | P3       | ✅         |
| 23  | CallKit/ConnectionService      | P2       | 1 semaine  |

### Estimation globale MVP Phase 2 Élargi

| Phase                        | Périmètre                                               | Estimation       |
| ---------------------------- | ------------------------------------------------------- | ---------------- |
| 2A                           | Communication avancée (appels, search, pull-to-refresh) | ~2 semaines      |
| 2B                           | Profils, personnalisation, onboarding                   | ~2 semaines      |
| 2C                           | Social réel (stories, feed, groupes, événements)        | ~3 semaines      |
| 2D                           | Auth avancée, sécurité, RGPD                            | ~2 semaines      |
| Infra                        | Logger, stores, tests, i18n, Markdown                   | ~2 semaines      |
| **Total MVP Phase 2 Élargi** |                                                         | **~11 semaines** |

---

### Couverture des 50 fonctionnalités

| Groupe    | Nom                        | Phase | Fonc. couvertes | Progression | Réf Tracker                                    |
| --------- | -------------------------- | ----- | --------------- | ----------- | ---------------------------------------------- |
| 1         | Messagerie & Communication | 2A    | 5/5 ✅          | 100%        | DEV-001, DEV-002, DEV-003, DEV-004             |
| 2         | Appels Audio & Vidéo       | 2A    | 2/5 ⚠️          | 40%         | DEV-006 ✅, DEV-007                            |
| 3         | Profils & Identité         | 2B    | 4/5 ✅          | 80%         | DEV-008 ✅, DEV-010 ✅                         |
| 4         | Personnalisation avancée   | 2B    | 2/5 ⚠️          | 40%         | DEV-009 ✅                                     |
| 5         | Mini-apps sociales natives | 2C    | 5/5 ✅          | 100%        | DEV-011 ✅, DEV-012 ✅, DEV-013 ✅, DEV-014 ✅ |
| 6         | Modules avancés            | 3     | 0/5 🔴          | 0%          | DEV-018, DEV-019, DEV-020                      |
| 7         | Services utilitaires       | 3     | 0/5 🔴          | 0%          | DEV-021                                        |
| 8         | Divertissement & Création  | 3     | 0/5 🔴          | 0%          | DEV-022, DEV-023, DEV-034                      |
| 9         | IA intégrée                | 3     | 0/5 🔴          | 0%          | DEV-024, DEV-025, DEV-026                      |
| 10        | App Store & Écosystème     | 3     | 0/5 🔲          | 0% (mock)   | DEV-027, DEV-028                               |
| **Total** |                            |       | **18/50**       | **36%**     |                                                |

### Modules additionnels (hors 50 fonctionnalités)

| Module             | Phase | Réf Tracker | Statut |
| ------------------ | ----- | ----------- | ------ |
| News               | 4     | DEV-029     | 🔴     |
| Dating             | 4     | DEV-030     | 🔴     |
| Formations/Courses | 4     | DEV-031     | 🔴     |
| Style & Beauté     | 4     | DEV-032     | 🔴     |
| Smart Home         | 4     | DEV-033     | 🔴     |
| Design & Media     | 4     | DEV-034     | 🔴     |
| Organizations      | 4     | DEV-035     | 🔴     |

---

## 📁 Structure du Projet

```
mobile/
├── app/                    # Routes expo-router
│   ├── (auth)/            # Login, Register, Forgot-password
│   ├── (onboarding)/      # Onboarding (UI créée, non connecté)
│   ├── (tabs)/            # 10 tabs visibles + Profile caché
│   │   ├── index.tsx      # Home (683 lig.) — Hero, Stories, Explorer, Podcasts [100% MOCK]
│   │   ├── chats.tsx      # Conversations list + FAB [✅ Supabase]
│   │   ├── calls.tsx      # Historique appels [✅ Supabase]
│   │   ├── contacts.tsx   # Contacts 3 sub-tabs [✅ Supabase]
│   │   ├── social.tsx     # Feed social (654 lig.) — Feed réel + Stories [✅ Supabase]
│   │   ├── store.tsx      # Store apps (587 lig.) — Tabs, Search, Purchase [MOCK]
│   │   ├── watch.tsx      # Watch parties (518 lig.) [100% MOCK]
│   │   ├── notifications.tsx # Notifs (604 lig.) [✅ avec fallback mock]
│   │   ├── settings.tsx   # Settings (1770 lig.) — Complet (MFA, bio, sessions, RGPD)
│   │   ├── privacy-center.tsx # Privacy (677 lig.) — RGPD complet
│   │   └── profile.tsx    # Profil (630 lig.) — Avancé (visibility, status, stats)
│   ├── call/              # Écrans appels (active, incoming, outgoing)
│   ├── chat/              # Chat room [id].tsx + group-settings
│   ├── events/            # Liste + création + détail [✅ Supabase]
│   ├── stories/           # Viewer + création multi-mode [✅ Supabase]
│   ├── social/            # Création post [✅ Supabase]
│   └── search.tsx         # Recherche globale [✅ Fonctionnel]
├── components/            # Composants React Native
│   ├── chat/              # 16 composants chat spécifiques
│   │   ├── MessageContextMenu.tsx  # Reply, Copy, Forward, Edit, Delete
│   │   ├── NewChatModal.tsx        # Création conversation 1:1 ou groupe
│   │   ├── SwipeableConversationItem.tsx
│   │   ├── EmojiPickerButton.tsx   # rn-emoji-keyboard
│   │   ├── GifPicker.tsx           # GIPHY API
│   │   ├── ForwardMessageModal.tsx
│   │   ├── ConversationPickerModal.tsx
│   │   ├── ReplyPreview.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── VoicePlayer.tsx / VoiceRecorder.tsx
│   │   ├── ImageGallery.tsx / MediaPicker.tsx / MediaPreview.tsx
│   │   └── MessageReactions.tsx
│   ├── search/SearchBar.tsx
│   ├── MessageBubble.tsx  # Bulle message + read receipts ✓✓
│   ├── MessageInput.tsx   # Input avec attachments
│   ├── Avatar.tsx / CallControls.tsx / IncomingCallModal.tsx
│   ├── VoiceRecorder.tsx / ReactionPicker.tsx
│   └── OfflineBanner.tsx / NotificationPrompt.tsx
├── hooks/                 # 15 custom hooks
│   ├── useAuth.ts / useAuthV2.ts
│   ├── useChat.ts / useReactions.ts / useTypingIndicator.ts
│   ├── useCallManager.ts / useCallsSafe.ts / useCallHistory.ts / useCalls.ts
│   ├── useMediaUpload.ts / useVoiceRecording.ts
│   ├── useNetworkState.ts / useNotifications.ts / useTranscription.ts
│   └── ...
├── services/              # 18+ services API
│   ├── messaging.ts       # CRUD messages + conversations + read receipts (748 lig.)
│   ├── reactions.ts / media-upload.ts / voice-recording.ts
│   ├── offline-queue.ts   # AsyncStorage queue
│   ├── notifications.ts / notification-api.ts
│   ├── stream-video.ts / stream-video-safe.ts / stream-token.ts
│   ├── call-signaling.ts / calls.ts / calls-safe.ts
│   ├── social-feed.ts (756 lig.) / stories-api.ts (531 lig.)
│   ├── groups.ts (1088 lig.) / events.ts (783 lig.)
│   ├── security.ts (481 lig.) / privacy-center.ts (683 lig.)
│   ├── transcription.ts (205 lig.) / logger.ts (117 lig.)
│   ├── supabase.ts / platform.ts / media-api.ts
│   └── ...
├── providers/             # Context providers (Auth, Theme, I18n)
├── stores/                # Zustand v5 (4 stores)
│   ├── notifications-store.ts (120 lig.) — persist AsyncStorage
│   ├── stories-store.ts (434 lig.) — persist AsyncStorage
│   ├── user-store.ts — persist AsyncStorage (profil + préférences)
│   └── ui-store.ts — volatile (tab, network, keyboard, search)
├── i18n/                  # fr.json, en.json, ja.json (~320 clés)
├── types/                 # TypeScript types
├── utils/                 # Utilitaires
├── constants/             # Constantes
└── docs/                  # Documentation
```

**Compteurs** :

- ~12 routes/tabs + 7 sous-routes
- ~35 composants (dont 17 chat/)
- ~15 hooks
- ~18 services
- ~320 clés i18n (3 langues : fr, en, ja)
- **51 fichiers de tests** (~25-30% couverture)
- **4 Zustand stores** (notifications, stories, user, ui)
- **~53 500 lignes** de code TS/TSX
- **183 fichiers** TypeScript/TSX

---

## 📝 Notes de Session

### Session en cours — DEV-015 OAuth + DEV-010 Onboarding

**Objectif** : Configurer OAuth Google + Apple Sign-In + Flow d'onboarding post-signup

**Réalisations DEV-015** :

1. ✅ Analyse complète de l'état OAuth existant (SocialLoginButtons.tsx déjà implémenté, 310 lignes)
2. ✅ Identification de 7 problèmes de configuration bloquants
3. ✅ Fix scheme mismatch: `app.json` `"mobile"` → `"imuchat"`
4. ✅ Google Client IDs décommentés et configurés dans `.env` (depuis Firebase imuchat-378ad)
5. ✅ Plugin `expo-apple-authentication` ajouté à `app.json`
6. ✅ REVERSED_CLIENT_ID iOS ajouté comme `CFBundleURLScheme`
7. ✅ SocialLoginButtons ajouté à register.tsx (parité avec login.tsx)
8. ✅ Validation client IDs + debug logs ajoutés à SocialLoginButtons.tsx

**Réalisations DEV-010** :

1. ✅ Créé `app/(onboarding)/_layout.tsx` — Stack layout
2. ✅ Créé `app/(onboarding)/profile-setup.tsx` — 3 étapes (nom/username, avatar, thème)
3. ✅ Navigation 4 états dans `_layout.tsx` : onboarding → auth → profile-setup → tabs
4. ✅ Username validation temps réel avec check unicité Supabase (debounced 500ms)
5. ✅ Avatar picker (camera/galerie) avec upload Supabase Storage
6. ✅ Sélection thème (light/dark/system) avec preview live
7. ✅ ThemeProvider connecté au user-store (persist via Zustand + AsyncStorage)
8. ✅ ThemeProvider supporte `system` mode via `useColorScheme`
9. ✅ Traductions profileSetup ajoutées (fr/en/ja — 20+ clés)
10. ✅ Nettoyage login.tsx (redirection déléguée à `_layout.tsx`)

**Fichiers créés** :

- `app/(onboarding)/_layout.tsx`
- `app/(onboarding)/profile-setup.tsx`

**Fichiers modifiés** :

- `app.json` — scheme, plugins, iOS infoPlist (DEV-015)
- `.env` — Google OAuth Client IDs (DEV-015)
- `components/auth/SocialLoginButtons.tsx` — validation, debug logs (DEV-015)
- `app/(auth)/register.tsx` — ajout SocialLoginButtons (DEV-015)
- `app/_layout.tsx` — 4e état navigation profile-setup (DEV-010)
- `app/(auth)/login.tsx` — nettoyage redirection (DEV-010)
- `providers/ThemeProvider.tsx` — connecté user-store + system mode (DEV-010)
- `i18n/fr.json`, `en.json`, `ja.json` — section profileSetup (DEV-010)

---

### Sessions 22-24 février 2026 — DEV-008 → DEV-017

**Objectif** : Implémenter les features sociales, sécurité, privacy et infrastructure

**Réalisations majeures** :

1. ✅ **DEV-008 Social Feed** — Feed créé avec posts, likes, commentaires, pagination curseur (social-feed.ts 756 lig.)
2. ✅ **DEV-009 Stories** — CRUD complet, viewer, création multi-mode, stories-store Zustand (stories-api.ts 531 lig., stories-store 434 lig.)
3. ✅ **DEV-011 Événements** — CRUD + RSVP + participants + détail (events.ts 783 lig.)
4. ✅ **DEV-012 Groupes** — Rôles, modération, invitations, banning (groups.ts 1088 lig.)
5. ✅ **DEV-013 Sécurité** — MFA TOTP, biométrie Expo, gestion sessions (security.ts 481 lig.)
6. ✅ **DEV-014 Privacy Center** — RGPD : export JSON, blocage, signalements, consentements (privacy-center.ts 683 lig.)
7. ✅ **DEV-016 Logger** — Factory avec scopes, circular buffer (logger.ts 117 lig.)
8. ✅ **DEV-017 Markdown** — Parser custom pour chat (markdown-parser.ts)
9. ✅ **Settings étendu** — 1004 → 1770 lignes avec MFA, biométrie, sessions, RGPD, 6 thèmes
10. ✅ **Profil avancé** — StatusPicker, visibility ENUM, stats profil

---

### Session 27 février 2026 — Audit & Tracker Update

**Objectif** : Analyser l'état complet du développement mobile et mettre à jour le tracker

**Réalisations** :

1. ✅ Audit complet du codebase mobile (~53 500 lignes, 183 fichiers, 51 tests)
2. ✅ Identification de 20+ discordances entre tracker et code réel
3. ✅ Mise à jour de tous les tableaux comparatifs (5 groupes + Auth + Infra)
4. ✅ Mise à jour de la cartographie MVP (CORE + Transversal)
5. ✅ Mise à jour des progress bars roadmap
6. ✅ Mise à jour sprint + backlog
7. ✅ Mise à jour compteurs et structure du projet
8. ✅ Coverage 50-fonctionnalités : 16/50 32% → 18/50 36%

---

### Session du 21 février 2026

**Objectif** : Rattraper le mobile sur les fonctionnalités chat avancé

**Réalisations** :

1. ✅ Configuration `.env` vérifiée (Supabase, Stream, GIPHY, Firebase)
2. ✅ FAB "New Chat" + `NewChatModal` implémenté
3. ✅ Callbacks Edit/Delete/Copy/Reply connectés dans `[id].tsx`
4. ✅ Read receipts avec indicateur `✓✓` implémenté
5. ✅ Traductions ajoutées (fr/en/ja)
6. ✅ Analyse comparative web-app vs mobile
7. ✅ Création MOBILE_TODO_TRACKER.md
8. ✅ Mise à jour Progression_Mobile.md
9. ✅ **Élargissement MVP Phase 2** — intégration des 50 fonctionnalités + écrans complémentaires + roadmap 3D/Live2D

**Fichiers créés** :

- `components/chat/NewChatModal.tsx`
- `MOBILE_TODO_TRACKER.md`

**Fichiers modifiés** :

- `app/(tabs)/chats.tsx` - FAB + modal
- `app/chat/[id].tsx` - Handlers + isMessageRead
- `components/MessageBubble.tsx` - Read receipt UI
- `hooks/useChat.ts` - othersLastReadAt + isMessageRead
- `services/messaging.ts` - getOthersLastReadAt()
- `i18n/*.json` - Nouvelles clés
- `docs/Progression_Mobile.md` - Statuts corrigés

---

## 📚 Documents de Référence

| Document                                  | Contenu                                             |
| ----------------------------------------- | --------------------------------------------------- |
| `docs/50_FONCTIONNALITIES_SCREENS.md`     | 50 fonctionnalités en 10 groupes × 5 + écrans       |
| `docs/FUNCTIONNALITIES_LIST.md`           | Liste plate des 50 fonctionnalités                  |
| `docs/OTHERS_SCREENS.md`                  | ~100 écrans secondaires/structurels (14 catégories) |
| `docs/OTHERS_SCREENS_FONCTIONNALITIES.md` | ~110 fonctionnalités des écrans complémentaires     |
| `docs/3D_AND_Live2D.md`                   | Stratégie intégration 3D/Live2D en 3 phases         |
| `docs/Progression_Mobile.md`              | Progression mobile vs web détaillée par semaine     |
| `WEBAPP_TODO_TRACKER.md`                  | Tracker équivalent côté web-app                     |

---

_Document mis à jour — 27 février 2026 — MVP Phase 2 quasi-terminé (36% des 50 fonctionnalités)_
