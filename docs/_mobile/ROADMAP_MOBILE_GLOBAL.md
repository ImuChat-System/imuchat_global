# 🗺️ ROADMAP MOBILE GLOBAL — Application Mobile ImuChat

**Date de création :** 8 mars 2026 · **Mise à jour :** 8 mars 2026  
**Documents sources :**

- `Vision_Structure_Mobile_v2.md` → `ROADMAP_MOBILE_NAVIGATION_HUB.md`
- `ImuFeed_VIDEO_v2.md` → `ROADMAP_IMUFEED_VIDEO.md`
- `IMUCOMPANION_ROADMAP_MOBILE.md` → intégré dans Axe C (Sprint C4)

**Roadmaps domaines intégrées :** `docs/games/`, `docs/contests/`, `docs/finance/`  
**Stack :** Expo SDK 52+ · expo-router · expo-av / expo-video · Zustand · Supabase · React Native Reanimated  
**État actuel :** 42/50 features (84%) · ~80 000 lignes TS/TSX · 2296 tests · M1-M4 complets

---

## 1. Vue d'ensemble consolidée

L'application mobile ImuChat se développe sur **3 axes parallèles** :

| Axe | Roadmap | Sprints | Durée |
|-----|---------|:-------:|:-----:|
| **A** — Navigation, Hub & UX | `ROADMAP_MOBILE_NAVIGATION_HUB.md` | 19 | 38 sem. |
| **B** — ImuFeed Vidéo | `ROADMAP_IMUFEED_VIDEO.md` | 24 | 48 sem. |
| **C** — Intégrations Cross-Domain | Gaming · Arena · Finance · Companion | 4 | 8 sem. |

**Durée totale (parallélisée) :** ~52 semaines (13 mois)  
**Sprints totaux :** 47 sprints cumulés

> Les trois axes se développent en parallèle avec des points de convergence critiques.
> L'Axe C démarre après la Phase 6 de l'Axe A (S31+) et s'exécute en parallèle avec l'Axe B T4.

---

## 2. Timeline unifiée par trimestre

### T1 — Fondations (Semaines 1-12)

| Semaine | Axe A (Navigation & Hub) | Axe B (ImuFeed Vidéo) |
|:-------:|--------------------------|------------------------|
| 1-2 | **Sprint A1** — Fondations Home Hub (store, types, Supabase, refactor index.tsx) | **Sprint B1** — Infra ImuFeed (types, store, API, tables Supabase) |
| 3-4 | **Sprint A2** — QuickActionsGrid + MyModulesRow | **Sprint B2** — Feed vertical plein écran (FlashList, autoplay, swipe) |
| 5-6 | **Sprint A3** — Activité Sociale + Trending + skeleton | **Sprint B3** — Upload vidéo (caméra, S3 presigned, compression) |
| 7-8 | **Sprint A4** — FAB — cœur du composant (menu radial, 7 actions) | **Sprint B4** — Éditeur basique + Profil créateur MVP |
| 9-10 | **Sprint A5** — FAB — contextuel + haptic + a11y | **Sprint B5** — Commentaires hiérarchisés |
| 11-12 | **Sprint A6** — Widgets infra (WidgetCard, WidgetGrid, widget-store) | **Sprint B6** — Hashtags & Recherche |

**🎯 Milestone T1 :** Home Hub fonctionnel + FAB opérationnel + **MVP ImuFeed** (feed + upload + éditeur basique + profil créateur)

### T2 — Enrichissement (Semaines 13-24)

