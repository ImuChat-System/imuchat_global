# 🎬 ImuFeed — Module Feed Social Vidéo — Document Enrichi v2

**Date de création :** 8 mars 2026  
**Version :** 2.0 (enrichie)  
**Source :** `ImuFeed_VIDEO.md`  
**Stack cible :** Expo SDK 52+ · expo-av / expo-video · Zustand · Supabase · S3 + CloudFront CDN · HLS  
**Positionnement :** Module natif intégré par défaut dans l'onglet Social (sous-onglet "ImuFeed 🎬")

---

## Table des matières

1. [Positionnement Stratégique & ADN](#1-positionnement-stratégique--adn)
2. [Architecture Produit & Décision d'Intégration](#2-architecture-produit--décision-dintégration)
3. [Navigation & Structure des Écrans](#3-navigation--structure-des-écrans)
4. [Feed Vertical — Expérience de Visionnage](#4-feed-vertical--expérience-de-visionnage)
5. [Création & Upload Vidéo](#5-création--upload-vidéo)
6. [Éditeur Vidéo Intégré](#6-éditeur-vidéo-intégré)
7. [Interactions Sociales sur Vidéo](#7-interactions-sociales-sur-vidéo)
8. [Profil Créateur & Économie](#8-profil-créateur--économie)
9. [Live Streaming](#9-live-streaming)
10. [Intelligence Artificielle & Recommandation](#10-intelligence-artificielle--recommandation)
11. [Modération IA & Sécurité Contenu](#11-modération-ia--sécurité-contenu)
12. [Hashtags, Trending & Découverte](#12-hashtags-trending--découverte)
13. [Gamification & Récompenses](#13-gamification--récompenses)
14. [Analytics & Statistiques](#14-analytics--statistiques)
15. [Stockage, Infrastructure & Performance](#15-stockage-infrastructure--performance)
16. [Contrôle Parental & Segmentation par Âge](#16-contrôle-parental--segmentation-par-âge)
17. [Intégration avec l'Écosystème ImuChat](#17-intégration-avec-lécosystème-imuchat)
18. [Architecture Technique Détaillée](#18-architecture-technique-détaillée)
19. [Schéma Base de Données (Supabase)](#19-schéma-base-de-données-supabase)
20. [Plan MVP & au-delà](#20-plan-mvp--au-delà)

---

## 1. Positionnement Stratégique & ADN

### 1.1 Pourquoi ImuFeed ?

ImuFeed est le **moteur d'acquisition et d'engagement** d'ImuChat. Dans l'écosystème des super-apps, le contenu vidéo court est le format qui :

| Objectif | Impact mesuré (benchmarks industrie) |
|----------|--------------------------------------|
| Acquisition | TikTok : 60% de la croissance vient du feed For You |
| Temps passé | Reels : +30% temps passé sur Instagram |
| Viralité | Coefficient viral 3-5x supérieur au texte/image |
| Monétisation | CPM vidéo 2-4x supérieur au display |
| Communauté | 70% des créateurs TikTok partagent en DM |

### 1.2 Différenciation ImuChat vs TikTok/Reels/Shorts

| Aspect | TikTok / Reels | ImuFeed (ImuChat) |
|--------|---------------|-------------------|
| Contexte social | Feed isolé | Intégré dans un écosystème chat + communautés |
| Partage | Lien externe | DM natif, Watch Party synchronisée, intégration guildes |
| Économie | Peu transparent | ImuCoins transparents, pourboires directs créateur |
| Gamification | Basique (vues) | XP, niveaux, badges, classements (ADN manga/anime) |
| Mini-apps | ❌ | Modules dans les vidéos (sondages, quiz, vente) |
| IA Chat | ❌ | Alice résume les vidéos, suggestions contextuelles |
| Modération | Opaque | Transparente, filtre parental, segmentation par âge |
| Communautés | ❌ | Vidéos partagées dans guildes, événements, concours Arena |

### 1.3 ADN visuel — Univers Manga/Anime

L'identité visuelle d'ImuFeed s'appuie sur l'ADN ImuChat :

- **Filtres IA style anime** : transformation selfie en avatar manga
- **Stickers animés** : pack ImuChat officiel (mascotte, émotes)
- **Thèmes** : le feed respecte les 6 thèmes (Light/Dark/Kawaii/Pro/Neon/Ocean)
- **Badges** : design inspiré RPG (bronze/argent/or/platine/diamant)
- **Transitions** : animations fluides style anime (sparkles, speed lines)

---

## 2. Architecture Produit & Décision d'Intégration

### 2.1 Options envisagées

| Option | Description | Verdict |
|--------|-------------|---------|
| A — Mini-app Store | Installable via WebView | ❌ Trop lent pour la vidéo, pas d'accès caméra natif |
| B — Onglet Social intégré | Sous-onglet dans Social | ✅ **RETENU** — meilleure découvrabilité |
| C — Onglet dédié | 7e onglet "ImuFeed" | ❌ Surcharge la tab bar (6 max) |

### 2.2 Architecture choisie

ImuFeed est un **module natif intégré** :

```
Onglet Social
├── [Feed] — Posts texte/image (existant ✅)
├── [ImuFeed 🎬] — Feed vidéo vertical (À CRÉER 🔴)
└── [Stories] — Stories éphémères (existant ✅)
```

**Extensibilité via Store** : les fonctionnalités premium (filtres Pro, analytics avancés, monétisation créateur Pro) sont débloquables via le Store.

### 2.3 Composants to create

| Composant | Type | Chemin prévu |
|-----------|------|-------------|
| Feed vertical | Écran | `app/imufeed/index.tsx` |
| Création vidéo | Écran | `app/imufeed/create.tsx` |
| Détail vidéo | Écran | `app/imufeed/[id].tsx` |
| Profil créateur | Écran | `app/imufeed/profile/[id].tsx` |
| Live streaming | Écran | `app/imufeed/live/index.tsx` |
| Store ImuFeed | Zustand | `stores/imufeed-store.ts` |
| Types | TypeScript | `types/imufeed.ts` |
| Service API | Service | `services/imufeed-api.ts` |
| Composants UI | Components | `components/imufeed/*.tsx` |

---

## 3. Navigation & Structure des Écrans

### 3.1 Arbre de navigation complet

```
Social (onglet)
└── ImuFeed (sous-onglet)
    │
    ├── Feed Principal (scroll vertical fullscreen)
    │   ├── "Pour toi" (algorithme IA)
    │   ├── "Abonnements" (créateurs suivis)
    │   └── "Trending" (tendances)
    │
    ├── Recherche & Découverte
    │   ├── Barre de recherche
    │   ├── Page hashtag/#[tag]
    │   ├── Page catégorie (Gaming, Foi, Éducation, Anime, Tech, Musique...)
    │   ├── Top créateurs
    │   └── Top vidéos de la semaine
    │
    ├── Création vidéo
    │   ├── Capture caméra
    │   ├── Import galerie
    │   ├── Mode multi-clip
    │   ├── Éditeur intégré
    │   └── Paramètres de publication
    │
    ├── Lecteur vidéo détaillé
    │   ├── Commentaires (hiérarchisés)
    │   ├── Réponse vidéo
    │   └── Actions (like, share, save, remix, playlist)
    │
    ├── Profil créateur
    │   ├── Bio & stats
    │   ├── Grille vidéos
    │   ├── Playlists
    │   ├── Lives passés (replays)
    │   └── Soutenir (pourboires, abonnement)
    │
    └── Live Streaming
        ├── Lancer un live
        ├── Viewer live (chat + réactions + dons)
        ├── Co-host (split-screen)
        └── Replay automatique
```

### 3.2 Modes d'affichage

| Mode | Description | Plateforme | Priorité |
|------|-------------|------------|----------|
| Scroll vertical | Plein écran, swipe up/down — type TikTok | Mobile | P0 (MVP) |
| Mode grille | Grille 3 colonnes — type Instagram Explore | Mobile + Web | P1 |
| Mode TV | Lecteur horizontal, navigation télécommande | Desktop + Web | P2 |
| Mode VR | 360° immersif | Futur (OtakuSync) | P4 |

---

## 4. Feed Vertical — Expérience de Visionnage

### 4.1 Wireframe feed principal

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│           V I D É O   P L E I N             │
│               É C R A N                     │
│                                             │
│          (autoplay, boucle, muet            │
│           jusqu'au premier tap)             │
│                                             │
│                                             │
│                                             │
│                                             │
│                            ┌───┐            │
│                            │ ◯ │  Avatar    │
│                            ├───┤            │
│  ◯ @nathan                 │ ❤️ │ 24.3K     │
│  Suivre +                  ├───┤            │
│                            │ 💬 │ 1,234     │
│  Building the future       ├───┤            │
│  of super-apps ✨           │ 🔁 │ 890      │
│  #imuchat #startup         ├───┤            │
│                            │ ⭐ │ Save      │
│  🎵 Son original — Nathan  ├───┤            │
│  ▓▓▓▓▓▓▓░░░░░ barre prog. │ ➤  │ Share     │
│                            └───┘            │
├─────────────────────────────────────────────┤
│  [ Pour toi ] [ Abonnements ] [ Trending ] │
└─────────────────────────────────────────────┘
```

### 4.2 Comportement du feed

| Geste | Action | Détail |
|-------|--------|--------|
| Swipe up | Vidéo suivante | Transition slide-up (200ms) |
| Swipe down | Vidéo précédente | Transition slide-down (200ms) |
| Tap | Play/Pause | Toggle + icône ▶️ au centre |
| Double tap droit | Like | Animation cœur flottant |
| Double tap gauche | Ajouter aux favoris | Animation étoile |
| Long press | Menu rapide | Signaler / Pas intéressé / Copier lien |
| Swipe gauche | Profil créateur | Push screen, slide from right |
| Swipe droite | Retour au feed social | Navigation tab |
| Pinch | Zoom (si vidéo > 1080p) | Zoom natif expo-av |

### 4.3 Autoplay et gestion audio

| État | Vidéo | Audio | Raison |
|------|-------|-------|--------|
| Premier lancement | ▶ Autoplay | 🔇 Muet | UX non-intrusive (comme TikTok v1) |
| Tap sur vidéo | ▶ Continue | 🔊 Son ON | Confirmation utilisateur |
| Quitte le feed | ⏸ Pause | 🔇 Muet | Performance |
| Background | ⏸ Pause | 🔇 Muet | Battery save |
| PiP (si activé) | ▶ Continue | 🔊 Son ON | Multitâche |

### 4.4 Préchargement intelligent

```
Position actuelle : Vidéo N
├── Vidéo N+1 : préchargée (1er segment HLS)
├── Vidéo N+2 : metadata chargée (thumbnail, titre, durée)
├── Vidéo N-1 : en cache (déjà vue)
└── Vidéos N+3... : pas chargées
```

Le service de preload (`imufeed-preloader.ts`) gère un buffer de 3 vidéos pour garantir un swipe fluide même en 3G.

---

## 5. Création & Upload Vidéo

### 5.1 Écran de création

```
┌─────────────────────────────────────────────┐
│  ✕ Créer                          Suivant → │
├─────────────────────────────────────────────┤
│                                             │
│           ┌──────────────────┐              │
│           │                  │              │
│           │   PRÉVISUALISATION              │
│           │   CAMÉRA                        │
│           │                  │              │
│           │                  │              │
│           └──────────────────┘              │
│                                             │
│  ⏱ 15s  30s  60s  3min  10min              │
│                                             │
│  ┌────────────────────────────────────┐     │
│  │ 🎵 Sons │ ⚡ Effets │ 🎨 Filtres │     │
│  └────────────────────────────────────┘     │
│                                             │
│  [🔄 Flip] [⏱ Timer] [⚡ Flash]             │
│  [📐 Grille] [🎭 Beauté] [🎬 Multi-clip]   │
│                                             │
│           ⬤  (bouton record)               │
│                                             │
│  [Galerie ↗]     [Mains libres]            │
└─────────────────────────────────────────────┘
```

### 5.2 Modes de capture

| Mode | Description | Durée max |
|------|-------------|-----------|
| Standard | Appui long pour filmer | 15s / 30s / 60s / 3min |
| Mains libres | Timer 3s puis auto-record | 60s max |
| Multi-clip | Segments filmés séparément, assemblés | 3min total |
| Import galerie | Vidéo existante du téléphone | 10min max |
| Live | Diffusion en direct | Illimité |

### 5.3 Contraintes techniques de capture

| Paramètre | Valeur | Raison |
|-----------|--------|--------|
| Résolution max | 1080p (1920x1080) | Optimal CDN / stockage |
| FPS | 30fps (60fps en option) | Balance qualité/taille |
| Format natif | MP4 (H.264) | Compatibilité universelle |
| Taille max upload | 500 MB | Protection infrastructure |
| Ratio | 9:16 (vertical) | Natif mobile |
| Codage audio | AAC 128kbps | Standard audio mobile |

### 5.4 Pipeline d'upload

```
Création (caméra/galerie)
  → Éditeur vidéo (section 6)
  → Paramètres publication
  → Compression locale (FFmpeg via expo-av)
  → Upload S3 (presigned URL, chunked)
  → Notification backend (Supabase edge function)
  → Transcodage serveur (720p + 1080p + thumbnail)
  → CDN distribution (CloudFront / Bunny)
  → Publication dans le feed
  → Notification aux abonnés
```

---

## 6. Éditeur Vidéo Intégré

### 6.1 Fonctionnalités de l'éditeur

| Catégorie | Fonctionnalité | Description | Priorité |
|-----------|---------------|-------------|----------|
| **Découpage** | Trim | Couper début/fin | P0 (MVP) |
| **Découpage** | Split | Couper au milieu | P1 |
| **Audio** | Ajout musique | Bibliothèque ImuChat + import | P0 (MVP) |
| **Audio** | Volume | Réglage vidéo/musique séparé | P0 (MVP) |
| **Audio** | Voix-off | Enregistrement audio superposé | P2 |
| **Texte** | Texte animé | 15+ styles de texte animé | P1 |
| **Texte** | Sous-titres auto | IA speech-to-text | P2 |
| **Texte** | Traduction | Traduction auto des sous-titres | P3 |
| **Visuel** | Filtres | 20+ filtres (dont manga/anime IA) | P1 |
| **Visuel** | Stickers | Pack ImuChat + communauté | P1 |
| **Visuel** | Flou arrière-plan | Détection personne IA | P2 |
| **Visuel** | Stabilisation | Post-stabilisation | P2 |
| **Visuel** | Correction lumière | Auto-adjust brightness/contrast | P2 |
| **Transition** | Entre clips | 10+ transitions (fade, swipe, zoom) | P1 |
| **Avancé** | Speed | Ralenti (0.5x) → accéléré (3x) | P1 |
| **Avancé** | Green screen | Remplacement fond | P3 |

### 6.2 Filtres IA manga/anime — Feature signature

Les filtres IA sont un **différenciateur clé** aligné avec l'ADN ImuChat :

| Filtre | Effet | Technologie |
|--------|-------|-------------|
| Anime Classic | Style Ghibli | Neural style transfer |
| Manga Ink | Noir et blanc manga | Edge detection + IA |
| Chibi | Déformation kawaii | Facial landmark + morph |
| Neon City | Style cyberpunk | Color grading IA |
| Watercolor | Aquarelle japonaise | Style transfer |
| Comic Pop | BD pop art | Segmentation + style |

Pipeline : Frame extraction → Processing (via TFLite / Core ML) → Composite → Re-encode

---

## 7. Interactions Sociales sur Vidéo

### 7.1 Actions rapides (panneau latéral droit)

| Icône | Action | Donnée affichée | Détail |
|-------|--------|-----------------|--------|
| ❤️ | Like | Compteur (ex: 24.3K) | Double-tap aussi possible |
| 💬 | Commentaire | Compteur | Ouvre bottom sheet commentaires |
| 🔁 | Remix / Duo | Compteur | Ouvre écran création avec vidéo source |
| ⭐ | Sauvegarder | — | Ajoute aux favoris |
| ➤ | Partager | — | Bottom sheet partage (DM, lien, cross-post) |

### 7.2 Commentaires hiérarchisés

```
┌─────────────────────────────────────────────┐
│  💬 1,234 commentaires         [ Top ▾ ]    │
├─────────────────────────────────────────────┤
│                                             │
│  📌 ◯ Nathan (créateur)                     │
│     Merci à tous pour le soutien ! ❤️        │
│     ❤️ 342  💬 12           il y a 2h       │
│                                             │
│  ◯ Alice                                    │
│     Incroyable cette vidéo ! 🔥              │
│     ❤️ 89   💬 3            il y a 1h       │
│     └── ◯ Nathan                            │
│         @alice Merci beaucoup ! 🙏           │
│         ❤️ 24               il y a 45m      │
│     └── ◯ Lucas                             │
│         Même ! C'est dingue                 │
│         ❤️ 12               il y a 30m      │
│                                             │
│  ◯ Dev_Master                               │
│     [🎥 Réponse vidéo — 8s]                 │
│     ❤️ 156  💬 22           il y a 3h       │
│                                             │
├─────────────────────────────────────────────┤
│  ◯  Ajouter un commentaire...    📹  ➤     │
└─────────────────────────────────────────────┘
```

### 7.3 Types de commentaires

| Type | Description | Priorité |
|------|-------------|----------|
| Texte | Commentaire texte classique | P0 (MVP) |
| Réponse vidéo | Réponse filmée (8s max) publiée comme commentaire | P2 |
| GIF / Sticker | Réaction animée | P2 |
| Épinglé | Le créateur peut épingler 1 commentaire en haut | P1 |

### 7.4 Remix / Duo

Le Remix et le Duo sont des fonctionnalités de **co-création** :

| Mode | Layout | Description |
|------|--------|-------------|
| Duo | Split-screen vertical (50/50) | Filmer à côté de la vidéo originale |
| Remix | Plein écran avec vidéo source en vignette | Filmer en utilisant l'audio de la vidéo source |
| Green screen | Vidéo source en fond | Filmer devant la vidéo source |

### 7.5 Partage

| Destination | Mécanisme | Priorité |
|-------------|-----------|----------|
| DM ImuChat | Envoi dans conversation (message card vidéo) | P0 (MVP) |
| Groupe ImuChat | Partage dans un groupe existant | P0 (MVP) |
| Guilde/Communauté | Cross-post dans une communauté | P1 |
| Story | Republier en story | P1 |
| Lien externe | Copier lien public + preview OG tags | P0 (MVP) |
| Cross-platform | Partage iOS/Android natif (UIActivityViewController) | P1 |

---

## 8. Profil Créateur & Économie

### 8.1 Écran profil créateur

```
┌─────────────────────────────────────────────┐
│  ←  @nathan                        ⋮        │
├─────────────────────────────────────────────┤
│                                             │
│        ┌──────┐                             │
│        │ 📸   │   Nathan Imogo              │
│        │Avatar│   🔵 Vérifié                │
│        └──────┘   ⭐ Niveau 42 (Or)         │
│                                             │
│  "Building the future of super-apps"        │
│                                             │
│  ┌── Vidéos ──┐┌── Abonnés ──┐┌── Likes ──┐│
│  │     156     ││     45.2K   ││    1.2M    ││
│  └────────────┘└────────────┘└────────────┘│
│                                             │
│  [Suivre +]  [💬 Message]  [💰 Soutenir]   │
│                                             │
│  🏆 Badges: 🥇 Early Creator 🎬 100 vidéos │
│             ⭐ Top 10 Anime  🔥 Viral      │
│                                             │
├─────────────────────────────────────────────┤
│  [ 📹 Vidéos ] [ 🎬 Playlists ] [ 🔴 Replays ] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │ 📹 │ │ 📹 │ │ 📹 │  grille 3 colonnes   │
│  │24K │ │12K │ │8K  │                      │
│  └────┘ └────┘ └────┘                      │
│  ┌────┐ ┌────┐ ┌────┐                      │
│  │ 📹 │ │ 📹 │ │ 📹 │                      │
│  │5K  │ │3K  │ │2K  │                      │
│  └────┘ └────┘ └────┘                      │
│                                             │
└─────────────────────────────────────────────┘
```

### 8.2 Système de niveaux créateur

| Niveau | XP requis | Titre | Avantages |
|--------|-----------|-------|-----------|
| 1-10 | 0 — 1,000 | Novice | Upload de base, 60s max |
| 11-20 | 1,000 — 5,000 | Créateur | 3min max, filtres avancés |
| 21-30 | 5,000 — 15,000 | Influenceur | 10min max, Live, Analytics |
| 31-40 | 15,000 — 50,000 | Expert | Monétisation, badges custom |
| 41-50 | 50,000 — 150,000 | Maître | Chaîne vérifiée, priorité algo |
| 51+ | 150,000+ | Légende | Badge doré, Early access features |

### 8.3 Sources de XP

| Action | XP gagné | Limite |
|--------|----------|--------|
| Publier une vidéo | +50 XP | 5/jour |
| Recevoir un like | +2 XP | Illimité |
| Recevoir un commentaire | +5 XP | Illimité |
| Vidéo > 1K vues | +100 XP bonus | 1x/vidéo |
| Vidéo > 10K vues | +500 XP bonus | 1x/vidéo |
| Compléter un défi | +200 XP | 3/jour |
| Premier live | +300 XP | 1x |
| Co-host un live | +100 XP | 2/jour |

### 8.4 Monétisation créateur

| Source de revenu | Description | Commission ImuChat |
|-----------------|-------------|-------------------|
| Pourboires (ImuCoins) | Les viewers envoient des ImuCoins | 15% |
| Abonnement premium | Contenu exclusif ($2.99-$14.99/mois) | 20% |
| Vidéos réservées | Contenu payant à l'unité | 20% |
| Marketplace créateur | Vente de produits (merch, stickers, filtres) | 25% |
| Programme partenaire | Revenus publicitaires (seuil : 10K abonnés) | 30% |

### 8.5 Tableau de bord créateur

```
┌─────────────────────────────────────────────┐
│  📊 Mon Dashboard Créateur                   │
├─────────────────────────────────────────────┤
│                                             │
│  Ce mois-ci :                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 📈 Vues  │ │ 👥 Abo.  │ │ 💰 Rev.  │   │
│  │ 145.2K   │ │ +2,340   │ │ 520 IC   │   │
│  │ ↑ 23%    │ │ ↑ 15%    │ │ ↑ 8%     │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  📈 Graphique engagement (7 jours)          │
│  ▓▓▓▓▓▓                                    │
│  ▓▓▓▓▓                                     │
│  ▓▓▓▓▓▓▓▓                                  │
│  ▓▓▓▓                                      │
│  ▓▓▓▓▓▓▓                                   │
│  ▓▓▓▓▓▓▓▓▓                                 │
│  ▓▓▓▓▓▓▓▓▓▓▓                               │
│  L  M  M  J  V  S  D                       │
│                                             │
│  🔥 Top vidéo : "Super-app demo"           │
│     24.3K vues · 89% complétion · 6.2% eng │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 9. Live Streaming

### 9.1 Lanceur de live

```
┌─────────────────────────────────────────────┐
│  ✕ Lancer un Live                            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────┐       │
│  │     PRÉVISUALISATION CAMÉRA     │       │
│  └──────────────────────────────────┘       │
│                                             │
│  Titre : __________________________         │
│                                             │
│  Catégorie : [ Gaming ▾ ]                   │
│                                             │
│  ☐ Autoriser dons                           │
│  ☐ Inviter co-host                          │
│  ☐ Restriction 18+                          │
│  ☐ Enregistrer replay                       │
│                                             │
│  Qui peut voir :  ◉ Tous  ○ Abonnés        │
│                                             │
│     [ 🔴 LANCER LE LIVE ]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### 9.2 Interface viewer live

```
┌─────────────────────────────────────────────┐
│  🔴 LIVE  ◯ Nathan  ·  1,234 viewers        │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│        FLUX VIDÉO LIVE                      │
│                                             │
│                                             │
│                                             │
│  [Réactions flottantes ❤️ 🔥 😂 ⬆️]          │
│                                             │
│  ┌─────────────────────────┐                │
│  │ Chat live :             │                │
│  │ Alice: Salut !          │                │
│  │ Lucas: 🔥🔥🔥            │                │
│  │ Dev: Question : ...      │                │
│  │ $ Nathan a envoyé 50 IC │  ← don         │
│  └─────────────────────────┘                │
│                                             │
│  [💬 Chat] [❤️] [🎁 Don] [➤ Partager]       │
└─────────────────────────────────────────────┘
```

### 9.3 Fonctionnalités live

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Diffusion solo | Flux caméra + micro | P1 |
| Chat temps réel | WebSocket chat overlay | P1 |
| Réactions flottantes | Emojis animés qui flottent sur l'écran | P1 |
| Dons live | ImuCoins avec animation spéciale | P2 |
| Co-host | Inviter 1-3 personnes en split-screen | P2 |
| Modération live | Modérateurs peuvent ban/mute viewers | P2 |
| Replay | Enregistrement automatique + publication post-live | P1 |
| Screen share | Partage d'écran (gaming, démo) | P3 |
| Sondages en direct | Sondages interactifs pendant le live | P3 |

### 9.4 Architecture technique live

| Composant | Technologie |
|-----------|-------------|
| Streaming | WebRTC (via Stream Video SDK existant) |
| Chat overlay | Supabase Realtime (channel par live) |
| Réactions | WebSocket broadcast (Supabase) |
| Enregistrement | Serveur-side recording (Stream SDK) |
| Transcodage replay | Pipeline S3 → transcodage → CDN |

---

## 10. Intelligence Artificielle & Recommandation

### 10.1 Algorithme "Pour Toi"

L'algorithme de recommandation ImuFeed combine plusieurs signaux :

| Signal | Poids | Source |
|--------|-------|--------|
| Historique de visionnage | 30% | `video_views` table |
| Temps de visionnage moyen | 20% | Ratio watch_time / duration |
| Interactions (likes, commentaires, partages) | 20% | `video_interactions` table |
| Abonnements | 15% | `user_follows` table |
| Hashtags et catégories suivis | 10% | `user_interests` table |
| Fraîcheur du contenu | 5% | `created_at` pondération |

### 10.2 Pipeline de recommandation

```
Utilisateur ouvre ImuFeed
  → Fetch user profile (intérêts, historique, follows)
  → Candidats Phase 1 : Recall (1000 vidéos potentielles)
    ├── Contenu des abonnements (40%)
    ├── Contenu similaire (tags, catégorie) (30%)
    └── Contenu populaire/trending (30%)
  → Candidats Phase 2 : Ranking (score de pertinence)
    ├── Engagement score de la vidéo
    ├── Match intérêts utilisateur
    ├── Diversité (éviter les bulles)
    └── Fraîcheur
  → Phase 3 : Re-ranking (règles métier)
    ├── Dédup (pas 2 vidéos du même créateur consécutives)
    ├── Boost contenus ImuChat (communautés, défis)
    └── Safety filter (modération)
  → Résultat : 50 vidéos ordonnées, paginées par 10
```

### 10.3 Analyse comportementale

| Signal collecté | Usage | Stockage |
|----------------|-------|----------|
| Temps passé sur vidéo | Mesure d'intérêt réel (> simple like) | Analytics |
| Swipe rapide | Signal négatif (pas intéressé) | Analytics |
| Re-watch (boucle) | Signal très positif | Analytics |
| Partage en DM | Signal social fort | `video_shares` |
| Commentaire | Signal d'engagement profond | `video_comments` |
| "Pas intéressé" | Signal négatif explicite | `user_negative_signals` |

### 10.4 IA Alice — Intégration vidéo

| Feature | Description | Priorité |
|---------|-------------|----------|
| Résumé vidéo | Alice résume une vidéo longue en texte | P3 |
| Recherche conversationnelle | "Trouve-moi des vidéos de cuisine japonaise" | P3 |
| Suggestions proactives | "Tu devrais publier à 18h, c'est ton pic d'audience" | P3 |
| Auto-caption | Génération de sous-titres automatiques | P2 |
| Détection de langue | Sous-titres dans la langue de l'utilisateur | P3 |

---

## 11. Modération IA & Sécurité Contenu

### 11.1 Pipeline de modération

```
Vidéo uploadée
  → Phase 1 : Modération automatique (avant publication)
    ├── Détection nudité (NSFW classifier)
    ├── Détection violence (violence classifier)
    ├── Détection texte haineux (OCR + NLP)
    ├── Détection audio toxique (speech-to-text + NLP)
    └── Vérification copyright (audio fingerprinting basique)
  → Score de confiance
    ├── Score > 0.95 → Blocage automatique + notification créateur
    ├── Score 0.7-0.95 → File d'attente modération humaine
    └── Score < 0.7 → Publication OK
  → Phase 2 : Modération post-publication
    ├── Signalements utilisateurs (3 signalements → review)
    ├── Modération communauté (modérateurs des guildes)
    └── Review aléatoire (1% des vidéos)
```

### 11.2 Actions de modération

| Action | Déclencheur | Effet |
|--------|-------------|-------|
| Avertissement | 1er contenu signalé confirmé | Notification + vidéo retirée |
| Restriction | 3 avertissements | Upload désactivé 7 jours |
| Shadowban | Contenu répété problématique | Vidéos invisibles aux non-abonnés |
| Suspension | Violations graves | Compte suspendu 30 jours |
| Bannissement | Violations critiques / illégales | Compte définitivement supprimé |

### 11.3 Outils créateur de modération

- Filtrer les commentaires par mots-clés
- Bloquer des utilisateurs (sur ses vidéos uniquement)
- Épingler / masquer des commentaires
- Activer/désactiver commentaires par vidéo
- Mode "abonnés uniquement" pour les commentaires

---

## 12. Hashtags, Trending & Découverte

### 12.1 Système de hashtags

| Fonctionnalité | Description |
|----------------|-------------|
| Hashtags dans légende | `#imuchat #startup` — parsés et indexés |
| Page hashtag | `/hashtag/[tag]` — toutes les vidéos avec ce tag |
| Trending hashtags | Calculé sur les 24-72 dernières heures |
| Catégories officielles | Gaming, Foi, Éducation, Anime, Tech, Musique, Cuisine, Sport, Lifestyle |
| Hashtags suivis | L'utilisateur peut suivre un hashtag |
| Hashtags bannis | Admin peut bannir des hashtags problématiques |

### 12.2 Algorithme trending

```
TrendingScore(hashtag) =
  (usage_count_24h * 2)
  + (usage_count_72h * 1)
  + (unique_creators * 5)
  + (total_views * 0.001)
  + (acceleration_factor * 10)  // croissance vs période précédente
  - (age_penalty)
```

### 12.3 Système de challenges / défis

| Élément | Description |
|---------|-------------|
| Challenge officiel | Créé par ImuChat (ex: "Montre ton talent en 15s") |
| Challenge communauté | Créé par un créateur (ex: "#DanceChallenge") |
| Durée | 3-14 jours |
| Récompenses | XP bonus + ImuCoins + badge spécial |
| Page dédiée | Header avec description, timer, leaderboard |
| Sponsor | Possibilité de challenges sponsorisés (monétisation) |

### 12.4 Page Explore / Découverte

```
┌─────────────────────────────────────────────┐
│  🔍 Rechercher vidéos, créateurs, hashtags  │
├─────────────────────────────────────────────┤
│                                             │
│  🔥 TRENDING HASHTAGS                       │
│  #ImuFeedChallenge  #Anime  #Tech  #Cooking │
│                                             │
│  🏆 TOP CRÉATEURS DE LA SEMAINE             │
│  1. @anime_master (↑3) — 1.2M likes        │
│  2. @tech_guru (—) — 890K likes             │
│  3. @cooking_queen (↑7) — 650K likes        │
│                                             │
│  📹 TOP VIDÉOS                              │
│  ┌────────────┐ ┌────────────┐             │
│  │ 📹 245K ▶  │ │ 📹 198K ▶  │             │
│  └────────────┘ └────────────┘             │
│  ┌────────────┐ ┌────────────┐             │
│  │ 📹 156K ▶  │ │ 📹 134K ▶  │             │
│  └────────────┘ └────────────┘             │
│                                             │
│  🎯 CHALLENGES ACTIFS                       │
│  ┌─────────────────────────────────────┐    │
│  │ 🏆 #ShowYourTalent                  │    │
│  │ 2j restants · 1,234 participants   │    │
│  │ 🎁 500 ImuCoins + badge "Talent"   │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 13. Gamification & Récompenses

### 13.1 Système XP & Niveaux (voir aussi section 8.2)

Le système de gamification d'ImuFeed est cohérent avec le système global ImuChat (Arena, ImuCoins) et reprend l'ADN RPG/manga :

| Palier | Titre visuel | Couleur badge | Avantage |
|--------|-------------|---------------|----------|
| Bronze (1-10) | Novice | 🟤 | Accès de base |
| Argent (11-20) | Créateur | ⚪ | Filtres avancés, 3min |
| Or (21-30) | Influenceur | 🟡 | Live, analytics, 10min |
| Platine (31-40) | Expert | 🔵 | Monétisation, badges custom |
| Diamant (41-50) | Maître | 💎 | Vérification, priorité algo |
| Légendaire (51+) | Légende | ✨ | Badge doré animé, early access |

### 13.2 Badges ImuFeed

| Badge | Condition | Design |
|-------|-----------|--------|
| 🎬 First Video | Publier sa 1ère vidéo | Caméra dorée |
| 🔥 Viral | 1 vidéo > 100K vues | Flamme animée |
| 🎵 DJ | Utiliser 50 musiques différentes | DJ booth |
| 💬 Storyteller | 100 commentaires reçus sur 1 vidéo | Livre ouvert |
| 🤝 Collaborator | 10 duos/remixes | Poignée de main |
| 📺 Broadcaster | 10 lives avec 100+ viewers | Antenne TV |
| 🏆 Arena Champion | Gagner un challenge | Coupe dorée |
| 👑 Creator King | Atteindre 100K abonnés | Couronne animée |

### 13.3 Défis quotidiens

| Défi | Récompense | Reset |
|------|------------|-------|
| Publier 1 vidéo | +50 XP + 10 IC | Quotidien |
| Liker 10 vidéos | +20 XP + 5 IC | Quotidien |
| Commenter 5 vidéos | +30 XP + 5 IC | Quotidien |
| Regarder 30 minutes | +40 XP | Quotidien |
| Partager 3 vidéos | +25 XP + 10 IC | Quotidien |
| Compléter tous les défis | +100 XP bonus + 25 IC | Quotidien |

### 13.4 Classements

| Classement | Période | Critère |
|------------|---------|---------|
| Top Créateur semaine | Hebdomadaire | XP gagné cette semaine |
| Top Vidéo jour | Quotidien | Engagement score |
| Top Live | Hebdomadaire | Peak viewers |
| Arena | Permanent | Points Arena (concours) |

---

## 14. Analytics & Statistiques

### 14.1 Analytics côté créateur

| Métrique | Description | Visualisation |
|----------|-------------|--------------|
| Vues | Nombre total de vues | Compteur + graphique |
| Temps de watch moyen | Durée moyenne de visionnage | Graphique barres |
| Taux de complétion | % qui regardent jusqu'au bout | Pourcentage |
| Engagement rate | (likes + comments + shares) / vues | Pourcentage |
| Taux de conversion | Viewers → abonnés | Pourcentage |
| Revenus | ImuCoins gagnés (pourboires, abos, ventes) | Compteur + graphique |
| Audience | Répartition géographique, âge, genre | Pie chart |
| Sources de trafic | Pour toi / Abonnements / Hashtags / Partage | Pie chart |
| Heures optimales | Quand poster pour max engagement | Heatmap |

### 14.2 Analytics côté plateforme (admin)

| Métrique | Description |
|----------|-------------|
| Vidéos publiées / jour | Volume de contenu |
| Créateurs actifs / semaine | Santé de l'écosystème |
| Temps passé moyen / user | Engagement global |
| Taux de rétention J1/J7/J30 | Rétention utilisateurs |
| Contenu signalé / modéré | Santé de la modération |
| Revenus ImuCoins générés | Monétisation |
| TOP vidéos trending | Contenu viral |

---

## 15. Stockage, Infrastructure & Performance

### 15.1 Architecture stockage

```
Client (Mobile)
  │
  │  Upload via S3 presigned URL (chunked, multipart)
  ▼
AWS S3 — Raw Bucket (vidéos originales)
  │
  │  Event → Lambda / Supabase Edge Function
  ▼
Transcodage Pipeline (MediaConvert / FFmpeg worker)
  │
  ├── 360p (low bandwidth)
  ├── 720p (standard)
  ├── 1080p (HD)
  └── Thumbnail (3 options, sélection IA)
  │
  ▼
AWS S3 — Processed Bucket (vidéos transcodées)
  │
  ▼
CDN (CloudFront / Bunny.net)
  │
  ▼
Client (HLS Adaptive Streaming)
```

### 15.2 Format et qualité

| Qualité | Résolution | Bitrate vidéo | Bitrate audio | Usage |
|---------|-----------|---------------|---------------|-------|
| Low | 360p | 800 Kbps | 64 Kbps | 3G / données limitées |
| Standard | 720p | 2.5 Mbps | 128 Kbps | WiFi / 4G (défaut) |
| HD | 1080p | 5 Mbps | 128 Kbps | WiFi rapide |

### 15.3 Performance mobile

| Optimisation | Technique | Impact |
|-------------|-----------|--------|
| Préchargement | Buffer N+1 (1er segment HLS) | Swipe instantané |
| Cache local | expo-av cache + AsyncStorage metadata | Économie data |
| Adaptive bitrate | HLS auto-switch selon connexion | Pas de buffering |
| Thumbnail lazy | expo-image avec cache progressif | Scroll fluide |
| FlashList | Liste virtualisée (vs FlatList) | 60 FPS scroll |
| Compression upload | Compression locale avant upload | 50-70% taille réduite |
| Mode données faibles | 360p par défaut, pas de préchargement auto | Économie data |

### 15.4 Estimations de coûts infrastructure

| Ressource | Coût estimé / mois | Pour |
|-----------|-------------------|------|
| S3 stockage | $0.023/GB | 1 TB = $23 |
| CloudFront CDN | $0.085/GB transfert | 10 TB = $850 |
| MediaConvert | $0.024/min transcodé | 10K vidéos = $120 |
| Supabase | $25-$599/mois | Base + Realtime |

---

## 16. Contrôle Parental & Segmentation par Âge

### 16.1 Niveaux de restriction

| Tier | Âge | Accès ImuFeed | Restrictions |
|------|-----|-------------|-------------|
| Kids (6-12) | ✅ Feed filtré | Pas de live, pas de DM sur vidéo, commentaires désactivés, contenu éducatif uniquement |
| Teen (13-17) | ✅ Feed complet | Pas de contenu 18+, live en mode spectateur only, commentaires modérés |
| Adult (18+) | ✅ Accès complet | Aucune restriction |

### 16.2 Contrôles parentaux

| Contrôle | Description |
|----------|-------------|
| Temps d'écran ImuFeed | Limite quotidienne (ex: 1h/jour) |
| Catégories autorisées | Sélection des catégories visibles |
| Mode commentaires | Off / Amis uniquement / Tous |
| Upload autorisé | Oui / Non |
| Rapport d'activité | Résumé envoyé aux parents |

---

## 17. Intégration avec l'Écosystème ImuChat

### 17.1 Points d'intégration (avantage compétitif majeur)

C'est ici qu'ImuFeed **surpasse TikTok/Reels** — l'intégration native dans l'écosystème ImuChat crée des boucles d'engagement impossibles sur les plateformes vidéo pures.

| Intégration | Source → Cible | Description |
|-------------|----------------|-------------|
| **Partage DM** | ImuFeed → Chat | Card vidéo dans conversation avec preview |
| **Réponse vidéo** | Chat → ImuFeed | Filmer une vidéo ImuFeed en réponse à un message |
| **Watch Party** | ImuFeed → Watch | Regarder une vidéo ImuFeed ensemble en temps réel |
| **Cross-post communauté** | ImuFeed → Social | Publier la vidéo dans une guilde/communauté |
| **Vidéo → Thread** | ImuFeed → Social | Transformer les commentaires d'une vidéo en thread de discussion |
| **Story video** | ImuFeed → Stories | Partager une vidéo comme story éphémère |
| **IA résumé** | ImuFeed → Alice | Alice résume une vidéo longue en texte dans le chat |
| **Notifications** | ImuFeed → Notifs | Nouveau contenu des abonnements, likes en bulk |
| **Wallet** | ImuFeed ↔ Wallet | Pourboires, achats, revenus créateur |
| **Arena** | ImuFeed → Arena | Vidéo concours (challenges avec classement) |
| **Modules Store** | Store → ImuFeed | Filtres premium, effets, analytics pro via Store |
| **Home Hub** | ImuFeed → Home | Widget "Trending ImuFeed" sur le Home |
| **Profil** | ImuFeed → Profil | Section vidéos sur le profil utilisateur |

### 17.2 Carte vidéo dans le chat

```
┌──────────────────────────────────┐
│  📹 Nathan a partagé une vidéo  │
│  ┌────────────────────────────┐  │
│  │ ▶ thumbnail                 │  │
│  │ 0:15                       │  │
│  └────────────────────────────┘  │
│  Building super-apps #imuchat   │
│  ❤️ 24.3K ▸ Voir sur ImuFeed    │
└──────────────────────────────────┘
```

### 17.3 Watch Party ImuFeed

La Watch Party synchronisée permet à un groupe d'amis ImuChat de regarder des vidéos ImuFeed ensemble :

```
Créer Watch Party (depuis un groupe ImuChat)
  → Sélectionner la vidéo (ou playlist)
  → Inviter les participants
  → Lecture synchronisée + chat latéral
  → Réactions flottantes partagées
  → File d'attente collaborative
```

---

## 18. Architecture Technique Détaillée

### 18.1 Structure fichiers (à créer)

```
mobile/
├── app/imufeed/                    # Écrans ImuFeed
│   ├── index.tsx                   # Feed vertical principal
│   ├── create.tsx                  # Création vidéo
│   ├── editor.tsx                  # Éditeur vidéo
│   ├── [id].tsx                    # Détail vidéo / commentaires
│   ├── search.tsx                  # Recherche & explore
│   ├── hashtag/[tag].tsx           # Page hashtag
│   ├── profile/[id].tsx            # Profil créateur
│   ├── live/
│   │   ├── create.tsx              # Lancer un live
│   │   ├── [id].tsx                # Viewer live
│   │   └── replays.tsx             # Replays
│   └── analytics.tsx               # Dashboard créateur
│
├── components/imufeed/             # Composants ImuFeed
│   ├── VideoFeedItem.tsx           # Item du feed vertical (plein écran)
│   ├── VideoActions.tsx            # Panneau d'actions latéral
│   ├── CommentSheet.tsx            # Bottom sheet commentaires
│   ├── VideoEditor.tsx             # Éditeur vidéo
│   ├── CameraCapture.tsx           # Interface caméra
│   ├── MusicSelector.tsx           # Sélecteur de musique
│   ├── FilterSelector.tsx          # Sélecteur de filtres
│   ├── StickerOverlay.tsx          # Stickers sur vidéo
│   ├── PublishSettings.tsx         # Paramètres de publication
│   ├── CreatorProfile.tsx          # Profil créateur
│   ├── TrendingHashtags.tsx        # Tags trending
│   ├── ChallengeCard.tsx           # Carte défi
│   ├── LiveChat.tsx                # Chat overlay live
│   ├── LiveDonation.tsx            # Animation donation live
│   └── VideoCard.tsx               # Card vidéo (grille, chat, home)
│
├── services/imufeed/               # Services API
│   ├── feed-api.ts                 # Fetch feed (Pour toi, Abonnements, Trending)
│   ├── video-upload.ts             # Upload vidéo (S3 presigned, chunked)
│   ├── video-transcode.ts          # Status transcodage
│   ├── comments-api.ts             # CRUD commentaires
│   ├── interactions-api.ts         # Like, save, share, remix
│   ├── creator-api.ts              # Profil créateur, analytics
│   ├── live-api.ts                 # Live streaming management
│   ├── moderation-api.ts           # Signalements, modération
│   ├── hashtag-api.ts              # Trending, recherche hashtag
│   └── preloader.ts                # Préchargement vidéos
│
├── stores/
│   └── imufeed-store.ts            # Zustand store ImuFeed
│
└── types/
    └── imufeed.ts                  # Types TypeScript ImuFeed
```

### 18.2 Types TypeScript principaux

```typescript
// types/imufeed.ts

interface ImuFeedVideo {
  id: string;
  creator_id: string;
  creator: CreatorProfile;
  title: string;
  description: string;
  hashtags: string[];
  category: VideoCategory;
  video_url: string;           // HLS manifest URL
  thumbnail_url: string;
  duration: number;            // secondes
  width: number;
  height: number;
  visibility: 'public' | 'followers' | 'private';
  allow_comments: boolean;
  allow_remix: boolean;
  allow_download: boolean;
  monetized: boolean;
  music_id?: string;
  music?: MusicTrack;
  stats: VideoStats;
  created_at: string;
  moderation_status: 'pending' | 'approved' | 'flagged' | 'removed';
}

interface VideoStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  remixes: number;
  avg_watch_time: number;
  completion_rate: number;
}

interface CreatorProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  level: number;
  xp: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  verified: boolean;
  follower_count: number;
  video_count: number;
  total_likes: number;
  badges: Badge[];
}

interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  user: { username: string; avatar_url: string };
  content: string;
  video_reply_url?: string;   // Si réponse vidéo
  parent_id?: string;         // Si réponse à un commentaire
  pinned: boolean;
  likes: number;
  replies_count: number;
  created_at: string;
}

interface LiveStream {
  id: string;
  host_id: string;
  host: CreatorProfile;
  title: string;
  category: VideoCategory;
  viewer_count: number;
  started_at: string;
  is_recording: boolean;
  allow_donations: boolean;
  co_hosts: string[];
  stream_url: string;         // WebRTC / HLS
}

type VideoCategory =
  | 'gaming' | 'faith' | 'education' | 'anime'
  | 'tech' | 'music' | 'cooking' | 'sport'
  | 'lifestyle' | 'comedy' | 'news' | 'art'
  | 'science' | 'travel' | 'fashion' | 'diy';

type FeedTab = 'for_you' | 'following' | 'trending';
```

### 18.3 Store Zustand

```typescript
// stores/imufeed-store.ts (structure)

interface ImuFeedStore {
  // Feed state
  currentTab: FeedTab;
  videos: ImuFeedVideo[];
  currentIndex: number;
  isLoading: boolean;
  hasMore: boolean;

  // Player state
  isMuted: boolean;
  isPlaying: boolean;

  // Actions
  fetchFeed: (tab: FeedTab, page: number) => Promise<void>;
  likeVideo: (videoId: string) => Promise<void>;
  saveVideo: (videoId: string) => Promise<void>;
  shareVideo: (videoId: string, target: ShareTarget) => Promise<void>;
  reportVideo: (videoId: string, reason: string) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  toggleMute: () => void;

  // Upload
  uploadVideo: (file: VideoFile, metadata: VideoMetadata) => Promise<void>;
  uploadProgress: number;

  // Creator
  creatorProfile?: CreatorProfile;
  fetchCreatorProfile: (userId: string) => Promise<void>;
}
```

---

## 19. Schéma Base de Données (Supabase)

### 19.1 Tables principales

```sql
-- Vidéos ImuFeed
CREATE TABLE imufeed_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hashtags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration REAL NOT NULL,
  width INTEGER DEFAULT 1080,
  height INTEGER DEFAULT 1920,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public','followers','private')),
  allow_comments BOOLEAN DEFAULT true,
  allow_remix BOOLEAN DEFAULT true,
  allow_download BOOLEAN DEFAULT false,
  monetized BOOLEAN DEFAULT false,
  music_id UUID REFERENCES imufeed_music(id),
  moderation_status TEXT DEFAULT 'pending',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  avg_watch_time REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interactions
CREATE TABLE imufeed_likes (
  user_id UUID REFERENCES auth.users(id),
  video_id UUID REFERENCES imufeed_videos(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE imufeed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES imufeed_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  video_reply_url TEXT,
  parent_id UUID REFERENCES imufeed_comments(id),
  pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE imufeed_saves (
  user_id UUID REFERENCES auth.users(id),
  video_id UUID REFERENCES imufeed_videos(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);

-- Profils créateurs
CREATE TABLE imufeed_creators (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  verified BOOLEAN DEFAULT false,
  total_videos INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  monetization_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Follows créateurs
CREATE TABLE imufeed_follows (
  follower_id UUID REFERENCES auth.users(id),
  creator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, creator_id)
);

-- Live streams
CREATE TABLE imufeed_lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  stream_url TEXT,
  replay_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  allow_donations BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Hashtags trending
CREATE TABLE imufeed_hashtags (
  tag TEXT PRIMARY KEY,
  usage_count INTEGER DEFAULT 0,
  usage_count_24h INTEGER DEFAULT 0,
  usage_count_72h INTEGER DEFAULT 0,
  trending_score REAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Musiques
CREATE TABLE imufeed_music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration REAL NOT NULL,
  usage_count INTEGER DEFAULT 0,
  is_original BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES auth.users(id)
);

-- Analytics vues
CREATE TABLE imufeed_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES imufeed_videos(id),
  user_id UUID REFERENCES auth.users(id),
  watch_time REAL NOT NULL,
  completed BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'for_you',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 19.2 Indexes recommandés

```sql
CREATE INDEX idx_videos_creator ON imufeed_videos(creator_id);
CREATE INDEX idx_videos_category ON imufeed_videos(category);
CREATE INDEX idx_videos_created_at ON imufeed_videos(created_at DESC);
CREATE INDEX idx_videos_hashtags ON imufeed_videos USING GIN(hashtags);
CREATE INDEX idx_comments_video ON imufeed_comments(video_id, created_at DESC);
CREATE INDEX idx_follows_creator ON imufeed_follows(creator_id);
CREATE INDEX idx_views_video ON imufeed_views(video_id);
CREATE INDEX idx_hashtags_trending ON imufeed_hashtags(trending_score DESC);
```

### 19.3 RLS (Row Level Security)

```sql
-- Vidéos publiques visibles par tous
CREATE POLICY "Videos public read" ON imufeed_videos
  FOR SELECT USING (
    visibility = 'public'
    OR creator_id = auth.uid()
    OR (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM imufeed_follows
      WHERE follower_id = auth.uid() AND creator_id = imufeed_videos.creator_id
    ))
  );

-- Seul le créateur peut modifier ses vidéos
CREATE POLICY "Videos creator update" ON imufeed_videos
  FOR UPDATE USING (creator_id = auth.uid());

-- Seul le créateur peut supprimer ses vidéos
CREATE POLICY "Videos creator delete" ON imufeed_videos
  FOR DELETE USING (creator_id = auth.uid());
```

---

## 20. Plan MVP & au-delà

### 20.1 Phase 1 — MVP Feed (4 sprints)

| Feature | Description |
|---------|-------------|
| Feed vertical fullscreen | Scroll vertical avec autoplay |
| Upload simple | Capture caméra + import galerie |
| Éditeur basique | Trim, volume, 1 filtre |
| Like / Commentaire | Actions de base |
| Profil créateur basique | Bio, grille vidéos, compteur |
| Algorithme chronologique | Feed simple par date |
| Partage en DM | Card vidéo dans le chat |
| Modération minimale | Signalement + review manuelle |

### 20.2 Phase 2 — Social & Découverte (4 sprints)

| Feature | Description |
|---------|-------------|
| Algorithme "Pour Toi" | Recommandation IA basée sur engagement |
| Hashtags & trending | Pages hashtags, trending |
| Recherche vidéo | Full-text search + filtres |
| Filtres et effets | 10+ filtres dont manga/anime |
| Stickers & texte animé | Éditeur enrichi |
| Musique | Bibliothèque musicale intégrée |
| Remix / Duo | Co-création vidéo |

### 20.3 Phase 3 — Créateurs & Monétisation (3 sprints)

| Feature | Description |
|---------|-------------|
| Dashboard créateur | Analytics complètes |
| Gamification | XP, niveaux, badges, classements |
| Pourboires (ImuCoins) | Dons sur vidéos |
| Abonnement premium créateur | Contenu exclusif |
| Challenges / Défis | Concours communautaires |

### 20.4 Phase 4 — Live & Avancé (3 sprints)

| Feature | Description |
|---------|-------------|
| Live streaming | Diffusion en direct |
| Co-host live | Multi-participants |
| Donations live | ImuCoins avec animations |
| Watch Party ImuFeed | Visionnage synchronisé |
| Sous-titres auto IA | Speech-to-text multilingue |
| Résumé vidéo IA | Alice résume les longues vidéos |

### 20.5 Phase 5 — Scalabilité (2 sprints)

| Feature | Description |
|---------|-------------|
| Mode grille (Explore) | Vue grille type Instagram |
| PiP (Picture in Picture) | Multitâche vidéo |
| Mode données faibles | 360p + pas de préchargement auto |
| Optimisation CDN | Multi-region, edge caching |
| Filtres premium (Store) | Vente de filtres dans le Store |

---

> **Ce document est la vision enrichie du module ImuFeed Vidéo. Il sert de base pour le roadmap de développement détaillé.**
