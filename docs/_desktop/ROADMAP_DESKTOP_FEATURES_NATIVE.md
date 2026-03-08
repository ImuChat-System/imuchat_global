# 🖥️ ROADMAP — Features Natives & Intégrations Post-MVP · Desktop App ImuChat

**Date de création :** 8 mars 2026  
**Document source :** `DESKTOP_APP_DEVELOPMENT_TRACKER.md` + exploration code + architecture web-app  
**Pré-requis :** `ROADMAP_DESKTOP_FOUNDATIONS.md` complété (12 sprints, app desktop MVP fonctionnelle)  
**Stack :** Electron 30 · Vite 5 · React 18 · TypeScript 5 · Supabase · Stream Video · Socket.IO  
**État attendu au démarrage :** Chat, Appels, Contacts, Profil, Settings, Thèmes, i18n, Tests, Build multi-OS  
**Roadmaps domaines intégrées :** `docs/games/`, `docs/contests/`, `docs/finance/`, `IMUCOMPANION_ROADMAP_DESKTOP.md`

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| 1 | Code Sharing & UI Kit | 2 | 4 semaines |
| 2 | Store, Wallet & Gamification | 3 | 6 semaines |
| 3 | Office, Fichiers & Productivité | 2 | 4 semaines |
| 4 | Feed, Stories & Social | 2 | 4 semaines |
| 5 | IA, Companion & Smart Features | 2 | 4 semaines |
| 6 | Sécurité Avancée, Perf & Expérience Native | 3 | 6 semaines |
| 7 | Intégrations Cross-Domain (Gaming, Arena, Finance, Companion Full) | 4 | 8 semaines |
| **Total** | | **18 sprints** | **36 semaines** |

---

## Phase 1 — Code Sharing & UI Kit (Sprints 1-2)

> 🎯 Maximiser le partage de code avec la web-app via les packages monorepo.

### Sprint 1 · Intégration @imuchat/ui-kit

**Objectif :** Utiliser le UI kit partagé comme base de composants et aligner le design desktop-web

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Import @imuchat/ui-kit** | Configurer le package `@imuchat/ui-kit` (installé mais non utilisé dans le desktop) : résoudre les imports Vite, vérifier la compatibilité React 18 vs 19 | 🟠 P0 | `vite.config.ts`, `tsconfig.json` |
| **Remplacer composants custom** | Remplacer les composants créés en Foundations (Button, Input, Dialog, etc.) par ceux du ui-kit. Adapter les variants desktop-specific | 🟠 P0 | `src/components/ui/` → import depuis `@imuchat/ui-kit` |
| **Design tokens partagés** | Aligner les CSS variables desktop sur celles du ui-kit : couleurs, spacing, border-radius, shadows, typography. Les 8 thèmes doivent être identiques web ↔ desktop | 🟠 P0 | `src/styles/`, `tailwind.config.ts` |
| **Composants desktop-only** | Identifier et créer les composants desktop-exclusifs : `TitleBar`, `TrayMenu`, `NativeContextMenu`, `WindowControls`, `SplashScreen`. Ceux-ci restent dans desktop-app | 🟡 P1 | `src/components/desktop/` |
| **@imuchat/shared-types** | Configurer le package `@imuchat/shared-types` (installé mais non utilisé) : types Supabase, DTOs, enums partagés entre web et desktop | 🟠 P0 | `src/types/` → import depuis `@imuchat/shared-types` |

**Livrables Sprint 1 :**
- ✅ UI kit intégré — composants partagés web ↔ desktop
- ✅ Design tokens identiques
- ✅ Shared types importés

---

### Sprint 2 · Hooks & Services Partagés

**Objectif :** Factoriser les hooks et services communs

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Auditer hooks desktop** | Comparer les hooks desktop (créés en Foundations) avec ceux de la web-app. Identifier le delta et les opportunités de mutualisation | 🟡 P1 | Rapport audit |
| **Créer @imuchat/shared-hooks** | Si non existant : créer un package de hooks partagés. Sinon, contribuer les hooks communs : `useAuth`, `useConversations`, `useMessages`, `usePresence`, `useSocket` | 🟡 P1 | `packages/shared-hooks/` ou dans `platform-core` |
| **Adapter les hooks** | Les hooks partagés doivent être agnostiques de la plateforme. Le client Supabase et Socket.IO sont injectés par chaque plateforme | 🟡 P1 | Injection de dépendances dans les hooks |
| **Services API unifiés** | Identifier les services API identiques entre web et desktop (conversations-api, messages-api, profile-api, contacts-api). Les extraire si possible ou documenter les contrats | 🟡 P1 | `src/services/` : vérifier la parité avec `web-app/src/services/` |
| **Storybook desktop** | Configurer Storybook pour le desktop-app : stories pour les composants desktop-specific (TitleBar, WindowControls, etc.) | 🟢 P2 | `.storybook/`, `src/components/**/*.stories.tsx` |

