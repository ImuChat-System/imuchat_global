# 📱 ROADMAP UNIFIÉE — Mobile App ImuChat · Consolidée

**Date de création :** 9 mars 2026  
**Documents source :**  
- `ROADMAP_MOBILE_GLOBAL.md` — 3 axes, 47 sprints locaux  
- `ROADMAP_MOBILE_NAVIGATION_HUB.md` — Axe A, 19 sprints, 38 semaines  
- `ROADMAP_IMUFEED_VIDEO.md` — Axe B, 24 sprints, 48 semaines  
- `IMUCOMPANION_ROADMAP_MOBILE.md` — 6 phases IC-M1→IC-M6, 27 semaines  
- `Vision_Structure_Mobile_v2.md` — Wireframes enrichis, 120+ écrans  
- `ImuFeed_VIDEO_v2.md` — Spec détaillée feed vidéo, algo, DB  
**Index :** → [`MOBILE_INDEX.md`](./MOBILE_INDEX.md)  
**Stack :** Expo SDK 52+ · React Native · TypeScript 5 · Zustand · expo-router · Supabase · RN Reanimated  
**État actuel :** ~84% MVP — 42/50 features · ~80k lignes TS/TSX · 2296 tests · 6 thèmes

---

## Architecture des axes

```
┌──────────────────────────────────────────────────────────────────┐
│                  MOBILE ROADMAP UNIFIÉE                          │
│              (ce document — ~60 semaines · S1→S60)               │
├─────────────────────────┬────────────────────────────────────────┤
│     Axe A               │      Axe B                             │
│  Navigation Hub         │   ImuFeed Video                        │
│  19 sprints · 38 sem    │   24 sprints · 48 sem                  │
│  7 phases               │   7 phases                             │
├─────────────────────────┴────────────────────────────────────────┤
│              Exécution parallèle (2 squads)                      │
│    Squad Navigation + Squad ImuFeed                              │
├──────────────────────────────────────────────────────────────────┤
│     Axe C — Cross-Domain (4 sprints · 8 sem · après convergence)│
├──────────────────────────────────────────────────────────────────┤
│     ImuCompanion Engine (6 phases · ~27 sem · à partir de S33)   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Planning consolidé — Vue par trimestre

### 🟥 T1 — Fondations & MVP Feed (Semaines 1-12)

> **Priorité :** Home Hub refonte, FAB, ImuFeed MVP, feed social enrichi

#### Axe A — Navigation Hub (Squad Navigation)

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 1-2 | S1 | Home Hub | `home-config-store.ts`, QuickActionsGrid 3×3, SectionManager priority-based | `NAV_HUB` Sprint 1 |
| 3-4 | S2 | Home Hub | SocialActivity feed snapshot, TrendingItems carousel, HomeSearchBar + filtres | `NAV_HUB` Sprint 2 |
| 5-6 | S3 | Home Hub | SuggestionSection (contacts, modules, events), A/B tests layout, onboarding | `NAV_HUB` Sprint 3 |
| 7-8 | S4 | FAB | FloatingActionButton 7 actions, position BottomRight, animation spring | `NAV_HUB` Sprint 4 |
| 9-10 | S5 | FAB | Comportement contextuel (Home/Chat/Social/Watch), config personalisable | `NAV_HUB` Sprint 5 |
| 11-12 | S6 | Widgets | WidgetCard composant base, WidgetGrid (ScrollView/FlatList), 4 types initiaux | `NAV_HUB` Sprint 6 |

**Livrables T1 Axe A :**
- ✅ Home Hub fonctionnel avec données réelles (remplace mock actuel ~50%)
- ✅ FAB universel avec 7 actions + contextuel
- ✅ Système de widgets (base)

#### Axe B — ImuFeed Video (Squad ImuFeed)

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 1-2 | S1 | MVP Feed | `imufeed/types.ts`, `imufeed-store.ts`, service API, tables Supabase | `IMUFEED` Sprint 1 |
| 3-4 | S2 | MVP Feed | Feed vertical (FlatList paginated), gestes swipe/tap, player expo-video | `IMUFEED` Sprint 2 |
| 5-6 | S3 | MVP Upload | CameraScreen expo-camera, vidéo capture, upload Supabase Storage, preview | `IMUFEED` Sprint 3 |
| 7-8 | S4 | MVP Éditeur | Éditeur basique : trim, texte overlay, filtres simples, export | `IMUFEED` Sprint 4 |
| 9-10 | S5 | Social | Commentaires hiérarchiques, likes/bookmarks, partage DM/stories | `IMUFEED` Sprint 5 |
| 11-12 | S6 | Social | Hashtags, tendances, page hashtag dédiée, mentions | `IMUFEED` Sprint 6 |

**Livrables T1 Axe B :**
- ✅ Feed vertical fonctionnel avec lecture vidéo
- ✅ Upload + capture caméra
- ✅ Éditeur vidéo basique
- ✅ Commentaires et interactions sociales

**Convergence T1 :** Les deux axes sont indépendants. Le FAB (Axe A) ajoutera « Créer ImuFeed » une fois l'upload (Axe B Sprint 3) disponible.

---

### 🟧 T2 — Widgets, Découverte & Éditeur Avancé (Semaines 13-24)

#### Axe A — Navigation Hub

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 13-14 | S7 | Widgets | 8 nouveaux types (météo, finance, agenda…), drag & drop réorganisation | `NAV_HUB` Sprint 7 |
| 15-16 | S8 | Widgets | Widgets dynamiques (données temps réel), refresh configurable, thèmes widget | `NAV_HUB` Sprint 8 |
| 17-18 | S9 | Personnalisation | Usage tracking analytics, recommandations basées sur comportement | `NAV_HUB` Sprint 9 |
| 19-20 | S10 | Personnalisation & IA | Adaptation time-of-day, intégration Alice IA dans Home, quick-reply | `NAV_HUB` Sprint 10 |
| 21-22 | S11 | Onglets Enrichis | Social sub-tabs (Feed/ImuFeed/Stories), refonte navigation Social | `NAV_HUB` Sprint 11 |
| 23-24 | S12 | Onglets Enrichis | Watch tab enrichi (catégories, Watch Party), Profil enrichi (Wallet) | `NAV_HUB` Sprint 12 |

**Livrables T2 Axe A :**
- ✅ 12 types de widgets complets avec drag & drop
- ✅ Personnalisation IA (comportement + time-of-day)
- ✅ Social avec sub-tabs (Feed/ImuFeed/Stories)
- ✅ Watch enrichi + Profil avec Wallet

#### Axe B — ImuFeed Video

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 13-14 | S7 | Découverte | Algorithme "Pour Toi" (6 signaux pondérés), feed personnalisé | `IMUFEED` Sprint 7 |
| 15-16 | S8 | Découverte | Page Explore (grille vidéos, catégories, créateurs), recherche riche | `IMUFEED` Sprint 8 |
| 17-18 | S9 | Éditeur Avancé | Bibliothèque musicale, synchronisation audio-vidéo, trim audio | `IMUFEED` Sprint 9 |
| 19-20 | S10 | Éditeur Avancé | Filtres manga/anime IA, effets AR, stickers animés | `IMUFEED` Sprint 10 |
| 21-22 | S11 | Éditeur Avancé | Mode Remix/Duo (split screen), Réaction vidéo, Green screen | `IMUFEED` Sprint 11 |
| 23-24 | S12 | Créateurs | Profil créateur enrichi, XP/niveaux/badges (6 tiers), statistiques | `IMUFEED` Sprint 12 |

**Livrables T2 Axe B :**
- ✅ Algo "Pour Toi" fonctionnel
- ✅ Page Explore avec recherche
- ✅ Éditeur avancé (musique, filtres IA, remix/duo)
- ✅ Système gamification créateurs

**Convergence T2 :**
- S11 Axe A (Social sub-tabs) intègre ImuFeed comme sous-onglet → dépendance Axe B Sprint 6+
- S12 Axe A (Watch enrichi) peut afficher du contenu ImuFeed → dépendance Axe B Sprint 7+

---

### 🟩 T3 — Monétisation, Live, Polish & ImuCompanion (Semaines 25-38)

#### Axe A — Navigation Hub

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 25-26 | S13 | Onglets Enrichis | Profil enrichi (Arena, Analytics, Modules), intégrations cross-tab | `NAV_HUB` Sprint 13 |
| 27-28 | S14 | Polish & A11y | FlashList migration, performance audit, memoization, 60fps | `NAV_HUB` Sprint 14 |
| 29-30 | S15 | Polish & A11y | Offline mode (AsyncStorage cache), WCAG AA audit, VoiceOver | `NAV_HUB` Sprint 15 |

#### Axe B — ImuFeed Video

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 25-26 | S13 | Créateurs | Dashboard créateur, analytics engagement, pourboires ImuCoins | `IMUFEED` Sprint 13 |
| 27-28 | S14 | Créateurs | Abonnements premium, marketplace créateurs, monétisation avancée | `IMUFEED` Sprint 14 |
| 29-30 | S15 | Live Streaming | Infrastructure live (RTMP/HLS), permissions, indicateurs live | `IMUFEED` Sprint 15 |
| 31-32 | S16 | Live Streaming | UI streamer (tableau de bord), UI viewer (chat en direct, cadeaux) | `IMUFEED` Sprint 16 |
| 33-34 | S17 | Live Streaming | Co-host, replay automatique, clips live, filtres en direct | `IMUFEED` Sprint 17 |

#### ImuCompanion Engine (démarre S33)

| Sem. | Sprint | Phase IC-M | Focus | Réf. détail |
|:----:|:------:|:----------:|-------|-------------|
| 33-34 | S17 | IC-M1 | Types companion, companion-store, useCompanion hook | `COMPANION` IC-M1 |
| 35-36 | S18 | IC-M1→IC-M2 | CompanionOverlay UI, backend post-processing, expo-gl setup | `COMPANION` IC-M1-M2 |
| 37-38 | S19 | IC-M2 | Live2D native bridge iOS/Android, model loader, animations | `COMPANION` IC-M2 |

**Livrables T3 :**
- ✅ Axe A terminé (Sprint 15) : performance, offline, a11y
- ✅ ImuFeed : monétisation + live streaming opérationnel
- ✅ ImuCompanion : core + début rendering Live2D

**Convergence T3 :**
- Le dashboard créateur (Axe B S13) nécessite le Wallet (Axe A S12 Profil enrichi)
- ImuCompanion (IC-M1) réutilise l'infrastructure Alice IA (DEV-024, prérequis ✅)

---

### 🟦 T4 — IA, Scale, Écosystème & Cross-Domain (Semaines 39-52+)

#### Axe B — ImuFeed Video (finalisation)

| Sem. | Sprint | Phase | Focus | Réf. détail |
|:----:|:------:|-------|-------|-------------|
| 39-40 | S20 | IA & Modération | Pipeline modération IA (NSFW, violence, hate speech), contentieux auto | `IMUFEED` Sprint 18 |
| 41-42 | S21 | IA & Modération | Algo recommandation avancé (ML), tests A/B, calibration | `IMUFEED` Sprint 19 |
| 43-44 | S22 | IA & Scale | Adaptive bitrate, CDN, PiP (expo-video), background play | `IMUFEED` Sprint 20 |
| 45-46 | S23 | Intégration | Partage DM/chat, Watch Party, Store/Arena intégrations | `IMUFEED` Sprint 21-22 |
| 47-48 | S24 | Intégration | Home widget ImuFeed, Store intégration, Arena challenges | `IMUFEED` Sprint 23 |
| 49-50 | S25 | Intégration | Age segmentation, parental controls, challenges, finaux | `IMUFEED` Sprint 24 |

#### Axe C — Cross-Domain (après convergence Axes A+B)

| Sem. | Sprint | Focus | Réf. détail |
|:----:|:------:|-------|-------------|
| 43-44 | S22 | Gaming Hub Mobile : catalogue, profil gaming, mini-jeux | `NAV_HUB` Sprint 16 |
| 45-46 | S23 | ImuArena Mobile : concours, votes, leaderboards, saisons | `NAV_HUB` Sprint 17 |
| 47-48 | S24 | Finance Hub Mobile : wallet avancé, P2P enrichi | `NAV_HUB` Sprint 18 |
| 49-50 | S25 | ImuCompanion intégré dans tous les tabs (Cross-Domain Sprint 19) | `NAV_HUB` Sprint 19 |

#### ImuCompanion Engine (suite)

| Sem. | Sprint | Phase IC-M | Focus | Réf. détail |
|:----:|:------:|:----------:|-------|-------------|
| 39-40 | S20 | IC-M2 | Animation controller, expression system | `COMPANION` IC-M2 |
| 41-42 | S21 | IC-M3 | Behaviour Engine FSM (7 états), context adapter | `COMPANION` IC-M3 |
| 43-44 | S22 | IC-M3 | Age segmentation, tests FSM | `COMPANION` IC-M3 |
| 45-46 | S23 | IC-M4 | TTS streaming, lip sync amplitude→ParamMouthOpen | `COMPANION` IC-M4 |
| 47-48 | S24 | IC-M5 | 6 archétypes, appearance customizer, skins premium | `COMPANION` IC-M5 |
| 49-50 | S25 | IC-M5 | Store skins, archétype gallery, animation preview | `COMPANION` IC-M5 |
| 51-52 | S26 | IC-M6 | Avatar en appel vidéo, message reactions animées | `COMPANION` IC-M6 |
| 53-56 | S27-S28 | IC-M6 | Intégration modules (Chat→résumé, Store→reco), offline | `COMPANION` IC-M6 |

**Livrables T4 :**
- ✅ ImuFeed complet (modération IA, live, PiP, intégration écosystème)
- ✅ Cross-Domain intégrés (Gaming, Arena, Finance)
- ✅ ImuCompanion complet (Live2D, FSM, TTS, archétypes, appels avatar)

---

## Points de convergence entre axes

| # | Convergence | Semaine | Axes concernés |
|---|-------------|:-------:|:--------------:|
| C1 | FAB ajoute « Créer ImuFeed » | S6 | A ← B |
| C2 | Social sub-tabs intègrent ImuFeed | S21-22 | A ← B |
| C3 | Watch tab affiche contenu ImuFeed | S23-24 | A ← B |
| C4 | Dashboard créateur requiert Wallet | S25-26 | B ← A |
| C5 | Home widget ImuFeed | S47-48 | B → A (Widgets) |
| C6 | ImuCompanion dans tous les tabs | S49-50 | IC → A+B |
| C7 | Cross-Domain Gaming dans Home | S43-44 | C → A |
| C8 | Arena challenges dans ImuFeed | S47-48 | C → B |
| C9 | Finance P2P dans Chat | S47-48 | C → Chats |
| C10 | Contrôle parental global | S49-50 | B → Tous |

---

## Métriques globales consolidées

| Métrique | Actuel | Fin T1 | Fin T2 | Fin T3 | Fin T4 |
|----------|:------:|:------:|:------:|:------:|:------:|
| **Features core (50)** | 42/50 (84%) | 44/50 | 47/50 | 49/50 | 50/50 |
| **Écrans implémentés** | ~80 | ~95 | ~110 | ~120 | 130+ |
| **Tests** | 2296 | 2800+ | 3500+ | 4200+ | 5000+ |
| **Home Hub** | 50% mock | Réel | Widgets complets | Polished | + Cross-Domain |
| **ImuFeed** | ❌ | MVP feed+upload | Éditeur+Explore | Live+Monétisation | Complet |
| **FAB** | ❌ | 7 actions | Contextuel complet | — | — |
| **Widget System** | ❌ | 4 types | 12 types + drag | — | — |
| **Personnalisation IA** | ❌ | ❌ | Alice Home | — | — |
| **ImuCompanion** | ❌ | ❌ | ❌ | Core + Live2D début | Complet |
| **Gaming Hub** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **ImuArena** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Finance Hub** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **FPS cible** | Non mesuré | 60fps | 60fps | 60fps | 60fps |
| **Bundle OTA** | Non mesuré | < 50MB | < 55MB | < 60MB | < 65MB* |

> *\*Bundle augmente avec Live2D assets (lazy-loaded)*

---

## Équipe recommandée

### T1-T2 (2 squads parallèles)

| Squad | Développeurs | Focus |
|-------|:------------:|-------|
| **Navigation** | 2 RN Senior + 1 Designer | Axe A (Home, FAB, Widgets, Personnalisation) |
| **ImuFeed** | 2 RN Senior + 1 RN Mid + 1 Backend | Axe B (Feed, Upload, Éditeur, Social) |
| **QA** | 1 QA dédié | Tests cross-axes |
| **Total** | 7 personnes | |

### T3 (2 squads + specialty)

| Squad | Développeurs | Focus |
|-------|:------------:|-------|
| **Navigation** | 2 devs | Axe A Polish + A11y |
| **ImuFeed** | 3 devs | Live streaming + monétisation |
| **Companion** | 1 dev C++/GL + 1 RN Senior | IC-M1 à IC-M2 |
| **Total** | 7 personnes | |

### T4 (équipe fusionnée + domaines)

| Squad | Développeurs | Focus |
|-------|:------------:|-------|
| **Full Stack** | 4 devs RN | Axe B finition + Axe C Cross-Domain |
| **Companion** | 2 devs | IC-M3 à IC-M6 |
| **Backend** | 1 dev | APIs Gaming, Arena, Finance |
| **Total** | 7 personnes | |

---

## Risques & Mitigations

| # | Risque | Impact | Prob. | Mitigation |
|---|--------|:------:|:-----:|------------|
| R1 | Live2D natif instable sur Android | 🔴 Critique | Moyenne | Fallback WebView Live2D Web SDK |
| R2 | Performances feed vertical > 1000 vidéos | 🟠 Élevé | Haute | FlashList + déchargement agressif + pool de players |
| R3 | Expo SDK upgrade breaking | 🟠 Élevé | Moyenne | Verrouiller SDK version, tester en staging |
| R4 | Algorithmique "Pour Toi" cold start | 🟡 Moyen | Haute | Contenu éditorial populaire en fallback |
| R5 | Live streaming latence mobile | 🟠 Élevé | Moyenne | CDN multi-régions, adaptive bitrate, tests charge |
| R6 | Bundle trop lourd (Live2D + vidéo) | 🟡 Moyen | Haute | Lazy loading, OTA updates, assets CDN |
| R7 | Modération IA faux positifs | 🟡 Moyen | Haute | Human-in-the-loop review, seuils configurables |
| R8 | ImuCompanion batterie/CPU impact | 🟠 Élevé | Moyenne | <8% CPU idle, <50MB RAM, pause en background |
| R9 | Cross-Domain APIs non prêtes | 🟠 Élevé | Moyenne | Mock APIs dès S40, intégration progressive |
| R10 | App Store review Live2D/gaming | 🟡 Moyen | Basse | Documenter Apple/Google policies, feature flags |
| R11 | Parental controls compliance (COPPA) | 🟠 Élevé | Moyenne | Consulter legal, age gate strict, tier KIDS restrictif |
| R12 | Conflits push navigation Home Hub refonte | 🟡 Moyen | Moyenne | Feature flags progressifs, rollback facile |
| R13 | TTS qualité insuffisante sur mobile | 🟡 Moyen | Moyenne | Fallback API cloud (OpenAI TTS), voix premium |
| R14 | Fragmentation Android GPU/WebGL | 🟡 Moyen | Haute | Tests sur 10+ devices, fallback 2D statique |

---

## Jalons (Milestones)

| Milestone | Semaine | Livrables clés |
|-----------|:-------:|----------------|
| **M1 — Home Hub v2** | S6 | Home avec données réelles, QuickActions, Sections configurables |
| **M2 — FAB Live** | S10 | FloatingActionButton 7 actions, contextuel par tab |
| **M3 — ImuFeed MVP** | S8 | Feed vertical fonctionnel, upload, éditeur basique |
| **M4 — Social + Feed** | S12 | Commentaires, hashtags, interactions sociales complètes |
| **M5 — Widgets System** | S16 | 12 types de widgets, drag & drop, données temps réel |
| **M6 — Algo "Pour Toi"** | S14 | Feed personnalisé avec algorithme recommandation |
| **M7 — Éditeur Pro** | S22 | Musique, filtres manga/anime IA, remix/duo |
| **M8 — Social Tabs Enrichis** | S24 | Sub-tabs Social, Watch enrichi, Profil avec Wallet |
| **M9 — Performance AA** | S30 | FlashList, 60fps, WCAG AA, offline |
| **M10 — Live Streaming** | S34 | Infrastructure live, UI streamer/viewer, co-host |
| **M11 — Monétisation Créateurs** | S28 | Dashboard, pourboires, abonnements premium |
| **M12 — ImuCompanion Core** | S36 | Store, hook, overlay UI, Alice intégrée |
| **🏁 Mobile App 1.0** | S38 | Axe A complet, ImuFeed social/découverte, Companion base |
| **M13 — Live2D Rendu** | S40 | Avatar Live2D natif, animations, expressions |
| **M14 — Cross-Domain** | S50 | Gaming Hub, ImuArena, Finance Hub intégrés |
| **M15 — ImuCompanion Full** | S56 | FSM, TTS, archétypes, appel avatar, offline |
| **🏁 Mobile App 2.0** | S60 | Feature-complete : ImuFeed, Cross-Domain, Companion |

---

## Résumé exécutif

| Paramètre | Valeur |
|-----------|--------|
| **Sprints totaux (global)** | ~28 (Axe A: 15 + Axe C: 4 + IC: ~9) ∥ Axe B: 24 |
| **Durée totale** | ~60 semaines (~15 mois) avec parallélisation |
| **Équipe recommandée** | 7 personnes (2 squads T1-T2, fusionné T3-T4) |
| **Axes parallèles** | 2 (Navigation ∥ ImuFeed) + Cross-Domain séquentiel + Companion semi-parallèle |
| **Milestones** | 15 + 2 releases majeures (1.0, 2.0) |
| **État actuel** | 84% MVP (42/50 features) |
| **Résultat** | Mobile App ImuChat 2.0 — Super-app complète avec ImuFeed, Cross-Domain, ImuCompanion |

---

> 📱 Index de navigation → [`MOBILE_INDEX.md`](./MOBILE_INDEX.md)  
> 🌐 Roadmap web unifiée → [`../_web/WEB_ROADMAP_UNIFIED.md`](../_web/WEB_ROADMAP_UNIFIED.md)  
> 🖥️ Roadmap desktop unifiée → [`../_desktop/DESKTOP_ROADMAP_UNIFIED.md`](../_desktop/DESKTOP_ROADMAP_UNIFIED.md)
