# 🚀 PLAN DE SPRINTS — Rattrapage Desktop App ImuChat

**Date :** 8 mars 2026  
**Base :** Analyse d'écart (`DESKTOP_GAP_ANALYSIS.md`) + Guide architecture (`DESKTOP_ARCHITECTURE_GUIDE.md`)  
**Référence :** `50_FONCTIONNALITIES_SCREENS.md` (10 groupes fonctionnels)  
**Principe :** Chaque sprint produit un livrable testable et modulaire

---

## 📋 Vue synthétique

| Sprint | Semaines | Thème | Réf. 50 Fonctionnalités | Livrable |
|--------|:--------:|-------|-------------------------|----------|
| **S0** | 0.5 | Setup & Tooling | — | Projet structuré, builds OK |
| **S1** | 1-2 | Auth & Providers | Groupe 3 (Identité) | Login/Signup fonctionnel |
| **S2** | 3-4 | Chat Core | Groupe 1 (Messagerie) | Conversations réelles |
| **S3** | 5-6 | Contacts & Profil | Groupes 1,3 | Contacts + profil |
| **S4** | 7-8 | Appels | Groupe 2 (Appels) | Audio/vidéo basique |
| **S5** | 9-10 | Social & Notifications | Groupes 5, nav | Feed, stories, notifs |
| **S6** | 11-12 | Thèmes & Personnalisation | Groupe 4 | 7 thèmes, settings complets |
| **S7** | 13-14 | Communautés & Serveurs | Groupe 5 | Serveurs/channels |
| **S8** | 15-16 | Store & Modules | Groupe 10 (Store) | Store, modules dynamiques |
| **S9** | 17-18 | Desktop Natif & Polish | — | Tray, updater, raccourcis |
| **S10** | 19-20 | Tests & Build | — | CI/CD, packaging multi-OS |

---

## 🔧 Sprint 0 — Setup & Tooling (0.5 semaine)

**Objectif :** Mettre en place l'infrastructure de développement

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 0.1 | Configurer aliases `@/` dans tsconfig + vite | `tsconfig.json`, `vite.config.ts` | P0 |
| 0.2 | Configurer Tailwind CSS v4 correctement | `src/styles/globals.css`, `postcss.config.mjs` | P0 |
| 0.3 | Créer `.env.example` avec toutes les variables | `.env.example` | P0 |
| 0.4 | Installer i18next + react-i18next | `package.json` | P0 |
| 0.5 | Configurer react-router-dom | `src/router/index.tsx` | P0 |
| 0.6 | Configurer React Query (QueryClientProvider) | `src/App.tsx` | P0 |
| 0.7 | Créer la structure de dossiers | `src/*/` (voir architecture) | P0 |
| 0.8 | Configurer Vitest + Testing Library | `vitest.config.ts`, `package.json` | P1 |
| 0.9 | Configurer electron-builder (AppID, productName) | `electron-builder.json5` | P1 |
| 0.10 | Vérifier intégration workspace packages | Build test avec imports | P0 |

### Livrables S0

- [x] `pnpm dev` démarre sans erreur
- [x] Import `@/` fonctionne
- [x] Import `@imuchat/ui-kit` et `@imuchat/shared-types` fonctionne
- [x] Tailwind classes appliquées
- [x] Router avec pages vides
- [x] i18n chargé avec 3 langues

### Fichiers créés

```
src/
├── router/index.tsx
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       ├── fr.json
│       └── ja.json
├── styles/globals.css
├── lib/utils.ts
├── lib/constants.ts
└── types/electron.d.ts
.env.example
postcss.config.mjs
```

---

## 🔐 Sprint 1 — Auth & Providers (Semaines 1-2)

