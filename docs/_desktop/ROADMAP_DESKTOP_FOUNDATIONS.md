# 🖥️ ROADMAP — Fondations MVP · Desktop App ImuChat

**Date de création :** 8 mars 2026  
**Document source :** `DESKTOP_APP_DEVELOPMENT_TRACKER.md` + exploration code desktop-app  
**Stack :** Electron 30 · Vite 5 · React 18 · TypeScript 5 · electron-builder 24  
**État actuel :** ~5% — Shell uniquement. `App.tsx` monolithique (320 lignes), 13 dépendances installées mais aucune utilisée, aucune auth, routage, state management, tests ou i18n.

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| 1 | Architecture & Authentication | 2 | 4 semaines |
| 2 | Chat Core & Real-time | 3 | 6 semaines |
| 3 | Profil, Settings & Thèmes | 2 | 4 semaines |
| 4 | Appels & Natif Electron | 3 | 6 semaines |
| 5 | Polish, Tests & Distribution | 2 | 4 semaines |
| **Total** | | **12 sprints** | **24 semaines** |

---

## Pré-requis — Setup initial (Semaine 0 · ~4h)

> Ce setup est nécessaire avant de démarrer le Sprint 1.

| Tâche | Description |
|-------|-------------|
| **Configurer electron-builder** | Remplacer les valeurs template : `appId: "com.imuchat.desktop"`, `productName: "ImuChat"`, icônes réelles (`.icns`, `.ico`, `.png`), catégorie Mac `"public.app-category.social-networking"` |
| **Créer `.env.example`** | Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SOCKET_URL`, `VITE_STREAM_API_KEY` |
| **Installer Tailwind CSS** | Tailwind est dans les deps mais non configuré : `tailwind.config.ts`, `postcss.config.js`, ajouter les directives dans `index.css` |
| **Structure dossiers** | Créer : `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`, `src/stores/`, `src/lib/`, `src/types/`, `src/assets/` |

---

## Phase 1 — Architecture & Authentication (Sprints 1-2)

### Sprint 1 · Refactoring Architecture

**Objectif :** Passer d'un monolithe `App.tsx` à une architecture modulaire avec routing et state management

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Décomposer App.tsx** | Extraire les 9 pages de l'App.tsx monolithique en composants séparés dans `src/pages/`. Supprimer tout le code des pages de App.tsx | 🟠 P0 | `src/pages/Home.tsx`, `src/pages/Messages.tsx`, `src/pages/Contacts.tsx`, `src/pages/Store.tsx`, `src/pages/Profile.tsx`, `src/pages/Themes.tsx`, `src/pages/Settings.tsx`, `src/pages/Calls.tsx`, `src/pages/Games.tsx` |
| **React Router** | Configurer `react-router-dom` (installé mais non utilisé) : `BrowserRouter` dans main, routes dans `App.tsx`, layout avec sidebar/header | 🟠 P0 | `src/main.tsx`, `src/App.tsx`, `src/routes.tsx` |
| **Layout principal** | Créer le layout desktop : sidebar fixe à gauche (collapsible), header avec search + profil, zone de contenu principale. Pattern Electron : custom titlebar integré | 🟠 P0 | `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx` |
| **Custom titlebar** | Remplacer la titlebar OS par une titlebar custom CSS : draggable, boutons minimize/maximize/close (macOS style à gauche, Windows style à droite), titre de l'app | 🟡 P1 | `src/components/layout/TitleBar.tsx`, `electron/main.ts` (`frame: false, titleBarStyle: 'hidden'`) |
| **Zustand setup** | Configurer Zustand (installé mais non utilisé) : `useAuthStore`, `useUIStore` (sidebar collapsed, theme, notifications panel open). Persistence via `zustand/middleware` → `electron-store` ou `localStorage` | 🟠 P0 | `src/stores/auth-store.ts`, `src/stores/ui-store.ts` |
| **Supabase client** | Configurer `@supabase/supabase-js` (installé mais non utilisé) avec les env vars Vite. Créer le client singleton. Note : pour Electron, stocker le token JWT dans `electron-store` via preload, pas localStorage | 🟠 P0 | `src/lib/supabase.ts`, `electron/preload.ts` |
| **Remplacer emojis** | Remplacer toutes les icônes emoji (💬, 📞, etc.) dans la navigation par des composants `lucide-react` (installé mais non utilisé) | 🟡 P1 | `src/components/layout/Sidebar.tsx` |

**Livrables Sprint 1 :**
- ✅ 9 pages séparées avec routing React Router
- ✅ Layout desktop (sidebar + header + titlebar custom)
- ✅ Zustand configuré avec persistance
- ✅ Supabase client prêt
- ✅ Icônes Lucide au lieu d'emojis

---

### Sprint 2 · Authentification Complète

**Objectif :** Système d'authentification Supabase fonctionnel — connexion, inscription, session persistante

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Auth pages** | Créer les pages : `LoginPage` (email/password), `SignupPage` (email + nom + avatar), `ForgotPasswordPage` (email → magic link). Design cohérent avec la web app | 🟠 P0 | `src/pages/auth/Login.tsx`, `src/pages/auth/Signup.tsx`, `src/pages/auth/ForgotPassword.tsx` |
| **Auth hook** | `useAuth()` hook : wrappeur Supabase `onAuthStateChange`, session auto-refresh, `signIn()`, `signUp()`, `signOut()`, `resetPassword()`, état loading | 🟠 P0 | `src/hooks/useAuth.ts` |
| **Protected routes** | Route guard : si non authentifié → redirect vers `/login`. Composant `<ProtectedRoute>` wrappant le layout principal | 🟠 P0 | `src/components/auth/ProtectedRoute.tsx`, `src/routes.tsx` |
| **Session persistence** | Stocker la session Supabase dans `electron-store` via le preload API. Au lancement de l'app, restaurer la session. Auto-refresh token. | 🟡 P1 | `electron/preload.ts`, `src/hooks/useAuth.ts` |
| **Deep link auth** | Configurer le protocole `imuchat://` pour les callback OAuth (Google, Apple). Electron protocol handler + redirect vers auth flow | 🟡 P1 | `electron/main.ts` (protocol.registerSchemesAsPrivileged), callback handler |
| **OAuth Google** | Bouton "Se connecter avec Google" : ouvre le navigateur système → callback `imuchat://auth/callback` → récupère tokens → auth Supabase | 🟡 P1 | `src/pages/auth/Login.tsx`, `src/lib/oauth-handler.ts` |
| **Avatar upload** | Sur la page Signup : upload photo de profil → Supabase Storage bucket avatars → URL dans le profil | 🟡 P1 | `src/components/auth/AvatarUpload.tsx`, `src/services/storage-service.ts` |
| **Auth store** | Zustand auth store complété : `user`, `profile`, `session`, `isAuthenticated`, `isLoading`. Hydratation au lancement | 🟠 P0 | `src/stores/auth-store.ts` |

