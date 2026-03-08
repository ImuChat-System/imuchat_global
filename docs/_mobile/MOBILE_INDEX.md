# 📱 INDEX — Documentation Mobile App ImuChat

> **Date de création :** 9 mars 2026  
> **Rôle :** Point d'entrée unique pour naviguer dans la documentation de développement mobile.  
> **Document de référence roadmap :** → [`MOBILE_ROADMAP_UNIFIED.md`](./MOBILE_ROADMAP_UNIFIED.md)

---

## Hiérarchie documentaire

```
📱 MOBILE_INDEX.md  ← CE DOCUMENT (navigation)
 │
 ├── 📋 MOBILE_ROADMAP_UNIFIED.md              ← SOURCE DE VÉRITÉ (roadmap consolidée)
 │
 ├── 🗺️ Documents actifs (sous-roadmaps détaillées)
 │   ├── ROADMAP_MOBILE_GLOBAL.md              ← Vue consolidée 3 axes (supercédé par UNIFIED)
 │   ├── ROADMAP_MOBILE_NAVIGATION_HUB.md      ← Détail Axe A · 19 sprints
 │   ├── ROADMAP_IMUFEED_VIDEO.md              ← Détail Axe B · 24 sprints
 │   └── IMUCOMPANION_ROADMAP_MOBILE.md        ← Spécialisé Companion · 6 phases
 │
 └── 📚 Documents de référence / archivés
     ├── Vision_Structure_Mobile_v2.md          ← Wireframes détaillés, mapping 120+ écrans
     ├── Vision_Structure_Mobile.md             ← ⚠️ ARCHIVÉ — remplacé par v2
     └── ImuFeed_VIDEO_v2.md                   ← Spec détaillée ImuFeed (stratégie, algo, DB)
```

---

## Classification des documents

| Document | Statut | Rôle | Quand le consulter |
|----------|:------:|------|-------------------|
| **MOBILE_ROADMAP_UNIFIED.md** | 🟢 Actif | Source de vérité unique, sprints globaux S1→S52 | Planification sprint, suivi avancement, KPIs |
| **ROADMAP_MOBILE_GLOBAL.md** | 🟡 Référence | Consolidation originale 3 axes, 47 sprints locaux | Comprendre l'architecture des axes parallèles |
| **ROADMAP_MOBILE_NAVIGATION_HUB.md** | 🟢 Actif | Tâches détaillées Axe A (fichiers, composants) | Implémentation Home Hub, FAB, Widgets, Onglets |
| **ROADMAP_IMUFEED_VIDEO.md** | 🟢 Actif | Tâches détaillées Axe B (ImuFeed Video) | Implémentation feed, upload, éditeur, live |
| **IMUCOMPANION_ROADMAP_MOBILE.md** | 🟢 Actif | Roadmap spécialisée ImuCompanion | Implémentation Live2D, FSM, TTS, archétypes |
| **Vision_Structure_Mobile_v2.md** | 🟡 Référence | Wireframes enrichis, mapping 120+ écrans, UX cible | Design UI/UX, spécifications écrans |
| **Vision_Structure_Mobile.md** | 🔴 Archivé | Vision initiale — entièrement supercédé par v2 | Ne pas consulter, garder pour historique |
| **ImuFeed_VIDEO_v2.md** | 🟡 Référence | Spec détaillée : algo recommandation, DB schema, modération | Spécifications techniques ImuFeed avancées |

---

## Table de correspondance des sprints

Le **MOBILE_ROADMAP_UNIFIED** utilise une numérotation globale (S1→S52). Voici la correspondance avec les sprints locaux de chaque sous-roadmap :

### Axe A — Navigation Hub (exécution parallèle avec Axe B)

| Sprint Global | Sprint Local Axe A | Phase | Focus |
|:------------:|:------------------:|-------|-------|
| S1-S2 | A-Sprint 1 | Home Hub | home-config-store, QuickActionsGrid |
| S3-S4 | A-Sprint 2-3 | Home Hub | SocialActivity, Trending, SectionManager |
| S5-S6 | A-Sprint 4-5 | FAB | FloatingActionButton, 7 actions, contextuel |
| S7-S10 | A-Sprint 6-8 | Widget System | WidgetCard/Grid, 12 types, drag & drop |
| S11-S14 | A-Sprint 9-10 | Personnalisation & IA | Usage tracking, time-of-day, Alice IA |
| S15-S20 | A-Sprint 11-13 | Onglets Enrichis | Social sub-tabs, Watch enrichi, Profil enrichi |
| S21-S24 | A-Sprint 14-15 | Polish & A11y | FlashList, offline, WCAG AA |
| S25-S32 | A-Sprint 16-19 | Cross-Domain | Gaming Hub, ImuArena, Finance Hub, ImuCompanion |

