# 🚀 Plan de Développement Frontend MVP - 3 Semaines

> **Date de création** : 19 février 2026  
> **Approche** : Frontend-First (MVP déployable rapidement)  
> **État actuel** : Infrastructure ✅ + Auth ✅ + Chat ✅ + Web Shell ✅  
> **Objectif** : MVP complet et fonctionnel en 3 semaines

---

## 📊 État Actuel - Ce qui est FAIT

### ✅ Infrastructure & Configuration

- **Supabase** : DB + Auth + Realtime + Storage configurés
- **Stream SDK** : Backend complet avec 4 API routes
- **Firebase** : Analytics + Push Notifications (services créés)
- **Platform-Core** : 20+ modules disponibles, architecture modulaire
- **Monorepo** : pnpm workspace avec shared packages

### ✅ Backend API Endpoints Disponibles

```typescript
// Supabase (Auth + DB + Realtime)
✅ POST /auth/v1/signup
✅ POST /auth/v1/token (login)
✅ POST /auth/v1/recover (forgot password)
✅ Realtime subscriptions (messages, typing, presence)
✅ Storage API (upload/download)

// Stream API (platform-core)
✅ POST /api/v1/stream/token          // Générer token utilisateur
✅ POST /api/v1/stream/call           // Créer appel
✅ DELETE /api/v1/stream/call/:id     // Terminer appel
✅ GET /api/v1/stream/health          // Health check
```

### ✅ Frontend Complété

#### Mobile (React Native / Expo)
- **Auth screens** : Login, Signup, Forgot Password
- **Chat screens** : Conversations list, Chat room
- **UI structure** : 6 tabs (Home, Chats, Social, Watch, Store, Profile)
- **Hooks** : useAuth, useChat, useNotifications, useCalls

#### Web-App (Next.js)
- **App Shell** : Layout 3 colonnes (Sidebar, Main, RightPanel)
- **Navigation** : Sidebar avec 8 routes, TopBar responsive
- **Auth pages** : Login, Signup, Forgot Password
- **Chat pages** : Conversations list, Chat room
- **Dashboard** : Stats cards, Recent conversations, Quick actions
- **Hooks** : useAuth, useChat, useNotifications, useCalls

### ✅ Services & Hooks Créés (Prêts à utiliser)

```typescript
// Mobile
✅ mobile/hooks/useAuth.ts
✅ mobile/hooks/useChat.ts
✅ mobile/hooks/useNotifications.ts (138 lignes)
✅ mobile/hooks/useCalls.ts (257 lignes)
✅ mobile/services/notifications.ts (356 lignes)
✅ mobile/services/calls.ts (392 lignes)

// Web
✅ web-app/src/hooks/useAuth.ts
✅ web-app/src/hooks/useChat.ts
✅ web-app/src/hooks/useNotifications.ts (190 lignes)
✅ web-app/src/hooks/useCalls.ts (324 lignes)
✅ web-app/src/lib/notifications.ts (414 lignes)
✅ web-app/src/lib/calls.ts (480 lignes)
```

---

## 🎯 Ce qui RESTE à Faire - 3 Semaines

### 📅 Semaine 1 : Appels Vidéo + Notifications (Priorité P0)

**Objectif** : Implémenter les écrans d'appels et les notifications push

#### Jour 1-2 : Écrans Appels (Mobile + Web)

##### Mobile (React Native)
```typescript
// Fichiers à créer :
✅ mobile/app/call/incoming.tsx        // Écran appel entrant
✅ mobile/app/call/active.tsx          // Écran appel actif
✅ mobile/app/call/outgoing.tsx        // Écran appel sortant
✅ mobile/components/CallControls.tsx  // Boutons mute, vidéo, hang up
✅ mobile/components/ParticipantView.tsx // Affichage participant

// Utiliser :
- useCalls hook (déjà créé)
- @stream-io/video-react-native-sdk
- Composants UI-Kit : KawaiiButton, UserAvatar, KawaiiModal
```

