# 🌐 ROADMAP — Features, UX & Intégrations · Web App ImuChat

**Date de création :** 8 mars 2026  
**Document source :** `FRONTEND_AUDIT_SUPERAPP.md` + exploration code web-app  
**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · Supabase · Socket.IO · Stream Video SDK  
**État actuel :** 38+ routes · 55+ services · MVP avancé — modules stub (Dating, Sports, Smart Home), i18n incomplète, responsive partiel

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| 1 | i18n & Responsive Complet | 3 | 6 semaines |
| 2 | Modules Manquants & Placeholders | 4 | 8 semaines |
| 3 | Chat & Communication Avancés | 3 | 6 semaines |
| 4 | Store, Wallet & Monétisation | 2 | 4 semaines |
| 5 | Animations, UX Polish & PWA | 2 | 4 semaines |
| 6 | Admin, Analytics & IA | 2 | 4 semaines |
| **Total** | | **16 sprints** | **32 semaines** |

---

## Phase 1 — i18n & Responsive Complet (Sprints 1-3)

### Sprint 1 · Couverture i18n 100%

**Objectif :** Éliminer tout texte hardcodé — couverture i18n complète sur FR, EN, JA

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Audit textes hardcodés** | Scanner tout le codebase avec regex `["']([A-Z][a-z].*?)["']` dans les JSX. Identifier chaque chaîne non traduite. Créer un rapport par composant | 🟠 P0 | Script audit, rapport markdown |
| **Migration composants auth** | Migrer `LoginForm`, `SignupForm`, `ForgotPassword`, `VerifyOtp`, `GuestBanner` : chaque texte visible → `t('auth.key')` | 🟠 P0 | `components/auth/*.tsx` |
| **Migration composants chat** | Migrer `MessageInput`, `ConversationList`, `ConversationItem`, `ChatLayout`, `MessageReactions`, `EmojiPicker(labels)`, `GifPicker(labels)`, search dialog, command palette | 🟠 P0 | `components/chat/*.tsx` |
| **Migration composants store** | Migrer `ModuleCard`, `PurchaseModal`, `StoreFilterBar`, `BundleCard`, `DeveloperPortal`, `MyLibrary` | 🟡 P1 | `components/store/*.tsx` |
| **Migration composants layout** | Migrer `Sidebar` (tous les labels de navigation), `Header`, `Footer`, `BottomNav`, `NotificationPanel`, `QuickActionsPanel` | 🟠 P0 | `components/layout/*.tsx` |
| **Compléter ja.json** | Vérifier toutes les clés `en.json` vs `ja.json`. Compléter les clés manquantes avec des traductions japonaises correctes | 🟡 P1 | `messages/ja.json` |
| **Script CI i18n** | Créer un script Node qui compare les clés entre les 3 locales et échoue en CI si des clés sont manquantes. Pattern : `Object.keys(en).filter(k => !ja[k])` | 🟡 P1 | `scripts/check-i18n.ts` |

**Livrables Sprint 1 :**

- ✅ Composants Auth, Chat, Store, Layout : 100% i18n
- ✅ ja.json complet (toutes les clés de en.json)
- ✅ Script CI détectant les clés manquantes

---

### Sprint 2 · i18n Avancée & Pages Contenu

**Objectif :** Pluralisation, formatage localisé, pages légales

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Migration restante** | Migrer tous les composants restants : `Profile`, `Settings` (13 sous-pages), `Gamification`, `Stories`, `Wallet`, `Office`, `Tasks`, `Files`, `Analytics`, `Admin`, `Companion`, `Themes`, `Events`, `Emergency`, `Feed`, `Notifications` | 🟠 P0 | Tous les composants non encore migrés |
| **Pluralisation ICU** | Utiliser ICU message format pour les pluriels : `{count, plural, =0 {Aucun message} one {# message} other {# messages}}`. Appliquer sur : messages, notifications, contacts, modules | 🟡 P1 | `messages/*.json`, composants avec compteurs |
| **Formatage dates/nombres** | Utiliser `useFormatter()` de next-intl pour : dates relatives ("il y a 5 min"), dates absolues, nombres (1 234,56 €), devises (¥1,234) | 🟡 P1 | Composants affichant dates et prix |
| **Pages Privacy & Terms** | Rédiger le contenu réel des pages `/privacy` et `/terms` en FR et EN. Supprimer les placeholders "Privacy policy placeholder." | 🟡 P1 | `app/[locale]/(public)/legal/privacy/page.tsx`, `app/[locale]/(public)/legal/terms/page.tsx` |
| **Page 404 / Error** | Améliorer les pages `not-found.tsx` et `error.tsx` : illustration, message traduit, suggestions de navigation, bouton retry | 🟢 P2 | `app/[locale]/not-found.tsx`, `app/[locale]/error.tsx` |

