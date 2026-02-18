# 🚀 ImuChat Web-App - Roadmap Détaillée 2026

> **État actuel** : MVP Chat fonctionnel mais incomplet  
> **Vision** : Application web complète, desktop-first, parité avec mobile + features web exclusives  
> **Timeline** : 16 semaines (4 phases de 4 semaines)

---

## 📊 Gap Analysis : Web-App vs Mobile

### ✅ Ce qui existe (parité mobile/web)

| Feature | Mobile | Web | Status |
|---------|--------|-----|--------|
| Authentication (login/signup) | ✅ | ✅ | **Parité** |
| Conversations list | ✅ | ✅ | **Parité** |
| Chat interface | ✅ | ✅ | **Parité** |
| Message reactions | ✅ | ✅ | **Parité** |
| Media upload (images/videos) | ✅ | ✅ | **Parité** |
| Voice messages | ✅ | ✅ | **Parité** |
| Call history | ✅ | ✅ | **Parité** |
| Active/Incoming/Outgoing calls | ✅ | ✅ | **Parité** |

### ❌ Gaps critiques (Mobile ✅ → Web ❌)

| Feature | Mobile | Web | Impact | Priorité |
|---------|--------|-----|--------|----------|
| **App Shell complet** | ✅ Tab Bar | ❌ Pas de layout | **CRITIQUE** | P0 |
| **Navigation principale** | ✅ 5 tabs | ❌ Pas de sidebar | **CRITIQUE** | P0 |
| **Social hub** | ✅ Complet | ❌ Manquant | **HAUT** | P1 |
| **Profile & Settings** | ✅ Complet | ❌ Manquant | **HAUT** | P1 |
| **Watch** | ✅ Stories/videos | ❌ Manquant | **MOYEN** | P2 |
| **Store** | ✅ E-commerce | ❌ Manquant | **MOYEN** | P2 |
| **Modules système** | ✅ Base | ❌ Manquant | **MOYEN** | P2 |
| **Notifications UI** | ✅ Complet | ❌ Basique | **HAUT** | P1 |
| **Search global** | ✅ Basique | ❌ Manquant | **MOYEN** | P2 |

### 🎯 Features web exclusives à créer

| Feature | Description | Priorité | Semaine |
|---------|-------------|----------|---------|
| **Multi-panel layout** | 3 colonnes (Sidebar + Main + Right panel) | **P0** | S1-2 |
| **Keyboard shortcuts** | Navigation clavier complète | **P0** | S3 |
| **Command palette** | Recherche rapide (Cmd+K) | **P1** | S4 |
| **Drag & drop** | Upload fichiers, réorganisation | **P1** | S5 |
| **Split view** | Multi-conversations simultanées | **P2** | S8 |
| **Picture-in-Picture** | Appels en arrière-plan | **P1** | S6 |
| **PWA** | Install desktop, offline mode | **P2** | S12 |
| **Desktop notifications** | System notifications natives | **P1** | S7 |
| **Multi-window** | Ouvrir conversations en fenêtres | **P3** | S14 |
| **Rich text editor** | Formatting avancé messages | **P2** | S9 |

---

## 📅 Phase 1 : Fondations Desktop (Semaines 1-4)

### 🎯 Objectif : App Shell moderne + Navigation complète

#### ✅ Semaine 1 : App Shell & Layout System - **COMPLÉTÉE**

> **Statut** : ✅ TERMINÉE le 18 février 2026

**Livrables** :

1. **Layout principal 3-colonnes**

   ```
   ┌─────────────────────────────────────────────────┐
   │  TopBar (search, notifications, profile)        │
   ├──────┬─────────────────────────┬────────────────┤
   │      │                         │                │
   │ Side │   Main Content          │  Right Panel   │
   │ bar  │   (dynamic routes)      │  (contextual)  │
   │      │                         │                │
   │ 240px│        flex-1           │    320px       │
   └──────┴─────────────────────────┴────────────────┘
   ```

   - [x] ✅ `src/components/layout/AppShell.tsx`
   - [x] ✅ `src/components/layout/Sidebar.tsx`
   - [x] ✅ `src/components/layout/TopBar.tsx`
   - [x] ✅ `src/components/layout/RightPanel.tsx`
   - [x] ✅ Responsive : collapse sidebar < 1024px

2. **Sidebar navigation**
   - [x] ✅ Logo + app branding
   - [x] ✅ Navigation principale :
     - 🏠 Dashboard (`/dashboard`)
     - 💬 Chats (`/chats`)
     - 📞 Calls (`/calls`)
     - 👥 Social (`/social`)
     - 📺 Watch (`/watch`)
     - 🛍️ Store (`/store`)
     - 👤 Profile (`/profile`)
   - [x] ✅ Active state highlighting
   - [x] ✅ Settings en bas

