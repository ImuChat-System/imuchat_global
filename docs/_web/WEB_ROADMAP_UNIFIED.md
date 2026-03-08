# 🌐 ROADMAP UNIFIÉE — Web App ImuChat · Consolidée

**Date de création :** 9 mars 2026  
**Documents source :**  

- `ROADMAP_WEB_GLOBAL.md` — 2 axes, 32 sprints locaux  
- `ROADMAP_WEB_FEATURES_UX.md` — Axe FX, 20 sprints, 40 semaines  
- `ROADMAP_WEB_QUALITY_SECURITY.md` — Axe QS, 12 sprints, 24 semaines  
- `FRONTEND_AUDIT_SUPERAPP.md` — Audit détaillé, note B-, Sécurité D  
- `AUDIT_MISSING_SCREENS.md` — 117 routes, 28 absentes, 15 partielles  
- `IMUCOMPANION_ROADMAP_WEBAPP.md` — 6 phases IC-W1→IC-W6, ~21 semaines  
- `MVP_PHASE_5_NICE_TO_HAVE.md` — Backlog post-MVP, 6 sprints, ~16 semaines  
**Index :** → [`WEB_INDEX.md`](./WEB_INDEX.md)  
**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · Supabase · Socket.IO · Stream Video  
**État actuel :** ~70-80% MVP · 117 routes · 19/50 features (38%) · Sécurité D · Tests 20%

---

## Architecture des axes

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WEB ROADMAP UNIFIÉE                               │
│                 (ce document — ~44 sem · S1→S44)                     │
├───────────────────────────┬─────────────────────────────────────────┤
│    Axe QS                 │    Axe FX                                │
│  Qualité & Sécurité       │  Features & UX                           │
│  12 sprints · 24 sem      │  20 sprints · 40 sem                     │
│  6 phases                 │  7 phases                                │
├───────────────────────────┴─────────────────────────────────────────┤
│               Exécution parallèle (2 squads Q1-Q2)                   │
│                  Fusionnée Q3-Q4 + domain teams                      │
├─────────────────────────────────────────────────────────────────────┤
│   ImuCompanion Web (6 phases IC-W1→IC-W6 · ~21 sem · dès S31)       │
├─────────────────────────────────────────────────────────────────────┤
│   Nice-to-have Backlog (6 sprints A-F · ~16 sem · post S44)         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Planning consolidé — Vue par trimestre

### 🟥 T1 — Sécurité critique, i18n & Modules manquants (Semaines 1-12)

> **Priorité :** Résoudre Sécurité D→B, couverture i18n 100%, modules manquants

#### Axe QS — Qualité & Sécurité (Squad QS, 2 devs)

| Sem. | Sprint | Phase QS | Focus | Criticité |
|:----:|:------:|----------|-------|:---------:|
| 1-2 | QS-1 | Sécurité Critique | DOMPurify pour tous les inputs, Content-Security-Policy headers, security headers (X-Frame, X-Content-Type, HSTS), suppression `ignoreBuildErrors: true` | 🔴 |
| 3-4 | QS-2 | Sécurité Critique | CSRF tokens, cookies httpOnly/Secure/SameSite, validation Zod exhaustive, localStorage encryption AES-256, nettoyage Firebase legacy | 🔴 |
| 5-6 | QS-3 | Tests Fondation | Mock factories (10+ entités), MSW handlers, tests unitaires Auth+Chat+Store (30+ tests) | 🟠 |
| 7-8 | QS-4 | Tests Composants | Tests hooks (8+), services (6+), contexts refactorisés → couverture 65% | 🟠 |
| 9-10 | QS-5 | Tests E2E | Playwright : Auth flow, Chat flow, Store flow, Profile flow → couverture 70% | 🟠 |
| 11-12 | QS-6 | Performance | TanStack Query (remplace 4+ contexts), optimistic updates, React.memo stratégique | 🟡 |

**Livrables T1 QS :**

- ✅ Sécurité D → B (XSS, CSP, CSRF corrigés)
- ✅ Tests 20% → 70%
- ✅ TanStack Query en place