**Fonctionnalités** :
- ✅ Appel entrant avec sonnerie + accepter/refuser
- ✅ Appel sortant avec statut "en attente"
- ✅ Appel actif avec contrôles (mute, vidéo on/off, hang up)
- ✅ Basculer caméra avant/arrière
- ✅ Mode Picture-in-Picture
- ✅ Gestion reconnexion automatique

##### Web (Next.js)
```typescript
// Fichiers à créer :
✅ web-app/src/app/(app)/calls/incoming/page.tsx
✅ web-app/src/app/(app)/calls/active/page.tsx
✅ web-app/src/app/(app)/calls/outgoing/page.tsx
✅ web-app/src/components/calls/CallControls.tsx
✅ web-app/src/components/calls/ParticipantView.tsx
✅ web-app/src/components/calls/CallNotification.tsx // Desktop notification

// Utiliser :
- useCalls hook (déjà créé)
- @stream-io/video-react-sdk (web)
- shadcn components
```

**Fonctionnalités** :
- ✅ Appel entrant avec notification desktop
- ✅ Appel sortant avec modal
- ✅ Appel actif en plein écran
- ✅ Partage d'écran (desktop)
- ✅ Raccourcis clavier (M = mute, V = vidéo, Esc = hang up)
- ✅ Picture-in-Picture natif

**Critères d'acceptation** :
- [ ] Appel établi en < 3 secondes
- [ ] Qualité vidéo adaptative (360p-1080p)
- [ ] Reconnexion automatique si déconnexion < 5s
- [ ] Notifications système (CallKit iOS, ConnectionService Android)
- [ ] Historique appels sauvegardé (call_logs table)

---

#### Jour 3 : Notifications Push (Mobile + Web)

##### Mobile (React Native)
```typescript
// Fichiers à créer :
✅ mobile/components/NotificationPrompt.tsx  // Permission prompt
✅ mobile/app/(tabs)/notifications.tsx       // Liste notifications (optionnel)

// Modifier :
✅ mobile/app/_layout.tsx                   // Initialiser notifications

// Utiliser :
- useNotifications hook (déjà créé)
- expo-notifications
- Firebase Cloud Messaging
```

**Fonctionnalités** :
- ✅ Permission prompt au premier lancement
- ✅ Notifications foreground (in-app)
- ✅ Notifications background (push natif)
- ✅ Tap notification → ouvrir conversation/appel
- ✅ Badge count sur icône app
- ✅ Sons personnalisés (optionnel)

##### Web (Next.js)
```typescript
// Fichiers à créer :
✅ web-app/src/components/NotificationPermissionPrompt.tsx
✅ web-app/src/components/NotificationCenter.tsx  // Dropdown notifications
✅ web-app/src/app/(app)/notifications/page.tsx  // Page dédiée (optionnel)

// Modifier :
✅ web-app/src/app/layout.tsx  // Initialiser service worker
✅ web-app/src/components/layout/TopBar.tsx  // Badge count

// Utiliser :
- useNotifications hook (déjà créé)
- firebase-messaging-sw.js (déjà créé)
- Notification API Web
```

**Fonctionnalités** :
- ✅ Permission prompt (modal élégante)
- ✅ Notifications desktop avec actions
- ✅ NotificationCenter dans TopBar
- ✅ Badge count temps réel
- ✅ Mark as read / Delete
- ✅ Filtres : All, Unread, Mentions

**Critères d'acceptation** :
- [ ] Permission prompt s'affiche au bon moment (pas intrusif)
- [ ] Notifications reçues en < 1 seconde (FCM)
- [ ] Tap notification ouvre bonne route
- [ ] Badge count synchronisé mobile ↔ web
- [ ] Service Worker fonctionnel (web)

---

#### Jour 4 : Polish & Tests Semaine 1