3. **TopBar features**
   - [x] ✅ Search global (input toujours visible)
   - [x] ✅ Notifications badge (count: 5)
   - [x] ✅ Profile dropdown (avatar + menu)
   - [x] ✅ Theme toggle (light/dark)
   - [x] ✅ Responsive design

**Composants créés** :

```tsx
// src/components/layout/
- AppShell.tsx          // Container principal
- Sidebar.tsx           // Navigation gauche
- SidebarItem.tsx       // Item de navigation
- TopBar.tsx            // Barre du haut
- SearchBar.tsx         // Recherche globale
- NotificationsDropdown.tsx
- ProfileDropdown.tsx
- RightPanel.tsx        // Panneau contextuel

// src/components/ui/
- Badge.tsx             // Compteur notifications
- Separator.tsx         // shadcn separator
- Tooltip.tsx           // shadcn tooltip
```

**Pages créées** :

```
src/app/
├── layout.tsx          // ✅ Root layout
├── page.tsx            // ✅ Redirect to dashboard
├── (app)/              // ✅ Routes protégées
│   ├── layout.tsx      // ✅ AppShell wrapper
│   ├── dashboard/      // ✅ CRÉÉ (stats, conversations, actions)
│   ├── chats/          // ✅ Migré sous (app)
│   ├── calls/          // ✅ Migré sous (app)
│   ├── social/         // ✅ CRÉÉ (placeholder)
│   ├── watch/          // ✅ CRÉÉ (placeholder)
│   ├── store/          // ✅ CRÉÉ (placeholder)
│   ├── profile/        // ✅ CRÉÉ (placeholder)
│   └── settings/       // ✅ CRÉÉ (placeholder)
```

**Tests** :

- [ ] AppShell responsive tests (À faire Semaine 2)
- [ ] Sidebar navigation tests (À faire Semaine 2)
- [ ] TopBar interactions tests (À faire Semaine 2)

---

#### ✨ Semaine 2 : Dashboard & Home

**Livrables** :

1. **Dashboard principal (`/`)**

   ```
   ┌─────────────────────────────────────────────┐
   │  Bonjour Nathan 👋                          │
   │                                             │
   │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
   │  │ 24 msgs │ │ 3 calls │ │ 12 notif│       │
   │  └─────────┘ └─────────┘ └─────────┘       │
   │                                             │
   │  Recent conversations (3 dernières)         │
   │  ┌─────────────────────────────────────┐   │
   │  │ Alice • Il y a 2min                  │   │
   │  │ Bob   • Il y a 1h                    │   │
   │  └─────────────────────────────────────┘   │
   │                                             │
   │  Quick actions                              │
   │  [New chat] [New call] [Create story]      │
   └─────────────────────────────────────────────┘
   ```

   - [ ] Stats cards (messages, calls, notifications)
   - [ ] Recent conversations widget
   - [ ] Quick actions buttons
   - [ ] Pinned modules
   - [ ] Activity feed

2. **Composants dashboard**
   - [ ] `StatsCard.tsx` - Carte statistique
   - [ ] `RecentConversations.tsx` - Widget conversations
   - [ ] `QuickActions.tsx` - Boutons actions rapides
   - [ ] `ActivityFeed.tsx` - Feed activité
   - [ ] `PinnedModules.tsx` - Modules épinglés

3. **Hooks & Data**
   - [ ] `useDashboardStats.ts` - Récupérer stats
   - [ ] `useRecentActivity.ts` - Activité récente
   - [ ] `usePinnedModules.ts` - Modules épinglés

**Tests** :

- [ ] Dashboard rendering tests
- [ ] Stats calculation tests
- [ ] Quick actions tests

---

#### ✨ Semaine 3 : Keyboard Shortcuts & Command Palette

**Livrables** :

1. **Système de raccourcis clavier**
   - [ ] `src/hooks/useKeyboardShortcuts.ts`
   - [ ] Context provider `KeyboardShortcutsProvider`
   - [ ] Configuration centralisée

   **Shortcuts essentiels** :

   ```typescript
   {
     'cmd+k': 'Ouvrir command palette',
     'cmd+/': 'Afficher tous les shortcuts',
     'cmd+1-8': 'Navigation rapide (Dashboard, Chats...)',
     'cmd+n': 'Nouvelle conversation',
     'cmd+shift+n': 'Nouvel appel',
     'cmd+f': 'Rechercher dans conversation',
     'cmd+shift+f': 'Recherche globale',
     'esc': 'Fermer modal/panneau',
     'cmd+,': 'Ouvrir settings',
     '↑ ↓': 'Naviguer conversations',
     'enter': 'Ouvrir conversation sélectionnée',
     'cmd+shift+m': 'Toggle mute notification',
   }
   ```

