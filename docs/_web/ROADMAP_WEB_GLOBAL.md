# 🌐 ROADMAP GLOBAL — Web App ImuChat · Consolidée

**Date de création :** 8 mars 2026  
**Documents source :**  

- `ROADMAP_WEB_QUALITY_SECURITY.md` — 12 sprints · Sécurité, Tests, Performance, Accessibilité, CI/CD, Monitoring  
- `ROADMAP_WEB_FEATURES_UX.md` — 16 sprints · i18n, Modules, Chat avancé, Store/Wallet, Animations, PWA, Admin, IA  
**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · Supabase · Socket.IO · Stream Video  
**État actuel :** ~70-80% MVP — 38+ routes · 55+ services · Sécurité D · Tests ~20%

---

## Architecture des Roadmaps

```
┌─────────────────────────────────────────────────────────┐
│                  ROADMAP WEB GLOBAL                     │
│                (ce document — 43 semaines)               │
├───────────────────────┬─────────────────────────────────┤
│   Axe Qualité/Sécu    │     Axe Features/UX             │
│   12 sprints · 24 sem │     16 sprints · 32 sem         │
│   6 phases             │     6 phases                    │
├───────────────────────┴─────────────────────────────────┤
│              Exécution parallèle                        │
│    ~2 développeurs Quality + ~3 développeurs Features   │
└─────────────────────────────────────────────────────────┘
```

---

## Planning consolidé — Vue par trimestre

### 🟥 Q1 — Fondations Critiques (Semaines 1-12)

> **Priorité absolue :** Sécurité, i18n complète, responsive mobile, tests fondations

#### Axe Qualité/Sécurité (parallèle)

| Sem. | Sprint QS | Phase | Focus |
|:----:|:---------:|-------|-------|
| 1-2 | QS-1 | Sécurité Critique | DOMPurify, CSP, security headers, CSRF, `ignoreBuildErrors` fix |
| 3-4 | QS-2 | Sécurité Critique | Cookie security, Zod validation, localStorage encryption, rate limiting, Firebase cleanup |
| 5-6 | QS-3 | Tests Fondations | Mock factories, MSW, tests composants Auth/Chat, jest-axe |
| 7-8 | QS-4 | Tests Approfondis | Tests hooks, services, contextes, seuil → 65% |
| 9-10 | QS-5 | Tests E2E | E2E Auth/Chat/Store/Profile flows, snapshot, seuil → 70% |
| 11-12 | QS-6 | Performance & State | TanStack Query migration, optimistic updates, React.memo audit |

**Objectifs Q1 Qualité :**

- ✅ Sécurité D → B (toutes les failles critiques corrigées)
- ✅ Tests 20% → 70%
- ✅ Mock infrastructure complète

#### Axe Features/UX (parallèle)

| Sem. | Sprint FX | Phase | Focus |
|:----:|:---------:|-------|-------|
| 1-2 | FX-1 | i18n Core | Audit textes, migration Auth/Chat/Store/Layout, ja.json complet, script CI |
| 3-4 | FX-2 | i18n Avancée | Migration 100% restante, pluralisation ICU, pages légales, pages 404/error |
| 5-6 | FX-3 | Responsive | Chat mobile UX native-like, touch targets 44px, PTR, swipe gestures, safe area |
| 7-8 | FX-4 | Feed & Communautés | Commentaires, partage, médias enrichis, communautés channels texte |
| 9-10 | FX-5 | Modules Manquants | Dating (profil/swipe/match), Sports (scores/équipes), Smart Home structure |
| 11-12 | FX-6 | Creator & Office | Creator Studio, présentations TipTap, tableur MVP, collaboration |

**Objectifs Q1 Features :**

- ✅ i18n 100% (FR, EN, JA)
- ✅ Mobile web UX fluide
- ✅ Feed avec commentaires et partage
- ✅ 3 modules stub → fonctionnels

**Convergence Q1 :** Les sprints FX-4/5/6 bénéficient de l'infrastructure de tests (QS-3/4/5) pour TDD sur les nouveaux modules.

---

### 🟧 Q2 — Chat Pro, Store & Animations (Semaines 13-24)

> **Priorité :** Fonctionnalités utilisateur avancées, performance, accessibilité

#### Axe Qualité/Sécurité (parallèle)