**Livrables Sprint 2 :**

- ✅ 100% des composants web-app traduits
- ✅ Pluralisation ICU sur tous les compteurs
- ✅ Pages Privacy & Terms avec contenu réel
- ✅ Pages d'erreur améliorées

---

### Sprint 3 · Responsive & Touch-Friendly

**Objectif :** UX mobile web irréprochable

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Layout mobile chat** | Repenser le chat mobile : liste conversations → plein écran. Tap conversation → slide vers le chat room plein écran. Bouton back. Pas juste du responsive CSS | 🟠 P0 | `components/chat/chat-layout.tsx`, `app/[locale]/chat/` |
| **Layout mobile office** | Office sur mobile : mode document simplifié, barre d'outils collapsible, focus on content | 🟡 P1 | `components/office/` |
| **Cibles tactiles 44px** | Auditer et corriger toutes les cibles < 44×44px : boutons sidebar, actions chat, icônes notification, items de liste. Ajouter du padding si nécessaire | 🟠 P0 | Multiple composants interactifs |
| **Pull-to-refresh** | Implémenter PTR sur les pages liste : feed, conversations, notifications, contacts. Pattern : détection du scroll au top + overscroll + animation | 🟡 P1 | `hooks/usePullToRefresh.ts`, pages liste |
| **Swipe gestures** | Chat mobile : swipe right → reply, swipe left → actions (supprimer, épingler). Implémenter avec `@use-gesture/react` ou pointer events | 🟡 P1 | `components/chat/message-item.tsx` |
| **Safe area iOS** | Ajouter `env(safe-area-inset-*)` pour le bottom nav, les modals, et les inputs fixés en bas de page | 🟡 P1 | `components/layout/mobile-bottom-nav.tsx`, CSS global |
| **Container queries** | Remplacer les breakpoints viewport par des container queries pour les composants qui s'adaptent au conteneur (cards dans grilles, sidebar panels) | 🟢 P2 | `components/store/module-card.tsx`, `components/wallet/` |

**Livrables Sprint 3 :**

- ✅ Chat mobile avec UX native-like (transitions plein écran)
- ✅ Cibles tactiles ≥ 44×44px partout
- ✅ Pull-to-refresh sur les 4 pages liste principales
- ✅ Swipe gestures dans le chat

---

## Phase 2 — Modules Manquants & Placeholders (Sprints 4-7)

> Les types existent (`dating.ts`, `smart-home.ts`, `sports.ts`) mais aucun composant. Implémenter les modules stub.

### Sprint 4 · Feed Enrichi & Communautés Avancées

**Objectif :** Compléter le feed social et les communautés

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Feed commentaires** | Implémenter le système de commentaires sur les posts : modal ou page de détail post, commentaires hiérarchiques, réponses, likes sur commentaires | 🟠 P0 | `components/feed/post-detail.tsx`, `components/feed/comment-list.tsx`, `services/comments-api.ts` |
| **Feed partage** | Partager un post : dans un chat (format inline preview), sur son profil (repost), lien externe (copier URL) | 🟡 P1 | `components/feed/share-dialog.tsx` |
| **Feed médias** | Upload multi-photos (carrousel), vidéo courte intégrée, sons/musique attachés | 🟡 P1 | `components/feed/create-post-form.tsx` |
| **Communautés enrichies** | Au-delà de l'explorer : page communauté complète avec channels texte/voix (style Discord), rôles, permissions, modération communautaire | 🟡 P1 | `app/[locale]/communities/[serverId]/`, `components/communities/` |
| **Channels texte** | Sidebar channels dans une communauté, switch entre channels, messages par channel | 🟡 P1 | `components/communities/channel-list.tsx`, `components/communities/channel-messages.tsx` |
| **Rôles & permissions** | Système de rôles communautaires (admin, modérateur, membre). UI de gestion des rôles pour les admins | 🟢 P2 | `components/communities/role-manager.tsx` |