2. **Command Palette (Cmd+K)**

   ```
   ┌────────────────────────────────────┐
   │  🔍 Rechercher...                  │
   ├────────────────────────────────────┤
   │  💬 Nouvelle conversation          │
   │  📞 Nouvel appel                   │
   │  ──────────────────────────────    │
   │  Recent:                           │
   │  👤 Alice Martin                   │
   │  👤 Bob Durant                     │
   │  ──────────────────────────────    │
   │  Actions:                          │
   │  ⚙️  Paramètres                    │
   │  🌙 Toggle dark mode               │
   └────────────────────────────────────┘
   ```

   - [ ] `CommandPalette.tsx` - Modal commandes
   - [ ] Recherche fuzzy (fuse.js)
   - [ ] Sections : Actions, Recent, Navigation
   - [ ] Preview au hover

3. **Shortcuts help modal (Cmd+/)**
   - [ ] `KeyboardShortcutsHelp.tsx`
   - [ ] Liste tous les shortcuts par catégorie
   - [ ] Recherche dans shortcuts

**Composants** :

```tsx
// src/components/command/
- CommandPalette.tsx
- CommandItem.tsx
- CommandSection.tsx
- KeyboardShortcutsHelp.tsx
- ShortcutBadge.tsx      // Affiche "⌘K"

// src/hooks/
- useKeyboardShortcuts.ts
- useCommandPalette.ts
```

**Tests** :

- [ ] Keyboard events tests
- [ ] Command palette search tests
- [ ] Shortcuts registration tests

---

#### ✨ Semaine 4 : Notifications & Real-time

**Livrables** :

1. **Notifications center**

   ```
   TopBar → 🔔 (badge: 5)
            ↓
   ┌──────────────────────────────┐
   │  Notifications (5)     Mark all│
   ├──────────────────────────────┤
   │  💬 Alice vous a envoyé...   │
   │     Il y a 2min          [×] │
   │  ──────────────────────────  │
   │  📞 Appel manqué de Bob      │
   │     Il y a 1h            [×] │
   │  ──────────────────────────  │
   │  👥 Jean a rejoint...        │
   │     Il y a 3h            [×] │
   └──────────────────────────────┘
   ```

   - [ ] `NotificationCenter.tsx` - Dropdown complet
   - [ ] `NotificationItem.tsx` - Item individuel
   - [ ] Types : message, call, system, social
   - [ ] Actions : mark read, delete, view
   - [ ] Filters : All, Unread, Mentions

2. **Desktop notifications natives**
   - [ ] `useDesktopNotifications.ts`
   - [ ] Permission request UI
   - [ ] Notification trigger logic
   - [ ] Click handlers (ouvrir conversation)
   - [ ] Sound toggle

3. **Real-time updates UI**
   - [ ] Typing indicators visibles
   - [ ] Online status badges
   - [ ] Message delivery status (sent/delivered/read)
   - [ ] Optimistic UI updates
   - [ ] Toast notifications pour events

**Composants** :

```tsx
// src/components/notifications/
- NotificationCenter.tsx
- NotificationItem.tsx
- NotificationFilters.tsx
- NotificationSettings.tsx

// src/components/ui/
- Toast.tsx                // shadcn toast
- OnlineBadge.tsx          // Status indicator
- TypingIndicator.tsx      // "Alice is typing..."
```

**Hooks** :

```typescript
// src/hooks/
- useDesktopNotifications.ts
- useNotificationCenter.ts
- useToast.ts
```

**Tests** :

- [ ] Notification center tests
- [ ] Desktop notifications permission tests
- [ ] Real-time updates tests

---

## 📅 Phase 2 : Features Principales (Semaines 5-8)

### 🎯 Objectif : Implémentation pages Social, Profile, Watch, Store

#### ✨ Semaine 5 : Social Hub

**Livrables** :

1. **Page Social (`/social`)**

   ```
   Layout 3 colonnes :
   ┌────────┬─────────────────────┬──────────┐
   │ Sidebar│   Feed Timeline     │ Trending │
   │        │                     │          │
   │ Stories│   ┌──────────────┐  │ • Topic1 │
   │ (round)│   │ Post by Bob  │  │ • Topic2 │
   │        │   └──────────────┘  │          │
   │ Friends│   ┌──────────────┐  │ People   │
   │ Groups │   │ Post by Alice│  │ • User1  │
   │        │   └──────────────┘  │ • User2  │
   └────────┴─────────────────────┴──────────┘
   ```

   **Routes** :
   - [ ] `/social` - Timeline principale
   - [ ] `/social/stories` - Stories viewer
   - [ ] `/social/groups` - Liste groupes
   - [ ] `/social/groups/[id]` - Détail groupe
   - [ ] `/social/events` - Calendrier événements
   - [ ] `/social/discover` - Découverte contenu