| Semaine | Axe A (Navigation & Hub) | Axe B (ImuFeed Vidéo) |
|:-------:|--------------------------|------------------------|
| 13-14 | **Sprint A7** — 6 widgets core (Wallet, Music, Friends, Recap, Screen Time, AI Tips) | **Sprint B7** — Algorithme "Pour Toi" |
| 15-16 | **Sprint A8** — 6 widgets modules (Agenda, Arena, Gaming, Météo, Tâches, ImuFeed) | **Sprint B8** — Explore & Trending Page |
| 17-18 | **Sprint A9** — Widget management modal + drag & drop | **Sprint B9** — Musique & Son (bibliothèque, mixage, sons réutilisables) |
| 19-20 | **Sprint A10** — Usage tracking + adaptation temps de jour | **Sprint B10** — Filtres, Stickers & Effets (20+ filtres, manga AI) |
| 21-22 | **Sprint A11** — Alice IA suggestions + daily summary | **Sprint B11** — Remix, Duo & Effets avancés |
| 23-24 | *(Axe A Sprint A11 fin)* | **Sprint B12** — Gamification (XP, niveaux, badges, défis) |

**🎯 Milestone T2 :** Widgets complets + IA personnalisation + ImuFeed algo "Pour Toi" + Éditeur avancé + Gamification créateurs

### T3 — Convergence & Onglets (Semaines 25-36)

| Semaine | Axe A (Navigation & Hub) | Axe B (ImuFeed Vidéo) |
|:-------:|--------------------------|------------------------|
| 25-26 | **Sprint A12** — Social restructuré : 3 sous-onglets [Feed][ImuFeed][Stories] | **Sprint B13** — Dashboard créateur & Analytics |
| 27-28 | **Sprint A13** — Watch enrichi + Watch Party | **Sprint B14** — Monétisation créateur (pourboires, abonnements) |
| 29-30 | **Sprint A14** — Profil enrichi (Wallet, Arena, Analytics) | **Sprint B15** — Infra Live streaming (WebRTC, Supabase Realtime) |
| 31-32 | **Sprint A15** — Performance FlashList + offline Home + WCAG AA | **Sprint B16** — UI Live streamer & viewer (chat, réactions, donations) |
| 33-34 | *(Axe A terminé ✅)* | **Sprint B17** — Live co-host, modération, replay auto |
| 35-36 | — | **Sprint B18** — Modération IA (pipeline auto, signalements) |

**🎯 Milestone T3 :** Axe A terminé ✅ + Social tab avec ImuFeed intégré + Live streaming + Modération

**⚠️ Point de convergence critique (Sprint A12 ↔ Sprint B2+) :** Le Sprint A12 restructure le Social tab avec le sous-onglet ImuFeed, qui doit accueillir le feed vertical développé depuis le Sprint B2.

### T4 — Intégration & Scale (Semaines 37-48)

| Semaine | Axe A | Axe B (ImuFeed Vidéo) | Axe C (Cross-Domain) |
|:-------:|-------|------------------------|----------------------|
| 37-38 | — | **Sprint B19** — IA recommandation avancée (re-ranking, diversité, cold start) | **Sprint C1** — Gaming Hub Mobile (catalogue, profil gaming, mini-games inline, game mode, widget enrichi) |
| 39-40 | — | **Sprint B20** — Scalabilité (preload, adaptive bitrate, PiP, CDN) | **Sprint C2** — ImuArena Mobile (6 catégories, participation native, votes, leaderboards, saisons, push) |
| 41-42 | — | **Sprint B21** — Partage DM/Chat + Preview inline | **Sprint C3** — Finance Hub Mobile (dashboard, KYC natif, P2P chat, cartes virtuelles, épargne, biométrie) |
| 43-44 | — | **Sprint B22** — Watch Party ImuFeed + Cross-post communautés | **Sprint C4** — ImuCompanion Mobile (Live2D, FSM, TTS/STT, déclencheurs cross-domain, archétypes, skins) |
| 45-46 | — | **Sprint B23** — Intégrations Home/Store/Arena + Notifications | — |
| 47-48 | — | **Sprint B24** — Contrôle parental + Challenges + Tests finaux | — |

**🎯 Milestone T4 (FINAL) :** ImuFeed totalement intégré dans l'écosystème ImuChat ✅ + **Gaming Hub + ImuArena + Finance Hub + ImuCompanion intégrés ✅**

**Convergence T4 Cross-Domain :**