**Livrables Sprint 2 :**
- ✅ Hooks partagés ou alignés web ↔ desktop
- ✅ Services API avec contrats identiques
- ✅ Storybook desktop configuré

---

## Phase 2 — Store, Wallet & Gamification (Sprints 3-5)

### Sprint 3 · ImuChat Store

**Objectif :** Portage du Store de la web-app vers le desktop

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Store page** | Remplacer le placeholder : grille de modules avec catégories, recherche, filtres (gratuit/payant, catégorie, popularité) | 🟡 P1 | `src/pages/Store.tsx`, `src/components/store/ModuleGrid.tsx` |
| **Module detail** | Page détail module : screenshots (carrousel), description, avis/notes, infos dev, bouton Installer/Acheter | 🟡 P1 | `src/components/store/ModuleDetail.tsx` |
| **Install/Uninstall** | Toggle module : installer → mettre à jour le profil utilisateur (modules actifs dans Supabase). Désinstaller → retirer. Pas de code à télécharger (modules = feature flags) | 🟡 P1 | `src/hooks/useModules.ts`, `src/services/modules-api.ts` |
| **My Library desktop** | Connecté aux données réelles : modules installés, mises à jour disponibles, gestion (désinstaller, noter) | 🟡 P1 | `src/components/store/MyLibrary.tsx` |
| **Bundles** | Afficher les bundles (packs de modules) avec prix réduit, comparaison prix unitaire vs bundle | 🟢 P2 | `src/components/store/BundleCard.tsx` |

**Livrables Sprint 3 :**
- ✅ Store fonctionnel (browse, search, install)
- ✅ My Library connecté
- ✅ Module detail avec avis

---

### Sprint 4 · Wallet & Gamification

**Objectif :** Portage Wallet et système de gamification

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Wallet page** | Balance ImuCoins, top-up (Stripe), historique transactions, transfert P2P | 🟡 P1 | `src/pages/Wallet.tsx`, `src/components/wallet/` |
| **Wallet Stripe** | Intégrer Stripe dans Electron : ouvrir la page Stripe dans une BrowserWindow dédiée (ou le navigateur système), callback deep link pour confirmation | 🟡 P1 | `src/lib/stripe-handler.ts` |
| **Gamification hub** | Page gamification : XP bar, level, badges earned, classement amis, défis actifs, rewards disponibles | 🟡 P1 | `src/pages/Gamification.tsx`, `src/components/gamification/` |
| **Notifications gamification** | Toast et notification native quand : level up, badge gagné, défi complété, récompense disponible | 🟡 P1 | `src/components/gamification/AchievementToast.tsx` |
| **XP tracking** | Actions qui rapportent de l'XP : envoyer des messages, passer des appels, installer des modules, inviter des amis. Hook `useGamification()` | 🟡 P1 | `src/hooks/useGamification.ts`, `src/services/gamification-api.ts` |

**Livrables Sprint 4 :**
- ✅ Wallet fonctionnel (balance, top-up, historique)
- ✅ Gamification (XP, niveaux, badges, classement)
- ✅ Notifications d'achievements

---

### Sprint 5 · Communautés & Mini-Apps

**Objectif :** Portage des communautés et framework mini-apps

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Communities explorer** | Page explore : communautés populaires, recherche, catégories, rejoindre/quitter | 🟡 P1 | `src/pages/Communities.tsx`, `src/components/communities/CommunityExplorer.tsx` |
| **Community view** | Page communauté : channels texte (sidebar), messages par channel, members list, rôles visibles | 🟡 P1 | `src/components/communities/CommunityView.tsx`, `src/components/communities/ChannelList.tsx` |
| **Community channels voix** | Channels voix dans les communautés (style Discord) : rejoindre, parler (push-to-talk ou voice activity), voir les membres connectés | 🟢 P2 | `src/components/communities/VoiceChannel.tsx` |
| **Mini-Apps framework** | Conteneur pour mini-apps : `<webview>` ou `<BrowserView>` Electron. Sandboxed. Communication via postMessage | 🟡 P1 | `src/components/miniapps/MiniAppContainer.tsx`, `src/lib/miniapp-bridge.ts` |
| **Mini-Apps launcher** | Page de découverte de mini-apps : grille, catégories, search. Lancer un mini-app → ouvre dans un conteneur intégré | 🟡 P1 | `src/pages/MiniApps.tsx` |
| **Mini-App permissions** | Système de permissions : une mini-app demande l'accès (profil, contacts, wallet). L'utilisateur accepte/refuse | 🟢 P2 | `src/components/miniapps/PermissionDialog.tsx` |