**Objectif :** Authentification complète + providers de base  
**Réf. 50F :** Groupe 3 — Profils & Identité (écran login/signup)

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 1.1 | Créer Supabase client (browser) | `src/services/supabase.ts` | P0 |
| 1.2 | Créer AuthContext + useAuth hook | `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts` | P0 |
| 1.3 | Créer Zustand auth store | `src/stores/useAuthStore.ts` | P0 |
| 1.4 | Page Login (email/password) | `src/app/auth/LoginPage.tsx` | P0 |
| 1.5 | Page Signup (email/password/username) | `src/app/auth/SignupPage.tsx` | P0 |
| 1.6 | Page Forgot Password | `src/app/auth/ForgotPasswordPage.tsx` | P1 |
| 1.7 | ProtectedRoute component | `src/components/shared/ProtectedRoute.tsx` | P0 |
| 1.8 | ThemeContext + provider (7 thèmes ui-kit) | `src/contexts/ThemeContext.tsx` | P0 |
| 1.9 | Composition providers dans App.tsx | `src/App.tsx` | P0 |
| 1.10 | Auth service (login, signup, logout) | `src/services/auth-service.ts` | P0 |
| 1.11 | Tests auth (useAuth, login flow) | `src/__tests__/auth.test.ts` | P1 |
| 1.12 | i18n : namespace `auth` complet (3 langues) | `src/i18n/locales/*.json` | P0 |

### Intégrations packages

```typescript
// shared-types
import type { User, UserProfile } from '@imuchat/shared-types'
import type { AuthState } from '@imuchat/shared-types'

// ui-kit
import { Button, Input, Card, Spinner } from '@imuchat/ui-kit'
import { KawaiiCard, KawaiiInput, KawaiiButton } from '@imuchat/ui-kit'
```

### Livrables S1

- [ ] Flux login → session → redirect home
- [ ] Flux signup → création compte → redirect login
- [ ] Session persistée (Supabase + Zustand persist)
- [ ] Route protégée : redirect /auth/login si non connecté
- [ ] Composants UI-Kit utilisés pour formulaires
- [ ] Textes i18n (pas de hardcoded strings)

---

## 💬 Sprint 2 — Chat Core (Semaines 3-4)

**Objectif :** Messagerie fonctionnelle en temps réel  
**Réf. 50F :** Groupe 1 — Messagerie & Communication (5 écrans)

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 2.1 | Socket.IO client + SocketContext | `src/services/socket.ts`, `src/contexts/SocketContext.tsx` | P0 |
| 2.2 | Chat service (Supabase CRUD) | `src/services/chat-service.ts` | P0 |
| 2.3 | Zustand chat store | `src/stores/useChatStore.ts` | P0 |
| 2.4 | Hook useChat (messages + realtime) | `src/hooks/useChat.ts` | P0 |
| 2.5 | Hook useConversations (liste) | `src/hooks/useConversations.ts` | P0 |
| 2.6 | Hook useTypingIndicator | `src/hooks/useTypingIndicator.ts` | P1 |
| 2.7 | Page Chat (split panel refactored) | `src/app/chat/ChatPage.tsx` | P0 |
| 2.8 | ConversationList component | `src/components/chat/ConversationList.tsx` | P0 |
| 2.9 | ConversationView (messages + input) | `src/app/chat/ConversationView.tsx` | P0 |
| 2.10 | Utiliser ChatBubble, MessageList, ChatInput du ui-kit | Composants chat | P0 |
| 2.11 | Envoi/réception messages temps réel | Socket.IO events | P0 |
| 2.12 | Recherche conversations | `src/components/chat/ConversationSearch.tsx` | P1 |
| 2.13 | i18n : namespace `chat` (3 langues) | `src/i18n/locales/*.json` | P0 |
| 2.14 | Tests chat (useChat, message sending) | `src/__tests__/chat.test.ts` | P1 |

### Intégrations packages

```typescript
// shared-types
import type { ChatMessage, Conversation, MessageType } from '@imuchat/shared-types'

// ui-kit
import { ChatBubble, ChatInput, MessageList, TypingIndicator } from '@imuchat/ui-kit'
import { Avatar, OnlineIndicator, UserAvatar } from '@imuchat/ui-kit'
import { EmojiReaction } from '@imuchat/ui-kit'

// platform-core
import { EventBus } from '@imuchat/platform-core/client'
```

### Livrables S2

- [ ] Liste conversations depuis Supabase
- [ ] Afficher messages d'une conversation
- [ ] Envoyer/recevoir messages en temps réel (Socket.IO)
- [ ] Indicateur de saisie (typing)
- [ ] Composants ui-kit ChatBubble/MessageList utilisés
- [ ] Recherche dans les conversations

---

## 👥 Sprint 3 — Contacts & Profil (Semaines 5-6)

