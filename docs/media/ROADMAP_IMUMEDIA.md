# 🎬 ROADMAP DÉTAILLÉE — ImuMedia Suite

**Module :** ImuMusic · ImuPodcasts · ImuBooks · ImuComics · ImuDocs Reader  
**Date de création :** 15 mars 2026 · **Version :** 1.0  
**Durée :** ~36 semaines · **Sprints :** 18 × 2 semaines  
**Stack :** epub.js · Howler.js · expo-av · Supabase · ImuDrive (OVHcloud S3) · Socket.IO · Whisper · Alice IA  
**Plateformes :** Web (Next.js 16) · Mobile (Expo 52) · Desktop (Electron → Tauri)  
**Dépendance principale :** `@imuchat/media-core` (Phase 0)

---

## Architecture du package transversal

```
packages/
└── @imuchat/media-core/
    ├── readers/
    │   ├── epub-reader.ts          # ImuBooks — EPUB/MOBI
    │   ├── cbz-reader.ts           # ImuComics — CBZ/CBR/Webtoon
    │   ├── pdf-reader.ts           # ImuDocs Reader
    │   └── audio-player.ts         # Unifie Musique + Podcasts (Howler.js)
    ├── watch-party/
    │   └── sync-engine.ts          # Socket.IO — réutilisable pour tous les médias
    ├── rich-preview/
    │   └── media-preview.ts        # Cartes in-chat universelles (oEmbed + custom)
    ├── library/
    │   ├── library-service.ts      # Bibliothèque unifiée + ImuDrive
    │   └── progress-tracker.ts     # Sync position cross-platform
    └── clips/
        └── imu-clips.ts            # Bookmarks intelligents multi-média
```

---

## Vue d'ensemble des phases

| Phase | Sprints | Semaines | Thème | Plateformes |
|-------|:-------:|:--------:|-------|-------------|
| **Phase 0** | S1–S2 | 1–4 | Fondations `@imuchat/media-core` | Toutes |
| **Phase 1** | S3–S5 | 5–10 | ImuMusic | Web + Mobile |
| **Phase 2** | S6–S7 | 11–14 | ImuPodcasts (consolidation) | Web + Mobile |
| **Phase 3** | S8–S10 | 15–20 | ImuBooks (Liseuse) | Web + Mobile |
| **Phase 4** | S11–S13 | 21–26 | ImuComics & Manga | Web + Mobile |
| **Phase 5** | S14–S15 | 27–30 | ImuDocs Reader (PDF) | Toutes |
| **Phase 6** | S16–S18 | 31–36 | Transversal — Watch Party, ImuClips, Desktop | Toutes |

---

## Dépendances inter-phases

```
Phase 0 (media-core)
    │
    ├── Phase 1 (ImuMusic)
    │       └── Phase 6 (Watch Party Audio)
    │
    ├── Phase 2 (ImuPodcasts)
    │       └── Phase 6 (Watch Party Podcast)
    │
    ├── Phase 3 (ImuBooks)
    │       └── Phase 4 (ImuComics) ← partage epub-reader + library-service
    │
    ├── Phase 5 (ImuDocs Reader)
    │
    └── Phase 6 (ImuClips — agrège tout)
```

---

## 🏗️ Phase 0 — Fondations `@imuchat/media-core` (Semaines 1–4)

### Sprint 1 (S1–S2) — Package core + Supabase schema

**Objectif :** Poser le socle commun consommé par tous les modules média.

#### Supabase — Tables

