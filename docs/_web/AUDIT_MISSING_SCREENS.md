# 🔍 Audit : Écrans & Fonctionnalités manquants — Web App ImuChat

**Date** : 4 mars 2026  
**Total routes existantes** : 117 pages (`page.tsx`)  
**Source de référence** : `FUNCTIONNALITIES_LIST.md` (50 fonctionnalités) + `50_FONCTIONNALITIES_SCREENS.md`

---

## 📋 ROUTES EXISTANTES (référence)

### Public

| Route | Description |
|-------|-------------|
| `(public)/` | Landing page |
| `(public)/about` | À propos |
| `(public)/auth/login` | Login public |
| `(public)/auth/register` | Inscription public |
| `(public)/download` | Page téléchargement |
| `(public)/features` | Features showcase |
| `(public)/legal/privacy` | Politique de confidentialité |
| `(public)/legal/terms` | CGU |
| `(public)/pricing` | Tarifs |
| `(public)/team` | Équipe |

### Core App (`[locale]/...`)

| Route | Description |
|-------|-------------|
| `page` (hometab) | Page d'accueil |
| `login`, `signup`, `forgot-password` | Auth |
| `chat/`, `chat/[chatId]` | Messagerie |
| `calls/`, `calls/[callId]`, `calls/settings` | Appels |
| `contacts` | Contacts |
| `comms/`, `comms/[groupId]` | Communautés/Groupes |
| `openchat` | Chat ouvert |
| `profile/[username]`, `profile/[username]/wallet`, `profile/edit` | Profil |
| `settings/*` (8 sous-pages) | Paramètres |
| `notifications/analytics` | Analytics notifs |
| `hometab` | Hub principal |

### Modules avancés

| Route | Description |
|-------|-------------|
| `ai-assistant/`, `ai-assistant/chat/[id]`, `ai-assistant/settings` | IA |
| `office/*` (editor, journal, pdf, presentation, spreadsheet) | Suite Office |
| `files/*` (activity, preview, share, storage, trash) | Gestionnaire fichiers |
| `tasks/`, `tasks/project/[id]`, `tasks/task/[id]` | Tâches / Productivity |
| `events/`, `events/[id]`, `events/create` | Événements |
| `stories/`, `stories/[...slug]` | Stories |
| `gamification/*` (achievements, leaderboard, missions, rewards, xp) | Gamification |
| `wallet/`, `wallet/history` | Portefeuille |
| `themes/*` (create, edit, preview, detail) | Thèmes |
| `customize` | Personnalisation |
| `emergency/`, `emergency/[countryCode]` | Numéros d'urgence |

### Store & Creator

| Route | Description |
|-------|-------------|
| `store/*` (apps, bundles, detail, developer, install, my-library, updates) | Store |
| `creator-studio/*` (analytics, modules, payouts, settings) | Creator Studio |

### Admin

| Route | Description |
|-------|-------------|
| `admin/` (ai-config, analytics, config, logs, moderation, users) | Admin |

### Divers

| Route | Description |
|-------|-------------|
| `analytics/*` (activity, content, export, social, usage) | Analytics |
| `help/*` (contact, faq, status, tickets) | Support |
| `privacy`, `terms` | Légal in-app |
| `test-push` | Test (dev) |

---

## 🔴 ÉCRANS MANQUANTS (aucune implémentation)

### 1. Auth & Sécurité

