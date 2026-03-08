# 🗺️ ROADMAP — ImuFeed Vidéo (Feed Social Vidéo)

**Date de création :** 8 mars 2026  
**Document source :** `ImuFeed_VIDEO_v2.md`  
**Stack :** Expo SDK 52+ · expo-av / expo-video · Zustand · Supabase · S3 + CloudFront · HLS  
**État actuel :** ❌ ImuFeed n'existe pas encore — Watch tab = hub classique (expo-av), Social tab = feed texte/image

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| 1 | MVP — Feed Vertical & Upload | 4 | 8 semaines |
| 2 | Social & Découverte | 4 | 8 semaines |
| 3 | Éditeur Avancé & Filtres | 3 | 6 semaines |
| 4 | Créateurs & Monétisation | 3 | 6 semaines |
| 5 | Live Streaming | 3 | 6 semaines |
| 6 | IA, Modération & Scale | 3 | 6 semaines |
| 7 | Intégration Écosystème ImuChat | 4 | 8 semaines |
| **Total** | | **24 sprints** | **48 semaines** |

---

## Phase 1 — MVP Feed Vertical & Upload (Sprints 1-4)

### Sprint 1 · Infrastructure & Types

**Objectif :** Poser l'architecture ImuFeed (types, store, API, tables Supabase)

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **types/imufeed.ts** | Types `ImuFeedVideo`, `VideoStats`, `CreatorProfile`, `VideoComment`, `LiveStream`, `VideoCategory`, `FeedTab` | P0 |
| **stores/imufeed-store.ts** | Store Zustand (feed state, player state, actions, upload) avec persist AsyncStorage | P0 |
| **services/imufeed/feed-api.ts** | Service API — `fetchFeed(tab, page)`, `fetchVideoById(id)` → Supabase | P0 |
| **services/imufeed/interactions-api.ts** | `likeVideo()`, `saveVideo()`, `shareVideo()`, `reportVideo()` | P0 |
| **Supabase tables** | `imufeed_videos`, `imufeed_likes`, `imufeed_saves`, `imufeed_creators`, `imufeed_follows` + RLS policies | P0 |
| **Supabase indexes** | Index sur `creator_id`, `category`, `created_at`, `hashtags` (GIN) | P0 |

**Livrables Sprint 1 :**

- Architecture technique ImuFeed complète (types + store + API + DB)
- Tables Supabase avec RLS
- Prêt pour l'implémentation UI

### Sprint 2 · Feed Vertical Plein Écran

**Objectif :** Le cœur d'ImuFeed — scroll vertical fullscreen avec autoplay

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **app/imufeed/index.tsx** | Écran feed vertical — FlashList (Shopify) optimisé pour vidéo plein écran | P0 |
| **components/imufeed/VideoFeedItem.tsx** | Item plein écran : vidéo (expo-av), overlay infos (créateur, description, hashtags), barre de progression | P0 |
| **Autoplay** | Vidéo en cours d'affichage joue automatiquement, les autres sont en pause | P0 |
| **Audio** | Muet par défaut, tap active le son (UX TikTok) | P0 |
| **Swipe up/down** | Navigation entre vidéos, transition slide (200ms, reanimated) | P0 |
| **components/imufeed/VideoActions.tsx** | Panneau latéral droit : ❤️ Like, 💬 Comment, ➤ Share, ⭐ Save (avec compteurs) | P0 |
| **Double-tap like** | Double tap → animation cœur flottant (reanimated) | P1 |
| **Boucle** | La vidéo boucle automatiquement | P0 |

**Livrables Sprint 2 :**

- Feed vertical fonctionnel avec autoplay, swipe, boucle
- Actions de base (like, comment, share, save)
- 60 FPS constant (FlashList + optimisations)

### Sprint 3 · Upload Vidéo & Publication