#### Axe FX — Features & UX (Squad FX, 3 devs)

| Sem. | Sprint | Phase FX | Focus | Écrans adressés |
|:----:|:------:|----------|-------|:---------------:|
| 1-2 | FX-1 | i18n & Responsive | Audit 100% textes, migration composants manquants vers i18next | ⚙️ Transverse |
| 3-4 | FX-2 | i18n & Responsive | ICU MessageFormat (plurals, genre, dates), préparation RTL (dir, layout) | ⚙️ Transverse |
| 5-6 | FX-3 | i18n & Responsive | Responsive mobile-first (breakpoints), touch targets 44px, swipe gestures | ⚙️ Transverse |
| 7-8 | FX-4 | Modules Manquants | Feed enrichi (timeline, reactions), communautés v2 (stats, modération tools) | +3 écrans |
| 9-10 | FX-5 | Modules Manquants | Dating module, Sports Hub, Smart Home dashboard | +6 écrans |
| 11-12 | FX-6 | Modules Manquants | Creator Studio (upload, analytics), Office suite (docs, tableur) | +5 écrans |

**Livrables T1 FX :**

- ✅ i18n 100% couverture (60% → 100%)
- ✅ Responsive mobile-first
- ✅ 6 modules manquants implémentés (+14 écrans)

**Convergence T1 :**

- QS-2 (validation Zod) bénéficie directement aux nouveaux modules FX
- Les nouveaux modules (FX-4→6) doivent intégrer DOMPurify dès le départ (QS-1)

---

### 🟧 T2 — Chat avancé, Store, Animations & A11y (Semaines 13-24)

#### Axe QS (Squad QS)

| Sem. | Sprint | Phase QS | Focus |
|:----:|:------:|----------|-------|
| 13-14 | QS-7 | Performance | Virtualisation listes (react-window), code splitting routes, Core Web Vitals <2.5s LCP, Socket lazy load |
| 15-16 | QS-8 | Accessibilité | ARIA audit 20+ composants, heading hierarchy h1→h6, focus management, keyboard navigation |
| 17-18 | QS-9 | Accessibilité | Contraste 16 combos thème×mode, prefers-reduced-motion, touch targets 44px, axe-core CI |
| 19-20 | QS-10 | Code Quality | ESLint strict rules, Prettier unification, consolidation 17→10 contexts, Supabase generated types |
| 21-22 | QS-11 | CI/CD | GitHub Actions pipeline (lint→test→build→deploy), Storybook 20+ stories, conventional commits |
| 23-24 | QS-12 | Monitoring | Sentry catégorisé (auth/chat/store), performance tracing, error boundaries React, Suspense lazy routes |

**Livrables T2 QS :**

- ✅ Performance B → A (LCP <2.5s, virtualisation)
- ✅ a11y C → A (WCAG AA compliant)
- ✅ CI/CD automatisé
- ✅ Monitoring Sentry opérationnel
- ✅ **Axe QS terminé** (12/12 sprints)

#### Axe FX (Squad FX)

| Sem. | Sprint | Phase FX | Focus | Écrans adressés |
|:----:|:------:|----------|-------|:---------------:|
| 13-14 | FX-7 | Modules Manquants | Discover page, Events, Stories timeline, Blog/mini-blogs | +6 écrans |
| 15-16 | FX-8 | Chat & Communication | Voice waveform visualizer, threads hierachiques, pins messages, sondages | +3 écrans |
| 17-18 | FX-9 | Chat & Communication | Screen share WebRTC, group calls, beauty filters, PiP mode | +4 écrans (AUDIT: PiP absent) |
| 19-20 | FX-10 | Chat & Communication | Presence indicator temps réel, read receipts, notification sounds, reconnexion auto | ⚙️ Transverse |
| 21-22 | FX-11 | Store & Monétisation | Store réel (produits, avis, Stripe checkout), transactions P2P, Wallet v2 | +5 écrans |
| 23-24 | FX-12 | Store & Monétisation | Dev Portal (submissions, SDK docs), revenue dashboard, Premium/subscriptions | +4 écrans |

**Livrables T2 FX :**

