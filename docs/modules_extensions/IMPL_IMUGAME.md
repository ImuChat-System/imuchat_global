# 🎮 ImuGame — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🔴 P0 — Viral, fort engagement social  
> **Dépendances** : `chat` (core), `socket.io`, `wallet` (ImuCoin optionnel)

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Architecture générale](#2-architecture-générale)
3. [Schéma de base de données](#3-schéma-de-base-de-données)
4. [API & Routes](#4-api--routes)
5. [Mapping des écrans](#5-mapping-des-écrans)
6. [Catalogue de jeux](#6-catalogue-de-jeux)
7. [Moteur temps réel (Socket.IO)](#7-moteur-temps-réel-socketio)
8. [Intégration Chat](#8-intégration-chat)
9. [Système de scores & récompenses](#9-système-de-scores--récompenses)
10. [Plan d'implémentation](#10-plan-dimplémentation)

---

## 1. Vision & Positionnement

ImuGame est une **salle de mini-jeux multijoueurs** jouable directement depuis une conversation ImuChat. Pas besoin de quitter l'app — on défie ses amis en 2 taps et on joue en temps réel dans une interface flottante ou plein écran.

**Objectif :** créer des moments de jeu spontanés qui augmentent le temps passé dans l'app et renforcent les liens sociaux.

**Modèle de référence :** iMessage Games, Discord Activities, WeChat Games.

**Jeux du lancement :**
- 🎯 Quiz Flash (questions culture générale / thèmes)
- ✏️ SketchIt (dessin + devinette)
- 🔴 Puissance 4
- 🎲 Dés & Défis
- ❓ Vérité ou Défi (adapté social)
- 🧠 Blind Test Musical

---

## 2. Architecture générale

```
ImuGame
│
├── Game Lobby Layer
│   ├── GameContext (React)
│   ├── useGame hook
│   └── game-store (Zustand)
│
├── Game Engine Layer
│   ├── GameRoom (Socket.IO room)
│   ├── GameStateMachine
│   └── games/
│       ├── quiz/
│       ├── sketch/
│       ├── connect4/
│       └── blindtest/
│
├── Routes (Next.js)
│   ├── /games/                    — Hub ImuGame
│   ├── /games/lobby/[roomId]      — Salle d'attente
│   └── /games/play/[roomId]       — Session de jeu active
│
├── API Routes
│   ├── /api/games/rooms           — CRUD rooms
│   ├── /api/games/scores          — Leaderboards
│   └── /api/games/questions       — Banque de questions (Quiz)
│
└── Real-time (Socket.IO)
    ├── game:join
    ├── game:start
    ├── game:action
    ├── game:state_update
    └── game:end
```

**Stack :** Next.js 16 · React 19 · TypeScript 5 · Socket.IO · Supabase · Zustand · Canvas API (SketchIt)

---

## 3. Schéma de base de données

```sql
-- ================================================================
-- IMUGAME — SCHÉMA SUPABASE
-- ================================================================

-- 1. Catalogue des jeux disponibles
CREATE TABLE IF NOT EXISTS public.game_catalog (
  id            TEXT PRIMARY KEY, -- 'quiz', 'sketch', 'connect4', etc.
  name          TEXT NOT NULL,
  description   TEXT,
  emoji         TEXT NOT NULL,
  min_players   INTEGER NOT NULL DEFAULT 2,
  max_players   INTEGER NOT NULL DEFAULT 8,
  duration_sec  INTEGER, -- durée estimée en secondes
  is_active     BOOLEAN NOT NULL DEFAULT true,
  requires_imucoin INTEGER DEFAULT 0, -- coût en ImuCoin (0 = gratuit)
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Données initiales
INSERT INTO public.game_catalog VALUES
  ('quiz',      'Quiz Flash',       'Questions rapides en équipes',  '🎯', 2, 8,  300, true, 0),
  ('sketch',    'SketchIt',         'Dessin + devinette',            '✏️', 2, 8,  420, true, 0),
  ('connect4',  'Puissance 4',      'Alignez 4 jetons',              '🔴', 2, 2,  180, true, 0),
  ('blindtest', 'Blind Test',       'Trouvez le titre',              '🎵', 2, 8,  300, true, 0),
  ('dice',      'Dés & Défis',      'Lancez les dés, relevez le défi','🎲', 2, 6,  600, true, 0),
  ('truth',     'Vérité ou Défi',   'Le classique revisité',         '❓', 2, 8,  null,true, 0);

-- 2. Sessions de jeu
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id       TEXT NOT NULL REFERENCES public.game_catalog(id),
  chat_id       UUID REFERENCES public.chats(id),
  host_id       UUID NOT NULL REFERENCES public.profiles(id),
  status        TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN (
    'waiting', 'starting', 'active', 'finished', 'cancelled'
  )),
  config        JSONB DEFAULT '{}', -- paramètres spécifiques au jeu
  max_players   INTEGER NOT NULL DEFAULT 8,
  winner_id     UUID REFERENCES public.profiles(id),
  room_code     TEXT UNIQUE, -- code 6 caractères pour rejoindre
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index pour lookup rapide par code
CREATE INDEX idx_game_sessions_room_code ON public.game_sessions(room_code);
CREATE INDEX idx_game_sessions_chat_id  ON public.game_sessions(chat_id);

-- 3. Participants d'une session
CREATE TABLE IF NOT EXISTS public.game_participants (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  score         INTEGER NOT NULL DEFAULT 0,
  rank          INTEGER,
  is_ready      BOOLEAN NOT NULL DEFAULT false,
  joined_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- 4. Historique des actions en jeu (pour replay/audit)
CREATE TABLE IF NOT EXISTS public.game_actions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  action_type   TEXT NOT NULL, -- 'answer', 'draw_stroke', 'place_token', etc.
  payload       JSONB NOT NULL DEFAULT '{}',
  round         INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 5. Banque de questions Quiz
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category      TEXT NOT NULL,
  difficulty    TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question      TEXT NOT NULL,
  options       JSONB NOT NULL, -- ["opt1", "opt2", "opt3", "opt4"]
  correct_index INTEGER NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation   TEXT,
  language      TEXT NOT NULL DEFAULT 'fr',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 6. Scores globaux & classements
CREATE TABLE IF NOT EXISTS public.game_leaderboard (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  game_id       TEXT NOT NULL REFERENCES public.game_catalog(id),
  total_score   INTEGER NOT NULL DEFAULT 0,
  games_played  INTEGER NOT NULL DEFAULT 0,
  games_won     INTEGER NOT NULL DEFAULT 0,
  best_score    INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- ================================================================
-- FONCTIONS
-- ================================================================

-- Générer un code de room unique (6 chars alphanumériques)
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Mettre à jour le leaderboard après une partie
CREATE OR REPLACE FUNCTION public.update_game_leaderboard()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    INSERT INTO public.game_leaderboard (user_id, game_id, total_score, games_played, games_won, best_score)
    SELECT
      gp.user_id,
      NEW.game_id,
      gp.score,
      1,
      CASE WHEN gp.user_id = NEW.winner_id THEN 1 ELSE 0 END,
      gp.score
    FROM public.game_participants gp
    WHERE gp.session_id = NEW.id
    ON CONFLICT (user_id, game_id) DO UPDATE SET
      total_score   = game_leaderboard.total_score + EXCLUDED.total_score,
      games_played  = game_leaderboard.games_played + 1,
      games_won     = game_leaderboard.games_won + EXCLUDED.games_won,
      best_score    = GREATEST(game_leaderboard.best_score, EXCLUDED.best_score),
      updated_at    = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_leaderboard
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_game_leaderboard();

-- RLS
ALTER TABLE public.game_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_actions      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_view_active_sessions" ON public.game_sessions
  FOR SELECT USING (status IN ('waiting', 'active'));

CREATE POLICY "participants_can_view_actions" ON public.game_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_participants
      WHERE session_id = game_actions.session_id AND user_id = auth.uid()
    )
  );
```

---

## 4. API & Routes

### 4.1 Routes Next.js API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/games/catalog` | Liste des jeux disponibles |
| `POST` | `/api/games/rooms` | Créer une room (retourne room_code) |
| `GET` | `/api/games/rooms/[roomId]` | État de la room |
| `POST` | `/api/games/rooms/join` | Rejoindre via room_code |
| `DELETE` | `/api/games/rooms/[roomId]` | Annuler / quitter |
| `GET` | `/api/games/leaderboard/[gameId]` | Top 50 mondial |
| `GET` | `/api/games/leaderboard/friends` | Top amis |
| `GET` | `/api/games/questions` | Questions quiz (paginated, filterable) |
| `GET` | `/api/games/history` | Historique de l'utilisateur |

### 4.2 Service TypeScript

```typescript
// services/game-api.ts

export async function createGameRoom(payload: {
  game_id: string;
  chat_id?: string;
  max_players?: number;
  config?: Record<string, unknown>;
}): Promise<{ session_id: string; room_code: string }> {
  const code = await generateRoomCode();
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ ...payload, room_code: code, host_id: currentUser.id })
    .select('id, room_code')
    .single();
  if (error) throw error;
  return { session_id: data.id, room_code: data.room_code };
}

export async function joinByCode(roomCode: string): Promise<GameSession> {
  const { data: session } = await supabase
    .from('game_sessions')
    .select('*, game_participants(*)')
    .eq('room_code', roomCode.toUpperCase())
    .eq('status', 'waiting')
    .single();
  if (!session) throw new Error('Room introuvable ou partie déjà commencée');
  await supabase.from('game_participants').insert({ session_id: session.id, user_id: currentUser.id });
  return session;
}
```

---

## 5. Mapping des écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/games` | `GameHub` | Catalogue + parties actives + classement |
| `/games/new` | `GamePicker` | Choisir un jeu + configurer |
| `/games/lobby/[id]` | `GameLobby` | Salle d'attente — joueurs, code, prêt |
| `/games/play/[id]` | `GamePlayer` | Interface de jeu (router par game_id) |
| `/games/results/[id]` | `GameResults` | Scores finaux + récompenses ImuCoin |
| `/games/leaderboard` | `GameLeaderboard` | Classements global + amis |
| `/games/history` | `GameHistory` | Parties jouées |

---

## 6. Catalogue de jeux

### 🎯 Quiz Flash

**Fonctionnement :**
1. 10 questions en 30s chacune
2. Score basé sur vitesse de réponse (max 1000 pts/question)
3. Catégories : Culture générale, Cinéma, Géographie, Science, Sport, Musique
4. Mode équipes possible (2v2, 4v4)

**State machine :**
```
WAITING → STARTING (countdown 3s) → QUESTION → ANSWER_REVEAL → 
(×10) → FINAL_SCORES → FINISHED
```

### ✏️ SketchIt

**Fonctionnement :**
1. Un joueur dessine (60s), les autres devinent
2. Rotation des rôles à chaque round
3. Score : dessinateur gagne des points si deviné, devineurs gagnent selon rapidité

**Composant clé :** `SketchCanvas` (Canvas API + événements touch/mouse)

```typescript
// Canvas temps réel — strokes envoyés via Socket.IO
interface DrawStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser' | 'fill';
}
```

### 🔴 Puissance 4

**Fonctionnement :**
- Grille 7×6, tour par tour
- Détection victoire (horizontal, vertical, diagonal)

```typescript
type Connect4State = {
  board: (0 | 1 | 2)[][]; // 0=vide, 1=joueur1, 2=joueur2
  current_player: 1 | 2;
  winner: 0 | 1 | 2;
  last_move?: { col: number; row: number };
};
```

---

## 7. Moteur temps réel (Socket.IO)

### 7.1 Events

```typescript
// Client → Serveur
socket.emit('game:join',    { session_id, user_id });
socket.emit('game:ready',   { session_id });
socket.emit('game:action',  { session_id, action_type, payload });
socket.emit('game:leave',   { session_id });

// Serveur → Clients
socket.on('game:player_joined',  (participant: GameParticipant) => {});
socket.on('game:state_update',   (state: GameState) => {});
socket.on('game:round_start',    (round: RoundData) => {});
socket.on('game:action_result',  (result: ActionResult) => {});
socket.on('game:game_over',      (results: GameResults) => {});

// Spécifique SketchIt
socket.on('sketch:stroke',      (stroke: DrawStroke) => {});
socket.on('sketch:word_hint',   (hint: string) => {});
socket.on('sketch:correct',     (guess: { user_id: string; word: string }) => {});
```

### 7.2 Room management

```typescript
// server/socket/game-handler.ts
io.on('connection', (socket) => {
  socket.on('game:join', async ({ session_id, user_id }) => {
    await socket.join(`game:${session_id}`);
    const participants = await getParticipants(session_id);
    io.to(`game:${session_id}`).emit('game:player_joined', { participants });
    
    // Auto-start si tous prêts
    if (participants.every(p => p.is_ready) && participants.length >= 2) {
      await startGame(session_id);
      io.to(`game:${session_id}`).emit('game:state_update', await getGameState(session_id));
    }
  });
});
```

---

## 8. Intégration Chat

Depuis n'importe quel chat ou groupe :
1. Bouton **"+"** → **"Jouer"** → picker du jeu
2. Message spécial `game_invite` envoyé dans la conversation
3. Composant `GameInviteBubble` avec bouton "Rejoindre"
4. La partie s'ouvre dans un modal/overlay au-dessus du chat

**Message schema :**
```typescript
{
  type: 'game_invite',
  metadata: {
    session_id: string;
    game_id: string;
    game_name: string;
    game_emoji: string;
    room_code: string;
    host_username: string;
    player_count: number;
    max_players: number;
    status: 'waiting' | 'active';
  }
}
```

---

## 9. Système de scores & récompenses

| Événement | Récompense ImuCoin |
|-----------|-------------------|
| Première partie du jour | +5 IC |
| Victoire | +10 IC |
| Score parfait (Quiz) | +20 IC |
| 3 victoires consécutives | +30 IC |
| Inviter un ami qui joue | +15 IC |

**Intégration Gamification :**
- Badge "Quiz Master" : 50 parties quiz gagnées
- Badge "Picasso" : 20 parties SketchIt gagnées
- Badge "Invincible" : 10 victoires consécutives

---

## 10. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + catalog + sessions + leaderboard | 3 jours |
| **S2** | Socket.IO game handler + room management | 4 jours |
| **S3** | GameHub + GameLobby + GamePicker (UI) | 3 jours |
| **S4** | Jeu Quiz Flash (complet, temps réel) | 5 jours |
| **S5** | Jeu Puissance 4 (complet, temps réel) | 3 jours |
| **S6** | Jeu SketchIt (Canvas API + Socket.IO) | 5 jours |
| **S7** | GameResults + Leaderboard + récompenses IC | 3 jours |
| **S8** | Intégration Chat (GameInviteBubble) | 2 jours |
| **S9** | Jeux Blind Test + Dés & Défis + Vérité | 4 jours |
| **S10** | Tests + polish + mobile responsive | 4 jours |

**Durée totale estimée : ~6 semaines**

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