**Livrables Sprint 2 :**
- ✅ Login, Signup, Forgot Password fonctionnels
- ✅ Session persistante (survit au redémarrage)
- ✅ Routes protégées
- ✅ OAuth Google via deep link
- ✅ Avatar upload sur inscription

---

## Phase 2 — Chat Core & Real-time (Sprints 3-5)

### Sprint 3 · Conversations & Messages

**Objectif :** Chat fonctionnel — liste de conversations, envoi/réception de messages temps réel

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Port useConversations** | Adapter le hook `useConversations` de la web app : fetch conversations depuis Supabase, subscribe Realtime changes, tri par dernier message, badge unread. Adapter pour React 18 (pas 19) | 🟠 P0 | `src/hooks/useConversations.ts` |
| **Conversation list** | Composant liste : avatar, nom, dernier message (tronqué), heure, badge non-lu, typing indicator. Recherche/filtre en haut | 🟠 P0 | `src/components/chat/ConversationList.tsx`, `src/components/chat/ConversationItem.tsx` |
| **Port useMessages** | Adapter le hook : fetch messages paginés, listener Supabase Realtime, optimistic send, scroll to bottom, mark as read | 🟠 P0 | `src/hooks/useMessages.ts` |
| **Chat room** | Zone de messages : bulles (envoyé à droite, reçu à gauche), date grouping, heure, avatar, nom. Scroll infini (load more en haut) | 🟠 P0 | `src/components/chat/ChatRoom.tsx`, `src/components/chat/MessageBubble.tsx` |
| **Message input** | Input enrichi : texte, emoji picker (via composant existant ou lib), attachement fichier, bouton envoyer. Shift+Enter = nouvelle ligne | 🟠 P0 | `src/components/chat/MessageInput.tsx` |
| **Chat layout desktop** | Layout split-panel : conversation list à gauche (redimensionnable), chat room à droite. Pas de conversation sélectionnée → illustration "Sélectionnez une conversation" | 🟠 P0 | `src/pages/Messages.tsx` |
| **Services API** | `conversations-api.ts` et `messages-api.ts` : abstraction Supabase pour les queries, inserts, updates, deletes, subscriptions | 🟠 P0 | `src/services/conversations-api.ts`, `src/services/messages-api.ts` |