2. **Timeline feed**
   - [ ] `Timeline.tsx` - Container feed
   - [ ] `PostCard.tsx` - Carte post individuel
   - [ ] `CreatePost.tsx` - Composer post
   - [ ] Infinite scroll
   - [ ] Filters : All, Friends, Groups
   - [ ] Post types : text, image, video, poll

3. **Stories**
   - [ ] `StoriesBar.tsx` - Barre horizontale stories
   - [ ] `StoryViewer.tsx` - Viewer fullscreen
   - [ ] `CreateStory.tsx` - Upload story
   - [ ] Auto-play avec timer
   - [ ] Navigation gauche/droite

4. **Groups**
   - [ ] `GroupsList.tsx` - Liste groupes
   - [ ] `GroupCard.tsx` - Carte groupe
   - [ ] `GroupDetail.tsx` - Page groupe
   - [ ] `GroupMembers.tsx` - Liste membres
   - [ ] `GroupSettings.tsx` - Paramètres groupe

**Composants** :

```tsx
// src/app/social/
- page.tsx                 // Timeline
- layout.tsx               // Social layout
- stories/page.tsx
- groups/page.tsx
- groups/[id]/page.tsx
- events/page.tsx
- discover/page.tsx

// src/components/social/
- Timeline.tsx
- PostCard.tsx
- CreatePost.tsx
- PostActions.tsx          // Like, comment, share
- CommentSection.tsx
- StoriesBar.tsx
- StoryViewer.tsx
- CreateStory.tsx
- GroupsList.tsx
- GroupCard.tsx
- GroupDetail.tsx
- TrendingSidebar.tsx
```

**Hooks** :

```typescript
// src/hooks/
- useSocialFeed.ts
- usePostActions.ts        // Like, comment, share
- useStories.ts
- useGroups.ts
```

**Tests** :

- [ ] Timeline rendering tests
- [ ] Post actions tests
- [ ] Stories navigation tests
- [ ] Groups CRUD tests

---

#### ✨ Semaine 6 : Profile & Settings

**Livrables** :

1. **Profile page (`/profile`)**

   ```
   ┌─────────────────────────────────────┐
   │  ┌────┐  Nathan Imogo               │
   │  │ AV │  @nathanimogo               │
   │  └────┘  🟢 Online                  │
   │                                     │
   │  Bio: Développeur passionné...      │
   │                                     │
   │  [Edit] [Share] [More ▼]           │
   │                                     │
   │  ┌─────┬─────┬─────┬─────┐         │
   │  │Posts│Media│About│Friends│        │
   │  └─────┴─────┴─────┴─────┘         │
   │                                     │
   │  Content grid...                    │
   └─────────────────────────────────────┘
   ```

   **Features** :
   - [ ] Profile header (avatar, cover, bio)
   - [ ] Edit profile modal
   - [ ] Tabs : Posts, Media, About, Friends
   - [ ] Stats : posts count, friends count
   - [ ] Actions : Edit, Share, Block, Report

2. **Settings page (`/settings`)**

   ```
   Layout 2 colonnes :
   ┌────────────┬────────────────────────┐
   │ Sidebar    │  Settings Content      │
   │            │                        │
   │ • Account  │  ┌──────────────────┐  │
   │ • Privacy  │  │ Account Settings │  │
   │ • Security │  └──────────────────┘  │
   │ • Notif.   │                        │
   │ • Appear.  │  Email: ...            │
   │ • Language │  Username: ...         │
   │ • Data     │                        │
   └────────────┴────────────────────────┘
   ```

   **Sections** :
   - [ ] `/settings/account` - Email, username, phone
   - [ ] `/settings/privacy` - Who can see, contact me
   - [ ] `/settings/security` - Password, 2FA, sessions
   - [ ] `/settings/notifications` - Preferences notifs
   - [ ] `/settings/appearance` - Theme, font, layout
   - [ ] `/settings/language` - Langue, timezone
   - [ ] `/settings/data` - Export, delete account

3. **Multi-profiles** (feature web exclusive)
   - [ ] Profile switcher (TopBar dropdown)
   - [ ] Créer profil secondaire
   - [ ] Switch entre profils
   - [ ] Chaque profil a ses propres données

**Composants** :

```tsx
// src/app/profile/
- page.tsx                 // Profile view
- edit/page.tsx            // Edit mode

// src/app/settings/
- layout.tsx               // Settings layout 2-col
- account/page.tsx
- privacy/page.tsx
- security/page.tsx
- notifications/page.tsx
- appearance/page.tsx
- language/page.tsx
- data/page.tsx

// src/components/profile/
- ProfileHeader.tsx
- ProfileTabs.tsx
- ProfilePosts.tsx
- ProfileMedia.tsx
- ProfileAbout.tsx
- ProfileFriends.tsx
- EditProfileModal.tsx

// src/components/settings/
- SettingsSidebar.tsx
- SettingSection.tsx
- AccountSettings.tsx
- PrivacySettings.tsx
- SecuritySettings.tsx
- NotificationSettings.tsx
- AppearanceSettings.tsx
- ThemePicker.tsx
- DataExport.tsx
```