**Objectif :** Gestion contacts + profil utilisateur  
**Réf. 50F :** Groupe 3 — Profils & Identité (5 écrans)

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 3.1 | Contacts service | `src/services/contacts-service.ts` | P0 |
| 3.2 | Zustand contacts store | `src/stores/useContactsStore.ts` | P0 |
| 3.3 | Hook useContacts | `src/hooks/useContacts.ts` | P0 |
| 3.4 | Page Contacts (liste, recherche, ajout) | `src/app/contacts/ContactsPage.tsx` | P0 |
| 3.5 | ContactCard component | `src/components/contacts/ContactCard.tsx` | P0 |
| 3.6 | FriendRequest component | `src/components/contacts/FriendRequest.tsx` | P1 |
| 3.7 | Page Profil utilisateur | `src/app/profile/ProfilePage.tsx` | P0 |
| 3.8 | Édition profil (avatar, bio, statut) | `src/app/profile/EditProfile.tsx` | P0 |
| 3.9 | Presence service + hook | `src/services/presence-service.ts`, `src/hooks/usePresence.ts` | P0 |
| 3.10 | Zustand presence store | `src/stores/usePresenceStore.ts` | P0 |
| 3.11 | Online indicator intégré (ui-kit) | Tous les composants contacts/chat | P0 |
| 3.12 | i18n : namespaces `contacts`, `profile` | `src/i18n/locales/*.json` | P0 |

### Intégrations packages

```typescript
// shared-types
import type { Contact, FriendRequest, UserProfile } from '@imuchat/shared-types'

// ui-kit
import { Avatar, UserAvatar, OnlineIndicator, Badge, Card } from '@imuchat/ui-kit'

// platform-core
import { PresenceModule } from '@imuchat/platform-core/client'
```

### Livrables S3

- [ ] Liste contacts avec statut en ligne
- [ ] Recherche utilisateurs
- [ ] Envoi/acceptation/refus demandes d'ami
- [ ] Page profil avec avatar et infos
- [ ] Édition profil depuis la desktop
- [ ] Présence en temps réel (online/offline/idle)

---

## 📞 Sprint 4 — Appels (Semaines 7-8)

**Objectif :** Appels audio/vidéo fonctionnels  
**Réf. 50F :** Groupe 2 — Appels audio/vidéo (5 écrans)

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 4.1 | Stream.io SDK setup | `src/services/calls-service.ts` | P0 |
| 4.2 | Page Appels (historique + lancer) | `src/app/calls/CallsPage.tsx` | P0 |
| 4.3 | CallView (audio/vidéo en cours) | `src/app/calls/CallView.tsx` | P0 |
| 4.4 | VideoGrid component | `src/components/calls/VideoGrid.tsx` | P0 |
| 4.5 | CallControls (mute, camera, hang up) | `src/components/calls/CallControls.tsx` | P0 |
| 4.6 | CallNotification (incoming call) | `src/components/calls/CallNotification.tsx` | P0 |
| 4.7 | Screen sharing (Electron desktopCapturer) | `src/hooks/useScreenShare.ts` | P1 |
| 4.8 | PiP window (Electron BrowserWindow) | `electron/pip-window.ts` | P1 |
| 4.9 | Call history | `src/app/calls/CallHistory.tsx` | P1 |
| 4.10 | i18n : namespace `calls` | `src/i18n/locales/*.json` | P0 |

### Intégrations packages

```typescript
// shared-types
import type { Call, CallType, CallStatus } from '@imuchat/shared-types'

// platform-core
import { CallsModule } from '@imuchat/platform-core/client'
```

### Livrables S4

- [ ] Appel audio 1:1 fonctionnel
- [ ] Appel vidéo HD fonctionnel
- [ ] Contrôles (mute, camera, hangup)
- [ ] Notification d'appel entrant
- [ ] Screen sharing via desktopCapturer
- [ ] Historique d'appels

---

## 🌐 Sprint 5 — Social & Notifications (Semaines 9-10)