| Écran | Statut | Notes |
|-------|--------|-------|
| **Onboarding/Tutorial dans le flux auth** | ⚠️ PARTIEL | Composant `components/onboarding/onboarding-flow.tsx` existe (3 slides) mais **pas de route dédiée** `/onboarding`. S'affiche en overlay. |
| **Vérification OTP** (`/verify-otp`) | 🔴 ABSENT | Aucun écran de saisie de code OTP. Pas de route `/verify`, `/confirm-email`, ni composant OTP. |
| **Gestion des appareils** (`/settings/devices`) | ⚠️ PARTIEL | `settings-security.tsx` contient une `ActiveSessionsSection` avec mock data, mais **pas de page dédiée** `/settings/devices` ni `/settings/security`. C'est un composant interne, pas exposé comme route. |
| **Historique de connexion** (`/settings/security`) | ⚠️ PARTIEL | `LoginHistorySection` existe dans `settings-security.tsx` mais **pas de route `/settings/security`**. |
| **Gestion des clés E2EE** | 🔴 ABSENT | Aucun fichier `e2ee`, aucun composant de gestion de clés de chiffrement. |
| **Mode invité (Guest mode)** | 🔴 ABSENT | Aucune implémentation. Pas de route, pas de contexte guest. |
| **Paramètres cookies (web)** | 🔴 ABSENT | Aucun composant cookie consent / cookie banner. |

### 2. Communauté (au-delà de `comms/`)

| Écran | Statut | Notes |
|-------|--------|-------|
| **Modération communauté** (`/comms/[id]/moderation`) | ⚠️ PARTIEL | `admin/moderation` existe côté admin. `bots-api.ts` a `fetchModerationLogs`, `fetchModerationStats`, `reviewModeration`. Mais **pas de page de modération accessible aux modérateurs de communauté**. |
| **Ban management** | 🔴 ABSENT | Aucune page de gestion des bans de communauté. |
| **Règles de communauté** (`/comms/[id]/rules`) | 🔴 ABSENT | Pas d'écran d'édition/affichage des règles. |
| **Stats de communauté** (`/comms/[id]/stats`) | 🔴 ABSENT | Pas de dashboard stats pour les admins de communauté. |

### 3. IA (au-delà de `ai-assistant/`)

| Écran | Statut | Notes |
|-------|--------|-------|
| **Gestion mémoire IA** (`/ai-assistant/memory`) | 🔴 ABSENT | Aucun écran pour voir/supprimer ce que l'IA retient. |
| **Gestion agents/personas** | ⚠️ PARTIEL | `admin/ai-config` existe. L'IA assistant a une page settings. Mais **pas d'écran user-facing** pour créer/gérer ses propres personas. |
| **Suggestions intelligentes de réponses** | 🔴 ABSENT | Aucun composant `SmartReply`, `SuggestReply`, ni service associé. |
| **Résumé automatisé de conversations** | ⚠️ PARTIEL | Flow Genkit `ai/flows/summarize-chat.ts` + composant `ai-sidekick.tsx` existent. Mais pas d'écran dédié ni de bouton accessible en chat. |

### 4. Appels audio/vidéo avancés

| Écran | Statut | Notes |
|-------|--------|-------|
| **Picture-in-Picture (PiP)** | 🔴 ABSENT | Aucune implémentation PiP dans les composants d'appel. Mentionné uniquement dans la landing page marketing. |
| **Filtres beauté IA + flou d'arrière-plan** | 🔴 ABSENT | Aucun composant beauty filter. Le flou background n'est pas implémenté dans les appels vidéo. |
| **Améliorations partage d'écran** | ⚠️ PARTIEL | `toggleScreenShare()` existe dans `stream-calls.ts`. UI switch dans `calls/create/step-2-options.tsx`. Mais basique — pas d'annotation, pas de sélection fenêtre/onglet. |

### 5. Profils & Identité

| Écran | Statut | Notes |
|-------|--------|-------|
| **Multi-profils** (perso/pro/créateur) | 🔴 ABSENT | Aucune notion de profils multiples. Un seul profil par compte. |
| **Avatars 2D/3D personnalisables** | 🔴 ABSENT | Mentionné dans i18n (`live2dAvatar`) et mock data rewards, mais **aucun éditeur d'avatar**. |
| **Statuts animés** (emoji, texte, musique) | 🔴 ABSENT | Pas d'écran ni composant de statut animé. |
| **Vérification d'identité** (badge bleu) | 🔴 ABSENT | Aucun flux de vérification. |