**Tasks** :
- [ ] Tests unitaires composants appels (10+ tests)
- [ ] Tests notifications (permission, affichage, tap)
- [ ] Tests E2E : Initier appel, recevoir appel, accepter, raccrocher
- [ ] UI/UX review : animations, loading states, erreurs
- [ ] Performance : mémoire, CPU, reconnexion
- [ ] Documentation : README appels, README notifications

**Livrables Semaine 1** :
✅ Appels audio/vidéo 1-to-1 fonctionnels (mobile + web)  
✅ Notifications push configurées (mobile + web)  
✅ Tests automatisés  
✅ Documentation mise à jour

---

### 📅 Semaine 2 : Features Chat Avancées (Priorité P1)

**Objectif** : Enrichir l'expérience chat avec features temps réel

#### Jour 5-6 : Typing Indicators + Réactions Messages

##### Typing Indicators (Temps Réel)
```typescript
// Mobile
✅ mobile/components/chat/TypingIndicator.tsx
✅ mobile/hooks/useTypingIndicator.ts

// Web
✅ web-app/src/components/chat/TypingIndicator.tsx
✅ web-app/src/hooks/useTypingIndicator.ts

// Backend
✅ Supabase Realtime : broadcast "typing" event
// Pas besoin d'API custom, utiliser Supabase Realtime directement
```

**Fonctionnalités** :
- ✅ Détecter saisie utilisateur (debounce 300ms)
- ✅ Broadcast typing event via Supabase Realtime
- ✅ Afficher "Alice est en train d'écrire..."
- ✅ Animation dots (3 points)
- ✅ Timeout automatique après 5s

##### Réactions Messages
```typescript
// Mobile
✅ mobile/components/chat/MessageReactions.tsx
✅ mobile/components/chat/ReactionPicker.tsx

// Web
✅ web-app/src/components/chat/MessageReactions.tsx
✅ web-app/src/components/chat/ReactionPicker.tsx

// DB : table message_reactions déjà créée
```

**Fonctionnalités** :
- ✅ Long press message → Reaction picker
- ✅ 6 réactions rapides : ❤️ 👍 😂 😮 😢 🙏
- ✅ Compteur réactions par emoji
- ✅ Liste utilisateurs ayant réagi (hover/tap)
- ✅ Ajouter/retirer réaction temps réel

**Critères d'acceptation** :
- [ ] Typing indicator apparaît en < 300ms
- [ ] Réactions temps réel (< 500ms)
- [ ] Optimistic UI (réaction ajoutée immédiatement)
- [ ] Animation fluide (60fps)

---

#### Jour 7-8 : Upload Médias + Messages Vocaux

##### Upload Images/Vidéos
```typescript
// Mobile
✅ mobile/components/chat/MediaPicker.tsx
✅ mobile/components/chat/MediaPreview.tsx
✅ mobile/components/chat/ImageGallery.tsx

// Web
✅ web-app/src/components/chat/MediaUploader.tsx
✅ web-app/src/components/chat/MediaPreview.tsx
✅ web-app/src/components/chat/ImageLightbox.tsx

// Utiliser :
- Supabase Storage (upload direct, pas besoin backend custom)
- expo-image-picker (mobile)
- react-dropzone (web)
```

**Fonctionnalités** :
- ✅ Picker caméra/galerie (mobile)
- ✅ Drag & drop (web)
- ✅ Preview avant envoi
- ✅ Compression images (browser-image-compression)
- ✅ Upload multiple (max 5)
- ✅ Progress bar upload
- ✅ Thumbnail dans chat
- ✅ Lightbox fullscreen (tap pour agrandir)

##### Messages Vocaux
```typescript
// Mobile
✅ mobile/components/chat/VoiceRecorder.tsx
✅ mobile/components/chat/VoicePlayer.tsx

// Web
✅ web-app/src/components/chat/VoiceRecorder.tsx
✅ web-app/src/components/chat/VoicePlayer.tsx

// Utiliser :
- expo-av (mobile)
- react-media-recorder (web)
- Supabase Storage pour stocker .m4a/.webm
```