**Objectif :** Feed social + notifications complètes  
**Réf. 50F :** Groupe 5 — Mini-apps sociales

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 5.1 | Notifications service | `src/services/notifications-service.ts` | P0 |
| 5.2 | Zustand notifications store | `src/stores/useNotificationsStore.ts` | P0 |
| 5.3 | Hook useNotifications | `src/hooks/useNotifications.ts` | P0 |
| 5.4 | NotificationsPage | `src/app/notifications/NotificationsPage.tsx` | P0 |
| 5.5 | Notifications Electron natives | `electron/notifications.ts` | P0 |
| 5.6 | Feed social page | `src/app/social/FeedPage.tsx` | P1 |
| 5.7 | Stories viewer | `src/app/social/StoriesPage.tsx` | P1 |
| 5.8 | Home page refactored (données réelles) | `src/app/home/HomePage.tsx` | P0 |
| 5.9 | i18n : namespaces `notifications`, `social` | `src/i18n/locales/*.json` | P0 |

### Intégrations packages

```typescript
// shared-types
import type { NotificationType, NotificationPayload } from '@imuchat/shared-types'

// platform-core
import { NotificationsModule, EventBus } from '@imuchat/platform-core/client'
```

---

## 🎨 Sprint 6 — Thèmes & Personnalisation (Semaines 11-12)

**Objectif :** Personnalisation complète  
**Réf. 50F :** Groupe 4 — Personnalisation avancée (5 écrans)

### Tâches

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 6.1 | Intégration 7 thèmes ui-kit | `src/contexts/ThemeContext.tsx` | P0 |
| 6.2 | Settings page avec tabs | `src/app/settings/SettingsPage.tsx` | P0 |
| 6.3 | Compte settings | `src/app/settings/AccountSettings.tsx` | P0 |
| 6.4 | Apparence settings (thème, langue) | `src/app/settings/AppearanceSettings.tsx` | P0 |
| 6.5 | Notifications settings | `src/app/settings/NotificationSettings.tsx` | P0 |
| 6.6 | Privacy settings | `src/app/settings/PrivacySettings.tsx` | P1 |
| 6.7 | Zustand preferences store | `src/stores/usePreferencesStore.ts` | P0 |
| 6.8 | Language switcher (ui-kit) | Intégré dans AppearanceSettings | P0 |
| 6.9 | i18n : namespace `settings` complet | `src/i18n/locales/*.json` | P0 |

### Intégrations packages

```typescript
// ui-kit
import { themes, applyTheme } from '@imuchat/ui-kit/themes'
import { LanguageSwitcher } from '@imuchat/ui-kit/i18n'

// platform-core
import { ThemeModule, PreferencesModule } from '@imuchat/platform-core/client'
```

---

## 🏘️ Sprint 7 — Communautés & Serveurs (Semaines 13-14)

**Réf. 50F :** Groupe 5 — Mini-apps sociales (Groupes/Communautés)

### Tâches

| # | Tâche | Fichiers |
|---|-------|----------|
| 7.1 | Communities service | `src/services/communities-service.ts` |
| 7.2 | CommunitiesPage (liste serveurs) | `src/app/communities/CommunitiesPage.tsx` |
| 7.3 | ServerView (channels + members) | `src/app/communities/ServerView.tsx` |
| 7.4 | ChannelView (messages channel) | `src/app/communities/ChannelView.tsx` |
| 7.5 | ServerIcon, ChannelItem (ui-kit) | Imports directs |
| 7.6 | i18n : namespace `communities` | `src/i18n/locales/*.json` |

---

## 🛍️ Sprint 8 — Store & Modules (Semaines 15-16)

**Réf. 50F :** Groupe 10 — Store & Écosystème (5 écrans)

### Tâches

| # | Tâche | Fichiers |
|---|-------|----------|
| 8.1 | Module registry (dynamic loading) | `src/contexts/ModulesContext.tsx` |
| 8.2 | Modules service | `src/services/modules-service.ts` |
| 8.3 | StorePage (browse modules) | `src/app/store/StorePage.tsx` |
| 8.4 | Module install/uninstall | `src/hooks/useModules.ts` |
| 8.5 | Manifests pour modules core | `src/modules/*/manifest.json` |
| 8.6 | i18n : namespace `store` | `src/i18n/locales/*.json` |

---

## 🖥️ Sprint 9 — Desktop Natif & Polish (Semaines 17-18)

### Tâches