- ✅ Tous les modules manquants implémentés (Phases 1-2 FX complètes)
- ✅ Chat enrichi (waveform, threads, screen share, PiP)
- ✅ Store réel avec Stripe + Dev Portal
- ✅ Features core 38% → ~65%

**Convergence T2 :**

- Screen share (FX-9) nécessite les tests perf (QS-7) pour WebRTC
- Store Stripe (FX-11) requiert la sécurité CSRF (QS-2, déjà fait)
- Storybook (QS-11) documente les nouveaux composants Chat et Store

---

### 🟩 T3 — PWA, Admin, IA & ImuCompanion Core (Semaines 25-36)

> **Squads fusionnées** : 5 devs sur Axe FX restant + ImuCompanion démarrage

#### Axe FX (équipe fusionnée, 3-4 devs)

| Sem. | Sprint | Phase FX | Focus | Écrans adressés |
|:----:|:------:|----------|-------|:---------------:|
| 25-26 | FX-13 | Animations & PWA | Transitions page (Framer Motion), stagger lists, skeletons, Lottie onboarding | ⚙️ Transverse |
| 27-28 | FX-14 | Animations & PWA | Service Worker, offline cache (Workbox), push notifications, manifest PWA, install prompt | +2 écrans |
| 29-30 | FX-15 | Admin & IA | Admin panel enrichi, modération dashboard, analytics multi-graphes, user management | +6 écrans |
| 31-32 | FX-16 | Admin & IA | Alice E2E encrypted, Companion proactif, IA modération auto, smart replies | +3 écrans (AUDIT: smart replies absent) |
| 33-34 | FX-17 | Cross-Domain | Gaming Hub : catalogue mini-jeux, profils gamers, classements, matchmaking | +5 écrans |
| 35-36 | FX-18 | Cross-Domain | ImuArena : 6 catégories concours (Art, Musique, Code, Cuisine, Sport, Open), votes, jury, leaderboards | +6 écrans |

**Livrables T3 FX :**

- ✅ PWA offline fonctionnelle
- ✅ Admin & modération complets
- ✅ Alice IA avec chiffrement E2E
- ✅ Gaming Hub + ImuArena opérationnels

#### ImuCompanion Web (démarre S31, 1-2 devs dédiés)

| Sem. | Sprint | Phase IC-W | Focus | Réf. détail |
|:----:|:------:|:----------:|-------|-------------|
| 31-32 | S16 | IC-W1 | Types companion, Zustand companion-store, CompanionPanel UI (sidebar right), CompanionFAB, raccourci Cmd+J, Socket.IO events, i18n + 15 tests | `COMPANION_WEB` IC-W1 |
| 33-34 | S17 | IC-W2 début | Live2D Cubism Web SDK integration, React canvas wrapper `<CompanionCanvas>`, WebGL context management | `COMPANION_WEB` IC-W2 |
| 35-36 | S18 | IC-W2 fin | Model loader (.moc3/.json), idle animations, trigger animations, expression controller, responsive canvas, dark/light variants | `COMPANION_WEB` IC-W2 |

**Livrables T3 ImuCompanion :**

- ✅ Panel latéral fonctionnel avec Alice IA
- ✅ Live2D WebGL rendering opérationnel

---

### 🟦 T4 — Finance, Companion avancé & Finalisation (Semaines 37-44)

#### Axe FX (finalisation, 3 devs)

| Sem. | Sprint | Phase FX | Focus | Écrans adressés |
|:----:|:------:|----------|-------|:---------------:|
| 37-38 | FX-19 | Cross-Domain | Finance Hub : KYC/KYB, wallet avancé, P2P enrichi, cartes virtuelles, budget tracker | +8 écrans (AUDIT: KYC absent) |
| 39-40 | FX-20 | Cross-Domain | Intégrations finales cross-domain, polish UX, tests E2E cross-domain | ⚙️ Stabilisation |

**Livrables T4 FX :**

- ✅ **Axe FX terminé** (20/20 sprints) — Finance Hub, Cross-Domain complet

#### ImuCompanion Web (suite, 2 devs)