- Sprint C1 (Gaming) dépend de `ROADMAP_GAMING_HUB.md` Phases 1-3 + widgets Sprint A8
- Sprint C2 (Arena) dépend de `ROADMAP_IMUARENA_HUB.md` Phases 1-4 + `ROADMAP_LEAGUES_SEASONS.md` Phases 1-3
- Sprint C3 (Finance) dépend de `ROADMAP_IMUBANK_WALLET.md` Phases 1-3 + Sprint A13 (Profil Wallet) + Sprint B14 (Monétisation créateur)
- Sprint C4 (Companion) dépend de `IMUCOMPANION_ROADMAP_MOBILE.md` IC-M1 à IC-M6 + Sprint A10 (Alice IA)
- Sprint B23 (Intégrations Home/Store/Arena) bénéficie directement de C1/C2/C3

---

## 3. Points de convergence inter-roadmaps

Les deux roadmaps ne sont pas indépendantes. Voici les points critiques où elles se croisent :

| # | Axe A | Axe B | Axe C | Nature | Semaine |
|---|-------|-------|-------|--------|:-------:|
| 1 | Sprint A12 — Sous-onglet Social [ImuFeed] | Sprint B2+ — Feed vertical | — | **Intégration du feed ImuFeed dans la nouvelle structure Social** | 25-26 |
| 2 | Sprint A8 — Widget ImuFeed Trending | Sprint B8 — Trending page | — | **Widget Home affichant les trending ImuFeed** | 15-16 |
| 3 | Sprint A13 — Watch Party tab | Sprint B22 — Watch Party ImuFeed | — | **Unification du Watch Party pour vidéos classiques ET ImuFeed** | 27-28 / 43-44 |
| 4 | Sprint A14 — Profil Analytics | Sprint B13 — Dashboard créateur | — | **Section créateur dans le profil enrichi** | 29-30 |
| 5 | Sprint A10 — Usage tracking | Sprint B7 — Analytics comportemental | — | **Données comportementales partagées pour IA** | 19-20 |
| 6 | Sprint A8 — Widgets Gaming/Arena | — | Sprint C1/C2 | **Widgets avec données réelles Gaming + Arena** | 37-40 |
| 7 | Sprint A14 — Profil Wallet | — | Sprint C3 | **Section Finance enrichie dans le profil** | 41-42 |
| 8 | Sprint A10 — Alice IA | — | Sprint C4 | **ImuCompanion remplace/étend Alice dans le Home** | 43-44 |
| 9 | — | Sprint B14 — Monétisation | Sprint C3 | **Contest Economy + Prize Pools liés au wallet Finance** | 41-42 |
| 10 | — | Sprint B23 — Intégrations | Sprint C1/C2/C3 | **ImuFeed intègre Gaming, Arena et Store dans ses modules** | 45-46 |

---

## 4. Milestones clés

