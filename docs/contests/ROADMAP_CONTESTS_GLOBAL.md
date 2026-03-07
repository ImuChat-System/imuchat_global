# 🏟 Roadmap Global — ImuArena (Concours & Compétitions)

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Vue consolidée de toutes les roadmaps ImuArena — timeline, milestones, dépendances, équipe, risques et KPIs

---

## 📋 Résumé des Roadmaps

| Roadmap | Phases | Sprints | Focus |
|---------|--------|---------|-------|
| [ROADMAP_IMUARENA_HUB](ROADMAP_IMUARENA_HUB.md) | 7 | 22 | Hub concours, participation, votes, catégories, IA |
| [ROADMAP_LEAGUES_SEASONS](ROADMAP_LEAGUES_SEASONS.md) | 6 | 17 | Rangs, saisons, classements, divisions, récompenses |
| [ROADMAP_CONTEST_ECONOMY](ROADMAP_CONTEST_ECONOMY.md) | 6 | 15 | Économie, prize pools, sponsors, crowdfunding |
| **Total** | **19** | **54** | — |

---

## 📅 Timeline Trimestrielle

### Q3 2026 — Fondations ImuArena

| Mois | Sprint | Activités clés |
|------|--------|----------------|
| Juil 2026 | Hub S1-S2, Rank S1 | Types concours, ContestModule, modèle ranking |
| Août 2026 | Hub S3-S4, Rank S2 | API concours, Arena Home, RankingService |
| Sept 2026 | Hub S5-S6, Rank S3, Éco S1 | Participation, soumissions, profil Arena, types économiques |

**Milestone Q3 :** 🎯 Arena fonctionnelle — concours de base + profils de rang

### Q4 2026 — Engagement & Saisons

| Mois | Sprint | Activités clés |
|------|--------|----------------|
| Oct 2026 | Hub S7-S8, Rank S4-S5, Éco S2 | Votes, jury, infrastructure saisons, PrizePoolService |
| Nov 2026 | Hub S9-S10, Rank S6, Éco S3 | Anti-fraude votes, résultats, rétrospectives, Wallet |
| Déc 2026 | Hub S11-S12, Rank S7, Éco S4 | Podium, récompenses, leaderboard global, frais d'entrée |

**Milestone Q4 :** 🎯 Première saison lancée (Saison 4 "Légende") + économie de base

### Q1 2027 — Profondeur & Catégories

| Mois | Sprint | Activités clés |
|------|--------|----------------|
| Jan 2027 | Hub S13-S14, Rank S8-S9, Éco S5-S6 | Brackets gaming, galeries créatives, classements sociaux, prize pools |
| Fév 2027 | Hub S15-S16, Rank S10, Éco S7-S8 | Hackathons tech, quiz real-time, divisions, sponsoring |
| Mars 2027 | Hub S17-S18, Rank S11, Éco S9 | Dashboard orga, sponsors templates, playoffs, matching IA |

**Milestone Q1 :** 🎯 6 catégories actives + divisions + système de sponsoring opérationnel

### Q2 2027 — Échelle & Communauté

| Mois | Sprint | Activités clés |
|------|--------|----------------|
| Avr 2027 | Hub S19, Rank S12-S13, Éco S10-S11 | Templates concours, Battle Pass, récompenses rang, crowdfunding |
| Mai 2027 | Hub S20-S21, Rank S14-S15, Éco S12-S13 | IA modération, anti-fraude, streaks, classement équipes, billetterie |
| Juin 2027 | Hub S22, Rank S16-S17, Éco S14-S15 | Recommandations IA, défis quotidiens, concours inter-guildes, analytics |

**Milestone Q2 :** 🎯 ImuArena complète — tous les modules déployés

---

## 🏆 Milestones clés

| # | Milestone | Date cible | Critère de validation |
|---|-----------|------------|----------------------|
| M1 | **Arena MVP** | Sept 2026 | Création + participation + résultats pour 1 type de concours |
| M2 | **Saison 1 launched** | Déc 2026 | Première saison complète (12 sem) avec classements |
| M3 | **6 catégories actives** | Fév 2027 | Gaming, Creative, Tech, Story, Knowledge, Visual opérationnels |
| M4 | **Économie complète** | Mars 2027 | Prize pools, sponsors, paiements automatiques fonctionnels |
| M5 | **ImuWorld Festival** | Juin 2027 | Premier événement majeur inter-catégories |
| M6 | **1 000 concours créés** | Q3 2027 | Objectif volume post-lancement complet |

---

## 🔀 Graphe de Dépendances