**Livrables Sprint 3 :**
- ✅ Conversations list avec données Supabase réelles
- ✅ Chat room avec messages en temps réel
- ✅ Layout desktop split-panel
- ✅ Envoi de messages (texte + emoji)

---

### Sprint 4 · Socket.IO & Chat Enrichi

**Objectif :** Indicateurs temps réel (typing, présence) et fonctionnalités chat étendues

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Socket.IO client** | Configurer `socket.io-client` (installé mais non utilisé) : connexion au server, auth JWT, reconnexion automatique avec backoff | 🟠 P0 | `src/lib/socket.ts`, `src/hooks/useSocket.ts` |
| **Typing indicator** | Émettre/recevoir "typing" via Socket.IO : afficher "X est en train d'écrire..." dans la conversation, timeout 3s | 🟡 P1 | `src/hooks/useTypingIndicator.ts`, `src/components/chat/TypingIndicator.tsx` |
| **Présence online** | Utiliser Supabase Presence ou Socket.IO pour : dot vert = online, gris = offline, jaune = idle. Afficher sur les avatars | 🟡 P1 | `src/hooks/usePresence.ts`, `src/components/ui/PresenceIndicator.tsx` |
| **Media upload chat** | Upload images et fichiers dans le chat : drop zone, preview image, progress bar, stockage Supabase Storage, affichage inline | 🟡 P1 | `src/components/chat/MediaUpload.tsx`, `src/components/chat/ImageMessage.tsx`, `src/components/chat/FileMessage.tsx` |
| **Reactions** | Réactions emoji sur les messages : long-press ou hover → emoji picker quick, affichage sous la bulle avec compteur, toggle own reaction | 🟡 P1 | `src/components/chat/MessageReactions.tsx`, `src/hooks/useReactions.ts` |
| **Voice recording** | Bouton micro dans le message input : enregistrement audio, waveform preview, envoi comme message vocal | 🟡 P1 | `src/components/chat/VoiceRecorder.tsx`, `src/hooks/useAudioRecorder.ts` |
| **Reply & forward** | Reply : citer un message (affichage inline au-dessus de la bulle). Forward : envoyer un message dans une autre conversation | 🟡 P1 | `src/components/chat/ReplyPreview.tsx` |
| **Context menu** | Clic droit sur un message : Répondre, Transférer, Copier, Épingler, Supprimer (si auteur). Menu natif Electron | 🟡 P1 | `src/components/chat/MessageContextMenu.tsx` |

**Livrables Sprint 4 :**
- ✅ Socket.IO connecté avec présence et typing
- ✅ Upload médias (images, fichiers) dans le chat
- ✅ Réactions emoji sur les messages
- ✅ Voice recording
- ✅ Reply, forward, context menu clic droit

---

### Sprint 5 · Contacts & Notifications

