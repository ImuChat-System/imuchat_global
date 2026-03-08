# 🏛️ GUIDE D'ARCHITECTURE — Desktop App ImuChat

**Date :** 8 mars 2026  
**Objectif :** Définir l'architecture technique de la desktop-app en réutilisant au maximum les packages partagés  
**Hiérarchie :** Ce document fait partie de la documentation desktop (voir `DESKTOP_INDEX.md`)  
**Planning :** Voir `DESKTOP_ROADMAP_UNIFIED.md` pour le calendrier d'implémentation

---

## 📐 Architecture générale

```
┌──────────────────────────────────────────────────────────────┐
│                    ELECTRON (Main Process)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Tray     │  │ Auto-    │  │ Deep     │  │ Native       │ │
│  │ Icon     │  │ Updater  │  │ Links    │  │ Notifications│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ IPC Bridge (preload.ts → contextBridge)                  │ │
│  └──────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                 RENDERER (React + Vite)                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    App Providers                         │ │
│  │  QueryClientProvider → AuthProvider → ThemeProvider      │ │
│  │  → I18nProvider → SocketProvider → RouterProvider        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌───────────┐  ┌────────────────────────────────────────┐  │
│  │  Sidebar  │  │              Router Outlet              │  │
│  │  (nav)    │  │   ┌──────┐ ┌──────┐ ┌──────┐          │  │
│  │           │  │   │ Home │ │ Chat │ │ Calls│ ...       │  │
│  │           │  │   └──────┘ └──────┘ └──────┘          │  │
│  └───────────┘  └────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 Services / Hooks / Stores                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │ │
│  │  │ Supabase │ │ Socket   │ │ Zustand  │ │ React     │ │ │
│  │  │ Client   │ │ Client   │ │ Stores   │ │ Query     │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Packages partagés                           │ │
│  │  @imuchat/ui-kit    │ @imuchat/shared-types              │ │
│  │  @imuchat/platform-core/client                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure de fichiers cible

```
desktop-app/
├── electron/                          # Electron main process
│   ├── main.ts                        # Point d'entrée Electron
│   ├── preload.ts                     # IPC bridge (contextBridge)
│   ├── electron-env.d.ts              # Types Electron
│   ├── tray.ts                        # Tray icon + menu
│   ├── updater.ts                     # Auto-updater
│   ├── deeplinks.ts                   # Deep links handler
│   └── notifications.ts              # Notifications natives OS
│
├── src/
│   ├── main.tsx                       # Point d'entrée React
│   ├── App.tsx                        # Composition des providers + router
│   │
│   ├── app/                           # Pages (routes)
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Layout principal (sidebar + outlet)
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   ├── TitleBar.tsx           # Barre de titre custom (frameless)
│   │   │   └── StatusBar.tsx          # Barre de statut
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── home/
│   │   │   └── HomePage.tsx
│   │   ├── chat/
│   │   │   ├── ChatPage.tsx           # Split panel (list + conversation)
│   │   │   ├── ConversationView.tsx
│   │   │   └── ChatSettings.tsx
│   │   ├── calls/
│   │   │   ├── CallsPage.tsx
│   │   │   ├── CallView.tsx
│   │   │   └── CallHistory.tsx
│   │   ├── contacts/
│   │   │   ├── ContactsPage.tsx
│   │   │   └── ContactProfile.tsx
│   │   ├── communities/
│   │   │   ├── CommunitiesPage.tsx
│   │   │   ├── ServerView.tsx
│   │   │   └── ChannelView.tsx
│   │   ├── social/
│   │   │   ├── FeedPage.tsx
│   │   │   └── StoriesPage.tsx
│   │   ├── notifications/
│   │   │   └── NotificationsPage.tsx
│   │   ├── store/
│   │   │   └── StorePage.tsx
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   └── settings/
│   │       ├── SettingsPage.tsx
│   │       ├── AccountSettings.tsx
│   │       ├── AppearanceSettings.tsx
│   │       ├── NotificationSettings.tsx
│   │       └── PrivacySettings.tsx
│   │
│   ├── components/                    # Composants réutilisables
│   │   ├── ui/                        # Wrappers / extensions ui-kit
│   │   │   └── index.ts              # Ré-exports from @imuchat/ui-kit
│   │   ├── chat/
│   │   │   ├── MessageList.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── EmojiPicker.tsx
│   │   │   └── AttachmentPreview.tsx
│   │   ├── calls/
│   │   │   ├── VideoGrid.tsx
│   │   │   ├── CallControls.tsx
│   │   │   └── CallNotification.tsx
│   │   ├── contacts/
│   │   │   ├── ContactCard.tsx
│   │   │   ├── ContactList.tsx
│   │   │   └── FriendRequest.tsx
│   │   ├── shared/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── electron/
│   │       ├── TitleBar.tsx           # Custom window controls
│   │       └── UpdateNotification.tsx
│   │
│   ├── contexts/                      # React Context providers
│   │   ├── AuthContext.tsx            # Auth state + Supabase session
│   │   ├── ThemeContext.tsx           # Thèmes ui-kit intégrés
│   │   ├── SocketContext.tsx          # Socket.IO connection
│   │   └── ModulesContext.tsx         # Module registry
│   │
│   ├── stores/                        # Zustand stores
│   │   ├── useAuthStore.ts           # Auth state
│   │   ├── useChatStore.ts           # Messages, conversations
│   │   ├── useContactsStore.ts       # Contacts list
│   │   ├── useNotificationsStore.ts  # Notifications
│   │   ├── usePreferencesStore.ts    # User preferences
│   │   ├── usePresenceStore.ts       # Online/offline status
│   │   └── useUIStore.ts            # UI state (sidebar, modals)
│   │
│   ├── hooks/                         # Custom hooks
│   │   ├── useAuth.ts               # Auth operations
│   │   ├── useChat.ts               # Chat operations
│   │   ├── useContacts.ts           # Contacts operations
│   │   ├── useSocket.ts             # Socket.IO
│   │   ├── useNotifications.ts      # Notifications
│   │   ├── usePresence.ts           # Presence
│   │   ├── useTranslation.ts        # i18n helper
│   │   ├── useElectron.ts           # Electron IPC
│   │   ├── useTheme.ts              # Theme switching
│   │   └── useKeyboardShortcuts.ts  # Global shortcuts
│   │
│   ├── services/                      # API / Backend services
│   │   ├── supabase.ts              # Supabase client configuration
│   │   ├── auth-service.ts          # Auth API calls
│   │   ├── chat-service.ts          # Chat API calls
│   │   ├── contacts-service.ts      # Contacts API calls
│   │   ├── notifications-service.ts # Notifications API
│   │   ├── presence-service.ts      # Presence API
│   │   ├── media-service.ts         # File upload / media
│   │   └── api-client.ts           # HTTP client for platform-core API
│   │
│   ├── i18n/                          # Internationalisation
│   │   ├── index.ts                  # i18next configuration
│   │   ├── locales/
│   │   │   ├── en.json              # English translations
│   │   │   ├── fr.json              # French translations
│   │   │   └── ja.json              # Japanese translations
│   │   └── useTranslation.ts       # Hook wrapper
│   │
│   ├── lib/                           # Utilitaires
│   │   ├── utils.ts                 # Helpers (cn, formatDate, etc.)
│   │   ├── constants.ts             # App constants
│   │   └── electron-bridge.ts       # Typed IPC API
│   │
│   ├── router/                        # React Router configuration
│   │   └── index.tsx                 # Routes definition
│   │
│   ├── styles/                        # Global styles
│   │   ├── globals.css              # Tailwind base + custom
│   │   └── themes.css               # Theme CSS variables
│   │
│   └── types/                         # Types Desktop-specific
│       ├── electron.d.ts            # Electron IPC types
│       └── app.d.ts                 # App-specific types
│
├── public/                            # Assets statiques
├── index.html                         # HTML entry point
├── vite.config.ts                     # Vite + Electron + aliases
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript config
├── electron-builder.json5             # Build config
├── .env.example                       # Variables d'environnement
└── package.json
```

---

## 🔗 Intégration des packages partagés

### @imuchat/shared-types

```typescript
// Imports types pour typage strict
import type { User, UserProfile } from '@imuchat/shared-types'
import type { ChatMessage, Conversation, MessageType } from '@imuchat/shared-types'
import type { Server, Channel, ServerMember } from '@imuchat/shared-types'
import type { NotificationType, NotificationPayload } from '@imuchat/shared-types'
import type { Theme, ThemeMode } from '@imuchat/shared-types'
import type { ModuleManifest } from '@imuchat/shared-types'