| Sem. | Sprint | Phase IC-W | Focus | Réf. détail |
|:----:|:------:|:----------:|-------|-------------|
| 37-38 | S19 | IC-W3 | Behaviour Engine FSM web (7 états), context adapter (route/sidebar/theme/visibility), Page Visibility API, proactive suggestions debounced | `COMPANION_WEB` IC-W3 |
| 39-40 | S20 | IC-W4 | SpeechSynthesis TTS, fallback cloud TTS, SpeechRecognition STT, AudioContext AnalyserNode→Live2D ParamMouthOpen lip sync | `COMPANION_WEB` IC-W4 |
| 41-42 | S21 | IC-W5 | Pages /companion (hub/archétypes/customize/settings), live preview 3D, skins store integration | `COMPANION_WEB` IC-W5 |
| 43-44 | S22 | IC-W6 | Avatar appel WebRTC (caméra→avatar), intégrations modules (Chat résumé, Store reco, Social suggestions), Command Palette, offline/PWA | `COMPANION_WEB` IC-W6 |

**Livrables T4 ImuCompanion :**

- ✅ FSM + TTS + lip sync
- ✅ Personnalisation + archétypes + skins
- ✅ **ImuCompanion Web terminé** (IC-W1→IC-W6)

---

## Backlog Nice-to-Have (post S44)

> Source : `MVP_PHASE_5_NICE_TO_HAVE.md` — ~16 semaines · ~80 dev-days  
> À prioriser selon retours utilisateurs et ressources disponibles.

| Sprint | Focus | Effort | Impact |
|:------:|-------|:------:|:------:|
| A | Stories enrichies, Sondages temps réel, Events, Mini-blogs | ~2 sem | Élevé |
| B | PiP avancé, Beauty filters desktop, Fonds animés, Création stickers | ~2 sem | Moyen |
| C | Multi-profils, Polices custom, Packs sons/icônes, Thèmes communautaires | ~2 sem | Moyen |
| D | Tableau collab (whiteboard), Split view, Multi-fenêtres | ~2 sem | Moyen |
| E | KYC avancé, Suivi colis, Annuaire, Module Cuisine | ~2 sem | Faible |
| F | ImuCompanion IC-W5/W6 avancé (archétypes supplémentaires, intégrations) | ~6 sem | Moyen |

---

## Écrans manquants adressés par sprint

> Référence : `AUDIT_MISSING_SCREENS.md` — 28 absents, 15 partiels

| Écran absent | Sprint résolutif | Statut |
|--------------|:----------------:|:------:|
| OTP / Vérification email | QS-1 / FX-1 | 📋 Planifié |
| Cookie consent | QS-2 | 📋 Planifié |
| Gestion appareils / sessions | QS-2 | 📋 Planifié |
| Clés E2E chiffrement | QS-2 → FX-16 | 📋 Planifié |
| Mode invité | FX-1 | 📋 Planifié |
| Communauté règles / stats | FX-4 | 📋 Planifié |
| Feed / timeline enrichi | FX-4 | 📋 Planifié |
| Dating module | FX-5 | 📋 Planifié |
| Sports Hub | FX-5 | 📋 Planifié |
| Smart Home | FX-5 | 📋 Planifié |
| Creator Studio | FX-6 | 📋 Planifié |
| Discover page | FX-7 | 📋 Planifié |
| Events | FX-7 | 📋 Planifié |
| Stories | FX-7 | 📋 Planifié |
| Blog / mini-blogs | FX-7 | 📋 Planifié |
| PiP mode | FX-9 | 📋 Planifié |
| Beauty filters | FX-9 | 📋 Planifié |
| Screen share | FX-9 | 📋 Planifié |
| Smart replies IA | FX-16 | 📋 Planifié |
| Mémoire IA | FX-16 | 📋 Planifié |
| Avatar 2D/3D | FX-20 / IC-W2 | 📋 Planifié |
| Gaming mini-jeux | FX-17 | 📋 Planifié |
| ImuArena | FX-18 | 📋 Planifié |
| Finance / KYC | FX-19 | 📋 Planifié |
| Multi-profils | Backlog Sprint C | 📋 Backlog |
| Fonds animés | Backlog Sprint B | 📋 Backlog |
| Sticker creation | Backlog Sprint B | 📋 Backlog |
| Roadmap page | Non planifié | ❓ |