**Fonctionnalités** :
- ✅ Hold to record (mobile)
- ✅ Click to record (web)
- ✅ Waveform animation pendant enregistrement
- ✅ Durée max : 2 minutes
- ✅ Player avec play/pause, seek bar
- ✅ Transcription automatique IA (optionnel, post-upload)
- ✅ Vitesse lecture (1x, 1.5x, 2x)

**Critères d'acceptation** :
- [ ] Upload image < 5s (1MB)
- [ ] Compression réduit taille 50-70%
- [ ] Messages vocaux < 5MB
- [ ] Player fluide, seek précis
- [ ] Preview médias responsive

---

#### Jour 9 : Polish & Tests Semaine 2

**Tasks** :
- [ ] Tests upload médias (images, vidéos)
- [ ] Tests messages vocaux (record, play, seek)
- [ ] Tests réactions (add, remove, count)
- [ ] Tests typing indicators (affichage, timeout)
- [ ] UI/UX review : transitions, loading states
- [ ] Performance : mémoire, taille fichiers
- [ ] Documentation : README features chat

**Livrables Semaine 2** :
✅ Typing indicators temps réel  
✅ Réactions messages (6 emojis)  
✅ Upload images/vidéos  
✅ Messages vocaux (record + play)  
✅ Tests automatisés  
✅ Documentation

---

### 📅 Semaine 3 : Backend Endpoints + Polish Final (Priorité P1)

**Objectif** : Finaliser backend manquant + polish global

#### Jour 10-11 : Backend Endpoints Notifications & Media

##### Notifications API (platform-core)
```typescript
// Fichier à créer :
✅ platform-core/src/routes/notifications.ts

// Endpoints :
POST /api/v1/notifications/register-token
  Body: { userId, token, platform: 'ios' | 'android' | 'web' }
  Logic: Stocker token FCM dans DB (user_devices table)
  
POST /api/v1/notifications/send
  Body: { userId, title, body, data, type }
  Logic: Envoyer push via Firebase Admin SDK
  
GET /api/v1/notifications/history
  Query: { userId, limit, offset }
  Logic: Récupérer historique notifications DB

// Intégrer dans platform-core/src/index.ts
```

##### Media API (platform-core)
```typescript
// Fichier à créer :
✅ platform-core/src/routes/media.ts

// Endpoints :
POST /api/v1/media/upload-url
  Body: { fileName, fileType, fileSize }
  Logic: Générer presigned URL Supabase Storage
  Response: { uploadUrl, publicUrl, mediaId }
  
POST /api/v1/media/confirm-upload
  Body: { mediaId, conversationId }
  Logic: Valider upload, créer message avec media
  
GET /api/v1/media/:id
  Logic: Récupérer metadata media
  Response: { url, type, size, createdAt }

DELETE /api/v1/media/:id
  Logic: Supprimer media de Storage + DB
```

**Critères d'acceptation** :
- [ ] Endpoints testés avec curl/Postman
- [ ] Auth middleware (Firebase Admin)
- [ ] Error handling complet
- [ ] Rate limiting (10 req/sec)
- [ ] Logs structurés
- [ ] Documentation OpenAPI/Swagger

---

#### Jour 12 : Intégration Backend Endpoints dans Frontend

**Mobile** :
```typescript
// Modifier :
✅ mobile/services/notifications.ts
  - Appeler POST /register-token après permission granted
  - Utiliser GET /history pour liste notifications

✅ mobile/services/media.ts (créer)
  - Utiliser POST /upload-url avant upload
  - Appeler POST /confirm-upload après success
```

**Web** :
```typescript
// Modifier :
✅ web-app/src/lib/notifications.ts
  - Appeler POST /register-token (Service Worker)
  - Utiliser GET /history pour NotificationCenter

✅ web-app/src/lib/media.ts (créer)
  - Utiliser POST /upload-url avant upload
  - Appeler POST /confirm-upload après success
```

**Tests** :
- [ ] Upload image via API endpoint
- [ ] Envoyer notification depuis backend
- [ ] Recevoir notification sur mobile + web
- [ ] Vérifier token enregistré en DB

