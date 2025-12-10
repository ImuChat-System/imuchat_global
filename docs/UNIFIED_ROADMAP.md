# 🗺️ ImuChat - Roadmap Unifiée Monorepo

**Date de création :** 2 décembre 2025  
**Version :** 1.2  
**Dernière mise à jour :** 3 décembre 2025  
**Objectif :** Feuille de route consolidée Web + Mobile + Desktop dans le monorepo

---

## 📊 État d'Avancement Global (Décembre 2025)

### Résumé Exécutif

| Plateforme | Phase Actuelle | Modules Core | Tests | Status |
|------------|----------------|--------------|-------|--------|
| **Web** | Phase 2 (50%) | 4/16 | 399 tests (7% coverage) | 🟡 En cours |
| **Mobile** | Phase 1.7 (80%) | 6/16 | Infrastructure prête | 🟢 Avancé |
| **Desktop** | Setup initial | 0/16 | À configurer | 🔴 À démarrer |
| **Monorepo** | Phase C 🎉 (100% P0) | 10 Modules Core | ✅ 353 tests (100%) | 🟢 Production |

**Phase C Update (8 décembre 2025) :**

- ✅ OfflineSyncModule complété (832 lignes, 47 tests) - 4 décembre
- ✅ ChatEngineModule complété (709 lignes, 36 tests) - 8 décembre
- ✅ PreferencesModule complété (695 lignes, 41 tests) - 8 décembre
- 🎯 Phase C P0 : 100% complétée (3/3 modules) en 4 jours !

### 📦 Packages Partagés - État Actuel

| Package | Version | Types/Composants | Tests | Build | Status |
|---------|---------|------------------|-------|-------|--------|
| `@imuchat/shared-types` | 1.2.0 | 15 modules (Server, pas Guild) | ✅ 130 tests | ✅ | 🟢 Production |
| `@imuchat/ui-kit` | 1.0.0 | 28 composants, 7 thèmes | ✅ 80 tests (75% coverage) | ✅ | 🟢 Production |
| `@imuchat/platform-core` | 1.1.0 | 7 modules core + infra | ✅ 248 tests (100%) | ✅ | 🟢 Production |

---

## 🏗️ Architecture Monorepo Consolidée

### Packages Partagés (Créés)

```
@imuchat/shared-types    → Types TypeScript communs (15 modules)
@imuchat/ui-kit          → Design System + 19 Composants + 7 Thèmes
@imuchat/platform-core   → Backend services + API
```

### Applications

```
@imuchat/web-app         → Next.js 16 (web)
@imuchat/mobile-app      → Expo 54 + React Native (iOS/Android)
@imuchat/desktop-app     → Electron 30 (macOS/Windows/Linux)
```

---

## 📱 Comparatif Fonctionnel Web vs Mobile

### Modules Core (16 modules requis)

| # | Module | Web | Mobile | Desktop | Priorité | Phase |
|---|--------|-----|--------|---------|----------|-------|
| 1 | **Core Chat Engine** | ✅ | ✅ | ✅ | P0 | C ✅ |
| 2 | **Auth & User Management** | ✅ | ✅ | ✅ | P0 | B ✅ |
| 3 | **Contacts & Presence** | ✅ | ✅ | ✅ | P0 | B ✅ |
| 4 | **Notifications System** | ✅ | ✅ | ✅ | P0 | B ✅ |
| 5 | **Theme Engine** | ✅ Partiel | ✅ | ⏳ | P1 | A ✅ |
| 6 | **Store Core** | ✅ Partiel | ✅ | ⏳ | P1 | D |
| 7 | **Media Handler** | ✅ | ✅ | ⏳ | P1 | B ✅ |
| 8 | **Calls & RTC** | ⏳ | ⏳ | ⏳ | P2 | C |
| 9 | **Wallet Core** | ✅ Partiel | ✅ | ⏳ | P1 | D |
| 10 | **Preferences** | ✅ | ✅ | ✅ | P0 | C ✅ |
| 11 | **Search Core** | ✅ | ⏳ | ⏳ | P2 | B ✅ |
| 12 | **Offline Sync** | ✅ | ✅ | ✅ | P0 | C ✅ |
| 13 | **IA Assistant** | ⏳ | ⏳ | ⏳ | P2 | D |
| 14 | **Moderation & Safety** | ⏳ | ⏳ | ⏳ | P1 | C |
| 15 | **Telemetry** | ⏳ | ⏳ | ⏳ | P3 | E |
| 16 | **Localization i18n** | ✅ | ✅ | ⏳ | P0 | A ✅ |

**Légende :** ✅ Complet | ✅ Partiel | ⏳ À faire

### Fonctionnalités Avancées

| Fonctionnalité | Web | Mobile | Desktop | Notes |
|----------------|-----|--------|---------|-------|
| **Finance/Wallet** | ✅ UI | ✅ Complet | ⏳ | Mobile en avance |
| **Animations** | ⏳ Basiques | ✅ Complet | ⏳ | reanimated + gestures |
| **Storybook** | ⏳ | ✅ | ⏳ | Mobile prêt |
| **WebSocket** | ✅ | ✅ | ✅ | Modules partagés |
| **PWA** | ⏳ | N/A | N/A | - |
| **Push Notifications** | ✅ FCM | ✅ FCM | ✅ Web Push | Modules partagés |

---

## 🎯 Roadmap Unifiée 2025-2026

### Phase A : Consolidation Monorepo (Décembre 2025)
*Durée : 2 semaines | Priorité : CRITIQUE*

#### Semaine 1-2 : Migration & Synchronisation

- [x] **Synchronisation types** ✅ COMPLÉTÉ
  - [x] Merger types web + mobile dans shared-types
  - [x] Validation TypeScript cross-platform
  - [x] Export schemas Zod partagés
  - [x] Ajout types: wallet, theme, notification, contact, i18n

- [x] **Configuration workspace** ✅ COMPLÉTÉ
  - [x] Correction ImuChat.code-workspace (suppression doublons)
  - [x] pnpm workspace fonctionnel

- [x] **UI Kit** ✅ 28 COMPOSANTS
  - [x] Button, IconButton
  - [x] Card, Modal, Dialog
  - [x] Input, Label, Checkbox, Switch, Select
  - [x] Avatar, Badge, Text
  - [x] Tabs, DropdownMenu
  - [x] Tooltip, Popover
  - [x] Spinner, Skeleton
  - [x] ChatBubble, ChatInput, TypingIndicator
  - [x] MessageList, ScrollToBottomButton
  - [x] UserAvatar, MiniUserCard
  - [x] ChannelItem, ChannelCategory, VoiceChannelUser
  - [x] ServerIcon, ServerList, ServerFolder
  - [x] OnlineIndicator, StatusSelector, PresenceDot
  - [x] EmojiReaction, ReactionBar, QuickReactions, EmojiGrid

