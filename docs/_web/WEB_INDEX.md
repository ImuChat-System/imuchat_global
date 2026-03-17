# 🌐 WEB INDEX — Documents de suivi Web App ImuChat

**Date de création :** 9 mars 2026  
**Plateforme :** Web App ImuChat  
**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · Supabase · Socket.IO · Stream Video  
**État actuel :** ~70-80% MVP · 117 routes · 55+ services · 45+ composants Radix UI · 8 thèmes × 2 modes  
**Audit global :** Note B+ · Sécurité **A+** · Tests ~20% · 19/50 features (38%)

---

## Hiérarchie documentaire

```
docs/_web/
├── WEB_INDEX.md                         ← CE FICHIER (navigation)
├── WEB_ROADMAP_UNIFIED.md               ← Source de vérité unique (sprints unifiés)
│
├── ROADMAP_WEB_CROSS_PLATFORM.md        🟢 Actif — parité cross-platform vs mobile
├── ROADMAP_WEB_GLOBAL.md                🔵 Référence (remplacé par UNIFIED)
├── ROADMAP_WEB_FEATURES_UX.md           🟢 Actif — sous-roadmap Axe Features/UX
├── ROADMAP_WEB_QUALITY_SECURITY.md      🟢 Actif — sous-roadmap Axe Qualité/Sécu
├── FRONTEND_AUDIT_SUPERAPP.md           🔵 Référence — audit détaillé 15 sections
├── AUDIT_MISSING_SCREENS.md             🟢 Actif — écrans manquants & couverture
├── IMUCOMPANION_ROADMAP_WEBAPP.md       🟢 Actif — roadmap spécialisée Companion
├── ROADMAP_GUARDIAN_ANGEL_WEB.md        🟢 Actif — roadmap spécialisée Guardian Angel
└── MVP_PHASE_5_NICE_TO_HAVE.md          🔵 Référence — backlog nice-to-have
```

---

## Classification des documents

| Document | Statut | Rôle | Contenu clé |
|----------|:------:|------|-------------|
| **WEB_ROADMAP_UNIFIED.md** | 🟢 Actif | Source de vérité | Sprints S1→S44, planning consolidé |
| **ROADMAP_WEB_CROSS_PLATFORM.md** | 🟢 Actif | Parité cross-platform | 12 sprints W1→W12, alignement mobile 7 phases, Watch Tab critique |
| **ROADMAP_WEB_GLOBAL.md** | 🔵 Référence | Consolidation originale | 2 axes (QS+FX), planning Q1-Q4, supersédé |
| **ROADMAP_WEB_FEATURES_UX.md** | 🟢 Actif | Détail Axe FX | 7 phases, 20 sprints, tâches détaillées avec chemins fichiers |
| **ROADMAP_WEB_QUALITY_SECURITY.md** | 🟢 Actif | Détail Axe QS | 6 phases, 12 sprints, sécurité/tests/perf/a11y |
| **FRONTEND_AUDIT_SUPERAPP.md** | 🔵 Référence | Audit technique | Note B-, 15 catégories, 90+ tâches identifiées |
| **AUDIT_MISSING_SCREENS.md** | 🟢 Actif | Couverture fonctionnelle | 117 routes, 28 absentes, 15 partielles, 19/50 features |
| **IMUCOMPANION_ROADMAP_WEBAPP.md** | 🟢 Actif | Spécialisé ImuCompanion | 6 phases IC-W1→IC-W6, ~21 sem, WebGL Live2D |
| **ROADMAP_GUARDIAN_ANGEL_WEB.md** | 🟢 Actif | Spécialisé Guardian Angel | 6 phases GA-W1→GA-W6, 12 sprints, ~24 sem, sécurité IA |
| **MVP_PHASE_5_NICE_TO_HAVE.md** | 🔵 Référence | Backlog post-MVP | 6 sprints A-F, ~16 sem, features optionnelles |

---

## Table de correspondance des sprints

### Axe QS — Qualité & Sécurité

| Sprint Global | Sprint Local | Phase | Focus |
|:-------------:|:------------:|-------|-------|
| S1 | QS-1 | ✅ Sécurité Critique | DOMPurify, CSP, security headers, rate limiting |
| S2 | QS-2 | ✅ Sécurité Critique | CSRF, cookies httpOnly, Zod validation 100% API, localStorage AES-GCM |
| S3 | QS-3 | Tests fondation | Mock factories, MSW, tests Auth+Chat+Store |
| S4 | QS-4 | Tests composants | Hooks, services, contexts → couverture 65% |
| S5 | QS-5 | Tests E2E | Playwright Auth/Chat/Store/Profile → 70% |
| S6 | QS-6 | Performance | TanStack Query, optimistic updates, React.memo |
| S7 | QS-7 | Performance | Virtualisation listes, code splitting, CWV |
| S8 | QS-8 | Accessibilité | ARIA audit 20+ composants, heading hierarchy, focus |
| S9 | QS-9 | Accessibilité | Contraste 16 combos, reduced-motion, touch targets |
| S10 | QS-10 | Code Quality | ESLint strict, Prettier, consolidation 17→10 contexts |
| S11 | QS-11 | CI/CD | GitHub Actions, Storybook 20+, conventional commits |
| S12 | QS-12 | Monitoring | Sentry catégorisé, performance tracing, error boundaries |

### Axe FX — Features & UX