---

#### Jour 13-14 : Polish Final + Tests E2E

##### Polish UI/UX
- [ ] Animations transitions (framer-motion web, reanimated mobile)
- [ ] Loading states partout (skeleton screens)
- [ ] Error boundaries (affichage erreurs gracieux)
- [ ] Empty states (no conversations, no notifications)
- [ ] Dark mode polish (contraste, couleurs)
- [ ] Responsive final check (mobile, tablet, desktop)

##### Tests E2E Complets
```typescript
// Scénarios critiques :
✅ E2E 1: Auth flow complet
  - Signup → Login → Forgot Password → Reset → Login

✅ E2E 2: Chat conversation
  - Créer conversation → Envoyer message → Recevoir réponse
  - Ajouter réaction → Envoyer image → Envoyer vocal

✅ E2E 3: Appel vidéo
  - Initier appel → Recevoir appel → Accepter → Activer vidéo
  - Mute audio → Partage écran → Raccrocher

✅ E2E 4: Notifications
  - Activer permission → Recevoir notification
  - Tap notification → Ouvrir conversation
  - Mark as read → Delete

✅ E2E 5: Cross-platform sync
  - Envoyer message mobile → Recevoir web (< 1s)
  - Envoyer message web → Recevoir mobile (< 1s)
  - Typing indicator mobile → Afficher web
```

##### Performance Optimization
- [ ] Lighthouse score > 90 (web)
- [ ] Bundle size < 500KB (initial load)
- [ ] Images lazy loading
- [ ] Code splitting (dynamic imports)
- [ ] Memoization composants (React.memo)
- [ ] Virtual scrolling conversations (react-window)

##### Documentation Finale
- [ ] README.md global mis à jour
- [ ] API documentation (Swagger)
- [ ] User guide (captures écran)
- [ ] Developer onboarding updated
- [ ] Deployment guide (mobile + web)

**Livrables Semaine 3** :
✅ Backend endpoints notifications + media  
✅ Frontend intégré avec nouveaux endpoints  
✅ Tests E2E complets (5 scénarios)  
✅ UI/UX polish  
✅ Performance optimisée  
✅ Documentation complète  
✅ **MVP PRÊT À DÉPLOYER** 🚀

---

## 📊 Checklist MVP Complet

### Features Essentielles

#### Authentification
- [x] Signup avec email/password
- [x] Login avec email/password
- [x] Forgot password / Reset password
- [x] Logout
- [x] Session persistence
- [ ] OAuth (Google, Apple) - Post-MVP

#### Messagerie
- [x] Liste conversations
- [x] Chat room temps réel
- [x] Envoyer message texte
- [x] Accusés de lecture (read receipts)
- [ ] Typing indicators
- [ ] Réactions messages (emojis)
- [ ] Édition message (15min après envoi)
- [ ] Suppression message
- [ ] Messages vocaux
- [ ] Upload images/vidéos
- [ ] Recherche dans conversation - Post-MVP

#### Appels Audio/Vidéo
- [ ] Appel audio 1-to-1
- [ ] Appel vidéo 1-to-1
- [ ] Écran appel entrant
- [ ] Écran appel actif
- [ ] Contrôles (mute, vidéo on/off, hang up)
- [ ] Partage d'écran (web)
- [ ] Picture-in-Picture
- [ ] Historique appels
- [ ] Appels groupe (3+) - Post-MVP

#### Notifications
- [ ] Permission prompt
- [ ] Push notifications (background)
- [ ] Foreground notifications (in-app)
- [ ] Notification center (liste)
- [ ] Badge count
- [ ] Mark as read / Delete
- [ ] Notifications personnalisées (sons, vibration) - Post-MVP

#### Profil & Paramètres
- [x] Profil utilisateur (nom, avatar, bio)
- [ ] Modifier profil
- [ ] Changer avatar
- [ ] Paramètres notifications
- [ ] Paramètres confidentialité
- [ ] Thème clair/sombre
- [ ] Langue (FR, EN) - Post-MVP
- [ ] Export données RGPD - Post-MVP