**Tests** :

- [ ] Profile rendering tests
- [ ] Profile edit tests
- [ ] Settings changes tests
- [ ] Multi-profile switch tests

---

#### ✨ Semaine 7 : Watch & Media

**Livrables** :

1. **Watch page (`/watch`)**

   ```
   Layout grid vidéos :
   ┌──────────────────────────────────────┐
   │  Filters: All | Stories | Videos     │
   ├──────────────────────────────────────┤
   │  ┌────────┐ ┌────────┐ ┌────────┐   │
   │  │Video 1 │ │Video 2 │ │Video 3 │   │
   │  │ 2:45   │ │ 5:12   │ │ 3:30   │   │
   │  └────────┘ └────────┘ └────────┘   │
   │                                      │
   │  ┌────────┐ ┌────────┐ ┌────────┐   │
   │  │Video 4 │ │Video 5 │ │Video 6 │   │
   │  └────────┘ └────────┘ └────────┘   │
   └──────────────────────────────────────┘
   ```

   **Features** :
   - [ ] Grid vidéos (responsive)
   - [ ] Filters : All, Stories, Videos, Lives
   - [ ] Video player fullscreen
   - [ ] Auto-play next
   - [ ] Like, comment, share
   - [ ] Watch history

2. **Video player**
   - [ ] `VideoPlayer.tsx` - Player custom
   - [ ] Controls : play/pause, volume, fullscreen
   - [ ] Subtitles support
   - [ ] Playback speed
   - [ ] Picture-in-Picture mode
   - [ ] Keyboard shortcuts (space, arrows, f)

3. **Watch Party** (feature collaborative)
   - [ ] Créer watch party
   - [ ] Inviter amis
   - [ ] Synchronisation lecture
   - [ ] Chat intégré
   - [ ] Contrôles partagés

**Composants** :

```tsx
// src/app/watch/
- page.tsx                 // Grid vidéos
- [id]/page.tsx            // Video player page

// src/components/watch/
- VideoGrid.tsx
- VideoCard.tsx
- VideoPlayer.tsx
- PlayerControls.tsx
- WatchParty.tsx
- WatchPartyChat.tsx
- VideoComments.tsx
```

**Hooks** :

```typescript
// src/hooks/
- useVideoPlayer.ts
- useWatchParty.ts
- useVideoPlayback.ts      // Sync playback
```

**Tests** :

- [ ] Video player controls tests
- [ ] Watch party sync tests
- [ ] PiP mode tests

---

#### ✨ Semaine 8 : Store & Modules

**Livrables** :

1. **Store page (`/store`)**

   ```
   ┌─────────────────────────────────────┐
   │  Search apps...          [Cart: 3]  │
   ├─────────────────────────────────────┤
   │  Categories:                        │
   │  [All] [Productivité] [Social] ...  │
   │                                     │
   │  ┌──────┐ ┌──────┐ ┌──────┐        │
   │  │ App1 │ │ App2 │ │ App3 │        │
   │  │ $4.99│ │ FREE │ │ $9.99│        │
   │  └──────┘ └──────┘ └──────┘        │
   └─────────────────────────────────────┘
   ```

   **Routes** :
   - [ ] `/store` - Catalogue apps
   - [ ] `/store/[id]` - Détail app
   - [ ] `/store/cart` - Panier
   - [ ] `/store/purchases` - Achats
   - [ ] `/store/categories/[slug]` - Catégorie

2. **App detail page**
   - [ ] Screenshots carousel
   - [ ] Description complète
   - [ ] Reviews & ratings
   - [ ] Prix & bouton achat/install
   - [ ] Permissions requises
   - [ ] Version & changelog

3. **Modules système**
   - [ ] Modules installés (`/modules`)
   - [ ] Module settings
   - [ ] Enable/disable modules
   - [ ] Module permissions

**Composants** :

```tsx
// src/app/store/
- page.tsx                 // Catalogue
- [id]/page.tsx            // App detail
- cart/page.tsx            // Panier
- purchases/page.tsx       // Achats
- categories/[slug]/page.tsx

// src/components/store/
- AppGrid.tsx
- AppCard.tsx
- AppDetail.tsx
- Screenshots.tsx
- Reviews.tsx
- InstallButton.tsx
- CartSidebar.tsx

// src/app/modules/
- page.tsx                 // Installed modules

// src/components/modules/
- ModulesList.tsx
- ModuleCard.tsx
- ModuleSettings.tsx
```

