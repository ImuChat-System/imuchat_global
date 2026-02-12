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
- [ ] Database schema déployé (tables principales)
- [ ] Repos configurés (.env, dependencies)

#### Design System

- [ ] Palette couleurs ImuChat définie
- [ ] Tokens design exportés (spacing, typography)
- [ ] Composants UI base Mobile :
  - [ ] Button (3 variants)
  - [ ] Input (text, email, password)
  - [ ] Avatar (image + fallback)
  - [ ] Card container
  - [ ] Text components (H1-H6, Body, Caption)
- [ ] Composants UI base Web :
  - [ ] shadcn/ui configuré
  - [ ] Button
  - [ ] Input
  - [ ] Card
  - [ ] Avatar

#### Navigation

- [ ] **Mobile** : Expo Router structure
  - [ ] /auth (stack)
  - [ ] /(tabs) (bottom tabs)
  - [ ] /chat/[id] (modal)
- [ ] **Web** : Next.js App Router
  - [ ] /login
  - [ ] /signup
  - [ ] /app/* (protected)

**Livrable** : Apps lancent localement ✅

---

### 🔐 Semaine 2 : Authentification & Profils (2 features)

**Features Livrées** :

1. ✅ **Authentification complète**
2. ✅ **Profil utilisateur basique**

#### Feature 1 : Auth System

**Mobile** :

- [ ] Écran Welcome (onboarding)
- [ ] Écran Login
  - [ ] Email + Password
  - [ ] Validation erreurs
  - [ ] Loading states
  - [ ] "Forgot password" link
- [ ] Écran Signup
  - [ ] Email, Password, Confirm Password
  - [ ] Validation temps réel
  - [ ] Terms acceptance
- [ ] Écran Forgot Password
  - [ ] Email input
  - [ ] Reset link sent confirmation
- [ ] Session persistence (AsyncStorage)
- [ ] Auto-login si session valide

**Web** :

- [ ] Page `/login`
- [ ] Page `/signup`
- [ ] Page `/forgot-password`
- [ ] Middleware auth protection
- [ ] Session cookies (SSR)
- [ ] Redirect si authenticated

**Backend** :

- [ ] Supabase Auth configured
- [ ] Email verification templates
- [ ] Password reset flow
- [ ] RLS policies (profiles table)

**Tests** :

- [ ] Unit tests : Auth hooks
- [ ] E2E : Signup → Email → Login

---

#### Feature 2 : User Profiles

**Mobile** :

- [ ] Écran Setup Profile (first-time)
  - [ ] Avatar upload (caméra/galerie)
  - [ ] Display name input
  - [ ] Bio textarea (optionnel)
  - [ ] Skip button
- [ ] Écran Profile View
  - [ ] Avatar display
  - [ ] Username, Bio, Status
  - [ ] "Edit Profile" button
- [ ] Écran Edit Profile
  - [ ] Change avatar
  - [ ] Edit display name
  - [ ] Edit bio
  - [ ] Edit status emoji
  - [ ] Save changes

**Web** :

- [ ] Page `/profile`
- [ ] Modal "Edit Profile"
- [ ] Avatar crop tool

**Backend** :

- [ ] `profiles` table avec RLS
- [ ] Trigger auto-create profile on signup
- [ ] Supabase Storage bucket `avatars`
- [ ] Image resize Edge Function

**Tests** :

- [ ] Upload avatar < 5MB
- [ ] Profile updates persist

**Livrable** : User peut s'inscrire, se connecter, voir son profil ✅

---

### 💬 Semaine 3 : Messagerie Base (3 features)

**Features Livrées** :
3. ✅ **Liste conversations**
4. ✅ **Chat room 1:1 texte**
5. ✅ **Envoi médias**

#### Feature 3 : Conversations List

**Mobile** :

- [ ] Tab "Chats" (bottom nav)
- [ ] Liste conversations
  - [ ] Avatar contact
  - [ ] Nom conversation
  - [ ] Dernier message preview
  - [ ] Timestamp
  - [ ] Badge unread count
  - [ ] Status en ligne (dot vert)
- [ ] Pull-to-refresh
- [ ] Swipe actions (archive, delete)
- [ ] Empty state (no conversations yet)
- [ ] FAB "New Chat" button

**Web** :

- [ ] Sidebar conversations
- [ ] Search bar
- [ ] Même UI que mobile (responsive)

**Backend** :

- [ ] `conversations` table
- [ ] `conversation_members` table
- [ ] Endpoints :
  - GET `/conversations` (user's conversations)
  - POST `/conversations` (create new)
- [ ] Realtime subscription setup

**Tests** :

- [ ] Conversations sorted by last message
- [ ] Unread count correct

---

#### Feature 4 : Chat Room (Texte)

**Mobile** :

- [ ] Écran Chat `/chat/[id]`
- [ ] Header chat
  - [ ] Avatar contact
  - [ ] Nom + status
  - [ ] Actions (call, video, info)
- [ ] Message list
  - [ ] Bubble sender (right)
  - [ ] Bubble receiver (left)
  - [ ] Timestamp
  - [ ] Double check (sent/delivered/read)
  - [ ] Infinite scroll (load older)
- [ ] Input message
  - [ ] Textarea auto-expand
  - [ ] Send button
  - [ ] Emoji picker
- [ ] Typing indicator
  - [ ] "Alice is typing..."
- [ ] Read receipts
  - [ ] Mark as read on open
- [ ] Real-time updates
  - [ ] New messages appear instantly
  - [ ] Scroll to bottom on new message

**Web** :

- [ ] Main chat area
- [ ] Même features que mobile
- [ ] Raccourcis clavier :
  - [ ] Enter → Send
  - [ ] Shift+Enter → New line
  - [ ] Cmd+K → Search

**Backend** :

- [ ] `messages` table avec index
- [ ] INSERT message endpoint
- [ ] UPDATE read_at field
- [ ] Realtime broadcast channel
  - [ ] New messages
  - [ ] Typing indicators
  - [ ] Read receipts
- [ ] Pagination (50 messages/page)

**Tests** :

- [ ] Message envoyé < 500ms
- [ ] Realtime sync multi-device
- [ ] Persistence après refresh

---

#### Feature 5 : Médias (Photos/Videos)

**Mobile** :

- [ ] Input toolbar icons
  - [ ] 📷 Camera
  - [ ] 🖼️ Gallery
  - [ ] 😀 Emoji
- [ ] Image picker
  - [ ] Permission caméra/galerie
  - [ ] Preview before send
  - [ ] Crop/rotate optionnel
- [ ] Media message bubble
  - [ ] Thumbnail dans chat
  - [ ] Tap → Full screen viewer
  - [ ] Download/share options
- [ ] Video upload
  - [ ] Max 100MB
  - [ ] Progress bar
  - [ ] Thumbnail generation

**Web** :

- [ ] File upload button
- [ ] Drag & drop files
- [ ] Preview modal

**Backend** :

- [ ] Supabase Storage bucket `messages-media`
- [ ] Upload signed URL generation
- [ ] Thumbnail generation (Edge Function)
- [ ] Compression images (< 1MB)
- [ ] Message `type: 'image'|'video'`

**Tests** :

- [ ] Upload image 5MB → success
- [ ] Upload video 100MB → success
- [ ] Preview displays correctly

**Livrable** : Chat 1:1 texte + médias fonctionnel ✅

---

### 💬 Semaine 4 : Messagerie Avancée (4 features)

**Features Livrées** :
6. ✅ **Messages vocaux**
7. ✅ **Édition/Suppression**
8. ✅ **Réactions**
9. ✅ **GIFs & Emojis**

#### Feature 6 : Voice Messages

**Mobile** :

- [ ] Bouton microphone (hold to record)
- [ ] Recording UI
  - [ ] Waveform animation
  - [ ] Timer (max 2min)
  - [ ] Cancel (swipe left)
  - [ ] Send (release)
- [ ] Voice message bubble
  - [ ] Play/Pause button
  - [ ] Waveform static
  - [ ] Duration display
  - [ ] Progress bar
- [ ] Audio player
  - [ ] Playback speed (1x, 1.5x, 2x)
  - [ ] Seek bar

**Web** :

- [ ] Microphone permission
- [ ] Desktop recording UI
- [ ] Même player que mobile

**Backend** :

- [ ] Storage bucket `voice-notes`
- [ ] Audio compression (MP3/AAC)
- [ ] Transcription IA (optionnel)
  - [ ] Whisper API integration
  - [ ] Display text below audio
- [ ] Message `type: 'audio'`

**Tests** :

- [ ] Record 30s → send → play
- [ ] Transcription < 10s

---

#### Feature 7 : Édition & Suppression

**Mobile** :

- [ ] Long press message → Menu
  - [ ] ✏️ Edit (si < 15min)
  - [ ] 🗑️ Delete
  - [ ] 📋 Copy
  - [ ] 🔗 Reply
- [ ] Edit mode
  - [ ] Input pré-rempli
  - [ ] "Editing" indicator
  - [ ] Save/Cancel
- [ ] Delete confirmation
  - [ ] "Delete for me" / "Delete for everyone"
- [ ] Deleted message display
  - [ ] "🚫 Message deleted"
  - [ ] Timestamp kept

**Web** :

- [ ] Right-click context menu
- [ ] Hover actions

**Backend** :

- [ ] UPDATE message (set edited_at)
- [ ] Soft delete (set deleted_at)
- [ ] Edit history (JSONB field)
- [ ] Broadcast edit/delete events

**Tests** :

- [ ] Edit message → other sees update
- [ ] Delete → other sees deleted state

---

#### Feature 8 : Reactions

**Mobile** :

- [ ] Long press message → Quick reactions
  - [ ] ❤️ 👍 😂 😮 😢 🙏
- [ ] Tap reaction → Remove
- [ ] Reaction counts below bubble
  - [ ] "❤️ 3  👍 1"
- [ ] Tap count → See who reacted

**Web** :

- [ ] Hover → Reaction picker
- [ ] Click reaction

**Backend** :

- [ ] `message_reactions` table
- [ ] INSERT/DELETE reaction
- [ ] Aggregate counts query
- [ ] Realtime broadcast reactions

**Tests** :

- [ ] Add reaction → other sees instantly
- [ ] Same user can't react twice with same emoji

---

#### Feature 9 : GIFs & Emojis Enrichis

**Mobile** :

- [ ] Emoji picker
  - [ ] Categories (smileys, people, animals...)
  - [ ] Search emojis
  - [ ] Skin tone selector
- [ ] GIF picker
  - [ ] GIPHY integration
  - [ ] Trending GIFs
  - [ ] Search GIFs
  - [ ] Preview hover
- [ ] Send GIF as message (URL embed)

**Web** :

- [ ] Même UI
- [ ] Keyboard shortcut : Cmd+Shift+G

**Backend** :

- [ ] GIPHY API key
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

- [ ] Bouton appel audio (header chat)
- [ ] Écran appel sortant
  - [ ] Avatar contact
  - [ ] "Calling..."
  - [ ] Cancel button
  - [ ] Ringtone
- [ ] Écran appel entrant (modal)
  - [ ] Avatar, nom contact
  - [ ] Accept / Reject
  - [ ] Custom ringtone
- [ ] Écran appel actif
  - [ ] Durée
  - [ ] 🔇 Mute button
  - [ ] 🔊 Speaker/Bluetooth toggle
  - [ ] ❌ Hang up (rouge)
  - [ ] Keyboard toggle (DTMF)
- [ ] CallKit integration (iOS)
  - [ ] Écran verrouillage
  - [ ] History appels
- [ ] ConnectionService (Android)
  - [ ] Même features

**Web** :

- [ ] Même UI (browser permissions)
- [ ] Desktop notifications

**Backend (Stream SDK)** :

- [ ] Create call session
- [ ] WebRTC signaling
- [ ] TURN/STUN servers
- [ ] Call logs table
  - [ ] caller_id, callee_id
  - [ ] start_time, end_time, duration
  - [ ] type: 'audio'

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

- [ ] Bouton appel vidéo (header)
- [ ] Écran appel vidéo actif
  - [ ] Video remote (fullscreen)
  - [ ] Video locale (PiP, top-right)
  - [ ] Controls overlay
    - [ ] 🎥 Toggle camera on/off
    - [ ] 🔁 Flip camera (front/back)
    - [ ] 🔇 Mute
    - [ ] ❌ Hang up
  - [ ] PiP mode
    - [ ] Mini-fenêtre flottante
    - [ ] Draggable
    - [ ] Tap → fullscreen
- [ ] Quality adaptative
  - [ ] 360p (bad network)
  - [ ] 720p (good)
  - [ ] 1080p (excellent)
- [ ] Reconnexion auto (< 5s disconnect)

**Web/Desktop** :

- [ ] Fullscreen mode
- [ ] Same controls
- [ ] Meilleure qualité (1080p default)

**Backend** :

- [ ] Stream Video call type: 'video'
- [ ] Bandwidth detection
- [ ] Recording (optionnel)

**Tests** :

- [ ] Video streams display
- [ ] Flip camera works
- [ ] PiP fonctionnel

---

#### Feature 12 : Screen Sharing

**Mobile** :

- [ ] Android : Screen capture permission
- [ ] iOS : Broadcast upload extension (complexe, v1.1)
- [ ] Viewer : See shared screen

**Web/Desktop** :

- [ ] Button "Share Screen"
- [ ] Browser native picker (window/tab/screen)
- [ ] Stop sharing button
- [ ] Quality 720p @ 15fps

**Backend** :

- [ ] Screen track type in Stream

**Tests** :

- [ ] Share screen web → mobile voit
- [ ] Performance OK (< 30% CPU)

**Livrable** : Appels vidéo + screen sharing ✅

---

### ✨ Semaine 7 : Polish & UX (5 features)

**Features Livrées** :
13. ✅ **Notifications push**
14. ✅ **Thèmes clair/sombre**
15. ✅ **Recherche conversations**
16. ✅ **Mode hors-ligne**
17. ✅ **Onboarding**

#### Feature 13 : Notifications Push

**Mobile** :

- [ ] Permission prompt (first-time)
- [ ] FCM token registration
- [ ] Notification types :
  - [ ] New message (avec preview)
  - [ ] Incoming call
  - [ ] Mention (future)
- [ ] Actions rapides
  - [ ] Reply inline
  - [ ] Mark as read
- [ ] Badge count app icon
- [ ] Silent mode / DND

**Web** :

- [ ] Service Worker setup
- [ ] Push API subscription
- [ ] Desktop notifications (Chrome/Edge)

**Backend** :

- [ ] Firebase Functions
  - [ ] Send push on new message
  - [ ] Send push on call
- [ ] Store FCM tokens (devices table)

**Tests** :

- [ ] Receive notif app fermée
- [ ] Tap notif → ouvre conversation

---

#### Feature 14 : Thèmes

**Mobile & Web** :

- [ ] Settings page
  - [ ] Theme toggle :
    - [ ] ☀️ Light
    - [ ] 🌙 Dark
    - [ ] 🔄 System
- [ ] 3 thèmes prédéfinis :
  - [ ] Classic (violet/rose)
  - [ ] Kawaii (pastel)
  - [ ] Pro (gris/bleu)
- [ ] Picker couleur accent (custom)
- [ ] Persistence prefs (Supabase)

**Tests** :

- [ ] Switch theme → instant update
- [ ] Sync multi-device

---

#### Feature 15 : Recherche

**Mobile** :

- [ ] Search bar (top conversations)
- [ ] Recherche par :
  - [ ] Nom contact
  - [ ] Contenu message
  - [ ] Date
- [ ] Filtres :
  - [ ] Type (text, image, audio)
  - [ ] Contact
- [ ] Highlights résultats

**Web** :

- [ ] Cmd+K → Search modal
- [ ] Même features

**Backend** :

- [ ] Full-text search PostgreSQL
- [ ] Index `messages.content`

**Tests** :

- [ ] Search "projet" → 10 résultats < 200ms

---

#### Feature 16 : Mode Hors-ligne

**Mobile** :

- [ ] Cache conversations (SQLite)
- [ ] Queue messages (retry)
- [ ] Indicateur "Offline" (banner top)
- [ ] Sync auto reconnexion

**Web** :

- [ ] IndexedDB cache
- [ ] Same logic

**Tests** :

- [ ] Airplane mode → send message → online → message arrive

---

#### Feature 17 : Onboarding

**Mobile & Web** :

- [ ] Welcome screens (3 slides)
  - [ ] 1. Communication sécurisée
  - [ ] 2. Appels vidéo HD
  - [ ] 3. Privacy-first
- [ ] Skip button
- [ ] Tutorial interactif (optionnel)
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
18. ✅ **Desktop app packaging**
19. ✅ **Auth & Messagerie desktop**

#### Feature 18 : Desktop Setup

- [ ] Electron app structure
- [ ] Packaging :
  - [ ] Windows (.exe installer)
  - [ ] macOS (.dmg)
  - [ ] Linux (.AppImage, .deb)
- [ ] Native features :
  - [ ] Tray icon (systray)
  - [ ] Context menu
  - [ ] Auto-start option
  - [ ] Deep links (imuchat://)
  - [ ] Custom titlebar

#### Feature 19 : Core Features Desktop

- [ ] Auth (shared avec web)
- [ ] Conversations list
- [ ] Chat room
- [ ] Notifications desktop natives
- [ ] Raccourcis clavier
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

## 🎬 Conclusion

### Vision Complète

**Semaine 1** → Setup  
**Semaine 8** → Beta Ready  
**Semaine 12** → Launch Public 🚀

**MVP ImuChat** = 24 features essentielles pour une messagerie moderne, sécurisée et multi-plateforme.

### Prochaines Étapes

1. ✅ Valider roadmap avec équipe
2. ✅ Setup infrastructure (Semaine 1)
3. ✅ Kick-off Sprint 1 (Auth)
4. 📅 Daily standups + weekly reviews
5. 🚀 Ship MVP en 12 semaines !

---

**Document créé** : 12 février 2026  
**Version** : 1.0  
**Prochaine review** : Fin Sprint 2 (Semaine 2)

---

*🗓️ La roadmap est claire. Let's execute!*
