# 📱 Vision & Structure Mobile ImuChat — Document Enrichi v2

**Date de création :** 8 mars 2026  
**Version :** 2.0 (enrichie)  
**Source :** `Vision_Structure_Mobile.md`  
**Statut actuel de l'app :** Expo SDK 52+ · ~80 000 lignes TS/TSX · 340+ fichiers · 2296 tests · 42/50 fonctionnalités (84%) · Phase 3 modulaire en cours

---

## Table des matières

1. [Philosophie UX — Super-App en Couches](#1-philosophie-ux--super-app-en-couches)
2. [Architecture de Navigation (Bottom Tabs)](#2-architecture-de-navigation-bottom-tabs)
3. [Onglet 1 — Home (Hub Personnalisable)](#3-onglet-1--home-hub-personnalisable)
4. [Onglet 2 — Chats (Messagerie)](#4-onglet-2--chats-messagerie)
5. [Onglet 3 — Social (Réseaux & Feed)](#5-onglet-3--social-réseaux--feed)
6. [Onglet 4 — Watch (Multimédia & ImuFeed)](#6-onglet-4--watch-multimédia--imufeed)
7. [Onglet 5 — Store (Extensibilité)](#7-onglet-5--store-extensibilité)
8. [Onglet 6 — Profil (Identité & Wallet)](#8-onglet-6--profil-identité--wallet)
9. [Bouton Flottant Universel (FAB)](#9-bouton-flottant-universel-fab)
10. [Système de Widgets Personnalisables](#10-système-de-widgets-personnalisables)
11. [Moteur de Personnalisation & IA](#11-moteur-de-personnalisation--ia)
12. [Architecture Technique Détaillée](#12-architecture-technique-détaillée)
13. [Design System Mobile](#13-design-system-mobile)
14. [Transitions & Animations](#14-transitions--animations)
15. [Gestion Offline & Performance](#15-gestion-offline--performance)
16. [Accessibilité & Inclusivité](#16-accessibilité--inclusivité)
17. [Sécurité & Segmentation par Âge](#17-sécurité--segmentation-par-âge)
18. [Mapping Écrans Complet (~120+ écrans)](#18-mapping-écrans-complet-120-écrans)

---

## 1. Philosophie UX — Super-App en Couches

### 1.1 Le défi de la complexité

ImuChat est une super-app qui englobe 50+ fonctionnalités réparties sur 120+ écrans. L'enjeu majeur sur mobile est de **masquer cette complexité** tout en donnant accès à tout. La solution repose sur une **architecture en 3 couches** :

| Couche | Fonction | Mécanisme |
|--------|----------|-----------|
| **Surface** | Navigation principale | 6 onglets — visible en permanence |
| **Découverte** | Accès aux modules | Hub Home + Store + recherche universelle |
| **Profondeur** | Fonctionnalités complètes | Sous-écrans, mini-apps, modales |

### 1.2 Principes directeurs

| Principe | Description | Inspiration |
|----------|-------------|-------------|
| **First Tap Useful** | Chaque onglet donne de la valeur dès le premier tap | WeChat |
| **Progressive Discovery** | L'utilisateur découvre les modules au fil du temps | iOS App Library |
| **Personalization First** | Le Hub s'adapte aux habitudes de chaque utilisateur | TikTok "Pour Toi" |
| **Social Core** | Le chat et le social sont toujours à portée de main | Telegram |
| **Extensible by Design** | Le Store permet d'ajouter des capacités à la demande | WeChat Mini Programs |
| **Consistent UX** | Les mini-apps WebView héritent du thème ImuChat | Discord |

### 1.3 Modèle mental utilisateur

```
"ImuChat c'est avant tout mon app de chat et de social,
 mais si j'en ai besoin, c'est aussi mon bureau, ma télé,
 mon store, et mon assistant IA."
```

L'utilisateur doit pouvoir passer un an sur ImuChat en n'utilisant que le Chat et le Social, puis un jour découvrir le Store, installer un module Office, et réaliser que sa super-app fait bien plus.

---

## 2. Architecture de Navigation (Bottom Tabs)

### 2.1 Barre de navigation principale

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Home  │  💬 Chats  │  🌐 Social  │  🎬 Watch  │  🛍 Store  │  👤 Profil │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Mapping des fichiers existants

| Onglet | Fichier Expo Router | Lignes | État actuel | Cible v2 |
|--------|-------------------|--------|-------------|----------|
| Home | `app/(tabs)/index.tsx` | 683 | ⚠️ 50% mock | Hub personnalisable + widgets |
| Chats | `app/(tabs)/chats.tsx` | — | ✅ 95% réel | Stable |
| Social | `app/(tabs)/social.tsx` | 654 | ✅ Réel Supabase | + ImuFeed vidéo vertical |
| Watch | `app/(tabs)/watch.tsx` | 518 | ⚠️ 60% mock | Watch Party + ImuFeed long |
| Store | `app/(tabs)/store.tsx` | 587 | ✅ Connecté Supabase | Stable |
| Profil | `app/(tabs)/profile.tsx` | — | ✅ 85% réel | + Wallet + Arena |

### 2.3 Sous-navigation par onglet

Chaque onglet ouvre vers des **sous-écrans** via Expo Router :

```
Home
├── search.tsx (recherche universelle)
├── miniapp/[id].tsx (lancement mini-app)
└── suggestions/index.tsx

Chats
├── chat/[id].tsx (conversation)
├── chat/new.tsx (nouveau message)
├── call/[id].tsx (appel en cours)
└── bots/[id].tsx (chatbots IA)

Social
├── social/create-post.tsx
├── social/comments/[id].tsx
├── stories/[id].tsx (viewer)
├── stories/create.tsx
└── events/[id].tsx

Watch
├── watch/[id].tsx (player vidéo)
├── music/index.tsx
├── podcasts/index.tsx
└── imufeed/ (feed vidéo vertical — À CRÉER)

Store
├── store/[id].tsx (détail module)
└── miniapp/[id].tsx (lancement)

Profil
├── settings/
├── wallet/
├── analytics-insights/
└── privacy-center.tsx
```

### 2.4 Badges et indicateurs

| Badge | Onglet | Donnée |
|-------|--------|--------|
| Nombre non-lus | Chats | `unreadCount` temps réel (Supabase Realtime) |
| Point rouge | Notifications | via `NotificationBridge` 3-layer |
| "New" | Store | Nouveaux modules publiés depuis dernière visite |
| Live indicator | Watch | Watch Party ou Live en cours |

---

## 3. Onglet 1 — Home (Hub Personnalisable)

### 3.1 Vision

Le Home est le **tableau de bord personnel** de l'utilisateur. Chaque utilisateur voit un Home différent, adapté à ses modules installés, ses habitudes et ses préférences. C'est l'écran le plus stratégique de l'application : il doit à la fois servir les utilisateurs existants (accès rapide) et inviter les nouveaux à explorer (découverte progressive).

### 3.2 Layout complet

```
┌─────────────────────────────────────────────┐
│  🔔 (3)     ImuChat        🔍  🤖  ⚙️       │  ← Top bar
├─────────────────────────────────────────────┤
│                                             │
│  ⚡ ACCÈS RAPIDES (grille 2x3)              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ 💬 Chat  │ │ 📞 Appel │ │ 🤖 IA   │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ 📸 Story │ │ 📅 Event │ │ 🎥 Live  │      │
│  └─────────┘ └─────────┘ └─────────┘      │
│                                             │
│  📌 MES MODULES (scroll horizontal)         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ →    │
│  │Drive│ │Note│ │Cook│ │Game│ │More│       │
│  └────┘ └────┘ └────┘ └────┘ └────┘       │
│                                             │
│  👥 ACTIVITÉ SOCIALE                        │
│  ┌─────────────────────────────────────┐    │
│  │ ◯  ◯  ◯  ◯  ◯  ◯  ◯   Stories    →│    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ Nathan a posté une photo            │    │
│  │ Alice a rejoint le groupe Dev       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📊 WIDGETS PERSONNELS                      │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ 📅 Agenda     │ │ ☀️ Météo     │         │
│  │ Réunion 14h   │ │ 22°C Paris  │         │
│  │ IA tips 16h   │ │             │         │
│  └──────────────┘ └──────────────┘         │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ ✅ Tâches     │ │ 💰 Wallet    │         │
│  │ 3/7 fait     │ │ 520 ImuCoins │         │
│  └──────────────┘ └──────────────┘         │
│                                             │
│  🔥 TRENDING                                │
│  ┌─────────────────────────────────────┐    │
│  │ #ImuFeedChallenge — 24K vues       │    │
│  │ Concours Gaming — 150 participants │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│ 🏠  💬  🌐  🎬  🛍  👤                      │
└─────────────────────────────────────────────┘
```

### 3.3 Sections détaillées

#### 3.3.1 Top Bar

| Élément | Action | Détail |
|---------|--------|--------|
| 🔔 Badge | Notifications | Badge rouge avec compteur non-lus |
| Logo ImuChat | — | Tap = scroll to top |
| 🔍 | Recherche universelle | Recherche dans messages, contacts, modules, posts, vidéos |
| 🤖 | Alice (IA) | Ouvre le chat avec l'assistant IA ImuCompanion |
| ⚙️ | Paramètres rapides | Thème, mode nuit, mode enfant |

#### 3.3.2 Accès Rapides

Grille configurable de 6 raccourcis. Par défaut :

| Position | Action | Route |
|----------|--------|-------|
| 1 | Nouveau message | `chat/new` |
| 2 | Appel rapide | `call/dial` |
| 3 | Alice IA | `alice/` |
| 4 | Nouvelle story | `stories/create` |
| 5 | Créer événement | `events/create` |
| 6 | Lancer live | `watch/live/create` |

L'utilisateur peut **réordonner et remplacer** ces raccourcis (drag & drop). Les raccourcis disponibles incluent tous les modules installés.

#### 3.3.3 Mes Modules

- Scroll horizontal des modules installés via le Store
- Source : `useModulesStore()` — données Supabase `user_modules`
- Tap → navigation vers `miniapp/[id]` ou écran natif
- Long press → option "Retirer du Home" / "Réorganiser"
- Bouton "+" en fin de liste → ouvre le Store

#### 3.3.4 Activité Sociale

- Stories : `useStoriesStore()` — pull depuis Supabase
- Feed condensé : 2-3 derniers posts de `fetchFeed()` via `social-feed.ts`
- Tap "Voir tout" → navigation vers l'onglet Social

#### 3.3.5 Widgets Personnels

Voir [Section 10 - Système de Widgets](#10-système-de-widgets-personnalisables).

### 3.4 Personnalisation du Home

| Action | Mécanisme | Persistance |
|--------|-----------|-------------|
| Réorganiser les sections | Drag & drop (long press) | `AsyncStorage` + Supabase sync |
| Ajouter/retirer widgets | Modal "Gérer widgets" | `user_home_config` table |
| Changer les raccourcis | Long press sur la grille | `user_home_config` table |
| Masquer une section | Swipe gauche | Local |

### 3.5 État actuel vs cible

| Composant | État actuel (`index.tsx` 683 lig.) | Cible v2 |
|-----------|-----------------------------------|----------|
| HeroCarousel | ⚠️ Mock hardcodé | IA-driven contenu personnalisé |
| Stories | ✅ Réel (`useStoriesStore`) | Stable |
| FriendsCard | ✅ Réel (`getConversations`) | Stable |
| ExplorerGrid | ⚠️ Mock | Modules installés (Supabase) |
| PodcastWidget | ⚠️ Mock | Widget configurable |
| Widgets | ❌ Non existant | Système de widgets complet |
| Quick Actions | ❌ Non existant | Grille configurable |

---

## 4. Onglet 2 — Chats (Messagerie)

### 4.1 Vision

Le cœur historique d'ImuChat. La messagerie doit être **aussi rapide et fiable que Telegram**, avec la richesse fonctionnelle de Discord (bots, réactions, fils) et l'intégration profonde de WeChat (mini-apps dans le chat).

### 4.2 Layout — Liste des conversations

```
┌─────────────────────────────────────────────┐
│  🔍 Rechercher conversation                  │
├─────────────────────────────────────────────┤
│  📌 FAVORIS                                  │
│  ┌──────────────────────────────────────┐   │
│  │ ◯ Alice          En ligne    14:23   │   │
│  │   "On se retrouve à 16h ?"          │   │
│  ├──────────────────────────────────────┤   │
│  │ ◯ Projet ImuChat  3 en ligne   12:40│   │
│  │   Nathan: "Le deploy est OK"        │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  💬 CONVERSATIONS                            │
│  ┌──────────────────────────────────────┐   │
│  │ ◯ Groupe Dev       5 membres  10:15 │   │
│  │   Lucas: "Review PR #42 svp"    (2) │   │
│  ├──────────────────────────────────────┤   │
│  │ ◯ Famille          4 membres  hier  │   │
│  │   Maman: Photo envoyée              │   │
│  ├──────────────────────────────────────┤   │
│  │ 🤖 Alice IA        Bot        9:30  │   │
│  │   "Comment je peux t'aider ?"       │   │
│  └──────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ 🏠  💬  🌐  🎬  🛍  👤                      │
└─────────────────────────────────────────────┘
```

### 4.3 Layout — Conversation ouverte

```
┌─────────────────────────────────────────────┐
│  ← Alice           En ligne  📞  🎥  ⋮     │
├─────────────────────────────────────────────┤
│                                             │
│  Hello 👋                            14:20  │
│  Tu avances sur ImuChat ?                   │
│                                             │
│                    Oui ! Je bosse sur l'UX  │
│                    Regarde ce screen :      │
│                    [📸 image.png]    14:22  │
│                                             │
│  Oh super ! 😍                       14:23  │
│  [❤️ 😂 👍 réactions]                       │
│                                             │
│  ┌─────────────────────────────────┐        │
│  │ 🤖 Alice IA suggère :           │        │
│  │ "Voulez-vous planifier un call │        │
│  │  pour discuter du design ?"     │        │
│  └─────────────────────────────────┘        │
│                                             │
├─────────────────────────────────────────────┤
│  + │ 🎤 │ 😊 │ 📎 │  Message...      ➤    │
└─────────────────────────────────────────────┘
```

### 4.4 Fonctionnalités chat existantes (17 composants)

| Fonctionnalité | Service/Hook | État |
|----------------|-------------|------|
| Messages texte/image/audio/vidéo | Supabase Realtime | ✅ |
| Réactions aux messages | `ReactionPicker.tsx` | ✅ |
| Messages vocaux | `VoiceRecorder.tsx` | ✅ |
| File d'attente offline | `offline-queue.ts` | ✅ |
| Appels audio/vidéo | Stream Video SDK | ✅ 70% |
| Chatbots IA (Alice) | `alice.ts` service | ✅ |
| Groupes & modération | `comms` dans social | ✅ 85% |

### 4.5 Fonctionnalités chat à intégrer (super-app)

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Mini-apps dans le chat | Partager un module/mini-app directement dans la conversation | P2 |
| Réponses vidéo | Répondre à un message par une vidéo courte (type ImuFeed) | P3 |
| Watch Party depuis chat | Lancer une Watch Party synchronisée depuis une conversation de groupe | P2 |
| IA résumé de conversation | Résumer les messages manqués via Alice | P3 |
| Traduction temps réel | Traduire les messages dans la langue de l'utilisateur | P3 |
| Paiements dans le chat | Envoyer des ImuCoins dans le chat | P2 |

---

## 5. Onglet 3 — Social (Réseaux & Feed)

### 5.1 Vision

L'espace social d'ImuChat combine **3 formats de contenu** en un seul onglet : les Stories (éphémère), le Feed classique (posts texte/image) et un Feed vidéo vertical type TikTok/Reels (ImuFeed). C'est l'onglet le plus important pour la **viralité et l'acquisition** d'utilisateurs.

### 5.2 Layout — Social avec 3 sous-onglets

```
┌─────────────────────────────────────────────┐
│  ImuChat Social         🔍  🔔               │
├─────────────────────────────────────────────┤
│  [ Feed ] [ ImuFeed 🎬 ] [ Stories ]        │  ← Sous-onglets
├─────────────────────────────────────────────┤
│                                             │
│  FEED CLASSIQUE (si onglet Feed sélectionné)│
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ◯ Nathan · 2h · 🌐                 │    │
│  │                                     │    │
│  │ Aujourd'hui je travaille sur la     │    │
│  │ super-app ImuChat ! Bientôt le MVP │    │
│  │                                     │    │
│  │ [📸 screenshot.png]                 │    │
│  │                                     │    │
│  │ ❤️ 124  💬 18  🔁 5  📌 3           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ◯ Lucas · 5h · 👥 Groupe Dev       │    │
│  │                                     │    │
│  │ PR merged ! La feature X est live   │    │
│  │                                     │    │
│  │ ❤️ 87   💬 12  🔁 2  📌 1           │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│ 🏠  💬  🌐  🎬  🛍  👤                      │
└─────────────────────────────────────────────┘
```

### 5.3 Layout — ImuFeed (vidéo vertical plein écran)

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│                                             │
│              V I D É O                      │
│           PLEIN ÉCRAN                       │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                            ┌───┐            │
│  ◯ Nathan · Suivre        │ ❤️ │ 24K        │
│  #startup #imuchat        │ 💬 │ 1.2K       │
│  🎵 Son original          │ 🔁 │ 800        │
│                            │ ⭐ │ Save       │
│                            │ ➤  │ Share      │
│                            └───┘            │
├─────────────────────────────────────────────┤
│  [ Pour toi ] [ Abonnements ] [ Trending ] │
└─────────────────────────────────────────────┘
```

Voir [Document ImuFeed Video v2](ImuFeed_VIDEO_v2.md) pour le détail complet.

### 5.4 Layout — Stories

```
┌─────────────────────────────────────────────┐
│  ◯═══◯═══◯═══◯═══◯═══◯═══◯                │
│  Moi  Alice Dev  Music Voyage Sport         │
├─────────────────────────────────────────────┤
│                                             │
│   GRILLE DE STORIES HIGHLIGHTS              │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Alice  │ │ Nathan │ │ Dev    │          │
│  │ 📸     │ │ 📸     │ │ 📸     │          │
│  │ 2 min  │ │ 15 min │ │ 1h     │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.5 Fonctionnalités sociales existantes

| Fonctionnalité | Service | État |
|----------------|---------|------|
| Feed posts (texte/image) | `social-feed.ts` → `fetchFeed()` | ✅ Réel Supabase |
| Likes/Commentaires/Partages | `toggleLike()` / `sharePost()` | ✅ |
| Stories | `stories-api.ts` + `stories-store.ts` (Zustand) | ✅ Done |
| Création de post | `social/create-post.tsx` | ✅ |
| Filtres feed | mixed / news / following | ✅ |
| Événements | `events/` | ✅ Basique |
| Feed vidéo vertical (ImuFeed) | ❌ Non existant | 🔴 À créer |
| Trending / Hashtags | ❌ Non existant | 🔴 À créer |

### 5.6 Intégration ImuFeed dans Social

Le sous-onglet "ImuFeed 🎬" dans l'onglet Social donne accès au **feed vidéo vertical** plein écran. Quand l'utilisateur swipe sur cet onglet, le bottom tab disparaît pour une expérience immersive. Le swipe vers le bas depuis ImuFeed ramène l'utilisateur au feed classique.

---

## 6. Onglet 4 — Watch (Multimédia & Divertissement)

### 6.1 Vision

L'onglet Watch regroupe tous les **contenus longue durée** : Watch Party synchronisées, vidéos longues, podcasts, musique. C'est le complément d'ImuFeed (contenu court) avec un focus sur le **visionnage partagé** et l'écoute.

### 6.2 Layout

```
┌─────────────────────────────────────────────┐
│  Watch              🔍  📺  🔔               │
├─────────────────────────────────────────────┤
│                                             │
│  🔴 EN DIRECT                               │
│  ┌─────────────────────────────────────┐    │
│  │ 🔴 Watch Party: Anime Night         │    │
│  │    12 participants · One Piece      │    │
│  │    "Rejoindre" [button]             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [ 🎬 Vidéos ] [ 🎧 Podcasts ] [ 🎵 Musique ] │
│                                             │
│  VIDÉOS                                     │
│  ┌─────────────────────────────────────┐    │
│  │ 🎥 thumbnail                        │    │
│  │ Titre de la vidéo                   │    │
│  │ Créateur · 24K vues · 2h           │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 🎥 thumbnail                        │    │
│  │ Titre de la vidéo                   │    │
│  │ Créateur · 12K vues · 5h           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  CATÉGORIES                                 │
│  [ All ] [ Anime ] [ Tech ] [ Musique ]    │
│                                             │
├─────────────────────────────────────────────┤
│ 🏠  💬  🌐  🎬  🛍  👤                      │
└─────────────────────────────────────────────┘
```

### 6.3 Watch Party

Feature différenciante clé : regarder du contenu ensemble.

| Fonction | Description |
|----------|-------------|
| Synchronisation | Lecture synchronisée entre tous les participants |
| Chat latéral | Conversation en temps réel pendant le visionnage |
| Réactions live | Emojis flottants qui apparaissent à l'écran |
| Invitations | Inviter des amis ImuChat à rejoindre |
| Création | N'importe quel utilisateur peut créer une Watch Party |

### 6.4 Lecteur multimédia existant

| Composant | Technologie | État |
|-----------|-------------|------|
| Vidéo | `expo-av` (`Video` + `ResizeMode`) | ✅ |
| Audio (musique) | `expo-av` + `audio-player.ts` | ✅ (Phase M4) |
| Podcasts | `podcast-api.ts` | ✅ Basique |
| Plein écran | `enterFullscreen()` dans `video-player.ts` | ✅ |
| PiP (Picture-in-Picture) | expo-av | ⚠️ Planifié |
| Contrôles lockscreen | expo-av background audio | ✅ Musique |

---

## 7. Onglet 5 — Store (Extensibilité)

### 7.1 Vision

Le Store est **le moteur d'extensibilité** d'ImuChat. C'est ici que l'utilisateur découvre que sa super-app peut faire bien plus. Le Store propose des mini-apps, des contenus, des services et des bundles — tous chargés dynamiquement via WebView sandboxée ou nativement.

### 7.2 Layout

```
┌─────────────────────────────────────────────┐
│  ImuChat Store          🔍                   │
├─────────────────────────────────────────────┤
│  [ Tout ][ Apps ][ Contenus ][ Services ]   │
├─────────────────────────────────────────────┤
│                                             │
│  ⭐ POPULAIRES                               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │📝  │ │🍳  │ │🎮  │ │💰  │              │
│  │Offi│ │Cook│ │Game│ │Fina│              │
│  │4.8⭐│ │4.6⭐│ │4.9⭐│ │4.3⭐│              │
│  └────┘ └────┘ └────┘ └────┘              │
│                                             │
│  🆕 NOUVEAUTÉS                               │
│  ┌─────────────────────────────────────┐    │
│  │ 🎨 ImuDesign — Suite créative      │    │
│  │ Nouveau · Gratuit · ⬇ 1.2K         │    │
│  │ [Installer]                         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📦 CATÉGORIES                               │
│  ┌──────────┐ ┌──────────┐                  │
│  │Productivité│ │Créatif   │                │
│  ├──────────┤ ├──────────┤                  │
│  │Social    │ │Utilitaire│                  │
│  ├──────────┤ ├──────────┤                  │
│  │Médias    │ │Éducation │                  │
│  └──────────┘ └──────────┘                  │
│                                             │
│  📦 MES APPS                                 │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │✅📝 │ │✅🍳 │ │✅🎮 │ (installées)        │
│  └────┘ └────┘ └────┘                      │
│                                             │
├─────────────────────────────────────────────┤
│ 🏠  💬  🌐  🎬  🛍  👤                      │
└─────────────────────────────────────────────┘
```

### 7.3 Infrastructure existante

| Composant | État | Détail |
|-----------|------|--------|
| Catalogue Supabase | ✅ | 37 modules (12 core, 3 default, 22 optionnels) |
| API install/uninstall | ✅ | `platform-core` API |
| WebView sandbox | ✅ | `MiniAppHostMobile.tsx` + `MobileBridge.ts` |
| SDK injecté | ✅ | `window.ImuChat` (auth, storage, theme, ui, wallet, chat) |
| Deep links | ✅ | `imuchat://miniapp/[id]` |

### 7.4 Catégories de modules

| Catégorie | Modules | Nb |
|-----------|---------|--:|
| Productivité | Office, Drive, Tasks, Notes | 4 |
| Social | Dating, Social Hub | 2 |
| Médias | Music, Watch, Podcasts, News | 4 |
| Créativité | Stickers, Creator Studio, Design | 3 |
| Divertissement | Games, Contests, Sports, Worlds | 4 |
| Vie quotidienne | Cooking, SmartHome, Mobility, Style & Beauty | 4 |
| Éducation | Formations, Library | 2 |
| Finance | Finance, Voom | 2 |
| Services | Services, Resources | 2 |
| Admin | Admin | 1 |

---

## 8. Onglet 6 — Profil (Identité & Wallet)

### 8.1 Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│        ┌──────┐                             │
│        │ 📸   │   Nathan                    │
│        │Avatar│   @imogo                    │
│        └──────┘   "Building the future"     │
│                                             │
│  ┌──── Abonnés ────┐┌── Abonnements ──┐   │
│  │     1,234        ││     567         │   │
│  └──────────────────┘└─────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  💰 Wallet ImuCoin                          │
│  ┌─────────────────────────────────────┐    │
│  │ Solde : 2,450 ImuCoins              │    │
│  │ [Recharger] [Historique] [Envoyer] │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  🏟 Arena — Rang Or (1,250 pts)             │
│  ┌─────────────────────────────────────┐    │
│  │ ▓▓▓▓▓▓▓▓░░░░ 62% vers Platine     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  📦 Mes Modules (12 installés)              │
│  🎨 Personnalisation                        │
│  📊 Analytics & Stats                       │
│  🔐 Sécurité & Confidentialité              │
│  ⚙️ Paramètres                               │
│  ❓ Aide & Support                           │
│                                             │
├─────────────────────────────────────────────┤
│ 🏠  💬  🌐  🎬  🛍  👤                      │
└─────────────────────────────────────────────┘
```

### 8.2 Sous-sections du Profil

| Section | Route | Contenu |
|---------|-------|---------|
| Wallet | `wallet/index.tsx` | Solde, recharge, historique, envoi ImuCoins |
| Arena | (à créer) | Rang, progression, classements, trophées |
| Mes Modules | via `modules-store` | Liste des modules installés, gestion |
| Personnalisation | `settings/` | 6 thèmes (Light/Dark/Kawaii/Pro/Neon/Ocean), avatar |
| Analytics | `analytics-insights/` | Temps d'écran, catégories les plus utilisées |
| Sécurité | `privacy-center.tsx` | 2FA, sessions, données, blocages |
| Paramètres | `settings/` | Langue (FR/EN/JA), notifications, stockage |

---

## 9. Bouton Flottant Universel (FAB)

### 9.1 Concept

Un **Floating Action Button** (FAB) toujours visible en bas à droite de l'écran, superposé à la tab bar. Il permet de **créer** n'importe quel contenu depuis n'importe quel écran.

### 9.2 Comportement

```
État normal :        ⊕  (bouton rond, couleur primaire)

Tap → Menu radial animé :

                     📝 Post
                 📸 Story       📅 Event
              💬 Message          🎥 Vidéo
                 📄 Document     📞 Appel
                     + Annuler
```

### 9.3 Actions du FAB

| Action | Route cible | Disponibilité |
|--------|-------------|---------------|
| 💬 Nouveau message | `chat/new` | Toujours |
| 📸 Nouvelle story | `stories/create` | Toujours |
| 📝 Nouveau post | `social/create-post` | Toujours |
| 🎥 Nouvelle vidéo | `imufeed/create` (à créer) | Toujours |
| 📅 Nouvel événement | `events/create` | Si module installé |
| 📄 Nouveau document | `office/new` | Si module installé |
| 📞 Appel rapide | `call/dial` | Toujours |

### 9.4 Personnalisation du FAB

- L'utilisateur peut réorganiser les actions du FAB
- Les modules installés ajoutent automatiquement leur action de création
- Le FAB disparaît en mode lecture (ImuFeed, Watch plein écran)
- Animation : spring bounce à l'ouverture, rotation 45° du "+"

### 9.5 Implémentation technique

```typescript
// Composant : components/FloatingActionButton.tsx
// Store : stores/fab-store.ts (Zustand)
// Animation : react-native-reanimated (spring, rotation)
// Position : absolute, bottom-right, au-dessus de la tab bar
// Z-index : supérieur à la tab bar
```

---

## 10. Système de Widgets Personnalisables

### 10.1 Concept

Les widgets du Home sont des **cartes interactives** qui affichent des informations en temps réel depuis les différents modules. Inspiré des widgets iOS et du dashboard Notion.

### 10.2 Widgets disponibles

| Widget | Taille | Source | Contenu |
|--------|--------|--------|---------|
| 📅 Agenda | 2x1 | Module Events / Office | Prochain événement, réunions du jour |
| ☀️ Météo | 1x1 | API météo | Température, conditions |
| ✅ Tâches | 2x1 | Module Tasks | Tâches du jour, progression |
| 💰 Wallet | 1x1 | `wallet-store` | Solde ImuCoins |
| 🏟 Arena | 2x1 | Arena (concours) | Rang, points, prochain concours |
| 🎵 Musique | 2x1 | `music-store` | En cours de lecture, contrôles |
| 🤖 IA Tips | 1x1 | Alice IA | Suggestion du jour |
| 📦 Colis | 1x1 | Module Services | Suivi de livraison |
| 🎮 Gaming | 2x1 | Module Games | Dernière partie, stats |
| 📊 Screen Time | 1x1 | Analytics | Temps d'écran jour |
| 👥 Amis en ligne | 2x1 | Contacts | Amis connectés |
| 🔔 Recap | 2x2 | Notifications | Résumé des notifications non-lues |

### 10.3 Architecture des widgets

```typescript
// Types dans shared-types
interface HomeWidget {
  id: string;
  type: WidgetType;
  size: '1x1' | '2x1' | '2x2';
  position: { row: number; col: number };
  config?: Record<string, unknown>;
  moduleId?: string; // Si le widget vient d'un module
}

// Store Zustand
interface HomeConfigStore {
  widgets: HomeWidget[];
  quickActions: QuickAction[];
  sections: HomeSection[];
  addWidget: (widget: HomeWidget) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (widgets: HomeWidget[]) => void;
}
```

### 10.4 Grille de widgets

```
┌─────────────────────┐
│ [2x1 Agenda]        │ [1x1 Météo]
├──────────┬──────────┤
│ [2x1 Tâches]        │ [1x1 Wallet]
├──────────┴──────────┤
│ [2x2 Recap notifs]              │
└─────────────────────────────────┘
```

La grille utilise un **layout responsive** en 2 colonnes : les widgets 2x1 prennent toute la largeur, les 1x1 se placent côte à côte.

---

## 11. Moteur de Personnalisation & IA

### 11.1 Algorithme de personnalisation du Home

Le Home s'adapte automatiquement aux habitudes de l'utilisateur :

| Signal | Mécanisme | Action |
|--------|-----------|--------|
| Module le plus utilisé | Compteur `usage_count` dans `user_modules` | Remonté en premier dans "Mes Modules" |
| Heure de la journée | Hooks `useTimeOfDay()` | Le matin : agenda. Le soir : Watch |
| Amis actifs | Supabase Realtime `presence` | Suggestions d'appel / chat |
| Contenus tendance | Score de trending | Affichage dans section "Trending" |
| Non ouvert depuis 7j | `last_opened_at` | Suggestion "Redécouvrir : module X" |

### 11.2 Alice IA dans le Home

- **Suggestion proactive** : "Tu as un événement dans 30 min, prépare-toi !"
- **Résumé du jour** : "3 messages non-lus, 2 événements, 1 nouveau module populaire"
- **Onboarding progressif** : "Savais-tu que tu peux installer ImuCooking ?"

### 11.3 Personnalisation de thème

| Thème | Style | Disponible |
|-------|-------|:---:|
| Light | Clair, minimal | ✅ |
| Dark | Sombre, contrasté | ✅ |
| Kawaii | Pastel, arrondi, manga/anime | ✅ |
| Pro | Sobre, productivité | ✅ |
| Neon | Futuriste, néons | ✅ |
| Ocean | Bleu-vert, apaisant | ✅ |

Les 6 thèmes sont déjà implémentés via `ThemeProvider` et `useColors()` / `useSpacing()`.

---

## 12. Architecture Technique Détaillée

### 12.1 Stack technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | React Native | via Expo SDK 52+ |
| Navigation | Expo Router | File-based routing |
| State | Zustand | 20+ stores, persist AsyncStorage |
| i18n | Custom `I18nProvider` | FR / EN / JA (~2630 clés) |
| Backend | Supabase | PostgreSQL + Realtime + Auth + Storage |
| Appels | Stream Video SDK | WebRTC |
| Vidéo | expo-av | Lecture, PiP, fullscreen |
| Audio | expo-av | Background audio, lockscreen |
| Mini-apps | react-native-webview | Sandbox + MobileBridge |
| Animations | react-native-reanimated | Springs, transitions |
| Tests | Jest | 2296 tests, 101 fichiers |

### 12.2 Architecture des dossiers (cible)

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/                   # Bottom tabs
│   │   ├── index.tsx             # Home Hub
│   │   ├── chats.tsx             # Conversations
│   │   ├── social.tsx            # Feed + ImuFeed + Stories
│   │   ├── watch.tsx             # Watch Party + Médias
│   │   ├── store.tsx             # Module Store
│   │   └── profile.tsx           # Profil & Wallet
│   ├── imufeed/                  # ImuFeed (à créer)
│   │   ├── index.tsx             # Feed vertical plein écran
│   │   ├── create.tsx            # Création vidéo
│   │   ├── [id].tsx              # Détail vidéo
│   │   └── profile/[id].tsx      # Profil créateur
│   ├── chat/                     # Conversations
│   ├── call/                     # Appels
│   ├── stories/                  # Stories
│   ├── social/                   # Posts
│   ├── watch/                    # Lecteur vidéo
│   ├── music/                    # Musique
│   ├── podcasts/                 # Podcasts
│   ├── miniapp/                  # Mini-apps WebView
│   ├── wallet/                   # Wallet
│   ├── settings/                 # Paramètres
│   └── alice/                    # IA Assistant
│
├── components/                   # Composants réutilisables
│   ├── home/                     # Home Hub widgets (à créer)
│   ├── feed/                     # Feed social (à créer)
│   ├── imufeed/                  # ImuFeed vidéo (à créer)
│   ├── chat/                     # Chat (existant)
│   ├── miniapps/                 # MiniAppHostMobile (existant)
│   └── ui/                       # Composants UI génériques
│
├── services/                     # Services API
│   ├── social-feed.ts            # Feed posts (existant)
│   ├── stories-api.ts            # Stories (existant)
│   ├── video-player.ts           # Lecteur vidéo (existant)
│   ├── imufeed-api.ts            # API ImuFeed (à créer)
│   ├── home-config-api.ts        # Config Home personnalisable (à créer)
│   └── widget-data.ts            # Data provider pour widgets (à créer)
│
├── stores/                       # Zustand stores
│   ├── stories-store.ts          # (existant)
│   ├── modules-store.ts          # (existant)
│   ├── music-store.ts            # (existant)
│   ├── wallet-store.ts           # (existant)
│   ├── imufeed-store.ts          # (à créer)
│   └── home-config-store.ts      # (à créer)
│
├── types/                        # Types TypeScript
│   ├── watch.ts                  # (existant)
│   ├── music.ts                  # (existant)
│   ├── wallet.ts                 # (existant)
│   ├── imufeed.ts                # (à créer)
│   └── home.ts                   # (à créer)
│
└── providers/                    # Context providers
    ├── AuthProvider.tsx           # (existant)
    ├── ThemeProvider.tsx          # (existant)
    └── I18nProvider.tsx           # (existant)
```

---

## 13. Design System Mobile

### 13.1 Espacement et layout

Le design system utilise `useSpacing()` pour un espacement cohérent :

| Token | Valeur | Usage |
|-------|--------|-------|
| `xs` | 4px | Micro-espacements |
| `sm` | 8px | Padding interne cartes |
| `md` | 16px | Marges entre sections |
| `lg` | 24px | Padding écran |
| `xl` | 32px | Espacement entre blocs majeurs |

### 13.2 Typographie

| Style | Poids | Taille | Usage |
|-------|-------|--------|-------|
| Title | Bold | 24px | Titre d'écran |
| Heading | SemiBold | 20px | Titre de section |
| Subheading | SemiBold | 16px | Sous-titre |
| Body | Regular | 14px | Texte principal |
| Caption | Regular | 12px | Texte secondaire |
| Micro | Regular | 10px | Badges, compteurs |

### 13.3 Composants réutilisables (cible)

| Composant | Statut | Description |
|-----------|--------|-------------|
| `Avatar` | ✅ | Photo profil avec indicateur en ligne |
| `StyledText` | ✅ | Texte avec styles prédéfinis |
| `ThemedView` | ✅ | Conteneur avec couleur de fond thème |
| `OfflineBanner` | ✅ | Bannière offline |
| `FloatingActionButton` | ❌ À créer | Bouton flottant universel |
| `WidgetCard` | ❌ À créer | Conteneur de widget Home |
| `VideoFeedItem` | ❌ À créer | Item de feed vidéo ImuFeed |
| `SectionHeader` | ❌ À créer | En-tête de section avec "Voir tout" |

---

## 14. Transitions & Animations

### 14.1 Transitions entre écrans

| Transition | Type | Bibliothèque |
|------------|------|--------------|
| Tab switch | Fade cross-dissolve (300ms) | Expo Router |
| Push screen | Slide from right (250ms) | Expo Router |
| Modal | Slide from bottom (300ms) | Expo Router |
| ImuFeed → plein écran | Expand (200ms) | reanimated |
| Story viewer | Zoom from avatar (250ms) | reanimated |

### 14.2 Micro-animations

| Animation | Trigger | Durée |
|-----------|---------|-------|
| Like ❤️ | Tap | 400ms spring bounce |
| FAB open | Tap | 300ms spring + rotation |
| Widget reveal | Home scroll | 200ms fade-in staggered |
| Rang promotion | Event ranking | 1500ms confetti + glow |
| Pull to refresh | Gesture | Lottie animation |

---

## 15. Gestion Offline & Performance

### 15.1 Stratégie offline

| Donnée | Stockage offline | Sync |
|--------|-----------------|------|
| Messages | AsyncStorage queue | Supabase Realtime reconnect |
| Feed posts | Cache `social-feed-store` | Pull-to-refresh |
| Modules installés | `modules-store` persisted | Background sync |
| Stories vues | `stories-store` persisted | Sync au lancement |
| Home config | `home-config-store` persisted | Sync Supabase |
| Vidéos ImuFeed | Cache expo-av | Streaming uniquement |

### 15.2 Performance

| Optimisation | Technique |
|-------------|-----------|
| Liste virtuelle | `FlashList` (Shopify) pour les feeds |
| Préchargement images | `expo-image` avec cache |
| Préchargement vidéo | expo-av preload next item |
| Lazy loading modules | `React.lazy` + Suspense |
| Bundle splitting | Mini-apps chargées à la demande via WebView |
| Debounce recherche | 300ms avant requête |

---

## 16. Accessibilité & Inclusivité

| Feature | Implémentation |
|---------|---------------|
| VoiceOver / TalkBack | `accessibilityLabel` sur tous les boutons |
| Contraste | Ratio minimum 4.5:1 (WCAG AA) |
| Taille de texte | Respect du scaling système |
| Navigation clavier | Support Tab / Enter |
| Réduction de mouvement | `useReducedMotion()` → animations simplifiées |
| Daltonisme | Pas de couleur seule pour l'info (icônes + texte) |

---

## 17. Sécurité & Segmentation par Âge

### 17.1 Segmentation par âge

Le système de segmentation par âge (`min_age_tier` sur les modules) filtre automatiquement :

| Tier | Âge | Contenu visible | Restrictions |
|------|-----|----------------|-------------|
| Kids | 6-12 | Éducatif, jeux, stories filtrées | Pas de chat privé, pas de Wallet, pas de Dating |
| Teen | 13-17 | Social, chat, jeux, communautés | Pas de Dating, Wallet limité |
| Adult | 18+ | Tout | Accès complet |

### 17.2 Protection des données

- Authentification : Supabase Auth + 2FA optionnel
- Stockage local : `expo-secure-store` pour tokens
- Mini-apps : Sandbox WebView isolée, permissions explicites
- RLS Supabase : Row Level Security sur toutes les tables

---

## 18. Mapping Écrans Complet (~120+ écrans)

### 18.1 Par onglet

| Onglet | Écrans principaux | Sous-écrans | Total estimé |
|--------|------------------|-------------|:---:|
| Home | 1 | Recherche, Suggestions, Notifications | ~5 |
| Chats | 2 (liste + conversation) | Nouveau chat, Détails groupe, Bots, Appel | ~15 |
| Social | 3 (Feed, ImuFeed, Stories) | Créer post, Commentaires, Profil créateur, Trending, Hashtag | ~20 |
| Watch | 1 | Player, Watch Party, Podcasts, Musique, Playlists | ~12 |
| Store | 2 (Catalogue + Mes apps) | Détail module, Reviews, Mini-app WebView | ~8 |
| Profil | 1 | Wallet, Arena, Settings, Sécurité, Analytics, Aide | ~15 |
| Mini-apps | 23 (via WebView) | Écrans internes à chaque mini-app | ~40+ |
| Auth | 3 | Login, Register, Onboarding | ~5 |
| **Total** | | | **~120+** |

### 18.2 Flux utilisateur principal

```
Onboarding (3 écrans) → Login/Register
→ Home Hub (personnalisé)
  ├── Tap Chat → Liste conversations → Conversation → Appel
  ├── Tap Social → Feed / ImuFeed / Stories → Créer contenu
  ├── Tap Watch → Watch Party / Vidéos / Podcasts / Musique
  ├── Tap Store → Catalogue → Installer → Utiliser (miniapp/[id])
  ├── Tap Profil → Wallet / Settings / Arena / Analytics
  └── FAB → Créer message / post / story / vidéo / event
```

---

> **Ce document est la vision enrichie de la structure mobile ImuChat. Il sert de base pour les roadmaps de développement détaillées.**