| Sem. | Sprint QS | Phase | Focus |
|:----:|:---------:|-------|-------|
| 13-14 | QS-7 | Performance | Virtualisation listes, code splitting, Web Vitals, Socket lazy load |
| 15-16 | QS-8 | Accessibilité | ARIA audit 20+ composants, heading hierarchy, focus management, keyboard nav |
| 17-18 | QS-9 | Accessibilité | Contrast audit (8 thèmes × 2 modes), reduced-motion, touch targets, VoiceOver, axe CI |
| 19-20 | QS-10 | Code Quality | ESLint strict, Prettier, consolider 17→~10 contextes, Supabase types generés |
| 21-22 | QS-11 | CI/CD | GitHub Actions pipeline, Storybook 20+ composants, conventional commits |
| 23-24 | QS-12 | Monitoring | Sentry enrichi, Performance tracing, error boundaries, Suspense, offline detection |

**Objectifs Q2 Qualité :**

- ✅ LCP < 2s, CLS < 0.05
- ✅ Accessibilité WCAG AA (Lighthouse 95+)
- ✅ CI/CD automatisé (lint → types → tests → e2e → a11y → security)
- ✅ `Database = any` → types Supabase générés

#### Axe Features/UX (parallèle)

| Sem. | Sprint FX | Phase | Focus |
|:----:|:---------:|-------|-------|
| 13-14 | FX-7 | Discover & Events | Page Discover enrichie, Events RSVP/rappels, Stories creator enrichi, Blog |
| 15-16 | FX-8 | Chat Avancé | Messages vocaux waveform, threads, pinned messages, recherche in-chat, polls |
| 17-18 | FX-9 | Appels Avancés | Screen sharing, appels groupe (8p), filtres beauté/fonds virtuels, PiP |
| 19-20 | FX-10 | Real-time | Présence enrichie, read receipts, sons configurables, reconnexion robuste |
| 21-22 | FX-11 | Store & Wallet | Store état réel, avis/notes, Stripe top-up, transfert P2P |
| 23-24 | FX-12 | Monétisation | Developer Portal enrichi, module submission, revenue dashboard, Premium |

**Objectifs Q2 Features :**

- ✅ Chat feature-complete (threads, pins, voice messages, polls)
- ✅ Appels enrichis (groupe, screen share, PiP)
- ✅ Store/Wallet fonctionnels end-to-end
- ✅ Monétisation (Developer Portal + Premium)

**Convergence Q2 :**

- FX-8 (Chat avancé) bénéficie de QS-6 (TanStack Query + optimistic updates)
- FX-11 (Store/Wallet) requiert QS-1/2 (sécurité paiements)
- FX-9 (Appels) bénéficie de QS-7 (performance + lazy loading)

---

### 🟩 Q3 — Polish, PWA, Admin & IA (Semaines 25-34)

> **Priorité :** Expérience finale, admin tools, IA

#### Axe Qualité/Sécurité
>
> Phase terminée en Q2. L'équipe qualité rejoint l'équipe features pour les sprints restants.

#### Axe Features/UX (équipe complète ~5 développeurs)

| Sem. | Sprint FX | Phase | Focus |
|:----:|:---------:|-------|-------|
| 25-26 | FX-13 | Animations | Transitions de page, stagger listes, chat animations, micro-interactions, skeletons, Lottie |
| 27-28 | FX-14 | PWA & Offline | Service Worker, install prompt, offline mode, push notifications, manifest enrichi |
| 29-30 | FX-15 | Admin Enrichi | Admin users avancé, modération queue, analytics dashboard, store review, config, logs |
| 31-32 | FX-16 | IA & Companion | Alice chiffrement, flows enrichis, Companion proactif, Live2D enrichi, IA modération |

**Convergence Q3 :** Les animations (FX-13) respectent les acquis a11y du Q2 (QS-9 reduced-motion). La PWA (FX-14) bénéficie de la performance (QS-7) et du monitoring (QS-12).

---

## Métriques globales consolidées

| Métrique | État actuel | Fin Q1 | Fin Q2 | Fin Q3 |
|----------|:-----------:|:------:|:------:|:------:|
| **Sécurité UI** | D | B | A | A+ |
| **Tests coverage** | ~20% | 70% | 80% | 85% |
| **Lighthouse Performance** | Non mesuré | 80+ | 90+ | 95+ |
| **Lighthouse Accessibility** | Non mesuré | 85+ | 95+ | 98+ |
| **Couverture i18n** | ~60% | 100% | 100% | 100% |
| **Routes fonctionnelles** | 38+ | 45+ | 55+ | 58+ |
| **Modules implémentés** | ~30 | 36+ | 42+ | 48+ |
| **LCP** | Non mesuré | < 3s | < 2s | < 1.5s |
| **CLS** | Non mesuré | < 0.1 | < 0.05 | < 0.03 |
| **Bundle first load** | Non mesuré | < 250KB | < 200KB | < 180KB |
| **Chat features** | Basique | +7 | Complet | +IA mod |
| **PWA score** | Partiel | Partiel | Installable | Complet + offline |
| **CI pipeline** | Aucun | Basic | Complet | Complet + perf |

