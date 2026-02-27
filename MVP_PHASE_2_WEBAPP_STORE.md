# 🚀 ImuChat — MVP Phase 2 : Web-App & Store

> **Document de planification stratégique**
> Date de création : Février 2026
> Statut : PLANIFIÉ
> Périmètre : Web-App + Store + Infrastructure transversale

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [État actuel — Ce qui est FAIT](#2-état-actuel--ce-qui-est-fait)
3. [Sprint 0 — Finalisation Phase 1 (S0, 2 semaines)](#3-sprint-0--finalisation-phase-1-s0-2-semaines)
4. [Périmètre MVP Phase 2](#4-périmètre-mvp-phase-2)
5. [Sprint 1 — Store Monétisation & APIs réelles (S1-S2)](#5-sprint-1--store-monétisation--apis-réelles-s1-s2)
6. [Sprint 2 — Segmentation par âge & Wallet (S3-S4)](#6-sprint-2--segmentation-par-âge--wallet-s3-s4)
7. [Sprint 3 — Communautés avancées & Gamification (S5-S6)](#7-sprint-3--communautés-avancées--gamification-s5-s6)
8. [Sprint 4 — Admin, Testing & Infrastructure (S7-S8)](#8-sprint-4--admin-testing--infrastructure-s7-s8)
9. [Détail technique par domaine](#9-détail-technique-par-domaine)
10. [Écrans à implémenter](#10-écrans-à-implémenter)
11. [Prérequis techniques](#11-prérequis-techniques)
12. [Métriques de succès](#12-métriques-de-succès)
13. [Risques & Mitigations](#13-risques--mitigations)
14. [Timeline consolidée](#14-timeline-consolidée)
15. [Documents de référence](#15-documents-de-référence)

---

## 1. Résumé exécutif

La Phase 1 du MVP web-app est **complétée à ~70%** avec un socle technique solide : App Shell 3 colonnes, Dashboard, Raccourcis clavier, Notifications, Social Hub, Profil/Settings, Watch/Media, et Store/Modules. L'architecture modulaire (Phases A-D) est opérationnelle avec SDK v0.1.0, CLI v0.1.0, Developer Portal, Review Pipeline et Webhooks.

**Avant d'amorcer la Phase 2, un Sprint 0 de 2 semaines est nécessaire** pour finaliser les items restants de la Phase 1 (APIs réelles, WebSocket, performance, profil) qui sont des dépendances bloquantes pour les sprints suivants.

**La Phase 2 vise à transformer ImuChat d'un prototype fonctionnel en une plateforme économiquement viable et réglementairement solide**, en ciblant 4 axes stratégiques :

1. **Monétisation du Store** — Revenue share, ImuCoin, paiements développeurs
2. **Segmentation par âge** — Infrastructure KIDS/JUNIOR/TEEN/ADULT conforme RGPD
3. **Communautés & Gamification** — Serveurs avancés, XP, badges, missions
4. **Qualité & Infrastructure** — Tests 70%+, CI/CD, Admin dashboard, APIs réelles

**Durée estimée : 10 semaines (Sprint 0 + 4 sprints de 2 semaines)**

---

## 2. État actuel — Ce qui est FAIT

### 2.1 Web-App — Fonctionnalités livrées

| Domaine | Statut | Détails |
|---------|:------:|---------|
| **App Shell** | ✅ | Layout 3 colonnes, sidebar, header, responsive |
| **Dashboard** | ✅ | Widgets dynamiques, activité récente |
| **Raccourcis clavier** | ✅ | 5 globaux + Command Palette (Cmd+K) |
| **Notifications** | ✅ | Zustand store + Socket.IO temps réel |
| **Social Hub** | ✅ | 19 fichiers, 7 composants, 3 pages, feed + stories |
| **Profil & Settings** | ✅ | 16 composants, 6 sections de paramètres |
| **Watch & Media** | ✅ | 26+ composants, live streaming, player |
| **Store & Modules** | ✅ | 11 composants, hook centralisé, 14 pages |
| **PWA** | ✅ | Manifest, Service Worker, offline queue, icônes |
| **Rich Text** | ✅ | Barre de formatage + rendu markdown |
| **Desktop Notifications** | ✅ | API Notification intégrée |
| **Auth** | ✅ | Supabase Auth complet |
| **WebRTC Calls** | ✅ | Stream Video SDK, appels audio/vidéo |
| **WebSocket** | ~90% | Socket.IO fonctionnel, tests restants |

### 2.2 Architecture Modules — Phases complétées

| Phase | Statut | Réalisations |
|-------|:------:|-------------|
| **Phase A** | ✅ | Registre unifié, 27 modules enregistrés, ModulesContext |
| **Phase B** | ✅ | 23 modules extraits en mini-apps, IPC/iframe isolation |
| **Phase C** | ✅ | SDK v0.1.0, CLI v0.1.0, templates, validation |
| **Phase D** | ✅ | Developer Portal, Review Pipeline, Webhooks, admin_profiles |

### 2.3 Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Tests passants | 905 |
| Erreurs TypeScript | 0 |
| Fichiers source | 300+ |
| Routes | 40+ |
| Modules enregistrés | 27 |
| Couverture tests | ~7% (à améliorer) |

### 2.4 Ce qui reste de la Phase 1 — Inventaire complet

#### Items bloquants (à finir AVANT Phase 2 → Sprint 0)

| ID | Titre | Statut | % fait | Reste à faire | Effort |
|----|-------|:------:|:------:|---------------|:------:|
| **OPT-004** | Mock→Real APIs (Phase 2) | 🔴 Non démarré | Phase 1 ✅ | Tables Supabase domaines secondaires + services API par domaine | 5-8j |
| **BUG-004** | WebSocket Temps Réel | 🟢 ~95% | ~95% | Tests WebSocket | 1j |
| **OPT-001** | Performance Bundle | 🟡 ~60% | ~60% | Image optimization (next/image), font optimization (preload) | 1j |
| **DEV-004b** | Profile & Settings | 🟡 ~80% | ~80% | ProfilePosts, ProfileMedia, Security 2FA avancé | 1-2j |
| **DEV-005d** | Desktop Notifications | 🟡 ~60% | ~60% | Actions dans notifications, badges d'application | 0.5j |
| **DEV-007** | Contextes/State Management | 🟢 ~90% | ~90% | Tests unitaires des contextes | 1j |
| **OPT-006** | Documentation Markdown | 🔴 Ouvert | 0% | Lint & fix formatage MD docs | 0.5j |

#### Items absorbés dans Phase 2 (pas bloquants)

| ID | Titre | Statut | Absorbé dans |
|----|-------|:------:|:------------:|
| **OPT-002** | Tests Unitaires (~7%) | 🔴 Non démarré | Sprint 4 — Testing 70%+ |
| **OPT-005** | Accessibilité WCAG | 🟡 ~10% | Sprint 4 — A11y WCAG AA |
| **DEV-006** | Infrastructure & Tooling | 🟡 ~5% | Sprint 4 — CI/CD + Sentry + Storybook |

#### Items reportés à Phase 3 (pas prioritaires)

| ID | Titre | Statut | Raison du report |
|----|-------|:------:|------------------|
| **DEV-005a** | Drag & Drop | 🔴 0% | Feature "nice-to-have", aucune dépendance Phase 2 |
| **DEV-005b** | Split View | 🔴 0% | Feature desktop avancée, non critique |
| **DEV-005c** | Picture-in-Picture | 🔴 0% | Dépend de l'enrichissement appels (Phase 3) |
| **BUG-005** | WebRTC tests cross-browser | ✅ ~98% | Tests manuels uniquement, pas automatisables |

---

## 3. Sprint 0 — Finalisation Phase 1 (S0, 2 semaines)

> **Objectif** : Éliminer la dette technique Phase 1 et poser des fondations solides avant de démarrer les nouveaux domaines Phase 2. Ce sprint est un **prérequis bloquant** : le Sprint 1 (Store monétisation) est impossible sur du seed data.

### 3.0 Pourquoi un Sprint 0 ?

```
  OPT-004 (APIs réelles) ──────► Sprint 1 (Store monétisation)
                                  │ Les tables store_transactions
                                  │ référencent profiles, modules
                                  │ qui doivent être réels
                                  │
  BUG-004 (WebSocket) ────────► Sprint 3 (Gamification)
                                  │ Notifications XP/badges temps
                                  │ réel via Socket.IO
                                  │
  DEV-004b (Profile) ─────────► Sprint 2 (Age Segmentation)
                                  │ Le profil est le point d'ancrage
                                  │ de age_tier et date_of_birth
```

### 3.1 Semaine 1 — APIs réelles & WebSocket

| Tâche | ID source | Priorité | Effort |
|-------|:---------:|:--------:|:------:|
| Créer tables Supabase pour domaines secondaires (smart-home, sports, dating, news, etc.) | OPT-004 | 🔴 P0 | 2j |
| Écrire services API par domaine (pattern `social-hub-api.ts` / `watch-api.ts`) | OPT-004 | 🔴 P0 | 2j |
| Remplacer tous les imports `@/lib/data` par hooks Supabase + fallback seed | OPT-004 | 🔴 P0 | 2j |
| Vérifier 0 import restant vers mock-data / seed data | OPT-004 | 🔴 P0 | 0.5j |
| Tests WebSocket : couverture complète Socket.IO (connect, reconnect, events) | BUG-004 | 🔴 P0 | 1j |
| Tests cross-browser WebRTC : validation manuelle Chrome/Firefox/Safari/Edge | BUG-005 | 🟡 P1 | 0.5j |

### 3.2 Semaine 2 — Profile, Performance, Polish

| Tâche | ID source | Priorité | Effort |
|-------|:---------:|:--------:|:------:|
| Implémenter `ProfilePosts.tsx` — onglet posts du profil utilisateur | DEV-004b | 🔴 P0 | 0.5j |
| Implémenter `ProfileMedia.tsx` — galerie médias du profil | DEV-004b | 🔴 P0 | 0.5j |
| Implémenter `SecuritySettingsForm` — 2FA avancé (TOTP, recovery codes) | DEV-004b | 🟡 P1 | 1j |
| Image optimization : migrer vers `next/image` partout | OPT-001 | 🟡 P1 | 0.5j |
| Font optimization : preload fonts critiques | OPT-001 | 🟡 P1 | 0.5j |
| Desktop Notifications : actions dans les notifications | DEV-005d | 🟡 P1 | 0.5j |
| Desktop Notifications : badges d'application | DEV-005d | 🟢 P2 | 0.5j |
| Tests unitaires contextes (LayoutContext, SearchContext, etc.) | DEV-007 | 🟡 P1 | 1j |
| Lint & fix formatage Markdown documentation | OPT-006 | 🟢 P2 | 0.5j |
| Mesurer baseline : bundle size, TTI, Lighthouse scores | OPT-001 | 🟡 P1 | 0.5j |

### 3.3 Critères de sortie Sprint 0

- [ ] **0 import** vers `@/lib/data` ou `mock-data.ts` dans le code source
- [ ] **Toutes les pages** chargent leurs données depuis Supabase (avec fallback gracieux)
- [ ] **Tests WebSocket** passent (reconnexion, offline queue, heartbeat)
- [ ] **Profile & Settings** à 100% (ProfilePosts, ProfileMedia, Security)
- [ ] **Images optimisées** avec `next/image` sur les pages principales
- [ ] **Baseline mesurée** : Lighthouse Performance, bundle size, TTI documentés
- [ ] **0 erreur TypeScript** maintenu

### 3.4 Résumé Sprint 0

| Domaine | Effort (j) |
|---------|:----------:|
| APIs réelles (OPT-004) | 6.5 |
| WebSocket & WebRTC (BUG-004/005) | 1.5 |
| Profile & Settings (DEV-004b) | 2 |
| Performance (OPT-001) | 1.5 |
| Desktop Notifications (DEV-005d) | 1 |
| Contextes/Tests (DEV-007) | 1 |
| Documentation (OPT-006) | 0.5 |
| **TOTAL Sprint 0** | **~14 jours** |

---

## 4. Périmètre MVP Phase 2

### 4.1 Objectifs stratégiques

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    MVP PHASE 2                               │
  │                                                              │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
  │  │ 💰 MONÉTISER │  │ 🛡️ SÉCURISER │  │ 🎮 ENGAGER       │  │
  │  │              │  │              │  │                   │  │
  │  │ Store P&L    │  │ Age tiers    │  │ Communautés      │  │
  │  │ ImuCoin      │  │ RGPD/DSA     │  │ Gamification     │  │
  │  │ Wallet       │  │ ImuGuardian  │  │ XP/Badges        │  │
  │  │ Abonnements  │  │ Parental     │  │ Missions         │  │
  │  └──────────────┘  └──────────────┘  └──────────────────┘  │
  │                                                              │
  │  ┌────────────────────────────────────────────────────────┐ │
  │  │             🏗️ INDUSTRIALISER                          │ │
  │  │                                                        │ │
  │  │ APIs réelles • Tests 70% • CI/CD • Admin dashboard    │ │
  │  │ Sentry • Storybook • A11y WCAG AA • CDN cache         │ │
  │  └────────────────────────────────────────────────────────┘ │
  └─────────────────────────────────────────────────────────────┘
```

### 4.2 Hors périmètre Phase 2

- Internationalisation (i18n) complète — Phase 3
- Application mobile native (Expo) — développement séparé
- Mini-apps tierces externes — Phase 3+
- IA avancée (multi-personas, mémoire) — Phase 3
- Vérification d'âge renforcée (ID/SMS) — Phase 3
- Desktop multi-fenêtrage avancé — Phase 3

---

## 5. Sprint 1 — Store Monétisation & APIs réelles (S1-S2)

> **Objectif** : Rendre le Store économiquement fonctionnel et connecter les données réelles.

### 5.1 Store — Système de monétisation

#### Revenue Share (commission plateforme)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer table `store_transactions` (SQL) | 🔴 P0 | 0.5j |
| Créer table `developer_payouts` (SQL) | 🔴 P0 | 0.5j |
| Créer table `revenue_share_config` (SQL) | 🔴 P0 | 0.5j |
| Implémenter le calcul revenue share (70/30 développeur/plateforme) | 🔴 P0 | 1j |
| API endpoint : `POST /api/store/purchase` | 🔴 P0 | 1j |
| API endpoint : `GET /api/developer/earnings` | 🔴 P0 | 0.5j |
| UI : Page revenus développeur dans Developer Portal | 🟡 P1 | 1j |
| UI : Historique transactions développeur | 🟡 P1 | 1j |

**Schema SQL — `store_transactions`** :

```sql
CREATE TABLE IF NOT EXISTS public.store_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  module_id TEXT NOT NULL REFERENCES public.modules(id),
  developer_id UUID NOT NULL REFERENCES public.developer_profiles(user_id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  platform_fee_cents INTEGER NOT NULL, -- Commission ImuChat (30%)
  developer_payout_cents INTEGER NOT NULL, -- Part développeur (70%)
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'imucoin', 'apple_iap', 'google_play')),
  payment_provider_tx_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.developer_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES public.developer_profiles(user_id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payout_method TEXT CHECK (payout_method IN ('bank_transfer', 'paypal', 'imucoin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
```

#### ImuCoin — Monnaie interne

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer table `imucoin_wallets` | 🔴 P0 | 0.5j |
| Créer table `imucoin_transactions` | 🔴 P0 | 0.5j |
| Fonction SQL : `transfer_imucoins(from, to, amount)` avec vérification solde | 🔴 P0 | 1j |
| API endpoint : `GET /api/wallet/balance` | 🔴 P0 | 0.5j |
| API endpoint : `POST /api/wallet/purchase-coins` | 🟡 P1 | 1j |
| Intégration Stripe Checkout pour achat ImuCoins | 🟡 P1 | 2j |

### 5.2 APIs réelles — Connexion Supabase par domaine

> Finaliser OPT-004 Phase 2 : remplacer les seed data par des APIs Supabase réelles.

| Domaine | Tables Supabase | Effort |
|---------|----------------|:------:|
| **Social Hub** | posts, comments, reactions, stories | 1j |
| **Watch & Media** | videos, channels, live_streams, playlists | 1j |
| **Store** | modules, reviews, store_transactions | 1j |
| **Settings** | user_preferences, notification_settings | 0.5j |
| **Notifications** | notifications (déjà partiellement fait) | 0.5j |
| **Dashboard** | Agrégation des tables ci-dessus | 1j |

**Total Sprint 1 : ~16 jours-développeur**

---

## 6. Sprint 2 — Segmentation par âge & Wallet (S3-S4)

> **Objectif** : Poser l'infrastructure de segmentation (ADULT-only au lancement) et implémenter le Wallet utilisateur.

### 6.1 Segmentation par âge — Fondations

> Référence détaillée : `docs/AGE_SEGMENTATION_ARCHITECTURE.md` (1013 lignes)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Exécuter migration SQL segmentation (ENUM, colonnes, tables) | 🔴 P0 | 0.5j |
| Implémenter types `UserAgeTier` + `FeatureFlagMatrix` + presets | 🔴 P0 | 0.5j |
| Créer `AgePolicyContext` (initialisé à ADULT par défaut) | 🔴 P0 | 1j |
| Créer hooks `useFeatureGate` + composant `<FeatureGate>` | 🔴 P0 | 0.5j |
| Modifier `auto_install_default_modules()` pour filtrer par `min_age_tier` | 🔴 P0 | 0.5j |
| Ajouter `min_age_tier` aux 35+ modules existants (UPDATE SQL) | 🔴 P0 | 0.5j |
| Ajouter champ date de naissance dans le flux d'inscription | 🟡 P1 | 1j |
| RLS : filtrage catalogue modules par tier | 🟡 P1 | 1j |
| Intégrer `AgePolicyContext` dans `ModulesContext` (filtrage core) | 🟡 P1 | 0.5j |

> **Stratégie** : Activer uniquement le tier ADULT au lancement. Les tiers KIDS/JUNIOR/TEEN restent dormants — l'infrastructure est en place mais le flux de vérification d'âge n'est pas encore obligatoire.

### 6.2 Wallet utilisateur (ImuBank)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Page `/wallet` — Dashboard wallet (solde, transactions récentes) | 🔴 P0 | 1j |
| Page `/wallet/transactions` — Historique complet | 🔴 P0 | 1j |
| Page `/wallet/add-funds` — Ajout de fonds (Stripe) | 🟡 P1 | 1.5j |
| Composant `WalletCard` (mini-widget pour sidebar) | 🟡 P1 | 0.5j |
| Modal paiement in-app sécurisé | 🟡 P1 | 1j |
| Page `/wallet/subscriptions` — Gestion abonnements | 🟢 P2 | 1j |

### 6.3 Intégration Stripe

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Configuration Stripe Connect pour développeurs | 🔴 P0 | 1j |
| Webhook Stripe → `store_transactions` update | 🔴 P0 | 1j |
| Stripe Checkout pour achats modules premium | 🔴 P0 | 1j |
| Stripe Checkout pour achats ImuCoins | 🟡 P1 | 0.5j |

**Total Sprint 2 : ~14 jours-développeur**

---

## 7. Sprint 3 — Communautés avancées & Gamification (S5-S6)

> **Objectif** : Enrichir l'engagement utilisateur avec des communautés type Discord et un système de gamification.

### 7.1 Communautés / Serveurs avancés

> Référence : `OTHERS_SCREENS.md` Section 3 + `OTHERS_SCREENS_FONCTIONNALITIES.md` Section 3

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer tables `servers`, `server_members`, `server_roles`, `server_channels` | 🔴 P0 | 1j |
| Page `/servers/create` — Création serveur avec templates | 🔴 P0 | 1j |
| Page `/servers/[id]` — Vue serveur (channels, membres) | 🔴 P0 | 2j |
| Page `/servers/[id]/settings` — Paramètres serveur | 🟡 P1 | 1j |
| Composant `RoleManager` — Gestion hiérarchie rôles | 🟡 P1 | 1.5j |
| Page `/servers/[id]/audit-log` — Journal d'audit admin | 🟡 P1 | 1j |
| Système d'invitations custom (lien, durée, quota) | 🟡 P1 | 1j |
| Automodération (mots interdits, flood, spam) | 🟢 P2 | 1.5j |
| RLS : permissions granulaires par rôle | 🔴 P0 | 1j |

### 7.2 Gamification

> Référence : `OTHERS_SCREENS.md` Section 11 + `OTHERS_SCREENS_FONCTIONNALITIES.md` Section 11

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer tables `user_xp`, `badges`, `user_badges`, `missions`, `user_missions` | 🔴 P0 | 1j |
| Fonction SQL : `grant_xp(user_id, amount, reason)` | 🔴 P0 | 0.5j |
| Fonction SQL : `check_and_award_badges(user_id)` | 🟡 P1 | 1j |
| Page `/profile/achievements` — Badges & trophées | 🔴 P0 | 1j |
| Composant `XPBar` — Barre de progression dans le header | 🔴 P0 | 0.5j |
| Page `/missions` — Missions quotidiennes/hebdomadaires | 🟡 P1 | 1.5j |
| Page `/leaderboard` — Classement global et par serveur | 🟡 P1 | 1j |
| Hook `useXP` — Zustand store pour XP temps réel | 🔴 P0 | 0.5j |
| Trigger Supabase : XP automatique sur actions (post, message, reaction) | 🟡 P1 | 1j |
| Notifications pour badges débloqués | 🟢 P2 | 0.5j |

### 7.3 Schéma SQL — Gamification

```sql
-- ─── XP & Niveaux ───
CREATE TABLE IF NOT EXISTS public.user_xp (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  xp_this_week INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Badges ───
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT CHECK (category IN ('social', 'chat', 'store', 'community', 'achievement', 'special')),
  xp_required INTEGER DEFAULT 0,
  condition_type TEXT CHECK (condition_type IN ('xp_threshold', 'action_count', 'streak', 'manual')),
  condition_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id),
  awarded_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- ─── Missions ───
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  mission_type TEXT CHECK (mission_type IN ('daily', 'weekly', 'one_time', 'seasonal')),
  condition JSONB NOT NULL, -- ex: {"action": "send_message", "count": 5}
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Total Sprint 3 : ~18 jours-développeur**

---

## 8. Sprint 4 — Admin, Testing & Infrastructure (S7-S8)

> **Objectif** : Industrialiser la plateforme avec qualité, monitoring et outils d'administration.

### 8.1 Admin Dashboard

> Référence : `OTHERS_SCREENS.md` Section 14 + `ARCHITECTURE_MODULES_AUDIT.md` Phase D+

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Page `/admin` — Dashboard global (utilisateurs, modules, revenus) | 🔴 P0 | 2j |
| Page `/admin/users` — Gestion utilisateurs (ban/suspend/view) | 🔴 P0 | 1.5j |
| Page `/admin/modules` — Review pipeline UI (approve/reject/request_changes) | 🔴 P0 | 1.5j |
| Page `/admin/reports` — Contenu signalé + modération | 🟡 P1 | 1.5j |
| Page `/admin/revenue` — Dashboard financier (transactions, payouts) | 🟡 P1 | 1j |
| Page `/admin/feature-flags` — Gestion feature flags globale | 🟡 P1 | 1j |
| Middleware : vérification rôle admin (`admin_profiles`) | 🔴 P0 | 0.5j |
| RLS : politiques admin sur toutes les tables sensibles | 🔴 P0 | 1j |

### 8.2 Testing — De 7% à 70%+

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests unitaires : composants Store (11 composants) | 🔴 P0 | 2j |
| Tests unitaires : composants Social Hub (7 composants) | 🔴 P0 | 1.5j |
| Tests unitaires : composants Watch (26 composants) | 🟡 P1 | 3j |
| Tests unitaires : composants Profile/Settings (16 composants) | 🟡 P1 | 2j |
| Tests unitaires : hooks Zustand stores | 🔴 P0 | 1j |
| Tests d'intégration : flux auth + inscription | 🔴 P0 | 1j |
| Tests d'intégration : flux achat module Store | 🔴 P0 | 1j |
| Tests E2E Playwright : parcours critique (login → dashboard → store → achat) | 🟡 P1 | 2j |
| Tests E2E Playwright : parcours communauté (créer serveur → inviter → poster) | 🟡 P1 | 1.5j |
| Configuration couverture dans CI | 🔴 P0 | 0.5j |

### 8.3 CI/CD Pipeline

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| GitHub Actions : lint + type-check + tests sur chaque PR | 🔴 P0 | 1j |
| GitHub Actions : build + deploy preview (Vercel) | 🔴 P0 | 0.5j |
| GitHub Actions : déploiement staging automatique | 🟡 P1 | 0.5j |
| GitHub Actions : déploiement production sur tag | 🟡 P1 | 0.5j |
| Sentry : intégration error tracking | 🔴 P0 | 0.5j |
| Storybook : configuration + stories pour ui-kit | 🟢 P2 | 2j |

### 8.4 Accessibilité WCAG AA

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Audit axe-core automatisé sur toutes les pages | 🔴 P0 | 0.5j |
| Fix : focus management (skip links, focus trap modals) | 🔴 P0 | 1j |
| Fix : aria labels sur composants interactifs | 🔴 P0 | 1j |
| Fix : contraste couleurs (ratio 4.5:1 texte, 3:1 large) | 🟡 P1 | 0.5j |
| Fix : navigation clavier complète | 🟡 P1 | 1j |
| Fix : reduce-motion, prefers-color-scheme | 🟢 P2 | 0.5j |

### 8.5 Performance & CDN

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| CDN cache invalidation pour assets mini-apps | 🟡 P1 | 1j |
| Image optimization (next/image, WebP, lazy loading) | 🟡 P1 | 0.5j |
| Bundle analysis + code splitting par route | 🟡 P1 | 0.5j |
| Lighthouse CI (target : Performance 90+, A11y 90+) | 🟢 P2 | 0.5j |

**Total Sprint 4 : ~28 jours-développeur (parallélisable sur 2 devs = 14 jours)**

---

## 9. Détail technique par domaine

### 9.1 Store — Architecture monétisation

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUX D'ACHAT MODULE                        │
│                                                               │
│  Utilisateur → [Bouton Acheter] → Modal Paiement             │
│       │                               │                       │
│       │    ┌──────────────────────────┼──────────────┐       │
│       │    │       MODE PAIEMENT      │              │       │
│       │    │                          │              │       │
│       │    ▼                          ▼              ▼       │
│       │  Stripe         ImuCoin       Apple/Google   │       │
│       │  Checkout      (interne)      IAP            │       │
│       │    │              │              │            │       │
│       │    └──────────────┼──────────────┘            │       │
│       │                   ▼                           │       │
│       │          store_transactions                   │       │
│       │           (status: pending)                   │       │
│       │                   │                           │       │
│       │             Webhook/Callback                  │       │
│       │                   │                           │       │
│       │                   ▼                           │       │
│       │          store_transactions                   │       │
│       │          (status: completed)                  │       │
│       │                   │                           │       │
│       │          ┌────────┴────────┐                  │       │
│       │          ▼                 ▼                  │       │
│       │   developer_payout    platform_fee            │       │
│       │      (70%)              (30%)                 │       │
│       │                                               │       │
│       ▼                                               │       │
│  Module débloqué → user_modules (is_active: true)    │       │
└──────────────────────────────────────────────────────────────┘
```

**Commission** : 70% développeur / 30% plateforme (modifiable dans `revenue_share_config`)

**Payouts développeurs** : Cycle mensuel, minimum 50€, via Stripe Connect ou PayPal

### 9.2 Segmentation par âge — Architecture

```
┌───────────────────────────────────────────────────┐
│              INSCRIPTION                           │
│                                                    │
│  1. Auth (email/phone/SSO)                        │
│  2. Date de naissance (obligatoire)               │
│  3. compute_age_tier(dob)                         │
│                                                    │
│  ┌───────┐  ┌────────┐  ┌──────┐  ┌───────┐     │
│  │ KIDS  │  │ JUNIOR │  │ TEEN │  │ ADULT │     │
│  │ 7-12  │  │ 13-15  │  │16-17 │  │  18+  │     │
│  └───┬───┘  └───┬────┘  └──┬───┘  └───┬───┘     │
│      │          │           │          │          │
│      ▼          ▼           │          │          │
│  Consentement parental      │          │          │
│  (email double opt-in)      │          │          │
│      │                      │          │          │
│      └──────────────────────┴──────────┘          │
│                     │                              │
│                     ▼                              │
│            AgePolicyContext                         │
│         (FeatureFlagMatrix)                        │
│                     │                              │
│         ┌───────────┼───────────┐                  │
│         ▼           ▼           ▼                  │
│    Modules      UI/UX        RLS                   │
│    filtrés     adaptée     Supabase                │
└───────────────────────────────────────────────────┘
```

**4 tiers** : KIDS (7-12), JUNIOR (13-15), TEEN (16-17), ADULT (18+)
**~30 feature flags** par tier dans la `FeatureFlagMatrix`
**MVP Phase 2** : Infrastructure complète mais mode ADULT-only activé

### 9.3 Gamification — Système XP

```
Action utilisateur → Trigger Supabase → grant_xp()
                                            │
                          ┌─────────────────┴─────────────────┐
                          ▼                                    ▼
                    user_xp.total_xp++               check_and_award_badges()
                    user_xp.level = f(xp)                     │
                          │                                    ▼
                          ▼                          user_badges INSERT
                    Notification                    Notification 🏆
                    "🎯 +10 XP!"                   "Badge débloqué !"
```

**Actions récompensées** :

| Action | XP |
|--------|:--:|
| Envoyer un message | +1 |
| Publier un post | +5 |
| Recevoir une reaction | +2 |
| Compléter une mission quotidienne | +10-50 |
| Premier module installé | +20 |
| Créer un serveur | +30 |
| Inviter 5 amis | +50 |
| Publier un module (développeur) | +100 |

**Niveaux** : XP nécessaire = `100 * level^1.5` (courbe logarithmique)

### 9.4 Communautés — Modèle de données

```
Server (serveur)
  ├── ServerMember (role_id, joined_at)
  ├── ServerRole (name, permissions JSONB, position)
  ├── ServerChannel (name, type: text|voice|announce)
  │     └── Messages (content, author_id, channel_id)
  ├── ServerInvite (code, max_uses, expires_at)
  └── AuditLog (action, actor_id, target, details)
```

**Permissions granulaires** (JSONB) :

```json
{
  "manage_channels": true,
  "manage_roles": true,
  "kick_members": true,
  "ban_members": true,
  "manage_messages": true,
  "mention_everyone": false,
  "manage_server": false
}
```

---

## 10. Écrans à implémenter

### 10.1 Store & Monétisation (Sprint 1)

| # | Écran / Page | Route | Priorité |
|---|-------------|-------|:--------:|
| 1 | Revenus développeur (dashboard) | `/developer/earnings` | 🔴 P0 |
| 2 | Historique transactions développeur | `/developer/transactions` | 🔴 P0 |
| 3 | Configuration paiement développeur | `/developer/payout-settings` | 🟡 P1 |
| 4 | Modal achat module (Stripe/ImuCoin) | Modal overlay | 🔴 P0 |
| 5 | Page confirmation achat | `/store/purchase/confirm` | 🔴 P0 |

### 10.2 Wallet (Sprint 2)

| # | Écran / Page | Route | Priorité |
|---|-------------|-------|:--------:|
| 6 | Dashboard Wallet | `/wallet` | 🔴 P0 |
| 7 | Historique transactions | `/wallet/transactions` | 🔴 P0 |
| 8 | Ajout de fonds | `/wallet/add-funds` | 🟡 P1 |
| 9 | Gestion abonnements | `/wallet/subscriptions` | 🟢 P2 |
| 10 | Factures & reçus | `/wallet/invoices` | 🟢 P2 |

### 10.3 Segmentation par âge (Sprint 2)

| # | Écran / Page | Route | Priorité |
|---|-------------|-------|:--------:|
| 11 | Saisie date de naissance (inscription) | `/auth/register` (étape) | 🔴 P0 |
| 12 | Profil d'âge (voir son tier) | `/settings/age-profile` | 🟡 P1 |

### 10.4 Communautés (Sprint 3)

| # | Écran / Page | Route | Priorité |
|---|-------------|-------|:--------:|
| 13 | Création serveur | `/servers/create` | 🔴 P0 |
| 14 | Vue serveur principal | `/servers/[id]` | 🔴 P0 |
| 15 | Paramètres serveur | `/servers/[id]/settings` | 🟡 P1 |
| 16 | Gestion rôles | `/servers/[id]/roles` | 🟡 P1 |
| 17 | Journal d'audit | `/servers/[id]/audit-log` | 🟡 P1 |
| 18 | Page d'invitation | `/invite/[code]` | 🔴 P0 |

### 10.5 Gamification (Sprint 3)

| # | Écran / Page | Route | Priorité |
|---|-------------|-------|:--------:|
| 19 | Badges & trophées | `/profile/achievements` | 🔴 P0 |
| 20 | Missions quotidiennes | `/missions` | 🟡 P1 |
| 21 | Classement | `/leaderboard` | 🟡 P1 |

### 10.6 Admin (Sprint 4)

| # | Écran / Page | Route | Priorité |
|---|-------------|-------|:--------:|
| 22 | Dashboard admin | `/admin` | 🔴 P0 |
| 23 | Gestion utilisateurs | `/admin/users` | 🔴 P0 |
| 24 | Review modules | `/admin/modules` | 🔴 P0 |
| 25 | Contenu signalé | `/admin/reports` | 🟡 P1 |
| 26 | Dashboard financier | `/admin/revenue` | 🟡 P1 |
| 27 | Feature flags globaux | `/admin/feature-flags` | 🟡 P1 |

**Total : 27 nouveaux écrans/pages**

---

## 11. Prérequis techniques

### 11.1 Dépendances à ajouter

| Package | Usage | Sprint |
|---------|-------|:------:|
| `@stripe/stripe-js` + `@stripe/react-stripe-js` | Paiements frontend | S1 |
| `stripe` (Node.js) | API Stripe côté serveur (Route Handlers) | S1 |
| `@playwright/test` | Tests E2E | S4 |
| `@sentry/nextjs` | Error tracking | S4 |
| `@storybook/nextjs` | Component documentation | S4 |
| `axe-core` + `@axe-core/react` | Audit A11y automatisé | S4 |

### 11.2 Variables d'environnement à configurer

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...

# Store
NEXT_PUBLIC_PLATFORM_FEE_PERCENT=30
NEXT_PUBLIC_MIN_PAYOUT_CENTS=5000
```

### 11.3 Migrations SQL à exécuter (dans l'ordre)

1. `supabase_store_monetization.sql` — Tables transactions, payouts, ImuCoin
2. `supabase_age_segmentation.sql` — ENUM, colonnes, tables parentales (depuis AGE_SEGMENTATION_ARCHITECTURE.md)
3. `supabase_gamification.sql` — Tables XP, badges, missions
4. `supabase_communities.sql` — Tables serveurs, rôles, channels
5. `supabase_admin_enhanced.sql` — Politiques RLS admin renforcées

---

## 12. Métriques de succès

### 12.1 Objectifs quantitatifs (fin Phase 2)

| Métrique | Objectif | Actuel |
|----------|:--------:|:------:|
| Couverture tests | ≥ 70% | ~7% |
| Erreurs TypeScript | 0 | 0 ✅ |
| Score Lighthouse Performance | ≥ 90 | Non mesuré |
| Score Lighthouse Accessibility | ≥ 90 | Non mesuré |
| Nombre de routes | 65+ | 40+ |
| Nombre d'écrans | 70+ | ~45 |
| Tests E2E parcours critiques | ≥ 10 | 0 |
| Temps de build CI | < 5 min | N/A |

### 12.2 Jalons fonctionnels

| Jalon | Sprint | Critère de validation |
|-------|:------:|----------------------|
| **Premier achat Store réel** | S1 | Un module acheté via Stripe, transaction enregistrée |
| **Seed data éliminé** | S1 | 0 appel à mock-data.ts, toutes les pages chargent depuis Supabase |
| **AgePolicyContext fonctionnel** | S2 | Context initialisé ADULT, FeatureGate conditionne l'affichage |
| **Premier paiement développeur** | S2 | Payout Stripe Connect exécuté en staging |
| **Serveur communautaire opérationnel** | S3 | Créer serveur → ajouter channels → inviter → poster |
| **Système XP actif** | S3 | Actions = XP, badges débloqués, classement affiché |
| **CI/CD green** | S4 | PR merge bloqué si lint/tests/build fail |
| **Admin peut reviewer un module** | S4 | Approve/Reject depuis `/admin/modules` |

---

## 13. Risques & Mitigations

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|:------:|:-----------:|------------|
| 1 | **Intégration Stripe complexe** (Connect, webhooks, IAP) | Élevé | Moyenne | POC Stripe dès jour 1 du Sprint 1. Fallback ImuCoin-only si retard. |
| 2 | **Couverture tests ambitieuse** (7% → 70%) | Moyen | Élevée | Prioriser les tests sur les flux critiques (auth, achat, admin). Accepter 50% si nécessaire. |
| 3 | **Scope creep communautés** (tentation d'implémenter tout Discord) | Élevé | Élevée | Limiter au MVP : serveurs + channels texte + rôles basiques. Pas de voice channels Phase 2. |
| 4 | **Segmentation par âge — complexité juridique** | Moyen | Faible | Mode ADULT-only. Infrastructure dormante. Validation juridique avant activation. |
| 5 | **Dépendance Supabase** (rate limits, downtime) | Élevé | Faible | Cache SWR/React Query. Gestion erreurs gracieuse. Plan fallback. |
| 6 | **Parallélisation limitée** (1-2 devs) | Moyen | Élevée | Sprints séquentiels stricts. Pas de travail en parallèle sur des dépendances croisées. |
| 7 | **Migration SQL en production** | Élevé | Faible | Toutes les migrations sont idempotentes (IF NOT EXISTS). Backup avant chaque migration. |

---

## 14. Timeline consolidée

```
Semaine  -1    0    1    2    3    4    5    6    7    8
         ├────┤────┤────┤────┤────┤────┤────┤────┤────┤
Sprint 0 │▓▓▓▓▓▓▓▓▓│         │         │         │         │
         │ Phase 1  │         │         │         │         │
         │ APIs     │         │         │         │         │
         │ réelles  │         │         │         │         │
         │ WebSocket│         │         │         │         │
         │ Profile  │         │         │         │         │
Sprint 1 │         │▓▓▓▓▓▓▓▓▓│         │         │         │
         │         │ Store    │         │         │         │
         │         │ Monétis. │         │         │         │
Sprint 2 │         │         │▓▓▓▓▓▓▓▓▓│         │         │
         │         │         │ Age Seg. │         │         │
         │         │         │ Wallet   │         │         │
         │         │         │ Stripe   │         │         │
Sprint 3 │         │         │         │▓▓▓▓▓▓▓▓▓│         │
         │         │         │         │ Commun.  │         │
         │         │         │         │ Gamific. │         │
Sprint 4 │         │         │         │         │▓▓▓▓▓▓▓▓▓│
         │         │         │         │         │ Admin    │
         │         │         │         │         │ Tests    │
         │         │         │         │         │ CI/CD    │
         │         │         │         │         │ A11y     │
         ├────┤────┤────┤────┤────┤────┤────┤────┤────┤────┤

              TOTAL ESTIMÉ : 10 SEMAINES (Sprint 0 + 4 Sprints)
         ~90 jours-dev (1 dev) / ~45 jours (2 devs)
```

### Répartition effort par domaine

| Domaine | Effort (j) | % |
|---------|:----------:|:-:|
| **Sprint 0 — Phase 1 Finition** | **14** | **16%** |
| Store & Monétisation | 16 | 18% |
| Segmentation par âge | 6 | 7% |
| Wallet & Stripe | 10 | 11% |
| Communautés | 10 | 11% |
| Gamification | 8 | 9% |
| Admin Dashboard | 8.5 | 9% |
| Testing | 12 | 13% |
| CI/CD & Infra | 5.5 | 6% |
| Accessibilité | 4 | 4% |
| **TOTAL** | **~90** | **100%** |

---

## 15. Documents de référence

| Document | Contenu | Lignes |
|----------|---------|:------:|
| `web-app/ROADMAP.md` | Roadmap 16 semaines complète | 1299 |
| `web-app/WEBAPP_TODO_TRACKER.md` | Tracker détaillé avec statuts | 1437 |
| `docs/AGE_SEGMENTATION_ARCHITECTURE.md` | Architecture segmentation par âge complète | 1013 |
| `docs/ARCHITECTURE_MODULES_AUDIT.md` | Audit modules Phases A-D + recommandations D+ | 414 |
| `docs/50_FONCTIONNALITIES_SCREENS.md` | 50 fonctionnalités → écrans (10 groupes) | 221 |
| `docs/OTHERS_SCREENS.md` | ~100 écrans complémentaires (14 sections) | 236 |
| `docs/OTHERS_SCREENS_FONCTIONNALITIES.md` | ~110 fonctionnalités structurelles | 217 |
| `supabase_modules_phase_d.sql` | Migration SQL Phase D (Developer Portal, Review Pipeline) | ~407 |

---

## Annexe A — Priorisation des 50 fonctionnalités (groupes restants)

Les groupes 1-5 des 50 fonctionnalités sont largement couverts par la Phase 1. Voici le statut des groupes 6-10 pour la Phase 2 :

| Groupe | Fonctionnalités | Statut Phase 2 |
|--------|----------------|:---------------:|
| **G6 — Modules avancés** (Productivity, Office, PDF, Board, Cooking) | Hors périmètre — mini-apps indépendantes | ⏳ Phase 3 |
| **G7 — Services publics** (Transport, Trafic, Urgences, Annuaire, Colis) | Hors périmètre — mini-apps indépendantes | ⏳ Phase 3 |
| **G8 — Divertissement** (Musique, Livres, Vidéo, Podcasts, Jeux, Stickers) | Partiellement couvert (Watch ✅). Reste = mini-apps | ⏳ Phase 3 |
| **G9 — IA intégrée** (Chatbot, Suggestions, Résumé, Traduction, Modération) | Hors périmètre (sauf modération auto en S3) | ⏳ Phase 3 |
| **G10 — Store écosystème** (Store, Install, Permissions, Marketplace, Wallet) | **✅ MVP Phase 2** — Store monétisation + Wallet | 🔴 S1-S2 |

---

## Annexe B — Checklist pré-lancement Phase 2

### Sprint 0 — Critères d'entrée Phase 2
- [ ] 0 import vers `@/lib/data` ou `mock-data.ts` (OPT-004 terminé)
- [ ] Tests WebSocket passent : reconnexion, offline queue, heartbeat (BUG-004)
- [ ] Profile & Settings à 100% — ProfilePosts, ProfileMedia, Security 2FA (DEV-004b)
- [ ] Images optimisées avec `next/image` sur pages principales (OPT-001)
- [ ] Baseline mesurée : Lighthouse, bundle size, TTI documentés
- [ ] 0 erreurs TypeScript maintenu

### Phase 2 — Critères de sortie
- [ ] Toutes les migrations SQL exécutées sans erreur
- [ ] 0 erreurs TypeScript
- [ ] Couverture tests ≥ 50% (objectif 70%)
- [ ] CI/CD pipeline fonctionnel (lint + tests + build sur chaque PR)
- [ ] Sentry configuré et capte les erreurs
- [ ] Stripe en mode test validé (achat, payout, webhook)
- [ ] Admin dashboard fonctionnel (login admin, review module, voir users)
- [ ] Système XP opérationnel (actions → XP → badges)
- [ ] Au moins 1 serveur communautaire créable et fonctionnel
- [ ] Lighthouse Performance ≥ 85, Accessibility ≥ 85
- [ ] Aucun seed data / mock-data.ts restant
- [ ] AgePolicyContext initialisé (mode ADULT-only)
- [ ] Documentation technique à jour (README, CONTRIBUTING)

---

> **Prochaine étape** : Valider ce document puis commencer le **Sprint 0 — Finalisation Phase 1** (2 semaines), suivi du Sprint 1 — Store Monétisation.