**Objectif :** Gestion des contacts et système de notifications desktop

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Contacts page** | Remplacer le placeholder : liste des contacts avec avatar, nom, statut online, dernier message. Recherche, tri alphabétique, filtre (online, tous, favoris) | 🟡 P1 | `src/pages/Contacts.tsx`, `src/components/contacts/ContactList.tsx`, `src/components/contacts/ContactItem.tsx` |
| **Contact detail** | Panel ou page détail contact : avatar, bio, actions (Message, Appeler, Bloquer, Signaler), conversations partagées, fichiers partagés | 🟡 P1 | `src/components/contacts/ContactDetail.tsx` |
| **Ajouter contact** | Recherche d'utilisateurs par nom/email, envoi demande d'ami, notification à l'autre, accepter/refuser. Liste "demandes en attente" | 🟡 P1 | `src/components/contacts/AddContact.tsx`, `src/services/contacts-api.ts` |
| **Electron notifications** | Utiliser `Notification` API Electron : nouvelle message reçu (hors focus), demande d'ami, appel entrant. Click → focus l'app et navigate | 🟠 P0 | `electron/main.ts` (ipcMain handlers), `src/lib/notifications.ts` |
| **Notification center** | Panel notifications dans l'app : liste des notifs (messages, demandes, système), mark as read, clear, timestamps | 🟡 P1 | `src/components/notifications/NotificationPanel.tsx`, `src/hooks/useNotifications.ts` |
| **Badge dock/taskbar** | Afficher le compteur de messages non-lus sur l'icône dock (macOS) / taskbar (Windows) via Electron `app.setBadgeCount()` | 🟡 P1 | `electron/main.ts`, IPC avec renderer |
| **Tray icon** | Icône dans le system tray (macOS menu bar / Windows system tray). Menu : Ouvrir, Status (Online/DND/Invisible), Quitter. Badge non-lu | 🟡 P1 | `electron/tray.ts` |

**Livrables Sprint 5 :**
- ✅ Page Contacts fonctionnelle avec recherche et détail
- ✅ Ajout de contacts / demandes d'ami
- ✅ Notifications desktop natives
- ✅ Badge non-lu sur dock/taskbar
- ✅ Tray icon avec menu

---

## Phase 3 — Profil, Settings & Thèmes (Sprints 6-7)

### Sprint 6 · Profil & Settings

**Objectif :** Pages profil et settings connectées à Supabase

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Profile page** | Page profil connectée : avatar, display name, bio, statut, email, date d'inscription, statistiques (messages envoyés, contacts, jeux). Données depuis Supabase | 🟡 P1 | `src/pages/Profile.tsx`, `src/hooks/useProfile.ts`, `src/services/profile-api.ts` |
| **Edit profile** | Mode édition : changer avatar (upload), modifier nom, bio, statut custom. Save → Supabase update | 🟡 P1 | `src/components/profile/EditProfile.tsx` |
| **Settings — Compte** | Page settings avec tabs : Compte (email, mot de passe, lien Google, supprimer compte) | 🟡 P1 | `src/pages/Settings.tsx`, `src/components/settings/AccountSettings.tsx` |
| **Settings — Apparence** | Tab : Thème (clair/sombre/système), couleur accent, taille police, densité UI (compact/normal), sidebar position | 🟡 P1 | `src/components/settings/AppearanceSettings.tsx` |
| **Settings — Notifications** | Tab : Activer/désactiver par type (messages, appels, demandes), son, DND schedule | 🟡 P1 | `src/components/settings/NotificationSettings.tsx` |
| **Settings — Chat** | Tab : Envoyer avec Enter (vs Shift+Enter), taille bulles, afficher timestamps, preview liens, correcteur ortho | 🟡 P1 | `src/components/settings/ChatSettings.tsx` |
| **Settings — Confidentialité** | Tab : Qui peut me voir en ligne, dernière connexion, accusés de lecture, activité en direct | 🟡 P1 | `src/components/settings/PrivacySettings.tsx` |
| **Settings persistence** | Sauvegarder tous les settings via Zustand + `electron-store` (via preload). Restaurer au lancement | 🟡 P1 | `src/stores/settings-store.ts`, `electron/preload.ts` |

**Livrables Sprint 6 :**
- ✅ Profil connecté Supabase (lecture + édition)
- ✅ Settings avec 5 sections
- ✅ Persistance settings via electron-store

---

### Sprint 7 · Thèmes & UI Polish