```
IMUARENA HUB (Fondations)
├─── Phase 1-2: Types, API, Participation
│    └──► LEAGUES Phase 1: Ranking (nécessite concours de base)
│         └──► LEAGUES Phase 2: Saisons (nécessite ranking)
│              └──► LEAGUES Phase 3: Classements (nécessite saisons)
│                   └──► LEAGUES Phase 4: Divisions (nécessite classements)
│    └──► ECONOMY Phase 1: Infrastructure éco (nécessite concours de base)
│         └──► ECONOMY Phase 2: Prize pools (nécessite éco de base + Wallet)
│              └──► ECONOMY Phase 3: Sponsoring (nécessite prize pools)
│              └──► ECONOMY Phase 4: Crowdfunding (nécessite prize pools)
│              └──► ECONOMY Phase 5: Billetterie (nécessite sponsoring)
│
├─── Phase 3-4: Votes, Résultats
│    └──► LEAGUES Phase 5: Récompenses (nécessite résultats)
│
├─── Phase 5: Catégories spécialisées
│    └──► LEAGUES Phase 6: Équipes & Guildes (nécessite catégories + Guildes Gaming Hub)
│
├─── Phase 6: Organisation avancée
│    └──► ECONOMY Phase 6: Analytics (nécessite orga + toutes sources revenus)
│
└─── Phase 7: IA & Modération (indépendant, peut avancer en parallèle)
```

---

## 👥 Estimation Équipe

| Rôle | Quantité | Focus principal |
|------|----------|-----------------|
| **Tech Lead** | 1 | Architecture modules, intégration platform-core |
| **Backend Senior** | 2 | Services ranking, économie, leaderboard, IA |
| **Backend Junior** | 1 | API, cron jobs, tests |
| **Frontend Senior** | 2 | Écrans Arena, leaderboard, animations |
| **Frontend Junior** | 1 | Composants UI kit, widgets |
| **Designer UI/UX** | 1 | Identité visuelle Arena, animations rang |
| **Product Manager** | 1 | Priorités, specs catégories, métriques |
| **QA Engineer** | 1 | Tests intégration, tests financiers |
| **DevOps** | 0.5 | Cache Redis, jobs, monitoring |
| **Total** | **~10** | — |

---

## ⚡ Chemin Critique

Le chemin le plus long qui détermine le délai total :

```
Hub Phase 1 (S1-S4) → Hub Phase 2 (S5-S7) → Hub Phase 3 (S8-S10) → Hub Phase 4 (S11-S12)
→ Hub Phase 5 (S13-S16) → Hub Phase 6 (S17-S19) → Hub Phase 7 (S20-S22)
```

**22 sprints = ~44 semaines** sur le chemin critique.

Les roadmaps Leagues et Economy avancent **en parallèle** avec un décalage de 1-2 sprints.

---

## ⚠️ Matrice de Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Complexité du système de ranking | Moyenne | Haut | Commencer simple (points linéaires), itérer |
| Manipulation des votes / triche | Haute | Haut | Anti-fraude dès Phase 3, monitoring continu |
| Low adoption des concours payants | Moyenne | Moyen | Offre gratuite forte, payant = bonus |
| Attirer des sponsors | Moyenne | Moyen | Commencer par sponsoring interne ImuChat |
| Conformité légale (concours avec prix) | Moyenne | Haut | Consulter avocat, CGU claires, pas de gambling |
| Performance leaderboard à grande échelle | Basse | Haut | Vues matérialisées, cache Redis, pagination cursor |
| Complexité UI des classements | Basse | Moyen | Design system Arena dédié, composants réutilisables |
| Fraude financière | Basse | Très haut | Double-entry, rate limiting, audit trail, monitoring |
| Saisons trop longues → désengagement | Moyenne | Moyen | Défis quotidiens, events mid-saison, streaks |
| Déséquilibre de matchmaking divisions | Moyenne | Moyen | Calibration continue, playoffs de barrage |

---

## 📈 KPIs Globaux ImuArena

### Engagement

| KPI | Objectif M1 | Objectif M6 | Objectif M12 |
|-----|------------|------------|--------------|
| Utilisateurs Arena actifs / mois | 500 | 5 000 | 25 000 |
| Concours créés / semaine | 10 | 100 | 500 |
| Taux participation (vues → inscrits) | 10% | 20% | 30% |
| Taux complétion (inscrits → soumis) | 60% | 70% | 80% |
| Concours par utilisateur actif / mois | 1.5 | 3 | 5 |

### Rétention

