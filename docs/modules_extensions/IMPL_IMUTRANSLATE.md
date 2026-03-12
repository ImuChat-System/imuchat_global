# 🌐 ImuTranslate — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🔴 P0 — Différenciateur fort, usage quotidien international  
> **Dépendances** : `chat` (core), `ai-assistant` (optionnel)

---

## Table des matières

- [🌐 ImuTranslate — Document d'Implémentation Complet](#-imutranslate--document-dimplémentation-complet)
  - [Table des matières](#table-des-matières)
  - [1. Vision \& Positionnement](#1-vision--positionnement)
  - [2. Architecture générale](#2-architecture-générale)
  - [3. Schéma de base de données](#3-schéma-de-base-de-données)
  - [4. API \& Routes](#4-api--routes)
    - [4.1 Route API serveur (proxy sécurisé)](#41-route-api-serveur-proxy-sécurisé)
    - [4.2 Service client TypeScript](#42-service-client-typescript)
    - [4.3 Routes Next.js](#43-routes-nextjs)
  - [5. Mapping des écrans \& composants](#5-mapping-des-écrans--composants)
    - [Écrans](#écrans)
    - [Composants Chat (intégrés)](#composants-chat-intégrés)
  - [6. Intégration Chat](#6-intégration-chat)
    - [6.1 Traduction à la demande](#61-traduction-à-la-demande)
    - [6.2 Mode Auto par conversation](#62-mode-auto-par-conversation)
  - [7. Moteur de traduction](#7-moteur-de-traduction)
    - [7.1 Zustand Store](#71-zustand-store)
    - [7.2 Cache côté client (IndexedDB via idb)](#72-cache-côté-client-indexeddb-via-idb)
  - [8. Langues supportées](#8-langues-supportées)
  - [9. Plan d'implémentation](#9-plan-dimplémentation)

---

## 1. Vision & Positionnement

ImuTranslate apporte la **traduction instantanée** directement dans les conversations ImuChat. Chaque message peut être affiché dans la langue maternelle de l'utilisateur, sans copier-coller ni quitter l'app.

**Modes de fonctionnement :**

- **Traduction à la demande** : tap sur un message → "Voir en français"
- **Mode auto** : activation par conversation → tous les messages entrants traduits automatiquement
- **Traduction de groupe** : dans un groupe multilingue, chacun voit les messages dans sa langue

**Providers supportés :**

- DeepL API (prioritaire — meilleure qualité pour les langues européennes)
- Google Translate API (fallback + langues rares)
- Claude API (pour les nuances et argot)

---

## 2. Architecture générale

```
ImuTranslate
│
├── Core Layer
│   ├── TranslationContext (React)
│   ├── useTranslation hook
│   └── translation-store (Zustand)
│
├── Services
│   ├── translation-api.ts       — Interface unifiée DeepL / Google
│   ├── language-detector.ts     — Détection de langue automatique
│   └── translation-cache.ts     — Cache local (IndexedDB)
│
├── Routes (Next.js)
│   ├── /translate/settings      — Préférences de traduction
│   └── /api/translate           — Route API serveur (proxy sécurisé)
│
└── Chat Integration
    ├── TranslatedMessage        — Overlay sous/dessus le message
    ├── AutoTranslateToggle      — Toggle par conversation
    └── LanguageDetectionBadge  — Badge langue détectée
```

---

## 3. Schéma de base de données

```sql
-- ================================================================
-- IMUTRANSLATE — SCHÉMA SUPABASE
-- ================================================================

-- 1. Préférences de traduction par utilisateur
CREATE TABLE IF NOT EXISTS public.translation_preferences (
  user_id             UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_language     TEXT NOT NULL DEFAULT 'fr', -- langue cible par défaut
  auto_detect         BOOLEAN NOT NULL DEFAULT true,
  show_original       BOOLEAN NOT NULL DEFAULT true,  -- afficher l'original sous la traduction
  auto_translate_dms  BOOLEAN NOT NULL DEFAULT false, -- activer auto sur tous les DMs
  provider_preference TEXT NOT NULL DEFAULT 'deepl' CHECK (provider_preference IN ('deepl', 'google', 'claude')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 2. Paramètres de traduction par conversation
CREATE TABLE IF NOT EXISTS public.chat_translation_settings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id         UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  auto_translate  BOOLEAN NOT NULL DEFAULT false,
  target_language TEXT NOT NULL DEFAULT 'fr',
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- 3. Cache des traductions (évite les appels API redondants)
CREATE TABLE IF NOT EXISTS public.translation_cache (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id      UUID NOT NULL, -- référence au message (non FK car multi-table)
  source_text     TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  provider        TEXT NOT NULL,
  char_count      INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, target_language)
);

-- Index pour invalidation du cache
CREATE INDEX idx_translation_cache_message ON public.translation_cache(message_id);

-- 4. Statistiques d'usage (pour billing / quotas)
CREATE TABLE IF NOT EXISTS public.translation_usage (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  chars_translated INTEGER NOT NULL DEFAULT 0,
  requests_count  INTEGER NOT NULL DEFAULT 0,
  provider        TEXT NOT NULL,
  UNIQUE(user_id, date, provider)
);

-- Incrémenter les stats d'usage
CREATE OR REPLACE FUNCTION public.increment_translation_usage(
  p_user_id UUID,
  p_chars   INTEGER,
  p_provider TEXT
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.translation_usage (user_id, date, chars_translated, requests_count, provider)
  VALUES (p_user_id, CURRENT_DATE, p_chars, 1, p_provider)
  ON CONFLICT (user_id, date, provider) DO UPDATE SET
    chars_translated = translation_usage.chars_translated + p_chars,
    requests_count   = translation_usage.requests_count + 1;
END;
$$;

-- Quotas journaliers (plan gratuit : 10 000 chars/jour)
CREATE OR REPLACE FUNCTION public.check_translation_quota(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  daily_usage INTEGER;
  daily_limit INTEGER := 10000; -- gratuit
BEGIN
  SELECT COALESCE(SUM(chars_translated), 0)
  INTO daily_usage
  FROM public.translation_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN daily_usage < daily_limit;
END;
$$;

-- RLS
ALTER TABLE public.translation_preferences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_translation_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_usage            ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_preferences" ON public.translation_preferences
  USING (user_id = auth.uid());

CREATE POLICY "users_own_chat_settings" ON public.chat_translation_settings
  USING (user_id = auth.uid());
```

---

## 4. API & Routes

### 4.1 Route API serveur (proxy sécurisé)

```typescript
// app/api/translate/route.ts
// Le proxy cache la clé API DeepL côté serveur

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY!;

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Vérifier le quota
  const { data: hasQuota } = await supabase.rpc('check_translation_quota', { p_user_id: user.id });
  if (!hasQuota) {
    return NextResponse.json({ error: 'Quota journalier dépassé', code: 'QUOTA_EXCEEDED' }, { status: 429 });
  }

  const { text, target_lang, source_lang, message_id, provider = 'deepl' } = await req.json();

  // Vérifier le cache
  if (message_id) {
    const { data: cached } = await supabase
      .from('translation_cache')
      .select('translated_text, source_language')
      .eq('message_id', message_id)
      .eq('target_language', target_lang)
      .single();

    if (cached) {
      return NextResponse.json({
        translated_text: cached.translated_text,
        detected_source: cached.source_language,
        from_cache: true,
      });
    }
  }

  // Appel API de traduction
  let result: { translated_text: string; detected_source: string };

  if (provider === 'deepl') {
    result = await translateWithDeepL(text, target_lang, source_lang);
  } else {
    result = await translateWithGoogle(text, target_lang, source_lang);
  }

  // Mettre en cache
  if (message_id) {
    await supabase.from('translation_cache').upsert({
      message_id,
      source_text: text,
      source_language: result.detected_source,
      target_language: target_lang,
      translated_text: result.translated_text,
      provider,
      char_count: text.length,
    });
  }

  // Incrémenter stats
  await supabase.rpc('increment_translation_usage', {
    p_user_id: user.id,
    p_chars: text.length,
    p_provider: provider,
  });

  return NextResponse.json(result);
}

async function translateWithDeepL(text: string, targetLang: string, sourceLang?: string) {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang.toUpperCase(),
      source_lang: sourceLang?.toUpperCase(),
    }),
  });
  const data = await response.json();
  return {
    translated_text: data.translations[0].text,
    detected_source: data.translations[0].detected_source_language.toLowerCase(),
  };
}

async function translateWithGoogle(text: string, targetLang: string, sourceLang?: string) {
  const params = new URLSearchParams({
    q: text,
    target: targetLang,
    key: GOOGLE_API_KEY,
    ...(sourceLang && { source: sourceLang }),
  });
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?${params}`);
  const data = await response.json();
  return {
    translated_text: data.data.translations[0].translatedText,
    detected_source: data.data.translations[0].detectedSourceLanguage ?? sourceLang ?? 'und',
  };
}
```

### 4.2 Service client TypeScript

```typescript
// services/translation-api.ts

export async function translateMessage(payload: {
  text: string;
  target_lang: string;
  source_lang?: string;
  message_id?: string;
  provider?: 'deepl' | 'google' | 'claude';
}): Promise<{ translated_text: string; detected_source: string; from_cache?: boolean }> {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? 'Translation failed');
  }
  return res.json();
}

export async function detectLanguage(text: string): Promise<string> {
  // Utilise un appel DeepL/Google avec target fictif pour la détection
  const { detected_source } = await translateMessage({ text, target_lang: 'en' });
  return detected_source;
}

export async function getTranslationPreferences(userId: string) {
  const { data } = await supabase
    .from('translation_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data ?? { target_language: 'fr', auto_detect: true, show_original: true };
}

export async function upsertChatTranslationSettings(payload: {
  chat_id: string;
  auto_translate: boolean;
  target_language: string;
}) {
  const { error } = await supabase
    .from('chat_translation_settings')
    .upsert({ ...payload, user_id: currentUser.id });
  if (error) throw error;
}
```

### 4.3 Routes Next.js

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/translate` | Traduction (proxy sécurisé) |
| `GET` | `/api/translate/detect` | Détection de langue uniquement |
| `GET` | `/api/translate/preferences` | Préférences utilisateur |
| `PUT` | `/api/translate/preferences` | Mettre à jour les préférences |
| `GET` | `/api/translate/quota` | Quota restant du jour |
| `PUT` | `/api/translate/chat/[chatId]` | Paramètres par conversation |

---

## 5. Mapping des écrans & composants

### Écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/settings/translate` | `TranslateSettings` | Langue cible, provider, auto-translate global |

### Composants Chat (intégrés)

```
components/translate/
├── TranslatedMessage.tsx        — Bloc traduction sous le message original
├── TranslateButton.tsx          — Bouton "Traduire" dans le menu contextuel
├── AutoTranslateToggle.tsx      — Toggle dans les infos de conversation
├── LanguageBadge.tsx            — Badge discret "EN" "JA" sur les messages
├── TranslationLoading.tsx       — Skeleton pendant la traduction
├── QuotaBanner.tsx              — Bannière si quota presque atteint
└── TranslateSettings.tsx        — Page paramètres complète
```

---

## 6. Intégration Chat

### 6.1 Traduction à la demande

Quand l'utilisateur fait un **long-press / clic droit** sur un message, le menu contextuel inclut :

```
[ Répondre ]  [ Réagir ]  [ Copier ]  [ 🌐 Traduire ]  [ Supprimer ]
```

En cliquant "Traduire" :

1. Affiche un skeleton sous le message
2. Appelle `/api/translate` (avec `message_id` pour le cache)
3. Affiche la traduction sous le message original avec un badge de langue source

```tsx
// components/translate/TranslatedMessage.tsx
interface TranslatedMessageProps {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  fromCache?: boolean;
  onHide: () => void;
}

export function TranslatedMessage({
  originalText, translatedText, sourceLanguage, targetLanguage, onHide
}: TranslatedMessageProps) {
  return (
    <div className="mt-1 p-2 rounded-lg bg-muted/50 border-l-2 border-primary/30 text-sm">
      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
        <Globe className="w-3 h-3" />
        <span>{LANGUAGE_NAMES[sourceLanguage]} → {LANGUAGE_NAMES[targetLanguage]}</span>
        <button onClick={onHide} className="ml-auto hover:text-foreground">✕</button>
      </div>
      <p className="text-foreground">{translatedText}</p>
    </div>
  );
}
```

### 6.2 Mode Auto par conversation

Dans le header d'une conversation → menu → "Traduire automatiquement" :

```tsx
// Stocké dans chat_translation_settings
// Déclenché sur chaque nouveau message reçu dont la langue détectée ≠ target_language
const autoTranslateMessage = useCallback(async (message: Message) => {
  if (!autoTranslateEnabled) return;
  const prefs = useTranslationStore.getState().preferences;
  
  // Skiper si le message est déjà dans la bonne langue
  if (message.detected_language === prefs.target_language) return;

  const result = await translateMessage({
    text: message.content,
    target_lang: prefs.target_language,
    message_id: message.id,
  });

  setTranslationForMessage(message.id, result.translated_text);
}, [autoTranslateEnabled]);
```

---

## 7. Moteur de traduction

### 7.1 Zustand Store

```typescript
// stores/translation-store.ts
interface TranslationStore {
  // Map messageId → traduction
  translations: Record<string, { text: string; source_lang: string; loading: boolean }>;
  preferences: TranslationPreferences;
  chatSettings: Record<string, ChatTranslationSettings>;

  // Actions
  translateMessage: (messageId: string, text: string, targetLang?: string) => Promise<void>;
  clearTranslation: (messageId: string) => void;
  setAutoTranslate: (chatId: string, enabled: boolean, targetLang?: string) => Promise<void>;
  updatePreferences: (prefs: Partial<TranslationPreferences>) => Promise<void>;
}
```

### 7.2 Cache côté client (IndexedDB via idb)

```typescript
// services/translation-cache.ts
import { openDB } from 'idb';

const DB_NAME = 'imu-translations';
const STORE = 'cache';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export async function getCachedTranslation(messageId: string, targetLang: string) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(STORE); }
  });
  const key = `${messageId}:${targetLang}`;
  const entry = await db.get(STORE, key);
  if (!entry || Date.now() - entry.timestamp > TTL_MS) return null;
  return entry.translated_text;
}

export async function setCachedTranslation(
  messageId: string, targetLang: string, translatedText: string
) {
  const db = await openDB(DB_NAME, 1);
  await db.put(STORE, { translated_text: translatedText, timestamp: Date.now() }, `${messageId}:${targetLang}`);
}
```

---

## 8. Langues supportées

| Code | Langue | Provider prioritaire |
|------|--------|---------------------|
| `fr` | Français | DeepL |
| `en` | Anglais | DeepL |
| `es` | Espagnol | DeepL |
| `de` | Allemand | DeepL |
| `it` | Italien | DeepL |
| `pt` | Portugais | DeepL |
| `nl` | Néerlandais | DeepL |
| `pl` | Polonais | DeepL |
| `ru` | Russe | DeepL |
| `ja` | Japonais | DeepL |
| `zh` | Chinois | DeepL |
| `ko` | Coréen | DeepL |
| `ar` | Arabe | Google |
| `tr` | Turc | DeepL |
| `uk` | Ukrainien | DeepL |
| `sv` | Suédois | DeepL |
| `hi` | Hindi | Google |
| `vi` | Vietnamien | Google |

---

## 9. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + migrations + RLS + Edge Function proxy | 3 jours |
| **S2** | `translation-api.ts` + cache IndexedDB + quota | 3 jours |
| **S3** | Zustand store + TranslateButton + TranslatedMessage | 3 jours |
| **S4** | Intégration menu contextuel chat + détection auto langue | 2 jours |
| **S5** | AutoTranslateToggle + mode auto par conversation | 2 jours |
| **S6** | Page TranslateSettings + LanguageBadge | 2 jours |
| **S7** | QuotaBanner + tests + polish | 2 jours |

**Durée totale estimée : ~3 semaines**

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