**Livrables Sprint 4 :**

- ✅ Commentaires hiérarchiques fonctionnels sur le feed
- ✅ Partage de posts (chat + repost + lien)
- ✅ Page communauté avec channels texte

---

### Sprint 5 · Dating, Sports & Modules Avancés

**Objectif :** Implémenter les modules qui n'existent qu'en types

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Dating module** | Implémenter les types `dating.ts` en composants : `DatingProfile` (photos, bio, intérêts), `DiscoverySwipe` (swipe cards), `MatchList`, `DatingChat` (chat privé entre matchs), `DatingSettings` (age range, distance, préférences) | 🟡 P1 | `app/[locale]/dating/`, `components/dating/`, `services/dating-api.ts` |
| **Dating API/Supabase** | Tables : `dating_profiles`, `dating_swipes`, `dating_matches`, `dating_preferences`. RPCs : `get_discovery_stack()`, `record_swipe()`, `check_match()` | 🟡 P1 | SQL migration, `services/dating-api.ts` |
| **Sports module** | Implémenter `sports.ts` : `SportsHub` (scores en direct), `TeamPage`, `MatchDetail`, `LeagueStandings`, `SportsCalendar`. Source données : API externe (API-Football ou TheSportsDB) | 🟢 P2 | `app/[locale]/sports/`, `components/sports/`, `services/sports-api.ts` |
| **Sports API intégration** | Proxy API vers une source de données sportives. Cache avec React Query (staleTime 30s pour scores live) | 🟢 P2 | `app/api/sports/route.ts`, `services/sports-api.ts` |
| **Smart Home module** | Implémenter `smart-home.ts` : `DevicesDashboard`, `DeviceCard`, `SceneManager`, `AutomationRules`. Intégration Matter/Thread ou Home Assistant API | 🟢 P2 | `app/[locale]/smart-home/`, `components/smart-home/` |
| **Module discovery** | Page `/modules` améliorée montrant tous les modules disponibles avec catégories : Social, Productivité, Média, IoT, Jeux. Install toggle | 🟡 P1 | `app/[locale]/modules/page.tsx` |

**Livrables Sprint 5 :**

- ✅ Module Dating fonctionnel (profil, swipe, match, chat)
- ✅ Module Sports MVP (scores, équipes, calendrier)
- ✅ Smart Home structure de base

---

### Sprint 6 · Creator Studio & Office Enrichi

**Objectif :** Compléter le Creator Studio et la suite Office

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Creator Studio complet** | Au-delà de l'analytics : page de création de contenu, gestion des revenus, abonnements fans, statistiques engagement, top supporters, earnings dashboard | 🟡 P1 | `app/[locale]/creator-studio/`, `components/creator-studio/` |
| **Creator content manager** | Gestion de tous les contenus du créateur : posts, stories, vidéos, produits. Calendrier de publication, brouillons, planification | 🟡 P1 | `components/creator-studio/content-manager.tsx`, `components/creator-studio/calendar.tsx` |
| **Office — présentations** | Aller au-delà du stub : éditeur de slides basé sur TipTap avec templates, thèmes de slides, mode présentation plein écran, export PDF | 🟡 P1 | `app/[locale]/office/presentation/[docId]/page.tsx`, `components/office/presentation-editor.tsx` |
| **Office — tableur** | Tableur basique : grille de cellules, formules simples (SUM, AVG, COUNT), import/export CSV, tri/filtrage | 🟡 P1 | `app/[locale]/office/spreadsheet/[docId]/page.tsx`, `components/office/spreadsheet-editor.tsx` |
| **Office — collaboration** | Collaboration temps réel sur les documents : curseurs multiples, indicateur "X est en train d'écrire", merging automatique via Supabase Realtime + OT/CRDT | 🟢 P2 | `hooks/useCollaboration.ts`, `components/office/collab-cursors.tsx` |
| **Office templates** | Bibliothèque de templates : CV, lettre, rapport, présentation, facture. Import de templates communautaires | 🟢 P2 | `components/office/template-gallery.tsx` |

