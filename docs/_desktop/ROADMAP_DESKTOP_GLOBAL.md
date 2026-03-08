# 🖥️ ROADMAP GLOBAL — Desktop App ImuChat · Consolidée

**Date de création :** 8 mars 2026  
**Documents source :**  
- `ROADMAP_DESKTOP_FOUNDATIONS.md` — 12 sprints · Architecture, Auth, Chat, Appels, Contacts, Settings, Thèmes, Tests, Build  
- `ROADMAP_DESKTOP_FEATURES_NATIVE.md` — 14 sprints · UI Kit, Store, Wallet, Office, Feed, IA, Companion, Sécurité, Perf  
**Stack :** Electron 30 · Vite 5 · React 18 · TypeScript 5 · electron-builder 24  
**État actuel :** ~5% — Shell uniquement

---

## Architecture des Roadmaps

```
┌────────────────────────────────────────────────────────────┐
│              ROADMAP DESKTOP GLOBAL                        │
│             (ce document — 52 semaines)                    │
├────────────────────────────┬───────────────────────────────┤
│   Phase A : Foundations    │   Phase B : Features/Natif    │
│   12 sprints · 24 sem     │   14 sprints · 28 sem         │
│   5 phases                 │   6 phases                    │
├────────────────────────────┴───────────────────────────────┤
│           Exécution séquentielle (A puis B)                │
│      avec chevauchement possible à partir de A-Sprint 8   │
└────────────────────────────────────────────────────────────┘
```