### Axe B — ImuFeed Video (exécution parallèle avec Axe A)

| Sprint Global | Sprint Local Axe B | Phase | Focus |
|:------------:|:------------------:|-------|-------|
| S1-S4 | B-Sprint 1-4 | MVP Feed & Upload | Types, store, API, feed vertical, upload, éditeur |
| S5-S8 | B-Sprint 5-8 | Social & Découverte | Commentaires, hashtags, algo "Pour Toi", Explore |
| S9-S14 | B-Sprint 9-11 | Éditeur Avancé | Musique, filtres manga/anime IA, remix/duo |
| S15-S20 | B-Sprint 12-14 | Créateurs & Monétisation | XP/niveaux, dashboard, pourboires ImuCoins |
| S21-S28 | B-Sprint 15-17 | Live Streaming | Infrastructure, UI streamer/viewer, co-host/replay |
| S29-S34 | B-Sprint 18-20 | IA & Modération | Pipeline modération IA, algo avancé, PiP, CDN |
| S35-S42 | B-Sprint 21-24 | Intégration Écosystème | DM/chat, Watch Party, Store/Arena, parental |

### Axe C — Cross-Domain (après convergence A+B)

| Sprint Global | Sprint Local Axe C | Focus |
|:------------:|:------------------:|-------|
| S43-S46 | C-Sprint 1-2 | Gaming Hub Mobile, ImuArena |
| S47-S50 | C-Sprint 3-4 | Finance Hub, ImuCompanion intégré |

### ImuCompanion (séquentiel, démarre après bases IA posées)

| Sprint Global | Phase IC-M | Focus |
|:------------:|:----------:|-------|
| S33-S36 | IC-M1 | Companion Core (types, store, hook, overlay UI) |
| S37-S42 | IC-M2 | Rendering Live2D (expo-gl, native bridge, modèle) |
| S43-S46 | IC-M3 | Behaviour Engine FSM (7 états, contexte, âge) |
| S47-S49 | IC-M4 | TTS & Lip Sync (streaming, amplitude, pipeline) |
| S50-S53 | IC-M5 | Personnalisation (6 archétypes, skins, customizer) |
| S54-S59 | IC-M6 | Mode Appel Avatar & Avancé (vidéo, offline, modules) |

---

## État actuel de la plateforme mobile

| Métrique | Valeur |
|----------|--------|
| **Complétion globale** | ~84% (42/50 features core) |
| **Lignes de code** | ~80 000 TS/TSX |
| **Fichiers** | ~340+ |
| **Tests** | 2 296 |
| **Stack** | Expo SDK 52+, expo-router, Zustand, Supabase, RN Reanimated |
| **Thèmes** | 6 (Light, Dark, Kawaii, Pro, Neon, Ocean) |
| **Tabs principaux** | 6 (Home, Chats, Social, Watch, Store, Profil) |
| **Écrans mappés** | 120+ |

### État par onglet

| Onglet | Complétion | Notes |
|--------|:----------:|-------|
| Home | ~50% | Mock data, QuickActions stub |
| Chats | ~95% | Supabase réel, manque threads/pins |
| Social | Réel | Feed + Stories Supabase, manque ImuFeed |
| Watch | ~60% | Mock partiel, manque ImuFeed Video |
| Store | Connecté | Supabase réel, manque reviews/wallet |
| Profil | ~85% | Réel, manque wallet/arena/analytics |

---

## Conventions

- **Sprint Global (S1-S52)** : Numérotation unique dans `MOBILE_ROADMAP_UNIFIED.md`
- **Sprint Local (A-Sprint X, B-Sprint Y, C-Sprint Z)** : Numérotation dans les sous-roadmaps
- **IC-MX** : Phases ImuCompanion Mobile
- **G1-G10** : Groupes fonctionnels de `50_FONCTIONNALITIES_SCREENS.md`

---

> 📋 Pour la roadmap détaillée consolidée, consulter → [`MOBILE_ROADMAP_UNIFIED.md`](./MOBILE_ROADMAP_UNIFIED.md)  
> 🌐 Pour l'index web, consulter → [`../\_web/WEB_INDEX.md`](../_web/WEB_INDEX.md)  
> 🖥️ Pour l'index desktop, consulter → [`../\_desktop/DESKTOP_INDEX.md`](../_desktop/DESKTOP_INDEX.md)