### Architecture & Technique

#### Frontend
- [x] Layout responsive (mobile, web)
- [x] Dark mode
- [x] Routing (Expo Router, Next.js App Router)
- [x] State management (Zustand)
- [x] Hooks réutilisables
- [ ] Tests unitaires (coverage 70%+)
- [ ] Tests E2E (5 scénarios critiques)
- [ ] Performance optimisée (Lighthouse 90+)

#### Backend
- [x] Supabase Auth
- [x] Supabase Realtime (messages, typing, presence)
- [x] Supabase Storage (médias)
- [x] Stream SDK (appels vidéo)
- [ ] Notifications API (register token, send push)
- [ ] Media API (presigned URLs, validation)
- [ ] Rate limiting
- [ ] Logs structurés
- [ ] Health checks

#### DevOps
- [ ] CI/CD (GitHub Actions)
- [ ] Tests automatisés (Jest, Cypress)
- [ ] Deployment web (Vercel/Firebase)
- [ ] Deployment mobile (EAS Build)
- [ ] Monitoring (Sentry)
- [ ] Analytics (Firebase Analytics)

---

## 🎯 Objectifs Mesurables MVP

### Performance
- [ ] Latence message < 500ms (90% cas)
- [ ] Appel établi < 3s
- [ ] Upload image < 5s (1MB)
- [ ] Lighthouse score > 90 (web)
- [ ] FPS > 55 (mobile)

### Qualité
- [ ] Zero crash en production
- [ ] Tests coverage > 70%
- [ ] Accessibilité (a11y) score > 85
- [ ] TypeScript strict mode ✅
- [ ] Linting 0 errors ✅

### UX
- [ ] Onboarding < 2 minutes
- [ ] Time to first message < 30s
- [ ] Dark mode complet
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Loading states partout

---

## 📚 Ressources & Documentation

### Documentation Technique

| Document | Description | Lignes |
|----------|-------------|--------|
| [PLATFORM_INTEGRATION_ANALYSIS.md](platform-core/docs/PLATFORM_INTEGRATION_ANALYSIS.md) | Analyse modules platform-core | 850+ |
| [CLIENT_API_INTEGRATION.md](platform-core/docs/CLIENT_API_INTEGRATION.md) | Guide intégration API | 600+ |
| [QUICK_START.md](platform-core/docs/QUICK_START.md) | Guide démarrage rapide | 400+ |
| [ETAT_ACTUEL_MVP.md](ETAT_ACTUEL_MVP.md) | État MVP complet | 774 |
| [MVP_STRUCTURE_MULTIPLATEFORME.md](MVP_STRUCTURE_MULTIPLATEFORME.md) | Spécification MVP | 1500+ |
| [UI_KIT_COMPONENTS_REFERENCE.md](UI_KIT_COMPONENTS_REFERENCE.md) | Référence composants UI | 500+ |

### Hooks & Services Disponibles

#### Mobile
```typescript
✅ useAuth()          // mobile/hooks/useAuth.ts
✅ useChat()          // mobile/hooks/useChat.ts
✅ useCalls()         // mobile/hooks/useCalls.ts (257 lignes)
✅ useNotifications() // mobile/hooks/useNotifications.ts (138 lignes)

✅ callsService       // mobile/services/calls.ts (392 lignes)
✅ notificationsService // mobile/services/notifications.ts (356 lignes)
```

#### Web
```typescript
✅ useAuth()          // web-app/src/hooks/useAuth.ts
✅ useChat()          // web-app/src/hooks/useChat.ts
✅ useCalls()         // web-app/src/hooks/useCalls.ts (324 lignes)
✅ useNotifications() // web-app/src/hooks/useNotifications.ts (190 lignes)

✅ callsService       // web-app/src/lib/calls.ts (480 lignes)
✅ notificationsService // web-app/src/lib/notifications.ts (414 lignes)
✅ messagingService   // web-app/src/lib/messaging.ts (265 lignes)
```

