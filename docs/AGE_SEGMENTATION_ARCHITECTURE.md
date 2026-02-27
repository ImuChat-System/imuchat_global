# 🛡️ Architecture de segmentation par âge — ImuChat

> **Date** : 27 février 2026  
> **Statut** : 📐 Spécification technique (implémentation non démarrée)  
> **Pré-requis** : Phase C terminée (modules unifiés), Supabase `modules` table avec `default_enabled` / `is_core`  
> **Document source** : [segmentation_par_age.md](segmentation_par_age.md) (vision stratégique)

---

## 📌 Table des matières

1. [Objectif & Conformité](#1-objectif--conformité)
2. [Modèle de tiers d'âge](#2-modèle-de-tiers-dâge)
3. [Matrice des fonctionnalités par tier](#3-matrice-des-fonctionnalités-par-tier)
4. [Matrice des modules par tier](#4-matrice-des-modules-par-tier)
5. [Schéma de données](#5-schéma-de-données)
6. [Row Level Security (Supabase)](#6-row-level-security-supabase)
7. [Architecture côté client](#7-architecture-côté-client)
8. [Vérification d'âge & consentement parental](#8-vérification-dâge--consentement-parental)
9. [Module ImuGuardian (contrôle parental)](#9-module-imuguardian-contrôle-parental)
10. [Écrans UX à implémenter](#10-écrans-ux-à-implémenter)
11. [Plan d'implémentation](#11-plan-dimplémentation)
12. [Risques & Conformité RGPD / DSA / DMA](#12-risques--conformité-rgpd--dsa--dma)

---

## 1. Objectif & Conformité

ImuChat est une super-app (social, IA, wallet, store, mini-apps). La segmentation par âge est **obligatoire** pour :

| Réglementation | Exigence clé | Impact ImuChat |
|----------------|-------------|----------------|
| **RGPD** (Art. 8) | Consentement parental < 16 ans (ou < 13 selon l'État membre) | Consentement vérifiable pour KIDS + JUNIOR |
| **DSA** (Art. 28) | Interdiction de ciblage comportemental sur mineurs | Pas de tracking/analytics sur KIDS, JUNIOR, TEEN |
| **DSA** (Art. 35) | Évaluation des risques pour mineurs | Audit annuel + logs dédiés |
| **DMA** | Interopérabilité + choix de l'utilisateur | Les mineurs doivent pouvoir choisir leurs modules |
| **COPPA** (US) | Protection < 13 ans | Si marché US : conformité stricte KIDS |

**Principe directeur** : privacy by default, features by opt-in pour les mineurs.

---

## 2. Modèle de tiers d'âge

### Une seule app, 4 profils d'environnement dynamiques

```
┌──────────────────────────────────────────────┐
│               ImuChat (app unique)           │
│                                              │
│   ┌─────────┐ ┌─────────┐ ┌──────┐ ┌─────┐   │
│   │  KIDS   │ │ JUNIOR  │ │ TEEN │ │ADULT│   │
│   │  7-12   │ │  13-15  │ │16-17 │ │ 18+ │   │
│   └─────────┘ └─────────┘ └──────┘ └─────┘   │
│         │           │          │        │    │
│         └───────────┴──────────┴────────┘    │
│                      │                       │
│            Age Policy Layer                  │
│            (Supabase RLS +                   │
│             Feature Flags +                  │
│             UI Conditional)                  │
└──────────────────────────────────────────────┘
```

| Tier | Tranche | Consentement parental | Compte lié parent |
|------|---------|:---------------------:|:-----------------:|
| `KIDS` | 7–12 ans | ✅ Obligatoire (vérifiable) | ✅ Obligatoire |
| `JUNIOR` | 13–15 ans | ✅ Obligatoire (email) | ⚠️ Recommandé |
| `TEEN` | 16–17 ans | ❌ Non requis (RGPD Art. 8) | ❌ Optionnel |
| `ADULT` | 18+ | ❌ | ❌ |

---

## 3. Matrice des fonctionnalités par tier

### 3.1 FeatureFlagMatrix complète

```typescript
type UserAgeTier = 'KIDS' | 'JUNIOR' | 'TEEN' | 'ADULT';

interface FeatureFlagMatrix {
  // ── Communication ──
  publicMessagingEnabled: boolean;     // Messagerie avec inconnus
  groupsJoinPublicEnabled: boolean;    // Rejoindre des groupes publics
  callsVideoEnabled: boolean;          // Appels vidéo
  callsAudioEnabled: boolean;          // Appels audio
  anonymousPublicEnabled: boolean;     // Profil public anonyme

  // ── Social ──
  publicFeedEnabled: boolean;          // Feed social public
  storiesEnabled: boolean;             // Stories (contenu éphémère)
  profilePublicVisible: boolean;       // Profil visible publiquement

  // ── Économie ──
  walletEnabled: boolean;              // Wallet Imu
  walletWithdrawEnabled: boolean;      // Retraits wallet
  marketplaceEnabled: boolean;         // Marketplace achat/vente
  monetizationEnabled: boolean;        // Monétisation créateur

  // ── IA ──
  aiEnabled: boolean;                  // Module IA
  aiUnrestricted: boolean;             // IA sans filtres de contenu
  aiChatHistoryRetained: boolean;      // Historique IA conservé

  // ── Store & Mini-apps ──
  miniAppsStoreEnabled: boolean;       // Accès au Store
  miniAppsInstallEnabled: boolean;     // Installation de mini-apps
  miniAppsThirdPartyEnabled: boolean;  // Mini-apps tierces

  // ── Customisation ──
  customThemesEnabled: boolean;        // Thèmes personnalisés
  multiProfilesEnabled: boolean;       // Multi-profils

  // ── Parental ──
  parentalOverrideActive: boolean;     // Parent peut override les flags
  screenTimeLimitEnabled: boolean;     // Limite temps d'écran active
  activityReportEnabled: boolean;      // Rapport d'activité envoyé au parent
}
```

### 3.2 Presets par tier

| Fonctionnalité | KIDS | JUNIOR | TEEN | ADULT |
|----------------|:----:|:------:|:----:|:-----:|
| **Messagerie publique** | ❌ | ✅ (modérée) | ✅ | ✅ |
| **Groupes publics** | ❌ | ⚠️ limité | ✅ | ✅ |
| **Appels vidéo** | ❌ | ✅ (contacts validés) | ✅ | ✅ |
| **Appels audio** | ✅ (contacts validés) | ✅ | ✅ | ✅ |
| **Anonymat public** | ❌ | ❌ | ❌ | ✅ |
| **Feed social** | ❌ | ⚠️ modéré | ✅ | ✅ |
| **Stories** | ❌ | ✅ (amis) | ✅ | ✅ |
| **Profil public** | ❌ | ❌ | ✅ | ✅ |
| **Wallet** | ❌ | ❌ | ⚠️ (pas retrait) | ✅ |
| **Marketplace** | ❌ | ❌ | ⚠️ limité | ✅ |
| **Monétisation** | ❌ | ❌ | ❌ | ✅ |
| **IA** | ⚠️ filtrée | ⚠️ restreinte | ✅ (logs renforcés) | ✅ |
| **IA sans filtres** | ❌ | ❌ | ❌ | ✅ |
| **Store mini-apps** | ⚠️ curated | ✅ | ✅ | ✅ |
| **Mini-apps tierces** | ❌ | ⚠️ validées | ✅ | ✅ |
| **Thèmes custom** | ❌ | ✅ | ✅ | ✅ |
| **Multi-profils** | ❌ | ❌ | ❌ | ✅ |
| **Contrôle parental** | ✅ actif | ✅ optionnel | ❌ | ❌ |
| **Limite temps d'écran** | ✅ actif | ✅ optionnel | ❌ | ❌ |
| **Rapport activité** | ✅ actif | ✅ optionnel | ❌ | ❌ |

---

## 4. Matrice des modules par tier

Chaque module (core ou mini-app) a un `min_age_tier` qui définit le tier minimum requis.

| Module / Mini-app | `min_age_tier` | Raison |
|-------------------|:--------------:|--------|
| `chat` | `KIDS` | Core — contacts validés en mode KIDS |
| `calls` | `KIDS` | Audio only en KIDS, vidéo à partir de JUNIOR |
| `notifications` | `KIDS` | Infrastructure système |
| `hometab` | `KIDS` | Navigation (adaptée par tier) |
| `profile` | `KIDS` | Identité (simplifié en KIDS) |
| `help` | `KIDS` | Support |
| `themes` | `JUNIOR` | Personnalisation — trop complexe pour KIDS |
| `customize` | `JUNIOR` | Personnalisation UI avancée |
| `comms` | `JUNIOR` | Canaux/communautés — modéré |
| `store` | `JUNIOR` | Store curated en JUNIOR |
| `stories` | `JUNIOR` | Contenu éphémère — amis uniquement en JUNIOR |
| `wallet` | `TEEN` | Économie — pas de retrait en TEEN |
| `imu-events` | `JUNIOR` | Événements communautaires |
| `imu-music` | `KIDS` | Contenu musical (filtré en KIDS) |
| `imu-watch` | `JUNIOR` | Vidéo — modération nécessaire |
| `imu-games` | `KIDS` | Jeux éducatifs en KIDS, tous en JUNIOR+ |
| `imu-social-hub` | `JUNIOR` | Feed social |
| `imu-news` | `JUNIOR` | Actualités |
| `imu-podcasts` | `JUNIOR` | Contenu audio |
| `imu-dating` | `ADULT` | Rencontres — strictement 18+ |
| `imu-finance` | `ADULT` | Finance — strictement 18+ |
| `imu-admin` | `ADULT` | Administration |
| `imu-creator-studio` | `TEEN` | Création de contenu |
| `imu-stickers` | `KIDS` | Stickers / emojis |
| `imu-formations` | `JUNIOR` | Formations en ligne |
| `imu-library` | `KIDS` | Lecture (filtré par âge) |
| `imu-mobility` | `ADULT` | Transport / covoiturage |
| `imu-smart-home` | `TEEN` | Domotique |
| `imu-sports` | `KIDS` | Résultats sportifs |
| `imu-style-beauty` | `JUNIOR` | Style & beauté |
| `imu-worlds` | `JUNIOR` | Mondes virtuels |
| `imu-voom` | `JUNIOR` | Vidéos courtes (modérées) |
| `imu-services` | `ADULT` | Services professionnels |
| `imu-resources` | `JUNIOR` | Ressources éducatives |
| `imu-contests` | `JUNIOR` | Concours communautaires |

---

## 5. Schéma de données

### 5.1 Migration SQL

```sql
-- ================================================================
-- 🛡️ ImuChat — Segmentation par âge
-- Pré-requis : supabase_modules_unification.sql exécuté
-- ================================================================

-- ─── 1. Type ENUM pour les tiers d'âge ───────────────────────

DO $$ BEGIN
  CREATE TYPE public.user_age_tier AS ENUM ('KIDS', 'JUNIOR', 'TEEN', 'ADULT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. Colonne age_tier sur profiles ────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_tier public.user_age_tier DEFAULT 'ADULT';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parental_consent_verified BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_user_id UUID REFERENCES public.profiles(id);

COMMENT ON COLUMN public.profiles.age_tier IS
  'Tier d''âge déterminé à l''inscription. Conditionne les feature flags et les modules accessibles.';

COMMENT ON COLUMN public.profiles.date_of_birth IS
  'Date de naissance. Utilisée pour calculer le tier et détecter les passages (JUNIOR→TEEN, TEEN→ADULT).';

COMMENT ON COLUMN public.profiles.parental_consent_verified IS
  'True si le consentement parental a été vérifié (RGPD Art. 8). Obligatoire pour KIDS et JUNIOR.';

COMMENT ON COLUMN public.profiles.parent_user_id IS
  'Référence au profil du parent/tuteur (compte lié). NULL pour TEEN et ADULT.';

-- ─── 3. Colonne min_age_tier sur modules ─────────────────────

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS min_age_tier public.user_age_tier DEFAULT 'ADULT';

COMMENT ON COLUMN public.modules.min_age_tier IS
  'Tier d''âge minimum requis pour voir et installer ce module. ADULT par défaut (restrictif).';

-- ─── 4. Table feature_flag_overrides (overrides parentaux) ───

CREATE TABLE IF NOT EXISTS public.feature_flag_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  flag_value BOOLEAN NOT NULL,
  set_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, flag_name)
);

COMMENT ON TABLE public.feature_flag_overrides IS
  'Overrides de feature flags par le parent. Permet de restreindre (pas d''élargir) les flags du tier.';

-- ─── 5. Table parental_links (relation parent ↔ enfant) ──────

CREATE TABLE IF NOT EXISTS public.parental_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  consent_method TEXT CHECK (consent_method IN ('email', 'sms', 'id_verification', 'in_app')),
  consent_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

COMMENT ON TABLE public.parental_links IS
  'Liens parent-enfant vérifiés. Un parent peut avoir N enfants, un enfant peut avoir N tuteurs.';

-- ─── 6. Table screen_time_rules ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.screen_time_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  set_by UUID NOT NULL REFERENCES public.profiles(id),
  daily_limit_minutes INTEGER DEFAULT 120,
  bedtime_start TIME DEFAULT '21:00',
  bedtime_end TIME DEFAULT '07:00',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id)
);

-- ─── 7. Mise à jour min_age_tier des modules existants ───────

UPDATE public.modules SET min_age_tier = 'KIDS' WHERE id IN (
  'chat', 'calls', 'notifications', 'hometab', 'profile', 'help',
  'imu-music', 'imu-games', 'imu-stickers', 'imu-library', 'imu-sports'
);

UPDATE public.modules SET min_age_tier = 'JUNIOR' WHERE id IN (
  'themes', 'customize', 'comms', 'store', 'stories',
  'imu-events', 'imu-watch', 'imu-social-hub', 'imu-news', 'imu-podcasts',
  'imu-formations', 'imu-style-beauty', 'imu-worlds', 'imu-voom',
  'imu-resources', 'imu-contests'
);

UPDATE public.modules SET min_age_tier = 'TEEN' WHERE id IN (
  'wallet', 'imu-creator-studio', 'imu-smart-home'
);

UPDATE public.modules SET min_age_tier = 'ADULT' WHERE id IN (
  'imu-dating', 'imu-finance', 'imu-admin', 'imu-mobility', 'imu-services'
);

-- ─── 8. Fonction : calculer le tier depuis la date de naissance

CREATE OR REPLACE FUNCTION public.compute_age_tier(dob DATE)
RETURNS public.user_age_tier
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  age_years INTEGER;
BEGIN
  age_years := EXTRACT(YEAR FROM age(CURRENT_DATE, dob));
  
  IF age_years >= 18 THEN RETURN 'ADULT';
  ELSIF age_years >= 16 THEN RETURN 'TEEN';
  ELSIF age_years >= 13 THEN RETURN 'JUNIOR';
  ELSIF age_years >= 7 THEN RETURN 'KIDS';
  ELSE RETURN 'KIDS'; -- < 7 ans traités comme KIDS
  END IF;
END;
$$;

-- ─── 9. Fonction : mise à jour automatique du tier (anniversaire)

CREATE OR REPLACE FUNCTION public.update_age_tiers()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles p
  SET age_tier = public.compute_age_tier(p.date_of_birth),
      updated_at = now()
  WHERE p.date_of_birth IS NOT NULL
    AND p.age_tier != public.compute_age_tier(p.date_of_birth);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.update_age_tiers() IS
  'À exécuter quotidiennement (cron Supabase). Met à jour les tiers quand un utilisateur change de tranche d''âge.';

-- ─── 10. Index ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_age_tier ON public.profiles(age_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_user_id ON public.profiles(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_modules_min_age_tier ON public.modules(min_age_tier);
CREATE INDEX IF NOT EXISTS idx_parental_links_parent ON public.parental_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parental_links_child ON public.parental_links(child_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_overrides_user ON public.feature_flag_overrides(user_id);
```

### 5.2 Schéma Drizzle (platform-core)

```typescript
// À ajouter dans platform-core/src/db/schema.ts

import { pgEnum } from 'drizzle-orm/pg-core';

export const userAgeTierEnum = pgEnum('user_age_tier', [
  'KIDS', 'JUNIOR', 'TEEN', 'ADULT'
]);

// Ajouter à profiles :
//   ageTier: userAgeTierEnum('age_tier').default('ADULT'),
//   dateOfBirth: date('date_of_birth'),
//   parentalConsentVerified: boolean('parental_consent_verified').default(false),
//   parentUserId: uuid('parent_user_id').references(() => profiles.id),

export const parentalLinks = pgTable('parental_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id').notNull().references(() => profiles.id),
  childId: uuid('child_id').notNull().references(() => profiles.id),
  status: text('status').notNull().default('pending'),
  consentMethod: text('consent_method'),
  consentVerifiedAt: timestamp('consent_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const screenTimeRules = pgTable('screen_time_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  childId: uuid('child_id').notNull().references(() => profiles.id),
  setBy: uuid('set_by').notNull().references(() => profiles.id),
  dailyLimitMinutes: integer('daily_limit_minutes').default(120),
  bedtimeStart: time('bedtime_start').default('21:00'),
  bedtimeEnd: time('bedtime_end').default('07:00'),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const featureFlagOverrides = pgTable('feature_flag_overrides', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  flagName: text('flag_name').notNull(),
  flagValue: boolean('flag_value').notNull(),
  setBy: uuid('set_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

## 6. Row Level Security (Supabase)

### 6.1 Catalogue de modules filtré par tier

```sql
-- Les utilisateurs ne voient que les modules accessibles à leur tier
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see modules matching their age tier"
ON public.modules FOR SELECT
USING (
  min_age_tier <= (
    SELECT age_tier FROM public.profiles WHERE id = auth.uid()
  )::public.user_age_tier
);
```

> **Note** : le type ENUM a un ordre implicite (`KIDS` < `JUNIOR` < `TEEN` < `ADULT`). Un `TEEN` voit les modules avec `min_age_tier` = `KIDS`, `JUNIOR` ou `TEEN`.

### 6.2 Auto-install filtré par tier

La fonction `auto_install_default_modules(p_user_id)` existante doit être modifiée :

```sql
-- Modifier la requête d'auto-install pour respecter le tier
CREATE OR REPLACE FUNCTION public.auto_install_default_modules(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  installed_count INTEGER := 0;
  user_tier public.user_age_tier;
BEGIN
  -- Récupérer le tier de l'utilisateur
  SELECT age_tier INTO user_tier FROM public.profiles WHERE id = p_user_id;
  IF user_tier IS NULL THEN user_tier := 'ADULT'; END IF;
  
  INSERT INTO public.user_modules (user_id, module_id, is_active, permissions_granted)
  SELECT p_user_id, m.id, true, ARRAY['basic']
  FROM public.modules m
  WHERE m.default_enabled = true
    AND m.is_core = false
    AND m.is_published = true
    AND m.min_age_tier <= user_tier  -- ← filtrage par tier
    AND NOT EXISTS (
      SELECT 1 FROM public.user_modules um
      WHERE um.user_id = p_user_id AND um.module_id = m.id
    );
    
  GET DIAGNOSTICS installed_count = ROW_COUNT;
  RETURN installed_count;
END;
$$;
```

### 6.3 Parental links : le parent ne voit que ses enfants

```sql
ALTER TABLE public.parental_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents see their own links"
ON public.parental_links FOR SELECT
USING (parent_id = auth.uid() OR child_id = auth.uid());

CREATE POLICY "Parents can create links"
ON public.parental_links FOR INSERT
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update their links"
ON public.parental_links FOR UPDATE
USING (parent_id = auth.uid());
```

### 6.4 Feature flag overrides : lecture par l'enfant, écriture par le parent

```sql
ALTER TABLE public.feature_flag_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own overrides"
ON public.feature_flag_overrides FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Parents set overrides for their children"
ON public.feature_flag_overrides FOR ALL
USING (
  set_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.parental_links
    WHERE parent_id = auth.uid()
      AND child_id = feature_flag_overrides.user_id
      AND status = 'active'
  )
);
```

---

## 7. Architecture côté client

### 7.1 TypeScript types

```typescript
// web-app/src/types/age-tier.ts

export type UserAgeTier = 'KIDS' | 'JUNIOR' | 'TEEN' | 'ADULT';

export interface FeatureFlagMatrix {
  // Communication
  publicMessagingEnabled: boolean;
  groupsJoinPublicEnabled: boolean;
  callsVideoEnabled: boolean;
  callsAudioEnabled: boolean;
  anonymousPublicEnabled: boolean;
  // Social
  publicFeedEnabled: boolean;
  storiesEnabled: boolean;
  profilePublicVisible: boolean;
  // Économie
  walletEnabled: boolean;
  walletWithdrawEnabled: boolean;
  marketplaceEnabled: boolean;
  monetizationEnabled: boolean;
  // IA
  aiEnabled: boolean;
  aiUnrestricted: boolean;
  aiChatHistoryRetained: boolean;
  // Store
  miniAppsStoreEnabled: boolean;
  miniAppsInstallEnabled: boolean;
  miniAppsThirdPartyEnabled: boolean;
  // Customisation
  customThemesEnabled: boolean;
  multiProfilesEnabled: boolean;
  // Parental
  parentalOverrideActive: boolean;
  screenTimeLimitEnabled: boolean;
  activityReportEnabled: boolean;
}

/** Presets par tier — valeurs par défaut, overridables par le parent */
export const AGE_TIER_PRESETS: Record<UserAgeTier, FeatureFlagMatrix> = {
  KIDS: {
    publicMessagingEnabled: false,
    groupsJoinPublicEnabled: false,
    callsVideoEnabled: false,
    callsAudioEnabled: true,
    anonymousPublicEnabled: false,
    publicFeedEnabled: false,
    storiesEnabled: false,
    profilePublicVisible: false,
    walletEnabled: false,
    walletWithdrawEnabled: false,
    marketplaceEnabled: false,
    monetizationEnabled: false,
    aiEnabled: true,
    aiUnrestricted: false,
    aiChatHistoryRetained: false,
    miniAppsStoreEnabled: true,
    miniAppsInstallEnabled: true,
    miniAppsThirdPartyEnabled: false,
    customThemesEnabled: false,
    multiProfilesEnabled: false,
    parentalOverrideActive: true,
    screenTimeLimitEnabled: true,
    activityReportEnabled: true,
  },
  JUNIOR: {
    publicMessagingEnabled: true,
    groupsJoinPublicEnabled: true,
    callsVideoEnabled: true,
    callsAudioEnabled: true,
    anonymousPublicEnabled: false,
    publicFeedEnabled: true,
    storiesEnabled: true,
    profilePublicVisible: false,
    walletEnabled: false,
    walletWithdrawEnabled: false,
    marketplaceEnabled: false,
    monetizationEnabled: false,
    aiEnabled: true,
    aiUnrestricted: false,
    aiChatHistoryRetained: false,
    miniAppsStoreEnabled: true,
    miniAppsInstallEnabled: true,
    miniAppsThirdPartyEnabled: true,
    customThemesEnabled: true,
    multiProfilesEnabled: false,
    parentalOverrideActive: true,
    screenTimeLimitEnabled: true,
    activityReportEnabled: true,
  },
  TEEN: {
    publicMessagingEnabled: true,
    groupsJoinPublicEnabled: true,
    callsVideoEnabled: true,
    callsAudioEnabled: true,
    anonymousPublicEnabled: false,
    publicFeedEnabled: true,
    storiesEnabled: true,
    profilePublicVisible: true,
    walletEnabled: true,
    walletWithdrawEnabled: false,
    marketplaceEnabled: true,
    monetizationEnabled: false,
    aiEnabled: true,
    aiUnrestricted: false,
    aiChatHistoryRetained: true,
    miniAppsStoreEnabled: true,
    miniAppsInstallEnabled: true,
    miniAppsThirdPartyEnabled: true,
    customThemesEnabled: true,
    multiProfilesEnabled: false,
    parentalOverrideActive: false,
    screenTimeLimitEnabled: false,
    activityReportEnabled: false,
  },
  ADULT: {
    publicMessagingEnabled: true,
    groupsJoinPublicEnabled: true,
    callsVideoEnabled: true,
    callsAudioEnabled: true,
    anonymousPublicEnabled: true,
    publicFeedEnabled: true,
    storiesEnabled: true,
    profilePublicVisible: true,
    walletEnabled: true,
    walletWithdrawEnabled: true,
    marketplaceEnabled: true,
    monetizationEnabled: true,
    aiEnabled: true,
    aiUnrestricted: true,
    aiChatHistoryRetained: true,
    miniAppsStoreEnabled: true,
    miniAppsInstallEnabled: true,
    miniAppsThirdPartyEnabled: true,
    customThemesEnabled: true,
    multiProfilesEnabled: true,
    parentalOverrideActive: false,
    screenTimeLimitEnabled: false,
    activityReportEnabled: false,
  },
};
```

### 7.2 AgePolicyContext (React)

```typescript
// web-app/src/contexts/AgePolicyContext.tsx

'use client';

import { AGE_TIER_PRESETS, FeatureFlagMatrix, UserAgeTier } from '@/types/age-tier';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AgePolicyContextType {
  tier: UserAgeTier;
  flags: FeatureFlagMatrix;
  isAllowed: (flag: keyof FeatureFlagMatrix) => boolean;
  isMinor: boolean;
  loading: boolean;
}

const AgePolicyContext = createContext<AgePolicyContextType | undefined>(undefined);

export function AgePolicyProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<UserAgeTier>('ADULT');
  const [overrides, setOverrides] = useState<Partial<FeatureFlagMatrix>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger le tier depuis le profil Supabase + overrides parentaux
    async function load() {
      // 1. Récupérer age_tier du profil
      // 2. Récupérer feature_flag_overrides
      // 3. Merger preset + overrides
      setLoading(false);
    }
    load();
  }, []);

  const flags = useMemo(() => {
    const preset = AGE_TIER_PRESETS[tier];
    // Les overrides parentaux ne peuvent que RESTREINDRE (pas élargir)
    const merged = { ...preset };
    for (const [key, value] of Object.entries(overrides)) {
      if (preset[key as keyof FeatureFlagMatrix] === true && value === false) {
        (merged as any)[key] = false;
      }
    }
    return merged;
  }, [tier, overrides]);

  const isAllowed = (flag: keyof FeatureFlagMatrix) => flags[flag];
  const isMinor = tier !== 'ADULT';

  return (
    <AgePolicyContext.Provider value={{ tier, flags, isAllowed, isMinor, loading }}>
      {children}
    </AgePolicyContext.Provider>
  );
}

export function useAgePolicy() {
  const ctx = useContext(AgePolicyContext);
  if (!ctx) throw new Error('useAgePolicy must be used within AgePolicyProvider');
  return ctx;
}
```

### 7.3 Intégration avec ModulesContext

Le `ModulesContext` unifié filtre déjà les modules depuis Supabase. Avec la RLS (section 6.1), le catalogue est **automatiquement filtré** par `min_age_tier` côté serveur — aucune modification côté client nécessaire.

Pour les modules core statiques (chargés sans Supabase), le filtre s'applique côté client :

```typescript
// Dans ModulesContext.tsx, modifier l'initialisation :
const { tier } = useAgePolicy();

const filteredCoreModules = useMemo(() => {
  const tierOrder: Record<UserAgeTier, number> = { KIDS: 0, JUNIOR: 1, TEEN: 2, ADULT: 3 };
  const userLevel = tierOrder[tier];
  // Chaque manifest core doit avoir un champ minAgeTier
  return coreModules.filter(mod => {
    const modLevel = tierOrder[mod.minAgeTier ?? 'KIDS'];
    return modLevel <= userLevel;
  });
}, [coreModules, tier]);
```

### 7.4 Hook utilitaire pour le rendu conditionnel

```typescript
// web-app/src/hooks/useFeatureGate.ts

import { FeatureFlagMatrix } from '@/types/age-tier';
import { useAgePolicy } from '@/contexts/AgePolicyContext';

/**
 * Vérifie si une feature est accessible pour le tier courant.
 * Usage : const canUseWallet = useFeatureGate('walletEnabled');
 */
export function useFeatureGate(flag: keyof FeatureFlagMatrix): boolean {
  const { isAllowed } = useAgePolicy();
  return isAllowed(flag);
}

/**
 * Composant gate : ne rend les children que si le flag est actif.
 * Usage : <FeatureGate flag="walletEnabled"><WalletButton /></FeatureGate>
 */
export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof FeatureFlagMatrix;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const allowed = useFeatureGate(flag);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
```

---

## 8. Vérification d'âge & consentement parental

### 8.1 Flux d'inscription par tier

```
┌─────────────────────────────────────────────────────┐
│                  INSCRIPTION                         │
│                                                      │
│   1. Email / Phone / SSO                            │
│   2. "Quelle est ta date de naissance ?" (obligatoire) │
│   3. compute_age_tier(dob)                          │
│                                                      │
│   ┌─────────────┐  ┌──────────┐  ┌──────┐  ┌─────┐ │
│   │ KIDS (7-12) │  │ JUNIOR   │  │ TEEN │  │ADULT│ │
│   │             │  │ (13-15)  │  │(16-17│  │(18+)│ │
│   └──────┬──────┘  └────┬─────┘  └──┬───┘  └──┬──┘ │
│          │              │           │          │     │
│          ▼              ▼           │          │     │
│    ┌──────────────────────┐        │          │     │
│    │ CONSENTEMENT PARENTAL│        │          │     │
│    │                      │        │          │     │
│    │ • Email parent       │        │          │     │
│    │ • Lien de validation │        │          │     │
│    │ • Double opt-in      │        │          │     │
│    └──────────┬───────────┘        │          │     │
│               │                    │          │     │
│               ▼                    ▼          ▼     │
│         ┌─────────────────────────────────────┐     │
│         │         COMPTE ACTIVÉ               │     │
│         │  (tier déterminé, flags appliqués)  │     │
│         └─────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 8.2 Méthodes de vérification

| Méthode | Tiers | Fiabilité | Complexité |
|---------|:-----:|:---------:|:----------:|
| **Auto-déclaration** (date de naissance) | Tous | ⭐ Faible | Simple |
| **Email parental** (double opt-in) | KIDS, JUNIOR | ⭐⭐ Moyenne | Moyenne |
| **SMS parental** (code OTP) | KIDS, JUNIOR | ⭐⭐⭐ Bonne | Moyenne |
| **Vérification d'identité** (pièce d'identité) | KIDS (optionnel) | ⭐⭐⭐⭐ Haute | Complexe |
| **Estimation d'âge IA** (analyse visage) | Optionnel | ⭐⭐ Variable | Élevée |

**Recommandation MVP** : auto-déclaration + email parental obligatoire pour KIDS/JUNIOR. Ajouter SMS et ID verification en phase ultérieure.

### 8.3 Transition automatique de tier

Un utilisateur JUNIOR qui a 16 ans passe automatiquement en TEEN. Le mécanisme :

1. **Cron quotidien Supabase** : appelle `update_age_tiers()` (voir SQL section 5.1)
2. **Notification à l'utilisateur** : "Tu as maintenant accès à de nouvelles fonctionnalités !"
3. **Notification au parent** : "Votre enfant a changé de tranche d'âge"
4. **Les feature flags sont immédiatement mis à jour** (le preset du nouveau tier s'applique)
5. **Les modules débloqués apparaissent** (la RLS Supabase s'adapte automatiquement)

---

## 9. Module ImuGuardian (contrôle parental)

### 9.1 Vue d'ensemble

ImuGuardian est un **module core natif** (pas une mini-app) installé par défaut pour les parents de comptes KIDS/JUNIOR.

```
┌────────────────────────────────────────┐
│           ImuGuardian                  │
│                                        │
│   ┌──────────┐  ┌──────────────────┐  │
│   │ Dashboard │  │ Gestion enfants │  │
│   │ parental  │  │ (liste, ajout)  │  │
│   └──────────┘  └──────────────────┘  │
│                                        │
│   ┌──────────┐  ┌──────────────────┐  │
│   │ Temps    │  │ Feature Flags    │  │
│   │ d'écran  │  │ (overrides)      │  │
│   └──────────┘  └──────────────────┘  │
│                                        │
│   ┌──────────┐  ┌──────────────────┐  │
│   │ Contacts │  │ Rapport          │  │
│   │ validés  │  │ d'activité       │  │
│   └──────────┘  └──────────────────┘  │
│                                        │
│   ┌──────────────────────────────────┐│
│   │     🚨 Bouton urgence            ││
│   └──────────────────────────────────┘│
└────────────────────────────────────────┘
```

### 9.2 Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Validation contacts** | Approuver/refuser les nouveaux contacts de l'enfant |
| **Blocage utilisateurs** | Bloquer un utilisateur pour l'enfant |
| **Limite horaire** | Définir une durée quotidienne + heures de coucher |
| **Désactivation appels vidéo** | Override du flag `callsVideoEnabled` |
| **Rapport d'activité** | Résumé quotidien/hebdomadaire (sans accès aux messages E2EE) |
| **Bouton urgence** | L'enfant peut alerter le parent en 1 tap |
| **Gestion mini-apps** | Approuver/bloquer les installations de mini-apps |
| **Override feature flags** | Restreindre des fonctionnalités spécifiques |

### 9.3 Limites (respect de la vie privée)

- **PAS d'accès aux messages** (E2EE respecté)
- **PAS de lecture des DMs**
- **PAS de géolocalisation en temps réel** (sauf opt-in explicite de l'enfant TEEN)
- Le rapport d'activité montre : durée d'utilisation, modules utilisés, nombre de contacts, alertes de modération

---

## 10. Écrans UX à implémenter

### 10.1 Flux d'inscription (Auth)

| # | Écran | Tier concerné | Priorité |
|---|-------|:-------------:|:--------:|
| 1 | **Saisie date de naissance** | Tous | 🔴 MVP |
| 2 | **Écran "Tu as moins de 13 ans"** (explication + demande email parent) | KIDS | 🔴 MVP |
| 3 | **Écran consentement parental** (email envoyé, attente validation) | KIDS, JUNIOR | 🔴 MVP |
| 4 | **Écran validation parent** (lien reçu par email, confirmation) | KIDS, JUNIOR | 🔴 MVP |
| 5 | **Écran "Bienvenue [KIDS/JUNIOR/TEEN]"** (explication du tier) | Tous | 🟡 Post-MVP |

### 10.2 Paramètres utilisateur

| # | Écran | Tier concerné | Priorité |
|---|-------|:-------------:|:--------:|
| 6 | **Paramètres > Mon profil d'âge** (voir son tier + prochaine transition) | Tous | 🟡 Post-MVP |
| 7 | **Paramètres > Liens parentaux** (voir mes parents/tuteurs) | KIDS, JUNIOR | 🟡 Post-MVP |
| 8 | **Demande déblocage fonctionnalité** (envoie une demande au parent) | KIDS, JUNIOR | 🟢 Phase 2 |

### 10.3 Dashboard parental (ImuGuardian)

| # | Écran | Priorité |
|---|-------|:--------:|
| 9 | **Dashboard principal** (vue d'ensemble de tous les enfants) | 🟡 Post-MVP |
| 10 | **Profil enfant** (détail d'un enfant, flags, temps d'écran) | 🟡 Post-MVP |
| 11 | **Validation contacts** (liste des demandes en attente) | 🟡 Post-MVP |
| 12 | **Règles temps d'écran** (configuration limites) | 🟡 Post-MVP |
| 13 | **Rapport d'activité** (résumé quotidien/hebdomadaire) | 🟢 Phase 2 |
| 14 | **Gestion mini-apps** (approuver/bloquer les installations) | 🟢 Phase 2 |
| 15 | **Override feature flags** (UI granulaire) | 🟢 Phase 2 |

---

## 11. Plan d'implémentation

### Phase 1 — Fondations (MVP, 2-3 semaines)

> Objectif : activer seulement le tier ADULT, mais poser l'infrastructure.

- [ ] Exécuter la migration SQL (section 5.1)
- [ ] Ajouter le type `UserAgeTier` + `FeatureFlagMatrix` + presets (section 7.1)
- [ ] Créer `AgePolicyContext` (section 7.2) — initialisé à `ADULT` par défaut
- [ ] Créer `useFeatureGate` + `<FeatureGate>` (section 7.4)
- [ ] Ajouter la saisie date de naissance dans le flux d'inscription (écran 1)
- [ ] Modifier `auto_install_default_modules()` pour filtrer par tier (section 6.2)
- [ ] Ajouter `min_age_tier` aux 35+ modules existants (UPDATE SQL section 5.1)

### Phase 2 — Mineurs (Post-MVP, 3-4 semaines)

> Objectif : activer KIDS + JUNIOR avec consentement parental.

- [ ] Implémenter le flux consentement parental (email double opt-in) (écrans 2-4)
- [ ] Créer la table `parental_links` + UI de liaison (écran 7)
- [ ] Activer la RLS par tier sur le catalogue modules (section 6.1)
- [ ] Implémenter le cron `update_age_tiers()` (transition automatique)
- [ ] Adapter l'UI par tier (couleurs KIDS, modération JUNIOR)

### Phase 3 — ImuGuardian (4-6 semaines)

> Objectif : dashboard parental complet.

- [ ] Développer le module ImuGuardian (natif core)
- [ ] Implémenter `feature_flag_overrides` + UI (écrans 14-15)
- [ ] Implémenter `screen_time_rules` + enforcement (écran 12)
- [ ] Rapport d'activité (écran 13)
- [ ] Bouton urgence
- [ ] Validation contacts (écran 11)

### Phase 4 — Conformité avancée

- [ ] Vérification d'âge renforcée (SMS, ID verification)
- [ ] Audit DSA (Art. 35) — rapport de risques pour mineurs
- [ ] Désactivation ciblage comportemental pour mineurs (analytics)
- [ ] Documentation conformité RGPD

---

## 12. Risques & Conformité RGPD / DSA / DMA

| Risque | Impact | Probabilité | Atténuation |
|--------|:------:|:-----------:|-------------|
| **Auto-déclaration contournée** | Élevé | Élevée | Phase 4 : vérification renforcée (SMS/ID). Logs de tentatives. |
| **Parent absent / email invalide** | Moyen | Moyenne | Rappels automatiques. Compte KIDS/JUNIOR suspendu après 7j sans validation. |
| **Transition de tier mal gérée** | Moyen | Faible | Cron quotidien + notification enfant ET parent. Rollback possible. |
| **Vie privée enfant compromise** | Élevé | Faible | E2EE préservé. Rapport = métadonnées uniquement. Pas d'accès aux messages. |
| **Mini-app tierce inappropriée** | Élevé | Moyenne | `min_age_tier` sur chaque module. Review pipeline renforcé pour KIDS. |
| **Complexité UX pour les parents** | Moyen | Moyenne | OnBoarding guidé. Support dédié. Dashboard simple et clair. |
| **Surcharge de modération** | Moyen | Élevée | IA de modération + signalement simplifié. Prioriser les signalements mineurs. |

### Checklist conformité RGPD Art. 8

- [ ] Consentement parental vérifiable pour < 16 ans (ou < 13 selon l'État membre)
- [ ] Pas de traitement de données à des fins marketing pour les mineurs
- [ ] Droit à l'effacement facilité pour les mineurs
- [ ] Privacy by default (paramètres restrictifs par défaut pour KIDS/JUNIOR)
- [ ] Responsable du traitement clairement identifié
- [ ] DPO (Data Protection Officer) désigné si > 250 employés

### Checklist DSA Art. 28 & 35

- [ ] Pas de ciblage comportemental sur les mineurs
- [ ] Évaluation des risques pour les mineurs (rapport annuel)
- [ ] Signalement accessible et simplifié pour les mineurs
- [ ] Modération renforcée des contenus accessibles aux mineurs

---

## 📎 Documents de référence

- [segmentation_par_age.md](segmentation_par_age.md) — Document de vision stratégique (source)
- [ARCHITECTURE_MODULES_AUDIT.md](ARCHITECTURE_MODULES_AUDIT.md) — Audit modules (Phase A-C-D)
- [APPS_MVP.md](APPS_MVP.md) — Vision super-app
- `supabase_modules_unification.sql` — Migration unification registres (à enrichir avec age_tier)
- `web-app/src/contexts/ModulesContext.tsx` — Context modules unifié
- `platform-core/src/db/schema.ts` — Schéma Drizzle profiles (à enrichir)

---

> **Stratégie de déploiement** : activer uniquement le tier `ADULT` au lancement. Les tiers KIDS/JUNIOR/TEEN sont **en mode dormant** — l'infrastructure est en place mais le flux de vérification d'âge n'est pas encore obligatoire. Cela évite une refonte ultérieure tout en permettant un déploiement progressif.
