# 🗺️ Roadmap Globale — ImuChat Gaming

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Vue consolidée de l'ensemble des roadmaps Gaming d'ImuChat

---

## 📁 Documents de référence

| Roadmap | Fichier | Sprints | Phases |
|---------|---------|---------|--------|
| Gaming Hub | [ROADMAP_GAMING_HUB.md](ROADMAP_GAMING_HUB.md) | 30 sprints | 9 phases |
| Game Launcher | [ROADMAP_GAME_LAUNCHER.md](ROADMAP_GAME_LAUNCHER.md) | 14 sprints | 5 phases |
| Game Mode | [ROADMAP_GAME_MODE.md](ROADMAP_GAME_MODE.md) | 16 sprints | 7 phases |
| Spécifications | [Gaming_Hub.md](Gaming_Hub.md) | — | — |

---

## 📅 Planning global consolidé

Les trois roadmaps peuvent être exécutées **en parallèle partiel** grâce à des équipes dédiées, mais certaines dépendances imposent un séquencement.

### Trimestre 1 — Fondations (Mois 1-3)

| Semaine | Gaming Hub | Game Launcher | Game Mode |
|---------|-----------|---------------|-----------|
| S1-S2 | Phase 1 Sprint 1 : Types & BDD | Phase 1 Sprint 1 : Types & archi | — |
| S3-S4 | Phase 1 Sprint 2 : GamingModule | Phase 1 Sprint 2 : GameLibraryModule | — |
| S5-S6 | Phase 1 Sprint 3 : API | Phase 1 Sprint 3 : API & écran base | Phase 1 Sprint 1 : Détection |
| S7-S8 | Phase 1 Sprint 4 : Écran Home | Phase 2 Sprint 4 : Scan jeux | Phase 1 Sprint 2 : Config |
| S9-S10 | Phase 2 Sprint 5 : Profils | Phase 2 Sprint 5 : Plateformes | Phase 2 Sprint 3 : Overlay base |
| S11-S12 | Phase 2 Sprint 6 : Connexions | Phase 2 Sprint 6 : Lancement | Phase 2 Sprint 4 : Widgets |

### Trimestre 2 — Social & Core (Mois 4-6)

| Semaine | Gaming Hub | Game Launcher | Game Mode |
|---------|-----------|---------------|-----------|
| S13-S14 | Phase 2 Sprint 7 : Présence | Phase 3 Sprint 7 : Friends | Phase 2 Sprint 5 : Widgets avancés |
| S15-S16 | Phase 2 Sprint 8 : Party | Phase 3 Sprint 8 : Party Launcher | Phase 3 Sprint 6 : Anti-distraction |
| S17-S18 | Phase 3 Sprint 9 : Guildes CRUD | Phase 3 Sprint 9 : Stats | Phase 3 Sprint 7 : Performance |
| S19-S20 | Phase 3 Sprint 10 : UI Guildes | Phase 4 Sprint 10 : MAJ | Phase 4 Sprint 8 : Capture vidéo |
| S21-S22 | Phase 3 Sprint 11 : Guildes avancé | Phase 4 Sprint 11 : Catégorisation | Phase 4 Sprint 9 : Édition clips |
| S23-S24 | Phase 4 Sprint 12 : Voice infra | Phase 4 Sprint 12 : Perf | Phase 4 Sprint 10 : Partage clips |

### Trimestre 3 — Features (Mois 7-9)

| Semaine | Gaming Hub | Game Launcher | Game Mode |
|---------|-----------|---------------|-----------|
| S25-S26 | Phase 4 Sprint 13 : Voice features | Phase 5 Sprint 13 : Thèmes | Phase 5 Sprint 11 : Commandes vocales |
| S27-S28 | Phase 4 Sprint 14 : Voice overlay | Phase 5 Sprint 14 : Store | Phase 5 Sprint 12 : IA conseils |
| S29-S30 | Phase 5 Sprint 15 : SDK mini-jeux | — | Phase 6 Sprint 13 : Streaming overlay |
| S31-S32 | Phase 5 Sprint 16 : Mini-jeux lot 1 | — | Phase 6 Sprint 14 : Chat viewers |
| S33-S34 | Phase 5 Sprint 17 : Mini-jeux lot 2 | — | Phase 7 Sprint 15 : Achievements |
| S35-S36 | Phase 5 Sprint 18 : Marketplace | — | Phase 7 Sprint 16 : Niveaux |

### Trimestre 4 — Avancé (Mois 10-12)

| Semaine | Gaming Hub | Game Launcher | Game Mode |
|---------|-----------|---------------|-----------|
| S37-S38 | Phase 6 Sprint 19 : Streaming natif | — | — |
| S39-S40 | Phase 6 Sprint 20 : Watch parties | — | — |
| S41-S42 | Phase 6 Sprint 21 : Clips & replays | — | — |
| S43-S44 | Phase 7 Sprint 22 : Infra tournois | — | — |
| S45-S46 | Phase 7 Sprint 23 : UI tournois | — | — |
| S47-S48 | Phase 7 Sprint 24 : Matchmaking | — | — |
| S49-S50 | Phase 7 Sprint 25 : Events esports | — | — |
| S51-S52 | Phase 8 Sprints 26-28 : IA Gaming | — | — |
| S53-S54 | Phase 9 Sprints 29-30 : Store Gaming | — | — |