**Livrables Sprint 5 :**
- ✅ Communautés avec channels texte fonctionnels
- ✅ Framework mini-apps (webview sandboxed)
- ✅ Mini-app launcher

---

## Phase 3 — Office, Fichiers & Productivité (Sprints 6-7)

### Sprint 6 · Suite Office Desktop

**Objectif :** Suite bureautique native avec avantages desktop (sauvegarde locale, meilleure perf)

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Documents TipTap** | Portage éditeur de documents TipTap : rich text, images, tableaux, headers, listes, code blocks. Toolbar complète | 🟡 P1 | `src/components/office/DocumentEditor.tsx` |
| **Sauvegarde locale** | Avantage desktop : "Sauvegarder en local" → dialog natif save as `.imuDoc` (JSON) ou export `.docx`/`.pdf`. Auto-save cloud + local | 🟡 P1 | `src/lib/local-save.ts`, `electron/preload.ts` (dialog) |
| **Présentations** | Éditeur de slides : TipTap canvas par slide, navigation slides, mode présentation plein écran (window fullscreen Electron) | 🟡 P1 | `src/components/office/PresentationEditor.tsx` |
| **Mode présentation** | Plein écran Electron natif : `BrowserWindow.setFullScreen(true)`, navigation clavier (flèches, espace), pointer laser, timer | 🟡 P1 | `src/components/office/PresentationMode.tsx` |
| **Tableur** | Portage du tableur web : grille, formules (SUM, AVG, COUNT), import/export CSV, tri/filtrage | 🟡 P1 | `src/components/office/SpreadsheetEditor.tsx` |
| **Documents récents** | Liste des documents récents (cloud + local) : accès rapide, preview, tri par date, recherche | 🟡 P1 | `src/components/office/RecentDocuments.tsx` |

**Livrables Sprint 6 :**
- ✅ Éditeur de documents TipTap
- ✅ Sauvegarde locale native
- ✅ Présentations avec mode plein écran Electron
- ✅ Tableur avec formules basiques

---

### Sprint 7 · Fichiers & Tasks

**Objectif :** Gestionnaire de fichiers et task manager

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **File manager** | Page Files : arborescence (tree view), upload, download, preview (images, PDF, code). Stockage Supabase Storage | 🟡 P1 | `src/pages/Files.tsx`, `src/components/files/FileExplorer.tsx` |
| **File preview** | Preview inline : images (zoom, rotate), PDF (pdf.js), vidéos (player), audio (waveform player), code (syntax highlight) | 🟡 P1 | `src/components/files/FilePreview.tsx` |
| **File sync** | Synchronisation bidirectionnelle d'un dossier local ↔ cloud. Mode "ImuChat Drive" : un dossier sur le disque qui se sync automatiquement | 🟢 P2 | `electron/file-sync.ts`, `src/hooks/useFileSync.ts` |
| **Tasks page** | Task manager : listes de tâches, sous-tâches, assignation, due date, tags, priorité, statuts (À faire, En cours, Fait) | 🟡 P1 | `src/pages/Tasks.tsx`, `src/components/tasks/TaskBoard.tsx` |
| **Tasks kanban** | Vue Kanban : colonnes personnalisables, drag & drop (déjà possible natif, ou avec dnd-kit), filtres | 🟡 P1 | `src/components/tasks/KanbanView.tsx` |
| **Tasks notifications** | Rappels de tâches : notification Electron quand une tâche arrive à échéance. Badge sur le sidebar icon Tasks | 🟡 P1 | `src/lib/task-reminders.ts` |

**Livrables Sprint 7 :**
- ✅ File manager avec arborescence et preview
- ✅ Task manager Kanban
- ✅ Rappels de tâches natifs

---

## Phase 4 — Feed, Stories & Social (Sprints 8-9)

### Sprint 8 · Feed Social & Stories

**Objectif :** Portage du feed et des stories

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Feed page** | Page feed : timeline de posts (texte, images, vidéos), like, commentaire, partage. Infinite scroll | 🟡 P1 | `src/pages/Feed.tsx`, `src/components/feed/PostCard.tsx`, `src/components/feed/PostList.tsx` |
| **Create post** | Formulaire de création : texte riche, upload multiphoto, vidéo, tags, localisation, visibilité (public/amis/privé) | 🟡 P1 | `src/components/feed/CreatePost.tsx` |
| **Post detail** | Page de détail post : commentaires hiérarchiques, réponses, likes sur commentaires | 🟡 P1 | `src/components/feed/PostDetail.tsx`, `src/components/feed/CommentList.tsx` |
| **Stories viewer** | Viewer stories plein largeur : navigation tap (précédent/suivant), progress bar, auto-advance, reply, réactions | 🟡 P1 | `src/components/stories/StoryViewer.tsx` |
| **Stories creator** | Créer une story : photo/texte/fond coloré, stickers, texte position libre, durée. Desktop advantage : upload depuis le disque facilement | 🟡 P1 | `src/components/stories/StoryCreator.tsx` |
| **Music integration** | Page Music : player intégré, playlists, intégration Spotify/Apple Music (embedded), partage "écoute en ce moment" | 🟢 P2 | `src/pages/Music.tsx`, `src/components/music/MiniPlayer.tsx` |