// Hooks partagés
import { useAuth } from '@imuchat/shared-types/hooks'
```

### @imuchat/ui-kit

```typescript
// Composants UI
import { 
  Button, Input, Avatar, Badge, Card, Modal,
  ChatBubble, ChatInput, MessageList,
  UserAvatar, OnlineIndicator, TypingIndicator,
  Spinner, Tabs, Select, Switch, Checkbox,
  Tooltip, Popover, Dialog, DropdownMenu,
  KawaiiButton, KawaiiCard, KawaiiInput,
  ServerIcon, ChannelItem, EmojiReaction,
  ImuMascot
} from '@imuchat/ui-kit'

// Thèmes et tokens
import { themes, applyTheme } from '@imuchat/ui-kit/themes'
import { tokens } from '@imuchat/ui-kit/tokens'

// i18n du ui-kit
import { I18nProvider, LanguageSwitcher } from '@imuchat/ui-kit/i18n'
```

### @imuchat/platform-core (client-safe)

```typescript
// Import client-safe uniquement (pas de Node.js APIs)
import { 
  EventBus,
  ThemeModule,
  PreferencesModule,
  MascotteModule,
  AnimationModule,
  SoundModule,
  SeasonModule,
  TelemetryModule,
  ModuleRegistry
} from '@imuchat/platform-core/client'
```

---

## 🌐 Internationalisation (i18n)

### Stack technique

- **i18next** + **react-i18next** (standard React SPA, compatible Electron)
- Reprend la même structure de clés que la web-app
- Supporte 3 langues : `en`, `fr`, `ja`

### Configuration i18next

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, ja: { translation: ja } },
  lng: 'fr', // Langue par défaut
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  defaultNS: 'translation',
})

export default i18n
```