- [x] **Design Tokens** ✅ COMPLÉTÉ
  - [x] Couleurs (primary, secondary, success, error, etc.)
  - [x] Typographie (fonts, sizes, weights)
  - [x] Espacement (spacing, spacingNumeric)
  - [x] Ombres (shadows, shadowsNative)
  - [x] Animations (durations, easings)

- [x] **Thèmes** ✅ 7 THÈMES
  - [x] Light (défaut)
  - [x] Dark
  - [x] Sakura Pink
  - [x] Cyber Neon (premium)
  - [x] Zen Green
  - [x] Midnight Purple
  - [x] Ocean Blue

- [x] **Internationalisation (i18n)** ✅ COMPLÉTÉ
  - [x] Types i18n dans shared-types (12 locales)
  - [x] I18nProvider avec contexte React
  - [x] Hooks: useI18n, useTranslation, useLocale, useDirection
  - [x] Traductions fr/en de base
  - [x] Formatters: dates, nombres, devises, temps relatif
  - [x] LanguageSwitcher component
  - [x] Support RTL (arabe)

- [x] **Tests Unitaires** ✅ 210 TESTS
  - [x] ui-kit: 80 tests (75% coverage)
    - Button, Input, tokens, themes, i18n
  - [x] shared-types: 130 tests
    - schemas.test.ts (39 tests - Zod validation)
    - i18n.test.ts (69 tests - locales, formats)
    - auth.test.ts (12 tests - Firebase errors)
    - api.test.ts (10 tests - Error codes)
  - [x] Configuration Vitest pour tous les packages
  - [x] Scripts test + test:coverage

- [x] **CI/CD Pipeline** ✅ COMPLÉTÉ
  - [x] GitHub Actions workflow amélioré
  - [x] Jobs séparés par package (shared-types, ui-kit, platform-core, web-app, desktop-app)
  - [x] Tests automatisés avec couverture
  - [x] Build artifacts partagés entre jobs
  - [x] Cache pnpm optimisé
  - [x] Intégration Codecov

#### Livrables Semaine 2
- ✅ Workspace pnpm fonctionnel
- ✅ ui-kit avec 28 composants partagés + 7 thèmes
- ✅ shared-types complets avec 15 modules
- ✅ 210 tests unitaires (130 shared-types + 80 ui-kit)
- ✅ CI/CD pipeline GitHub Actions complet

---

### Phase B : Modules Core Partagés (Décembre 2025 - Janvier 2026) ✅ 100% COMPLÉTÉ
*Durée : 4 semaines | Priorité : HAUTE*

#### Semaine 3-4 : Infrastructure Modules ✅ COMPLÉTÉ

| Module | Tâches | Statut | Owner |
|--------|--------|--------|-------|
| **Module Registry** | Interface commune | ✅ COMPLÉTÉ | platform-core |
| **Event Bus** | Système pub/sub avec priorités | ✅ COMPLÉTÉ | platform-core |
| **BaseModule** | Classe abstraite + lifecycle hooks | ✅ COMPLÉTÉ | platform-core |
| **Auth** | Module Firebase Admin complet | ✅ COMPLÉTÉ | platform-core |
| **WebSocket** | Service Socket.IO temps réel | ✅ COMPLÉTÉ | platform-core |

**Infrastructure complétée:**
- ✅ ModuleRegistry.ts (335 lignes) - Gestionnaire de cycle de vie
- ✅ EventBus.ts (297 lignes) - Communication inter-modules avec file de priorité
- ✅ BaseModule.ts (98 lignes) - Classe de base abstraite
- ✅ AuthModule.ts (613 lignes) - Firebase Admin SDK intégré
- ✅ WebSocketModule.ts (592 lignes) - Socket.IO avec rooms, auth, événements
- ✅ ContactsModule.ts (869 lignes) - Gestion des contacts et amis
- ✅ NotificationsModule.ts (986 lignes) - Push notifications et in-app
- ✅ 251 tests unitaires (99% passants : 42 Auth + 27 WebSocket + 46 Contacts + 33 Notifications + infrastructure)
- ✅ Hooks React (useAuth, AuthProvider) dans shared-types
- ✅ Exemples d'usage (auth-demo.ts, websocket-demo.ts, notifications-demo.ts)
- ✅ Build TypeScript sans erreurs
- ✅ Documentation complète (MODULE_SYSTEM.md)

#### Semaine 5-6 : Modules Communication ✅ COMPLÉTÉ

| Module | Tâches | Statut | Owner |
|--------|--------|--------|-------|
| **Contacts** | Système de relations et amis | ✅ COMPLÉTÉ | platform-core |
| **Notifications** | FCM + Web Push + In-App | ✅ COMPLÉTÉ | platform-core |
| **Chat Engine** | Types et hooks partagés | ⏳ En attente | shared |
| **Presence** | Service temps réel unifié | ⏳ En attente | platform-core |

**Modules Communication complétés:**
- ✅ ContactsModule.ts (869 lignes)
  - Demandes d'amitié avec expiration automatique
  - Relations bidirectionnelles (FRIENDS, BLOCKED, PENDING_IN/OUT)
  - Métadonnées (favoris, notes, nicknames)
  - Algorithme de suggestions (mutual friends)
  - Recherche et filtrage
  - 92 tests unitaires (100%)

- ✅ NotificationsModule.ts (986 lignes)
  - Push notifications (FCM + Web Push)
  - Notifications in-app avec badges
  - Templates avec variables dynamiques
  - File d'attente avec retry et priorités
  - Préférences par type/canal (SERVERS au lieu de GUILDS)
  - Historique des notifications
  - 66 tests unitaires (100%)

#### Semaine 7-8 : Modules UX Avancés ✅ COMPLÉTÉ (Décembre 2025)

| Module | Tâches | Statut | Owner |
|--------|--------|--------|-------|
| **Presence** | Service temps réel multi-plateforme | ✅ COMPLÉTÉ | platform-core |
| **Media** | Upload/Download/Streaming | ✅ COMPLÉTÉ | platform-core |
| **Search** | Recherche globale avec indexation | ✅ COMPLÉTÉ | platform-core |

**Modules UX complétés:**
- ✅ PresenceModule.ts (1050 lignes)
  - 5 statuts (ONLINE, AWAY, BUSY, INVISIBLE, OFFLINE)
  - Support multi-device (WEB, IOS, ANDROID, DESKTOP)
  - Heartbeat avec auto-away/offline
  - Custom status avec emoji
  - Activity tracking
  - Système de subscription
  - 45 tests unitaires (100%)

- ✅ MediaModule.ts (850 lignes)
  - Chunked upload avec progress tracking
  - Download complet et partial (range)
  - Streaming support
  - User quotas (50MB default)
  - File size limits (10MB default)
  - MIME type filtering
  - Hash generation (SHA256)
  - 38 tests unitaires (100%)