**Livrables Sprint 6 :**

- ✅ Creator Studio avec gestion contenu et revenus
- ✅ Éditeur de présentations fonctionnel
- ✅ Tableur MVP (grille, formules basiques, CSV)

---

### Sprint 7 · Discover, Events & Contenus Enrichis

**Objectif :** Compléter les pages discover et events

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Discover page** | Page explore enrichie : trending topics, hashtags populaires, créateurs recommandés, communautés populaires, modules tendance. Algo de recommandation basique | 🟡 P1 | `app/[locale]/discover/page.tsx`, `components/discover/` |
| **Discover — catégories** | Navigation par catégories : Social, Gaming, Music, Art, Tech, etc. Filtres combinables | 🟡 P1 | `components/discover/category-nav.tsx` |
| **Events enrichis** | Au-delà du CRUD basique : RSVP avec compteur, rappels, partage, événements récurrents, carte/lieu, calendrier mensuel, événements communautaires | 🟡 P1 | `components/events/event-detail.tsx`, `components/events/event-calendar.tsx` |
| **Events tickets** | Système de tickets pour événements payants : création de tickets, QR code validation, gestion des places | 🟢 P2 | `components/events/ticket-system.tsx`, `services/tickets-api.ts` |
| **Stories enrichies** | Compléter le stories creator : filtres, stickers, texte animé, musique, sondages inline, liens swipe-up | 🟡 P1 | `components/stories/creator/` |
| **Blog enrichi** | Au-delà du service : page blog publique, article detail, éditeur markdown/TipTap, catégories, tags, commentaires | 🟡 P1 | `app/[locale]/blog/`, `components/blog/` |

**Livrables Sprint 7 :**

- ✅ Discover page avec recommandations et catégories
- ✅ Events avec RSVP, rappels, calendrier
- ✅ Stories creator enrichi (filtres, sondages, musique)
- ✅ Blog avec éditeur et commentaires

---

## Phase 3 — Chat & Communication Avancés (Sprints 8-10)

### Sprint 8 · Chat Features Manquantes

**Objectif :** Parité feature chat avec les meilleures apps de messagerie

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Messages vocaux enrichis** | Waveform sur les messages vocaux (visualisation audio), playback speed (1x, 1.5x, 2x), seek, durée, transcription IA optionnelle | 🟡 P1 | `components/chat/voice-message.tsx` |
| **Threads / réponses** | Système de threads dans les messages : reply → ouvre un thread latéral (comme Slack). Compteur de réponses sur le message parent | 🟡 P1 | `components/chat/thread-panel.tsx`, `components/chat/message-item.tsx` |
| **Messages épinglés** | Épingler un message dans une conversation (bookmark). Panneau des messages épinglés accessible | 🟡 P1 | `components/chat/pinned-messages.tsx` |
| **Recherche dans chat** | Recherche full-text dans une conversation spécifique : highlight des résultats, navigation entre occurrences, filtres (par auteur, date, type média) | 🟡 P1 | `components/chat/search-in-chat.tsx` |
| **Messages programmés** | Planifier l'envoi d'un message à une heure future. UI : sélecteur date/heure dans le menu d'envoi | 🟢 P2 | `components/chat/scheduled-messages.tsx`, `services/scheduled-messages-api.ts` |
| **Messages éphémères** | Messages qui disparaissent après lecture ou après X temps (comme Snapchat). Toggle par conversation | 🟢 P2 | `components/chat/ephemeral-toggle.tsx` |
| **Chat polls** | Créer des sondages inline dans le chat : question + options multiples, résultats en temps réel | 🟡 P1 | `components/chat/chat-poll.tsx` |

**Livrables Sprint 8 :**

- ✅ Messages vocaux avec waveform et speed control
- ✅ Système de threads
- ✅ Messages épinglés
- ✅ Recherche in-chat