**Objectif :** Permettre aux utilisateurs de créer et publier des vidéos

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **app/imufeed/create.tsx** | Écran création — prévisualisation caméra, choix durée (15s/30s/60s/3min), bouton record | P0 |
| **components/imufeed/CameraCapture.tsx** | Interface caméra (expo-camera) — flip, flash, timer, grille | P0 |
| **Import galerie** | Import depuis la galerie du téléphone (expo-image-picker) | P0 |
| **services/imufeed/video-upload.ts** | Upload S3 presigned URL — multipart chunked, progress tracking | P0 |
| **Compression locale** | Compression vidéo avant upload (ratio qualité/taille optimisé) | P0 |
| **components/imufeed/PublishSettings.tsx** | Paramètres : titre, description, hashtags, visibilité (public/abonnés/privé), commentaires on/off | P0 |
| **Thumbnail** | Sélection de thumbnail (3 options auto-générées) | P1 |
| **Upload progress** | Barre de progression upload dans le store + notification en background | P0 |

**Livrables Sprint 3 :**

- Capture caméra + import galerie
- Upload S3 fonctionnel avec progression
- Publication de vidéo dans le feed

### Sprint 4 · Éditeur Basique & Profil Créateur MVP

**Objectif :** Éditeur minimal + page profil créateur

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **app/imufeed/editor.tsx** | Éditeur basique — trim (découpe début/fin), volume vidéo/musique | P0 |
| **components/imufeed/VideoEditor.tsx** | Timeline visuelle pour le trim, preview temps réel | P0 |
| **app/imufeed/profile/[id].tsx** | Profil créateur — bio, compteurs (vidéos, abonnés, likes), grille vidéos 3 colonnes | P0 |
| **components/imufeed/CreatorProfile.tsx** | Composant profil réutilisable — avatar, nom, bio, stats, bouton suivre/message | P0 |
| **Follow/Unfollow** | Système de follow (table `imufeed_follows`) | P0 |
| **Onglet "Abonnements"** | Feed filtré aux créateurs suivis uniquement | P0 |
| **Swipe gauche → profil** | Depuis une vidéo, swipe gauche ouvre le profil du créateur | P1 |
| **Tests Phase 1** | Tests : imufeed-store, feed-api, interactions-api, VideoFeedItem, upload | P0 |

**Livrables Sprint 4 :**

- Éditeur basique (trim + volume)
- Profil créateur avec follow/unfollow
- Feed "Abonnements" fonctionnel
- ✅ **MVP ImuFeed fonctionnel** : feed + upload + edit + profil + like/comment/share

---

## Phase 2 — Social & Découverte (Sprints 5-8)

### Sprint 5 · Commentaires Hiérarchisés

**Objectif :** Système de commentaires complet

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Supabase table** | `imufeed_comments` (avec parent_id pour hiérarchie, pinned, likes_count) | P0 |
| **services/imufeed/comments-api.ts** | CRUD commentaires — create, delete, like, pin, fetch (paginé, trié top/récents) | P0 |
| **components/imufeed/CommentSheet.tsx** | Bottom sheet commentaires — FlashList, hiérarchie (réponses indentées), compteur | P0 |
| **Épingler commentaire** | Le créateur peut épingler 1 commentaire en haut | P1 |
| **Tri** | Top (likes) / Récents (date) | P0 |
| **Signalement** | Bouton signaler un commentaire | P1 |

**Livrables Sprint 5 :**

- Commentaires hiérarchisés avec réponses, tri, épinglage

### Sprint 6 · Hashtags & Recherche

**Objectif :** Système de hashtags et recherche vidéo

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Supabase table** | `imufeed_hashtags` (tag, usage_count, trending_score) | P0 |
| **services/imufeed/hashtag-api.ts** | Trending hashtags, recherche par hashtag, follow hashtag | P0 |
| **app/imufeed/hashtag/[tag].tsx** | Page hashtag — header avec compteur, grille vidéos filtrées | P0 |
| **app/imufeed/search.tsx** | Recherche full-text sur titre, description, hashtags, créateurs | P0 |
| **components/imufeed/TrendingHashtags.tsx** | Composant horizontal scrollable des trending tags | P0 |
| **Hashtag parsing** | Parser les `#hashtag` dans la description et les rendre cliquables | P1 |
| **Autocomplete hashtags** | Lors de la saisie de la description, autocompléter les hashtags existants | P2 |

**Livrables Sprint 6 :**