> **Différence clé avec la web-app** : la desktop roadmap est majoritairement **séquentielle** (car il faut construire les fondations d'abord), avec un chevauchement possible uniquement dans la dernière partie.

---

## Planning consolidé — Vue par trimestre

### 🟥 Q1 — De Shell à App Fonctionnelle (Semaines 1-12)

> **Objectif :** Passer de 5% à 65% — chat temps réel, appels, contacts, thèmes

#### Foundations Phase 1-3

| Sem. | Sprint | Phase | Focus |
|:----:|:------:|-------|-------|
| 0 | Setup | Pré-requis | electron-builder config, `.env`, Tailwind setup, dossiers |
| 1-2 | F-1 | Architecture | Décomposer App.tsx, React Router, Layout desktop, Zustand, Supabase client, icônes Lucide |
| 3-4 | F-2 | Auth | Login/Signup/ForgotPassword, session persistence, OAuth Google, deep links, protected routes |
| 5-6 | F-3 | Chat Core | useConversations + useMessages portés, conversation list, chat room, message input, split-panel layout |
| 7-8 | F-4 | Chat Enrichi | Socket.IO, typing indicator, présence, media upload, réactions, voice recording, reply/forward, context menu |
| 9-10 | F-5 | Contacts & Notifs | Contacts page, ajouter contact, notifications Electron, badge dock, tray icon |
| 11-12 | F-6 | Profil & Settings | Profil Supabase connected, Settings 5 sections, persistence electron-store |

**Objectifs Q1 :**
- ✅ Architecture modulaire (de 1 fichier → 50+ composants)
- ✅ Auth complète (email + Google OAuth)
- ✅ Chat temps réel (messages, médias, réactions, voice)
- ✅ Contacts et notifications natives
- ✅ Profil et Settings fonctionnels

---

### 🟧 Q2 — Appels, Natif & Polish MVP (Semaines 13-24)

> **Objectif :** 65% → 90% MVP — appels, thèmes, i18n, tests, build

#### Foundations Phase 4-5

| Sem. | Sprint | Phase | Focus |
|:----:|:------:|-------|-------|
| 13-14 | F-7 | Thèmes & UI | 8 thèmes × 2 modes, Framer Motion transitions, skeletons, toasts, migration → Tailwind |
| 15-16 | F-8 | Appels | Stream Video SDK, appels 1:1 audio/vidéo, entrants/sortants, historique, device selector |
| 17-18 | F-9 | Natif Electron | Screen share (desktopCapturer), raccourcis globaux, auto-updater, deep links, startup, window state |
| 19-20 | F-10 | Fichiers & OS | Drag & drop, dialog natifs, clipboard paste, menu bar, Touch Bar, command palette (Cmd+K) |
| 21-22 | F-11 | i18n & Search | i18n FR+EN, onboarding wizard, recherche globale, splash screen |
| 23-24 | F-12 | Tests & Build | Vitest setup, tests composants+hooks, E2E, build macOS/Windows/Linux, CI/CD, release notes |

**Objectifs Q2 :**
- ✅ Appels audio/vidéo + screen share
- ✅ 8 thèmes avec animations Framer Motion
- ✅ i18n FR + EN
- ✅ Tests > 50%
- ✅ Builds macOS (.dmg) + Windows (.exe) + Linux (.AppImage)
- ✅ MVP Desktop complet (90%)

#### Démarrage Features/Natif (chevauchement)

> À partir de la semaine 21... si de l'équipe est disponible, les Sprints B-1 et B-2 (UI Kit) peuvent démarrer en parallèle avec F-11/F-12.

| Sem. | Sprint | Phase | Focus |
|:----:|:------:|-------|-------|
| 21-22 | B-1* | UI Kit | @imuchat/ui-kit intégration, design tokens alignés, shared-types |
| 23-24 | B-2* | Hooks partagés | Audit hooks, services API unifiés, Storybook |

\* Sprints optionnels en parallèle si l'équipe le permet.

---

### 🟩 Q3 — Features Complètes (Semaines 25-36)

> **Objectif :** 90% → 80% full app — Store, Wallet, Office, Feed, Communautés

#### Features/Natif Phase 2-4

| Sem. | Sprint | Phase | Focus |
|:----:|:------:|-------|-------|
| 25-26 | B-3 | Store | Module grid, detail, install/uninstall, My Library, bundles |
| 27-28 | B-4 | Wallet & Gamif | Wallet (Stripe), gamification (XP, badges, classement), achievement toasts |
| 29-30 | B-5 | Communautés | Community explorer, channels texte, mini-apps framework |
| 31-32 | B-6 | Office | Documents TipTap, sauvegarde locale, présentations plein écran, tableur |
| 33-34 | B-7 | Files & Tasks | File manager, preview, task board Kanban, rappels natifs |
| 35-36 | B-8 | Feed & Stories | Feed social, stories viewer/creator, music player basique |

**Objectifs Q3 :**
- ✅ Store + Wallet + Gamification
- ✅ Communautés avec channels
- ✅ Suite Office (documents, présentations, tableur)
- ✅ Feed social + Stories
- ✅ ~75% parité features web

---

### 🟦 Q4 — IA, Sécurité & Distribution (Semaines 37-52)

> **Objectif :** App desktop complète, sécurisée, performante, distribuée

#### Features/Natif Phase 5-6

| Sem. | Sprint | Phase | Focus |
|:----:|:------:|-------|-------|
| 37-38 | B-9 | Profil & Events | Profil social enrichi, events calendrier, Discover page |
| 39-40 | B-10 | Alice IA | Alice panel, API Genkit, contextuel, smart compose, résumé, traduction |
| 41-42 | B-11 | Companion | Live2D porté, widget flottant, proactif, smart notifications |
| 43-44 | B-12 | Sécurité | Context isolation audit, CSP, DOMPurify, secure storage, permissions |
| 45-46 | B-13 | Performance | Startup < 2s, memory < 200MB, virtualisation, IPC optimization, background throttle |
| 47-48 | B-14 | Natif Avancé | Quick reply notifs, multi-window, crash reporter, release channels, App Store readiness |
| 49-52 | — | Buffer & QA | Tests de non-régression, bug fixes, polish, documentation, beta testing |

**Objectifs Q4 :**
- ✅ IA (Alice + Companion Live2D)
- ✅ Sécurité Electron durcie
- ✅ Performance (startup < 2s, memory < 200MB)
- ✅ Distribution multi-store (Mac App Store, Microsoft Store)
- ✅ ~85% parité features web

---

## Métriques globales consolidées

| Métrique | État actuel | Fin Q1 | Fin Q2 | Fin Q3 | Fin Q4 |
|----------|:-----------:|:------:|:------:|:------:|:------:|
| **Complétion globale** | ~5% | 40% | 90% MVP | 80% full | 95% full |
| **Lignes de code** | ~1100 | ~10000 | ~22000 | ~35000 | ~45000 |
| **Pages fonctionnelles** | 0/9 MVP | 5/9 | 9/9 | 19/22 | 22/22 |
| **Auth** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Chat temps réel** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Appels audio/vidéo** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Screen share** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Thèmes** | Dark only | 1 (dark) | 8 × 2 | 8 × 2 | 8 × 2 |
| **i18n** | ❌ | ❌ | FR + EN | FR + EN | FR + EN + JA |
| **Tests** | 0% | 0% | > 50% | > 60% | > 70% |
| **Notifications natives** | ❌ | ✅ | ✅ (rich) | ✅ | ✅ (quick reply) |
| **Parité web features** | 0% | ~25% | ~35% | ~65% | ~85% |
| **Code partagé** | 0% | 0% | 30% | 40% | 50% |
| **Startup time** | < 5s | < 3s | < 2.5s | < 2.5s | < 2s |
| **Memory idle** | < 200MB | < 300MB | < 250MB | < 220MB | < 200MB |
| **Distribution** | Dev only | Dev only | macOS+Win+Linux | Idem | + App Stores |

---

## Allocation d'équipe recommandée

### Q1-Q2 (Foundations — 1 équipe)

| Rôle | Développeurs | Focus |
|------|:------------:|-------|
| **Desktop Lead** | 1 dev senior | Architecture, Electron natif, build |
| **Frontend** | 1 dev | Composants React, UI, intégration web patterns |
| **Total Q1-Q2** | **2 devs** | |

### Q3-Q4 (Features — 2 équipes)

| Rôle | Développeurs | Focus |
|------|:------------:|-------|
| **Desktop Lead** | 1 dev senior | Natif, sécurité, perf, distribution |
| **Frontend** | 2 devs | Store, Office, Feed, IA |
| **QA** | 1 dev part-time | Tests, E2E, beta testing |
| **Total Q3-Q4** | **3-4 devs** | |

---

## Risques & Mitigations

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|:------:|:-----------:|------------|
| R1 | Electron trop lourd (>500MB RAM) | 🟠 Élevé | Moyenne | Profiling dès Q2, lazy loading agressif, Tauri en plan B long terme |
| R2 | React 18 vs 19 incompatibilité | 🟡 Moyen | Basse | UI kit doit supporter les deux, ou upgrader desktop vers React 19 en Q2 |
| R3 | Stream Video SDK problems Electron | 🟠 Élevé | Moyenne | Tests précoces (Sprint F-8), WebRTC natif en fallback |
| R4 | Code signing coûteux | 🟡 Moyen | Haute | Budget pour Apple Developer ($99/an) + EV cert Windows (~$400/an) |
| R5 | Auto-updater pour Linux | 🟡 Moyen | Haute | Pas d'auto-update natif Linux → snap store auto-update ou AppImage delta |
| R6 | Mac App Store sandbox limitations | 🟡 Moyen | Moyenne | MAS != DMG build. Certaines features (global shortcuts, file sync) limitées dans MAS sandbox |
| R7 | Portage trop lent, parité jamais atteinte | 🟠 Élevé | Moyenne | Prioritiser les features les plus utilisées, partager le code max |
| R8 | desktopCapturer nécessite permissions spéciales | 🟡 Moyen | Basse | Screen Recording permission macOS, documenter pour l'utilisateur |

---

## Jalons (Milestones)

| Milestone | Semaine | Livrables clés |
|-----------|:-------:|----------------|
| **M1 — Architecture** | S2 | App décomposée, routing, Zustand, Supabase client |
| **M2 — Auth OK** | S4 | Login/Signup, session persistante, OAuth Google |
| **M3 — Chat Live** | S8 | Messages temps réel, médias, réactions, voice |
| **M4 — Notifications** | S10 | Notifications desktop, tray, badge dock |
| **M5 — MVP Visuel** | S14 | 8 thèmes, Framer Motion, Tailwind, polish UI |
| **M6 — Appels** | S18 | Audio/vidéo 1:1, screen share, raccourcis |
| **M7 — MVP Desktop** | S24 | Tests, build multi-OS, CI/CD, i18n — **MVP RELEASE** |
| **M8 — Store & Wallet** | S28 | Store browsing, Wallet Stripe, gamification |
| **M9 — Productivity** | S34 | Office, Files, Tasks, Communautés |
| **M10 — Social** | S38 | Feed, Stories, Events, Discover |
| **M11 — IA** | S42 | Alice + Companion Live2D |
| **M12 — Sécurisé & Performant** | S46 | CSP, secure storage, start < 2s, mem < 200MB |
| **🏁 Desktop App 1.0** | S52 | Production, sécurisée, feature-rich, multi-OS, App Stores |

---

## Comparaison Web ↔ Desktop Timeline

| Milestone | Web App | Desktop App | Delta |
|-----------|:-------:|:-----------:|:-----:|
| Chat fonctionnel | Déjà fait | M3 — S8 | 8 sem |
| Appels | Déjà fait | M6 — S18 | 18 sem |
| MVP Release | M1-M4 — S10 | M7 — S24 | 14 sem |
| Store complet | M9 — S24 | M8 — S28 | 4 sem |
| IA intégrée | M12 — S32 | M11 — S42 | 10 sem |
| App 1.0 | S34 | S52 | 18 sem |

> **Note :** Le delta diminue progressivement grâce au code sharing croissant (50% en Q4). Les features portées bénéficient du travail déjà fait sur la web-app.

---

## Résumé exécutif

| Paramètre | Valeur |
|-----------|--------|
| **Sprints totaux** | 26 (12 Foundations + 14 Features/Natif) |
| **Durée totale** | ~52 semaines (~12 mois) |
| **Équipe recommandée** | 2 devs (Q1-Q2) → 3-4 devs (Q3-Q4) |
| **Effort estimé** | ~3500-4500 heures-dev |
| **MVP Release** | Semaine 24 (mois 6) |
| **App 1.0** | Semaine 52 (mois 12) |
| **Milestones** | 12 |
| **Parité web cible** | ~85% |
| **Résultat** | Desktop App ImuChat 1.0 — Native Electron, multi-OS, feature-rich, sécurisée, performante |