**Livrables Sprint 8 :**
- ✅ Feed social complet (posts, commentaires, likes)
- ✅ Stories (viewer + creator)
- ✅ Music player basique

---

### Sprint 9 · Profil Social Enrichi & Events

**Objectif :** Profil social complet et système d'événements

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Profil enrichi** | Profil public : mur de posts, photos, amis, communautés, badges, statistiques enrichies, bio longue, liens sociaux | 🟡 P1 | `src/components/profile/PublicProfile.tsx` |
| **Multi-profils** | Gestion de plusieurs profils (personnel, professionnel, anonyme). Switch rapide dans la titlebar ou le menu profil | 🟢 P2 | `src/hooks/useMultiProfile.ts`, `src/components/profile/ProfileSwitcher.tsx` |
| **Events page** | Page événements : créer, RSVP, calendrier mensuel, rappels, événements communautaires, localisation, partage | 🟡 P1 | `src/pages/Events.tsx`, `src/components/events/EventCalendar.tsx` |
| **Events desktop notifs** | Rappels d'événements via notifications Electron : 1h avant, 15min avant. Configurable | 🟡 P1 | `src/lib/event-reminders.ts` |
| **Discover page** | Page explore : trending, recommandations, créateurs populaires, communautés, modules. Contenu personnalisé | 🟡 P1 | `src/pages/Discover.tsx`, `src/components/discover/TrendingSection.tsx` |

**Livrables Sprint 9 :**
- ✅ Profil social enrichi avec mur de posts
- ✅ Events avec calendrier et rappels desktop
- ✅ Page Discover

---

## Phase 5 — IA, Companion & Smart Features (Sprints 10-11)

### Sprint 10 · Alice AI Assistant

**Objectif :** Intégration de l'assistant IA Alice

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Alice chat** | Panel latéral Alice : conversation IA, historique, suggestions contextuelles. Panel collapsible, accessible via raccourci | 🟡 P1 | `src/components/ai/AlicePanel.tsx`, `src/components/ai/AliceChat.tsx` |
| **Alice API** | Intégration API Genkit/OpenAI : envoi message → stream response, gestion du contexte conversation, clés API chiffrées | 🟡 P1 | `src/services/alice-api.ts`, `src/lib/encryption.ts` |
| **Alice contextuel** | Alice comprend le contexte : dans le chat → aide avec les messages, dans Office → aide à l'écriture, dans Tasks → aide à planifier, dans Code → aide au code | 🟡 P1 | `src/hooks/useAliceContext.ts` |
| **Smart compose** | Suggestions de réponses dans le chat : basées sur le contexte de la conversation. Boutons quick reply sous le message input | 🟢 P2 | `src/components/chat/SmartCompose.tsx` |
| **Résumé conversation** | Bouton "Résumer" dans le menu d'une conversation : Alice résume les derniers X messages en 3-4 points clés | 🟢 P2 | `src/components/chat/ConversationSummary.tsx` |
| **Traduction inline** | Bouton traduction sur un message : traduit le message dans la langue de l'utilisateur. Via Alice API | 🟢 P2 | `src/components/chat/TranslateMessage.tsx` |

**Livrables Sprint 10 :**
- ✅ Alice AI panel fonctionnel
- ✅ Alice contextuelle (chat, office, tasks)
- ✅ Smart compose suggestions
- ✅ Résumé de conversation IA

---

### Sprint 11 · Companion Live2D & Proactif

