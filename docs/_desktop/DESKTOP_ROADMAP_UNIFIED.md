# 🗺️ ROADMAP UNIFIÉE — Desktop App ImuChat

**Source unique de vérité pour le développement desktop**  
**Dernière mise à jour :** 10 juillet 2025  
**Numérotation :** S0→S30 (voir `DESKTOP_INDEX.md` pour la correspondance avec l'ancien système)

---

## 📋 Vue d'ensemble

| Donnée | Valeur |
|--------|--------|
| **Sprints totaux** | 31 (S0→S30) |
| **Durée estimée** | ~60 semaines |
| **Jalon MVP** | S12 (semaine 24) |
| **Jalon App 1.0** | S26 (semaine 52) |
| **Jalon App 2.0** | S30 (semaine 60) |
| **Stack** | Electron 30 · Vite 5 · React 18 · TypeScript 5 |
| **État management** | Zustand 5 |
| **Routing** | React Router 7 |
| **i18n** | i18next + react-i18next |
| **Tests** | Vitest + Testing Library + Playwright |
| **Packages partagés** | @imuchat/ui-kit · @imuchat/shared-types · @imuchat/platform-core |

### Structure du plan

```
Phase A : Setup .................. S0         (0.5 sem)
Phase B : Foundations (MVP) ...... S1→S12     (24 sem)
  ├─ B1 : Architecture & Auth     S1-S2      (4 sem)
  ├─ B2 : Chat Core              S3-S5      (6 sem)
  ├─ B3 : Profil, Settings       S6-S7      (4 sem)
  ├─ B4 : Appels & Natif         S8-S10     (6 sem)
  └─ B5 : Polish & Build         S11-S12    (4 sem)
                                  ─── 🏁 MVP RELEASE ───
Phase C : Features (Post-MVP) ... S13→S30    (36 sem)
  ├─ C1 : UI Kit & Code Sharing  S13-S14    (4 sem)
  ├─ C2 : Store & Économie       S15-S17    (6 sem)
  ├─ C3 : Office & Productivité  S18-S19    (4 sem)
  ├─ C4 : Feed & Social          S20-S21    (4 sem)
  ├─ C5 : IA & Companion         S22-S23    (4 sem)
  ├─ C6 : Sécurité & Perf        S24-S26    (6 sem)
  └─ C7 : Cross-Domain           S27-S30    (8 sem)
                                  ─── 🏁 APP 2.0 COMPLÈTE ───
Phase D : Guardian Angel ........ post-S23   (~24 sem)
  → Roadmap dédiée : ROADMAP_GUARDIAN_ANGEL_DESKTOP.md
  └─ GA-D1→GA-D6 : Sécurité IA, SOS, Carte, Voyage, Famille, Cyber
```

---

## 📊 État actuel (10 juillet 2025)

**Progression globale : ~45% (S0-S13 terminés)**

### Phase A — Setup : ✅ COMPLET
### Phase B — MVP (S1-S12) : ✅ COMPLET — 303 tests · 70.98% coverage
### Phase C — Sprint 13 : ✅ COMPLET — 350 tests · 70.98% coverage

### Highlights S13 — UI Kit Integration
- **Barrel export** `@/components/ui` → re-export complet de @imuchat/ui-kit
- **Switch** migré (3 pages settings)
- **Avatar** migré (5 fichiers, mapping PresenceStatus → AvatarStatus)
- **Button** migré (6+ fichiers, variants primary/secondary/outline/ghost/destructive/link)
- **Input** migré (3 fichiers)
- **Spinner** migré (10 fichiers)
- **ImuMascot** intégré dans OnboardingPage (per-slide states)
- **Modal/Dialog** audité → custom overlays conservés (framer-motion, command palette)
- **lottie-web** mocké dans test setup pour compatibilité jsdom
- **21 fichiers modifiés**, 0 régression

### Highlights S14 — Hooks & Services partagés (platform-core deep integration)
- **lib/platform.ts** singleton factory : EventBus, PresenceModule, NotificationsModule, ContactsModule, PreferencesModule, SearchModule, OfflineSyncModule
- **contexts/PlatformContext.tsx** : PlatformProvider + 7 convenience hooks (miroir web-app pattern)
- **usePresence** → PresenceModule (polling sync 10s, auto AWAY on visibility change)
- **useGlobalSearch** → SearchModule (real indexed search, replaces stub)
- **useNotifications** → NotificationsModule (Socket.IO bridge, dual-write store+module)
- **contacts-service** → ContactsModule (primary) + Supabase fallback
- **auth-service** → EventBus bridge (publishes auth:signed_in/signed_out/signed_up events)
- **useOnboarding** → PreferencesModule + localStorage fallback
- **Tests :** 350/350 ✅ · TypeScript clean

### Ce qui reste (prochain : S15)
- **S15 :** ImuChat Store (catalogue, détail module, installation)
- **S16→S30 :** Wallet, Office, Feed, IA, Sécurité, Cross-Domain

---

## 🔧 PHASE A — SETUP

---

### S0 — Setup & Tooling (0.5 semaine)

**Objectif :** Infrastructure de développement prête, tous les packages partagés intégrés  
**Priorité :** CRITIQUE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 0.1 | Aliases `@/` dans tsconfig + vite | `tsconfig.json`, `vite.config.ts` | P0 |
| 0.2 | Tailwind CSS v4 fonctionnel | `src/styles/globals.css`, `postcss.config.mjs` | P0 |
| 0.3 | `.env.example` avec toutes les variables | `.env.example` | P0 |
| 0.4 | Installer i18next + react-i18next | `package.json` | P0 |
| 0.5 | Configurer react-router-dom (routes vides) | `src/router/index.tsx` | P0 |
| 0.6 | QueryClientProvider (TanStack Query) | `src/App.tsx` | P0 |
| 0.7 | Créer structure de dossiers cible | `src/*/` (voir ARCHITECTURE_GUIDE) | P0 |
| 0.8 | Configurer Vitest + Testing Library | `vitest.config.ts` | P1 |
| 0.9 | electron-builder (AppID, productName) | `electron-builder.json5` | P1 |
| 0.10 | Vérifier imports workspace packages | Build test | P0 |

**Fichiers créés :**
```
src/
├── router/index.tsx
├── i18n/index.ts
├── i18n/locales/{en,fr,ja}.json
├── styles/globals.css
├── lib/utils.ts
├── lib/constants.ts
└── types/electron.d.ts
.env.example
postcss.config.mjs
```

**Critères de validation :**
- `pnpm dev` démarre sans erreur
- Import `@/` fonctionne
- Import `@imuchat/ui-kit` et `@imuchat/shared-types` fonctionne
- Tailwind appliqué
- Router avec pages vides naviguable
- i18n chargé (FR, EN, JA)

---

## 🏗️ PHASE B — FOUNDATIONS (MVP)

---

### B1 — Architecture & Authentification (S1-S2)

---

#### S1 — Architecture de base (Semaines 1-2)

**Objectif :** Structure applicative, router fonctionnel, stores initiaux, layout principal  
**Priorité :** CRITIQUE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 1.1 | React Router — 5 routes skeleton | `src/router/index.tsx` | P0 |
| 1.2 | Layout principal (Sidebar, TopBar, Content) | `src/components/layout/` | P0 |
| 1.3 | Zustand stores (auth, ui, chat) — squelettes | `src/stores/*.ts` | P0 |
| 1.4 | Intégrer @imuchat/shared-types (imports types) | Tous les fichiers | P0 |
| 1.5 | Intégrer @imuchat/ui-kit (ThemeProvider, composants de base) | `src/App.tsx`, composants | P0 |
| 1.6 | Supabase client initialisé | `src/services/supabase.ts` | P0 |
| 1.7 | Error boundary global | `src/components/shared/ErrorBoundary.tsx` | P1 |
| 1.8 | i18n namespaces `common`, `navigation` | `src/i18n/locales/*.json` | P0 |

**Intégrations packages :**
```typescript
// shared-types
import type { User, UserProfile } from '@imuchat/shared-types'

// ui-kit — layout
import { Sidebar, TopBar } from '@imuchat/ui-kit'
import { Button, Card, Spinner, Input } from '@imuchat/ui-kit'
```

**Livrables :** Navigation entre 5 pages vides, layout avec sidebar ui-kit, thème par défaut actif

---

#### S2 — Authentification complète (Semaines 3-4)

**Objectif :** Flux auth complet (login, signup, forgot password), route guards, session persistée  
**Priorité :** CRITIQUE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 2.1 | Auth service (login, signup, logout, refresh) | `src/services/auth-service.ts` | P0 |
| 2.2 | Zustand auth store (persist) | `src/stores/useAuthStore.ts` | P0 |
| 2.3 | Hook useAuth | `src/hooks/useAuth.ts` | P0 |
| 2.4 | Page Login | `src/app/auth/LoginPage.tsx` | P0 |
| 2.5 | Page Signup | `src/app/auth/SignupPage.tsx` | P0 |
| 2.6 | Page Forgot Password | `src/app/auth/ForgotPasswordPage.tsx` | P1 |
| 2.7 | ProtectedRoute component | `src/components/shared/ProtectedRoute.tsx` | P0 |
| 2.8 | Token refresh automatique | `src/services/auth-service.ts` | P0 |
| 2.9 | i18n namespace `auth` (3 langues) | `src/i18n/locales/*.json` | P0 |
| 2.10 | Tests auth (useAuth, login flow) | `src/__tests__/auth.test.ts` | P1 |

**Intégrations packages :**
```typescript
// shared-types
import type { User, UserProfile, AuthState } from '@imuchat/shared-types'

// ui-kit
import { Button, Input, Card, Spinner } from '@imuchat/ui-kit'
import { KawaiiCard, KawaiiInput, KawaiiButton } from '@imuchat/ui-kit'
```

**Livrables :** Login → session → redirect home, Signup → création → redirect, Route guard, Session persistée

**🏁 Milestone M1 :** Architecture stable  
**🏁 Milestone M2 :** Auth fonctionnelle

---

### B2 — Chat Core & Temps Réel (S3-S5)

---

#### S3 — Chat de base (Semaines 5-6)

**Objectif :** Messagerie fonctionnelle avec données réelles Supabase  
**Priorité :** HAUTE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 3.1 | Chat service (CRUD Supabase) | `src/services/chat-service.ts` | P0 |
| 3.2 | Zustand chat store | `src/stores/useChatStore.ts` | P0 |
| 3.3 | Hook useConversations | `src/hooks/useConversations.ts` | P0 |
| 3.4 | Hook useChat (messages) | `src/hooks/useChat.ts` | P0 |
| 3.5 | Page Chat (split panel) | `src/app/chat/ChatPage.tsx` | P0 |
| 3.6 | ConversationList | `src/components/chat/ConversationList.tsx` | P0 |
| 3.7 | ConversationView (messages + input) | `src/app/chat/ConversationView.tsx` | P0 |
| 3.8 | Supabase Realtime basique (new messages) | Chat service | P0 |
| 3.9 | Création de conversation | `src/components/chat/NewConversation.tsx` | P0 |
| 3.10 | Recherche conversations | `src/components/chat/ConversationSearch.tsx` | P1 |
| 3.11 | i18n namespace `chat` | `src/i18n/locales/*.json` | P0 |

**Intégrations packages :**
```typescript
// shared-types
import type { ChatMessage, Conversation, MessageType } from '@imuchat/shared-types'

// ui-kit
import { ChatBubble, ChatInput, MessageList, Avatar, UserAvatar } from '@imuchat/ui-kit'
```

**Livrables :** Liste conversations réelles, Envoi/réception messages, Recherche conversations

---

#### S4 — Chat enrichi & Socket.IO (Semaines 7-8)

**Objectif :** Temps réel avancé, médias, indicateurs de saisie  
**Priorité :** HAUTE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 4.1 | Socket.IO client + SocketContext | `src/services/socket.ts`, `src/contexts/SocketContext.tsx` | P0 |
| 4.2 | Hook useTypingIndicator | `src/hooks/useTypingIndicator.ts` | P0 |
| 4.3 | Read receipts (double check) | Chat service | P0 |
| 4.4 | Envoi médias (images, fichiers) | `src/components/chat/MediaUpload.tsx` | P0 |
| 4.5 | Emoji picker | `src/components/chat/EmojiPicker.tsx` | P1 |
| 4.6 | Link previews | `src/components/chat/LinkPreview.tsx` | P1 |
| 4.7 | Reactions aux messages | `src/components/chat/MessageReactions.tsx` | P1 |
| 4.8 | Message forwarding / reply | `src/components/chat/MessageActions.tsx` | P1 |
| 4.9 | Tests chat (useChat, message sending) | `src/__tests__/chat.test.ts` | P1 |

**Intégrations packages :**
```typescript
// ui-kit
import { TypingIndicator, EmojiReaction, OnlineIndicator } from '@imuchat/ui-kit'

// platform-core
import { EventBus } from '@imuchat/platform-core/client'
```

**Livrables :** Messages temps réel Socket.IO, Typing indicators, Médias, Emojis

---

#### S5 — Contacts & Notifications (Semaines 9-10)

**Objectif :** Gestion contacts avec statut de présence, notifications desktop  
**Priorité :** HAUTE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 5.1 | Contacts service | `src/services/contacts-service.ts` | P0 |
| 5.2 | Zustand contacts store | `src/stores/useContactsStore.ts` | P0 |
| 5.3 | Hook useContacts | `src/hooks/useContacts.ts` | P0 |
| 5.4 | Page Contacts (liste, recherche, ajout) | `src/app/contacts/ContactsPage.tsx` | P0 |
| 5.5 | ContactCard component | `src/components/contacts/ContactCard.tsx` | P0 |
| 5.6 | Friend requests (envoyer/accepter/refuser) | `src/components/contacts/FriendRequest.tsx` | P0 |
| 5.7 | Presence service + hook usePresence | `src/services/presence-service.ts` | P0 |
| 5.8 | Zustand presence store | `src/stores/usePresenceStore.ts` | P0 |
| 5.9 | Notifications service | `src/services/notifications-service.ts` | P0 |
| 5.10 | Zustand notifications store | `src/stores/useNotificationsStore.ts` | P0 |
| 5.11 | Notifications desktop (Electron Notification API) | `electron/notifications.ts` | P0 |
| 5.12 | Notification center UI | `src/app/notifications/NotificationsPage.tsx` | P1 |
| 5.13 | i18n namespaces `contacts`, `notifications` | `src/i18n/locales/*.json` | P0 |

**Intégrations packages :**
```typescript
// shared-types
import type { Contact, FriendRequest, UserProfile } from '@imuchat/shared-types'
import type { NotificationType, NotificationPayload } from '@imuchat/shared-types'

// ui-kit
import { Avatar, UserAvatar, OnlineIndicator, Badge, Card } from '@imuchat/ui-kit'

// platform-core
import { PresenceModule, NotificationsModule, EventBus } from '@imuchat/platform-core/client'
```

**Livrables :** Contacts avec statut online/offline, Friend requests, Notifs desktop natives, Notification center

**🏁 Milestone M3 :** Chat fonctionnel (conversations, contacts, temps réel, notifications)

---

### B3 — Profil, Settings & Thèmes (S6-S7)

---

#### S6 — Profil & Settings (Semaines 11-12)

**Objectif :** Page profil éditable, settings avec tous les onglets  
**Priorité :** MOYENNE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 6.1 | Page Profil | `src/app/profile/ProfilePage.tsx` | P0 |
| 6.2 | Édition profil (avatar, bio, statut) | `src/app/profile/EditProfile.tsx` | P0 |
| 6.3 | Avatar upload (Supabase Storage) | `src/services/storage-service.ts` | P0 |
| 6.4 | Settings page avec tabs | `src/app/settings/SettingsPage.tsx` | P0 |
| 6.5 | Account settings | `src/app/settings/AccountSettings.tsx` | P0 |
| 6.6 | Privacy settings | `src/app/settings/PrivacySettings.tsx` | P1 |
| 6.7 | Notifications settings | `src/app/settings/NotificationSettings.tsx` | P0 |
| 6.8 | Audio/Video settings | `src/app/settings/AudioVideoSettings.tsx` | P1 |
| 6.9 | i18n namespaces `profile`, `settings` | `src/i18n/locales/*.json` | P0 |

**Intégrations packages :**
```typescript
// ui-kit
import { Avatar, Card, Tabs, Switch, Slider } from '@imuchat/ui-kit'
```

---

#### S7 — Thèmes & UI Polish (Semaines 13-14)

**Objectif :** 7 thèmes actifs, animations, responsive desktop  
**Priorité :** MOYENNE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 7.1 | Intégration complète 7 thèmes ui-kit | `src/contexts/ThemeContext.tsx` | P0 |
| 7.2 | ThemeSelector component | `src/components/settings/ThemeSelector.tsx` | P0 |
| 7.3 | Appearance settings (thème, langue, density) | `src/app/settings/AppearanceSettings.tsx` | P0 |
| 7.4 | Zustand preferences store (persist) | `src/stores/usePreferencesStore.ts` | P0 |
| 7.5 | Animation system (framer-motion) | `src/lib/animations.ts` | P1 |
| 7.6 | Responsive desktop layouts (fenêtre resize) | Layout composants | P1 |
| 7.7 | Language switcher | Intégré AppearanceSettings | P0 |
| 7.8 | Home page refactored (données réelles) | `src/app/home/HomePage.tsx` | P0 |

**Intégrations packages :**
```typescript
// ui-kit
import { themes, applyTheme, ThemeSelector } from '@imuchat/ui-kit/themes'
import { LanguageSwitcher } from '@imuchat/ui-kit/i18n'

// platform-core
import { ThemeModule, PreferencesModule } from '@imuchat/platform-core/client'
```

**Livrables :** 7 thèmes actifs, Settings complets, Language switcher, Animations fluides

---

### B4 — Appels & Intégration Native (S8-S10)

---

#### S8 — Appels Audio/Vidéo (Semaines 15-16)

**Objectif :** Appels 1:1 audio et vidéo fonctionnels  
**Priorité :** HAUTE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 8.1 | Calls service (Stream.io SDK ou WebRTC) | `src/services/calls-service.ts` | P0 |
| 8.2 | Page Appels (historique + lancer) | `src/app/calls/CallsPage.tsx` | P0 |
| 8.3 | CallView (UI en cours d'appel) | `src/app/calls/CallView.tsx` | P0 |
| 8.4 | VideoGrid component | `src/components/calls/VideoGrid.tsx` | P0 |
| 8.5 | CallControls (mute, camera, hangup) | `src/components/calls/CallControls.tsx` | P0 |
| 8.6 | CallNotification (appel entrant) | `src/components/calls/CallNotification.tsx` | P0 |
| 8.7 | Call history | `src/app/calls/CallHistory.tsx` | P1 |
| 8.8 | i18n namespace `calls` | `src/i18n/locales/*.json` | P0 |

**Intégrations packages :**
```typescript
// shared-types
import type { Call, CallType, CallStatus } from '@imuchat/shared-types'

// platform-core
import { CallsModule } from '@imuchat/platform-core/client'
```

**Livrables :** Appel audio 1:1, Appel vidéo HD, Contrôles, Notification appel entrant, Historique

---

#### S9 — Screen Share & Desktop Integration (Semaines 17-18)

**Objectif :** Partage d'écran natif, intégration OS  
**Priorité :** MOYENNE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 9.1 | Screen share via desktopCapturer | `src/hooks/useScreenShare.ts` | P0 |
| 9.2 | Window picker (choisir fenêtre/écran) | `src/components/calls/WindowPicker.tsx` | P0 |
| 9.3 | Overlay partage d'écran | `src/components/calls/ShareOverlay.tsx` | P1 |
| 9.4 | Tray icon + context menu | `electron/tray.ts` | P0 |
| 9.5 | Deep links (imuchat://) | `electron/deeplinks.ts` | P0 |
| 9.6 | Global keyboard shortcuts | `electron/shortcuts.ts` | P1 |
| 9.7 | Fenêtre PiP pour appels | `electron/pip-window.ts` | P1 |
| 9.8 | Custom title bar (frameless option) | `src/components/electron/TitleBar.tsx` | P1 |

---

#### S10 — Fichiers, Drag & Drop & OS (Semaines 19-20)

**Objectif :** Gestion fichiers native, auto-updater, intégration OS complète  
**Priorité :** MOYENNE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 10.1 | Drag & drop fichiers (natif OS → app) | `src/hooks/useDragDrop.ts` | P0 |
| 10.2 | File manager de base | `src/app/files/FilesPage.tsx` | P0 |
| 10.3 | Upload fichiers (Supabase Storage) | `src/services/storage-service.ts` | P0 |
| 10.4 | Auto-updater (electron-updater) | `electron/updater.ts` | P0 |
| 10.5 | Splash screen | `electron/splash.ts` | P1 |
| 10.6 | Menu natif Electron | `electron/menu.ts` | P1 |
| 10.7 | Badge de notification (dock/taskbar) | `electron/badge.ts` | P1 |

---

### B5 — Polish, Tests & Distribution (S11-S12)

---

#### S11 — i18n, Onboarding & Recherche (Semaines 21-22)

**Objectif :** Internationalisation complète, onboarding, recherche globale  
**Priorité :** MOYENNE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 11.1 | i18n complet — 7 langues (FR, EN, JA, ES, AR, ZH, PT) | `src/i18n/locales/*.json` | P0 |
| 11.2 | Vérifier 0 string hardcodée | Audit tous fichiers | P0 |
| 11.3 | Onboarding wizard (premier lancement) | `src/app/onboarding/OnboardingPage.tsx` | P0 |
| 11.4 | Recherche globale (conversations, contacts, messages) | `src/components/shared/GlobalSearch.tsx` | P0 |
| 11.5 | Raccourcis clavier visibles | `src/components/shared/KeyboardShortcuts.tsx` | P1 |
| 11.6 | Accessibilité audit (ARIA, focus, contrast) | Tous les composants | P1 |

---

#### S12 — Tests & Build (Semaines 23-24)

**Objectif :** Couverture tests >70%, builds multi-OS, CI/CD  
**Priorité :** HAUTE

| # | Tâche | Fichiers | Priorité |
|---|-------|----------|:--------:|
| 12.1 | Tests unitaires Vitest (>70% coverage) | `src/__tests__/` | P0 |
| 12.2 | Tests composants (Testing Library) | `src/__tests__/components/` | P0 |
| 12.3 | Tests E2E (Playwright + Electron) | `e2e/` | P0 |
| 12.4 | CI/CD pipeline GitHub Actions | `.github/workflows/desktop.yml` | P0 |
| 12.5 | Build macOS (DMG) | `electron-builder.json5` | P0 |
| 12.6 | Build Windows (NSIS) | `electron-builder.json5` | P0 |
| 12.7 | Build Linux (AppImage) | `electron-builder.json5` | P0 |
| 12.8 | Code signing (macOS notarization, Windows) | Certificates config | P1 |
| 12.9 | Coverage report intégré CI | `vitest.config.ts` | P1 |

**Livrables :** Builds signés 3 OS, Tests >70% coverage, CI/CD fonctionnel, Installeurs distribués

**🏁 Milestone M4 :** MVP Desktop Release

---

## 🚀 PHASE C — FEATURES (POST-MVP)

---

### C1 — UI Kit & Code Sharing (S13-S14)

---

#### S13 — UI Kit Integration complète ✅ (Semaines 25-26)

**Objectif :** Tous les composants ui-kit intégrés, Storybook desktop  
**Priorité :** HAUTE  
**Statut :** ✅ COMPLET — 350 tests · 70.98% coverage · 21 fichiers migrés

| # | Tâche | Fichiers | État |
|---|-------|----------|:----:|
| 13.1 | Audit composants ui-kit non encore utilisés | Matrice (voir REUSE_MATRIX) | ✅ |
| 13.2 | Intégrer composants restants (Switch, Avatar, Button, Input, Spinner) | 21 fichiers | ✅ |
| 13.3 | Design tokens ui-kit appliqués (via CSS variables ui-kit) | Composants migrés | ✅ |
| 13.4 | Storybook desktop (configuration Electron) | `.storybook/` | ❌ reporté |
| 13.5 | Composants Kawaii intégrés (ImuMascot OnboardingPage) | `OnboardingPage.tsx` | ✅ |
| 13.6 | Migration composants locaux → ui-kit | 21 remplacements | ✅ |

**Fichiers modifiés :** NotificationSettings, PrivacySettings, AudioVideoSettings, ContactCard, FriendRequest, ContactsPage, CallNotification, VideoGrid, ErrorBoundary, OnboardingPage, FilesPage, ConversationSearch, NewConversation, router/index, CallHistory, ProfilePage, EditProfile, ProtectedRoute, GuestRoute, ConversationList, WindowPicker

---

#### S14 — Hooks & Services partagés (Semaines 27-28) ✅ COMPLÉTÉ

**Objectif :** Partage maximal de code entre web et desktop  
**Priorité :** HAUTE  
**Résultat :** 350/350 tests ✅ · TSC clean · 8 hooks/services migrés vers platform-core

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| 14.1 | Extraire hooks partagables vers shared package | `src/hooks/` | ✅ |
| 14.2 | Service layer adaptation (web → desktop) | `src/services/` | ✅ |
| 14.3 | Platform-core deep integration (21 modules) | Tous services | ✅ |
| 14.4 | Audit de duplication web↔desktop | Rapport | ✅ |
| 14.5 | Patterns de code communs documentés | Docs | ✅ |

**Détails d'implémentation :**
- **Infrastructure :** `lib/platform.ts` (singleton factory) + `contexts/PlatformContext.tsx` (Provider + 7 convenience hooks) + `App.tsx` wiring
- **P1 Migrations :** usePresence → PresenceModule, useGlobalSearch → SearchModule (real indexing replaces stub), useNotifications → NotificationsModule (Socket.IO bridge)
- **P2 Migrations :** contacts-service → ContactsModule (module primary + Supabase fallback), auth-service → EventBus bridge (publishes auth:* events), useOnboarding → PreferencesModule (localStorage fallback)
- **Pattern 3 couches (miroir web-app) :** Layer 1 singleton factory → Layer 2 React context → Layer 3 convenience hooks
- **Hooks/services inchangés (justifiés) :** useDragDrop, useWindowSize (UI-pure), useScreenShare/screen-share-service (Electron-only), calls-service (WebRTC custom), storage-service, profile-service (pas d'équivalent platform-core)

**🏁 Milestone M5 :** UI Kit complet, code sharing optimisé

---

### C2 — Store, Wallet & Gamification (S15-S17)

---

#### S15 — ImuChat Store (Semaines 29-30) ✅

**Objectif :** Store de modules fonctionnel  
**Réf. 50F :** Groupe 10 — Store & Écosystème

| # | Tâche | Fichiers | Statut |
|---|-------|----------|--------|
| 15.1 | Store service (API catalogue) | `src/services/store-service.ts` | ✅ |
| 15.2 | StorePage (browse, search, categories) | `src/app/store/StorePage.tsx` | ✅ |
| 15.3 | Module detail page | `src/app/store/ModuleDetailPage.tsx` | ✅ |
| 15.4 | Module install/uninstall | `src/hooks/useModules.ts` + `src/stores/useModulesStore.ts` | ✅ |
| 15.5 | Module registry (dynamic loading) | `src/contexts/ModulesContext.tsx` | ✅ |
| 15.6 | Manifests modules core | `src/modules/{games,music,weather,notes,translator}/manifest.json` | ✅ |

**Extras :** Routes store ajoutées (`/store`, `/store/:moduleId`), Sidebar navigation (🏪), i18n 7 langues (40 clés store.*)

**Tests :** 350/350 ✅ · 27 fichiers  
**🏁 Milestone M6 :** Store opérationnel ✅

---

#### S16 — Wallet & Paiements (Semaines 31-32)

**Objectif :** Wallet intégré, transactions, moyens de paiement  
**Réf. 50F :** Groupe 8 — Économie virtuelle (ImuCoins)

| # | Tâche | Fichiers | Status |
|---|-------|----------|--------|
| 16.1 | Wallet service | `src/services/wallet-service.ts` | ✅ |
| 16.2 | WalletPage | `src/app/wallet/WalletPage.tsx` | ✅ |
| 16.3 | Transaction history | `src/app/wallet/TransactionsPage.tsx` | ✅ |
| 16.4 | Payment methods (Stripe integration) | `src/services/payment-service.ts` | ✅ |
| 16.5 | ImuCoins affichage + achats | `src/stores/useWalletStore.ts` + `src/hooks/useWallet.ts` + `src/app/wallet/TransferPage.tsx` | ✅ |

**Extras :** Routes wallet ajoutées (`/wallet`, `/wallet/transactions`, `/wallet/transfer`), Sidebar navigation (💰), i18n 7 langues (~45 clés wallet.*)

**Tests :** 350/350 ✅ · 27 fichiers
**🏁 Milestone M7 :** Wallet & Paiements opérationnel ✅

---

#### S17 — Gamification & Communautés (Semaines 33-34)

**Objectif :** Points, badges, niveaux + création de communautés  
**Réf. 50F :** Groupes 5 & 9

| # | Tâche | Fichiers | Status |
|---|-------|----------|--------|
| 17.1 | Gamification service | `src/services/gamification-service.ts` | ✅ |
| 17.2 | Points/Badges/Levels UI | `src/components/gamification/` | ✅ |
| 17.3 | Communities service | `src/services/communities-service.ts` | ✅ |
| 17.4 | CommunitiesPage (serveurs, channels) | `src/app/communities/` | ✅ |
| 17.5 | Community creation wizard | `src/app/communities/CreateCommunityPage.tsx` | ✅ |
| 17.6 | Mini-apps platform base | `src/services/miniapps-service.ts` | ✅ |

**Extras :** routes (gamification, communities, communities/create, communities/:serverId), sidebar (🎮 Gamification, 🏰 Communautés), i18n 7 locales  
**Tests :** 350/350 ✅  
**🏁 Milestone M7 — Store, Wallet, Gamification & Communities DONE**

---

### C3 — Office & Productivité (S18-S19)

---

#### S18 — Imu Office Desktop (Semaines 35-36)

**Objectif :** Suite bureautique desktop-optimized  
**Réf. 50F :** Groupe 6 — Suite bureautique

| # | Tâche | Fichiers |
|---|-------|----------|
| 18.1 | Document editor (collaborative) | `src/app/office/DocumentEditor.tsx` |
| 18.2 | Spreadsheet basique | `src/app/office/SpreadsheetEditor.tsx` |
| 18.3 | Slides/Présentation | `src/app/office/SlidesEditor.tsx` |
| 18.4 | Local file system access (Electron APIs) | `electron/file-access.ts` |
| 18.5 | Auto-save + sync cloud | Services office |

**🏁 Milestone M7 :** Office intégré

---

#### S19 — File Manager & Tasks (Semaines 37-38)

**Objectif :** Gestionnaire fichiers avancé, Kanban, calendrier

| # | Tâche | Fichiers |
|---|-------|----------|
| 19.1 | Advanced file browser (arborescence) | `src/app/files/FileBrowser.tsx` |
| 19.2 | File preview (images, PDF, code) | `src/components/files/FilePreview.tsx` |
| 19.3 | Task/Kanban board | `src/app/tasks/TaskBoard.tsx` |
| 19.4 | Calendar integration | `src/app/calendar/CalendarPage.tsx` |
| 19.5 | File sharing (liens) | Services fichiers |

---

### C4 — Feed & Social (S20-S21)

---

#### S20 — ImuFeed (Semaines 39-40)

**Objectif :** Feed social complet  
**Réf. 50F :** Groupe 5 — Mini-apps sociales

| # | Tâche | Fichiers |
|---|-------|----------|
| 20.1 | Feed service | `src/services/feed-service.ts` |
| 20.2 | Feed timeline | `src/app/feed/FeedPage.tsx` |
| 20.3 | Create post (texte, image, vidéo) | `src/components/feed/CreatePost.tsx` |
| 20.4 | Comments / likes / share | `src/components/feed/PostActions.tsx` |
| 20.5 | Stories viewer & creation | `src/app/feed/StoriesPage.tsx` |

**🏁 Milestone M8 :** Feed lancé

---

#### S21 — Profil Social & Events (Semaines 41-42)

**Objectif :** Profil social étendu, événements

| # | Tâche | Fichiers |
|---|-------|----------|
| 21.1 | Extended profile (portfolio, médias) | `src/app/profile/ExtendedProfile.tsx` |
| 21.2 | Events calendar | `src/app/events/EventsPage.tsx` |
| 21.3 | Event creation/RSVP | `src/app/events/CreateEvent.tsx` |
| 21.4 | Location/map features | `src/components/shared/MapView.tsx` |
| 21.5 | Activity feed | `src/components/social/ActivityFeed.tsx` |

---

### C5 — IA & Companion (S22-S23)

---

#### S22 — Alice IA (Semaines 43-44)

**Objectif :** Assistant intelligent contextuel  
**Réf. 50F :** Groupe 7 — IA & Companion

| # | Tâche | Fichiers |
|---|-------|----------|
| 22.1 | Alice IA service (API LLM) | `src/services/alice-service.ts` |
| 22.2 | Alice chat UI | `src/app/alice/AlicePage.tsx` |
| 22.3 | Context-aware suggestions | `src/hooks/useAliceSuggestions.ts` |
| 22.4 | Content generation (messages, posts) | Services Alice |
| 22.5 | Smart search (semantic) | `src/components/shared/SmartSearch.tsx` |

**🏁 Milestone M9 :** IA active

---

#### S23 — Companion Live2D — Phase initiale (Semaines 45-46)

**Objectif :** Companion animé avec états émotionnels basiques  
**Détail :** Voir `IMUCOMPANION_ROADMAP_DESKTOP.md` (phases IC-D1 à IC-D3)

| # | Tâche | Fichiers |
|---|-------|----------|
| 23.1 | Live2D renderer (pixi-live2d-display) | `src/modules/companion/renderer/` |
| 23.2 | Companion IPC bridge | `electron/companion-ipc.ts` |
| 23.3 | FSM états émotionnels (happy, sad, thinking) | `src/modules/companion/fsm/` |
| 23.4 | AI connector (LLM responses → emotions) | `src/modules/companion/ai/` |
| 23.5 | Companion widget (fenêtre flottante) | `electron/companion-window.ts` |
| 23.6 | OS integration (notifications, idle detection) | `electron/os-integration.ts` |

---

### C6 — Sécurité, Performance & Native Avancé (S24-S26)

---

#### S24 — Sécurité Electron (Semaines 47-48)

**Objectif :** Sécurisation complète de l'application Electron  
**Priorité :** HAUTE

| # | Tâche | Fichiers |
|---|-------|----------|
| 24.1 | CSP (Content Security Policy) stricte | `electron/main.ts` |
| 24.2 | IPC security audit (whitelist channels) | `electron/preload.ts` |
| 24.3 | Sandboxing renderer processes | `electron/main.ts` |
| 24.4 | Secure storage (keytar / safeStorage) | `electron/secure-storage.ts` |
| 24.5 | Protocol handler sécurisé | `electron/protocol.ts` |
| 24.6 | Dependency audit (npm audit) | CI/CD |

**🏁 Milestone M10 :** Sécurité validée

---

#### S25 — Performance (Semaines 49-50)

**Objectif :** Optimisation mémoire, rendu, temps de démarrage

| # | Tâche | Fichiers |
|---|-------|----------|
| 25.1 | Virtual scrolling (listes longues) | `src/hooks/useVirtualList.ts` |
| 25.2 | Lazy loading pages (React.lazy + Suspense) | `src/router/index.tsx` |
| 25.3 | Memory optimization (profiling, leaks) | Audit mémoire |
| 25.4 | Image optimization (thumbnails, cache) | `src/services/image-service.ts` |
| 25.5 | Cold start optimization (<2s) | `electron/main.ts` |
| 25.6 | Bundle analysis + tree shaking | Vite config |

---

#### S26 — Natif Avancé & Distribution (Semaines 51-52)

**Objectif :** Fonctionnalités natives avancées, distribution complète

| # | Tâche | Fichiers |
|---|-------|----------|
| 26.1 | Auto-update channels (stable, beta, nightly) | `electron/updater.ts` |
| 26.2 | Crash reporting (Sentry Electron) | `electron/crash-reporter.ts` |
| 26.3 | Installer enhancements (associations de fichiers) | `electron-builder.json5` |
| 26.4 | Touch Bar (macOS) | `electron/touchbar.ts` |
| 26.5 | Native menus contextuels avancés | `electron/context-menu.ts` |
| 26.6 | Telemetry opt-in | `src/services/telemetry-service.ts` |

**🏁 Milestone M11 :** App 1.0 Core

---

### C7 — Cross-Domain Integrations (S27-S30)

---

#### S27 — Gaming Hub (Semaines 53-54)

**Réf. 50F :** Groupe 9 — Gaming

| # | Tâche | Fichiers |
|---|-------|----------|
| 27.1 | Mini-games framework | `src/modules/gaming/` |
| 27.2 | Game launcher | `src/app/gaming/GamingHub.tsx` |
| 27.3 | Leaderboards | `src/app/gaming/Leaderboards.tsx` |
| 27.4 | Achievements intégration gamification | Services gaming |

---

#### S28 — ImuArena (Semaines 55-56)

**Objectif :** Tournois et compétitions temps réel

| # | Tâche | Fichiers |
|---|-------|----------|
| 28.1 | Tournament system | `src/services/arena-service.ts` |
| 28.2 | ArenaPage | `src/app/arena/ArenaPage.tsx` |
| 28.3 | Match making | `src/services/matchmaking-service.ts` |
| 28.4 | Live spectating | `src/app/arena/SpectatorView.tsx` |

---

#### S29 — Finance Hub (Semaines 57-58)

**Réf. 50F :** Groupe 8 — Économie / Finance

| # | Tâche | Fichiers |
|---|-------|----------|
| 29.1 | Budget tools | `src/app/finance/BudgetPage.tsx` |
| 29.2 | Analytics dashboard | `src/app/finance/AnalyticsPage.tsx` |
| 29.3 | Savings goals | `src/app/finance/GoalsPage.tsx` |
| 29.4 | Reports export | `src/services/reports-service.ts` |

---

#### S30 — Companion Full (Semaines 59-60)

**Objectif :** ImuCompanion complet — personnalité, TTS, features desktop-only  
**Détail :** Voir `IMUCOMPANION_ROADMAP_DESKTOP.md` (phases IC-D4 à IC-D6)

| # | Tâche | Fichiers |
|---|-------|----------|
| 30.1 | TTS (Text-to-Speech) + lip sync | `src/modules/companion/tts/` |
| 30.2 | Personality system complet | `src/modules/companion/personality/` |
| 30.3 | Custom models (accessoires, skins) | `src/modules/companion/models/` |
| 30.4 | Desktop-only features (widget flottant, réactions OS) | `electron/companion-native.ts` |
| 30.5 | Companion marketplace | `src/app/store/CompanionStore.tsx` |
| 30.6 | Age-segmented comportements | `src/modules/companion/segmentation/` |

**🏁 Milestone M12 :** App 2.0 Complète

---

## 🏁 Jalons récapitulatifs

| Jalon | Sprint | Semaine | Critère de validation |
|-------|:------:|:-------:|----------------------|
| M1 — Architecture stable | S1 | 2 | Router + stores + layout + packages intégrés |
| M2 — Auth fonctionnelle | S2 | 4 | Login/signup/logout/refresh, route guards |
| M3 — Chat fonctionnel | S5 | 10 | Conversations, contacts, temps réel, notifs |
| M4 — **MVP Desktop** | S12 | 24 | Chat + auth + profil + appels + thèmes + i18n + builds 3 OS |
| M5 — UI Kit complet | S14 | 28 | 100% composants ui-kit intégrés, code sharing optimisé |
| M6 — Store opérationnel | S15 | 30 | Store browse, install, uninstall modules |
| M7 — Office intégré | S18 | 36 | Docs, spreadsheet, slides, accès fichiers local |
| M8 — Feed lancé | S20 | 40 | Timeline, posts, stories, comments |
| M9 — IA active | S22 | 44 | Alice chat, suggestions, content generation |
| M10 — Sécurité validée | S24 | 48 | CSP, IPC audit, sandboxing, audit dépendances |
| M11 — **App 1.0 Core** | S26 | 52 | Perf optimisée, distribution avancée, crash reporting |
| M12 — **App 2.0 Complète** | S30 | 60 | Gaming + Arena + Finance + Companion Full |
| M13 — **Guardian Angel** | post-S23 | — | Module sécurité IA — voir `ROADMAP_GUARDIAN_ANGEL_DESKTOP.md` |

---

## 📈 KPIs cibles

### Performance

| Métrique | Cible | Mesuré à |
|----------|:-----:|:--------:|
| First Contentful Paint | <2s | S12 |
| Time to Interactive | <3s | S12 |
| Mémoire idle | <200 MB | S25 |
| CPU idle | <1% | S25 |
| Cold start | <3s | S25 |

### Qualité

| Métrique | Cible | Mesuré à |
|----------|:-----:|:--------:|
| Coverage tests | >70% | S12, puis continu |
| Crash rate | 0% | S26 |
| Accessibilité (WCAG) | >90 | S11 |
| Strings hardcodées | 0 | S11 |

### Chat

| Métrique | Cible | Mesuré à |
|----------|:-----:|:--------:|
| Latence messages | <100ms | S4 |
| Uptime temps réel | 99.9% | S4 |
| Reconnexion Socket.IO | <3s | S4 |

### UX

| Métrique | Cible | Mesuré à |
|----------|:-----:|:--------:|
| Thèmes actifs | 7/7 | S7 |
| Langues i18n | 7 | S11 |
| Score réutilisation packages | >95% | S14 |

---

## ⚠️ Risques & Mitigations

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|:------:|:-----------:|------------|
| R1 | Complexité WebRTC desktop | 🔴 | Moyenne | Utiliser Stream.io SDK ; fallback audio-only |
| R2 | Mémoire Electron (>500MB) | 🔴 | Haute | Profilage continu ; virtual scrolling ; lazy loading |
| R3 | Breaking changes packages partagés | 🟡 | Moyenne | Semantic versioning strict ; CI/CD avec tests cross-package |
| R4 | Sécurité IPC / contextBridge | 🔴 | Basse | Whitelist channels IPC ; audit S24 ; pas de nodeIntegration |
| R5 | Builds cross-platform (3 OS) | 🟡 | Moyenne | CI/CD avec runners macOS/Windows/Linux |
| R6 | Taille équipe insuffisante | 🟡 | Haute | Réutilisation maximale packages ; priorisation sprints |
| R7 | Migration Live2D desktop | 🟡 | Moyenne | POC dès S23 ; fallback image statique |
| R8 | Tests E2E Electron | 🟡 | Moyenne | Playwright Electron ; snapshots visuels |
| R9 | Auto-update fiabilité | 🟡 | Basse | Channels stable/beta/nightly ; rollback automatique |
| R10 | Store module sandbox | 🟡 | Moyenne | iframe isolé ; CSP strict par module |
| R11 | Office suite complexité | 🔴 | Haute | Commencer par éditeur texte seul ; itérer |
| R12 | Socket.IO reconnection Electron | 🟡 | Moyenne | Heartbeat + reconnection automatique ; offline-first |

---

## 👥 Équipe & Scaling

| Période | Sprints | Développeurs | Focus |
|---------|:-------:|:------------:|-------|
| Q1 (mois 1-3) | S0→S6 | 2 | Architecture, Auth, Chat, Contacts |
| Q2 (mois 4-6) | S7→S12 | 2 | Thèmes, Appels, Natif, Tests → **MVP** |
| Q3 (mois 7-9) | S13→S18 | 3 | UI Kit, Store, Wallet, Office |
| Q4 (mois 10-12) | S19→S24 | 3 | Feed, Social, IA, Sécurité |
| Q5 (mois 13-15) | S25→S30 | 4 | Perf, Natif avancé, Gaming, Companion |

---

## 🔗 Dépendances inter-sprints

```
S0 ─── Setup & Tooling
 │
 ├── S1 ─── Architecture de base
 │    │
 │    └── S2 ─── Auth complète
 │         │
 │         ├── S3 ─── Chat de base
 │         │    │
 │         │    └── S4 ─── Chat enrichi (Socket.IO)
 │         │         │
 │         │         └── S5 ─── Contacts & Notifications
 │         │              │
 │         │              ├── S8 ─── Appels audio/vidéo
 │         │              │    │
 │         │              │    └── S9 ─── Screen Share & Desktop
 │         │              │
 │         │              └── S20 ─── Feed (post-MVP)
 │         │
 │         ├── S6 ─── Profil & Settings
 │         │    │
 │         │    └── S7 ─── Thèmes & UI Polish
 │         │
 │         ├── S10 ─── Fichiers & D&D
 │         │    │
 │         │    └── S19 ─── File Manager avancé (post-MVP)
 │         │
 │         └── S15 ─── Store (post-MVP)
 │              │
 │              └── S16 ─── Wallet
 │
 ├── S11 ─── i18n & Onboarding (dépend S1-S10)
 │
 └── S12 ─── Tests & Build (dépend tout)

S13-S14 ─── UI Kit & Code Sharing (parallélisable post-MVP)
S17 ─── Gamification & Communautés (dépend S5+S15)
S18 ─── Office (dépend S10)
S21 ─── Profil Social (dépend S6+S20)
S22 ─── Alice IA (indépendant, post S2)
S23 ─── Companion (dépend S22)
S24-S26 ─── Sécurité/Perf/Natif (post S12)
S27-S30 ─── Cross-Domain (dépend S15+S17)
```

---

## 📊 Métriques de suivi par sprint

### Phase B — Foundations (suivi détaillé)

| Sprint | Pages | Composants | Services | Hooks | Stores | i18n keys | Tests |
|:------:|:-----:|:----------:|:--------:|:-----:|:------:|:---------:|:-----:|
| S0 | 0 | 0 | 0 | 0 | 0 | ~30 | 0 |
| S1 | 0 | 4 | 1 | 0 | 3 | ~20 | 0 |
| S2 | 3 | 2 | 1 | 1 | 0 | ~50 | 5 |
| S3 | 2 | 4 | 1 | 2 | 1 | ~40 | 5 |
| S4 | 0 | 5 | 0 | 1 | 0 | ~20 | 4 |
| S5 | 2 | 3 | 3 | 3 | 3 | ~50 | 5 |
| S6 | 5 | 2 | 1 | 0 | 0 | ~60 | 4 |
| S7 | 1 | 3 | 0 | 0 | 1 | ~30 | 3 |
| S8 | 3 | 4 | 1 | 0 | 0 | ~30 | 4 |
| S9 | 0 | 3 | 0 | 1 | 0 | ~10 | 3 |
| S10 | 1 | 2 | 1 | 1 | 0 | ~15 | 3 |
| S11 | 2 | 2 | 0 | 0 | 0 | ~200 | 3 |
| S12 | 0 | 0 | 0 | 0 | 0 | 0 | 50+ |
| **Total B** | **19** | **34** | **9** | **9** | **8** | **~555** | **89** |

### Phase C — Features (estimations)

| Sprint | Pages | Composants | Services | Total items |
|:------:|:-----:|:----------:|:--------:|:-----------:|
| S13-S14 | 2 | 10+ | 2 | ~15 |
| S15-S17 | 8 | 12 | 5 | ~30 |
| S18-S19 | 6 | 8 | 3 | ~20 |
| S20-S21 | 5 | 10 | 3 | ~20 |
| S22-S23 | 3 | 8 | 3 | ~18 |
| S24-S26 | 1 | 5 | 4 | ~15 |
| S27-S30 | 8 | 12 | 5 | ~30 |
| **Total C** | **33** | **65** | **25** | **~148** |

---

## 📚 Référence aux 50 Fonctionnalités

Mapping entre les groupes du document `50_FONCTIONNALITIES_SCREENS.md` et les sprints :

| Groupe | Fonctionnalités | Sprint(s) |
|--------|----------------|:---------:|
| G1 — Messagerie & Communication | Chat, messages, conversations | S3, S4 |
| G2 — Appels audio/vidéo | Appels, screen share, PiP | S8, S9 |
| G3 — Profils & Identité | Auth, profil, settings | S2, S6 |
| G4 — Personnalisation avancée | Thèmes, langues, preferences | S7 |
| G5 — Mini-apps sociales | Feed, stories, communautés | S17, S20, S21 |
| G6 — Suite bureautique (Imu Office) | Docs, spreadsheet, slides | S18 |
| G7 — IA & Companion | Alice, Live2D companion | S22, S23, S30 |
| G8 — Économie virtuelle | Wallet, ImuCoins, finance | S16, S29 |
| G9 — Gaming | Gaming hub, ImuArena | S27, S28 |
| G10 — Store & Écosystème | Store, modules, mini-apps | S15 |

---

## ⚡ Quick wins (intégrables à tout sprint)

1. Remplacer les emojis de sidebar par `lucide-react` icons (déjà installé)
2. Intégrer `ImuMascot` du ui-kit sur la page d'accueil
3. Utiliser `KawaiiButton` et `KawaiiCard` pour les actions principales
4. Appliquer les design tokens ui-kit pour couleurs/espacements
5. Ajouter le `Spinner` ui-kit pour les états de chargement
6. Importer les types `@imuchat/shared-types` pour tout typage

---

*Ce document est la source unique de vérité pour le développement desktop.*  
*Il remplace et consolide les documents suivants : ROADMAP_DESKTOP_GLOBAL, ROADMAP_DESKTOP_FOUNDATIONS, ROADMAP_DESKTOP_FEATURES_NATIVE, DESKTOP_APP_DEVELOPMENT_TRACKER, DESKTOP_SPRINT_PLAN.*  
*Créé le 8 mars 2026*