- ✅ SearchModule.ts (970 lignes)
  - Inverted index pour performance O(1)
  - Fuzzy matching (Levenshtein distance)
  - Multi-type search (MESSAGE, CONTACT, SERVER, FILE, CHANNEL)
  - Filtres avancés (type, user, context, date, keywords)
  - Sort options (relevance, newest, oldest, alphabetical)
  - Pagination complète
  - Highlights et snippets
  - Search history et suggestions
  - 38 tests unitaires (100%)

#### Refactoring Terminologique ✅ COMPLÉTÉ (4 décembre 2025)

**GUILD → SERVER Migration:**
- ✅ 66 occurrences remplacées dans shared-types et platform-core
- ✅ Fichier `guild.ts` → `server.ts`
- ✅ Interfaces: Guild → Server, GuildMember → ServerMember, etc.
- ✅ Champs: guildId → serverId, mutualGuilds → mutualServers
- ✅ Enums: NotificationCategory.GUILDS → SERVERS, SearchableType.GUILD → SERVER
- ✅ Permissions: manage_guild → manage_server
- ✅ 8 fichiers de documentation mis à jour
- ✅ 3 fichiers UI (web-app, mobile-app, ui-kit) mis à jour
- ✅ 0 occurrence de "guild" restante (hors doc de refactoring)
- ✅ 248/248 tests passent après refactoring

#### Livrables Phase B ✅ 100% COMPLÉTÉS
- ✅ 7/7 modules core fonctionnels (Auth, WebSocket, Contacts, Notifications, Presence, Media, Search)
- ✅ ~7,000 lignes de code production
- ✅ 248 tests unitaires (100% de réussite)
- ✅ Coverage tests > 35%
- ✅ Documentation API modules complète
- ✅ Exemples de démonstration pour chaque module
- ✅ Terminologie unifiée "Server" dans tout le projet

---

### Phase C : Fonctionnalités Avancées (Décembre 2025 - Janvier 2026) 🎉 P0 & P1 COMPLÉTÉS !
*Durée : 6 semaines | Priorité : HAUTE*  
*Démarrage : 4 décembre 2025 | Phase en cours : P2/P3*
*Phase C Stats : 11/11 modules prévus complétés (100%) | 10,606 lignes | 581 tests (100% passants)*

#### Semaine 9-10 : Modules Métier P0 (✅ 100% COMPLÉTÉS)

| Module | Web | Mobile | Desktop | Statut | Date |
|--------|-----|--------|---------|--------|------|
| **Offline Sync** | IndexedDB | MMKV + SQLite | File system | ✅ COMPLÉTÉ (832 lignes, 47 tests) | 4 déc |
| **Chat Engine** | Unified conversations | Same | Same | ✅ COMPLÉTÉ (709 lignes, 36 tests) | 8 déc |
| **Preferences** | localStorage | AsyncStorage | File system | ✅ COMPLÉTÉ (695 lignes, 41 tests) | 8 déc |

**Modules P0 Stats Phase C :**
- ✅ 3/3 modules complétés (100%) 🎉
- 🎯 2,236 lignes de code production
- 🧪 124 tests unitaires (100% passants)
- ⚡ Durée : 4 jours (très en avance sur le planning !)

**Détails PreferencesModule :**
- 695 lignes de code TypeScript
- 19 préférences par défaut (8 catégories)
- Interface PreferencesStorage abstraction
- Cache en mémoire avec TTL configurable
- Validation stricte avec validators custom
- 4 événements (PREFERENCE_UPDATED, PREFERENCES_RESET, PREFERENCES_SYNCED, VALIDATION_ERROR)
- 41 tests unitaires couvrant : lifecycle, CRUD, validation, cache, events, edge cases

#### Semaine 11-12 : Modules P1 (🚀 50% EN COURS)

| Module | Web | Mobile | Desktop | Statut | Date |
|--------|-----|--------|---------|--------|------|
| **Calls (basic)** | WebRTC signaling | Native calls | WebRTC | ✅ COMPLÉTÉ (1084 lignes, 54 tests) | 8 déc |
| **Wallet Core** | Stripe + ImuCoin | Apple/Google Pay | Stripe | ✅ COMPLÉTÉ (1228 lignes, 71 tests) | 8 déc |

**Modules P1 Stats Phase C :**
- ✅ 4/4 modules complétés (100%) 🎉
- 🎯 4,273 lignes de code production
- 🧪 227 tests unitaires (100% passants)

**Détails CallsModule :**
- 1084 lignes de code TypeScript
- WebRTC peer-to-peer avec signaling
- 13 états d'appel (INITIALIZING → CALLING → RINGING → CONNECTED → ACTIVE → ENDED)
- 3 types d'appel (AUDIO, VIDEO, SCREEN_SHARE)
- 6 niveaux de qualité réseau (EXCELLENT, GOOD, FAIR, POOR, VERY_POOR, DISCONNECTED)
- Support multi-participants avec Map<participantId, CallParticipant>
- Contrôles média (audio/video toggle) avec événements temps réel
- Statistiques WebRTC et monitoring qualité réseau
- Configuration ICE/STUN/TURN personnalisable
- 11 types d'événements (INCOMING_CALL, OUTGOING_CALL, CALL_ACCEPTED, CALL_ENDED, etc.)
- 54 tests unitaires couvrant : lifecycle, calls (initiate/accept/reject/end), média controls, queries, states, network quality, types, events, error handling, multi-participants