- Pages hashtags avec vidéos filtrées
- Recherche full-text fonctionnelle
- Trending hashtags

### Sprint 7 · Algorithme "Pour Toi"

**Objectif :** Remplacer le feed chronologique par un algorithme de recommandation

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Supabase table** | `imufeed_views` (video_id, user_id, watch_time, completed, source) | P0 |
| **Analytics tracking** | Tracker le temps de visionnage, complétion, swipe rapide, re-watch | P0 |
| **Scoring vidéo** | Calculer un engagement score par vidéo (vues × complétion × likes × comments) | P0 |
| **Profil intérêts** | `user_interests` — catégories et hashtags pondérés par engagement | P1 |
| **Recall** | Phase 1 algo : sélectionner 100 candidats (abonnements 40% + similaire 30% + trending 30%) | P0 |
| **Ranking** | Phase 2 algo : scorer et trier les candidats par pertinence | P0 |
| **Dédup** | Pas 2 vidéos du même créateur consécutives | P1 |
| **"Pas intéressé"** | Long press → "Pas intéressé" — signal négatif | P1 |

**Livrables Sprint 7 :**

- Algorithme "Pour Toi" fonctionnel avec personnalisation
- Tracking comportemental
- Feed pertinent et diversifié

### Sprint 8 · Explore & Trending Page

**Objectif :** Page Explore complète pour la découverte

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Algorithme Trending** | Score trending = (usage_24h × 2) + (unique_creators × 5) + (views × 0.001) + (accélération × 10) | P0 |
| **Page Explore** | Trending hashtags + Top créateurs semaine + Top vidéos + Challenges actifs | P0 |
| **Top créateurs** | Classement hebdomadaire par likes reçus | P1 |
| **Catégories** | Page par catégorie (Gaming, Anime, Tech, Cuisine, etc.) avec feed filtré | P0 |
| **Mode grille** | Vue grille 3 colonnes alternative au feed vertical (type Instagram Explore) | P1 |
| **Tests Phase 2** | Tests algo recommandation, commentaires, hashtags, recherche | P0 |

**Livrables Sprint 8 :**

- Page Explore complète
- Algorithme trending
- Mode grille

---

## Phase 3 — Éditeur Avancé & Filtres (Sprints 9-11)

### Sprint 9 · Musique & Son

**Objectif :** Bibliothèque musicale intégrée à l'éditeur

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Supabase table** | `imufeed_music` (title, artist, audio_url, duration, usage_count) | P0 |
| **components/imufeed/MusicSelector.tsx** | Sélecteur de musique — recherche, preview, catégories (trending, genres) | P0 |
| **Superposition audio** | Mixage vidéo audio + musique avec réglage volume séparé | P0 |
| **Son original** | La musique d'une vidéo peut être réutilisée par d'autres (type TikTok) | P1 |
| **Page son** | Tap sur "🎵 Son original" → page avec toutes les vidéos utilisant ce son | P1 |
| **Voix-off** | Enregistrement voix superposée à la vidéo | P2 |

**Livrables Sprint 9 :**

- Bibliothèque musicale intégrée
- Mixage audio fonctionnel
- Sons réutilisables

### Sprint 10 · Filtres, Stickers & Effets

**Objectif :** Enrichir l'éditeur vidéo avec des effets visuels

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **components/imufeed/FilterSelector.tsx** | 20+ filtres (dont 6 manga/anime IA) — preview temps réel | P0 |
| **Filtres classiques** | Vintage, B&W, Warm, Cool, Vivid, Moody, Fade, etc. | P0 |
| **Filtres manga/anime** | Anime Classic, Manga Ink, Chibi, Neon City, Watercolor, Comic Pop — via TFLite/CoreML | P1 |
| **components/imufeed/StickerOverlay.tsx** | Stickers drag & drop sur la vidéo — pack ImuChat officiel + packs communauté | P1 |
| **Texte animé** | 15+ styles de texte animé positionnable sur la vidéo | P1 |
| **Speed** | Ralenti (0.5x, 0.25x) et accéléré (1.5x, 2x, 3x) | P1 |
| **Transitions multi-clip** | Entre clips : fade, swipe, zoom (10+ transitions) | P2 |