### Structure des fichiers de traduction

```json
// src/i18n/locales/fr.json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "retry": "Réessayer",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "delete": "Supprimer",
    "search": "Rechercher...",
    "online": "En ligne",
    "offline": "Hors ligne"
  },
  "auth": {
    "login": "Connexion",
    "signup": "Inscription",
    "email": "Adresse e-mail",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublié ?",
    "loginButton": "Se connecter",
    "signupButton": "S'inscrire",
    "logout": "Déconnexion"
  },
  "nav": {
    "home": "Accueil",
    "messages": "Messages",
    "calls": "Appels",
    "contacts": "Contacts",
    "social": "Social",
    "notifications": "Notifications",
    "watch": "Watch",
    "store": "Store",
    "settings": "Paramètres"
  },
  "chat": { ... },
  "calls": { ... },
  "contacts": { ... },
  "settings": { ... },
  "notifications": { ... }
}
```

### Usage dans les composants

```tsx
import { useTranslation } from 'react-i18next'

function Sidebar() {
  const { t } = useTranslation()
  return <span>{t('nav.home')}</span>
}
```

---

## 🔄 State Management (Zustand)

### Pattern store

```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@imuchat/shared-types'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      logout: () => set({ user: null, session: null }),
    }),
    { name: 'imuchat-auth' }
  )
)
```

---

## 🛤️ Routing (React Router)

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      { path: 'login', element: <LoginPage />, },
      { path: 'signup', element: <SignupPage />, },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'chat/:conversationId', element: <ConversationView /> },
      { path: 'calls', element: <CallsPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'communities', element: <CommunitiesPage /> },
      { path: 'social', element: <FeedPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'store', element: <StorePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
```

---

## ⚡ Electron IPC Bridge

### Preload (contextBridge)

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  
  // Notifications
  showNotification: (title: string, body: string) => 
    ipcRenderer.send('notification:show', { title, body }),
  
  // System
  getPlatform: () => process.platform,
  getVersion: () => ipcRenderer.invoke('app:version'),
  
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  onUpdateAvailable: (cb: () => void) => ipcRenderer.on('updater:available', cb),
  
  // Deep links
  onDeepLink: (cb: (url: string) => void) => 
    ipcRenderer.on('deep-link', (_, url) => cb(url)),
  
  // File system (sandboxed)
  saveFile: (data: ArrayBuffer, name: string) => 
    ipcRenderer.invoke('fs:save', data, name),
})
```

### Types IPC

```typescript
// src/types/electron.d.ts
interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  showNotification: (title: string, body: string) => void
  getPlatform: () => NodeJS.Platform
  getVersion: () => Promise<string>
  checkForUpdates: () => Promise<void>
  onUpdateAvailable: (cb: () => void) => void
  onDeepLink: (cb: (url: string) => void) => void
  saveFile: (data: ArrayBuffer, name: string) => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
```

---

## 🎨 Thèmes

Utiliser le système de thèmes du **ui-kit** directement :

```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from 'react'
import { themes, applyTheme } from '@imuchat/ui-kit/themes'
import type { Theme } from '@imuchat/shared-types'
import { usePreferencesStore } from '@/stores/usePreferencesStore'

// 7 thèmes disponibles : light, dark, sakura-pink, cyber-neon, zen-green, midnight, ocean
```

---

## 🔌 Socket.IO Integration

```typescript
// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/useAuthStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:9002'

export function createSocket(): Socket {
  const token = useAuthStore.getState().session?.access_token
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })
}
```

---

## 📦 Variables d'environnement

```env
# .env.example
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SOCKET_URL=ws://localhost:9002
VITE_API_URL=http://localhost:8080
VITE_API_PREFIX=/api/v1
VITE_APP_VERSION=0.1.0
```

---

## 🧪 Stack de tests

- **Vitest** — Tests unitaires (compatible Vite)
- **Testing Library** — Tests composants React
- **Playwright** — Tests E2E (Electron)
- **Storybook** — Documentation composants (optionnel, partagé avec ui-kit)

---

*Document de référence technique — Ne contient pas de planning (voir DESKTOP_ROADMAP_UNIFIED.md)*  
*Mis à jour le 8 mars 2026*