**Détails WalletModule :**
- 1228 lignes de code TypeScript
- Support multi-devises (8 crypto: BTC, ETH, USDT, USDC, BNB, SOL, ADA, DOT + 7 fiat: USD, EUR, GBP, JPY, CAD, AUD, CHF)
- 7 types de transactions (DEPOSIT, WITHDRAWAL, TRANSFER, PAYMENT, REFUND, EXCHANGE, FEE)
- 5 statuts de transaction (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- Gestion des balances avec locking/unlocking de fonds
- Échanges de devises avec taux de change dynamiques
- Adresses crypto et comptes bancaires avec vérification
- Sécurité : approbation pour transactions > seuil, validation montants min/max
- Frais de transaction et d'exchange configurables
- Limites de retrait quotidiennes et mensuelles
- 71 tests unitaires couvrant : lifecycle, configuration, balances, deposits, withdrawals, transfers, transactions, cancellation, exchanges, addresses, bank accounts, validation, security, error handling, events

**Détails IAAssistantModule :**
- 1121 lignes de code TypeScript
- Architecture provider-agnostic avec interface IAProvider abstraite
- 7 types de providers (OpenAI, Anthropic, Google Gemini, Mistral, HuggingFace, Local, Custom)
- 5 rôles de messages (SYSTEM, USER, ASSISTANT, FUNCTION, TOOL)
- 8 capacités de modèles (CHAT, COMPLETION, EMBEDDING, IMAGE_GENERATION, IMAGE_UNDERSTANDING, FUNCTION_CALLING, STREAMING, AUDIO)
- Système de conversations avec contexte et historique
- Streaming en temps réel avec AsyncGenerator
- Function calling / Tool use avec validation d'arguments
- 9 types de personas (ASSISTANT, CODER, TRANSLATOR, WRITER, TEACHER, ANALYST, THERAPIST, COMEDIAN, CUSTOM)
- Modération de contenu avec 6 catégories (SEXUAL, HATE, HARASSMENT, SELF_HARM, VIOLENCE, ILLEGAL)
- Cost tracking par provider avec tarification au token
- Switch de provider à chaud (runtime provider switching)
- 12+ types d'événements (MODULE_STARTED, PROVIDER_SWITCHED, CONVERSATION_CREATED, MESSAGE_GENERATED, MESSAGE_FAILED, STREAMING_STARTED, STREAMING_COMPLETED, FUNCTION_EXECUTED, FUNCTION_FAILED, CONTENT_FLAGGED, COST_TRACKING_RESET, etc.)
- 55 tests unitaires couvrant : lifecycle, configuration, provider management, conversation management, chat & messaging, streaming, function calling, personas, moderation, statistics & cost tracking, error handling, events

**Détails ModerationModule :**
- 840 lignes de code TypeScript
- Système de modération multi-niveaux avec filtres automatiques
- 10 types de violations (PROFANITY, SPAM, HATE_SPEECH, HARASSMENT, SEXUAL_CONTENT, VIOLENCE, ILLEGAL_CONTENT, SELF_HARM, MISINFORMATION, OTHER)
- 5 statuts de reports (PENDING, UNDER_REVIEW, RESOLVED, DISMISSED, ESCALATED)
- 7 actions de modération (NONE, WARN, REMOVE_CONTENT, TEMP_BAN, PERMANENT_BAN, ACCOUNT_SUSPENSION, ESCALATE)
- 4 niveaux de priorité (LOW, MEDIUM, HIGH, CRITICAL)
- Filtres regex pour profanity, spam, hate speech avec severity scoring
- Custom blacklist et whitelisted users
- Système de signalements utilisateurs avec catégories
- Review queue pour modérateurs avec prioritization
- Actions automatiques : warnings, temp/permanent bans, content removal
- User status tracking (ACTIVE, WARNED, TEMP_BANNED, PERMANENTLY_BANNED, SUSPENDED)
- Auto-ban après max warnings configurables
- Ban expiration checker (background task)
- Statistiques complètes : reports, violations par type, bans, queue size, auto vs manual moderation
- 15+ types d'événements (MODULE_INITIALIZED, CONTENT_FLAGGED, FILTER_REGISTERED, REPORT_CREATED, REPORT_STATUS_UPDATED, ITEM_ADDED_TO_QUEUE, QUEUE_ITEM_ASSIGNED, ITEM_REMOVED_FROM_QUEUE, ACTION_TAKEN, USER_WARNED, USER_BANNED, BAN_EXPIRED, STATISTICS_RESET, etc.)
- 47 tests unitaires couvrant : lifecycle, configuration, content filtering (clean, profanity, spam, hate speech, custom blacklist, whitelist), custom filters, user reports, review queue, moderation actions (warn, temp ban, permanent ban, auto-ban), user status, statistics, error handling, events

**Détails TelemetryModule :**
- 908 lignes de code TypeScript
- Event tracking (7 types : PAGE_VIEW, USER_ACTION, FEATURE_USAGE, NAVIGATION, INTERACTION, CONVERSION, CUSTOM)
- Error tracking avec stack traces, grouping, et 5 niveaux de sévérité (DEBUG, INFO, WARNING, ERROR, FATAL)
- Performance monitoring (6 types : PAGE_LOAD, API_CALL, RENDER_TIME, FPS, MEMORY_USAGE, NETWORK_LATENCY)
- Session management avec 4 états (STARTED, ACTIVE, BACKGROUNDED, ENDED)
- Buffer system avec batch sending automatique
- Offline queue avec retry logic (max retries configurable)
- 5 sampling strategies (ALWAYS, NEVER, PERCENTAGE, USER_BASED, ADAPTIVE)
- PII filtering pour protection données sensibles (email, password, phone, token, apiKey, etc.)
- Consent management (analytics, performance, errorTracking)
- Session timeout checker (background task)
- Analytics complets : events par type, errors par sévérité, sessions, duration moyenne
- Context automatique (platform, version, locale, timezone, userAgent)
- 16+ types d'événements (MODULE_INITIALIZED, MODULE_STARTED, MODULE_STOPPED, CONSENT_REQUIRED, CONSENT_UPDATED, EVENT_TRACKED, ERROR_TRACKED, PERFORMANCE_TRACKED, SESSION_STARTED, SESSION_ENDED, BATCH_CREATED, BATCH_SENT, BATCH_FAILED, BATCH_QUEUED, BATCH_DROPPED, ANALYTICS_RESET)
- 57 tests unitaires couvrant : lifecycle, configuration, consent management, event tracking (custom, page view, user action, feature usage), error tracking (metadata, grouping, severity), performance monitoring (page load, API calls), session management (start, end, activity, timeout), buffer & batch (auto-flush, retry, offline queue), sampling strategies (ALWAYS, NEVER, PERCENTAGE), PII filtering (events, errors, metadata), analytics (totaux, par type/sévérité, reset), error handling, integration tests

#### Semaine 10-12 : Expérience Utilisateur

| Module | Web | Mobile | Desktop | Statut | Date |
|--------|-----|--------|---------|--------|------|
| **Wallet Core** | Stripe + ImuCoin | Apple/Google Pay | Stripe | ✅ COMPLÉTÉ (1228 lignes, 71 tests) | 8 déc |
| **IA Assistant** | Multi-provider (OpenAI/Anthropic/Gemini) | Mobile adaptation | Full features | ✅ COMPLÉTÉ (1121 lignes, 55 tests) | 8 déc |
| **Moderation** | Report + Filter | Same | Same | ✅ COMPLÉTÉ (840 lignes, 47 tests) | 8 déc |
| **Telemetry** | Analytics | Crashlytics | Sentry | ✅ COMPLÉTÉ (908 lignes, 57 tests) | 8 déc |

**Modules P2/P3 Stats Phase C :**
- ✅ 4/4 modules complétés (100%) 🎉
- 🎯 4,097 lignes de code production
- 🧪 230 tests unitaires (100% passants)

#### Livrables Phase C

- 16/16 modules core complets
- Coverage tests > 50%
- Beta releases toutes plateformes

---

### Phase D : Design Kawaii UI/UX (Avril-Juillet 2026)

*Durée : 16 semaines | Priorité : HAUTE*

> Référence : [KAWAII_UI_UX_DESIGN_CHARTER.md](../web-app/docs/KAWAII_UI_UX_DESIGN_CHARTER.md)  
> Plan détaillé : [PHASE_D.md](../web-app/docs/PHASE_D.md)

#### 🎨 ThemeModule - Foundation Kawaii ✅ COMPLÉTÉ

**Statut :** ✅ Complété (8 décembre 2025)  
**Code :** 982 lignes TypeScript  
**Tests :** 64 tests unitaires (100% passants)

**Fonctionnalités :**
- 8 thèmes kawaii prédéfinis :
  - 🌸 **Daylight** (Pastel Sakura) - #FFEAF4 → #FFB7D5
  - 🌙 **Nightfall** (Dream Lavender) - #1C1540 → #C7A6FF
  - 🧋 **Bubble Tea Bliss** - #FFF4E6 → #FF93B3
  - 🌿 **Mint Garden** - #E8F8F5 → #AEE6CF
  - 🍑 **Sunset Peach** - #FFE5D9 → #FFADAD
  - 🌠 **Starry Night** - #0B1020 → #6C63FF
  - 🍫 **Choco Mint** - #C1F2D6 → #8BCBB4
  - ✨ **Custom** - User-editable
- Hot-switching sans redémarrage
- Persistence des préférences (localStorage/AsyncStorage)
- Support Dark/Light mode avec adaptation automatique
- Auto mode basé sur l'heure (6h → Light, 18h → Dark)
- Custom theme builder avec validation
- ColorPalette complète (38 couleurs par thème)
- Typography system (4 font families, 8 sizes, 6 weights)
- Spacing & Layout (8 niveaux, border-radius, shadows)
- Kawaii properties (emoji, description, decorations)
- Statistics tracking (theme changes, mode changes, most used)
- Event system (7 events : THEME_CHANGED, MODE_CHANGED, etc.)

**Tests Coverage (64 tests) :**
- ✅ Lifecycle (7 tests) - initialize, start, stop, events
- ✅ Configuration (3 tests) - default theme, custom config
- ✅ Theme Switching (5 tests) - change theme, events, errors
- ✅ Mode Switching (4 tests) - dark/light/auto modes
- ✅ Available Themes (3 tests) - list themes, get by name
- ✅ Color Palettes (8 tests) - all 7 themes + properties validation
- ✅ Color API (6 tests) - semantic colors, palette retrieval
- ✅ Custom Themes (5 tests) - create, apply, list, restrictions
- ✅ Typography (3 tests) - fonts, sizes, weights
- ✅ Spacing & Layout (3 tests) - spacing, borders, shadows
- ✅ Kawaii Properties (3 tests) - emoji, decorations per theme
- ✅ Statistics (5 tests) - tracking, reset, most used
- ✅ Persistence (4 tests) - save, load, events
- ✅ Error Handling (3 tests) - invalid themes, lifecycle
- ✅ Integration (2 tests) - complete workflows

**Architecture :**
```typescript
ThemeModule implements:
  - 5 Enums (ThemeName, ThemeMode, ColorSemantic, etc.)
  - 13 Interfaces (Theme, ColorPalette, Typography, Spacing, etc.)
  - 25+ Public methods (setTheme, setMode, getColor, createCustomTheme, etc.)
  - EventEmitter integration (7 event types)
  - Background tasks (auto mode timer - 60s interval)
```

**Impact Platform :**
- Foundation pour tous les composants UI-Kit
- Utilisé par SeasonModule, RelaxModeModule (Phase D suite)
- Intégration avec PreferencesModule pour persistence
- Cross-platform compatible (Web, Mobile, Desktop)

---

#### 🎨 ImuMascot Component & AnimationModule ✅ COMPLÉTÉ

**Statut :** ✅ Complété (10 décembre 2025)  
**Code Mascotte :** 441 lignes TypeScript (ImuMascot.tsx)  
**Code Animation :** En cours (AnimationModule.ts)  
**Code Lottie Player :** 231 lignes TypeScript (LottiePlayer.tsx)  
**Tests :** 490+ lignes (40+ tests ImuMascot)  
**Dépendances installées :** lottie-web ^5.13.0, framer-motion ^12.23.25, lottie-react-native ^7.3.4

**Composant ImuMascot - Fonctionnalités :**
- 5 états émotionnels (idle, happy, excited, sleeping, loading)
- 4 saisons avec emojis (spring 🌸, summer ☀️, autumn 🍂, winter ❄️)
- 4 tailles (sm: 24px, md: 32px, lg: 48px, xl: 64px)
- Animations Lottie avec fallback emoji automatique
- Support données JSON ou URLs d'animations par état
- Interactions utilisateur : tap, double-tap (300ms), long-press (500ms)
- Système de messages avec auto-hide (3s par défaut, personnalisable)
- Barre de progression XP avec 4 paliers (0%, 25%, 50%, 75%, 100%)
- Affichage niveau avec badge kawaii
- Système d'accessoires équipés (4 positions : head, body, hand, background)
- Contrôles d'animation (autoplay, speed 0.5-2.0)
- Props d'animations : `animations`, `animationSources`, `useFallback`
- Accessibilité complète (ARIA labels, roles, progressbar)
- États hover/pressed avec animations CSS
- Support dark mode avec dégradés adaptatifs

**LottiePlayer Component - Fonctionnalités :**
- Wrapper pour lottie-web avec gestion d'erreurs
- Support animationData (JSON) et src (URL)
- 3 renderers : svg, canvas, html
- Contrôles : autoplay, loop, speed
- Fallback personnalisable en cas d'erreur
- États de chargement (loading, error) avec indicateurs
- Callbacks : onLoad, onComplete, onLoopComplete, onError
- Événements lottie : DOMLoaded, complete, loopComplete, data_failed
- Cleanup automatique au démontage
- Accessibilité (aria-label, aria-busy)

**AnimationModule - Architecture :**
```typescript
AnimationModule implements:
  - 5 Enums (AnimationType: LOTTIE/CSS/JS/NATIVE, AnimationCategory: MICRO/TRANSITION/DECORATION/FEEDBACK/MASCOTTE)
  - 4 Priority levels (LOW, NORMAL, HIGH, CRITICAL)
  - Registry d'animations réutilisables
  - Performance management (max 3-4 simultanées)
  - Preload animations critiques
  - Micro-interactions (rebond, flottement, ripple, shake, pulse)
  - Transitions de pages et composants
  - Support Lottie + animations natives
```

**Tests Coverage ImuMascot (40+ tests) :**
- ✅ Rendering de base (8 tests) - états, tailles, CSS
- ✅ Saisons (4 tests) - emojis spring/summer/autumn/winter
- ✅ Niveau & XP (5 tests) - badge, progression, pourcentages
- ✅ Accessoires (4 tests) - positions head/body/hand/background
- ✅ Messages (5 tests) - texte, emoji, auto-hide, durée, remplacement
- ✅ Interactions (7 tests) - tap, double-tap, long-press, timers
- ✅ Accessibilité (4 tests) - ARIA, roles, labels
- ✅ Props par défaut (3 tests) - valeurs initiales

**Dépendances Installées :**
- **web-app & desktop-app :**
  - lottie-web ^5.13.0 (animations web)
  - framer-motion ^12.23.25 (animations React)
- **mobile-app :**
  - lottie-react-native ^7.3.4 (animations natifs)
  - react-native-reanimated ^4.2.0 (animations performantes)
  - moti ^0.30.0 (composants animés)
- **ui-kit :**
  - lottie-web ^5.13.0 (pour LottiePlayer)

**Configuration Workspace :**
- ✅ pnpm-workspace.yaml réorganisé (shared-types en premier)
- ✅ @imuchat/shared-types correctement référencé dans mobile-app
- ✅ Installation réussie sur 3 plateformes (web, desktop, mobile)

**Utilisation Exemple :**
```tsx
import { ImuMascot } from '@imuchat/ui-kit';

<ImuMascot 
  state="happy"
  season="spring"
  size="lg"
  level={5}
  xp={75}
  xpForNextLevel={100}
  showProgress
  showLevel
  animations={{
    happy: happyAnimationData,
    idle: idleAnimationData
  }}
  // ou avec URLs
  animationSources={{
    happy: '/animations/happy.json'
  }}
  message={{ text: "Bienvenue !", emoji: "🎉", duration: 3000 }}
  accessories={[
    { id: 'hat', emoji: '🎩', position: 'head' },
    { id: 'heart', emoji: '💝', position: 'hand' }
  ]}
  interactive
  autoplay
  animationSpeed={1.2}
  onTap={() => console.log('Tap!')}
  onDoubleTap={() => console.log('Double tap!')}
  onLongPress={() => console.log('Long press!')}
/>
```

**Impact Platform :**
- Mascotte interactive pour toutes les plateformes
- Foundation pour système de rewards visuels
- Base pour RelaxMode et SeasonModule
- Utilisable dans notifications, tutoriels, onboarding
- Support multi-états pour contextes variés (idle, loading, célébration)
- Intégration avec ThemeModule pour couleurs adaptatifs
- Prêt pour animations Lottie JSON custom

---

#### 🎯 Prochaines Étapes Phase D

#### Thèmes & Branding
- ✅ 8 palettes officielles implémentées (ThemeModule)
- ✅ Mascotte Imu-chan - ImuMascot Component (**10 décembre 2025**)
- ✅ AnimationModule avec support Lottie (**10 décembre 2025**)
- ⏳ Sound Design (6 sons événements)
- ⏳ Animations kawaii cross-platform (en cours)

#### Composants Kawaii
- KawaiiButton, KawaiiCard, KawaiiInput
- KawaiiAvatar, KawaiiModal, KawaiiTooltip
- Système de rewards visuels
- Modes spéciaux (Dream, Relax, Saisonnier)

---

### Phase E : Production & Launch (Août-Octobre 2026)
*Durée : 12 semaines | Priorité : CRITIQUE*

#### Optimisations Performance
- Bundle size < 250KB (web)
- Cold start < 3s (mobile)
- Memory optimization (desktop)
- Lighthouse score > 90

#### Audits & Compliance
- Security audit complet
- WCAG 2.1 AA accessibility
- RGPD compliance
- App Store / Play Store guidelines

#### Déploiements
- Firebase Hosting (web)
- TestFlight + Play Store (mobile)
- Mac App Store + Windows Store (desktop)

---

## 📊 Métriques de Succès

### KPIs Techniques

| Métrique | Actuel | Objectif Q1 2026 | Objectif Launch |
|----------|--------|------------------|---------------|
| **Coverage Tests** | 35% | 50% | 80% |
| **Bundle Size Web** | N/A | < 500KB | < 250KB |
| **Cold Start Mobile** | ~4s | < 3s | < 2s |
| **Lighthouse Score** | N/A | > 80 | > 95 |
| **Crash-free Rate** | N/A | > 98% | > 99.5% |

### KPIs Produit

| Métrique | Objectif Beta | Objectif Launch |
|----------|---------------|-----------------|
| **DAU** | 100 | 10,000 |
| **Retention D7** | 30% | 50% |
| **Retention D30** | 15% | 30% |
| **NPS Score** | 40 | 70 |
| **Session Duration** | 5min | 15min |

---

## 🛠️ Stack Technique Unifiée

### Frontend Partagé
```
TypeScript 5.x     → Tous les packages
React 18+          → web-app, desktop-app
React Native 0.81  → mobile-app
Tailwind CSS       → web-app, ui-kit (nativewind pour mobile)
Zustand            → State management
React Query        → Data fetching
```

### Backend
```
platform-core/
├── Fastify        → API REST
├── Drizzle ORM    → Database (PostgreSQL)
├── Socket.IO      → WebSocket
├── Firebase       → Auth + Storage + FCM
└── Genkit         → IA (Google AI)
```

### Build & Deploy
```
pnpm workspaces    → Monorepo management
tsup               → Library builds
Next.js            → Web SSR/SSG
Expo EAS           → Mobile builds
Electron Builder   → Desktop builds
GitHub Actions     → CI/CD
```

---

## 📅 Calendrier Récapitulatif

| Phase | Durée | Période | Priorité | Status |
|-------|-------|---------|----------|--------|
| **A - Consolidation** | 2 sem | Déc 2025 | CRITIQUE | ✅ Complété |
| **B - Modules Core** | 8 sem | Déc 2025 - Jan 2026 | HAUTE | ✅ Complété |
| **C - Features Avancées** | 6 sem | Déc 2025 - Jan 2026 | HAUTE | 🎉 P0 Complété (100% - 3/3) |
| **D - Design Kawaii** | 16 sem | Avr-Juil 2026 | HAUTE | ⏳ Planifié |
| **E - Production** | 12 sem | Août-Oct 2026 | CRITIQUE | ⏳ Planifié |

**Total estimé :** 40 semaines (~10 mois)  
**Launch prévu :** Octobre 2026

---

## 🎯 Actions Immédiates (Cette Semaine)

### Priorité 1 : Finaliser migration packages partagés
1. ✅ Configurer pnpm workspace
2. ⏳ Migrer composants UI depuis ImuChat → ui-kit
3. ⏳ Unifier types dans shared-types
4. ⏳ Tester builds cross-platform

### Priorité 2 : Synchroniser modules existants
1. ⏳ Migrer Module Contacts (web) vers shared
2. ⏳ Migrer Module Notifications (web) vers shared
3. ⏳ Adapter services platform-core

### Priorité 3 : Documentation
1. ⏳ Guide développeur monorepo
2. ⏳ API documentation modules
3. ⏳ Contributing guidelines

---

---

## 🎯 50 Fonctionnalités ImuChat - Matrice d'Implémentation

> Référence : [FUNCTIONNALYTIES_LIST.md](./FUNCTIONNALYTIES_LIST.md)

### Vue d'ensemble par groupe

| Groupe | Nom | Nb Features | Priorité | Phase |
|--------|-----|-------------|----------|-------|
| 1 | Messagerie & Communication | 5 | 🔴 P0 | A-B |
| 2 | Appels audio & vidéo | 5 | 🔴 P0 | B-C |
| 3 | Profils & Identité | 5 | 🟠 P1 | B |
| 4 | Personnalisation avancée | 5 | 🟠 P1 | C-D |
| 5 | Mini-apps sociales | 5 | 🟠 P1 | C |
| 6 | Modules avancés | 5 | 🟡 P2 | C-D |
| 7 | Services utilitaires publics | 5 | 🟡 P2 | D |
| 8 | Divertissement & Création | 5 | 🟡 P2 | D |
| 9 | IA intégrée | 5 | 🟠 P1 | C-D |
| 10 | App Store & Écosystème | 5 | 🟠 P1 | D-E |

### Détail Groupe 1 : Messagerie & Communication

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 1.1 | Messagerie instantanée (texte, emojis, GIFs) | ✅ | ✅ | ⏳ | ChatList, Conversation |
| 1.2 | Messages vocaux transcrits automatiquement | ⏳ | ⏳ | ⏳ | VoiceRecorder, Transcription |
| 1.3 | Pièces jointes (photos, vidéos, fichiers) | ✅ | ⏳ | ⏳ | AttachmentPicker, Preview |
| 1.4 | Édition et suppression des messages | ✅ | ⏳ | ⏳ | MessageOptions |
| 1.5 | Réactions rapides aux messages | ⏳ | ⏳ | ⏳ | ReactionPicker |

### Détail Groupe 2 : Appels audio & vidéo

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 2.1 | Appels audio (1-to-1 ou groupe) | ⏳ | ⏳ | ⏳ | AudioCall |
| 2.2 | Appels vidéo HD avec réduction du bruit | ⏳ | ⏳ | ⏳ | VideoCall |
| 2.3 | Mini-fenêtre flottante (PiP) | ⏳ | ⏳ | ⏳ | PiPOverlay |
| 2.4 | Partage d'écran (mobile & desktop) | ⏳ | ⏳ | ⏳ | ScreenShare |
| 2.5 | Filtre beauté IA + flou d'arrière-plan | ⏳ | ⏳ | ⏳ | IAFilterModal |

### Détail Groupe 3 : Profils & Identité

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 3.1 | Profils privés, publics et anonymes | ⏳ | ⏳ | ⏳ | ProfileView |
| 3.2 | Multi-profils (perso, pro, créateur) | ⏳ | ⏳ | ⏳ | MultiProfileSwitcher |
| 3.3 | Avatars 2D/3D personnalisables | ⏳ | ⏳ | ⏳ | AvatarEditor |
| 3.4 | Statuts animés (emoji, texte, musique) | ⏳ | ⏳ | ⏳ | StatusEditor |
| 3.5 | Vérification d'identité volontaire | ⏳ | ⏳ | ⏳ | Verification |

### Détail Groupe 4 : Personnalisation avancée

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 4.1 | Thèmes visuels (Kawaii, Pro, Night...) | ✅ Partiel | ✅ | ⏳ | ThemePicker |
| 4.2 | Arrière-plans animés pour les chats | ⏳ | ⏳ | ⏳ | WallpaperPicker |
| 4.3 | Police personnalisable par conversation | ⏳ | ⏳ | ⏳ | FontSettings |
| 4.4 | Packs d'icônes et de sons | ⏳ | ⏳ | ⏳ | IconPackStore |
| 4.5 | Widget homescreen | N/A | ⏳ | ⏳ | Widget |

### Détail Groupe 5 : Mini-apps sociales natives

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 5.1 | Stories 24h | ⏳ | ⏳ | ⏳ | Stories, StoryViewer |
| 5.2 | Mur social type "timeline" | ⏳ | ⏳ | ⏳ | Timeline, PostDetail |
| 5.3 | Mini-blogs personnels | ⏳ | ⏳ | ⏳ | BlogEditor |
| 5.4 | Événements (invites, inscriptions) | ⏳ | ⏳ | ⏳ | EventsCalendar |
| 5.5 | Groupes publics/privés avec feed | ⏳ | ⏳ | ⏳ | GroupFeed, GroupMembers |

### Détail Groupe 6 : Modules avancés

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 6.1 | Productivity Hub (tâches, planning) | ⏳ | ⏳ | ⏳ | TaskList, Kanban |
| 6.2 | Suite Office (texte, tableur, slides) | ⏳ | ⏳ | ⏳ | DocsEditor |
| 6.3 | Module PDF complet | ⏳ | ⏳ | ⏳ | PDFViewer |
| 6.4 | Board collaboratif (whiteboard, mindmap) | ⏳ | ⏳ | ⏳ | BoardCanvas |
| 6.5 | Cooking & Home (courses, ménage, repas) | ⏳ | ⏳ | ⏳ | HomeManager |

### Détail Groupe 7 : Services utilitaires publics

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 7.1 | Horaires métro/tram/bus avec alertes | ⏳ | ⏳ | ⏳ | TransportSearch |
| 7.2 | Info trafic routier en temps réel | ⏳ | ⏳ | ⏳ | TrafficMap |
| 7.3 | Numéros d'urgence géolocalisés | ⏳ | ⏳ | ⏳ | EmergencyNumbers |
| 7.4 | Annuaire des services publics | ⏳ | ⏳ | ⏳ | ServicesDirectory |
| 7.5 | Suivi colis multi-transporteurs | ⏳ | ⏳ | ⏳ | ParcelTracking |

### Détail Groupe 8 : Divertissement & Création

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 8.1 | Mini-lecteur musique + playlists | ⏳ | ⏳ | ⏳ | MusicPlayer, DockPlayer |
| 8.2 | Podcasts (catalogue + favoris) | ⏳ | ⏳ | ⏳ | Podcasts |
| 8.3 | Lecteur vidéo intégré | ⏳ | ⏳ | ⏳ | VideoPlayer |
| 8.4 | Mini-jeux sociaux | ⏳ | ⏳ | ⏳ | MiniGames |
| 8.5 | Outil de création stickers & emojis | ⏳ | ⏳ | ⏳ | StickerCreator |

### Détail Groupe 9 : IA intégrée

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 9.1 | Chatbot multi-personas | ⏳ | ⏳ | ⏳ | ChatbotModal |
| 9.2 | Suggestions intelligentes de réponses | ⏳ | ⏳ | ⏳ | SmartReplyBar |
| 9.3 | Résumé automatisé des conversations | ⏳ | ⏳ | ⏳ | ConversationSummary |
| 9.4 | Modération automatique groupes | ⏳ | ⏳ | ⏳ | ModerationPanel |
| 9.5 | Traduction instantanée dans les chats | ⏳ | ⏳ | ⏳ | TranslationOverlay |

### Détail Groupe 10 : App Store & Écosystème

| # | Fonctionnalité | Web | Mobile | Desktop | Écrans requis |
|---|----------------|-----|--------|---------|---------------|
| 10.1 | Store d'apps internes & partenaires | ✅ Partiel | ✅ | ⏳ | StoreHome, AppDetail |
| 10.2 | Installation/désinstallation modules | ⏳ | ⏳ | ⏳ | InstallFlow |
| 10.3 | Système de permissions par app | ⏳ | ⏳ | ⏳ | Permissions |
| 10.4 | Marketplace de services | ⏳ | ⏳ | ⏳ | Marketplace |
| 10.5 | Paiement intégré + portefeuille | ✅ UI | ✅ | ⏳ | WalletHome, Checkout |

---

## 🗺️ Sitemap Cross-Platform

> Référence : [Sitemap_web_complet.md](../web-app/Sitemap_web_complet.md)

### Routes Web (Next.js)

```
/                     → Landing page
├── /features         → Liste fonctionnalités
├── /pricing          → Plans & tarifs
├── /about            → À propos
├── /blog             → Blog articles
├── /business         → Comptes officiels, API
├── /careers          → Emplois
├── /support          → Centre d'aide
├── /contact          → Contact
└── /legal/*          → Privacy, Terms

/login                → Connexion
/signup               → Inscription
/onboarding           → Setup initial
/verify               → Vérification identité

/dashboard            → Accueil utilisateur (post-login)
├── /chats            → Liste conversations
│   └── /chats/:id    → Conversation
├── /calls            → Historique appels
├── /social           → Social hub
│   ├── /stories      → Stories
│   ├── /timeline     → Feed
│   ├── /groups/:id   → Groupe détail
│   └── /events       → Événements
├── /modules/*        → Modules installés
├── /services         → Services publics
├── /media            → Media hub
├── /ai               → IA assistant
├── /store/:app       → Store apps
├── /wallet           → Portefeuille
├── /profile          → Profil utilisateur
└── /settings         → Paramètres

/ads                  → Gestion pubs (annonceurs)
/partners             → Portal partenaires
/admin                → Dashboard admin
```

### Écrans Mobile (React Native/Expo)

```
[Bottom Tab Bar]
├── ChatsTab          → ChatList → Conversation → CallScreen
├── SocialTab         → Stories → Timeline → Groups
├── ModulesTab        → ModulesHome → ModuleDetail
├── MediaTab          → MusicPlayer → Podcasts → Games
└── StoreTab          → StoreHome → AppDetail → InstallFlow

[Drawer]
├── Profile           → ProfileView → AvatarEditor
├── Personalization   → ThemePicker → WallpaperPicker
├── Settings          → AccountSettings → Privacy
└── Support           → Help → Contact

[Overlays & Modals]
├── CallOverlay       → AudioCall / VideoCall → PiP
├── AIOverlay         → ChatbotModal → SmartReply
├── PaymentModal      → Checkout → TopUp
└── AttachmentPicker  → Camera → Gallery → Files
```

### Deep Links

| Pattern | Destination |
|---------|-------------|
| `imuchat://chat/:id` | Conversation spécifique |
| `imuchat://story/:id` | Story viewer |
| `imuchat://user/:id` | Profil utilisateur |
| `imuchat://app/:id` | App du store |
| `imuchat://call/:id` | Rejoindre appel |

---

## 📐 Ordre d'Implémentation Détaillé

### Sprint 1-2 : Core Communication (Phase A)

```mermaid
graph LR
    A[Auth] --> B[ChatList]
    B --> C[Conversation]
    C --> D[Composer]
    D --> E[Attachments]
    E --> F[VoiceMessages]
```

**Écrans à créer :**
1. `AuthScreen` (Login/Signup)
2. `OnboardingFlow` 
3. `ChatList` (conversations)
4. `Conversation` (messages)
5. `MessageComposer` (input)
6. `AttachmentPicker`
7. `VoiceRecorder`

### Sprint 3-4 : Appels & Présence (Phase B)

```mermaid
graph LR
    A[Contacts] --> B[AudioCall]
    B --> C[VideoCall]
    C --> D[PiP]
    D --> E[ScreenShare]
```

**Écrans à créer :**
1. `ContactsList`
2. `AudioCallScreen`
3. `VideoCallScreen`
4. `PiPOverlay`
5. `ScreenShareFlow`

### Sprint 5-6 : Profil & Personnalisation (Phase B)

**Écrans à créer :**
1. `ProfileView`
2. `MultiProfileSwitcher`
3. `AvatarEditor`
4. `StatusEditor`
5. `ThemePicker`
6. `WallpaperPicker`

### Sprint 7-8 : Social Features (Phase C)

**Écrans à créer :**
1. `Stories` + `StoryViewer`
2. `Timeline` + `PostDetail`
3. `GroupFeed` + `GroupMembers`
4. `EventsCalendar`

### Sprint 9-12 : Modules & Services (Phase C-D)

**Écrans à créer :**
1. `ProductivityHub`
2. `PDFViewer`
3. `BoardCanvas`
4. `TransportSearch`
5. `ParcelTracking`

### Sprint 13-16 : Media & IA (Phase D)

**Écrans à créer :**
1. `MusicPlayer` (dockable)
2. `Podcasts`
3. `MiniGames`
4. `StickerCreator`
5. `ChatbotModal`
6. `TranslationOverlay`

### Sprint 17-20 : Store & Monetization (Phase E)

**Écrans à créer :**
1. `StoreHome`
2. `AppDetail`
3. `InstallFlow`
4. `WalletHome`
5. `Checkout`
6. `Marketplace`

---

## 📚 Documents de Référence

- **Web Roadmap :** [web-roadmap.md](../web-app/docs/web-roadmap.md)
- **Mobile Roadmap :** [ROADMAP.md](../mobile-app/ROADMAP.md)
- **Mobile Wireflow :** [wireflow_visuel.md](../mobile-app/wireflow_visuel.md)
- **Core Modules Spec :** [CORE_MODULES.md](../web-app/docs/CORE_MODULES.md)
- **50 Fonctionnalités :** [FUNCTIONNALYTIES_LIST.md](./FUNCTIONNALYTIES_LIST.md)
- **Sitemap Complet :** [Sitemap_web_complet.md](../web-app/Sitemap_web_complet.md)
- **Kawaii Design :** [KAWAII_UI_UX_DESIGN_CHARTER.md](../web-app/docs/KAWAII_UI_UX_DESIGN_CHARTER.md)
- **Gap Analysis :** [GAP_ANALYSIS.md](./GAP_ANALYSIS.md)

---

*Document généré le 2 décembre 2025*  
*Mise à jour : Intégration 50 fonctionnalités + Sitemap*  
*Prochaine révision : 16 décembre 2025*