**Livrables Sprint 10 :**

- 20+ filtres dont 6 manga/anime
- Stickers et texte animé
- Speed control et transitions

### Sprint 11 · Remix, Duo & Effets Avancés

**Objectif :** Co-création vidéo et effets avancés

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Duo** | Split-screen vertical 50/50 — filmer à côté de la vidéo source | P1 |
| **Remix** | Plein écran avec vidéo source en vignette + audio source | P1 |
| **Green screen** | Vidéo source en fond — filmer devant | P2 |
| **Flou arrière-plan** | Détection personne IA + flou background | P2 |
| **Stabilisation post** | Post-stabilisation de la vidéo | P2 |
| **Correction lumière** | Auto-adjust luminosité et contraste | P2 |
| **Tests Phase 3** | Tests éditeur, filtres, musique, remix | P0 |

**Livrables Sprint 11 :**

- Duo / Remix / Green screen fonctionnels
- Effets avancés (flou, stabilisation, correction lumière)

---

## Phase 4 — Créateurs & Monétisation (Sprints 12-14)

### Sprint 12 · Gamification ImuFeed

**Objectif :** XP, niveaux, badges, défis quotidiens

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **XP system** | Calcul XP : publier (+50), like reçu (+2), commentaire reçu (+5), 1K vues (+100), 10K vues (+500), défi (+200) | P0 |
| **Niveaux** | 6 tiers : Bronze (1-10) → Argent (11-20) → Or (21-30) → Platine (31-40) → Diamant (41-50) → Légende (51+) | P0 |
| **Badges** | 8+ badges : First Video, Viral, DJ, Storyteller, Collaborator, Broadcaster, Arena Champion, Creator King | P1 |
| **Défis quotidiens** | 5 défis quotidiens + bonus combo (publier, liker, commenter, regarder, partager) | P1 |
| **Classements** | Top créateur semaine, top vidéo jour, top live | P1 |
| **Animations** | Animation de level-up (confetti + glow), badge unlock (sparkle) | P1 |
| **UI rang dans profil** | Affichage niveau, XP, barre de progression, badges dans profil créateur | P0 |

**Livrables Sprint 12 :**

- Système XP/niveaux/badges complet
- Défis quotidiens fonctionnels
- Classements

### Sprint 13 · Dashboard Créateur & Analytics

**Objectif :** Analytics pour les créateurs

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **app/imufeed/analytics.tsx** | Dashboard créateur — vues, abonnés, engagement, revenus | P0 |
| **Métriques vidéo** | Par vidéo : vues, watch moyen, complétion %, engagement rate, sources de trafic | P0 |
| **Graphiques** | Graphiques d'engagement sur 7/30/90 jours (react-native-chart-kit ou victory-native) | P1 |
| **Top vidéo** | Identificer la top vidéo avec détails | P1 |
| **Heures optimales** | Heatmap des meilleures heures pour publier | P2 |
| **Audience** | Répartition géo, âge, genre | P2 |

**Livrables Sprint 13 :**

- Dashboard créateur avec métriques complètes
- Graphiques visuels
- Recommandations de publication

### Sprint 14 · Monétisation Créateur

**Objectif :** Système économique pour les créateurs

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Pourboires** | Bouton "💰 Soutenir" sur profil créateur → envoi ImuCoins (intégration `wallet-store`) | P0 |
| **Animation donation** | Animation spéciale quand un pourboire est envoyé (ImuCoins qui flottent) | P1 |
| **Abonnement premium** | Système d'abonnement créateur ($2.99-$14.99/mois) — contenu exclusif | P2 |
| **Vidéo réservée** | Vidéos visibles uniquement par les abonnés premium | P2 |
| **Revenus dashboard** | Section revenus dans le dashboard créateur (IC gagnés, historique) | P1 |
| **Tests Phase 4** | Tests gamification, analytics, monétisation | P0 |

**Livrables Sprint 14 :**

- Pourboires ImuCoins fonctionnels
- Abonnement premium créateur
- Dashboard revenus

---