### 6. Personnalisation avancée

| Écran | Statut | Notes |
|-------|--------|-------|
| **Arrière-plans animés pour chats** | 🔴 ABSENT | Seule mention dans un sample chat theme preview (texte). Pas d'implémentation. |
| **Police personnalisable par conversation** | 🔴 ABSENT | Aucun sélecteur de police par conversation. |
| **Packs d'icônes et de sons** | 🔴 ABSENT | Store a des bundles, mais pas de packs d'icônes/sons installables. |
| **Widget homescreen** | 🔴 ABSENT | N/A pour web (pertinent mobile/desktop uniquement). |

### 7. Mini-apps sociales

| Écran | Statut | Notes |
|-------|--------|-------|
| **Mur social / Timeline** | 🔴 ABSENT | Pas de route `/feed` ni `/timeline`. Composant `profile/activity-timeline.tsx` est un historique d'activité, pas un feed social. |
| **Mini-blogs personnels** | 🔴 ABSENT | Aucune route ni composant blog. |

### 8. Modules avancés (Groupe 6)

| Écran | Statut | Notes |
|-------|--------|-------|
| **Board collaboratif** (whiteboard, mindmap) | 🔴 ABSENT | Aucune implémentation. `office/` a éditeur texte, tableur, présentation mais pas de whiteboard. |
| **Cooking & Home** (courses, ménage, repas) | 🔴 ABSENT | Aucun module domestique. |

### 9. Services utilitaires publics (Groupe 7)

| Écran | Statut | Notes |
|-------|--------|-------|
| **Horaires métro/tram/bus** | 🔴 ABSENT | Aucune route ni service transport. |
| **Info trafic routier** | 🔴 ABSENT | Aucune implémentation. |
| **Annuaire services publics** (CAF, CPAM…) | 🔴 ABSENT | Aucune route annuaire. |
| **Suivi colis multi-transporteurs** | 🔴 ABSENT | Aucun tracker de colis. |
| **Numéros d'urgence géolocalisés** | ✅ OK | `emergency/` + `emergency/[countryCode]` + `emergency-api.ts`. |

### 10. Divertissement & Création (Groupe 8)

| Écran | Statut | Notes |
|-------|--------|-------|
| **Mini-lecteur musique** | ⚠️ PARTIEL | Clé i18n `showMiniPlayer` + `playlists` existent. Données mock playlists. Mais **aucune route `/music`** ni composant player fonctionnel. |
| **Podcasts** | ⚠️ PARTIEL | Composant `hometab/podcast-widget.tsx` + clés i18n `PodcastsPage`. Mais **aucune route `/podcasts`** ni page dédiée. |
| **Lecteur vidéo intégré** | ⚠️ PARTIEL | Composants video call existent. Mais pas de lecteur vidéo standalone (type YouTube-like). |
| **Mini-jeux sociaux** (quiz, dessin, devinettes) | ⚠️ PARTIEL | `MOCK_QUIZZES` existe, `DEFAULT_QUIZ_CONFIG` dans bots-api. Mais **aucune route `/games`** ni écran de jeu. |
| **Outil de création de stickers & emojis** | 🔴 ABSENT | Middleware test réfère `/stickers` mais aucune page ni outil de création. |

### 11. Store & Écosystème (Groupe 10)

| Écran | Statut | Notes |
|-------|--------|-------|
| **Marketplace de services** (designers, pros, artisans) | ⚠️ PARTIEL | Types `commerce.ts` + composants `marketplace/` existent via le store. Mais pas de marketplace de **services humains** (freelances, artisans). |
| **Système de permissions granulaire par app** | ⚠️ PARTIEL | `host-bridge.ts` gère 17 permissions pour mini-apps. Mais **pas d'écran user-facing** pour gérer les permissions par app. |

### 12. Pages utilitaires manquantes

