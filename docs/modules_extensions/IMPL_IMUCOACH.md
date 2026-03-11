# 🤖 ImuCoach — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🟠 P1 — Différenciateur IA, rétention forte  
> **Dépendances** : `ai-assistant` (Claude API), `wallet` (ImuCoin), `gamification`

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Architecture générale](#2-architecture-générale)
3. [Catalogue de personas Coaches](#3-catalogue-de-personas-coaches)
4. [Schéma de base de données](#4-schéma-de-base-de-données)
5. [API & Routes](#5-api--routes)
6. [Prompt Engineering](#6-prompt-engineering)
7. [Mapping des écrans](#7-mapping-des-écrans)
8. [Système de sessions & suivi](#8-système-de-sessions--suivi)
9. [Plan d'implémentation](#9-plan-dimplémentation)

---

## 1. Vision & Positionnement

ImuCoach est une **suite d'assistants IA spécialisés par domaine**, chacun avec sa propre personnalité, son expertise, et son approche. L'utilisateur choisit son coach, engage une conversation, fixe des objectifs, et revient régulièrement pour être guidé.

**Différence avec `ai-assistant` générique :**  
L'AI Assistant existant est un assistant polyvalent. ImuCoach est **spécialisé** : chaque coach a un persona fort, une méthode, un vocabulaire propre, et une mémoire de l'historique de l'utilisateur dans son domaine.

**Modèle économique :**
- 1 coach gratuit au choix (accès limité à 10 messages/jour)
- Accès illimité à tous les coaches via ImuChat Premium
- Coaches premium exclusifs (ex: coach de célébrité) via ImuCoin

---

## 2. Architecture générale

```
ImuCoach
│
├── Core Layer
│   ├── CoachContext (React)
│   ├── useCoach hook
│   └── coach-store (Zustand)
│
├── Services
│   ├── coach-api.ts           — CRUD sessions, objectifs, historique
│   ├── coach-chat.ts          — Streaming Claude API par coach
│   └── coach-progress.ts      — Calcul progression & insights
│
├── Routes (Next.js)
│   ├── /coach/                — Hub ImuCoach (catalogue)
│   ├── /coach/[coachId]       — Profil du coach
│   ├── /coach/[coachId]/chat  — Session de coaching
│   └── /coach/[coachId]/progress — Tableau de bord progression
│
└── Claude API
    └── Streaming (SSE) avec system prompt par persona
```

---

## 3. Catalogue de personas Coaches

### 🏋️ Alex — Coach Fitness
- **Ton :** Motivant, direct, bienveillant
- **Spécialité :** Musculation, cardio, nutrition sportive, programmes d'entraînement
- **Méthode :** Plans hebdomadaires personnalisés, check-ins quotidiens
- **Phrase signature :** *"C'est dans l'effort que tu te construis."*

### 💰 Léa — Coach Finance Perso
- **Ton :** Pédagogue, rassurant, pragmatique
- **Spécialité :** Budget, épargne, investissement débutant, dettes
- **Méthode :** Règle 50/30/20, objectifs SMART financiers
- **Phrase signature :** *"Chaque euro dépensé consciemment est un pas vers ta liberté."*

### 🥗 Nour — Coach Nutrition
- **Ton :** Chaleureux, non-jugeant, scientifique
- **Spécialité :** Alimentation équilibrée, rééquilibrage, intolérances
- **Méthode :** Intuitive eating + bases scientifiques, pas de régimes restrictifs
- **Phrase signature :** *"Manger bien, c'est s'aimer."*

### 📚 Marcus — Coach Carrière & Productivité
- **Ton :** Stratégique, challengeant, exigeant (bienveillant)
- **Spécialité :** Gestion du temps, entretiens, évolution professionnelle, freelance
- **Méthode :** OKRs, deep work, réseau stratégique
- **Phrase signature :** *"Ta carrière ne se construit pas par accident."*

### 🧘 Yuki — Coach Mental & Bien-être
- **Ton :** Doux, empathique, contemplatif
- **Spécialité :** Stress, burnout, confiance en soi, méditation, sommeil
- **Méthode :** TCC simplifiée, pleine conscience, journaling
- **Phrase signature :** *"Prendre soin de toi n'est pas un luxe, c'est une nécessité."*

### 🎓 Sophia — Coach Apprentissage
- **Ton :** Enthousiaste, curieux, stimulant
- **Spécialité :** Langues, mémorisation, études, apprentissage accéléré
- **Méthode :** Feynman Technique, spaced repetition, mind mapping
- **Phrase signature :** *"Apprendre, c'est te donner des superpouvoirs."*

---

## 4. Schéma de base de données

```sql
-- ================================================================
-- IMUCOACH — SCHÉMA SUPABASE
-- ================================================================

-- 1. Catalogue des coaches
CREATE TABLE IF NOT EXISTS public.coach_catalog (
  id              TEXT PRIMARY KEY, -- 'fitness', 'finance', 'nutrition', etc.
  name            TEXT NOT NULL,
  specialty       TEXT NOT NULL,
  description     TEXT NOT NULL,
  emoji           TEXT NOT NULL,
  avatar_url      TEXT,
  tone            TEXT NOT NULL,
  method          TEXT NOT NULL,
  signature_quote TEXT,
  is_premium      BOOLEAN NOT NULL DEFAULT false,
  imucoin_cost    INTEGER DEFAULT 0, -- 0 = inclus Premium, >0 = achat séparé
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.coach_catalog VALUES
  ('fitness',     'Alex',   'Fitness & Sport',         'Coach muscu et cardio', '🏋️', null, 'motivant', 'plans hebdo',    'C''est dans l''effort que tu te construis.', false, 0, true, 1),
  ('finance',     'Léa',    'Finance personnelle',      'Budget et épargne',     '💰', null, 'pédagogue', '50/30/20',       'Chaque euro dépensé consciemment.', false, 0, true, 2),
  ('nutrition',   'Nour',   'Nutrition & Alimentation', 'Équilibre alimentaire', '🥗', null, 'chaleureux', 'intuitive eating','Manger bien, c''est s''aimer.', false, 0, true, 3),
  ('career',      'Marcus', 'Carrière & Productivité',  'Évolution pro',         '📚', null, 'stratégique', 'OKRs',          'Ta carrière ne se construit pas par accident.', false, 0, true, 4),
  ('mental',      'Yuki',   'Bien-être mental',         'Stress et équilibre',   '🧘', null, 'empathique', 'TCC + pleine conscience', 'Prendre soin de toi n''est pas un luxe.', false, 0, true, 5),
  ('learning',    'Sophia', 'Apprentissage',            'Mémorisation & langues','🎓', null, 'enthousiaste', 'Feynman + répétition espacée', 'Apprendre, c''est te donner des superpouvoirs.', false, 0, true, 6);

-- 2. Sessions utilisateur / historique par coach
CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id        TEXT NOT NULL REFERENCES public.coach_catalog(id),
  title           TEXT, -- titre auto-généré par IA après la session
  messages_count  INTEGER NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  is_archived     BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_coach_sessions_user ON public.coach_sessions(user_id, coach_id);

-- 3. Messages des sessions (séparé des messages chat principal)
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID NOT NULL REFERENCES public.coach_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  tokens_used INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coach_messages_session ON public.coach_messages(session_id, created_at);

-- 4. Objectifs fixés avec le coach
CREATE TABLE IF NOT EXISTS public.coach_goals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id    TEXT NOT NULL REFERENCES public.coach_catalog(id),
  title       TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  progress    INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  milestones  JSONB DEFAULT '[]', -- checkpoints intermédiaires
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. Notes & insights générés par le coach
CREATE TABLE IF NOT EXISTS public.coach_insights (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  coach_id    TEXT NOT NULL REFERENCES public.coach_catalog(id),
  session_id  UUID REFERENCES public.coach_sessions(id),
  type        TEXT NOT NULL CHECK (type IN ('insight', 'advice', 'reminder', 'challenge')),
  content     TEXT NOT NULL,
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. Quota messages par plan
CREATE TABLE IF NOT EXISTS public.coach_daily_usage (
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  coach_id    TEXT NOT NULL REFERENCES public.coach_catalog(id),
  message_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date, coach_id)
);

-- Vérification quota (plan gratuit : 10 messages/jour par coach)
CREATE OR REPLACE FUNCTION public.check_coach_quota(
  p_user_id UUID, p_coach_id TEXT, p_is_premium BOOLEAN DEFAULT false
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := CASE WHEN p_is_premium THEN 999999 ELSE 10 END;
BEGIN
  SELECT COALESCE(message_count, 0) INTO v_count
  FROM public.coach_daily_usage
  WHERE user_id = p_user_id AND coach_id = p_coach_id AND date = CURRENT_DATE;
  RETURN COALESCE(v_count, 0) < v_limit;
END;
$$;

-- RLS
ALTER TABLE public.coach_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_goals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_insights  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_coach_data" ON public.coach_sessions  USING (user_id = auth.uid());
CREATE POLICY "users_own_messages"   ON public.coach_messages
  USING (EXISTS (SELECT 1 FROM public.coach_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "users_own_goals"      ON public.coach_goals     USING (user_id = auth.uid());
CREATE POLICY "users_own_insights"   ON public.coach_insights  USING (user_id = auth.uid());
```

---

## 5. API & Routes

### 5.1 Routes Next.js API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/coach/catalog` | Liste des coaches |
| `GET` | `/api/coach/sessions` | Mes sessions (toutes) |
| `GET` | `/api/coach/[coachId]/sessions` | Mes sessions avec ce coach |
| `POST` | `/api/coach/[coachId]/sessions` | Nouvelle session |
| `GET` | `/api/coach/sessions/[sessionId]` | Historique d'une session |
| `POST` | `/api/coach/sessions/[sessionId]/messages` | Envoyer un message (streaming) |
| `GET` | `/api/coach/[coachId]/goals` | Mes objectifs avec ce coach |
| `POST` | `/api/coach/[coachId]/goals` | Créer un objectif |
| `PATCH` | `/api/coach/goals/[goalId]` | Mettre à jour la progression |
| `GET` | `/api/coach/[coachId]/insights` | Mes insights avec ce coach |
| `GET` | `/api/coach/quota` | Quota restant du jour |

### 5.2 Streaming (Server-Sent Events)

```typescript
// app/api/coach/sessions/[sessionId]/messages/route.ts

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const { content } = await req.json();
  const session = await getSession(params.sessionId);
  const coach = COACH_PERSONAS[session.coach_id];

  // Vérifier quota
  const hasQuota = await checkCoachQuota(user.id, session.coach_id, user.is_premium);
  if (!hasQuota) {
    return NextResponse.json({ error: 'Quota atteint', code: 'QUOTA_EXCEEDED' }, { status: 429 });
  }

  // Récupérer historique (max 20 derniers messages pour le contexte)
  const history = await getSessionHistory(params.sessionId, 20);

  // Sauvegarder le message utilisateur
  await saveMessage({ session_id: params.sessionId, role: 'user', content });

  // Stream Claude
  const anthropic = new Anthropic();
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: coach.systemPrompt,
    messages: [
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content }
    ],
  });

  // Réponse SSE
  const encoder = new TextEncoder();
  let fullResponse = '';

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullResponse += event.delta.text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }

      // Sauvegarder la réponse complète
      await saveMessage({ session_id: params.sessionId, role: 'assistant', content: fullResponse });
      await incrementCoachUsage(user.id, session.coach_id);

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 6. Prompt Engineering

### 6.1 System prompts par persona

```typescript
// lib/coach-personas.ts

export const COACH_PERSONAS: Record<string, CoachPersona> = {
  fitness: {
    systemPrompt: `Tu es Alex, coach fitness sur ImuChat. Tu es motivant, direct et bienveillant.

Expertise : musculation, cardio, nutrition sportive, récupération, mobilité.
Méthode : plans hebdomadaires adaptés au niveau, check-ins réguliers, progression mesurable.
Style : parle directement, utilise "tu", encourage sans être condescendant.

Au début de chaque nouvelle session, demande :
- Le niveau actuel (débutant/intermédiaire/avancé)
- L'objectif principal (prise de masse / perte de poids / endurance / forme générale)
- Les équipements disponibles
- Les contraintes (blessures, temps disponible)

Tu peux créer des plans d'entraînement sous forme de tableau, suggérer des exercices avec des descriptions claires, donner des conseils nutritionnels de base.
Ne donne jamais de conseils médicaux. Redirige vers un médecin si nécessaire.`,
  },

  finance: {
    systemPrompt: `Tu es Léa, coach en finances personnelles sur ImuChat. Tu es pédagogue, rassurante et pragmatique.

Expertise : budget (méthode 50/30/20), épargne d'urgence, remboursement de dettes, investissement débutant.
Méthode : objectifs SMART financiers, étapes progressives, célébration des petites victoires.
Style : positif, sans jugement sur la situation financière actuelle, langage accessible.

Au début, évalue :
- Revenus mensuels nets approximatifs
- Charges fixes (loyer, abonnements, etc.)
- Objectifs (économiser pour X, rembourser dettes, investir)

Propose des tableaux de budget, des simulations d'épargne, des explications simples sur les placements basiques (livret A, PEA, assurance-vie en France).
Ne donne pas de conseils en investissement spéculatif. Suggère un conseiller financier pour des cas complexes.`,
  },

  mental: {
    systemPrompt: `Tu es Yuki, coach bien-être mental sur ImuChat. Tu es doux, empathique et présent.

Expertise : gestion du stress et de l'anxiété, prévention du burnout, confiance en soi, sommeil, méditation de pleine conscience.
Méthode : techniques TCC simplifiées, journaling guidé, exercices de respiration, restructuration cognitive douce.
Style : langage bienveillant, écoute active, pas de solutions toutes faites.

Important :
- Tu n'es PAS un thérapeute ou un psychologue
- Si l'utilisateur exprime des pensées suicidaires ou de l'automutilation, renvoie-le IMMÉDIATEMENT vers une ligne de crise (3114 en France) et un professionnel de santé
- Propose des exercices pratiques et des questions de réflexion
- Valide les émotions avant de proposer des stratégies`,
  },

  // ... autres personas
};
```

---

## 7. Mapping des écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/coach` | `CoachHub` | Catalogue coaches + mes coaches actifs |
| `/coach/[id]` | `CoachProfile` | Présentation du coach + sessions précédentes |
| `/coach/[id]/chat` | `CoachChat` | Interface de chat avec streaming |
| `/coach/[id]/progress` | `CoachProgress` | Objectifs + timeline + insights |

### Composants

```
components/coach/
├── CoachCard.tsx              — Card coach dans le catalogue
├── CoachChatInterface.tsx     — Interface de chat streaming
├── CoachMessage.tsx           — Message coach avec avatar persona
├── CoachGoalCard.tsx          — Objectif avec barre de progression
├── CoachGoalCreator.tsx       — Formulaire création objectif
├── CoachInsightCard.tsx       — Insight / conseil épinglé
├── CoachProgressChart.tsx     — Graphe de progression (Recharts)
├── CoachQuotaBanner.tsx       — Quota restant / upgrade premium
├── CoachOnboarding.tsx        — Questions initiales (first session)
└── CoachStreakBadge.tsx       — Jours consécutifs de sessions
```

---

## 8. Système de sessions & suivi

### 8.1 Mémoire contextuelle

Au début de chaque nouvelle session avec le même coach, le contexte des 3 dernières sessions est injecté dans le prompt :

```typescript
async function buildContextSummary(userId: string, coachId: string): Promise<string> {
  // Récupérer les 3 dernières sessions
  const sessions = await getRecentSessions(userId, coachId, 3);
  if (sessions.length === 0) return '';

  // Résumer via Claude (call interne)
  const history = sessions.map(s => s.messages).flat().slice(-30); // 30 derniers msgs
  const summary = await quickSummarize(history);

  return `Contexte des sessions précédentes avec cet utilisateur :
${summary}

Objectifs actuels : ${await getActiveGoals(userId, coachId)}`;
}
```

### 8.2 Gamification

| Événement | Récompense |
|-----------|-----------|
| 1ère session avec un coach | Badge "Premier pas" + 10 IC |
| 7 jours consécutifs | Badge "Régularité" + 50 IC |
| Objectif complété | Badge domaine-spécifique + 100 IC |
| 30 sessions totales | Badge "Engagé" + 200 IC |

---

## 9. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + catalog + migrations | 2 jours |
| **S2** | Route streaming SSE + personas system prompts | 4 jours |
| **S3** | CoachHub + CoachProfile + CoachCard (UI) | 3 jours |
| **S4** | CoachChat interface + streaming UI | 4 jours |
| **S5** | Système objectifs + CoachProgress | 3 jours |
| **S6** | Contexte mémoire entre sessions | 2 jours |
| **S7** | Quota + gamification + tests | 3 jours |

**Durée totale estimée : ~4.5 semaines**

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