**Objectif :** Système de thèmes complet et polish UI

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Thèmes system** | Implémenter les 8 thèmes de la web app : Défaut, Néon, Pastel, Ocean, Sunset, Forest, Sakura, Midnight. CSS variables pour chaque thème × mode (clair/sombre) | 🟡 P1 | `src/styles/themes/`, `src/stores/theme-store.ts` |
| **Theme preview** | Page Thèmes : grille de preview de chaque thème, click → applique, preview en temps réel avant confirmation | 🟡 P1 | `src/pages/Themes.tsx`, `src/components/themes/ThemeCard.tsx` |
| **Mode sombre/clair** | Toggle mode dans la titlebar ou settings. Respecter le theme OS (`prefers-color-scheme`). Option : Auto / Clair / Sombre | 🟡 P1 | `src/hooks/useTheme.ts` |
| **Animations Framer** | Configurer `framer-motion` (installé mais non utilisé) : transitions de page, hover effects sidebar, scale on click buttons | 🟡 P1 | `src/components/ui/AnimatedPage.tsx` |
| **Loading states** | Skeletons et spinners cohérents : conversation list skeleton, profile skeleton, messages loading. Utiliser `framer-motion` `AnimatePresence` | 🟡 P1 | `src/components/ui/Skeleton.tsx`, `src/components/ui/Spinner.tsx` |
| **Toast notifications** | Système de toasts in-app : succès, erreur, info. Position top-right, auto-dismiss, empilables | 🟡 P1 | `src/components/ui/Toast.tsx`, `src/hooks/useToast.ts` |
| **Remplacer App.css** | Migrer le CSS custom (603 lignes) vers Tailwind utility classes. Supprimer `App.css` et utiliser Tailwind pour tout le styling | 🟡 P1 | Supprimer `src/App.css`, migration classes |

**Livrables Sprint 7 :**
- ✅ 8 thèmes × 2 modes
- ✅ Animations Framer Motion sur les transitions
- ✅ Skeletons + toasts système
- ✅ Migration CSS → Tailwind complète

---

## Phase 4 — Appels & Natif Electron (Sprints 8-10)

### Sprint 8 · Appels Audio/Vidéo

**Objectif :** Appels 1:1 audio et vidéo via Stream Video SDK

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Stream SDK setup** | Configurer `@stream-io/video-react-sdk` (pas encore installé) : `StreamVideoClient`, token provider via Supabase Edge Function | 🟠 P0 | `src/lib/stream-client.ts`, `src/hooks/useStreamVideo.ts` |
| **Appel sortant** | Bouton appel (audio/vidéo) sur le profil contact et dans le chat. Initier un call Stream, UI d'appel sortant (sonnerie, annuler) | 🟠 P0 | `src/components/calls/OutgoingCall.tsx` |
| **Appel entrant** | Notification d'appel entrant : fenêtre overlay ou notification native. Accept / Decline. Ring sound | 🟠 P0 | `src/components/calls/IncomingCall.tsx`, `electron/main.ts` (window overlay) |
| **Call UI** | Écran d'appel en cours : vidéo local + remote, boutons mute/unmute, camera on/off, end call, timer, avatar si camera off | 🟠 P0 | `src/components/calls/CallScreen.tsx`, `src/components/calls/CallControls.tsx` |
| **Calls page** | Remplacer le placeholder : historique des appels (entrants, sortants, manqués), durée, date, bouton rappeler | 🟡 P1 | `src/pages/Calls.tsx`, `src/services/calls-api.ts` |
| **Audio routing** | Sélecteur de périphérique : micro, speakers, caméra. Détection des devices disponibles | 🟡 P1 | `src/components/calls/DeviceSelector.tsx` |

**Livrables Sprint 8 :**
- ✅ Appels 1:1 audio + vidéo fonctionnels
- ✅ Appels entrants avec notification
- ✅ Historique des appels
- ✅ Sélection périphériques audio/vidéo

---

### Sprint 9 · Screen Share & Electron Native

**Objectif :** Fonctionnalités natives Electron — screen share, raccourcis, auto-update

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Screen share** | Utiliser `desktopCapturer` Electron pour la capture d'écran : dialog de sélection écran/fenêtre, partage via Stream SDK, indicateur de partage | 🟠 P0 | `electron/preload.ts` (expose desktopCapturer), `src/components/calls/ScreenSharePicker.tsx` |
| **Raccourcis globaux** | Enregistrer des raccourcis globaux Electron : `Cmd/Ctrl+Shift+M` = mute/unmute, `Cmd/Ctrl+Shift+H` = hang up, `Cmd/Ctrl+N` = nouvelle conversation | 🟡 P1 | `electron/shortcuts.ts`, `electron/main.ts` (globalShortcut.register) |
| **Auto-updater** | Configurer `electron-updater` : check for updates au lancement + périodique, télécharger en arrière-plan, notifier l'utilisateur, redémarrer pour appliquer | 🟡 P1 | `electron/updater.ts`, `electron/main.ts` |
| **Deep links** | Protocole `imuchat://` : `imuchat://chat/{conversationId}`, `imuchat://call/{userId}`, `imuchat://profile/{userId}`. Electron protocol handler + routing | 🟡 P1 | `electron/main.ts` (protocol), `src/lib/deep-link-handler.ts` |
| **Startup behavior** | Options au lancement : démarrer avec le système (Login Items macOS / registry Windows), démarrer minimisé en tray, restaurer dernière fenêtre | 🟡 P1 | `electron/main.ts`, `src/components/settings/StartupSettings.tsx` |
| **Window state** | Sauvegarder/restaurer : position, taille, maximized state, affichage (écran principal/secondaire) via `electron-store` | 🟡 P1 | `electron/window-state.ts` |