| # | Tâche | Fichiers |
|---|-------|----------|
| 9.1 | Tray icon + context menu | `electron/tray.ts` |
| 9.2 | Auto-updater (electron-updater) | `electron/updater.ts` |
| 9.3 | Deep links (imuchat://) | `electron/deeplinks.ts` |
| 9.4 | Global keyboard shortcuts | `electron/shortcuts.ts` |
| 9.5 | Custom title bar (frameless) | `src/components/electron/TitleBar.tsx` |
| 9.6 | Menu natif Electron | `electron/menu.ts` |
| 9.7 | Fenêtre PiP pour appels | `electron/pip-window.ts` |
| 9.8 | Splash screen | `electron/splash.ts` |

---

## 🧪 Sprint 10 — Tests & Build (Semaines 19-20)

### Tâches

| # | Tâche | Fichiers |
|---|-------|----------|
| 10.1 | Tests unitaires critiques (Vitest) | `src/__tests__/` |
| 10.2 | Tests composants (Testing Library) | `src/__tests__/components/` |
| 10.3 | Tests E2E (Playwright + Electron) | `e2e/` |
| 10.4 | CI/CD pipeline | `.github/workflows/desktop.yml` |
| 10.5 | Build macOS (DMG) | `electron-builder.json5` |
| 10.6 | Build Windows (NSIS) | `electron-builder.json5` |
| 10.7 | Build Linux (AppImage) | `electron-builder.json5` |
| 10.8 | Code signing | Certificates config |
| 10.9 | Coverage report | `vitest.config.ts` |

---

## 📊 Métriques de suivi par sprint

| Sprint | Pages | Composants | Services | Hooks | Stores | i18n keys | Tests |
|--------|:-----:|:----------:|:--------:|:-----:|:------:|:---------:|:-----:|
| S0 | 0 | 0 | 0 | 0 | 0 | ~30 | 0 |
| S1 | 3 | 5 | 2 | 2 | 1 | ~50 | 5 |
| S2 | 2 | 6 | 2 | 3 | 1 | ~40 | 8 |
| S3 | 3 | 5 | 2 | 2 | 2 | ~40 | 6 |
| S4 | 3 | 4 | 1 | 2 | 0 | ~30 | 5 |
| S5 | 3 | 4 | 1 | 1 | 1 | ~40 | 5 |
| S6 | 5 | 3 | 0 | 1 | 1 | ~60 | 5 |
| S7 | 3 | 3 | 1 | 1 | 0 | ~30 | 4 |
| S8 | 2 | 3 | 1 | 1 | 0 | ~30 | 4 |
| S9 | 0 | 2 | 0 | 1 | 0 | ~10 | 3 |
| S10 | 0 | 0 | 0 | 0 | 0 | 0 | 50 |
| **Total** | **24** | **35** | **10** | **14** | **6** | **~360** | **95** |

---

## 🔗 Dépendances entre sprints

```
S0 ─── Setup & Tooling
 │
 ├── S1 ─── Auth & Providers
 │    │
 │    ├── S2 ─── Chat Core
 │    │    │
 │    │    └── S3 ─── Contacts & Profil
 │    │         │
 │    │         ├── S4 ─── Appels
 │    │         │
 │    │         └── S5 ─── Social & Notifications
 │    │
 │    └── S6 ─── Thèmes & Personnalisation
 │
 ├── S7 ─── Communautés (dépend S2 Chat)
 │
 └── S8 ─── Store & Modules (indépendant mais post-auth)

S9 ─── Desktop Natif (peut démarrer dès S1 terminé)
S10 ── Tests & Build (dernier, tout doit être en place)
```

---

## ⚡ Quick wins (peuvent être intégrés à n'importe quel sprint)

1. **Remplacer les emojis** de la sidebar par des icônes `lucide-react` (déjà installé)
2. **Intégrer `ImuMascot`** du ui-kit sur la page d'accueil
3. **Ajouter les `KawaiiButton`** et `KawaiiCard` pour les actions rapides
4. **Utiliser les `tokens` design** du ui-kit pour les couleurs/espacements
5. **Ajouter le `Spinner`** du ui-kit pour les états de chargement

---

*Document de planification — 8 mars 2026*
*Mis à jour au fur et à mesure de l'avancement*
