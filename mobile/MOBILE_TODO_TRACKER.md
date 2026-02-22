# 📱 Mobile App - Tracker Complet des Tâches (MVP Phase 2 Élargi)

> **Date de création** : 21 février 2026  
> **Dernière mise à jour** : 23 février 2026  
> **Statut global** : En développement actif (MVP Phase 2 Élargi — Communication + Social + Profils)
> **Référence** : Basé sur les 50 fonctionnalités (10 groupes), les ~110 écrans complémentaires, et la roadmap 3D/Live2D

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
9. [🎭 Vision Long Terme — 3D & Live2D](#-vision-long-terme--3d--live2d)
10. [📊 Comparatif Mobile vs Web-App](#-comparatif-mobile-vs-web-app)
11. [🎯 Roadmap & Priorités](#-roadmap--priorités)

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

### CRIT-002 : OAuth Non Implémenté ⚠️

**Priorité** : P1 - Important  
**Impact** : UX d'inscription limitée  
**Statut** : ⚠️ Non démarré

**Problème** :

- Seule l'authentification email/password est disponible
- Google et Apple Sign-In non configurés
- Placeholders ajoutés dans `.env` mais SDK non intégré

**Fichiers concernés** :

- `mobile/.env` (EXPO_PUBLIC_GOOGLE_CLIENT_ID placeholder)
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`

**Solution** :

1. Configurer Google Sign-In via `expo-auth-session`
2. Configurer Apple Sign-In via `expo-apple-authentication`
3. Lier les providers à Supabase Auth

**Estimation** : 2-3 jours

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

- Configuration Jest présente ✅
- 24 fichiers de tests existants
- Couverture estimée ~20%

**Tests à créer** :

- [ ] Hooks d'authentification (`useAuth`, `useAuthV2`)
- [ ] Hooks de messagerie (`useChat`, `useMessages`)
- [ ] Services API (`messaging.ts`, `reactions.ts`)
- [ ] Composants UI core

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

**Stores créés** :

- ✅ `stores/notifications-store.ts` — Badge, push token, liste de notifications (persist AsyncStorage)
- ✅ `stores/ui-store.ts` — Tab active, network status, keyboard, search
- ✅ `stores/user-store.ts` — Profil, préférences (locale, thème, sons), persist AsyncStorage

**Architecture** :

- Zustand v5 avec middleware `persist` + `createJSONStorage(AsyncStorage)`
- `notifications-store` : buffer de 50 notifs, persist des 20 dernières
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
**Statut** : ✅ Implémenté

**Implémentation** :

- ✅ `RefreshControl` sur la liste des conversations (`chats.tsx`) — utilise `refresh` de `useChat`
- ✅ `RefreshControl` sur la liste des messages (`[id].tsx`) — utilise `loadMessages` de `useChat`
- ✅ `RefreshControl` sur les contacts (`contacts.tsx`) — déjà existant avant Phase 2

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

### DEV-008 : Profils Avancés

**Priorité** : P2 - Moyen  
**Réf** : Groupe 3 — Profils & Identité (5 fonctionnalités)  
**Statut** : ⚠️ Partiellement implémenté

**État actuel** :

| Fonctionnalité Groupe 3                 | Statut | Détails                            |
| --------------------------------------- | ------ | ---------------------------------- |
| 1. Profils privés/publics/anonymes      | ⚠️     | Profil basique ✅, modes non gérés |
| 2. Multi-profils (perso/pro/créateur)   | 🔴     | Non démarré                        |
| 3. Avatars 2D/3D personnalisables       | 🔴     | Avatar photo ✅, pas de 2D/3D      |
| 4. Statuts animés (emoji/texte/musique) | 🔴     | Statut texte simple disponible     |
| 5. Vérification identité (badge bleu)   | 🔴     | Non démarré                        |

**Composants existants** :

- ✅ `app/(tabs)/profile.tsx` — écran profil
- ✅ `Avatar.tsx` — composant avatar (photo)
- ✅ Supabase `profiles` table (username, avatar_url, bio)

**À implémenter (Phase 2B)** :

- [ ] Visibilité du profil (public/privé/anonyme) — champ DB + UI settings
- [ ] Statuts enrichis : emoji + texte court + expiration
- [ ] Page profil étendue (badges, stats, bio formatée)

**À implémenter (Phase 3)** :

- [ ] Multi-profils (switch perso/pro/créateur) — nécessite refonte DB
- [ ] Avatars 2D/3D — cf. section Live2D
- [ ] Vérification identité — nécessite KYC backend

**Estimation** : 3-4 jours (Phase 2B)

---

### DEV-009 : Personnalisation Avancée

**Priorité** : P3 - Mineur  
**Réf** : Groupe 4 — Personnalisation avancée (5 fonctionnalités)  
**Statut** : ⚠️ Basique

**État actuel** :

| Fonctionnalité Groupe 4      | Statut | Détails                           |
| ---------------------------- | ------ | --------------------------------- |
| 1. Thèmes visuels            | ⚠️     | Dark/Light ✅, pas de Kawaii/Neon |
| 2. Arrière-plans animés      | 🔴     | Non démarré                       |
| 3. Police personnalisable    | 🔴     | Non démarré                       |
| 4. Packs d'icônes et de sons | 🔴     | Non démarré                       |
| 5. Widget homescreen         | 🔴     | Non démarré                       |

**À implémenter (Phase 2B)** :

- [ ] 4-6 thèmes prédéfinis (Kawaii, Pro, Night, Solar, Neon, Ocean)
- [ ] Sélecteur de thème dans settings avec preview live
- [ ] Persistence du thème choisi (AsyncStorage / Supabase)

**À implémenter (Phase 3)** :

- [ ] Arrière-plans animés (Lottie / Reanimated pour conversations)
- [ ] Choix de police par conversation
- [ ] Packs d'icônes/sons téléchargeables (via Store)
- [ ] Widget homescreen via `expo-widgets` (expérimental)

**Estimation** : 2-3 jours (Phase 2B — thèmes seulement)

---

### DEV-010 : Onboarding Flow

**Priorité** : P2 - Moyen  
**Réf** : Écrans complémentaires — Auth & Sécurité  
**Statut** : ⚠️ UI créée, non connectée

**État actuel** :

- ✅ Dossier `app/(onboarding)/` existe
- ✅ `app/(onboarding)/index.tsx` — écrans de slides
- ❌ Non connecté au flow d'inscription

**À implémenter (Phase 2B)** :

- [ ] Connecter l'onboarding après le premier signup
- [ ] Détection automatique langue & région
- [ ] Sélection thème initial avec preview live
- [ ] Choix de pseudo avec validation temps réel
- [ ] Sauvegarde état onboarding (resume flow via AsyncStorage)
- [ ] Tutoriel interactif (3-5 slides avec tracking de complétion)

**Estimation** : 1-2 jours

---

## 🌐 MVP Phase 2C — Social & Communautés (Groupe 5 + Écrans complémentaires)

> Réf : 50 Fonctionnalités — Groupe 5 (Mini-apps sociales natives)
> Réf : Écrans complémentaires — Gestion avancée communautés/serveurs

### DEV-011 : Stories Réelles

**Priorité** : P1 - Important  
**Réf** : Groupe 5, Fonc. 1 — "Stories 24h (texte, photo, vidéo, glosses kawaii)"  
**Statut** : 🔲 Mock UI

**État actuel** :

- ✅ `app/(tabs)/social.tsx` (452 lignes) — StoryCarousel, StoryGrid, CreateStoryFAB, filtres
- ✅ `app/(tabs)/index.tsx` — Stories carousel sur le Home
- ✅ Settings stories (visibility, allow_replies, auto_archive) dans settings.tsx
- ➡️ **Tout en données MOCK**

**À implémenter** :

- [ ] Table Supabase `stories` (user_id, media_url, type, text, created_at, expires_at)
- [ ] Upload story (photo/vidéo) via Supabase Storage
- [ ] Création story texte avec backgrounds colorés
- [ ] Viewer story plein écran avec progression bar
- [ ] Marquage "vu" (table `story_views`)
- [ ] Suppression automatique après 24h (cron / edge function)
- [ ] Remplacer les MOCK_STORIES par données réelles

**Estimation** : 4-5 jours

---

### DEV-012 : Feed Social / Timeline

**Priorité** : P2 - Moyen  
**Réf** : Groupe 5, Fonc. 2 — "Mur social type timeline"  
**Statut** : 🔲 Mock UI

**État actuel** :

- ✅ `app/(tabs)/social.tsx` — Filtres (Mixte/News/Stories), FlatList
- ✅ `app/(tabs)/index.tsx` — ExplorerGrid, PodcastWidget (mock)
- ➡️ **Tout en données MOCK**

**À implémenter** :

- [ ] Table Supabase `posts` (user_id, content, media_urls, type, likes_count, comments_count)
- [ ] Table `post_likes`, `post_comments`
- [ ] Création de post (texte + media) — écran ou modal
- [ ] Feed avec pagination (infinite scroll)
- [ ] Like / Commentaire / Partage
- [ ] Remplacer les données mock par requêtes Supabase

**Estimation** : 4-5 jours

---

### DEV-013 : Événements

**Priorité** : P3 - Mineur  
**Réf** : Groupe 5, Fonc. 4 — "Événements (invites, inscriptions, rappels)"  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Table Supabase `events` (title, description, date, location, creator_id, max_participants)
- [ ] Table `event_participants` (event_id, user_id, status: invited/going/declined)
- [ ] Écran liste événements
- [ ] Écran détail événement + inscription
- [ ] Création événement (modal ou écran dédié)
- [ ] Rappels push via notifications

**Estimation** : 3-4 jours

---

### DEV-014 : Groupes Avancés / Serveurs

**Priorité** : P2 - Moyen  
**Réf** : Groupe 5, Fonc. 5 + Écrans complémentaires §3 — Communautés/Serveurs  
**Statut** : ⚠️ Groupes basiques existants

**État actuel** :

- ✅ Groupes de chat via `conversation_members` (multi-participants)
- ✅ `NewChatModal` permet de créer des groupes
- ❌ Pas de gestion de rôles, permissions, modération

**À implémenter (Phase 2C)** :

- [ ] Rôles dans les groupes (admin, moderator, member) — champ `role` dans `conversation_members`
- [ ] Permissions admin (kick, ban, mute)
- [ ] Invitations par lien unique
- [ ] Description et règles du groupe
- [ ] Avatar/bannière du groupe

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
**Statut** : 🔴 Non démarré

**À implémenter (Phase 2D)** :

- [ ] Gestion multi-appareils (liste sessions actives via Supabase Auth)
- [ ] Révocation à distance d'un appareil
- [ ] 2FA via TOTP (Google Authenticator)
- [ ] Biométrie locale (FaceID/TouchID) via `expo-local-authentication`

**À implémenter (Phase 3)** :

- [ ] Historique des connexions (IP, device, date)
- [ ] Gestion clés E2EE (génération, rotation)
- [ ] Export journal d'activité sécurisé

**Estimation** : 3-4 jours (Phase 2D)

---

### DEV-017 : Centre de Confidentialité (RGPD)

**Priorité** : P2 - Moyen  
**Réf** : Écrans complémentaires §2 — Confidentialité & Conformité  
**Statut** : ⚠️ Basique

**État actuel** :

- ✅ Settings privacy : show_online, show_last_seen, read_receipts, search_phone (dans settings.tsx)
- ✅ Suppression de compte (écran existant dans settings)
- ❌ Pas de centre RGPD dédié

**À implémenter (Phase 2D)** :

- [ ] Écran Privacy Center centralisé
- [ ] Export complet des données personnelles (JSON/ZIP)
- [ ] Gestion consentements IA (si chatbot IA implémenté)
- [ ] Système de blocage avancé (shadow ban / block total)
- [ ] Système de signalement structuré (utilisateur + contenu)
- [ ] Suivi statut signalements

**Estimation** : 2-3 jours

---

## 🏗️ MVP Phase 3 — Modules, IA, Store, Services (Groupes 6-10)

> Ces fonctionnalités sont planifiées pour **après** MVP Phase 2.
> Référencées ici pour assurer la traçabilité avec les 50 fonctionnalités.

### Groupe 6 — Modules avancés (installables via Store)

| #   | Fonctionnalité     | Statut | Priorité | Notes                           |
| --- | ------------------ | ------ | -------- | ------------------------------- |
| 1   | Productivity Hub   | 🔴     | P3       | Tâches, to-do, planning         |
| 2   | Suite Office       | 🔴     | P4       | Texte, tableur, présentation    |
| 3   | Module PDF         | 🔴     | P3       | Viewer/editor PDF               |
| 4   | Board collaboratif | 🔴     | P4       | Whiteboard, mindmap             |
| 5   | Cooking & Home     | 🔴     | P4       | Courses, ménage, repas, alarmes |

### Groupe 7 — Services utilitaires publics

| #   | Fonctionnalité                       | Statut | Priorité | Notes                  |
| --- | ------------------------------------ | ------ | -------- | ---------------------- |
| 1   | Horaires métro/tram/bus avec alertes | 🔴     | P4       | API transport + géoloc |
| 2   | Info trafic routier temps réel       | 🔴     | P4       | API traffic            |
| 3   | Numéros d'urgence géolocalisés       | 🔴     | P3       | Base locale            |
| 4   | Annuaire services publics            | 🔴     | P4       | CAF, CPAM, etc.        |
| 5   | Suivi colis multi-transporteurs      | 🔴     | P3       | API tracking           |

### Groupe 8 — Divertissement & Création

| #   | Fonctionnalité                   | Statut | Priorité | Notes                    |
| --- | -------------------------------- | ------ | -------- | ------------------------ |
| 1   | Mini-lecteur musique + playlists | 🔴     | P3       | API streaming musique    |
| 2   | Podcasts (catalogue + favoris)   | 🔲     | P3       | Mock UI dans Home        |
| 3   | Lecteur vidéo intégré            | 🔴     | P3       | Qualité adaptative       |
| 4   | Mini-jeux sociaux                | 🔴     | P4       | Quiz, dessin, devinettes |
| 5   | Création stickers & emojis       | 🔴     | P4       | Éditeur intégré          |

### Groupe 9 — IA intégrée

| #   | Fonctionnalité                     | Statut | Priorité | Notes                        |
| --- | ---------------------------------- | ------ | -------- | ---------------------------- |
| 1   | Chatbot multi-personas             | 🔴     | P2       | Assistant Alice planifié     |
| 2   | Suggestions intelligentes réponses | 🔴     | P3       | NLP / LLM                    |
| 3   | Résumé automatisé conversations    | 🔴     | P3       | LLM summarization            |
| 4   | Modération automatique groupes     | 🔴     | P3       | Détection spam / toxicité    |
| 5   | Traduction instantanée chats       | 🔴     | P2       | Google/DeepL API intégration |

### Groupe 10 — App Store & Écosystème

| #   | Fonctionnalité                       | Statut | Priorité | Notes                     |
| --- | ------------------------------------ | ------ | -------- | ------------------------- |
| 1   | Store apps internes/partenaires      | 🔲     | P3       | Mock UI (587 lignes)      |
| 2   | Installation/désinstallation modules | 🔴     | P3       | Module registry           |
| 3   | Permissions par app (granulaire)     | 🔴     | P4       | Sandbox permissions       |
| 4   | Marketplace services                 | 🔴     | P4       | Designers, pros, artisans |
| 5   | Paiement intégré + portefeuille      | 🔴     | P3       | Stripe/Apple/Google Pay   |

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

| Fonctionnalité (50 fonc.)           | Mobile                        | Web-App              | Écart            |
| ----------------------------------- | ----------------------------- | -------------------- | ---------------- |
| 1. Messagerie (texte, emojis, GIFs) | ✅ Supabase Realtime          | ✅ Socket.IO         | Parité           |
| 2. Messages vocaux transcrits       | ⚠️ Vocal ✅, transcription ❌ | ✅                   | **Web > Mobile** |
| 3. Pièces jointes (photos/vidéos)   | ✅ Caméra + galerie           | ✅ Drag & drop       | Parité           |
| 4. Édition/suppression messages     | ✅ Session 21/02              | ✅                   | Parité           |
| 5. Réactions rapides                | ✅ Long-press + count         | ✅ Supabase Realtime | Parité           |

### Groupe 2 — Appels Audio & Vidéo

| Fonctionnalité (50 fonc.)    | Mobile             | Web-App | Écart            |
| ---------------------------- | ------------------ | ------- | ---------------- |
| 1. Appels audio (1:1/groupe) | ⚠️ UI ✅, Token ❌ | ✅      | **Web > Mobile** |
| 2. Appels vidéo HD           | ⚠️ UI ✅, Token ❌ | ✅      | **Web > Mobile** |
| 3. Mini-fenêtre PiP          | 🔴                 | ❌      | Aucun            |
| 4. Partage d'écran           | 🔴                 | ✅      | **Web > Mobile** |
| 5. Filtre beauté IA + flou   | 🔴                 | ❌      | Aucun            |

### Groupe 3 — Profils & Identité

| Fonctionnalité (50 fonc.)          | Mobile               | Web-App              | Écart  |
| ---------------------------------- | -------------------- | -------------------- | ------ |
| 1. Profils privés/publics/anonymes | ⚠️ Basique           | ⚠️ Basique           | Parité |
| 2. Multi-profils                   | 🔴                   | 🔴                   | Aucun  |
| 3. Avatars 2D/3D                   | 🔴 (photo seulement) | 🔴 (photo seulement) | Aucun  |
| 4. Statuts animés                  | 🔴                   | 🔴                   | Aucun  |
| 5. Vérification identité           | 🔴                   | 🔴                   | Aucun  |

### Groupe 4 — Personnalisation

| Fonctionnalité (50 fonc.)  | Mobile        | Web-App               | Écart            |
| -------------------------- | ------------- | --------------------- | ---------------- |
| 1. Thèmes visuels          | ⚠️ Dark/Light | ✅ 8 thèmes + density | **Web > Mobile** |
| 2. Arrière-plans animés    | 🔴            | 🔴                    | Aucun            |
| 3. Police par conversation | 🔴            | 🔴                    | Aucun            |
| 4. Packs d'icônes/sons     | 🔴            | 🔴                    | Aucun            |
| 5. Widget homescreen       | 🔴            | N/A                   | Mobile-only      |

### Groupe 5 — Mini-apps Sociales

| Fonctionnalité (50 fonc.) | Mobile                            | Web-App             | Écart         |
| ------------------------- | --------------------------------- | ------------------- | ------------- |
| 1. Stories 24h            | 🔲 Mock UI (social.tsx, 452 lig.) | ⚠️ Fallback mock    | Parité (mock) |
| 2. Mur social / timeline  | 🔲 Mock UI (social.tsx)           | ⚠️ Fallback mock    | Parité (mock) |
| 3. Mini-blogs             | 🔴                                | 🔴                  | Aucun         |
| 4. Événements             | 🔴                                | 🔴                  | Aucun         |
| 5. Groupes avancés        | ⚠️ Groupes basiques               | ⚠️ Groupes basiques | Parité        |

### Auth, Sécurité & Confidentialité (Écrans complémentaires)

| Fonctionnalité               | Mobile                      | Web-App    | Écart            |
| ---------------------------- | --------------------------- | ---------- | ---------------- |
| OAuth (Google/Apple/Discord) | ❌                          | ✅         | **Web > Mobile** |
| OTP téléphone                | ❌                          | ❌         | Aucun            |
| 2FA / TOTP                   | ❌                          | ❌         | Aucun            |
| Biométrie (FaceID/TouchID)   | ❌                          | N/A        | Mobile-only      |
| Gestion multi-appareils      | ❌                          | ❌         | Aucun            |
| Centre RGPD / Privacy Center | ⚠️ Settings privacy basique | ⚠️ Basique | Parité           |
| Export données personnelles  | ❌                          | ❌         | Aucun            |
| Blocage/Signalement          | ❌                          | ❌         | Aucun            |

### Infrastructure

| Feature            | Mobile          | Web-App       | Écart            |
| ------------------ | --------------- | ------------- | ---------------- |
| Offline queue      | ✅ AsyncStorage | ✅ IndexedDB  | Parité           |
| Logger unifié      | ❌              | ✅            | **Web > Mobile** |
| Push notifications | ✅ Expo         | ✅ FCM        | Parité           |
| i18n               | ✅ ~320 clés    | ✅ ~2300 clés | **Web > Mobile** |
| Zustand stores     | ❌              | ✅            | **Web > Mobile** |
| Tests              | ⚠️ ~20%         | ⚠️ ~7%        | Mobile > Web     |
| Onboarding         | ⚠️ UI créée     | ❌            | **Mobile > Web** |
| Swipe actions      | ✅              | N/A           | **Mobile > Web** |
| Read receipts      | ✅              | ⚠️            | **Mobile > Web** |

---

## 🎯 Roadmap & Priorités

### Vue d'ensemble des phases

```
Phase 2A (Communication)  ████████████░░░  ~75% fait
Phase 2B (Profils)         ██░░░░░░░░░░░░  ~15%
Phase 2C (Social)          █░░░░░░░░░░░░░  ~10% (mock UI)
Phase 2D (Auth/Sécurité)   █░░░░░░░░░░░░░  ~10%
Phase 3  (Modules/IA)      ░░░░░░░░░░░░░░  ~0%
```

### Sprint actuel — Phase 2A (fin Communication)

| #   | Tâche                    | Réf      | Priorité | Statut | Estimation |
| --- | ------------------------ | -------- | -------- | ------ | ---------- |
| 1   | ~~FAB New Chat~~         | DEV-001  | P0       | ✅     | -          |
| 2   | ~~Edit/Delete messages~~ | DEV-001  | P0       | ✅     | -          |
| 3   | ~~Read receipts~~        | DEV-001  | P0       | ✅     | -          |
| 4   | Stream Video token fix   | CRIT-001 | P0       | ⚠️     | 2-3 jours  |
| 5   | Pull-to-refresh          | DEV-004  | P2       | 🔴     | 2-4 heures |
| 6   | Search globale           | DEV-005  | P2       | 🔴     | 2-3 jours  |

### Sprint suivant — Phase 2B + 2D (Profils + Auth)

| #   | Tâche                        | Réf     | Priorité | Statut | Estimation     |
| --- | ---------------------------- | ------- | -------- | ------ | -------------- |
| 7   | OAuth Google/Apple           | DEV-015 | P1       | ✅     | ✅ Mobile done |
| 8   | Onboarding flow complet      | DEV-010 | P2       | 🔴     | 1-2 jours      |
| 9   | Profils avancés (visibilité) | DEV-008 | P2       | 🔴     | 3-4 jours      |
| 10  | Thèmes étendus (4-6)         | DEV-009 | P3       | 🔴     | 2-3 jours      |
| 11  | Sécurité avancée (2FA/bio)   | DEV-016 | P2       | 🔴     | 3-4 jours      |
| 12  | Centre RGPD                  | DEV-017 | P2       | 🔴     | 2-3 jours      |

### Sprint 3 — Phase 2C (Social réel)

| #   | Tâche                   | Réf     | Priorité | Statut | Estimation |
| --- | ----------------------- | ------- | -------- | ------ | ---------- |
| 13  | Stories réelles         | DEV-011 | P1       | 🔴     | 4-5 jours  |
| 14  | Feed social / timeline  | DEV-012 | P2       | 🔴     | 4-5 jours  |
| 15  | Groupes avancés (rôles) | DEV-014 | P2       | 🔴     | 3-5 jours  |
| 16  | Événements              | DEV-013 | P3       | 🔴     | 3-4 jours  |

### Backlog infrastructure

| #   | Tâche                      | Priorité | Estimation |
| --- | -------------------------- | -------- | ---------- |
| 17  | Logger unifié              | P2       | 1 jour     |
| 18  | Zustand stores             | P2       | 2-3 jours  |
| 19  | Tests unitaires (+30%)     | P1       | 1 semaine  |
| 20  | i18n extension (~500 clés) | P3       | 2-3 jours  |
| 21  | Messages vocaux transcrits | P2       | 2-3 jours  |
| 22  | Rich text/Markdown         | P3       | 1-2 jours  |
| 23  | CallKit/ConnectionService  | P2       | 1 semaine  |

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

| Groupe    | Nom                        | Phase | Fonc. couvertes | Progression |
| --------- | -------------------------- | ----- | --------------- | ----------- |
| 1         | Messagerie & Communication | 2A    | 4/5 ✅          | 80%         |
| 2         | Appels Audio & Vidéo       | 2A    | 2/5 ⚠️          | 40%         |
| 3         | Profils & Identité         | 2B    | 1/5 ⚠️          | 20%         |
| 4         | Personnalisation avancée   | 2B    | 1/5 ⚠️          | 20%         |
| 5         | Mini-apps sociales natives | 2C    | 0/5 🔲          | 0% (mock)   |
| 6         | Modules avancés            | 3     | 0/5 🔴          | 0%          |
| 7         | Services utilitaires       | 3     | 0/5 🔴          | 0%          |
| 8         | Divertissement & Création  | 3     | 0/5 🔴          | 0%          |
| 9         | IA intégrée                | 3     | 0/5 🔴          | 0%          |
| 10        | App Store & Écosystème     | 3     | 0/5 🔲          | 0% (mock)   |
| **Total** |                            |       | **8/50**        | **16%**     |

---

## 📁 Structure du Projet

```
mobile/
├── app/                    # Routes expo-router
│   ├── (auth)/            # Login, Register, Forgot-password
│   ├── (onboarding)/      # Onboarding (UI créée, non connecté)
│   ├── (tabs)/            # 10 tabs principales
│   │   ├── index.tsx      # Home (683 lig.) — Hero, Stories, Friends, Explorer
│   │   ├── chats.tsx      # Conversations list + FAB
│   │   ├── calls.tsx      # Historique appels
│   │   ├── contacts.tsx   # Contacts
│   │   ├── social.tsx     # Feed social (452 lig.) — Stories, Feed, Filtres [MOCK]
│   │   ├── store.tsx      # Store apps (587 lig.) — Tabs, Search, Purchase [MOCK]
│   │   ├── watch.tsx      # Watch parties [MOCK]
│   │   ├── notifications.tsx
│   │   ├── settings.tsx   # Settings (1004 lig.) — Complet
│   │   └── profile.tsx    # Profil utilisateur
│   ├── call/              # Écrans appels in-call
│   ├── chat/              # Chat room [id].tsx
│   └── search.tsx         # Recherche (vide)
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
├── hooks/                 # 14 custom hooks
│   ├── useAuth.ts / useAuthV2.ts
│   ├── useChat.ts / useReactions.ts / useTypingIndicator.ts
│   ├── useCallManager.ts / useCallsSafe.ts / useCallHistory.ts
│   ├── useMediaUpload.ts / useVoiceRecording.ts
│   ├── useNetworkState.ts / useNotifications.ts
│   └── ...
├── services/              # 16 services API
│   ├── messaging.ts       # CRUD messages + conversations + read receipts
│   ├── reactions.ts / media-upload.ts / voice-recording.ts
│   ├── offline-queue.ts   # AsyncStorage queue
│   ├── notifications.ts / notification-api.ts
│   ├── stream-video.ts / stream-video-safe.ts / stream-token.ts
│   ├── call-signaling.ts / calls.ts / calls-safe.ts
│   ├── supabase.ts / platform.ts / media-api.ts
│   └── ...
├── providers/             # Context providers (Auth, Theme, I18n)
├── stores/                # Zustand (VIDE — à créer)
├── i18n/                  # fr.json, en.json, ja.json (~320 clés)
├── types/                 # TypeScript types
├── utils/                 # Utilitaires
├── constants/             # Constantes
└── docs/                  # Documentation
```

**Compteurs** :

- ~10 routes/tabs
- ~30 composants
- ~14 hooks
- ~16 services
- ~320 clés i18n (3 langues)
- ~24 fichiers de tests
- 0 Zustand stores

---

## 📝 Notes de Session

### Session en cours — DEV-015 OAuth Google/Apple

**Objectif** : Configurer OAuth Google + Apple Sign-In

**Réalisations** :

1. ✅ Analyse complète de l'état OAuth existant (SocialLoginButtons.tsx déjà implémenté, 310 lignes)
2. ✅ Identification de 7 problèmes de configuration bloquants
3. ✅ Fix scheme mismatch: `app.json` `"mobile"` → `"imuchat"`
4. ✅ Google Client IDs décommentés et configurés dans `.env` (depuis Firebase imuchat-378ad)
5. ✅ Plugin `expo-apple-authentication` ajouté à `app.json`
6. ✅ REVERSED_CLIENT_ID iOS ajouté comme `CFBundleURLScheme`
7. ✅ SocialLoginButtons ajouté à register.tsx (parité avec login.tsx)
8. ✅ Validation client IDs + debug logs ajoutés à SocialLoginButtons.tsx

**Fichiers modifiés** :

- `app.json` — scheme, plugins, iOS infoPlist
- `.env` — Google OAuth Client IDs (web, iOS, Android)
- `components/auth/SocialLoginButtons.tsx` — validation, debug logs
- `app/(auth)/register.tsx` — import + ajout SocialLoginButtons

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

_Document mis à jour — 21 février 2026 — MVP Phase 2 Élargi_