### Composants UI Disponibles (ui-kit)

```typescript
// Chat
✅ ChatBubble         // Message bubble avec variants
✅ ChatInput          // Input avec emojis, attachments
✅ MessageList        // Liste messages virtualisée
✅ TypingIndicator    // "est en train d'écrire..."
✅ EmojiReaction      // Réactions emojis

// User
✅ UserAvatar         // Avatar avec status
✅ OnlineIndicator    // Dot statut en ligne

// Kawaii
✅ KawaiiButton       // Boutons avec style kawaii
✅ KawaiiInput        // Inputs avec floating label
✅ KawaiiModal        // Modales élégantes
✅ ImuMascot          // Mascotte animée (8 animations)

// Base
✅ Button, Badge, Card, Spinner, Tooltip, Separator
```

---

## 🚀 Quick Start - Développement

### Setup Initial

```bash
# Cloner le monorepo (si pas déjà fait)
git clone <repo-url> imuchat_global
cd imuchat_global

# Installer dépendances
pnpm install

# Configurer variables d'environnement
cp mobile/.env.example mobile/.env
cp web-app/.env.example web-app/.env.local
cp platform-core/.env.example platform-core/.env

# Remplir credentials dans les .env
# Voir QUICK_START.md pour détails
```

### Lancer Mobile

```bash
# Depuis racine
pnpm --filter @imuchat/mobile start

# OU depuis dossier mobile
cd mobile
pnpm start

# Puis choisir plateforme :
# i - iOS Simulator
# a - Android Emulator
# w - Web browser
```

### Lancer Web-App

```bash
# Depuis racine
pnpm --filter @imuchat/web-app dev

# OU depuis dossier web-app
cd web-app
pnpm dev

# Ouvrir http://localhost:3000
```

### Lancer Backend (platform-core)

```bash
# Depuis racine
pnpm --filter @imuchat/platform-core dev

# OU depuis dossier platform-core
cd platform-core
pnpm dev

# Serveur démarre sur http://localhost:3001
# Vérifier logs : Stream initialized, Firebase Admin initialized
```

---

## 📞 Support & Questions

### Problèmes Fréquents

**Q1 : Erreur "Cannot find module '@imuchat/ui-kit'"**
```bash
# Rebuilder packages workspace
pnpm install
pnpm --filter @imuchat/ui-kit build
```

**Q2 : Expo Metro bundler stuck**
```bash
cd mobile
pnpm start --clear
```

**Q3 : Next.js build errors**
```bash
cd web-app
rm -rf .next
pnpm dev
```

**Q4 : Platform-core ne démarre pas**
```bash
cd platform-core
# Vérifier .env (Firebase credentials, Supabase URL, Stream API key)
pnpm dev
```

### Contacts

- **Lead Dev** : Voir DEVELOPER_ONBOARDING.md
- **Documentation** : DOCUMENTATION_INDEX.md
- **Issues** : GitHub Issues

---

## 🎉 Prochaines Étapes

### Cette Semaine (Semaine 1)

1. **Jour 1-2** : Écrans appels (mobile + web)
2. **Jour 3** : Notifications push
3. **Jour 4** : Tests + polish

**Objectif** : Appels vidéo fonctionnels end-to-end 🎥

### Semaine Suivante (Semaine 2)

1. Features chat avancées (typing, réactions, médias, vocal)
2. Tests E2E
3. UI/UX polish

**Objectif** : Expérience chat complète 💬

### Dernière Semaine (Semaine 3)

1. Backend endpoints (notifications, media)
2. Intégration frontend
3. Tests finaux
4. Documentation

**Objectif** : MVP déployable 🚀

---

**Version** : 1.0  
**Date** : 19 février 2026  
**Statut** : PLAN ACTIF 🔥

**NEXT ACTION** : Commencer Jour 1 - Écrans Appels Mobile 📱

---