**Couverture :** 27/28 écrans absents adressés dans le planning (96%).

---

## Métriques globales consolidées

| Métrique | Actuel | Fin T1 | Fin T2 | Fin T3 | Fin T4 |
|----------|:------:|:------:|:------:|:------:|:------:|
| **Sécurité** | D | B | A | A | A+ |
| **Tests couverture** | 20% | 70% | 80% | 85% | 88% |
| **Lighthouse perf** | ~80 | 85+ | 90+ | 93+ | 95+ |
| **Lighthouse a11y** | ~70 | 75 | 90+ | 95+ | 95+ |
| **i18n couverture** | 60% | 100% | 100% | 100% | 100% |
| **Features core (50)** | 19/50 (38%) | 28/50 (56%) | 35/50 (70%) | 43/50 (86%) | 48/50 (96%) |
| **Écrans implémentés** | 117 | 131 | 153 | 175 | 190+ |
| **Écrans absents** | 28 | 18 | 6 | 1 | 0 |
| **LCP** | Non mesuré | <3s | <2.5s | <2s | <2s |
| **Bundle JS** | Non mesuré | <350KB | <250KB | <200KB | <200KB |
| **ImuCompanion** | ❌ | ❌ | ❌ | IC-W1+W2 | Complet |
| **PWA offline** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **CI/CD** | ❌ | Partiel | ✅ | ✅ | ✅ |

---

## Équipe recommandée

### T1-T2 (2 squads parallèles)

| Squad | Développeurs | Focus |
|-------|:------------:|-------|
| **QS** | 2 devs fullstack | Sécurité, Tests, Performance, A11y |
| **FX** | 3 devs frontend | i18n, Modules, Chat, Store |
| **Total** | 5 personnes | |

### T3-T4 (squads fusionnées + spécialité)

| Squad | Développeurs | Focus |
|-------|:------------:|-------|
| **FX+QS** | 3 devs | PWA, Admin, Gaming, Arena, Finance |
| **Companion** | 1 dev WebGL + 1 dev frontend | IC-W1 à IC-W6 |
| **Total** | 5 personnes | |

---

## Dépendances inter-axes

| De | Vers | Nature | Semaine |
|----|------|--------|:-------:|
| QS-1 (DOMPurify) | FX-4+ (tous nouveaux modules) | Obligatoire | S2→ |
| QS-2 (Zod/CSRF) | FX-11 (Store Stripe) | Obligatoire | S4→S22 |
| QS-6 (TanStack Query) | FX-8+ (Chat temps réel) | Recommandé | S12→S16 |
| QS-7 (Virtualisation) | FX-9 (Screen share WebRTC) | Recommandé | S14→S18 |
| QS-11 (CI/CD) | FX-13+ (déploiements) | Enabler | S22→ |
| FX-14 (PWA SW) | IC-W6 (Companion offline) | Obligatoire | S28→S44 |
| FX-16 (Alice IA) | IC-W1 (Companion core) | Prérequis | S32→S31 |

---

## Risques & Mitigations