| Milestone | Description | Semaine cible | Critères de validation |
|-----------|-------------|:------------:|------------------------|
| **M1 — MVP Home Hub** | Home Hub fonctionnel, FAB opérationnel | S10 | Home sans mock, FAB 7 actions, données Supabase |
| **M2 — MVP ImuFeed** | Feed + Upload + Edit + Profil + Interactions | S8 | 60 FPS, upload < 10s, like/comment/share |
| **M3 — Widgets Live** | 12 widgets configurables sur le Home | S18 | Drag & drop, persist, 6 core + 6 module widgets |
| **M4 — Pour Toi** | Algorithme de recommandation personnalisé | S14 | Tracking, scoring, recall/ranking, dédup |
| **M5 — Éditeur Pro** | Éditeur complet avec filtres, musique, effets | S22 | 20+ filtres, manga AI, musique, remix/duo |
| **M6 — Social Unifié** | Social tab = Feed + ImuFeed + Stories | S26 | 3 sous-onglets, navigation fluide |
| **M7 — Live** | Live streaming avec chat et donations | S34 | WebRTC, chat overlay, réactions, replay |
| **M8 — Monétisation** | Pourboires + Abonnements créateur | S28 | ImuCoins, dashboard revenus |
| **M9 — IA Avancée** | Recommandation avancée + modération IA | S38 | Cold start, diversité, modération auto |
| **M10 — Full Integration** | ImuFeed intégré dans tout l'écosystème | S48 | Chat, Home, Store, Arena, contrôle parental |
| **M11 — Gaming Hub Mobile** | Gaming Hub, profil gaming, mini-games inline, game mode | S38 | Catalogue naviguable, stats, widget enrichi |
| **M12 — ImuArena Mobile** | 6 catégories concours, participation native, votes | S40 | Flow soumission, leaderboards temps réel, push |
| **M13 — Finance Hub Mobile** | Dashboard finance, KYC, P2P chat, cartes, épargne | S42 | Biométrie, contest economy, transactions end-to-end |
| **M14 — ImuCompanion Mobile** | Live2D, FSM, TTS/STT, déclencheurs cross-domain | S44 | Companion réactif, archétypes, skins premium |
| **🏁 Mobile 2.0 Complète** | App mobile feature-complete avec tous les domaines intégrés | S48 | Gaming + Arena + Finance + Companion + ImuFeed unifiés |

---

## 5. Allocation équipes recommandée

### Phase initiale (T1-T2) — 2 squads parallèles

| Squad | Effectif | Focus |
|-------|:--------:|-------|
| **Squad Hub** | 2 dev RN + 1 designer | Axe A : Home, FAB, Widgets, Personnalisation |
| **Squad ImuFeed** | 2 dev RN senior + 1 dev backend + 1 designer | Axe B : Feed, Upload, Éditeur, Algo |
| **QA partagée** | 1 QA | Tests manuels + e2e sur les deux axes |

### Phase convergence (T3-T4) — Squad unique élargie + domaines

| Squad | Effectif | Focus |
|-------|:--------:|-------|
| **Squad Mobile Uni** | 3 dev RN + 1 dev backend + 1 designer + 1 QA | Intégration, Live, IA, Scale |
| **Squad Cross-Domain** | 2 dev RN | Axe C : Gaming, Arena, Finance, Companion (T4 S37-44) |
| **API domaines** | ↔ équipes Gaming/Arena/Finance | Endpoints, SDK, données |

---

## 6. Matrice de risques globale

| Risque | Prob. | Impact | Mitigation | Roadmap |
|--------|:-----:|:------:|------------|:-------:|
| Performance feed vidéo 60 FPS | Élevé | Critique | FlashList + preload + lazy unmount | B |
| Coûts S3/CDN | Moyen | Élevé | Compression, adaptive bitrate, quotas | B |
| Complexité intégration Social tab | Moyen | Élevé | Convergence coordonnée Sprint A12/B2 | A + B |
| Modération contenu IA | Élevé | Critique | Pipeline dès MVP, review humaine backup | B |
| Conflits store Zustand (hub + feed) | Faible | Moyen | Stores séparés, namespace clair | A + B |
| Copyright audio | Élevé | Élevé | Bibliothèque libre, fingerprint basique | B |
| Fragmentation Android camera | Moyen | Moyen | expo-camera abstraction, testing multi-device | B |
| Charge backend Supabase | Moyen | Élevé | Indexes, cache, pagination, Edge Functions | A + B |
| Coordination 2 squads | Moyen | Moyen | Stand-ups croisés hebdo, types partagés | A + B |
| Dépendance API Gaming non prête | Moyen | Élevé | Mock API Gaming dès T3, intégration réelle T4 | C |
| KYC compliance mobile multi-pays | Moyen | Élevé | expo-camera + Onfido SDK, limiter à 2-3 pays MVP | C |
| Performance Live2D mobile | Élevé | Élevé | WebView bridge ou react-native-skia, lazy load, désactiver low-end | C |
| Anti-fraude votes Arena mobile | Moyen | Moyen | Rate limiting + captcha + analyse comportementale | C |
| Bundle size avec Gaming + Live2D | Moyen | Moyen | Dynamic imports, EAS OTA, lazy hydration | C |