**Objectif :** Portage du companion et features proactives

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Live2D Companion** | Portage du Live2D canvas : personnage animé, expressions (idle, happy, thinking, talking), interactions clic | 🟡 P1 | `src/components/companion/CompanionCanvas.tsx`, `src/hooks/useCompanion.ts` |
| **Companion widget** | Widget flottant : le companion peut être affiché comme widget toujours visible (coin de l'écran). Draggable, minimizable | 🟡 P1 | `src/components/companion/CompanionWidget.tsx` |
| **Companion proactif** | Déclencheurs proactifs : rappel inactivité ("Tu n'as pas répondu à X depuis 2h"), anniversaire contact, objectif gamification | 🟡 P1 | `src/services/companion-proactive.ts` |
| **Companion overlay** | Avantage desktop : companion overlay au-dessus de toutes les fenêtres (option). Electron `alwaysOnTop` + transparent window | 🟢 P2 | `electron/companion-window.ts` |
| **Smart notifications** | Notifications intelligentes : regroupement automatique (5 messages → 1 notif "5 messages de X"), heures calmes auto-détectées, priorité par importance | 🟡 P1 | `src/lib/smart-notifications.ts` |
| **Keyboard shortcuts page** | Page listant tous les raccourcis clavier disponibles (Cmd+K, Cmd+Shift+M, etc.). Accessible via `?` ou Settings | 🟡 P1 | `src/components/settings/ShortcutsGuide.tsx` |

**Livrables Sprint 11 :**
- ✅ Live2D Companion porté
- ✅ Widget flottant companion
- ✅ Notifications intelligentes groupées
- ✅ Guide des raccourcis

---

## Phase 6 — Sécurité, Performance & Expérience Native (Sprints 12-14)

### Sprint 12 · Sécurité Electron

**Objectif :** Hardening sécurité spécifique à Electron

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Context isolation** | Vérifier que `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` dans webPreferences. Pas de `remote` module | 🟠 P0 | `electron/main.ts` |
| **Preload API minimal** | Le preload ne doit exposer que les APIs nécessaires via `contextBridge`. Audit : supprimer les APIs inutilisées. Chaque API exposée = surface d'attaque | 🟠 P0 | `electron/preload.ts` |
| **CSP Electron** | Content Security Policy stricte dans la BrowserWindow : `script-src 'self'`, pas de `unsafe-eval` (requis par Vite dev → exception dev only) | 🟠 P0 | `electron/main.ts` (session.defaultSession.webRequest) |
| **Input sanitization** | DOMPurify pour tout input utilisateur affiché en HTML (messages, bios, noms, descriptions). Même pattern que la web-app | 🟠 P0 | `src/lib/sanitize.ts` |
| **Secure storage** | Données sensibles (tokens, clés API) stockées via `electron-store` avec chiffrement (encryptionKey via safeStorage) et non en clair | 🟠 P0 | `src/lib/secure-store.ts`, `electron/preload.ts` |
| **Permission handler** | Contrôler les permissions Electron : camera, microphone, notifications, géolocalisation. Ne les accorder que sur demande explicite | 🟡 P1 | `electron/permissions.ts` |

**Livrables Sprint 12 :**
- ✅ Context isolation vérifié
- ✅ CSP stricte
- ✅ Secure storage chiffré
- ✅ Input sanitization

---

### Sprint 13 · Performance & Optimisation

**Objectif :** App desktop rapide et économe en ressources

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Startup time** | Cible : < 2s cold start. Mesurer et optimiser : lazy import des pages non-critiques, defer non-essential (Lottie, Live2D, Stream SDK). Splash screen pendant le chargement | 🟡 P1 | `src/App.tsx` (lazy imports), `src/lib/performance.ts` |
| **Memory profiling** | Profiler l'usage mémoire : identifier les fuites (listeners non nettoyés, Supabase subscriptions, Socket.IO). Cible < 200MB idle | 🟡 P1 | Chrome DevTools, `electron/main.ts` (process.memoryUsage) |
| **Virtualisation listes** | Listes longues (conversations 100+, contacts 500+, messages) : utiliser `@tanstack/react-virtual` pour virtualiser. No DOM bombing | 🟡 P1 | `src/components/chat/ConversationList.tsx`, `src/components/chat/MessageList.tsx` |
| **IPC optimization** | Minimiser les IPC calls Electron : batch les opérations, éviter les IPC synchrones, utiliser MessagePort pour le streaming | 🟡 P1 | `electron/preload.ts`, tous les IPC handlers |
| **Background throttle** | Quand l'app est en arrière-plan : réduire les animations, baisser la fréquence des polls, mettre en veille les composants non visibles | 🟡 P1 | `src/hooks/useWindowFocus.ts`, `src/lib/background-throttle.ts` |
| **Bundle size** | Analyser avec `rollup-plugin-visualizer`. Cible main bundle < 3MB. Tree-shake les imports non utilisés (lucide icons, etc.) | 🟡 P1 | `vite.config.ts`, analyse |

**Livrables Sprint 13 :**
- ✅ Cold start < 2s
- ✅ Mémoire idle < 200MB
- ✅ Listes virtualisées
- ✅ Background throttling

---

### Sprint 14 · Expérience Native Avancée & Distribution

**Objectif :** Expérience desktop native irréprochable et distribution étendue

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Notifications riches** | Notifications avec boutons d'action : message reçu → "Répondre" / "Marquer lu". Appel entrant → "Répondre" / "Refuser" | 🟡 P1 | `electron/rich-notifications.ts` |
| **Quick reply** | Répondre directement depuis la notification (macOS inline reply, Windows toast reply) sans ouvrir l'app | 🟡 P1 | `electron/quick-reply.ts` |
| **Multi-window** | Support multi-fenêtres : pop-out une conversation dans sa propre fenêtre, pop-out un appel. Deux conversations côte à côte | 🟡 P1 | `electron/window-manager.ts`, `src/lib/multi-window.ts` |
| **Native share** | Menu Partager OS natif : partager un fichier, un lien, un contact via les apps système (AirDrop, email, etc.) | 🟢 P2 | `electron/native-share.ts` |
| **Crash reporter** | Electron crash reporter : envoyer les crash dumps à Sentry. Capturer les crash du process principal et renderer | 🟡 P1 | `electron/crash-reporter.ts`, `src/lib/sentry.ts` |
| **Auto-update stable** | Release channels : stable, beta, canary. Les utilisateurs choisissent leur canal dans Settings. Auto-update par canal | 🟡 P1 | `electron/updater.ts`, `src/components/settings/UpdateChannel.tsx` |
| **App Store readiness** | Préparations spécifiques : Mac App Store (MAS build, sandbox), Microsoft Store (MSIX package), Snap Store (snap confinement) | 🟢 P2 | `electron-builder.json5`, configs spécifiques par store |

**Livrables Sprint 14 :**
- ✅ Quick reply depuis les notifications
- ✅ Multi-window (pop-out conversations)
- ✅ Crash reporter Sentry
- ✅ Release channels (stable/beta)
- ✅ App Store readiness (MAS, MSIX)

---

## Phase 7 — Intégrations Cross-Domain (Sprints 15-18)

> 🎯 Intégrer Gaming Hub, ImuArena, Finance Hub et ImuCompanion Full dans l’app desktop.

### Sprint 15 · Gaming Hub Desktop

**Objectif :** Portage du Gaming Hub avec avantages desktop (multi-fenêtres, performance)

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Gaming Hub page** | Page catalogue jeux : grille, catégories, recherche, recommandations, favoris | 🟡 P1 | `src/pages/Gaming.tsx`, `src/components/gaming/GameCatalog.tsx` |
| **Gaming Profile** | Profil gaming : stats, XP, badges, historique parties, classement amis | 🟡 P1 | `src/components/gaming/GamingProfile.tsx` |
| **Mini-games BrowserView** | Mini-jeux dans `BrowserView` Electron (sandboxé, postMessage). Avantage desktop : meilleure perf GPU que les WebViews mobiles | 🟡 P1 | `src/components/gaming/GameContainer.tsx`, `electron/game-window.ts` |
| **Game Mode desktop** | Mode Jeu natif : statut auto "En jeu", ne pas déranger, désactiver auto-update, réduire notifs, Electron `powerSaveBlocker` | 🟡 P1 | `src/hooks/useGameMode.ts`, `electron/game-mode.ts` |
| **Voice Chat Gaming** | Canal voix dédié gaming dans les guildes/clans via Stream Voice + push-to-talk raccourci clavier | 🟡 P1 | `src/components/gaming/GamingVoiceChannel.tsx` |
| **Guildes & Clans** | Pages guildes : création, gestion, chat guilde, membres, rôles, recrutement | 🟢 P2 | `src/components/gaming/GuildPage.tsx` |

**Dépendances :** `ROADMAP_GAMING_HUB.md` Phases 1-3 (API Gaming + Game Launcher + données catalogue)

**Livrables Sprint 15 :**
- ✅ Gaming Hub desktop avec catalogue et recherche
- ✅ Mini-jeux dans BrowserView natif
- ✅ Game Mode avec powerSaveBlocker
- ✅ Voice Chat gaming push-to-talk

---

### Sprint 16 · ImuArena Desktop

**Objectif :** Concours et compétitions sur desktop avec avantages workflow

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Arena Hub desktop** | Page Arena : 6 catégories (Gaming/Créatif/Tech/Quiz/Story/Visual), concours actifs, trending, recherche | 🟡 P1 | `src/pages/Arena.tsx`, `src/components/arena/ArenaHub.tsx` |
| **Contest Detail** | Détail concours : règles, timeline, soumissions, classement temps réel (Supabase Realtime) | 🟡 P1 | `src/components/arena/ContestDetail.tsx` |
| **Participation desktop** | Flow soumission adapté desktop : drag & drop fichiers depuis l’OS, upload multi-fichiers, preview inline | 🟡 P1 | `src/components/arena/SubmissionFlow.tsx` |
| **Votes & Jury** | Interface de vote desktop : grille, comparaison côte à côte (multi-window), anti-fraude | 🟡 P1 | `src/components/arena/VotePanel.tsx` |
| **Leaderboards & Saisons** | Classements en temps réel, saisons, ligues, historique, badges saison | 🟡 P1 | `src/components/arena/Leaderboard.tsx`, `src/components/arena/SeasonView.tsx` |
| **Brackets Gaming** | Bracket tournament view : arbre de compétition interactif, zoomable, avec status temps réel | 🟢 P2 | `src/components/arena/BracketView.tsx` |

**Dépendances :** `ROADMAP_IMUARENA_HUB.md` Phases 1-4, `ROADMAP_LEAGUES_SEASONS.md` Phases 1-3

**Livrables Sprint 16 :**
- ✅ Arena Hub avec 6 catégories
- ✅ Participation desktop avec drag & drop natif
- ✅ Votes et leaderboards temps réel

---

### Sprint 17 · Finance Hub Desktop

**Objectif :** Finance complète avec avantages desktop (multi-fenêtres, export natif)

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Finance Dashboard** | Page finance enrichie : solde, graphes interactifs (recharts), transactions récentes, catégories dépenses, filtres par date | 🟡 P1 | `src/pages/Finance.tsx`, `src/components/finance/FinanceDashboard.tsx` |
| **KYC desktop** | Flow KYC niveaux 0-2 : formulaire + upload pièce d’identité (dialog natif fichier), vérification Onfido | 🟡 P1 | `src/components/finance/KycFlow.tsx` |
| **P2P enrichi chat** | Bulle chat spéciale : envoyer ImuCoins, split bill, cagnottes dans les conversations (utilise le Wallet Sprint 4) | 🟡 P1 | `src/components/chat/P2PTransaction.tsx`, `src/components/chat/SplitBill.tsx` |
| **Cartes virtuelles** | Gestion cartes virtuelles (Stripe Issuing) : création, solde, gel/dégel, limites, export relevé PDF | 🟡 P1 | `src/components/finance/VirtualCards.tsx` |
| **Épargne & Coffres** | Coffres d’épargne : objectifs visuels, transferts wallet↔coffre, intérêts simulés, progression | 🟡 P1 | `src/components/finance/SavingsVaults.tsx` |
| **Contest Economy** | Prize pools liés aux concours Arena + frais d’entrée. Pop-out Finance dans sa propre fenêtre | 🟢 P2 | `src/components/finance/ContestEconomy.tsx` |
| **Export natif** | Avantage desktop : export transactions CSV/PDF via dialog natif "Enregistrer sous" | 🟡 P1 | `src/lib/finance-export.ts` |

**Dépendances :** `ROADMAP_IMUBANK_WALLET.md` Phases 1-3, `ROADMAP_IMUECONOMY_MONETISATION.md` Phases A-B, Sprint 4 (Wallet base)

**Livrables Sprint 17 :**
- ✅ Finance dashboard avec graphes interactifs
- ✅ KYC desktop, P2P chat, cartes virtuelles, épargne
- ✅ Export PDF/CSV natif
- ✅ Contest Economy prize pools

---

### Sprint 18 · ImuCompanion Desktop Full

**Objectif :** ImuCompanion complètement intégré avec les déclencheurs cross-domain

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Companion Store enrichi** | `stores/companion-store.ts` enrichi : archétype actif, skins achetés, préférences cross-domain | 🟡 P1 | `src/stores/companion-store.ts` |
| **Live2D enrichi** | Canvas Live2D : animations lip-sync, expressions contextuelles, skins premium appliqués | 🟡 P1 | `src/components/companion/CompanionCanvas.tsx` |
| **Déclencheurs cross-domain** | Le Companion réagit aux événements des domaines : Gaming→conseils stratégiques + célébrations victoire, Arena→encouragements + compte à rebours, Finance→alertes budget + félicitations épargne, Chat→suggestions réponse | 🟡 P1 | `src/services/companion-cross-domain.ts` |
| **Behaviour Engine FSM** | Machine à états complète : idle, listening, speaking, celebrating, gaming, warning, sleeping. Transitions contextuelles | 🟡 P1 | `src/lib/companion-fsm.ts` |
| **TTS/STT desktop** | Web Speech API pour TTS + speech recognition. Avantage desktop : système TTS natif via `say` (macOS) ou SAPI (Windows) | 🟡 P1 | `src/lib/companion-speech.ts`, `electron/native-tts.ts` |
| **Archétypes & Skins** | Personnalités (Playful, Studious, Sporty, etc.) + skins premium Store. Shopping via l’économie Finance | 🟢 P2 | `src/components/companion/ArchetypeSelector.tsx` |
| **Companion overlay enrichi** | Overlay desktop enrichi : le Companion réagit visuellement aux événements cross-domain même hors de la fenêtre principale | 🟢 P2 | `electron/companion-overlay-events.ts` |

**Dépendances :** `IMUCOMPANION_ROADMAP_DESKTOP.md` IC-D1 à IC-D6, Sprint 11 (Companion base), Sprint 10 (Alice IA)

**Livrables Sprint 18 :**
- ✅ ImuCompanion avec déclencheurs cross-domain complets
- ✅ FSM enrichie (gaming, warning, celebrating)
- ✅ TTS natif desktop
- ✅ Archétypes et skins premium
- ✅ Overlay cross-domain

---

## Dépendances inter-sprints

```
Sprint 1 (UI Kit) ──→ Sprint 2 (Hooks partagés)
       │                      │
       └──→ Sprint 3 (Store) ──→ Sprint 4 (Wallet/Gamif) ──→ Sprint 5 (Communautés)
                                                                      │
Sprint 6 (Office) ──→ Sprint 7 (Files/Tasks) ──────────────────→ Sprint 10 (Alice AI)
                                                                      │
Sprint 8 (Feed/Stories) ──→ Sprint 9 (Profil/Events) ─────→ Sprint 11 (Companion)
                                                                      │
Sprint 12 (Sécurité) ──→ Sprint 13 (Performance) ──→ Sprint 14 (Natif avancé)
                                                                      │
       ┌───────────────────────────────────────────────┘
       │
Sprint 15 (Gaming Hub) ──→ Sprint 16 (ImuArena) ────────────→ Sprint 18 (Companion Full)
       │                                                          │
Sprint 4 (Wallet) ──→ Sprint 17 (Finance Hub) ──→ Sprint 16 (Arena prize pools)
                                                 │
                                                 └──→ Sprint 18 (Finance → Companion alertes)
```

### Dépendances avec les roadmaps domaines

| Sprint | Roadmap domaine requise | Phases requises |
|--------|-------------------------|:---------------:|
| Sprint 15 — Gaming Hub | `ROADMAP_GAMING_HUB.md` | Phases 1-3 |
| Sprint 16 — ImuArena | `ROADMAP_IMUARENA_HUB.md` + `ROADMAP_LEAGUES_SEASONS.md` | Phases 1-4 + 1-3 |
| Sprint 17 — Finance Hub | `ROADMAP_IMUBANK_WALLET.md` + `ROADMAP_IMUECONOMY_MONETISATION.md` | Phases 1-3 + A-B |
| Sprint 18 — Companion Full | `IMUCOMPANION_ROADMAP_DESKTOP.md` | IC-D1 à IC-D6 |

---

## Dépendances avec `ROADMAP_DESKTOP_FOUNDATIONS.md`

| Ce roadmap Sprint | Dépend de Foundations Sprint | Raison |
|-------------------|:---------------------------:|--------|
| Sprint 1 (UI Kit) | Foundations Sprint 7 (Thèmes) | Les thèmes doivent exister pour aligner les design tokens |
| Sprint 3 (Store) | Foundations Sprint 2 (Auth) | Auth Supabase requise pour les achats |
| Sprint 4 (Wallet) | Foundations Sprint 2 (Auth) + Sprint 8 (Appels) | Auth + Stripe via BrowserWindow |
| Sprint 6 (Office) | Foundations Sprint 10 (D&D/OS) | Dialog natifs + file management |
| Sprint 10 (Alice IA) | Foundations Sprint 4 (Socket.IO) | Communication temps réel |
| Sprint 12 (Sécurité) | Foundations Sprint 9 (Native) | Preload, CSP, permissions |

---

## KPIs

| Métrique | Fin Foundations | Fin Phase 2 | Fin Phase 4 | Fin Phase 6 | Fin Phase 7 |
|----------|:--------------:|:-----------:|:-----------:|:-----------:|:-----------:|
| **Completion codebase** | 90% MVP | 55% full app | 75% full app | 95% full app | 100% full app |
| **Parité web features** | ~25% | ~40% | ~65% | ~85% | ~95% |
| **Code partagé web ↔ desktop** | 0% | 30% | 40% | 50% | 55% |
| **Pages fonctionnelles** | 9 | 14 | 19 | 22+ | 30+ |
| **Modules portés** | 0 | 3 (Store/Wallet/Gamif) | 7 (+Office/Files/Feed/Tasks) | 10+ (+IA/Companion/Events) | 14+ (+Gaming/Arena/Finance/Companion Full) |
| **Startup time** | < 3s | < 3s | < 2.5s | < 2s | < 2s |
| **Memory idle** | < 300MB | < 250MB | < 220MB | < 200MB | < 220MB* |
| **App Store prêt** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gaming Hub** | ❌ | ❌ | ❌ | ❌ | ✅ Catalogue + BrowserView + Game Mode |
| **ImuArena** | ❌ | ❌ | ❌ | ❌ | ✅ 6 catégories + D&D soumission + Leaderboards |
| **Finance Hub** | ❌ | ❌ | ❌ | ❌ | ✅ KYC + P2P + Cartes + Épargne + Export PDF |
| **ImuCompanion Full** | ❌ | ❌ | ❌ | Basique (S11) | ✅ FSM + TTS natif + Cross-domain + Overlay |

> *\*Mémoire peut temporairement augmenter avec Live2D + BrowserView Gaming (lazy unload)*