---

## 🎯 Jalons clés (Milestones)

| Milestone | Date cible | Description | Critères de validation |
|-----------|-----------|-------------|----------------------|
| **M1** — Gaming Alpha | Fin T1 | Gaming Hub accessible, bibliothèque, premiers écrans | Écran Home fonctionnel, API opérationnelle |
| **M2** — Social Gaming | Fin T2 | Profils, guildes, party, voice chat, overlay | Party system + vocal fonctionnel |
| **M3** — Gaming Beta | Fin T3 | Mini-jeux, clips, streaming, commandes vocales | 6+ mini-jeux, clips fonctionnels |
| **M4** — Gaming v1.0 | Fin T4 | Tournois, IA, store gaming complet | Plateforme tournois opérationnelle |

---

## 📊 Répartition des efforts par domaine

```
Gaming Hub          ████████████████████████████████  60 sprints-effort
Game Launcher       ██████████████                    28 sprints-effort
Game Mode           ████████████████                  32 sprints-effort
                    ─────────────────────────────────
Total               120 sprints-effort (exécution parallèle → ~54 sprints calendaires)
```

---

## 👥 Équipes suggérées

| Équipe | Focus | Compétences clés |
|--------|-------|-------------------|
| **Gaming Core** | Gaming Hub (Phases 1-3) | TypeScript, Supabase, React, API |
| **Gaming Social** | Gaming Hub (Phases 4-7) + Launcher Social | WebRTC, temps réel, UX |
| **Desktop Gaming** | Game Launcher + Game Mode | Electron, Rust, FFmpeg, systèmes |
| **Gaming IA** | IA, recommandations, coaching | ML, NLP, data engineering |
| **Gaming Content** | Mini-jeux, streaming, clips | Game dev, WebGL, médias |

---

## 🔗 Graphe de dépendances

```
                    ┌─────────────────┐
                    │  shared-types   │
                    │  (Types Gaming) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  platform-core  │
                    │ (Gaming Module) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  Gaming Hub   │ │  Game    │ │  Game Mode  │
     │  (Web/Mobile/ │ │ Launcher │ │  (Desktop)  │
     │   Desktop)    │ │ (Desktop)│ │             │
     └───────┬───────┘ └────┬─────┘ └──────┬──────┘
             │              │              │
             ├──────────────┼──────────────┤
             │       Modules partagés      │
             ├─────────────────────────────┤
             │ • Presence & Social         │
             │ • Voice Chat (WebRTC)       │
             │ • Party System              │
             │ • Profils Gaming            │
             │ • Clips & Streaming         │
             │ • IA & Recommendations      │
             │ • Achievements              │
             └─────────────────────────────┘
```

---

## ⚠️ Risques identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Performance overlay sur jeux AAA | Élevé | Moyenne | Tests perf à chaque sprint, optimisation Rust |
| Complexité intégrations multi-plateformes (Steam, etc.) | Moyen | Haute | Prioriser Steam + Epic, ajouter les autres en itérations |
| Latence voice chat gaming inacceptable | Élevé | Faible | SFU dédié, tests latence réguliers, fallback P2P |
| SDK mini-jeux sous-utilisé par les devs tiers | Moyen | Moyenne | Mini-jeux natifs d'abord, ouvrir SDK quand communauté active |
| Charge serveur streaming/clips | Élevé | Moyenne | CDN, limites par utilisateur, compression agressive |
| Capture vidéo non supportée sur tous les GPU | Moyen | Moyenne | Fallback CPU encoding, liste de GPU testés |

---

## ✅ Prérequis monorepo avant de commencer

Avant de démarrer l'implémentation gaming, ces modules doivent être stables :

- [x] `@imuchat/platform-core` — Phase C complétée (16/16 modules)
- [x] `@imuchat/shared-types` — Types existants stables
- [x] `@imuchat/ui-kit` — Design system fonctionnel
- [ ] `Calls & RTC Module` — Nécessaire pour voice chat gaming (Phase 4 Hub)
- [ ] `Store Core` — Nécessaire pour marketplace (Phase 5/9 Hub)
- [ ] `IA Assistant Module` — Nécessaire pour recommandations (Phase 8 Hub)
- [ ] `desktop-app` — Architecture Electron stable pour Launcher + Game Mode

---

## 📈 KPIs globaux cibles (post-lancement)

| Métrique | Objectif 6 mois | Objectif 12 mois |
|----------|----------------|------------------|
| Utilisateurs Gaming Hub actifs/mois | 50 000 | 500 000 |
| Guildes actives | 1 000 | 10 000 |
| Parties mini-jeux/jour | 5 000 | 50 000 |
| Tournois organisés/mois | 200 | 2 000 |
| Heures de streaming/mois | 10 000 | 100 000 |
| Clips créés/jour | 2 000 | 20 000 |
| Jeux détectés par le launcher | 95% top 200 | 95% top 1000 |