---

## Allocation d'équipe recommandée

### Q1-Q2 (2 équipes parallèles)

| Équipe | Développeurs | Focus |
|--------|:------------:|-------|
| **Qualité/Sécurité** | 2 devs | Sprints QS-1 → QS-12 |
| **Features/UX** | 3 devs | Sprints FX-1 → FX-12 |
| **Total** | 5 devs | |

### Q3 (équipe fusionnée)

| Équipe | Développeurs | Focus |
|--------|:------------:|-------|
| **Full Stack** | 5 devs | Sprints FX-13 → FX-16 |

### Rôles spécifiques recommandés

| Rôle | Sprints principaux |
|------|-------------------|
| **Security Lead** | QS-1, QS-2, FX-11 (Stripe) |
| **Test Lead** | QS-3, QS-4, QS-5 |
| **Performance Lead** | QS-6, QS-7, FX-14 (PWA) |
| **a11y Lead** | QS-8, QS-9, FX-13 (animations) |
| **Chat Lead** | FX-8, FX-9, FX-10 |
| **Store/Monetization Lead** | FX-11, FX-12 |
| **AI/Companion Lead** | FX-16 |

---

## Risques & Mitigations

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|:------:|:-----------:|------------|
| R1 | Sécurité XSS exploitée avant fix | 🔴 Critique | Moyenne | **Sprint QS-1 en priorité absolue semaine 1** |
| R2 | Modules Dating/Sports trop complexes | 🟠 Élevé | Moyenne | MVP minimal viable, itérations futures |
| R3 | `ignoreBuildErrors: true` masque des bugs | 🔴 Critique | Haute | Corriger en QS-1 puis supprimer le flag |
| R4 | 17 Context React = perf issues | 🟠 Élevé | Haute | Consolidation QS-10 + migration Zustand progressive |
| R5 | Stream SDK limitations appels groupe | 🟡 Moyen | Basse | Plan B WebRTC natif SFU si Stream ne scale pas |
| R6 | Stripe Connect compliance | 🟡 Moyen | Moyenne | Consulter legal dès FX-12, KYC/KYB prérequis |
| R7 | PWA limitations iOS | 🟡 Moyen | Haute | Accepter limites iOS (pas de push iOS < 16.4), documenter |
| R8 | Live2D performance mobile | 🟡 Moyen | Moyenne | Lazy load Companion, désactiver sur low-end devices |

---

## Jalons (Milestones)

| Milestone | Semaine | Livrables clés |
|-----------|:-------:|----------------|
| **M1 — Sécurité fixée** | S4 | XSS éliminé, CSP actif, CSRF en place, security headers 6/6 |
| **M2 — i18n 100%** | S4 | 3 locales complètes, script CI i18n |
| **M3 — Mobile-ready** | S6 | Chat mobile native-like, touch friendly |
| **M4 — Tests > 70%** | S10 | Mock infra, E2E, snapshot, CI passing |
| **M5 — Modules complets** | S12 | Dating, Sports, Smart Home, Creator Studio, Office enrichi |
| **M6 — Performance A** | S14 | LCP < 2s, CLS < 0.05, Lighthouse 90+ |
| **M7 — WCAG AA** | S18 | Lighthouse a11y 95+, VoiceOver tested |
| **M8 — Chat Pro** | S20 | Threads, pins, voice, screen share, PiP, group calls |
| **M9 — Monetization** | S24 | Stripe, Developer Portal, Premium, Revenue dashboard |
| **M10 — CI/CD Complete** | S22 | Pipeline automatisé complet |
| **M11 — PWA Offline** | S28 | Install prompt, push, offline mode |
| **M12 — IA Enrichie** | S32 | Alice chiffré, Companion proactif, IA modération |
| **🏁 Web App 1.0** | S34 | Production-ready, feature-complete, secure, accessible, monitored |

---

## Résumé exécutif

| Paramètre | Valeur |
|-----------|--------|
| **Sprints totaux** | 28 (12 QS + 16 FX) |
| **Durée totale** | ~34 semaines (~8.5 mois) |
| **Équipe recommandée** | 5 développeurs (Q1-Q3) |
| **Effort estimé** | ~2500-3000 heures-dev |
| **Axes parallèles** | 2 (Qualité/Sécurité ∥ Features/UX) |
| **Milestones** | 12 |
| **Résultat** | Web App ImuChat 1.0 — Production, sécurisée, accessible, multilingue, feature-complete |