**Hooks** :

```typescript
// src/hooks/
- useStoreApps.ts
- useCart.ts
- usePurchases.ts
- useModules.ts
```

**Tests** :

- [ ] Store catalog tests
- [ ] App detail tests
- [ ] Cart operations tests
- [ ] Module toggle tests

---

## 📅 Phase 3 : Features Avancées Web (Semaines 9-12)

### 🎯 Objectif : Features exclusives desktop, UX avancée

#### ✨ Semaine 9 : Rich Text Editor & Drag & Drop

**Livrables** :

1. **Rich Text Editor (messages)**
   - [ ] Intégration TipTap ou Lexical
   - [ ] Formatting : bold, italic, underline, code
   - [ ] Listes : ordered, unordered
   - [ ] Links, mentions (@user), emojis
   - [ ] Code blocks avec syntax highlighting
   - [ ] Markdown shortcuts
   - [ ] Toolbar flottante

2. **Drag & Drop upload**
   - [ ] Drop zone dans conversation
   - [ ] Highlight zone au drag-over
   - [ ] Preview fichiers avant upload
   - [ ] Progress bar upload multiple
   - [ ] Drag & drop réorganisation (messages épinglés)

3. **Paste handling**
   - [ ] Paste images → upload automatique
   - [ ] Paste code → format code block
   - [ ] Paste links → rich preview

**Composants** :

```tsx
// src/components/editor/
- RichTextEditor.tsx
- EditorToolbar.tsx
- MentionSuggestions.tsx
- EmojiPicker.tsx
- CodeBlockEditor.tsx

// src/components/upload/
- DropZone.tsx
- FilePreview.tsx
- UploadQueue.tsx
```

**Hooks** :

```typescript
// src/hooks/
- useRichTextEditor.ts
- useDragAndDrop.ts
- usePasteHandler.ts
```

**Tests** :

- [ ] Rich text formatting tests
- [ ] Drag & drop upload tests
- [ ] Paste handling tests

---

#### ✨ Semaine 10 : Split View & Multi-conversations

**Livrables** :

1. **Split view mode**

   ```
   ┌──────┬──────────────┬──────────────┐
   │      │ Convo 1      │ Convo 2      │
   │ List │              │              │
   │      │ Messages...  │ Messages...  │
   │      │              │              │
   │      ├──────────────┴──────────────┤
   │      │ Convo 3 (petit)             │
   └──────┴─────────────────────────────┘
   ```

   **Features** :
   - [ ] Ouvrir jusqu'à 3 conversations simultanées
   - [ ] Layout grid flexible
   - [ ] Resize panels
   - [ ] Persistance layout (localStorage)
   - [ ] Close/minimize panels

2. **Chat enhancements**
   - [ ] Message search dans conversation
   - [ ] Filters : media only, links only, files only
   - [ ] Jump to date
   - [ ] Pin messages
   - [ ] Star important conversations
   - [ ] Archive conversations

3. **Advanced chat features**
   - [ ] Message threads (réponses)
   - [ ] Message forwarding
   - [ ] Message editing (inline)
   - [ ] Message scheduling (send later)
   - [ ] Auto-save drafts

**Composants** :

```tsx
// src/components/chat/
- SplitView.tsx
- ConversationPanel.tsx
- ResizablePanel.tsx
- MessageSearch.tsx
- MessageFilters.tsx
- PinnedMessages.tsx
- MessageThread.tsx
- DraftManager.tsx
```

**Hooks** :

```typescript
// src/hooks/
- useSplitView.ts
- useMessageSearch.ts
- usePinnedMessages.ts
- useMessageThreads.ts
- useDrafts.ts
```

**Tests** :

- [ ] Split view layout tests
- [ ] Message search tests
- [ ] Message threads tests
- [ ] Drafts auto-save tests

---

#### ✨ Semaine 11 : Calls Enhancement & Screen Share

**Livrables** :

1. **Picture-in-Picture calls**
   - [ ] Minimize call en petit mode
   - [ ] Draggable PiP window
   - [ ] Always on top
   - [ ] Resize PiP
   - [ ] Click pour revenir fullscreen

2. **Screen share**
   - [ ] Share entire screen
   - [ ] Share specific window
   - [ ] Share browser tab
   - [ ] Resolution selection
   - [ ] Frame rate control

3. **Video filters & backgrounds**
   - [ ] Blur background
   - [ ] Virtual backgrounds (images)
   - [ ] Beauty filters (brightness, contrast)
   - [ ] Noise cancellation (audio)

4. **Advanced call features**
   - [ ] Call recording (avec permission)
   - [ ] Live captions (speech-to-text)
   - [ ] Reactions during call (👍 ❤️ 😂)
   - [ ] Hand raise
   - [ ] Grid view (multi-participants)