## Phase 5 — Live Streaming (Sprints 15-17)

### Sprint 15 · Infrastructure Live

**Objectif :** Backend et architecture pour le live streaming

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Supabase tables** | `imufeed_lives` (host_id, title, category, stream_url, viewer_count, etc.) | P0 |
| **services/imufeed/live-api.ts** | Créer/terminer live, rejoindre, envoyer réaction, don live | P0 |
| **Stream Video SDK** | Configuration du SDK existant (Stream) pour le live (WebRTC) | P0 |
| **Supabase channels** | Channel Realtime par live pour le chat et les réactions | P0 |
| **Enregistrement** | Recording server-side pour replay automatique | P1 |

**Livrables Sprint 15 :**

- Infrastructure live prête (WebRTC + Realtime + DB)
- API complète pour le live

### Sprint 16 · Live — UI Streamer & Viewer

**Objectif :** Interfaces de diffusion et de visionnage live

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **app/imufeed/live/create.tsx** | Écran "Lancer un live" — titre, catégorie, options (dons, replay, 18+), preview caméra | P0 |
| **app/imufeed/live/[id].tsx** | Viewer live — flux vidéo + chat overlay + réactions flottantes + compteur viewers | P0 |
| **components/imufeed/LiveChat.tsx** | Chat overlay transparent sur le flux live — scroll auto, animation messages | P0 |
| **Réactions flottantes** | Tap sur ❤️ → emojis qui flottent vers le haut (reanimated) | P1 |
| **components/imufeed/LiveDonation.tsx** | Animation spéciale pour les donations (ImuCoins explosion) | P1 |
| **Notification live** | Push notification aux abonnés quand un créateur lance un live | P0 |

**Livrables Sprint 16 :**

- Interface streamer complète
- Viewer live avec chat et réactions
- Notifications push aux abonnés

### Sprint 17 · Live — Co-host & Replay

**Objectif :** Fonctionnalités live avancées

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Co-host** | Inviter 1-3 personnes en split-screen pendant le live | P2 |
| **Modérateurs** | Assigner des modérateurs au live (ban/mute viewers) | P1 |
| **Sondages live** | Créer un sondage interactif pendant le live | P2 |
| **Screen share** | Partage d'écran pour gaming / démo | P3 |
| **Replay auto** | Publication automatique du replay dans le feed après fin du live | P1 |
| **app/imufeed/live/replays.tsx** | Page replays d'un créateur | P1 |
| **Tests Phase 5** | Tests live streaming, chat, réactions, replay | P0 |

**Livrables Sprint 17 :**

- Co-host live
- Modération live
- Replay automatique

---

## Phase 6 — IA, Modération & Scale (Sprints 18-20)

### Sprint 18 · Modération IA

**Objectif :** Pipeline de modération automatique

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **services/imufeed/moderation-api.ts** | API modération — signalement, review, actions (warn, restrict, shadowban, suspend, ban) | P0 |
| **Modération pré-publication** | Supabase Edge Function — classification NSFW, violence, texte haineux | P0 |
| **Score de confiance** | > 0.95 → blocage auto, 0.7-0.95 → review humaine, < 0.7 → OK | P0 |
| **Signalements** | UI signalement (raisons prédéfinies) + 3 signalements → review automatique | P0 |
| **Admin modération** | Dashboard admin pour la file d'attente de modération | P1 |
| **Outils créateur** | Filtre mots-clés commentaires, bloquer utilisateur, mode "abonnés only" commentaires | P1 |

**Livrables Sprint 18 :**

- Pipeline modération IA fonctionnel
- Signalement et review
- Outils créateur de modération

### Sprint 19 · IA Recommandation Avancée

**Objectif :** Améliorer l'algorithme avec de l'IA avancée

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Re-ranking** | Phase 3 algo : règles métier (dédup, boost ImuChat, safety filter) | P0 |
| **Diversité** | Anti-bulle : injecter 10-15% de contenu hors des intérêts habituels | P1 |
| **Cold start** | Nouvel utilisateur : feed basé sur catégories populaires + onboarding intérêts | P0 |
| **Feedback loop** | Exploiter les signaux négatifs ("Pas intéressé", swipe rapide) pour ajuster | P1 |
| **Alice — Résumé vidéo** | Alice résume une vidéo longue en texte dans le chat | P2 |
| **Alice — Recherche** | "Trouve-moi des vidéos de cuisine japonaise" → résultats via Alice | P3 |