```sql
-- Bibliothèque personnelle (tous types de médias)
CREATE TABLE media_library (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  media_type  TEXT CHECK (media_type IN ('book','comic','podcast','music','pdf')) NOT NULL,
  title       TEXT NOT NULL,
  author      TEXT,
  cover_url   TEXT,
  file_url    TEXT,                     -- ImuDrive S3 UE
  source      TEXT DEFAULT 'local',     -- 'local' | 'store' | 'import'
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Progression de lecture/écoute (sync cross-platform)
CREATE TABLE media_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  media_id    UUID REFERENCES media_library(id) ON DELETE CASCADE,
  position    JSONB NOT NULL,            -- { page: 42 } | { ms: 185000 } | { chapter: "2", planche: 5 }
  completed   BOOLEAN DEFAULT FALSE,
  last_sync   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- ImuClips — bookmarks intelligents
CREATE TABLE media_clips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  media_id    UUID REFERENCES media_library(id) ON DELETE CASCADE,
  position    JSONB NOT NULL,
  note        TEXT,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS :** chaque utilisateur ne voit que ses propres entrées (`user_id = auth.uid()`).

#### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `packages/@imuchat/media-core/src/types/media.types.ts` | Types partagés `MediaItem`, `MediaProgress`, `MediaClip` |
| `packages/@imuchat/media-core/src/lib/library-service.ts` | CRUD bibliothèque + ImuDrive upload |
| `packages/@imuchat/media-core/src/lib/progress-tracker.ts` | Sync position lecture cross-platform |
| `packages/@imuchat/media-core/src/lib/imu-clips.ts` | Bookmarks multi-média avec tagging Alice |

**Tests :** ~18

---

### Sprint 2 (S3–S4) — Rich Preview in-chat + audio-player unifié

**Objectif :** Les cartes rich preview dans le chat et le player audio partagé (musique + podcasts).

#### Rich Preview Engine

- Détection automatique des URLs (Spotify, Deezer, Apple Music, YouTube Music, SoundCloud)
- Rendu carte : pochette + titre + artiste + durée + bouton Play 30s preview
- Format citation livre : `<MediaQuoteCard>` — titre, auteur, extrait surligné
- Format spoiler BD : planches flouées, tap pour révéler

#### Audio Player unifié (`audio-player.ts`)

```typescript
// Howler.js (web) + expo-av (mobile) — même interface
interface AudioPlayerControls {
  play(url: string, metadata: TrackMeta): void;
  pause(): void;
  seek(ms: number): void;
  seekForward(ms?: number): void;   // défaut 30s (podcasts) | 10s (musique)
  seekBackward(ms?: number): void;
  setSpeed(speed: PlaybackSpeed): void;
  toggleShuffle(): void;
  setRepeat(mode: RepeatMode): void;
  onProgress(cb: (ms: number, duration: number) => void): void;
  onEnd(cb: () => void): void;
}
```

- Mini-player persistant dockable (bottom-bar web + lockscreen controls mobile)
- Auto-pause sur appel entrant ou sortant
- Volume indépendant des notifications

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `packages/@imuchat/media-core/src/readers/audio-player.ts` | Player unifié Howler + expo-av |
| `packages/@imuchat/media-core/src/rich-preview/media-preview.ts` | oEmbed + renderers custom |
| `ui-kit/src/components/media/MediaPreviewCard.tsx` | Carte rich preview universelle |
| `ui-kit/src/components/media/MiniPlayer.tsx` | Mini-player dockable (web + mobile) |

**Tests :** ~22

---

## 🎵 Phase 1 — ImuMusic (Semaines 5–10)

### Sprint 3 (S5–S6) — Section dédiée Web `/music` + Mobile `/music`

**Objectif :** Première section musicale complète avec bibliothèque curatée.

#### Supabase — Tables

```sql
CREATE TABLE music_playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  cover_url   TEXT,
  tier        TEXT DEFAULT 'free' CHECK (tier IN ('free','premium')),
  theme_key   TEXT,                      -- lié au design system (ex: 'cyber_neon', 'sakura')
  tracks      JSONB DEFAULT '[]',        -- array de TrackMeta
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE music_likes (
  user_id   UUID REFERENCES auth.users NOT NULL,
  track_id  TEXT NOT NULL,
  liked_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE music_listening_status (
  user_id    UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  track_id   TEXT,
  track_name TEXT,
  artist     TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fonctionnalités

- 6 playlists curatées gratuites (Lo-fi Chill, Ambient Zen, Focus/Study, Workout Light, Morning Boost, Classique Soft)
- Lecteur plein écran — artwork animé, progression fluide, paroles (LRC optionnel)
- **Musique liée au thème UI** : si thème Cyber Neon actif → playlist Synthwave proposée automatiquement
- "En train d'écouter" sur le profil utilisateur (optionnel via `music_listening_status`)
- Packs premium via Store ImuChat (Kawaii/J-Pop, Gaming/Cyber, Méditation)
- Import depuis dossier local (web File API + expo-document-picker)

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/music/page.tsx` | Page principale `/music` |
| `web-app/src/app/music/[playlistId]/page.tsx` | Vue playlist |
| `web-app/src/app/music/player/page.tsx` | Lecteur plein écran |
| `mobile/app/music/index.tsx` | ← déjà partiellement implémenté, compléter |
| `mobile/app/music/player.tsx` | Lecteur plein écran mobile |
| `platform-core/src/modules/music/music.service.ts` | Service bibliothèque + likes |
| `platform-core/src/modules/music/music.controller.ts` | Routes API |

**Tests :** ~38

---

### Sprint 4 (S7–S8) — In-Chat Music + Mood tagging

**Objectif :** Intégration musicale directe dans les conversations.

#### Fonctionnalités in-chat

- Rich preview automatique sur liens Spotify / Deezer / Apple Music / YouTube Music
- Partage de piste → carte avec preview 30 secondes embarquée
- **Mood tagging** : associer une ambiance musicale à une conversation (icône dans le header du chat)
- Mode ambiance par salon vocal : chaque channel peut avoir sa playlist (stocké dans `channel_metadata`)
- Bouton "Écouter ensemble" → crée automatiquement une Watch Party Audio (voir Phase 6)

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `platform-core/src/modules/music/oembed.service.ts` | Résolution oEmbed Spotify/Deezer/etc. |
| `ui-kit/src/components/chat/MusicMessageCard.tsx` | Carte musique in-chat |
| `ui-kit/src/components/chat/MoodSelector.tsx` | Sélecteur d'ambiance pour conversation |
| `web-app/src/app/api/music/preview/route.ts` | Proxy preview 30s |

**Tests :** ~28

---

### Sprint 5 (S9–S10) — Intégrations OAuth (Spotify, Deezer)

**Objectif :** Connexion compte utilisateur et synchronisation des playlists externes.

#### Supabase — Table

```sql
CREATE TABLE music_integrations (
  user_id       UUID REFERENCES auth.users NOT NULL,
  provider      TEXT CHECK (provider IN ('spotify','deezer','apple_music')) NOT NULL,
  access_token  TEXT,                          -- chiffré AES-256
  refresh_token TEXT,                          -- chiffré AES-256
  expires_at    TIMESTAMPTZ,
  scopes        TEXT[],
  PRIMARY KEY (user_id, provider)
);
```

#### Fonctionnalités (Niveau 1 — affichage + partage)

- Connexion OAuth Spotify / Deezer dans Settings > Comptes liés
- Import automatique des playlists de l'utilisateur
- "Actuellement en écoute" depuis Spotify sur le profil
- Cross-posting : partager une piste ImuChat → lien Spotify/Deezer direct

#### Niveau 2 (si API autorise)

- Lecture intégrée via SDK (Spotify Web Playback SDK — requires Premium)
- Watch Party Audio synchronisée (voir Phase 6)

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `platform-core/src/modules/music/integrations/spotify.service.ts` | OAuth Spotify + API |
| `platform-core/src/modules/music/integrations/deezer.service.ts` | OAuth Deezer + API |
| `web-app/src/app/settings/accounts/music/page.tsx` | Page connexion comptes musicaux |

**Tests :** ~24

---

## 🎙️ Phase 2 — ImuPodcasts (Semaines 11–14)

### Sprint 6 (S11–S12) — Section dédiée Web + consolidation Mobile

**Objectif :** Finaliser ce qui existe en mobile, créer la section web, ajouter transcription Whisper.

#### Supabase — Tables complémentaires

```sql
CREATE TABLE podcast_subscriptions (
  user_id    UUID REFERENCES auth.users NOT NULL,
  show_id    TEXT NOT NULL,             -- ID flux RSS ou provider
  show_name  TEXT,
  feed_url   TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, show_id)
);

CREATE TABLE podcast_queue (
  user_id    UUID REFERENCES auth.users NOT NULL,
  episode_id TEXT NOT NULL,
  position   INT NOT NULL,             -- ordre dans la queue
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE podcast_transcripts (
  episode_id  TEXT PRIMARY KEY,
  transcript  TEXT,                    -- texte complet Whisper
  language    TEXT DEFAULT 'fr',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fonctionnalités

- Catalogue podcasts (RSS parser + intégrations Podcast Index / PodcastAddict API)
- Lecteur plein écran : vitesse (0.5x–2x), chapitres, skip silence, sleep timer
- Abonnements + queue personnelle
- **Transcription Whisper** : texte searchable en arrière-plan, généré à la demande
- **Résumé Alice** : résumé en 5 points d'un épisode (appel Claude API streaming)
- Téléchargement offline (ImuDrive local cache)

#### In-chat

- Carte rich preview : durée, épisode, bouton "Écouter"
- Timestamp partageable avec seek automatique : `imuchat://podcast/xxx?t=832`
- **Podcast Room** : écouter ensemble un épisode (voir Phase 6)

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/podcasts/page.tsx` | Page principale — catalogue + abonnements |
| `web-app/src/app/podcasts/[showId]/page.tsx` | Fiche émission + liste épisodes |
| `web-app/src/app/podcasts/[showId]/[episodeId]/page.tsx` | Fiche épisode + transcription |
| `mobile/app/podcasts/index.tsx` | ← consolider l'existant |
| `platform-core/src/modules/podcasts/podcast.service.ts` | RSS parser + API podcasts |
| `platform-core/src/modules/podcasts/transcript.service.ts` | Whisper + Alice résumé |

**Tests :** ~42

---

### Sprint 7 (S13–S14) — Clips Podcasts + In-chat enrichi

**Objectif :** Extraire des clips partageables, enrichir l'expérience in-chat.

#### Fonctionnalités

- **Clips podcast** : extraire 15–90s d'un épisode → partage ImuFeed ou DM (FFmpeg server-side)
- Recherche full-text dans les transcriptions (Supabase FTS sur `podcast_transcripts`)
- "Chapitres communautaires" : les utilisateurs peuvent proposer des chapitres sur un épisode
- Recommandations Alice : suggestions personnalisées basées sur l'historique

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `platform-core/src/modules/podcasts/clips.service.ts` | FFmpeg clip extraction |
| `platform-core/src/modules/podcasts/chapters.service.ts` | Chapitres communautaires |
| `web-app/src/app/api/podcasts/clip/route.ts` | Route API clip generation |

**Tests :** ~26

---

## 📚 Phase 3 — ImuBooks (Semaines 15–20)

### Sprint 8 (S15–S16) — Liseuse EPUB Web

**Objectif :** Lecteur EPUB complet dans le navigateur.

#### Supabase — Tables

```sql
CREATE TABLE books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id    UUID REFERENCES media_library(id) ON DELETE CASCADE,
  isbn        TEXT,
  language    TEXT DEFAULT 'fr',
  chapters    JSONB DEFAULT '[]',      -- { id, title, href, order }
  word_count  INT,
  estimated_read_time_min INT
);

CREATE TABLE book_annotations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  cfi         TEXT NOT NULL,           -- EPUB CFI (position précise)
  selected_text TEXT NOT NULL,
  note        TEXT,
  color       TEXT DEFAULT 'yellow' CHECK (color IN ('yellow','green','blue','pink','red')),
  shared      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fonctionnalités

- Lecteur EPUB via `epub.js` (web) — pagination ou scroll continu, configurable
- Thème jour / nuit / sépia, taille de police ajustable (6 tailles), 4 familles de polices
- Sync de position cross-platform via `media_progress`
- Annotations surlignées + notes marginales → `book_annotations`
- Table des matières interactive
- Recherche dans le livre (epub.js built-in)
- Upload EPUB/MOBI depuis l'appareil → ImuDrive

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/library/books/page.tsx` | Bibliothèque livres |
| `web-app/src/app/library/books/[bookId]/read/page.tsx` | Lecteur EPUB |
| `ui-kit/src/components/readers/EpubReader.tsx` | Composant epub.js wrapper |
| `ui-kit/src/components/readers/ReaderToolbar.tsx` | Barre outils (thème, police, chapitres) |
| `platform-core/src/modules/books/books.service.ts` | Service livres |
| `platform-core/src/modules/books/annotations.service.ts` | Annotations + partage |

**Tests :** ~40

---

### Sprint 9 (S17–S18) — Liseuse Mobile + Livres Audio

**Objectif :** Portage mobile de la liseuse + premier support livres audio.

#### Mobile

- `react-native-epub-reader` (WebView Expo) ou rendu natif via `epub.js` + WebView
- Swipe entre pages (horizontal) ou scroll vertical selon préférence
- Contrôles gestuels : pinch to zoom, tap zones (précédent / menu / suivant)
- Bookmark rapide : appui long sur un mot
- Téléchargement offline (ImuDrive local)

#### Livres audio (`/library/audiobooks`)

- Lecteur audio dédié avec player unifié (`audio-player.ts` de Phase 0)
- Chapitres navigables, vitesse × 0.5 → × 3
- Synchronisation livre/audio : si le même titre existe en EPUB et audio, navigation liée
- Minuterie d'arrêt automatique (sleep timer)

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `mobile/app/library/books/index.tsx` | Bibliothèque mobile |
| `mobile/app/library/books/[bookId]/read.tsx` | Liseuse mobile |
| `web-app/src/app/library/audiobooks/page.tsx` | Section livres audio |
| `platform-core/src/modules/books/audiobook.service.ts` | Service livres audio |

**Tests :** ~34

---

### Sprint 10 (S19–S20) — In-Chat Books + Clubs de lecture

**Objectif :** Intégrer les livres dans le flux social.

#### Fonctionnalités in-chat

- Partage d'un livre → carte avec couverture, résumé, note communautaire, bouton "Lire ensemble"
- **Citation stylisée** : partager un passage surligné → rendu `<BookQuoteCard>` dans le chat
- Annotations partagées avec un ami : l'ami voit le surlignage en temps réel

#### Clubs de lecture

- Créer un club de lecture dans un groupe ImuChat existant
- Livre commun : progression partagée, objectif de pages hebdomadaire
- Discussion ancrée par chapitre : les messages du groupe sont liés à un chapitre spécifique
- Alice comme "animateur" : génère des questions de discussion par chapitre

```sql
CREATE TABLE book_clubs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  book_id    UUID REFERENCES books(id) ON DELETE SET NULL,
  goal_pages_per_week INT DEFAULT 50,
  started_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `ui-kit/src/components/chat/BookQuoteCard.tsx` | Carte citation stylisée |
| `platform-core/src/modules/books/book-clubs.service.ts` | Clubs de lecture |
| `platform-core/src/modules/books/shared-annotations.service.ts` | Annotations temps réel (Supabase realtime) |

**Tests :** ~28

---

## 🎭 Phase 4 — ImuComics & Manga (Semaines 21–26)

### Sprint 11 (S21–S22) — Lecteur CBZ/CBR Web

**Objectif :** Lecteur de BD/Comics avec support des formats archives.

#### Supabase — Tables

```sql
CREATE TABLE comics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id     UUID REFERENCES media_library(id) ON DELETE CASCADE,
  format       TEXT CHECK (format IN ('cbz','cbr','epub','pdf','webtoon')) NOT NULL,
  reading_dir  TEXT DEFAULT 'ltr' CHECK (reading_dir IN ('ltr','rtl')),  -- RTL pour manga
  chapters     JSONB DEFAULT '[]',     -- { id, title, pages: [url], order }
  total_pages  INT
);

CREATE TABLE comic_ratings (
  user_id   UUID REFERENCES auth.users NOT NULL,
  comic_id  UUID REFERENCES comics(id) ON DELETE CASCADE,
  rating    SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comic_id)
);
```

#### Fonctionnalités

- Extraction d'archives CBZ/CBR côté serveur (JSZip + unrar-js)
- **Mode planche** : une page centrée, navigation par flèches / swipe
- **Mode double page** : deux pages côte à côte (format landscape)
- **Mode manga (RTL)** : détection automatique par métadonnée langue + toggle manuel
- Zoom tactile fluide (pinch-to-zoom sur mobile via react-native-image-zoom-viewer)
- Téléchargement offline de chapitres complets
- Import CBZ/CBR depuis l'appareil → ImuDrive
- Progression automatique par chapitre

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/library/comics/page.tsx` | Bibliothèque comics |
| `web-app/src/app/library/comics/[comicId]/read/page.tsx` | Lecteur web |
| `ui-kit/src/components/readers/ComicReader.tsx` | Lecteur comics (modes planche/double/RTL) |
| `ui-kit/src/components/readers/ComicControls.tsx` | Contrôles navigation + zoom |
| `platform-core/src/modules/comics/comics.service.ts` | Service + extraction archives |
| `platform-core/src/modules/comics/chapters.service.ts` | Gestion chapitres + progression |

**Tests :** ~42

---

### Sprint 12 (S23–S24) — Webtoon Reader + Mobile

**Objectif :** Support du format Webtoon (scroll vertical infini) et portage mobile.

#### Webtoon Reader

- Scroll vertical continu avec lazy loading des images
- Barre de progression latérale indiquant la position dans le chapitre
- Auto-scroll optionnel (vitesse configurable)
- Transition fluide entre chapitres (sans rechargement de page)
- Optimisation : images chargées 3 planches en avance, libérées derrière

#### Mobile

- Planche unique en swipe horizontal (manga/comics classiques)
- Scroll vertical infini pour Webtoon
- Barre d'outils masquable (tap au centre de l'écran)
- Gestes : swipe → page suivante, pinch → zoom, double tap → zoom x2

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/library/comics/[comicId]/read/webtoon/page.tsx` | Mode Webtoon scroll |
| `ui-kit/src/components/readers/WebtoonReader.tsx` | Lecteur scroll vertical infini |
| `mobile/app/library/comics/index.tsx` | Bibliothèque comics mobile |
| `mobile/app/library/comics/[comicId]/read.tsx` | Lecteur mobile (planche + webtoon) |

**Tests :** ~36

---

### Sprint 13 (S25–S26) — In-Chat Comics + Feature Sticker

**Objectif :** Intégration sociale et feature virale de conversion en stickers.

#### In-chat

- Partage d'un chapitre → carousel preview de 3 planches en horizontal
- **Réaction par planche** : dans un chat partagé, épingler une réaction sur une page spécifique
- Format spoiler : planches flouées, tap pour révéler (similaire au spoiler Discord)
- Note communautaire visible sur la carte partagée

#### 🎴 Feature signature — Stickers depuis BD

```typescript
// Workflow : sélection planche → recadrage → génération sticker → Store ImuChat
interface StickerFromComicFlow {
  selectPlanche(comicId: string, page: number): Promise<ImageBlob>;
  cropRegion(blob: ImageBlob, region: CropRect): Promise<ImageBlob>;
  addBackground(blob: ImageBlob, style: 'transparent' | 'rounded' | 'circle'): Promise<ImageBlob>;
  publishToStore(sticker: ImageBlob, meta: StickerMeta): Promise<string>;  // → Store review
}
```

- Sélection d'une vignette/case dans le lecteur
- Outil de recadrage léger
- Soumission au Store ImuChat (workflow review admin)
- Si droits vérifiés : disponible dans le pack stickers de l'utilisateur
- Alice suggère les meilleures cases pour en faire un sticker

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `ui-kit/src/components/chat/ComicPreviewCard.tsx` | Carte BD in-chat avec spoiler |
| `ui-kit/src/components/comics/PlanheReaction.tsx` | Réactions par planche |
| `ui-kit/src/components/comics/StickerCreator.tsx` | Outil création sticker depuis BD |
| `platform-core/src/modules/comics/sticker-creator.service.ts` | Backend génération sticker |

**Tests :** ~30

---

## 📄 Phase 5 — ImuDocs Reader PDF (Semaines 27–30)

### Sprint 14 (S27–S28) — Lecteur PDF standalone + Annotations

**Objectif :** Viewer PDF complet avec annotations multi-utilisateurs.

#### Supabase — Tables

```sql
CREATE TABLE pdf_annotations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  media_id     UUID REFERENCES media_library(id) ON DELETE CASCADE,
  page_num     INT NOT NULL,
  type         TEXT CHECK (type IN ('highlight','comment','arrow','text')) NOT NULL,
  position     JSONB NOT NULL,          -- { x, y, width, height }
  color        TEXT DEFAULT '#FBBF24',
  content      TEXT,
  shared       BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### Fonctionnalités

- Viewer PDF via `pdf.js` (web) / WebView (mobile)
- Navigation : miniatures pages, recherche full-text, bookmarks
- Annotations : surlignage, commentaire, flèche, texte libre
- Export annotations → Markdown ou JSON
- **Annotations partagées** (Supabase realtime) : plusieurs utilisateurs annotent le même document en temps réel (type Figma comments)
- Intégration ImuOffice : bouton "Convertir en ImuDoc" → ouvre en mode édition

#### In-chat

- Prévisualisation inline (première page + miniature), bouton "Voir tout"
- Annotation partagée ancrable : commenter page 4 → lien direct dans le chat
- Signature PDF légère dans le chat (workflow : `pdf-service.ts` Phase ImuOffice)

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/library/pdf/page.tsx` | Bibliothèque PDF |
| `web-app/src/app/library/pdf/[docId]/view/page.tsx` | Viewer PDF |
| `ui-kit/src/components/readers/PdfViewer.tsx` | Wrapper pdf.js |
| `ui-kit/src/components/readers/AnnotationLayer.tsx` | Couche annotations SVG |
| `platform-core/src/modules/pdf/pdf-reader.service.ts` | Service PDF + annotations |

**Tests :** ~40

---

### Sprint 15 (S29–S30) — Desktop PDF + Mobile PDF

**Objectif :** Compléter la couverture plateforme du lecteur PDF.

#### Desktop (Electron)

- Renderer PDF natif via `pdfium` ou via `pdf.js` dans WebView Electron
- Multi-onglets : ouvrir plusieurs PDF simultanément
- Impression native (electron `printToPDF`)
- Drag & drop de fichiers PDF depuis le bureau vers ImuDrive

#### Mobile

- WebView avec pdf.js adapté mobile
- Annotation au doigt (Apple Pencil / stylus compatible)
- Partage natif iOS/Android depuis le viewer
- Téléchargement offline

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `desktop-app/src/modules/pdf/pdf-viewer.ts` | Service PDF desktop |
| `desktop-app/src/pages/PdfViewerPage.tsx` | Page viewer desktop |
| `mobile/app/library/pdf/index.tsx` | Bibliothèque PDF mobile |
| `mobile/app/library/pdf/[docId]/view.tsx` | Viewer mobile |

**Tests :** ~32

---

## 🔗 Phase 6 — Transversal : Watch Party, ImuClips, Desktop (Semaines 31–36)

### Sprint 16 (S31–S32) — Watch Party universelle

**Objectif :** Un seul composant `<WatchPartyRoom />` réutilisable pour tous les médias.

#### Architecture `sync-engine.ts`

```typescript
// Socket.IO room partagée entre tous les participants
interface WatchPartySyncEngine {
  // Commandes media universelles
  play(position: MediaPosition): void;
  pause(position: MediaPosition): void;
  seek(position: MediaPosition): void;
  nextChapter(): void;

  // Synchronisation
  onStateChange(cb: (state: PartyState) => void): void;
  onMemberJoined(cb: (member: Member) => void): void;
  onMemberLeft(cb: (member: Member) => void): void;

  // Réactions live
  sendReaction(emoji: string): void;
  onReaction(cb: (reaction: LiveReaction) => void): void;
}

type MediaPosition =
  | { type: 'audio'; ms: number }
  | { type: 'book'; cfi: string }
  | { type: 'comic'; chapter: string; page: number }
  | { type: 'pdf'; page: number };
```

#### Fonctionnalités

- Watch Party Audio (Musique + Podcasts) : lecture synchronisée, chat latéral
- Watch Party Livre : lecture planche par planche synchronisée, commentaires par page
- Watch Party BD : planche par planche, réactions live flottantes
- Émojis flottants à l'écran (style YouTube Live)
- Hôte contrôle la navigation, les autres suivent (mode "cinéma") ou naviguent librement (mode "exploration")
- Invitation via lien `imuchat://party/[roomId]` ou depuis DM

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `packages/@imuchat/media-core/src/watch-party/sync-engine.ts` | Moteur sync Socket.IO |
| `ui-kit/src/components/watch-party/WatchPartyRoom.tsx` | Composant universel |
| `ui-kit/src/components/watch-party/PartyChat.tsx` | Chat latéral inline |
| `ui-kit/src/components/watch-party/LiveReactions.tsx` | Réactions flottantes |
| `platform-core/src/modules/watch-party/watch-party.gateway.ts` | Socket.IO gateway |

**Tests :** ~36

---

### Sprint 17 (S33–S34) — ImuClips + Recommandations Alice

**Objectif :** Système de bookmarks intelligents cross-média et moteur de recommandations.

#### ImuClips

- Épingler n'importe quel moment : timestamp audio, page livre, planche BD, page PDF
- Vue unifiée `/library/clips` : tous les bookmarks organisés par Alice en thèmes automatiques
- Tags manuels + tags suggérés par Alice
- Partage d'un clip → carte `<ImuClipCard>` dans le chat avec accès direct au contenu

#### Recommandations Alice

```typescript
// Appel Claude API streaming via SSE
interface AliceMediaEngine {
  // Basé sur l'historique de lecture
  getRecommendations(userId: string, type: MediaType, limit: number): Promise<MediaItem[]>;
  
  // "Parce que tu as lu X, tu aimeras Y"
  getSimilarItems(mediaId: string, limit: number): Promise<MediaItem[]>;
  
  // Pour les clubs de lecture
  generateDiscussionQuestions(bookId: string, chapterId: string): AsyncIterable<string>;
  
  // Résumé épisode podcast
  summarizeEpisode(episodeId: string): AsyncIterable<string>;
}
```

#### ImuLearn Reader (version légère)

- Mode "lecture enrichie" sur les ebooks : Alice génère des flashcards depuis un chapitre sélectionné
- Quiz intégré au chapitre (5 questions générées par Alice)
- Progression certifiée avec badge ImuChat

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `web-app/src/app/library/clips/page.tsx` | Vue ImuClips unifiée |
| `ui-kit/src/components/media/ImuClipCard.tsx` | Carte clip in-chat |
| `platform-core/src/modules/alice/media-engine.service.ts` | Alice pour les médias |
| `ui-kit/src/components/readers/LearnMode.tsx` | Flashcards + quiz ImuLearn |

**Tests :** ~32

---

### Sprint 18 (S35–S36) — Desktop Media + Polish global

**Objectif :** Couverture Desktop complète, polish UX et intégrations Store.

#### Desktop (Electron → Tauri)

- Section `/music` complète sur Desktop (Electron)
- Section `/podcasts` complète sur Desktop
- Section `/library` (books + comics + PDF) sur Desktop
- Mini-player système : s'intègre à la barre de titre Electron (media keys OS)
- Drag & drop fichiers (EPUB, CBZ, PDF, MP3) depuis le bureau
- Fenêtre dédiée pour le lecteur (mode multi-fenêtre)

#### Polish global

- i18n complète (fr/en/ja) de tous les modules ImuMedia
- Age-tier enforcement :
  - KIDS : playlist uniquement curatée, BD uniquement KIDS, pas de podcasts adultes
  - JUNIOR : idem + livres filtrés par tranches d'âge
  - TEEN : accès étendu avec parental review
  - ADULT : accès complet
- Intégrations Store ImuChat :
  - Packs de manga/BD vendus en ImuCoins
  - Playlists thématiques premium
  - Extensions Alice pour les lecteurs (ex. "Mode Traducteur" pour lire manga en VO)
- Accessibilité : contraste AA/AAA, navigation clavier complète dans tous les lecteurs

**Fichiers créés**

| Fichier | Description |
|---------|-------------|
| `desktop-app/src/pages/MusicPage.tsx` | Section musique desktop |
| `desktop-app/src/pages/PodcastsPage.tsx` | Section podcasts desktop |
| `desktop-app/src/pages/LibraryPage.tsx` | Bibliothèque unifiée desktop |
| `desktop-app/src/modules/media/media-keys.ts` | Media keys OS (Electron) |
| `platform-core/src/modules/media/age-tier.guard.ts` | Guard age-tier pour tous les médias |

**Tests :** ~44

---

## 📊 Planning par plateforme

### Web-app

| Sprint | Route ajoutée |
|--------|--------------|
| S3 | `/music`, `/music/[playlistId]`, `/music/player` |
| S6 | `/podcasts`, `/podcasts/[showId]`, `/podcasts/[showId]/[episodeId]` |
| S8 | `/library/books`, `/library/books/[bookId]/read` |
| S10 | `/library/books/clubs` |
| S11 | `/library/comics`, `/library/comics/[comicId]/read` |
| S14 | `/library/pdf`, `/library/pdf/[docId]/view` |
| S17 | `/library/clips` |

### Mobile

| Sprint | Écran ajouté |
|--------|-------------|
| S3 | `music/index.tsx` (consolider existant) + `music/player.tsx` |
| S6 | `podcasts/index.tsx` (consolider existant) |
| S9 | `library/books/index.tsx`, `library/books/[bookId]/read.tsx` |
| S12 | `library/comics/index.tsx`, `library/comics/[comicId]/read.tsx` |
| S15 | `library/pdf/index.tsx`, `library/pdf/[docId]/view.tsx` |

### Desktop

| Sprint | Page ajoutée |
|--------|-------------|
| S35 | `MusicPage`, `PodcastsPage`, `LibraryPage` (books + comics + PDF) |

---

## 🔢 Résumé des livrables

| Phase | Sprints | Fichiers créés | Tests estimés |
|-------|:-------:|:--------------:|:-------------:|
| Phase 0 — Fondations | 2 | ~12 | ~40 |
| Phase 1 — ImuMusic | 3 | ~18 | ~90 |
| Phase 2 — ImuPodcasts | 2 | ~12 | ~68 |
| Phase 3 — ImuBooks | 3 | ~16 | ~102 |
| Phase 4 — ImuComics | 3 | ~14 | ~108 |
| Phase 5 — ImuDocs Reader | 2 | ~12 | ~72 |
| Phase 6 — Transversal | 3 | ~16 | ~112 |
| **Total** | **18** | **~100** | **~592** |

---

## ⚠️ Risques identifiés

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|:-----------:|:------:|-----------|
| R1 | Droits DRM pour EPUB commerciaux | 🔴 Haute | 🔴 Haut | Limiter au contenu libre + imports personnels dans MVP ; DRM (Adobe) en V2 |
| R2 | Extraction CBR (RAR) côté serveur | 🟡 Moyenne | 🟡 Moyen | Préférer CBZ (ZIP) dans un premier temps ; `unrar-js` WASM pour CBR |
| R3 | Spotify Web Playback SDK — requires Premium | 🔴 Haute | 🟡 Moyen | MVP en Niveau 1 uniquement (affichage + lien externe) |
| R4 | Performances Webtoon (images très haute résolution) | 🟡 Moyenne | 🟡 Moyen | Lazy loading aggressif + compression serveur à 85% |
| R5 | Transcription Whisper — coût compute | 🟡 Moyenne | 🟡 Moyen | Génération à la demande + cache `podcast_transcripts` |
| R6 | Watch Party sync — latence mobile | 🟡 Moyenne | 🟡 Moyen | Tolérance ±500ms + resync automatique |
| R7 | Droits stickers depuis BD | 🔴 Haute | 🔴 Haut | Review admin obligatoire + déclaration droits au moment de l'upload |

---

## 🔗 Dépendances externes

| Module | Dépend de | Note |
|--------|-----------|------|
| ImuMusic — Spotify | `platform-core/auth/oauth.service.ts` | OAuth déjà en place |
| Watch Party | `platform-core/chat/socket.gateway.ts` | Socket.IO existant — étendre |
| ImuBooks — Alice | `platform-core/alice/alice.service.ts` | Claude API streaming |
| ImuDocs Reader → ImuOffice | `imuoffice/packages/@imuchat/office-core` | Conversion PDF → ImuDoc |
| Age-tier guard | `platform-core/guardian/age-tier.service.ts` | ImuGuardian Phase 1 |
| ImuClips | `@imuchat/media-core` (Phase 0) | Bloquer sur Phase 0 |

---

*Document généré le 15 mars 2026 — ImuChat Media Suite Roadmap v1.0*