**Composants** :

```tsx
// src/components/calls/
- PictureInPicture.tsx
- ScreenSharePicker.tsx
- VideoFilters.tsx
- BackgroundSelector.tsx
- CallRecording.tsx
- LiveCaptions.tsx
- CallReactions.tsx
- ParticipantGrid.tsx
```

**Hooks** :

```typescript
// src/hooks/
- usePictureInPicture.ts
- useScreenShare.ts
- useVideoFilters.ts
- useCallRecording.ts
- useLiveCaptions.ts
```

**Tests** :

- [ ] PiP functionality tests
- [ ] Screen share tests
- [ ] Video filters tests
- [ ] Call recording tests

---

#### ✨ Semaine 12 : PWA & Offline Mode

**Livrables** :

1. **PWA Setup**
   - [ ] Service Worker configuration
   - [ ] Web App Manifest (`manifest.json`)
   - [ ] Install prompt
   - [ ] Offline fallback page
   - [ ] Update prompt (nouvelle version)

2. **Offline mode**
   - [ ] Cache conversations récentes (IndexedDB)
   - [ ] Queue messages (send when back online)
   - [ ] Offline indicator UI
   - [ ] Sync when reconnected
   - [ ] Conflict resolution

3. **Desktop features**
   - [ ] Desktop shortcuts (tray icon)
   - [ ] Badge count (unread messages)
   - [ ] Sound notifications
   - [ ] Auto-start on login (optionnel)

4. **Performance optimizations**
   - [ ] Code splitting par route
   - [ ] Lazy loading images
   - [ ] Virtual scrolling (conversations list)
   - [ ] Debounce search/typing
   - [ ] Memoization components lourds

**Fichiers** :

```typescript
// public/
- manifest.json
- sw.js                    // Service worker

// src/lib/
- pwa.ts                   // PWA utilities
- offline-storage.ts       // IndexedDB wrapper
- sync-manager.ts          // Offline sync

// src/components/pwa/
- InstallPrompt.tsx
- OfflineIndicator.tsx
- UpdatePrompt.tsx
```

**Tests** :

- [ ] Service worker tests
- [ ] Offline storage tests
- [ ] Sync manager tests
- [ ] PWA install tests

---

## 📅 Phase 4 : Polish & Launch (Semaines 13-16)

### 🎯 Objectif : Production-ready, tests, docs, déploiement

#### ✨ Semaine 13 : Testing & Quality

**Livrables** :

1. **Tests coverage**
   - [ ] Target : 70% coverage minimum
   - [ ] Unit tests : tous les hooks
   - [ ] Component tests : composants critiques
   - [ ] Integration tests : flows complets
   - [ ] E2E tests : Playwright (auth, chat, call)

2. **Error boundaries**
   - [ ] Global error boundary
   - [ ] Feature-specific boundaries
   - [ ] Error reporting (Sentry)
   - [ ] User-friendly error pages

3. **Performance audit**
   - [ ] Lighthouse score > 90
   - [ ] Bundle size < 500kb (gzip)
   - [ ] First Contentful Paint < 1.5s
   - [ ] Time to Interactive < 3s
   - [ ] Core Web Vitals optimisés

**Tests créés** :

```typescript
// __tests__/
- integration/
  - auth-flow.test.tsx
  - chat-flow.test.tsx
  - call-flow.test.tsx
  - social-flow.test.tsx
- e2e/
  - login.spec.ts
  - chat.spec.ts
  - calls.spec.ts
  - notifications.spec.ts
```

---

#### ✨ Semaine 14 : Accessibility & i18n

**Livrables** :

1. **Accessibility (WCAG 2.1 AA)**
   - [ ] Keyboard navigation complète
   - [ ] Screen reader support (ARIA labels)
   - [ ] Focus management
   - [ ] Color contrast ratios
   - [ ] Skip links
   - [ ] Alt texts sur images

2. **Internationalization**
   - [ ] next-intl setup complet
   - [ ] Translations : FR, EN, ES
   - [ ] Date/time formatting
   - [ ] Number formatting
   - [ ] RTL support (arabe)

3. **Themes avancés**
   - [ ] Light / Dark / Auto
   - [ ] Custom themes (colors)
   - [ ] High contrast mode
   - [ ] Font size control
   - [ ] Animations toggle (reduced motion)

**Fichiers** :

```
// messages/
- en.json
- fr.json
- es.json
- ar.json

// src/styles/
- themes/
  - light.css
  - dark.css
  - high-contrast.css
```

---

#### ✨ Semaine 15 : Documentation & Onboarding

**Livrables** :

