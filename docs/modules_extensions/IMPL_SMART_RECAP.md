# 🧠 Smart Recap — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🟠 P1 — Valeur IA forte, différenciateur clé  
> **Dépendances** : `chat` (core), `ai-assistant` (Claude API), `notifications`

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Architecture générale](#2-architecture-générale)
3. [Schéma de base de données](#3-schéma-de-base-de-données)
4. [API & Routes](#4-api--routes)
5. [Prompt Engineering](#5-prompt-engineering)
6. [Mapping des écrans & composants](#6-mapping-des-écrans--composants)
7. [Modes de récap](#7-modes-de-récap)
8. [Déclencheurs & automatisation](#8-déclencheurs--automatisation)
9. [Plan d'implémentation](#9-plan-dimplémentation)

---

## 1. Vision & Positionnement

Smart Recap génère automatiquement des **résumés intelligents** de conversations de groupe, avec extraction des décisions, actions à faire, et moments clés. Conçu pour les utilisateurs qui reviennent après une longue absence dans un groupe actif.

**Cas d'usage :**
- "J'étais absent 2 jours, donne-moi le résumé du groupe projet"
- "Quelles décisions ont été prises cette semaine dans #coloc ?"
- "Qui doit faire quoi ?"
- Récap quotidien automatique envoyé en notification

**Respect de la vie privée :**
- Les messages des DMs ne sont jamais résumés sauf demande explicite
- L'IA ne stocke pas les messages — elle les analyse puis oublie
- Les récaps des groupes E2EE ne sont disponibles que pour les membres

---

## 2. Architecture générale

```
Smart Recap
│
├── Core Layer
│   ├── RecapContext (React)
│   ├── useRecap hook
│   └── recap-store (Zustand)
│
├── Services
│   ├── recap-api.ts           — CRUD récaps, déclencheurs
│   ├── recap-generator.ts     — Appel Claude API + post-traitement
│   └── recap-scheduler.ts     — Tâches CRON (récaps auto)
│
├── Routes (Next.js)
│   ├── /chat/[chatId]/recap         — Page récap d'une conversation
│   ├── /recap/                      — Hub de tous mes récaps
│   └── /api/recap/generate          — Endpoint génération
│
└── Background Jobs (Supabase Edge Functions + pg_cron)
    ├── generate-daily-recaps        — Chaque soir à 22h
    └── generate-weekly-recaps       — Chaque dimanche à 18h
```

---

## 3. Schéma de base de données

```sql
-- ================================================================
-- SMART RECAP — SCHÉMA SUPABASE
-- ================================================================

-- 1. Récaps générés
CREATE TABLE IF NOT EXISTS public.chat_recaps (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id         UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  requested_by    UUID REFERENCES public.profiles(id), -- NULL = auto-généré
  recap_type      TEXT NOT NULL DEFAULT 'manual' CHECK (recap_type IN (
    'manual', 'daily', 'weekly', 'catch_up'
  )),
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  message_count   INTEGER NOT NULL DEFAULT 0,
  
  -- Contenu du récap (structuré)
  summary         TEXT NOT NULL,           -- résumé narratif principal
  decisions       JSONB DEFAULT '[]',      -- liste de décisions prises
  action_items    JSONB DEFAULT '[]',      -- tâches / actions à faire
  key_topics      JSONB DEFAULT '[]',      -- sujets abordés
  highlights      JSONB DEFAULT '[]',      -- moments importants
  participants    JSONB DEFAULT '[]',      -- participants actifs + stats
  
  -- Méta
  model_used      TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
  tokens_used     INTEGER,
  generation_ms   INTEGER,
  language        TEXT NOT NULL DEFAULT 'fr',
  is_public       BOOLEAN NOT NULL DEFAULT false, -- partageable hors groupe ?
  
  created_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days'
);

-- Index
CREATE INDEX idx_recaps_chat_id    ON public.chat_recaps(chat_id);
CREATE INDEX idx_recaps_created_at ON public.chat_recaps(created_at DESC);

-- 2. Préférences de récap par utilisateur
CREATE TABLE IF NOT EXISTS public.recap_preferences (
  user_id               UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_recap_enabled   BOOLEAN NOT NULL DEFAULT false,
  weekly_recap_enabled  BOOLEAN NOT NULL DEFAULT true,
  daily_recap_time      TIME NOT NULL DEFAULT '22:00',
  recap_language        TEXT NOT NULL DEFAULT 'fr',
  min_messages          INTEGER NOT NULL DEFAULT 20, -- min de messages pour déclencher
  excluded_chat_ids     UUID[] DEFAULT '{}',         -- groupes exclus des récaps auto
  notify_on_ready       BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- 3. Paramètres de récap par groupe (pour les admins)
CREATE TABLE IF NOT EXISTS public.chat_recap_settings (
  chat_id               UUID PRIMARY KEY REFERENCES public.chats(id) ON DELETE CASCADE,
  recap_enabled         BOOLEAN NOT NULL DEFAULT true,
  auto_daily            BOOLEAN NOT NULL DEFAULT false,
  auto_weekly           BOOLEAN NOT NULL DEFAULT false,
  updated_by            UUID REFERENCES public.profiles(id),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- 4. Réactions aux récaps (utile/pas utile)
CREATE TABLE IF NOT EXISTS public.recap_feedback (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recap_id    UUID NOT NULL REFERENCES public.chat_recaps(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  rating      INTEGER NOT NULL CHECK (rating IN (1, -1)), -- +1 utile, -1 pas utile
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recap_id, user_id)
);

-- RLS : seuls les membres du chat voient les récaps
ALTER TABLE public.chat_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_members_can_view_recaps" ON public.chat_recaps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_members
      WHERE chat_id = chat_recaps.chat_id AND user_id = auth.uid()
    )
  );

ALTER TABLE public.recap_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_recap_preferences" ON public.recap_preferences
  USING (user_id = auth.uid());
```

---

## 4. API & Routes

### 4.1 Route API de génération

```typescript
// app/api/recap/generate/route.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { chat_id, period_start, period_end, recap_type } = await req.json();

  // 1. Récupérer les messages de la période
  const messages = await fetchMessagesForPeriod(chat_id, period_start, period_end);
  
  if (messages.length < 5) {
    return NextResponse.json({ error: 'Pas assez de messages', code: 'TOO_FEW_MESSAGES' }, { status: 400 });
  }

  // 2. Construire le prompt
  const messagesText = formatMessagesForPrompt(messages);
  const startTime = Date.now();

  // 3. Appel Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: buildSystemPrompt(),
    messages: [
      { role: 'user', content: buildUserPrompt(messagesText, recap_type) }
    ],
  });

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
  const generationMs = Date.now() - startTime;

  // 4. Parser le JSON structuré retourné par Claude
  let parsed: RecapStructure;
  try {
    const jsonMatch = rawText.match(/```json\n([\s\S]+?)\n```/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: 'Erreur parsing récap IA' }, { status: 500 });
  }

  // 5. Sauvegarder en base
  const { data: recap } = await supabase
    .from('chat_recaps')
    .insert({
      chat_id,
      requested_by: user.id,
      recap_type,
      period_start,
      period_end,
      message_count: messages.length,
      summary: parsed.summary,
      decisions: parsed.decisions,
      action_items: parsed.action_items,
      key_topics: parsed.key_topics,
      highlights: parsed.highlights,
      participants: parsed.participants,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      generation_ms: generationMs,
    })
    .select()
    .single();

  return NextResponse.json(recap);
}

function formatMessagesForPrompt(messages: Message[]): string {
  return messages
    .map(m => `[${m.created_at}] ${m.sender_username}: ${m.content}`)
    .join('\n');
}

async function fetchMessagesForPeriod(
  chatId: string,
  start: string,
  end: string
): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('id, content, created_at, profiles(username)')
    .eq('chat_id', chatId)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at')
    .limit(500); // max 500 messages par récap
  return data ?? [];
}
```

### 4.2 Routes Next.js

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/recap/generate` | Générer un récap (Claude API) |
| `GET` | `/api/recap/[recapId]` | Récupérer un récap |
| `GET` | `/api/recap/chat/[chatId]` | Tous les récaps d'un chat |
| `GET` | `/api/recap/my` | Tous mes récaps |
| `DELETE` | `/api/recap/[recapId]` | Supprimer un récap |
| `POST` | `/api/recap/[recapId]/feedback` | Donner un feedback |
| `GET` | `/api/recap/preferences` | Préférences utilisateur |
| `PUT` | `/api/recap/preferences` | Mettre à jour les préférences |

---

## 5. Prompt Engineering

### 5.1 System Prompt

```typescript
function buildSystemPrompt(): string {
  return `Tu es Smart Recap, un assistant IA intégré à ImuChat. 
Tu génères des résumés structurés et utiles de conversations de groupe.

Règles strictes :
- Sois neutre et factuel, ne juge pas les participants
- Extrait uniquement les informations présentes dans les messages
- Respecte la confidentialité : ne révèle pas d'informations personnelles sensibles
- Utilise le prénom/username des participants, pas "l'utilisateur"
- Rédige en français sauf si la majorité des messages est dans une autre langue

Format de réponse OBLIGATOIRE (JSON pur, sans markdown autour) :
{
  "summary": "Résumé narratif en 3-5 phrases",
  "decisions": [
    { "text": "Décision prise", "decided_by": "username ou null", "timestamp": "approximatif" }
  ],
  "action_items": [
    { "text": "Tâche à faire", "assigned_to": "username ou null", "due_hint": "hint de date ou null" }
  ],
  "key_topics": ["sujet1", "sujet2", "sujet3"],
  "highlights": [
    { "text": "Moment important ou annonce", "type": "announcement|milestone|conflict|fun" }
  ],
  "participants": [
    { "username": "nom", "message_count": 12, "role": "actif|modéré|passif" }
  ],
  "mood": "positive|neutral|tense|mixed",
  "tldr": "Une seule phrase résumant tout"
}`;
}
```

### 5.2 User Prompt selon le type

```typescript
function buildUserPrompt(messagesText: string, recapType: RecapType): string {
  const typeInstructions = {
    catch_up: "L'utilisateur revient après une absence. Mets en avant ce qu'il a raté d'important.",
    daily: "Résumé de la journée. Sois concis et focus sur les décisions et actions.",
    weekly: "Résumé de la semaine. Identifie les tendances et l'évolution des sujets.",
    manual: "Résumé complet et détaillé de la période.",
  };

  return `${typeInstructions[recapType]}

Voici les messages à analyser :

---
${messagesText}
---

Génère le récap JSON structuré.`;
}
```

---

## 6. Mapping des écrans & composants

### Écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/recap` | `RecapHub` | Tous mes récaps récents (toutes conversations) |
| `/chat/[id]/recap` | `ChatRecapPage` | Récaps de cette conversation + bouton générer |

### Composants

```
components/recap/
├── RecapCard.tsx               — Card résumé dans le hub
├── RecapDetail.tsx             — Vue détaillée d'un récap
├── RecapSummaryBlock.tsx       — Bloc texte du résumé narratif
├── RecapDecisionsList.tsx      — Liste des décisions prises
├── RecapActionItems.tsx        — Liste des tâches / TODOs
├── RecapTopicsCloud.tsx        — Tags des sujets abordés
├── RecapParticipants.tsx       — Qui a dit quoi (stats)
├── RecapMoodBadge.tsx          — Badge d'ambiance (😊 🤔 😤)
├── GenerateRecapButton.tsx     — Bouton + formulaire déclencheur
├── RecapPeriodPicker.tsx       — Choisir la période à résumer
├── RecapFeedback.tsx           — 👍/👎 + commentaire
└── RecapSettings.tsx           — Préférences (auto, fréquence)
```

**Exemple : `RecapDetail.tsx`**

```tsx
export function RecapDetail({ recap }: { recap: ChatRecap }) {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Récap du {formatDate(recap.period_start)}</h2>
          <p className="text-sm text-muted-foreground">{recap.message_count} messages analysés</p>
        </div>
        <RecapMoodBadge mood={recap.mood} />
      </div>

      {/* TL;DR */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
        <p className="font-medium text-sm">📋 En bref</p>
        <p className="mt-1">{recap.tldr}</p>
      </div>

      {/* Résumé */}
      <RecapSummaryBlock summary={recap.summary} />

      {/* Décisions */}
      {recap.decisions?.length > 0 && (
        <RecapDecisionsList decisions={recap.decisions} />
      )}

      {/* Actions */}
      {recap.action_items?.length > 0 && (
        <RecapActionItems items={recap.action_items} />
      )}

      {/* Sujets */}
      <RecapTopicsCloud topics={recap.key_topics} />

      {/* Feedback */}
      <RecapFeedback recapId={recap.id} />
    </div>
  );
}
```

---

## 7. Modes de récap

| Mode | Déclencheur | Fenêtre temporelle | Description |
|------|------------|-------------------|-------------|
| `catch_up` | Manuel — "Résume depuis ma dernière lecture" | Depuis `last_read_at` | Focus sur ce que l'utilisateur a raté |
| `manual` | Manuel — sélection de période | Libre (max 7 jours) | Récap complet à la demande |
| `daily` | Auto ou manuel | Dernier minuit → maintenant | Récap du jour |
| `weekly` | Auto le dimanche ou manuel | 7 derniers jours | Vue hebdomadaire |

---

## 8. Déclencheurs & automatisation

### 8.1 CRON Supabase (Edge Functions)

```typescript
// supabase/functions/generate-daily-recaps/index.ts
// Déclenché chaque soir à 22h via pg_cron

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async () => {
  // 1. Récupérer tous les users avec daily_recap_enabled = true
  const { data: users } = await supabase
    .from('recap_preferences')
    .select('user_id, excluded_chat_ids, min_messages, recap_language')
    .eq('daily_recap_enabled', true);

  for (const userPref of users ?? []) {
    // 2. Pour chaque groupe actif de l'utilisateur
    const activeChats = await getActiveChatsForUser(userPref.user_id, userPref.excluded_chat_ids);

    for (const chat of activeChats) {
      // 3. Vérifier qu'il y a assez de messages aujourd'hui
      const todayCount = await getMessageCountToday(chat.id);
      if (todayCount < userPref.min_messages) continue;

      // 4. Générer le récap
      await generateRecap({
        chat_id: chat.id,
        recap_type: 'daily',
        period_start: startOfDay(),
        period_end: now(),
        language: userPref.recap_language,
      });

      // 5. Notifier l'utilisateur
      await sendRecapNotification(userPref.user_id, chat.id);
    }
  }

  return new Response('OK');
});
```

### 8.2 Déclencheur "Catch-up"

Quand un utilisateur ouvre un chat après une absence de plus de 6h et que le groupe a +20 nouveaux messages, afficher une bannière :

```tsx
// Dans le composant ChatView
if (unreadCount > 20 && hoursAbsent > 6) {
  return (
    <CatchUpBanner
      unreadCount={unreadCount}
      onGenerate={() => generateCatchUpRecap(chat.id, lastReadAt)}
    />
  );
}
```

---

## 9. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + migrations + RLS | 2 jours |
| **S2** | Route `/api/recap/generate` + prompt engineering | 3 jours |
| **S3** | `recap-api.ts` + Zustand store | 2 jours |
| **S4** | RecapDetail + RecapCard + RecapHub (UI) | 3 jours |
| **S5** | Intégration chat (CatchUpBanner + bouton récap) | 2 jours |
| **S6** | Récaps auto (Edge Function CRON + notifications) | 3 jours |
| **S7** | RecapSettings + feedback + tests | 2 jours |

**Durée totale estimée : ~3 semaines**

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