---

## 7. KPIs globaux

### KPIs techniques

| KPI | Cible | Mesure |
|-----|-------|--------|
| Feed scroll FPS | ≥ 58 FPS | Flipper / Perf Monitor |
| Temps chargement Home | < 1.5s (cold) | Métriques temps réel |
| Upload vidéo 30s | < 10s (4G) | Logs upload |
| Crash-free rate | > 99.5% | Sentry / Crashlytics |
| Tests coverage | ≥ 80% | Jest coverage |
| Bundle size | < 25 MB (delta OTA) | EAS Build |

### KPIs produit

| KPI | Cible | Horizon |
|-----|-------|---------|
| DAU mobile | ↗ 30% après M2 | T1 post-MVP |
| Temps passé / session | ≥ 12 min (dont ≥ 8 min ImuFeed) | T2+ |
| Videos publiées / jour | ≥ 50 (100 utilisateurs actifs) | T2 |
| Taux complétion vidéo | ≥ 45% | T2+ |
| Widget usage (Home) | ≥ 60% des utilisateurs | T2 |
| FAB usage / session | ≥ 1.5 taps / session | T1+ |
| ImuFeed DAU / Total DAU | ≥ 40% | T3+ |
| Modération false positive | < 5% | T3+ |
| Gaming Hub usage mobile | ≥ 25% des users actifs | T4 |
| Arena participation mobile | ≥ 10% des users en concours actif | T4 |
| Finance txn P2P / jour | ≥ 50 / 1000 users actifs | T4 |
| Companion activation | ≥ 30% des users ouvrent le Companion | T4 |

---

## 8. Récapitulatif des fichiers créés

| Fichier | Contenu | Statut |
|---------|---------|--------|
| [Vision_Structure_Mobile_v2.md](docs/_mobile/Vision_Structure_Mobile_v2.md) | Document enrichi — Navigation, Tabs, FAB, Widgets, Personnalisation | ✅ Créé |
| [ImuFeed_VIDEO_v2.md](docs/_mobile/ImuFeed_VIDEO_v2.md) | Document enrichi — Feed vidéo, Éditeur, Créateurs, Live, IA, Architecture | ✅ Créé |
| [ROADMAP_MOBILE_NAVIGATION_HUB.md](docs/_mobile/ROADMAP_MOBILE_NAVIGATION_HUB.md) | 15 sprints · 6 phases · 30 semaines — Home, FAB, Widgets, Personnalisation IA, Onglets | ✅ Créé |
| [ROADMAP_IMUFEED_VIDEO.md](docs/_mobile/ROADMAP_IMUFEED_VIDEO.md) | 24 sprints · 7 phases · 48 semaines — Feed, Upload, Éditeur, Social, Créateurs, Live, IA, Integration | ✅ Créé |
| [ROADMAP_MOBILE_GLOBAL.md](docs/_mobile/ROADMAP_MOBILE_GLOBAL.md) | Vue consolidée — Timeline unifiée, convergences, milestones, risques, KPIs | ✅ Créé · MaJ |

### Roadmaps domaines intégrées (Axe C)

| Fichier source | Intégration | Sprint |
|---------------|------------|:------:|
| `docs/games/ROADMAP_GAMING_HUB.md` | Catalogue, profil gaming, mini-games, Game Mode | C1 |
| `docs/contests/ROADMAP_IMUARENA_HUB.md` + `ROADMAP_LEAGUES_SEASONS.md` | Arena Hub 6 catégories, votes, leaderboards, saisons | C2 |
| `docs/finance/ROADMAP_IMUBANK_WALLET.md` + `ROADMAP_IMUECONOMY_MONETISATION.md` | Finance dashboard, KYC, P2P, cartes, épargne | C3 |
| `docs/_mobile/IMUCOMPANION_ROADMAP_MOBILE.md` | Live2D, FSM, TTS/STT, cross-domain triggers | C4 |