**Livrables Sprint 19 :**

- Algorithme avancé avec diversité et cold start
- Alice résumé et recherche vidéo

### Sprint 20 · Scalabilité & Performance

**Objectif :** Optimiser pour la croissance

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **services/imufeed/preloader.ts** | Préchargement N+1 (segment HLS) + N+2 (metadata) intelligemment | P0 |
| **Cache HLS** | Cache local des segments HLS déjà visionnés | P1 |
| **Adaptive bitrate** | Auto-switch 360p/720p/1080p selon connexion | P0 |
| **Mode données faibles** | Setting : 360p par défaut, pas de préchargement auto | P1 |
| **CDN multi-region** | Configuration CloudFront / Bunny pour multi-région | P1 |
| **PiP (Picture-in-Picture)** | Continuer la vidéo en PiP quand on quitte ImuFeed | P2 |
| **Tests Phase 6** | Tests modération, algo, preloader, adaptive bitrate | P0 |

**Livrables Sprint 20 :**

- Préchargement intelligent
- Streaming adaptatif
- Mode données faibles
- PiP fonctionnel

---

## Phase 7 — Intégration Écosystème ImuChat (Sprints 21-24)

### Sprint 21 · Partage DM & Chat

**Objectif :** Intégration vidéo dans la messagerie ImuChat

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **VideoCard dans chat** | `components/imufeed/VideoCard.tsx` — card vidéo dans une conversation (thumbnail, titre, compteurs, "Voir sur ImuFeed") | P0 |
| **Partage en DM** | Tap ➤ → sélectionner conversation → envoi VideoCard | P0 |
| **Partage en groupe** | Partager dans un groupe ou une guilde | P0 |
| **Réponse vidéo dans chat** | Répondre à un message par une vidéo ImuFeed courte (8s) | P2 |
| **Preview inline** | Preview jouable inline dans le chat (sans quitter la conversation) | P1 |

**Livrables Sprint 21 :**

- Partage vidéo dans le chat ImuChat (DM + groupes)
- Preview inline jouable

### Sprint 22 · Watch Party & Social Cross-Post

**Objectif :** Visionnage synchronisé et intégration Social

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Watch Party ImuFeed** | Regarder des vidéos ImuFeed ensemble — lecture synchronisée | P1 |
| **Invitation Watch Party** | Inviter des amis depuis un groupe ImuChat | P1 |
| **File d'attente co** | File d'attente collaborative de vidéos dans la Watch Party | P2 |
| **Cross-post communauté** | Publier une vidéo ImuFeed dans une guilde/communauté | P1 |
| **Vidéo → Thread** | Transformer les commentaires d'une vidéo en thread de discussion | P2 |
| **Story republish** | Republier une vidéo ImuFeed en Story | P1 |

**Livrables Sprint 22 :**

- Watch Party ImuFeed
- Cross-post communautés et guildes
- Republish en Story

### Sprint 23 · Intégrations Home, Store, Arena

**Objectif :** ImuFeed connecté au reste de l'écosystème

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Widget Home trending** | Widget "Trending ImuFeed" pour le Home Hub | P1 |
| **Profil user vidéos** | Section vidéos dans le profil utilisateur principal (onglet Profil) | P0 |
| **Arena vidéo** | Challenges vidéo dans Arena (concours avec classement) | P2 |
| **Store filtres premium** | Vente de filtres et effets premium via le Store | P2 |
| **Store analytics pro** | Module analytics avancé pour créateurs pro via Store | P3 |
| **Notifications ImuFeed** | Notifications : nouveau contenu abonnement, likes bulk, mention, challenge | P0 |

**Livrables Sprint 23 :**

- ImuFeed intégré au Home, Profil, Store, Arena
- Notifications complètes

### Sprint 24 · Contrôle Parental, Challenges & Tests Finaux