| KPI | Objectif M1 | Objectif M6 | Objectif M12 |
|-----|------------|------------|--------------|
| Rétention Arena D7 | 30% | 45% | 55% |
| Rétention Arena D30 | 15% | 25% | 35% |
| Complétion de saison (12 sem) | — | 20% | 35% |
| Streak moyen (jours consécutifs) | — | 5 | 12 |

### Économie

| KPI | Objectif M1 | Objectif M6 | Objectif M12 |
|-----|------------|------------|--------------|
| Volume transactions / mois | — | 5 000 | 50 000 |
| Prize pools distribués / mois | — | 100K ImuCoins | 1M ImuCoins |
| Sponsors actifs | — | 5 | 30 |
| Revenus plateforme / mois | — | 10K ImuCoins | 100K ImuCoins |

### Compétitif

| KPI | Objectif M1 | Objectif M6 | Objectif M12 |
|-----|------------|------------|--------------|
| Joueurs classés (avec rang) | 200 | 3 000 | 15 000 |
| Guildes actives en Arena | — | 50 | 300 |
| Matchs de division / saison | — | 200 | 2 000 |

---

## 🔗 Dépendances Externes

| Dépendance externe | Impact | Statut |
|-------------------|--------|--------|
| **Wallet Core** | Paiements, gains, ImuCoins | 🟡 En cours (cf. monorepo Phase D) |
| **Gaming Hub — Guildes** | Concours inter-guildes | 🟡 Planifié (cf. ROADMAP_GAMING_HUB) |
| **ImuChat Store** | Merchandising événementiel | 🟡 Planifié |
| **Notification System** | Alertes de progression, streaks | ✅ Existant (platform-core) |
| **IA / ML Pipeline** | Modération, recommandations, pricing | 🔴 À développer |
| **WebSocket Infra** | Leaderboard live, quiz real-time | ✅ Existant |
| **Supabase RLS** | Sécurité des données financières | ✅ Existant |
| **Redis Cache** | Performance leaderboards | 🟡 À configurer |

---

## 📂 Structure de Fichiers Cible

```
docs/contests/
├── Contests_Vision.md              ← Vision originale
├── Contests_Vision_v2.md           ← Vision enrichie
├── ROADMAP_IMUARENA_HUB.md         ← Roadmap Hub (7 phases, 22 sprints)
├── ROADMAP_LEAGUES_SEASONS.md       ← Roadmap Ligues (6 phases, 17 sprints)
├── ROADMAP_CONTEST_ECONOMY.md       ← Roadmap Économie (6 phases, 15 sprints)
└── ROADMAP_CONTESTS_GLOBAL.md       ← Ce fichier (récapitulatif)

platform-core/src/modules/
├── arena/
│   ├── contest/          ← ContestModule (Hub)
│   ├── ranking/          ← ArenaRankingModule (Ligues)
│   ├── seasons/          ← ArenaSeasonModule (Saisons)
│   ├── leaderboard/      ← LeaderboardModule (Classements)
│   ├── economy/          ← ContestEconomyModule (Économie)
│   └── moderation/       ← ArenaModModule (IA & Anti-fraude)

shared-types/src/
├── arena.types.ts        ← Types de concours
├── ranking.types.ts      ← Types de ranking/saison
├── economy.types.ts      ← Types économiques
└── leaderboard.types.ts  ← Types de classements

web-app/src/
├── app/arena/            ← Pages Arena
│   ├── page.tsx          ← Arena Home
│   ├── contests/         ← Pages concours
│   ├── leaderboard/      ← Pages classements
│   ├── seasons/          ← Pages saisons
│   ├── profile/          ← Profil Arena
│   └── economy/          ← Pages financières

ui-kit/src/components/arena/
├── ContestCard.tsx
├── RankBadge.tsx
├── LeaderboardTable.tsx
├── SeasonBanner.tsx
├── PrizePoolTracker.tsx
└── ...
```

---

## 🚀 Quick Start — Par Où Commencer

1. **Sprint 1 (Hub)** + **Sprint 1 (Rank)** en parallèle → Types et schémas DB
2. **Sprint 2 (Hub)** + **Sprint 2 (Rank)** → Modules platform-core
3. **Sprint 3 (Hub)** + **Sprint 3 (Rank)** → API et premiers écrans
4. → À ce stade, Arena MVP fonctionnel → démo interne
5. Continuer avec votes (Hub S8-10) et saisons (Rank S4-6) en parallèle
6. Introduire l'économie (Éco S1-3) quand le Wallet est prêt

**Conseil :** Lancer une beta interne après le M1 (Arena MVP) pour itérer rapidement sur le gameplay avant d'ajouter l'économie.