**Livrables Sprint 9 :**
- ✅ Screen share via desktopCapturer
- ✅ Raccourcis globaux (mute, hangup)
- ✅ Auto-updater fonctionnel
- ✅ Deep links `imuchat://`
- ✅ Startup + window state persistés

---

### Sprint 10 · Fichiers, Drag & Drop & OS Integration

**Objectif :** Intégration OS native et gestion de fichiers

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Drag & Drop fichiers** | Drop fichiers dans le chat depuis le Finder/Explorer : détection du drop, upload Supabase, envoi comme message fichier | 🟡 P1 | `src/hooks/useDragDrop.ts`, `src/components/chat/DropZone.tsx` |
| **File manager natif** | Dialog natif Electron pour sélection de fichiers (`dialog.showOpenDialog`). Sauvegarde de fichiers reçus (`dialog.showSaveDialog`) | 🟡 P1 | `electron/preload.ts` (expose dialog), `src/lib/file-dialog.ts` |
| **Clipboard integration** | Coller des images depuis le clipboard directement dans le chat input. Paste event → preview → send | 🟡 P1 | `src/components/chat/ClipboardPaste.tsx` |
| **Menu bar natif** | Menu Electron complet : File (Nouveau chat, Quitter), Edit (Undo, Redo, Cut, Copy, Paste), View (Zoom, Toggle Sidebar), Window (Minimize, Zoom), Help (About, Check Updates) | 🟡 P1 | `electron/menu.ts` |
| **Touch Bar macOS** | Support Touch Bar MacBook Pro : boutons rapides (Nouveau message, Mute, Caméra toggle, Emoji picker) | 🟢 P2 | `electron/touchbar.ts` |
| **Spotlight/Quick Launch** | Cmd+K : palette de commandes desktop — rechercher contacts, conversations, actions rapides (nouvelle conv, appeler, settings) | 🟡 P1 | `src/components/ui/CommandPalette.tsx` |

**Livrables Sprint 10 :**
- ✅ Drag & drop fichiers dans le chat
- ✅ Dialog natifs Electron (open/save)
- ✅ Menu bar complet
- ✅ Command palette (Cmd+K)
- ✅ Clipboard image paste

---

## Phase 5 — Polish, Tests & Distribution (Sprints 11-12)

### Sprint 11 · i18n, Onboarding & Recherche

**Objectif :** Internationalisation, première expérience utilisateur, recherche globale

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **i18n setup** | Configurer `i18next` + `react-i18next` : namespace par domaine (auth, chat, settings, common). Fichiers FR et EN | 🟡 P1 | `src/lib/i18n.ts`, `src/locales/fr/`, `src/locales/en/` |
| **i18n migration** | Migrer tous les textes visibles vers les clés i18n. Commencer par auth et layout, puis chat, settings, profil | 🟡 P1 | Tous les composants |
| **Onboarding flow** | Premier lancement : 3-4 slides (bienvenue, fonctionnalités clés, raccourcis desktop, import contacts). Stocker "onboarding done" dans electron-store | 🟡 P1 | `src/components/onboarding/OnboardingWizard.tsx` |
| **Recherche globale** | Barre de recherche dans le header : recherche unifiée dans contacts, conversations, messages. Résultats groupés par catégorie. Raccourci Cmd+F | 🟡 P1 | `src/components/search/GlobalSearch.tsx`, `src/hooks/useGlobalSearch.ts` |
| **Splash screen** | Écran de chargement au lancement : logo ImuChat + animation Lottie (installé mais non utilisé), loading progress | 🟡 P1 | `src/components/ui/SplashScreen.tsx` |
| **About dialog** | Fenêtre About : version, auteur, liens (site, support, changelog), crédits open-source | 🟢 P2 | `src/components/ui/AboutDialog.tsx` |