| # | Risque | Impact | Prob. | Mitigation |
|---|--------|:------:|:-----:|------------|
| R1 | XSS non corrigé (Sécurité D) | 🔴 Critique | Haute | Sprint QS-1 = priorité absolue, audit pénétration |
| R2 | `ignoreBuildErrors: true` en prod | 🔴 Critique | Certaine | Supprimer S1, corriger toutes les erreurs TS |
| R3 | TanStack Query migration régression | 🟠 Élevé | Moyenne | Migration progressive (1 context/sprint), tests avant/après |
| R4 | Live2D WebGL incompatibilité navigateurs | 🟠 Élevé | Moyenne | Fallback canvas 2D, détection WebGL au runtime |
| R5 | Stripe intégration compliance PCI | 🟠 Élevé | Basse | Stripe Elements (PCI SAQ-A), pas de stockage carte côté serveur |
| R6 | PWA Service Worker conflits Next.js | 🟡 Moyen | Moyenne | next-pwa ou Workbox InjectManifest, tests offline exhaustifs |
| R7 | Performance avec 190+ routes | 🟡 Moyen | Haute | Code splitting par route, lazy imports, bundle analyzer |
| R8 | WCAG AA sur 8 thèmes × 2 modes | 🟡 Moyen | Haute | Matrice contraste automatisée (16 combos), tests visuels |
| R9 | E2E tests fragiles (Playwright) | 🟡 Moyen | Moyenne | Sélecteurs data-testid, retry logic, tests isolés |
| R10 | KYC multi-country compliance | 🟠 Élevé | Moyenne | Partenaire KYC tiers (Onfido/Jumio), consultation juridique |
| R11 | Cross-Domain APIs non prêtes | 🟠 Élevé | Moyenne | Mock APIs dès T2, contrats API définis en avance |
| R12 | WebRTC screen share sur Safari | 🟡 Moyen | Haute | Détection navigateur, fallback invitation desktop |

---

## Jalons (Milestones)

| Milestone | Semaine | Livrables clés |
|-----------|:-------:|----------------|
| **M1 — Sécurité B** | S4 | XSS corrigé, CSP, CSRF, ignoreBuildErrors supprimé |
| **M2 — i18n 100%** | S6 | Tous les textes traduits, ICU format, RTL prêt |
| **M3 — Tests 70%** | S10 | Unitaires + E2E, MSW, mock factories |
| **M4 — Modules Phase 1** | S12 | Feed, Dating, Sports, Smart Home, Creator Studio |
| **M5 — Chat Pro** | S20 | Threads, PiP, screen share, presence |
| **M6 — Store Live** | S24 | Stripe, Wallet, Dev Portal, Premium |
| **M7 — Qualité A** | S24 | Perf 90+, a11y 95+, CI/CD, monitoring |
| **🏁 Web App 1.0** | S24 | QS terminé, 70% features, PWA partielle |
| **M8 — PWA Offline** | S28 | Service Worker, push notifications, manifest |
| **M9 — Admin IA** | S32 | Admin enrichi, Alice E2E, modération IA |
| **M10 — ImuCompanion Base** | S36 | Panel + Live2D WebGL opérationnel |
| **M11 — Gaming + Arena** | S36 | Gaming Hub, ImuArena 6 catégories |
| **M12 — Finance Hub** | S38 | KYC, wallet avancé, P2P, cartes |
| **M13 — ImuCompanion Full** | S44 | FSM, TTS, archétypes, appel avatar |
| **🏁 Web App 2.0** | S44 | Feature-complete : 96% features, Cross-Domain, Companion |

---

## Résumé exécutif

| Paramètre | Valeur |
|-----------|--------|
| **Sprints totaux** | 32 (QS: 12 + FX: 20) ∥ parallèles + IC-W: 6 séquentiels |
| **Durée totale** | ~44 semaines (~11 mois) avec parallélisation |
| **Équipe recommandée** | 5 personnes (2 squads T1-T2, fusionné T3-T4) |
| **Axes** | 2 parallèles (QS ∥ FX) + ImuCompanion semi-parallèle + Backlog |
| **Milestones** | 13 + 2 releases majeures (1.0 S24, 2.0 S44) |
| **État actuel** | 38% features (19/50), Sécurité D, Tests 20% |
| **Priorité critique T1** | Sécurité D → B, Tests 20% → 70% |
| **Résultat** | Web App ImuChat 2.0 — Super-app complète PWA avec Cross-Domain et ImuCompanion |

---

> 🌐 Index de navigation → [`WEB_INDEX.md`](./WEB_INDEX.md)  
> 📱 Roadmap mobile unifiée → [`../_mobile/MOBILE_ROADMAP_UNIFIED.md`](../_mobile/MOBILE_ROADMAP_UNIFIED.md)  
> 🖥️ Roadmap desktop unifiée → [`../_desktop/DESKTOP_ROADMAP_UNIFIED.md`](../_desktop/DESKTOP_ROADMAP_UNIFIED.md)