1. **Documentation technique**
   - [ ] README.md complet
   - [ ] CONTRIBUTING.md
   - [ ] Architecture diagram
   - [ ] API documentation
   - [ ] Component Storybook

2. **User documentation**
   - [ ] Help center (`/help`)
   - [ ] FAQ
   - [ ] Video tutorials
   - [ ] Tooltips in-app
   - [ ] Onboarding flow

3. **Onboarding UX**
   - [ ] Welcome tour (5 étapes)
   - [ ] Feature highlights
   - [ ] Quick setup wizard
   - [ ] Sample data/conversations
   - [ ] Tips & tricks

**Pages** :

```
// src/app/help/
- page.tsx                 // Help center
- getting-started/page.tsx
- features/page.tsx
- faq/page.tsx
- contact/page.tsx
```

---

#### ✨ Semaine 16 : Deployment & Launch

**Livrables** :

1. **Production build**
   - [ ] Environment variables
   - [ ] Build optimizations
   - [ ] Source maps
   - [ ] Error tracking (Sentry)
   - [ ] Analytics (PostHog/Vercel)

2. **Deployment**
   - [ ] Vercel production deployment
   - [ ] Custom domain setup
   - [ ] SSL certificates
   - [ ] CDN configuration
   - [ ] Monitoring setup

3. **Launch checklist**
   - [ ] Security audit
   - [ ] Performance test (load)
   - [ ] Cross-browser testing
   - [ ] Mobile responsive test
   - [ ] Backup strategy
   - [ ] Incident response plan

4. **Post-launch**
   - [ ] User feedback collection
   - [ ] Bug tracking
   - [ ] Feature requests board
   - [ ] Analytics dashboard
   - [ ] Weekly updates plan

---

## 🎯 Prioritization Matrix

### P0 - Critique (Semaines 1-4)

- AppShell & Layout
- Navigation complète
- Dashboard
- Keyboard shortcuts
- Notifications

### P1 - Haute (Semaines 5-8)

- Social hub
- Profile & Settings
- Watch
- Store

### P2 - Moyenne (Semaines 9-12)

- Rich text editor
- Split view
- Calls enhancement
- PWA

### P3 - Basse (Semaines 13-16)

- Polish
- Testing
- Documentation
- Launch

---

## 📊 Success Metrics

### KPIs techniques

- **Performance** : Lighthouse score > 90
- **Tests** : Coverage > 70%
- **Bundle** : < 500kb gzip
- **Accessibility** : WCAG 2.1 AA

### KPIs produit

- **Feature parity** : 95% des features mobile
- **User satisfaction** : > 4.5/5
- **Daily active users** : 1000+ à M+3
- **Retention** : > 40% à 30 jours

---

## 🛠️ Tech Stack Complet

### Core

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript 5
- **Styling** : Tailwind CSS + shadcn/ui
- **State** : Zustand + React Query

### Features

- **Auth** : Supabase Auth
- **Database** : Supabase (PostgreSQL)
- **Realtime** : Supabase Realtime
- **Storage** : Supabase Storage
- **Calls** : Stream Video SDK / WebRTC
- **Rich text** : TipTap / Lexical
- **i18n** : next-intl

### Dev Tools

- **Testing** : Vitest + Playwright
- **Linting** : ESLint + Prettier
- **CI/CD** : GitHub Actions
- **Monitoring** : Sentry + Vercel Analytics
- **Documentation** : Storybook

---

## 📝 Notes d'implémentation

### Principes de développement

1. **Mobile-first** → puis enhanced desktop
2. **Progressive enhancement** : features optionnelles
3. **Accessibility-first** : ARIA, keyboard, screen readers
4. **Performance budget** : surveiller bundle size
5. **Type safety** : TypeScript strict mode

### Conventions code

- **Composants** : PascalCase, fichiers `.tsx`
- **Hooks** : `use` prefix, fichiers `.ts`
- **Utils** : camelCase, fichiers `.ts`
- **Tests** : `.test.tsx` / `.spec.ts`
- **CSS** : Tailwind utility-first, variants via cva

### Git workflow

- **Branches** : `feature/description`, `fix/bug-name`
- **Commits** : Conventional commits
- **PRs** : Template avec checklist
- **Reviews** : 1 approval minimum

---

## 🚀 Quick Start Commands

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build production
pnpm build

# Tests
pnpm test
pnpm test:e2e

# Linting
pnpm lint
pnpm format

# Storybook
pnpm storybook
```

---

## 📞 Support & Resources

- **Documentation** : `/docs`
- **Storybook** : `pnpm storybook`
- **Issues** : GitHub Issues
- **Discussions** : GitHub Discussions
- **Slack** : #imuchat-web

---

**Dernière mise à jour** : 18 février 2026  
**Prochaine review** : Fin Phase 1 (Semaine 4)