---

### Sprint 9 · Appels & Vidéo Avancés

**Objectif :** Enrichir l'expérience d'appels au-delà du MVP Stream SDK

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Screen sharing web** | Implémenter le partage d'écran via `getDisplayMedia()` + Stream SDK. Sélection écran/fenêtre, indicateur de partage, stop share | 🟠 P0 | `components/calls/screen-share.tsx` |
| **Appels de groupe** | Appels audio/vidéo multi-participants (jusqu'à 8). Grid layout adaptatif, mute/unmute individuel, indicateur who's speaking | 🟡 P1 | `components/calls/group-call.tsx`, `components/calls/participants-grid.tsx` |
| **Appels programmés** | Planifier un appel : créer un événement appel avec lien, notifications de rappel, joining room depuis le lien | 🟡 P1 | `components/calls/scheduled-call.tsx` |
| **Enregistrement appel** | Bouton record pendant un appel. Sauvegarde dans Files / Storage. Notification de consentement | 🟢 P2 | `components/calls/call-recording.tsx` |
| **Filtres beauté vidéo** | Intégrer le `beauty-filter-service.ts` existant : lissage peau, ajustement lumière, flou arrière-plan, fonds virtuels | 🟡 P1 | `components/calls/beauty-filters.tsx` |
| **PiP (Picture-in-Picture)** | Intégrer le `pip-service.ts` existant : la vidéo d'appel continue en PiP pendant la navigation vers d'autres pages | 🟡 P1 | `components/calls/pip-video.tsx` |

**Livrables Sprint 9 :**

- ✅ Screen sharing fonctionnel
- ✅ Appels de groupe (jusqu'à 8)
- ✅ Filtres beauté et fonds virtuels
- ✅ PiP pendant la navigation

---

### Sprint 10 · Real-time Enrichi & Présence

**Objectif :** Améliorer l'expérience temps réel

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Présence enrichie** | Au-delà de online/offline : statuts custom ("En réunion", "Ne pas déranger", emoji status), durée d'inactivité, dernière connexion | 🟡 P1 | `components/layout/presence-indicator.tsx`, `hooks/usePresence.ts` |
| **Read receipts** | Accusés de lecture : check simple (envoyé), double check (reçu), double check bleu (lu). Configurable par conversation | 🟡 P1 | `components/chat/read-receipts.tsx` |
| **Typing indicator enrichi** | Multiple users typing : "Alice, Bob et 2 autres écrivent..." avec animation. Indicateur dans la conversation list aussi | 🟡 P1 | `components/chat/typing-indicator.tsx` |
| **Notification sonore configurable** | Sons différents par type de notification (message, appel, mention, réaction). Configurable dans Settings > Sound | 🟡 P1 | `components/settings/sound-settings.tsx`, sons dans `public/sounds/` |
| **Live activities** | Activité en temps réel sur le profil : "En train d'écouter...", "Joue à...", "Regarde...". Opt-in privacy | 🟢 P2 | `components/profile/live-activity.tsx` |
| **WebSocket reconnection** | Améliorer la stratégie de reconnexion Socket.IO : exponential backoff, indicateur UI de connexion perdue/restored, message queue pendant la déconnexion | 🟡 P1 | `contexts/SocketContext.tsx`, `hooks/useSocket.tsx` |

**Livrables Sprint 10 :**

- ✅ Statuts custom et presence enrichie
- ✅ Read receipts configurables
- ✅ Sons de notification configurables
- ✅ Reconnexion WebSocket robuste

---

## Phase 4 — Store, Wallet & Monétisation (Sprints 11-12)

### Sprint 11 · Store Enrichi & Wallet Complet

**Objectif :** Compléter les flux store et wallet

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Store — état installé réel** | Remplacer le `// TODO: replace with real installed state` dans my-library. Connecter à ModulesContext pour afficher les vrais modules installés et leurs mises à jour | 🟠 P0 | `app/[locale]/store/my-library/page.tsx`, `app/[locale]/store/updates/page.tsx` |
| **Store — avis et notes** | Système d'avis utilisateur sur les modules : étoiles (1-5), commentaire texte, date, auteur. Moyenne affichée sur la ModuleCard | 🟡 P1 | `components/store/reviews.tsx`, `services/module-reviews-api.ts` |
| **Store — signalement** | Bouton signaler un module (contenu inapproprié, malware, spam). Workflow modération admin | 🟡 P1 | `components/store/report-module.tsx` |
| **Wallet — top-up Stripe** | Compléter le flux de recharge ImuCoin via Stripe : sélection package, Stripe Checkout, confirmation, mise à jour balance | 🟠 P0 | `components/wallet/top-up-modal.tsx`, `app/api/wallet/checkout/route.ts` |
| **Wallet — historique filtré** | Historique des transactions avec filtres : type (achat, recharge, transfert, gain), période, montant. Export CSV | 🟡 P1 | `app/[locale]/wallet/history/page.tsx`, `components/wallet/transaction-filter-bar.tsx` |
| **Wallet — transfert P2P** | Envoyer des ImuCoins à un contact : sélection contact, montant, message optionnel, confirmation | 🟡 P1 | `components/wallet/send-coins.tsx` |

**Livrables Sprint 11 :**

- ✅ My Library connecté aux données réelles
- ✅ Système d'avis sur les modules
- ✅ Top-up Stripe fonctionnel end-to-end
- ✅ Transfert P2P ImuCoins

---

### Sprint 12 · Developer Portal & Monétisation Créateurs

**Objectif :** Compléter l'écosystème développeur et créateur

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Developer Portal enrichi** | Dashboard développeur : mes modules publiés, stats (installs, revenus, avis), analytics de conversion, gestion des versions | 🟡 P1 | `app/[locale]/store/developer/`, `components/store/developer-dashboard.tsx` |
| **Module submission** | Flux de soumission d'un nouveau module : upload, metadata (description, screenshots, catégorie, prix), review policy, publication | 🟡 P1 | `components/store/module-submission.tsx`, `services/module-submission-api.ts` |
| **Revenue dashboard** | Dashboard revenus consolidé pour les créateurs : revenus store, pourboires, abonnements, publicité. Graphiques mensuel, export comptable | 🟡 P1 | `app/[locale]/creator-studio/revenue/page.tsx` |
| **Payout configuration** | Configuration de payout : coordonnées bancaires (Stripe Connect), seuil minimum, fréquence (hebdo/mensuel), historique des versements | 🟡 P1 | `components/creator-studio/payout-config.tsx` |
| **Abonnements premium** | Page Premium ImuChat : plans (Gratuit, Pro, Business), comparaison features, tunnel d'achat Stripe Subscriptions, gestion abonnement | 🟡 P1 | `app/[locale]/premium/page.tsx`, `components/premium/` |
| **Publicité self-service** | Interface de création de campagne pub : audience (âge, intérêts, région), budget, format (banner, native, interstitiel), preview, dashboard résultats | 🟢 P2 | `app/[locale]/advertising/page.tsx`, `components/advertising/` |

**Livrables Sprint 12 :**

- ✅ Developer Portal avec analytics et gestion versions
- ✅ Flux de soumission de modules
- ✅ Revenue dashboard créateurs
- ✅ Page Premium avec plans

---

## Phase 5 — Animations, UX Polish & PWA (Sprints 13-14)

### Sprint 13 · Animations & Transitions

**Objectif :** UX fluide et animations cohérentes

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Transitions de page** | Implémenter des transitions entre routes via `AnimatePresence` dans le layout : fade pour les tabs, slide pour les pages imbriquées | 🟡 P1 | `app/[locale]/layout.tsx` |
| **Animation listes** | Stagger animation sur les listes : chaque item apparaît en cascade (0.05s de délai). Appliquer sur conversations, contacts, modules, notifications | 🟡 P1 | Composants de liste (6+) |
| **Animation messages chat** | Bulles de message : entrée depuis le bas avec spring physics. Messages envoyés vs reçus : directions opposées | 🟡 P1 | `components/chat/message-list.tsx` |
| **Micro-interactions** | Scale 0.95 sur press boutons, ripple effect optionnel, smooth hover states, feedback sur toggle switches | 🟡 P1 | `components/ui/button.tsx`, composants interactifs |
| **Skeleton loading cohérent** | Standardiser le pattern shimmer sur TOUTES les zones de chargement. Créer des skeletons spécifiques : `ConversationSkeleton`, `ProfileSkeleton`, `ModuleCardSkeleton`, `MessageSkeleton` | 🟡 P1 | `components/ui/skeletons/` |
| **Lottie animations** | Intégrer des animations Lottie pour les états vides (no messages, no results, success), les réactions complètes, et les transitions de loading | 🟢 P2 | `components/ui/lottie-animation.tsx`, `public/animations/` |

**Livrables Sprint 13 :**

- ✅ Transitions de page fluides
- ✅ Animations de listes stagger
- ✅ Chat animations polished
- ✅ Skeletons spécifiques par domaine

---

### Sprint 14 · PWA & Offline

**Objectif :** Expérience PWA complète

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Service Worker** | Configurer le SW pour : cache des assets statiques (app shell), cache des API responses (stale-while-revalidate), mode offline basique | 🟡 P1 | `public/sw.js`, `hooks/useServiceWorker.ts` |
| **Install prompt** | Améliorer le hook PWA existant : banner encourageant l'installation, compteur "vous avez visité X fois", A2HS pour iOS instructions | 🟡 P1 | `components/pwa/install-prompt.tsx` |
| **Offline mode** | Quand offline : afficher banner, permettre lecture des conversations cachées, mettre en queue les messages et actions. Sync quand online | 🟡 P1 | `hooks/useOnlineStatus.ts`, `lib/offline-queue.ts` |
| **Push notifications web** | Configurer les notifications push web via FCM + Service Worker. Permission request non intrusif | 🟡 P1 | `public/firebase-messaging-sw.js`, `components/notifications/push-permission.tsx` |
| **Manifest enrichi** | Compléter `manifest.json` : screenshots, shortcuts (Chat, Appels, Store), share_target, categories | 🟡 P1 | `public/manifest.json` |
| **Splash screen** | Splash screen PWA avec logo ImuChat + couleur thème | 🟢 P2 | `public/manifest.json`, images splash |

**Livrables Sprint 14 :**

- ✅ Service Worker avec cache optimisé
- ✅ Mode offline basique (lecture + queue)
- ✅ Push notifications web
- ✅ PWA installable avec shortcuts

---

## Phase 6 — Admin, Analytics & IA (Sprints 15-16)

### Sprint 15 · Admin Panel Enrichi

**Objectif :** Dashboard admin complet pour la gestion de la plateforme

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Admin users enrichi** | Recherche avancée, filtres (rôle, statut, date inscription, KYC level), actions bulk (ban, mute, promote), export CSV | 🟡 P1 | `app/[locale]/admin/users/` |
| **Admin modération enrichie** | Queue de modération : signalements par catégorie, preview contenu, actions (supprimer, warn, ban), log d'actions, statistiques | 🟡 P1 | `app/[locale]/admin/moderation/` |
| **Admin analytics dashboard** | Dashboard temps réel : MAU/DAU, messages/jour, modules installés, revenus, inscriptions, rétention. Graphiques interactifs (Recharts) | 🟡 P1 | `app/[locale]/admin/analytics/` |
| **Admin store modération** | Review des modules soumis : preview, test sandbox, approve/reject avec motif, historique des décisions | 🟡 P1 | `app/[locale]/admin/store/` |
| **Admin config** | Configuration plateforme : feature flags, taux de commission, limites (upload, messages), paramètres i18n, maintenance mode | 🟡 P1 | `app/[locale]/admin/config/` |
| **Admin logs enrichi** | Logs d'activité : filtres (user, action, date), pagination, export, recherche full-text. Audit trail sécurité | 🟡 P1 | `app/[locale]/admin/logs/` |

**Livrables Sprint 15 :**

- ✅ Admin users avec recherche avancée et actions bulk
- ✅ Queue de modération avec preview
- ✅ Analytics dashboard temps réel
- ✅ Store modération (approve/reject modules)

---

### Sprint 16 · IA & Companion Enrichi

**Objectif :** Enrichir Alice et le Companion IA

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Alice chiffrement** | Implémenter le `// TODO: chiffrement côté client` dans alice-api.ts : chiffrer les clés API utilisateur avant stockage, déchiffrer à la lecture | 🟡 P1 | `services/alice-api.ts`, `lib/encryption.ts` |
| **Alice flows enrichis** | Étendre les Genkit flows : résumé de conversation, recherche sémantique dans les messages, suggestion de réponses, traduction contextualisée | 🟡 P1 | `ai/flows/*.ts` |
| **Companion proactif** | Enrichir le companion FSM : plus de déclencheurs proactifs (anniversaire contact, long silence, objectif atteint gamification), animations contextuelles | 🟡 P1 | `services/companion-proactive.ts`, `services/companion-fsm.ts` |
| **Companion Live2D enrichi** | Plus d'expressions et animations pour le Live2D canvas : joie, surprise, encouragement, réflexion, célébration | 🟡 P1 | `components/companion/live2d-canvas.tsx` |
| **AI modération** | IA de modération automatique pour le chat : détection toxicité, spam, contenu inapproprié. Warning banner + signalement auto | 🟢 P2 | `services/ai-moderation.ts`, `app/api/moderation/route.ts` |
| **Alice multimodal** | Support image dans les conversations Alice : upload image → description IA, analyse, OCR | 🟢 P2 | `ai/flows/image-analysis.ts` |

**Livrables Sprint 16 :**

- ✅ Alice avec chiffrement et flows enrichis
- ✅ Companion proactif avec déclencheurs contextuels
- ✅ IA modération automatique basique

---

## Dépendances inter-sprints

```
Sprint 1 (i18n core) ──→ Sprint 2 (i18n avancée) ──→ Sprint 3 (Responsive)
                                                          │
Sprint 4 (Feed/Communautés) ──→ Sprint 5 (Modules) ──→ Sprint 7 (Discover)
                                     │
                                Sprint 6 (Creator/Office) ──→ Sprint 12 (Dev Portal)
                                                                  │
Sprint 8 (Chat avancé) ──→ Sprint 10 (Real-time) ──→ Sprint 14 (PWA/Offline)
                               │
Sprint 9 (Appels avancés) ─────┘

Sprint 11 (Store/Wallet) ──→ Sprint 12 (Monétisation)

Sprint 13 (Animations) [indépendant — peut démarrer à tout moment]

Sprint 15 (Admin) [indépendant après Sprint 4]
Sprint 16 (IA) [indépendant après Sprint 8]
```

---

## Dépendances avec `ROADMAP_WEB_QUALITY_SECURITY.md`

| Ce roadmap | Dépend de Quality/Security Sprint | Raison |
|------------|:--------------------------------:|--------|
| Sprint 1 (i18n) | Peut démarrer en parallèle | Pas de dépendance |
| Sprint 4 (Feed) | Après QS Sprint 3 (tests infra) | Besoin de mocks factories pour tester |
| Sprint 8 (Chat) | Après QS Sprint 6 (React Query) | Chat avancé bénéficie d'optimistic updates |
| Sprint 11 (Store/Wallet) | Après QS Sprint 1-2 (sécurité) | Paiements nécessitent CSRF + validation |
| Sprint 13 (Animations) | Après QS Sprint 8-9 (a11y) | Animations doivent respecter reduced motion |

---

## KPIs globaux

| Métrique | Actuel | Phase 2 | Phase 4 | Phase 6 |
|----------|:------:|:-------:|:-------:|:-------:|
| **Routes fonctionnelles** | 38+ | 45+ | 50+ | 55+ |
| **Modules implémentés** | ~30 | 35 | 40 | 45 |
| **Couverture i18n** | ~60% | 100% | 100% | 100% |
| **Chat features** | Basique | +7 features | Complet | Complet + IA |
| **Store completeness** | 70% | 85% | 95% | 100% |
| **Lighthouse perf mobile** | Non mesuré | 80+ | 85+ | 90+ |
| **PWA installable** | Partiel | Partiel | Complet | Complet + offline |