**Livrables Sprint 11 :**
- ✅ i18n FR + EN complète
- ✅ Onboarding 4 slides
- ✅ Recherche globale unifiée
- ✅ Splash screen avec animation

---

### Sprint 12 · Tests, Build & Distribution

**Objectif :** Tests, CI, et distribution multi-plateforme

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Vitest setup** | Configurer Vitest + React Testing Library : mock Electron IPC, mock Supabase, mock Socket.IO | 🟡 P1 | `vitest.config.ts`, `src/test/setup.ts`, `src/test/mocks/` |
| **Tests composants** | Tests unitaires : auth flow (login, signup, session restore), conversation list (render, filter, search), message input (send, emoji, media) | 🟡 P1 | `src/**/__tests__/` |
| **Tests hooks** | Tests hooks : useAuth (sign in/out, session), useConversations (fetch, subscribe, filter), useMessages (fetch, send, receive), useSocket (connect, disconnect, events) | 🟡 P1 | `src/hooks/__tests__/` |
| **Tests E2E** | Playwright + Electron : login flow, send message, receive message, make call, change theme, update profile | 🟢 P2 | `e2e/`, `playwright.config.ts` |
| **Build macOS** | electron-builder : `.dmg` (macOS arm64 + x64), code signing Apple Developer, notarization | 🟡 P1 | `electron-builder.json5` |
| **Build Windows** | electron-builder : `.exe` installer (NSIS) + `.msi`, code signing EV certificate | 🟡 P1 | `electron-builder.json5` |
| **Build Linux** | electron-builder : `.AppImage` + `.deb` + `.snap` | 🟢 P2 | `electron-builder.json5` |
| **CI/CD GitHub Actions** | Pipeline : lint → typecheck → test → build (macOS/Windows/Linux) → publish release → auto-update server | 🟡 P1 | `.github/workflows/desktop-ci.yml` |
| **Release notes** | Système de changelog : `CHANGELOG.md` automatique depuis conventional commits, affiché dans l'app via "What's New" modal | 🟢 P2 | `CHANGELOG.md`, `src/components/ui/WhatsNew.tsx` |

**Livrables Sprint 12 :**
- ✅ Tests unitaires (composants + hooks)
- ✅ Build macOS (.dmg), Windows (.exe), Linux (.AppImage)
- ✅ CI/CD GitHub Actions complet
- ✅ Distribution prête (auto-update, code signing)

---

## Dépendances inter-sprints

```
[Setup S0] ──→ Sprint 1 (Architecture) ──→ Sprint 2 (Auth)
                                                │
                                Sprint 3 (Chat) ──→ Sprint 4 (Socket.IO)
                                     │                    │
                                Sprint 5 (Contacts/Notifs) ──→ Sprint 10 (D&D/OS)
                                     │
                Sprint 6 (Profil/Settings) ──→ Sprint 7 (Thèmes/Polish)
                                                    │
                                Sprint 8 (Appels) ──→ Sprint 9 (Screen Share/Native)
                                                          │
                Sprint 11 (i18n/Search) ────────→ Sprint 12 (Tests/Build)
```

---

## KPIs

| Métrique | État actuel | Sprint 4 | Sprint 8 | Sprint 12 |
|----------|:-----------:|:--------:|:--------:|:---------:|
| **Completion** | ~5% | 35% | 65% | 90% |
| **Lignes de code** | ~1100 | ~8000 | ~15000 | ~20000 |
| **Pages fonctionnelles** | 0/9 | 4/9 | 7/9 | 9/9 |
| **Auth** | ❌ | ✅ | ✅ | ✅ |
| **Chat temps réel** | ❌ | ✅ | ✅ | ✅ |
| **Appels audio/vidéo** | ❌ | ❌ | ✅ | ✅ |
| **Screen share** | ❌ | ❌ | ✅ | ✅ |
| **Notifications natives** | ❌ | ✅ | ✅ | ✅ |
| **Thèmes** | Dark only | 2 (light/dark) | 8 × 2 modes | 8 × 2 modes |
| **i18n** | ❌ | ❌ | ❌ | FR + EN |
| **Tests** | 0% | 0% | 0% | > 50% |
| **Distribution** | Dev only | Dev only | Dev only | macOS + Windows + Linux |