| Écran | Statut | Notes |
|-------|--------|-------|
| **Page Roadmap publique** (`/roadmap`) | 🔴 ABSENT | Aucune route. |
| **Page Feedback** (`/feedback`) | ⚠️ PARTIEL | `FeedbackForm` composant existe pour les reviews du store/themes. Mais pas de page `/feedback` générale. |
| **Toggle fonctionnalités beta** (`/settings/beta`) | ⚠️ PARTIEL | Feature flags API complète dans `admin-api.ts` (CRUD). Page `admin/config` les gère. Mais **pas d'écran user-facing** `/settings/beta`. |
| **Multi-window / Split view** (desktop) | 🔴 ABSENT | Aucune implémentation de layout multi-fenêtres. |

---

## 📊 RÉSUMÉ PAR STATUT

| Statut | Nombre | Description |
|--------|--------|-------------|
| 🔴 **ABSENT** | **28** | Aucune implémentation |
| ⚠️ **PARTIEL** | **15** | Code serveur / composants / mock data existent mais écran incomplet ou route manquante |
| ✅ **OK** | **1** | Numéros d'urgence (seul du Groupe 7) |

### Fonctionnalités des 50 core — Couverture

| Groupe | Fonctionnalités | Couvertes | Partielles | Absentes |
|--------|----------------|-----------|------------|----------|
| G1 — Messagerie | 5 | 4 | 1 (transcription vocale) | 0 |
| G2 — Appels | 5 | 2 | 1 (screen share) | 2 (PiP, beauty filter) |
| G3 — Profils | 5 | 1 | 0 | 4 (multi-profils, avatar 2D/3D, statuts animés, vérif identité) |
| G4 — Personnalisation | 5 | 1 (thèmes) | 0 | 4 (backgrounds animés, police/conv, packs icônes/sons, widget) |
| G5 — Social | 5 | 3 (stories, événements, groupes) | 0 | 2 (timeline/feed, mini-blogs) |
| G6 — Modules avancés | 5 | 3 (tasks, office, PDF) | 0 | 2 (whiteboard, cooking) |
| G7 — Services publics | 5 | 1 (urgence) | 0 | 4 (transport, trafic, annuaire, colis) |
| G8 — Divertissement | 5 | 0 | 4 (musique, podcasts, vidéo, jeux) | 1 (stickers) |
| G9 — IA | 5 | 1 (chatbot) | 2 (résumé, traduction) | 2 (suggestions, modération auto groupes) |
| G10 — Store | 5 | 3 (store, install, paiement) | 2 (permissions, marketplace) | 0 |
| **TOTAL** | **50** | **19** | **10** | **21** |

### Taux de couverture des 50 fonctionnalités

- ✅ **Implémenté** : 19/50 (38%)
- ⚠️ **Partiel** : 10/50 (20%)
- 🔴 **Absent** : 21/50 (42%)

---

## 🎯 PRIORITÉS RECOMMANDÉES

### Haute priorité (UX critique, attendu par tout utilisateur)

1. **Page `/settings/security`** — Exposer `SettingsSecurity` comme route (sessions, historique, 2FA)
2. **Écran OTP / Vérification email** — Flux auth incomplet sans
3. **Cookie consent banner** — Obligation légale RGPD en web
4. **Feed social / Timeline** — Core feature manquante pour l'aspect "super-app"
5. **PiP pour les appels** — Fonctionnalité annoncée dans la doc marketing

### Moyenne priorité (différenciateurs produit)

6. Multi-profils
2. Music player + Podcasts pages
3. Mini-blogs
4. Suggestions IA de réponses
5. Écran beta features pour utilisateurs
6. Gestion community modération (côté modérateurs)

### Basse priorité (V2+)

12. Board collaboratif (whiteboard)
2. Services publics (transport, trafic, annuaire, colis)
3. Cooking & Home
4. Sticker creation tool
5. Avatar 2D/3D editor
6. Multi-window desktop