| Sprint Global | Sprint Local | Phase | Focus |
|:-------------:|:------------:|-------|-------|
| S1 | FX-1 | i18n & Responsive | Audit textes, migration composants i18n |
| S2 | FX-2 | i18n & Responsive | ICU plurals, genre, dates ; RTL préparation |
| S3 | FX-3 | i18n & Responsive | Responsive mobile-first, touch targets, swipe |
| S4 | FX-4 | Modules Manquants | Feed enrichi, communautés amélioration |
| S5 | FX-5 | Modules Manquants | Dating, Sports, Smart Home modules |
| S6 | FX-6 | Modules Manquants | Creator Studio, Office suite |
| S7 | FX-7 | Modules Manquants | Discover, Events, Stories, Blog |
| S8 | FX-8 | Chat & Communication | Voice waveform, threads, pins, sondages |
| S9 | FX-9 | Chat & Communication | Screen share, group calls, beauty filters, PiP |
| S10 | FX-10 | Chat & Communication | Presence, read receipts, sons, reconnexion |
| S11 | FX-11 | Store & Monétisation | Store réel, avis, Stripe, P2P transactions |
| S12 | FX-12 | Store & Monétisation | Dev Portal, submissions, revenue, Premium |
| S13 | FX-13 | Animations & PWA | Transitions page, stagger, skeletons, Lottie |
| S14 | FX-14 | Animations & PWA | Service Worker, offline, push, manifest |
| S15 | FX-15 | Admin & IA | Admin enrichi, modération, analytics dashboard |
| S16 | FX-16 | Admin & IA | Alice chiffrement, Companion proactif, IA modération |
| S17 | FX-17 | Cross-Domain | Gaming Hub web |
| S18 | FX-18 | Cross-Domain | ImuArena (6 catégories) |
| S19 | FX-19 | Cross-Domain | Finance Hub (KYC, P2P, cartes) |
| S20 | FX-20 | Cross-Domain | ImuCompanion Full (Live2D, FSM, TTS) |

### ImuCompanion — Web

| Sprint Global | Sprint Local | Phase | Focus |
|:-------------:|:------------:|-------|-------|
| S31 | IC-W1 | Core Web | Types, Zustand store, CompanionPanel, Cmd+J |
| S33 | IC-W2 | Rendering | Live2D Cubism Web SDK, WebGL canvas |
| S35 | IC-W3 | Behaviour | FSM web, context adapter, proactif |
| S37 | IC-W4 | Speech | Web Speech API, lip sync AudioContext |
| S39 | IC-W5 | Personnalisation | Pages /companion, archetypes, skins |
| S41 | IC-W6 | Avancé | Avatar appel WebRTC, modules, offline |

---

## État actuel de la plateforme web

### Scores audit (FRONTEND_AUDIT_SUPERAPP)

| Catégorie | Note | État |
|-----------|:----:|------|
| Architecture | A | Solide, modulaire |
| Composants | A | 45+ Radix, shadcn/ui |
| Thèmes | A | 8 thèmes × 2 modes |
| Forms | A | zod + RHF |
| Error Handling | A- | Patterns solides |
| State Management | B | 16 contexts (→ consolider à 10) |
| Responsive | B | Nécessite audit mobile |
| i18n | B+ | ~60% couverture |
| Navigation | B | 117 routes |
| Animations | B+ | Basiques, manque transitions |
| a11y | C | Audit WCAG à faire |
| Tests | C | ~20% couverture |
| Performance | B | Manque memoization / virtualisation |
| **Sécurité** | **A+** | DOMPurify, CSP, CSRF, Zod 100%, AES-GCM, rate limiting, security headers 6/6 |
| Code Quality | B+ | ESLint basique |

### Couverture fonctionnelle (50 features core)

| État | Nombre | % |
|------|:------:|:-:|
| ✅ Implémenté | 19 | 38% |
| 🟡 Partiel | 10 | 20% |
| ❌ Absent | 21 | 42% |

### Écrans manquants

| État | Nombre |
|------|:------:|
| Routes existantes | 117 |
| Écrans ABSENTS | 28 |
| Écrans PARTIELS | 15 |

---

## Conventions

- **Sprint global Sx** → numéro unifié dans `WEB_ROADMAP_UNIFIED.md`
- **Sprint local QS-n / FX-n** → numéro dans la sous-roadmap d'axe
- **Phase IC-Wn** → phase ImuCompanion Web
- Les deux axes QS et FX s'exécutent **en parallèle** (2 squads)
- ImuCompanion démarre **après Phase 5 FX** (sprint S31)
- Terme « 🟢 Actif » = document à jour, consulté activement
- Terme « 🔵 Référence » = données utiles, mais planification supersédée par UNIFIED

---

## Références croisées

| Plateforme | Index | Roadmap unifiée |
|------------|-------|-----------------|
| **Mobile** | [`docs/_mobile/MOBILE_INDEX.md`](../_mobile/MOBILE_INDEX.md) | [`MOBILE_ROADMAP_UNIFIED.md`](../_mobile/MOBILE_ROADMAP_UNIFIED.md) |
| **Desktop** | [`docs/_desktop/DESKTOP_INDEX.md`](../_desktop/DESKTOP_INDEX.md) | [`DESKTOP_ROADMAP_UNIFIED.md`](../_desktop/DESKTOP_ROADMAP_UNIFIED.md) |
| **Web** | Ce fichier | [`WEB_ROADMAP_UNIFIED.md`](./WEB_ROADMAP_UNIFIED.md) |

---

> 📌 Mise à jour requise à chaque changement de sprint ou de scope.  
> 📌 Sécurité **A+** atteinte (QS-1 ✅, QS-2 ✅). Prochaine priorité : QS-3 Tests fondation.
