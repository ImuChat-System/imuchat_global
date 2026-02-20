# 🗓️ MVP ImuChat - Roadmap Visuelle Features

> Timeline détaillée semaine par semaine - 12 semaines

---

## 📊 Vue d'Ensemble

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      MVP IMUCHAT - 12 SEMAINES                              │
├─────────────────────────────────────┬──────────────────────────────────────┤
│         PHASE 1 (8 sem)             │      PHASE 2 (4 sem)                 │
│      Mobile + Web                   │    Desktop + Polish                  │
├──────┬──────┬──────┬──────┬──────┬──┼──────┬──────┬──────┬──────┬──────────┤
│ S1   │ S2   │ S3-4 │ S5-6 │ S7   │ S8│ S9  │ S10  │ S11  │ S12  │          │
│Setup │ Auth │ Chat │Calls │Polish│B │Desk │Desk  │Polish│Launch│          │
│      │      │      │      │      │e │Base │Video │ Full │  🚀  │          │
│      │      │      │      │      │t │     │      │      │      │          │
│      │      │      │      │      │a │     │      │      │      │          │
└──────┴──────┴──────┴──────┴──────┴──┴─────┴──────┴──────┴──────┴──────────┘
```

---

## 📅 Semaine par Semaine - Features Delivery

### 🔧 Semaine 1 : Fondations & Setup (0 features user-facing)

**Objectif** : Infrastructure solide + Design system

#### Infrastructure

- [x] Projet Supabase créé (DB + Auth + Storage)
- [x] Stream Video SDK configuré
- [x] Firebase Push configuré
- [x] Database schema déployé (10 tables + triggers + 3 buckets storage)
- [x] Repos configurés (.env, dependencies)

#### Design System

- [x] Palette couleurs ImuChat définie
- [x] Tokens design exportés (spacing, typography)
- [x] Composants UI base Mobile :
  - [x] Button (3 variants)
  - [x] Input (text, email, password)
  - [x] Avatar (image + fallback)
  - [x] Card container
  - [x] Text components (H1-H6, Body, Caption)
- [x] Composants UI base Web :
  - [x] shadcn/ui configuré
  - [x] Button
  - [x] Input
  - [x] Card
  - [x] Avatar

#### Navigation

- [x] **Mobile** : Expo Router structure
  - [x] /auth (stack)
  - [x] /(tabs) (bottom tabs — 10 onglets)
  - [x] /chat/[id] (modal)
- [x] **Web** : Next.js App Router
  - [x] /login
  - [x] /signup
  - [x] /app/* (protected — ⚠️ middleware = i18n seulement, pas de SSR auth guard)

**Livrable** : Apps lancent localement ✅

---

### 🔐 Semaine 2 : Authentification & Profils (2 features)

**Features Livrées** :

1. ✅ **Authentification complète**
2. ✅ **Profil utilisateur basique**

#### Feature 1 : Auth System

**Mobile** :

- [ ] Écran Welcome (onboarding) — ❌ Non implémenté
- [x] Écran Login
  - [x] Email + Password
  - [x] Validation erreurs
  - [x] Loading states
  - [x] "Forgot password" link
- [x] Écran Signup
  - [x] Email, Password, Confirm Password
  - [ ] Validation temps réel — ⚠️ Pas de validation force mot de passe
  - [ ] Terms acceptance — ❌ Pas de checkbox CGU
- [x] Écran Forgot Password
  - [x] Email input
  - [x] Reset link sent confirmation
- [x] Session persistence (AsyncStorage)
- [x] Auto-login si session valide

**Web** :

- [x] Page `/login`
- [x] Page `/signup` (+ OAuth Google/Discord)
- [x] Page `/forgot-password` — ✅ Créée (formulaire email + resetPassword + i18n fr/en/ja)
- [x] Middleware auth protection — ✅ Réécrit avec `@supabase/ssr`, protection SSR sur `/chat`, `/app`, `/settings`, `/profile`
- [x] Session cookies (SSR) — client-side
- [x] Redirect si authenticated

**Backend** :

- [x] Supabase Auth configured
- [x] Email verification templates
- [x] Password reset flow
- [x] RLS policies (profiles table)

**Tests** :

- [x] Unit tests : Auth hooks (281 mobile + 905 web)
- [ ] E2E : Signup → Email → Login — ❌ Pas de tests E2E

---

#### Feature 2 : User Profiles

**Mobile** :

- [ ] Écran Setup Profile (first-time) — ❌ Non implémenté
  - [ ] Avatar upload (caméra/galerie)
  - [ ] Display name input
  - [ ] Bio textarea (optionnel)
  - [ ] Skip button
- [x] Écran Profile View
  - [x] Avatar display
  - [x] Username, Bio, Status
  - [x] "Edit Profile" button
- [x] Écran Edit Profile
  - [x] Change avatar
  - [x] Edit display name
  - [x] Edit bio
  - [ ] Edit status emoji — ⚠️ Non confirmé
  - [x] Save changes

**Web** :

- [x] Page `/profile`
- [x] Modal "Edit Profile"
- [ ] Avatar crop tool — ❌ Non implémenté

**Backend** :

- [x] `profiles` table avec RLS
- [x] Trigger auto-create profile on signup
- [x] Supabase Storage bucket `avatars`
- [ ] Image resize Edge Function — ❌ Non implémenté

**Tests** :

- [x] Upload avatar < 5MB
- [x] Profile updates persist

**Livrable** : User peut s'inscrire, se connecter, voir son profil ✅

---

### 💬 Semaine 3 : Messagerie Base (3 features)

**Features Livrées** :
3. ⚠️ **Liste conversations** — Mobile OK partiel / Web = MOCK_DATA
4. ⚠️ **Chat room 1:1 texte** — Mobile OK / Web = MOCK_DATA
5. ✅ **Envoi médias** — Mobile 10/10 / Web OK

#### Feature 3 : Conversations List

**Mobile** :

- [x] Tab "Chats" (bottom nav)
- [x] Liste conversations
  - [x] Avatar contact
  - [x] Nom conversation
  - [x] Dernier message preview
  - [x] Timestamp
  - [ ] Badge unread count — ⚠️ Hardcodé, pas dynamique
  - [x] Status en ligne (dot vert)
- [ ] Pull-to-refresh — ❌ Non implémenté
- [ ] Swipe actions (archive, delete) — ❌ Non implémenté
- [x] Empty state (no conversations yet)
- [ ] FAB "New Chat" button — ❌ Non implémenté

**Web** :

- [x] Sidebar conversations — ✅ Connectée à `useConversations()` (API REST + fallback mock)
- [x] Search bar (filtre local seulement)
- [x] Même UI que mobile (responsive)

**Backend** :

- [x] `conversations` table
- [x] `conversation_members` table
- [x] Endpoints : — ✅ Routes REST créées (conversations.ts + conversation-service.ts)
  - [x] GET `/api/v1/conversations` (user's conversations)
  - [x] POST `/api/v1/conversations` (create new)
  - [x] POST `/api/v1/conversations/:id/read` (mark as read)
- [x] Realtime subscription setup (Socket.IO)

**Tests** :

- [ ] Conversations sorted by last message
- [ ] Unread count correct

---

#### Feature 4 : Chat Room (Texte)

**Mobile** :

- [x] Écran Chat `/chat/[id]`
- [x] Header chat
  - [x] Avatar contact
  - [x] Nom + status
  - [x] Actions (call, video, info)
- [x] Message list
  - [x] Bubble sender (right)
  - [x] Bubble receiver (left)
  - [x] Timestamp
  - [ ] Double check (sent/delivered/read) — ⚠️ Partiel, pas d'UI read receipts
  - [x] Infinite scroll (load older)
- [x] Input message
  - [x] Textarea auto-expand
  - [x] Send button
  - [ ] Emoji picker — ❌ Non implémenté
- [x] Typing indicator
  - [x] "Alice is typing..."
- [ ] Read receipts — ❌ Pas d'UI
  - [ ] Mark as read on open
- [x] Real-time updates
  - [x] New messages appear instantly
  - [x] Scroll to bottom on new message

**Web** :

- [x] Main chat area — ✅ Connecté à `useMessages()` (API REST + Socket.IO temps réel + pagination)
- [x] Même features que mobile — ✅ Hooks connectés, fallback mock si API indisponible
- [ ] Raccourcis clavier :
  - [x] Enter → Send
  - [x] Shift+Enter → New line
  - [ ] Cmd+K → Search — ❌ cmdk installé mais inutilisé

**Backend** :

- [x] `messages` table avec index
- [x] INSERT message endpoint — ✅ REST POST `/api/v1/conversations/:id/messages` + Socket.IO `message:send` persiste en DB
- [x] UPDATE read_at field — ✅ POST `/api/v1/conversations/:id/read` (met à jour `last_read_at`)
- [x] Realtime broadcast channel
  - [x] New messages
  - [x] Typing indicators
  - [ ] Read receipts — ❌ Non implémenté (pas d'UI côté clients)
- [x] Pagination (50 messages/page) — ✅ GET `/api/v1/conversations/:id/messages?limit=50&before=cursor`

**Tests** :

- [ ] Message envoyé < 500ms
- [ ] Realtime sync multi-device
- [ ] Persistence après refresh

---

#### Feature 5 : Médias (Photos/Videos)

**Mobile** :

- [x] Input toolbar icons
  - [x] 📷 Camera
  - [x] 🖼️ Gallery
  - [ ] 😀 Emoji — ❌ Non implémenté
- [x] Image picker
  - [x] Permission caméra/galerie
  - [x] Preview before send
  - [ ] Crop/rotate optionnel — ❌ Non implémenté
- [x] Media message bubble
  - [x] Thumbnail dans chat
  - [x] Tap → Full screen viewer
  - [ ] Download/share options — ⚠️ Non confirmé
- [x] Video upload
  - [ ] Max 100MB — ⚠️ Non confirmé
  - [x] Progress bar
  - [ ] Thumbnail generation — ❌ Côté backend

**Web** :

- [x] File upload button
- [x] Drag & drop files
- [x] Preview modal (lightbox avec zoom)

**Backend** :

- [x] Supabase Storage bucket `messages-media`
- [x] Upload signed URL generation
- [ ] Thumbnail generation (Edge Function) — ❌ Non implémenté
- [x] Compression images (< 1MB)
- [x] Message `type: 'image'|'video'`

**Tests** :

- [ ] Upload image 5MB → success
- [ ] Upload video 100MB → success
- [ ] Preview displays correctly

**Livrable** : Chat 1:1 texte + médias fonctionnel ✅

---

### 💬 Semaine 4 : Messagerie Avancée (4 features)

**Features Livrées** :
6. ✅ **Messages vocaux** — 10/10 les 2 plateformes
7. ❌ **Édition/Suppression** — Non implémenté (backend en mémoire seulement)
8. ⚠️ **Réactions** — Mobile ✅ / Web = stubs
9. ❌ **GIFs & Emojis** — Non implémenté

#### Feature 6 : Voice Messages

**Mobile** :

- [x] Bouton microphone (hold to record)
- [x] Recording UI
  - [x] Waveform animation
  - [x] Timer (max 2min)
  - [x] Cancel (swipe left)
  - [x] Send (release)
- [x] Voice message bubble
  - [x] Play/Pause button
  - [x] Waveform static
  - [x] Duration display
  - [x] Progress bar
- [x] Audio player
  - [x] Playback speed (1x, 1.5x, 2x)
  - [x] Seek bar

**Web** :

- [x] Microphone permission
- [x] Desktop recording UI
- [x] Même player que mobile (+ transcription UI)

**Backend** :

- [x] Storage bucket `voice-notes`
- [ ] Audio compression (MP3/AAC) — ⚠️ Non confirmé
- [ ] Transcription IA (optionnel) — ❌ Non implémenté côté backend
  - [ ] Whisper API integration
  - [ ] Display text below audio
- [x] Message `type: 'audio'`

**Tests** :

- [ ] Record 30s → send → play
- [ ] Transcription < 10s

---

#### Feature 7 : Édition & Suppression

**Mobile** :

- [ ] Long press message → Menu — ❌ Seulement reactions, pas de menu complet
  - [ ] ✏️ Edit (si < 15min) — ❌ Non implémenté
  - [ ] 🗑️ Delete — ❌ Non implémenté
  - [ ] 📋 Copy — ❌ Non implémenté
  - [ ] 🔗 Reply — ❌ Non implémenté
- [ ] Edit mode — ❌ Non implémenté
  - [ ] Input pré-rempli
  - [ ] "Editing" indicator
  - [ ] Save/Cancel
- [ ] Delete confirmation — ❌ Non implémenté
  - [ ] "Delete for me" / "Delete for everyone"
- [ ] Deleted message display — ❌ Non implémenté
  - [ ] "🚫 Message deleted"
  - [ ] Timestamp kept

**Web** :

- [ ] Right-click context menu — ❌ Stubs console.log seulement
- [ ] Hover actions — ⚠️ UI existe mais actions = stubs

**Backend** :

- [x] UPDATE message (set edited_at) — ✅ REST PATCH `/api/v1/messages/:id` + DB Supabase
- [x] Soft delete (set deleted_at) — ✅ REST DELETE `/api/v1/messages/:id` + DB Supabase
- [ ] Edit history (JSONB field) — ❌ Non implémenté
- [x] Broadcast edit/delete events (Socket.IO)

**Tests** :

- [ ] Edit message → other sees update
- [ ] Delete → other sees deleted state

---

#### Feature 8 : Reactions

**Mobile** :

- [x] Long press message → Quick reactions
  - [x] ❤️ 👍 😂 😮 😢 🙏
- [x] Tap reaction → Remove
- [x] Reaction counts below bubble
  - [x] "❤️ 3  👍 1"
- [x] Tap count → See who reacted

**Web** :

- [ ] Hover → Reaction picker — ⚠️ UI présente mais actions = console.log stubs
- [ ] Click reaction — ⚠️ UI seulement, pas fonctionnel

**Backend** :

- [x] `message_reactions` table
- [x] INSERT/DELETE reaction — ✅ REST POST/DELETE `/api/v1/messages/:id/reactions` + Socket.IO persiste en DB
- [x] Aggregate counts query — ✅ Inclus dans getMessages() (reactions avec userId + emoji)
- [x] Realtime broadcast reactions

**Tests** :

- [ ] Add reaction → other sees instantly
- [ ] Same user can't react twice with same emoji

---

#### Feature 9 : GIFs & Emojis Enrichis

**Mobile** :

- [ ] Emoji picker — ❌ Non implémenté
  - [ ] Categories (smileys, people, animals...)
  - [ ] Search emojis
  - [ ] Skin tone selector
- [ ] GIF picker — ❌ Non implémenté
  - [ ] GIPHY integration
  - [ ] Trending GIFs
  - [ ] Search GIFs
  - [ ] Preview hover
- [ ] Send GIF as message (URL embed)

**Web** :

- [ ] Même UI — ❌ Non implémenté
- [ ] Keyboard shortcut : Cmd+Shift+G — ❌ Non implémenté

**Backend** :

- [ ] GIPHY API key — ❌ Non implémenté
- [ ] Cache GIF URLs
- [ ] Message `type: 'gif'`

**Tests** :

- [ ] Search "happy" → voir GIFs
- [ ] Send GIF → other sees animation

**Livrable** : Chat complet avec rich interactions ✅

---

### 📞 Semaine 5 : Appels Audio (1 feature)

**Features Livrées** :
10. ✅ **Appels audio 1:1**

#### Feature 10 : Audio Calls

**Mobile** :

- [x] Bouton appel audio (header chat)
- [x] Écran appel sortant
  - [x] Avatar contact
  - [x] "Calling..."
  - [x] Cancel button
  - [ ] Ringtone — ⚠️ Non confirmé
- [x] Écran appel entrant (modal)
  - [x] Avatar, nom contact
  - [x] Accept / Reject
  - [ ] Custom ringtone — ⚠️ Non confirmé
- [x] Écran appel actif
  - [x] Durée
  - [x] 🔇 Mute button
  - [x] 🔊 Speaker/Bluetooth toggle
  - [x] ❌ Hang up (rouge)
  - [ ] Keyboard toggle (DTMF) — ❌ Non implémenté
- [ ] CallKit integration (iOS) — ❌ Non implémenté (limité par SDK natif)
  - [ ] Écran verrouillage
  - [ ] History appels
- [ ] ConnectionService (Android) — ❌ Non implémenté
  - [ ] Même features

**Web** :

- [x] Même UI (browser permissions) — Stream Video intégré
- [x] Desktop notifications

**Backend (Stream SDK)** :

- [x] Create call session
- [x] WebRTC signaling
- [x] TURN/STUN servers (géré par Stream)
- [x] Call logs table
  - [x] caller_id, callee_id
  - [x] start_time, end_time, duration
  - [x] type: 'audio'

**Tests** :

- [ ] Call établi < 3s
- [ ] Audio qualité MOS > 4.0
- [ ] Mute/Unmute works
- [ ] Notification si app fermée

**Livrable** : Appels audio fonctionnels ✅

---

### 📹 Semaine 6 : Appels Vidéo (2 features)

**Features Livrées** :
11. ✅ **Appels vidéo 1:1**
12. ✅ **Partage d'écran**

#### Feature 11 : Video Calls

**Mobile** :

- [x] Bouton appel vidéo (header)
- [x] Écran appel vidéo actif
  - [x] Video remote (fullscreen)
  - [x] Video locale (PiP, top-right)
  - [x] Controls overlay
    - [x] 🎥 Toggle camera on/off
    - [x] 🔁 Flip camera (front/back)
    - [x] 🔇 Mute
    - [x] ❌ Hang up
  - [ ] PiP mode — ⚠️ Non confirmé
    - [ ] Mini-fenêtre flottante
    - [ ] Draggable
    - [ ] Tap → fullscreen
- [ ] Quality adaptative — Géré par Stream SDK
  - [ ] 360p (bad network)
  - [ ] 720p (good)
  - [ ] 1080p (excellent)
- [ ] Reconnexion auto (< 5s disconnect) — Géré par Stream SDK

**Web/Desktop** :

- [x] Fullscreen mode
- [x] Same controls
- [x] Meilleure qualité (1080p default)

**Backend** :

- [x] Stream Video call type: 'video'
- [ ] Bandwidth detection — Géré par Stream SDK
- [ ] Recording (optionnel) — ❌ Non implémenté

**Tests** :

- [ ] Video streams display
- [ ] Flip camera works
- [ ] PiP fonctionnel

---

#### Feature 12 : Screen Sharing

**Mobile** :

- [ ] Android : Screen capture permission — ⚠️ Limité
- [ ] iOS : Broadcast upload extension (complexe, v1.1) — ❌ Non implémenté
- [x] Viewer : See shared screen

**Web/Desktop** :

- [x] Button "Share Screen"
- [x] Browser native picker (window/tab/screen)
- [x] Stop sharing button
- [ ] Quality 720p @ 15fps — ⚠️ Non confirmé

**Backend** :

- [x] Screen track type in Stream

**Tests** :

- [ ] Share screen web → mobile voit
- [ ] Performance OK (< 30% CPU)

**Livrable** : Appels vidéo + screen sharing ✅

---

### ✨ Semaine 7 : Polish & UX (5 features)

**Features Livrées** :
13. ✅ **Notifications push** — Les 2 plateformes + backend complet
14. ✅ **Thèmes clair/sombre** — Web excellent (8 thèmes), Mobile partiel
15. ❌ **Recherche conversations** — 0/10 les 2 plateformes
16. ❌ **Mode hors-ligne** — 0/10 les 2 plateformes
17. ❌ **Onboarding** — 0/10 les 2 plateformes

#### Feature 13 : Notifications Push

**Mobile** :

- [x] Permission prompt (first-time)
- [x] FCM token registration
- [x] Notification types :
  - [x] New message (avec preview)
  - [x] Incoming call
  - [ ] Mention (future) — ❌ Non implémenté
- [ ] Actions rapides
  - [ ] Reply inline — ❌ Non implémenté
  - [x] Mark as read
- [x] Badge count app icon
- [ ] Silent mode / DND — ❌ Non implémenté

**Web** :

- [x] Service Worker setup (FCM)
- [x] Push API subscription
- [x] Desktop notifications (Chrome/Edge)

**Backend** :

- [x] Firebase Functions
  - [x] Send push on new message (FCM via Admin SDK)
  - [x] Send push on call
- [x] Store FCM tokens (devices table + routes REST complètes)

**Tests** :

- [ ] Receive notif app fermée
- [ ] Tap notif → ouvre conversation

---

#### Feature 14 : Thèmes

**Mobile & Web** :

- [x] Settings page
  - [x] Theme toggle :
    - [x] ☀️ Light
    - [x] 🌙 Dark
    - [ ] 🔄 System — ⚠️ Mobile: non implémenté / Web: ✅
- [x] 3 thèmes prédéfinis : — Web en a 8 !
  - [x] Classic (violet/rose)
  - [x] Kawaii (pastel)
  - [x] Pro (gris/bleu)
- [ ] Picker couleur accent (custom) — ❌ Pas de picker libre
- [x] Persistence prefs (Supabase)

**Tests** :

- [ ] Switch theme → instant update
- [ ] Sync multi-device

---

#### Feature 15 : Recherche

**Mobile** :

- [ ] Search bar (top conversations) — ❌ 0/10 — Entièrement absent
- [ ] Recherche par :
  - [ ] Nom contact
  - [ ] Contenu message
  - [ ] Date
- [ ] Filtres :
  - [ ] Type (text, image, audio)
  - [ ] Contact
- [ ] Highlights résultats

**Web** :

- [ ] Cmd+K → Search modal — ❌ cmdk installé mais inutilisé
- [ ] Même features — ❌ Seulement filtre local sidebar sur mock

**Backend** :

- [ ] Full-text search PostgreSQL — ❌ Stub en mémoire TF-IDF, pas de PG tsvector
- [ ] Index `messages.content` — ❌ Non implémenté

**Tests** :

- [ ] Search "projet" → 10 résultats < 200ms

---

#### Feature 16 : Mode Hors-ligne

**Mobile** :

- [ ] Cache conversations (SQLite) — ❌ 0/10 — netinfo installé mais inutilisé
- [ ] Queue messages (retry) — ❌ Non implémenté
- [ ] Indicateur "Offline" (banner top) — ❌ Non implémenté
- [ ] Sync auto reconnexion — ❌ Non implémenté

**Web** :

- [ ] IndexedDB cache — ❌ Non implémenté
- [ ] Same logic — ❌ Non implémenté

**Tests** :

- [ ] Airplane mode → send message → online → message arrive

---

#### Feature 17 : Onboarding

**Mobile & Web** :

- [ ] Welcome screens (3 slides) — ❌ 0/10 — Entièrement absent
  - [ ] 1. Communication sécurisée
  - [ ] 2. Appels vidéo HD
  - [ ] 3. Privacy-first
- [ ] Skip button — ❌ Non implémenté
- [ ] Tutorial interactif (optionnel) — ❌ Non implémenté
  - [ ] Highlight features first use

**Tests** :

- [ ] First-time user voit onboarding
- [ ] Returning user : skippé

**Livrable** : App polie, prête beta testing ✅

---

### 🧪 Semaine 8 : Beta Testing & Feedback (0 new features)

**Objectif** : Stabilisation + feedback utilisateurs

#### Beta Testing

- [ ] Recruter 50 beta testers
  - [ ] 20% étudiants
  - [ ] 30% familles
  - [ ] 30% pros
  - [ ] 20% tech-savvy
- [ ] Déployer TestFlight (iOS)
- [ ] Déployer Google Play Internal Testing
- [ ] Déployer Web (staging.imuchat.app)
- [ ] Onboarding beta testers :
  - [ ] Email welcome + instructions
  - [ ] Slack channel privé
  - [ ] Weekly surveys
  - [ ] In-app feedback form

#### Bug Fixes & Optimizations

- [ ] Triage bugs reported (P0/P1/P2)
- [ ] Fix critiques (crashes, data loss)
- [ ] Performance tuning
  - [ ] Reduce bundle size
  - [ ] Optimize images
  - [ ] Lazy loading
- [ ] Accessibility audit (WCAG AA)
- [ ] Security audit
  - [ ] Dependency scan
  - [ ] Penetration testing

#### Analytics & Monitoring

- [ ] Setup Sentry (crash reporting)
- [ ] Setup Posthog (product analytics)
- [ ] Define KPIs tracking
- [ ] Dashboard Grafana (backend metrics)

**Livrable** : Beta stable, feedback collecté ✅

---

### 🖥️ Semaine 9 : Desktop - Fondations (2 features)

**Features Livrées** :
18. ⚠️ **Desktop app packaging** — Structure Electron OK, pas de packaging
19. ⚠️ **Auth & Messagerie desktop** — Sidebar OK, auth/chat non intégrés

#### Feature 18 : Desktop Setup

- [x] Electron app structure — Réécrit avec vrai UI (Vite + React + TypeScript)
- [ ] Packaging :
  - [ ] Windows (.exe installer) — ❌ Non packagé
  - [ ] macOS (.dmg) — ❌ Non packagé
  - [ ] Linux (.AppImage, .deb) — ❌ Non packagé
- [ ] Native features :
  - [ ] Tray icon (systray) — ❌ Non implémenté
  - [ ] Context menu — ❌ Non implémenté
  - [ ] Auto-start option — ❌ Non implémenté
  - [ ] Deep links (imuchat://) — ❌ Non implémenté
  - [ ] Custom titlebar — ❌ Non implémenté

#### Feature 19 : Core Features Desktop

- [ ] Auth (shared avec web) — ❌ Pas encore intégré
- [x] Conversations list — Sidebar avec navigation
- [ ] Chat room — ⚠️ Page Messages existe mais basique
- [ ] Notifications desktop natives — ❌ Non implémenté
- [ ] Raccourcis clavier — ❌ Non implémenté
  - [ ] Cmd/Ctrl+N : New chat
  - [ ] Cmd/Ctrl+F : Search
  - [ ] Cmd/Ctrl+K : Quick actions
  - [ ] Cmd/Ctrl+, : Settings

**Tests** :

- [ ] Build Windows → install → login OK
- [ ] Build macOS → install → login OK

**Livrable** : Desktop app fonctionnelle (base) ✅

---

### 🖥️ Semaine 10 : Desktop - Video & Advanced (2 features)

**Features Livrées** :
20. ✅ **Appels vidéo desktop optimisés**
21. ✅ **Intégrations natives OS**

#### Feature 20 : Video Desktop

- [ ] Appels vidéo (priorité desktop)
- [ ] Qualité optimale (1080p default)
- [ ] Partage écran natif
- [ ] Multi-monitors support
- [ ] Recording local (optionnel)

#### Feature 21 : Intégrations OS

**macOS** :

- [ ] Touch Bar controls
- [ ] Notifications center
- [ ] Handoff (continuité iOS)

**Windows** :

- [ ] Taskbar progress (download)
- [ ] Jump lists (recent chats)
- [ ] Windows Hello (auth biometric)

**Linux** :

- [ ] System tray
- [ ] D-Bus notifications

**Tous** :

- [ ] Auto-update (electron-updater)
- [ ] Crash reporter
- [ ] Keychain/Credential Manager (passwords)

**Tests** :

- [ ] Auto-update fonctionne (staging)
- [ ] Notifications natives OK

**Livrable** : Desktop app complète ✅

---

### 🎨 Semaine 11 : Polish Multi-Plateforme (3 features)

**Features Livrées** :
22. ✅ **Parité features complète**
23. ✅ **Performance optimization**
24. ✅ **Accessibilité AA**

#### Feature 22 : Feature Parity Audit

- [ ] Checklist feature par feature
- [ ] Mobile === Web === Desktop
- [ ] UX consistency
- [ ] Fix discrepancies

#### Feature 23 : Performance

**Mobile** :

- [ ] Bundle size < 30MB
- [ ] App launch < 2s
- [ ] 60 FPS animations
- [ ] Memory < 150MB idle

**Web** :

- [ ] Lighthouse 90+
- [ ] Bundle < 500KB gzipped
- [ ] TTI < 1.5s
- [ ] Image lazy loading

**Desktop** :

- [ ] Launch < 3s
- [ ] RAM < 250MB idle

#### Feature 24 : Accessibilité

- [ ] Screen reader support
- [ ] Keyboard navigation complète
- [ ] Focus indicators visibles
- [ ] Contraste couleurs AA
- [ ] Font size scalable
- [ ] Alt texts images
- [ ] ARIA labels

**Tests** :

- [ ] Audit axe DevTools
- [ ] Test manual (screen reader)

**Livrable** : Apps optimisées, accessibles ✅

---

### 🚀 Semaine 12 : Launch Preparation (0 new features)

**Objectif** : Déploiement production + lancement public

#### Pre-Launch Checklist

**Technique** :

- [ ] Smoke tests production
- [ ] Load testing (1000 users simultanés)
- [ ] Backup stratégie validated
- [ ] Monitoring dashboards live
- [ ] On-call rotation setup
- [ ] Rollback plan documented

**Stores** :

- [ ] iOS App Store
  - [ ] Metadata (FR, EN)
  - [ ] Screenshots (toutes tailles)
  - [ ] App preview video
  - [ ] Privacy details
  - [ ] Submit review
- [ ] Google Play Store
  - [ ] Même process
- [ ] Windows Store (optionnel)
- [ ] macOS App Store (optionnel)

**Marketing** :

- [ ] Site vitrine updated (lien download)
- [ ] Press kit published
- [ ] Blog post annonce
- [ ] Social media posts prepared
- [ ] Product Hunt launch scheduled
- [ ] Email blast waitlist
- [ ] Paid ads (optionnel)

#### Launch Day 🚀

**Matin** :

- [ ] 8h : Deploy production (phased rollout)
- [ ] 9h : Monitor metrics (crash, errors)
- [ ] 10h : Public announcement (social, email)

**Après-midi** :

- [ ] 14h : Product Hunt launch
- [ ] 15h : Press outreach
- [ ] 16h : Community engagement (réponses)

**Soir** :

- [ ] 20h : Review jour 1 metrics
- [ ] 21h : Célébration équipe 🎉

#### Post-Launch (Semaine 13-16)

**Semaine 13 : Surveillance intensive**

- [ ] Monitoring 24/7 (shifts)
- [ ] Bug fixes hotfixes
- [ ] Support users réactif (< 2h)
- [ ] Collect feedback

**Semaine 14-16 : Stabilisation**

- [ ] Patch releases (bugs mineurs)
- [ ] Performance tuning
- [ ] Feature flags rollout progressif
- [ ] Plan V1.1 (based on feedback)

**Livrable** : MVP ImuChat lancé publiquement ! 🎉

---

## 📊 Récapitulatif Features

### Total Features MVP : 24

| Catégorie | Features | % Total |
|-----------|----------|---------|
| **Auth & Profils** | 2 | 8% |
| **Messagerie** | 9 | 38% |
| **Appels** | 3 | 13% |
| **UX & Polish** | 7 | 29% |
| **Desktop** | 3 | 13% |

### Priorité Business Value

**Tier 1 (Must-Have)** : 15 features

- Auth (2)
- Chat base (5)
- Appels (3)
- Notifications (1)
- Thèmes (1)
- Onboarding (1)
- Desktop base (2)

**Tier 2 (Should-Have)** : 6 features

- Messagerie rich (4)
- Recherche (1)
- Mode hors-ligne (1)

**Tier 3 (Nice-to-Have)** : 3 features

- Desktop avancé (2)
- Performance opt (1)

---

## 🎯 Metrics de Succès par Phase

### Phase 1 (Semaine 8) - Beta Ready

- [ ] 200+ beta signups
- [ ] Crash rate < 1%
- [ ] Average session > 5min
- [ ] Message latency < 500ms (P90)
- [ ] NPS > 30 (beta testers)

### Phase 2 (Semaine 12) - Launch

- [ ] 1.000+ downloads (week 1)
- [ ] 200+ DAU
- [ ] Retention D7 > 30%
- [ ] 10.000+ messages sent
- [ ] App Store rating > 4.0

---

## 📚 Ressources par Semaine

### Planning Équipe (Exemple)

| Semaine | Mobile | Web | Backend | Desktop | Design | QA |
|---------|--------|-----|---------|---------|--------|-------|
| 1 | 2 | 2 | 1 | 0 | 1 | 0 |
| 2 | 2 | 2 | 1 | 0 | 1 | 0.5 |
| 3-4 | 2 | 2 | 1 | 0 | 0.5 | 0.5 |
| 5-6 | 2 | 1 | 1 | 0 | 0.5 | 0.5 |
| 7 | 2 | 2 | 0.5 | 0 | 0.5 | 1 |
| 8 | 1 | 1 | 0.5 | 0 | 0 | 1.5 |
| 9-10 | 0.5 | 0.5 | 0.5 | 2 | 0.5 | 0.5 |
| 11 | 1 | 1 | 0 | 1 | 0.5 | 1 |
| 12 | 0.5 | 0.5 | 0.5 | 0.5 | 0 | 1 |

**Total** : ~7 FTE moyens sur 12 semaines

---

## 📈 Bilan Réel d'Implémentation (Audit Code)

> **Dernière mise à jour** : Audit automatisé du code source (mobile/, web-app/, platform-core/)

### Scorecard par Feature (24 features)

| # | Feature | Mobile | Web | Backend | Status Global |
|---|---------|--------|-----|---------|---------------|
| 1 | Auth System | 8/10 | 7/10 | 10/10 | ✅ Solide |
| 2 | User Profiles | 7/10 | 8/10 | 8/10 | ✅ Solide |
| 3 | Conversations List | 6/10 | 5/10 ⚠️ MOCK | 5/10 | ⚠️ Partiel |
| 4 | Chat Room Texte | 7/10 | 5/10 ⚠️ MOCK | 5/10 | ⚠️ Partiel |
| 5 | Médias (Photos/Vidéos) | 10/10 | 8/10 | 8/10 | ✅ Excellent |
| 6 | Voice Messages | 10/10 | 10/10 | 8/10 | ✅ Excellent |
| 7 | Édition/Suppression | 0/10 | 0/10 | 3/10 | ❌ Non fait |
| 8 | Réactions | 9/10 | 2/10 stubs | 5/10 | ⚠️ Mobile seul |
| 9 | GIFs & Emojis | 0/10 | 0/10 | 0/10 | ❌ Non fait |
| 10 | Appels Audio | 8/10 | 8/10 | 9/10 | ✅ Solide |
| 11 | Appels Vidéo | 8/10 | 8/10 | 9/10 | ✅ Solide |
| 12 | Screen Sharing | 3/10 | 8/10 | 8/10 | ⚠️ Web seul |
| 13 | Notifications Push | 10/10 | 8/10 | 10/10 | ✅ Excellent |
| 14 | Thèmes | 7/10 | 9/10 | N/A | ✅ Solide |
| 15 | Recherche | 0/10 | 0/10 | 1/10 stub | ❌ Non fait |
| 16 | Mode Hors-ligne | 0/10 | 0/10 | N/A | ❌ Non fait |
| 17 | Onboarding | 0/10 | 0/10 | N/A | ❌ Non fait |
| 18 | Desktop Setup | N/A | N/A | N/A | ⚠️ Structure OK |
| 19 | Desktop Core Features | N/A | N/A | N/A | ⚠️ Basique |
| 20 | Video Desktop | N/A | N/A | N/A | ❌ Non démarré |
| 21 | Intégrations OS | N/A | N/A | N/A | ❌ Non démarré |
| 22 | Feature Parity | — | — | — | ❌ Non démarré |
| 23 | Performance Opt | — | — | — | ❌ Non démarré |
| 24 | Accessibilité AA | — | — | — | ❌ Non démarré |

### Résumé

- **✅ Complètes (7/24)** : Auth, Profils, Médias, Voice, Audio Calls, Video Calls, Notifications
- **⚠️ Partielles (5/24)** : Conversations, Chat Room, Réactions, Screen Sharing, Desktop (18-19)
- **❌ Non faites (12/24)** : Edit/Delete, GIFs, Recherche, Offline, Onboarding, Desktop avancé (20-24)

### Problèmes Critiques Transversaux

1. **Web-app : 100% MOCK_DATA** pour le chat — Aucune vraie connexion Supabase pour les messages
2. **Backend : Modules en mémoire** — ChatEngineModule stocke tout dans des `Map`, pas de persistance DB
3. **Pas de routes REST** pour conversations/messages/profiles/contacts/reactions
4. **Schéma Drizzle désynchronisé** du SQL Supabase (table `users` vs `profiles`)
5. **Forgot Password web CASSÉ** — lien mort href="#", page inexistante
6. **Middleware web = i18n seulement** — Pas de SSR auth guard
7. **Socket.IO hardcodé localhost** — Non prêt pour production

### Tests

- **Mobile** : 22 suites, 281 tests, 0 failures ✅
- **Web** : 95/96 suites, 905 tests, 0 failures ✅
- **Total** : 117 suites, 1186 tests, 0 failures
- **E2E** : ❌ Aucun test end-to-end

---

## 🎬 Conclusion

### Vision Complète

**Semaine 1** → Setup ✅  
**Semaine 8** → Beta Ready ⚠️ (en cours, ~55% features complètes)
**Semaine 12** → Launch Public 🚀

**MVP ImuChat** = 24 features essentielles pour une messagerie moderne, sécurisée et multi-plateforme.

### Prochaines Étapes Prioritaires

1. ✅ Setup infrastructure (Semaine 1) — FAIT
2. ✅ Auth + Profils (Semaine 2) — FAIT
3. ✅ Messagerie base + Médias + Voice (Semaines 3-4) — FAIT (partiel web)
4. ✅ Appels Audio/Vidéo (Semaines 5-6) — FAIT
5. ✅ Notifications + Thèmes (Semaine 7) — FAIT
6. 🔴 **P0 : Connecter web-app au vrai backend** (remplacer MOCK_DATA)
7. 🔴 **P0 : Ajouter persistance DB** aux modules backend
8. 🟡 **P1 : Implémenter Edit/Delete, Search, Offline**
9. 🟡 **P1 : Fixer Forgot Password web + middleware auth**
10. 🟢 **P2 : Desktop packaging + features avancées**
11. 🟢 **P2 : Onboarding, GIFs, Feature Parity, Performance**

---

**Document créé** : 12 février 2026
**Version** : 2.0 — Mise à jour audit code réel
**Dernière review** : Audit automatisé du code source

---

*🗓️ 55% du MVP est implémenté. Priorité : connecter le vrai backend au frontend web.*