**Objectif :** Sécurité jeunesse, système de challenges, et validation finale

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Segmentation par âge** | Respecter `min_age_tier` — Kids : feed filtré, pas de live, commentaires off. Teen : pas de 18+, live spectateur only | P0 |
| **Contrôle parental** | Temps d'écran ImuFeed, catégories autorisées, upload on/off, rapport parent | P1 |
| **Challenges / Défis** | Page dédiée : challenges officiels + communautaires, timer, leaderboard, récompenses | P1 |
| **Challenges sponsorisés** | Infrastructure pour challenges sponsorisés (monétisation plateforme) | P3 |
| **Sous-titres auto** | Speech-to-text multilingue + affichage sous-titres | P2 |
| **Tests finaux** | Regression tests e2e sur toutes les phases, performance audit, accessibilité | P0 |

**Livrables Sprint 24 :**

- Segmentation par âge et contrôle parental
- Système de challenges
- ✅ **ImuFeed complet et intégré dans l'écosystème ImuChat**

---

## Dépendances & Risques

### Dépendances critiques

| Dépendance | Source | Cible | Type |
|------------|--------|-------|------|
| types/imufeed.ts | Phase 1 Sprint 1 | Toutes les phases | Bloquant |
| Supabase tables | Phase 1 Sprint 1 | Tout le backend | Bloquant |
| expo-av / expo-video | Existant (Phase M4 ✅) | Feed vertical | Prêt |
| S3 + presigned URLs | À configurer | Sprint 3 (upload) | Bloquant |
| Stream Video SDK | Existant (CRIT-001 ✅) | Phase 5 (live) | Prêt |
| wallet-store | Existant ✅ | Phase 4 (monétisation) | Prêt |
| Home Hub widgets | Roadmap Navigation Phase 3 | Sprint 23 (widget trending) | Fort |
| Sous-onglets Social | Roadmap Navigation Phase 5 Sprint 11 | Sprint 2 (placement ImuFeed) | Fort |

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|:-----------:|:------:|------------|
| Performance feed vidéo 60 FPS | Élevé | Critique | FlashList + preload + lazy unmount hors viewport |
| Coûts stockage S3/CDN | Moyen | Élevé | Compression agressive + adaptive bitrate + quotas upload |
| Modération contenu IA | Élevé | Critique | Pipeline modération dès le MVP, review humaine en backup |
| Complexité éditeur vidéo | Élevé | Moyen | MVP minimal (trim + volume), enrichir progressivement |
| Filtres IA manga perf mobile | Moyen | Moyen | Processing côté serveur si trop lourd en local, TFLite pour les simples |
| Live streaming scalabilité | Moyen | Élevé | Appui sur Stream SDK (infrastructure prouvée) |
| Copyright audio | Élevé | Élevé | Bibliothèque libre de droits + détection fingerprint basique |

---

## Équipe recommandée

| Rôle | Nombre | Focus |
|------|:------:|-------|
| Développeur RN Senior | 2 | Feed + éditeur + live |
| Développeur RN Mid | 1 | Profil + commentaires + social |
| Développeur Backend | 1 | Supabase + S3 + transcodage + modération IA |
| Designer UI/UX | 1 | Wireframes + design system + animations |
| QA / Testeur | 1 | Tests manuels + e2e + performance |

---

## KPIs de succès

| KPI | Phase concernée | Cible |
|-----|----------------|-------|
| Feed scroll 60 FPS | Phase 1 | ≥ 58 FPS constant |
| Temps upload vidéo 30s | Phase 1 | < 10s (4G) |
| Temps chargement 1ère vidéo | Phase 1 | < 1.5s |
| DAU ImuFeed / DAU total | Phase 2+ | ≥ 40% |
| Temps passé / session | Phase 2+ | ≥ 8 min |
| Vidéos publiées / jour | Phase 1+ | ↗ mois après mois |
| Completion rate moyen | Phase 2+ | ≥ 45% |
| Contenu modéré false positive | Phase 6 | < 5% |
| Tests coverage | Toutes | ≥ 80% |
| Crash-free rate | Toutes | > 99.5% |
