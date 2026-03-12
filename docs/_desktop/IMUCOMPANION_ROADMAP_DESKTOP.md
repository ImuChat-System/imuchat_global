# 🖥️ ImuCompanion Engine — Roadmap Desktop (Electron)

> **Date de création** : 1 mars 2026  
> **Référence** : `docs/VISION_muCompanion.md` · `docs/3D_AND_Live2D.md`  
> **Stack** : Electron 30 · Vite · React 18 · WebGL / Live2D · IPC  
> **Périmètre** : Intégration du moteur d'Assistant IA incarné dans l'app desktop  
> **État actuel** : Desktop ~85% companion (S23 Live2D/FSM/AI, S30 TTS/Personality/Models/Segmentation/Marketplace)

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [État actuel & prérequis desktop](#2-état-actuel--prérequis-desktop)
3. [Phase IC-D1 — Companion Core Desktop (3 semaines)](#3-phase-ic-d1--companion-core-desktop-3-semaines)
4. [Phase IC-D2 — Rendering Live2D Desktop (4 semaines)](#4-phase-ic-d2--rendering-live2d-desktop-4-semaines)
5. [Phase IC-D3 — Behaviour Engine & OS Integration (3 semaines)](#5-phase-ic-d3--behaviour-engine--os-integration-3-semaines)
6. [Phase IC-D4 — TTS Avancé & Lip Sync (3 semaines)](#6-phase-ic-d4--tts-avancé--lip-sync-3-semaines)
7. [Phase IC-D5 — Personnalisation & Desktop UX (3 semaines)](#7-phase-ic-d5--personnalisation--desktop-ux-3-semaines)
8. [Phase IC-D6 — Features Desktop-Only (4 semaines)](#8-phase-ic-d6--features-desktop-only-4-semaines)
9. [Architecture technique Desktop](#9-architecture-technique-desktop)
10. [Avantages Desktop vs Web/Mobile](#10-avantages-desktop-vs-webmobile)
11. [Prérequis & dépendances](#11-prérequis--dépendances)
12. [Timeline consolidée](#12-timeline-consolidée)

---

## 1. Résumé exécutif

L'app desktop Electron offre des possibilités **uniques** pour ImuCompanion :
- **Fenêtre Always-on-Top** : avatar companion visible en permanence par-dessus tout
- **Notifications OS natives** : companion notifie directement
- **Accès système** : GPU complet, stockage local, pas de limite batterie
- **Tray icon** : companion accessible depuis la barre système
- **Multi-window** : panneau companion dans une fenêtre séparée

> ✅ **Mise à jour 11 mars 2026** : Tous les prérequis ont été implémentés (S0-S30 COMPLET). Les phases IC-D1 à IC-D4 sont largement couvertes par les sprints S23 (Live2D, FSM, AI Connector) et S30 (TTS, Personality, Models, Segmentation, CompanionStore, companion-native). Les phases IC-D5 et IC-D6 restent à compléter.

**Durée totale estimée** : ~20 semaines (6 phases)

---

## 2. État actuel & prérequis desktop

### Ce qui existe

| Composant | Statut | Note |
|-----------|:------:|------|
| Shell Electron + Vite | ✅ | Fenêtre principale, menu, IPC complet |
| React 18 + Zustand 5 | ✅ | 26 pages, 25+ services, 7+ modules |
| TypeScript | ✅ | 1216 tests, 38 fichiers |
| electron-builder | ✅ | Config packaging, auto-updater |
| Supabase client + auth | ✅ | S2 — Auth complète |
| Socket.IO client | ✅ | S3 — Temps réel |
| Routing (React Router 7) | ✅ | S1 — Toutes routes |
| Zustand stores | ✅ | Auth, Chat, + 20 stores |
| Stream Video SDK | ✅ | S8-S9 — Appels complets |
| Système de modules | ✅ | S15 — Store + miniapps |
| **Companion Live2D** | ✅ | S23 — FSM, AI Connector, Live2D |
| **Companion Full** | ✅ | S30 — TTS, Personality, Models, Segmentation |

### Prérequis — ✅ Tous satisfaits (11 mars 2026)

Tous les prérequis ont été implémentés dans les sprints S0-S30. Les phases IC-D5 et IC-D6 peuvent démarrer immédiatement.

---

## 3. Phase IC-D1 — Companion Core Desktop (3 semaines)

> **Objectif** : Store, hook, service IA, fenêtre companion.

### 3.1 Types & Store

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Importer types companion depuis `@imuchat/shared-types` | 🔴 P0 | 0.5j |
| Créer `src/stores/companion-store.ts` (Zustand + electron-store persist) | 🔴 P0 | 1j |
| Persist préférences via electron-store (pas localStorage) | 🔴 P0 | 0.5j |

### 3.2 Service IA

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `src/services/companion-ai.ts` — client REST Alice | 🔴 P0 | 1.5j |
| Post-processing CompanionResponse (même logique shared) | 🔴 P0 | 1j |
| Hook `useCompanion()` | 🔴 P0 | 1.5j |

### 3.3 UI Companion — Multi-window

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| `CompanionPanel.tsx` — panneau intégré (sidebar de la fenêtre principale) | 🔴 P0 | 2j |
| Mode fenêtre séparée (BrowserWindow always-on-top, transparente) | 🔴 P0 | 2j |
| Mode tray (companion minimisé dans system tray avec menu contextuel) | 🟡 P1 | 1j |
| IPC bridge `main ↔ renderer` pour contrôle companion | 🔴 P0 | 1j |
| Placeholder avatar (avant Live2D) | 🔴 P0 | 0.5j |

### 3.4 Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests store + hook companion (15+ tests) | 🟡 P1 | 1j |
| Tests IPC commands | 🟡 P1 | 0.5j |

**Total Phase IC-D1 : ~14 jours-dev (~3 semaines)**

---

## 4. Phase IC-D2 — Rendering Live2D Desktop (4 semaines)

> **Objectif** : Rendu Live2D WebGL dans Electron avec accès GPU natif.

### 4.1 Live2D Cubism SDK

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Installer Live2D Cubism SDK for Web (fonctionne dans Electron renderer) | 🔴 P0 | 0.5j |
| `Live2DCanvas.tsx` — composant canvas WebGL optimisé desktop | 🔴 P0 | 2j |
| Hardware acceleration — s'assurer que `--enable-gpu-rasterization` est actif | 🔴 P0 | 0.5j |
| ModelLoader — chargement depuis fichiers locaux (pas CDN) | 🔴 P0 | 1.5j |

### 4.2 Fenêtre transparente Always-on-Top

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| BrowserWindow transparente avec canvas Live2D uniquement | 🔴 P0 | 2j |
| Click-through transparent areas (alwaysOnTop + ignoreMouseEvents) | 🔴 P0 | 1j |
| Drag & drop repositionnement de la fenêtre companion | 🟡 P1 | 1j |
| Resize poignée pour ajuster la taille du companion | 🟡 P1 | 0.5j |

### 4.3 Animations

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Idle animations (breathing, blink) | 🔴 P0 | 1.5j |
| Trigger animations (wave, explain, celebrate, thinking) | 🔴 P0 | 2j |
| Expression Controller (paramètres Live2D) | 🔴 P0 | 1.5j |
| 60 fps target (GPU desktop = généreux) | 🔴 P0 | 0.5j |

### 4.4 Multi-écran

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Détecter écrans avec `screen.getAllDisplays()` | 🟡 P1 | 0.5j |
| Positionner companion sur l'écran préféré | 🟡 P1 | 0.5j |
| Mémoriser position par écran | 🟡 P1 | 0.5j |

**Total Phase IC-D2 : ~16 jours-dev (~4 semaines)**

---

## 5. Phase IC-D3 — Behaviour Engine & OS Integration (3 semaines)

> **Objectif** : FSM + intégration profonde avec l'OS.

### 5.1 FSM Desktop

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Implémenter FSM (logique partagée cross-platform) | 🔴 P0 | 1j |
| Transitions basées sur : focus app, idle OS, événements IPC | 🔴 P0 | 1j |

### 5.2 OS Context Adapter

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Détecter idle OS (`powerMonitor.getSystemIdleTime()`) → companion s'endort | 🔴 P0 | 1j |
| Détecter lock/unlock screen → companion salue/dort | 🟡 P1 | 0.5j |
| Mode Ne Pas Déranger (DND) — companion silencieux | 🟡 P1 | 0.5j |
| Adapter comportement si app en foreground vs background | 🔴 P0 | 0.5j |

### 5.3 Notifications OS natives

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Companion envoie des `Notification` natives Electron | 🔴 P0 | 1j |
| Actions dans notification (répondre, ignorer, ouvrir) | 🟡 P1 | 0.5j |
| Companion proactif — rappels, tips, activité amis | 🟡 P1 | 1j |

### 5.4 Raccourcis globaux

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| `globalShortcut.register('CmdOrCtrl+Shift+C')` → toggle companion | 🔴 P0 | 0.5j |
| Raccourci pour dicter message au companion | 🟡 P1 | 0.5j |

### 5.5 Segmentation & Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Connecter companion au profil utilisateur (âge → archétype) | 🟡 P1 | 1j |
| Tests FSM + OS integration (mock powerMonitor) | 🟡 P1 | 1j |

**Total Phase IC-D3 : ~11 jours-dev (~3 semaines)**

---

## 6. Phase IC-D4 — TTS Avancé & Lip Sync (3 semaines)

> **Objectif** : Voix companion + lip sync desktop.

### 6.1 TTS

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Web Speech API dans renderer (identique web) | 🔴 P0 | 1j |
| Alternative : node-tts ou API cloud via main process | 🟡 P1 | 1.5j |
| Personnalisation voix (pitch, rate, volume, voix par archétype) | 🟡 P1 | 0.5j |
| File d'attente TTS (pas de chevauchement audio) | 🔴 P0 | 0.5j |

### 6.2 STT

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Option 1 : Web Speech API SpeechRecognition (Chromium) | 🔴 P0 | 1j |
| Option 2 : Whisper.cpp local via addon natif (offline, premium) | 🟢 P2 | 3j |
| Push-to-talk mode (raccourci clavier maintenu) | 🟡 P1 | 0.5j |

### 6.3 Lip Sync

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| AudioContext AnalyserNode → amplitude → ParamMouthOpen | 🔴 P0 | 1.5j |
| Lissage et calibration | 🟡 P1 | 0.5j |
| Intégration dans le rendering loop | 🔴 P0 | 0.5j |

### 6.4 Audio Output Control

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Sélection périphérique audio de sortie | 🟡 P1 | 0.5j |
| Volume indépendant du companion | 🟡 P1 | 0.5j |

**Total Phase IC-D4 : ~12 jours-dev (~3 semaines)**

---

## 7. Phase IC-D5 — Personnalisation & Desktop UX (3 semaines)

> **Objectif** : Interface de personnalisation + UX desktop native.

### 7.1 Pages companion

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Route `/companion` — hub avec preview Live2D et chat | 🔴 P0 | 2j |
| Route `/companion/archetypes` — galerie | 🔴 P0 | 1.5j |
| Route `/companion/customize` — éditeur apparence | 🔴 P0 | 3j |
| Route `/companion/settings` — préférences desktop-spécifiques | 🟡 P1 | 1.5j |

### 7.2 Desktop-specific UX

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Companion dans tray → menu contextuel avec actions rapides | 🟡 P1 | 1j |
| Companion au démarrage de l'app (option auto-greet) | 🟡 P1 | 0.5j |
| Mini-window companion (PiP style, always visible) | 🔴 P0 | 1.5j |
| Companion mode "Desktop Pet" (flottant, draggable, transparent bg) | 🟡 P1 | 2j |

### 7.3 Skins & Store

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Section skins dans le store intégré | 🟡 P1 | 1j |
| Achat & application de skins | 🟡 P1 | 0.5j |

**Total Phase IC-D5 : ~15 jours-dev (~3 semaines)**

---

## 8. Phase IC-D6 — Features Desktop-Only (4 semaines)

> **Objectif** : Fonctionnalités exclusives desktop.

### 8.1 Mode "Desktop Pet"

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Avatar Live2D flottant sur le bureau (transparent window, no frame) | 🔴 P0 | 2j |
| Réactions à l'activité utilisateur (curseur, focus app) | 🟡 P1 | 2j |
| Animations environnementales (heure, météo via API) | 🟢 P2 | 1.5j |
| Micro-interactions : double-click → companion parle, drag → réaction | 🟡 P1 | 1j |

### 8.2 Appel avatar (Stream Video dans Electron)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Toggle caméra ↔ avatar dans appel vidéo | 🟡 P1 | 2j |
| Lip sync micro live → avatar | 🟡 P1 | 1.5j |
| Canvas capture → custom video track pour partage | 🟡 P1 | 2j |

### 8.3 Productivité Desktop

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Companion résume les messages non lus au retour | 🟡 P1 | 1.5j |
| Timer Pomodoro avec companion (encourage, rappelle) | 🟢 P2 | 1j |
| Companion dicte / lit messages à voix haute sélectionnés | 🟡 P1 | 1j |

### 8.4 Offline local LLM (expérimental)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Intégration LM Studio / Ollama local via API HTTP | 🟢 P2 | 1.5j |
| Mode offline complet avec LLM local + Live2D local + TTS local | 🟢 P2 | 2j |

### 8.5 Tests & Performance

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests Playwright-Electron (companion lifecycle) | 🟡 P1 | 1.5j |
| Profiler GPU et mémoire (transparent window overhead) | 🔴 P0 | 1j |

**Total Phase IC-D6 : ~22 jours-dev (~4 semaines)**

---

## 9. Architecture technique Desktop

### 9.1 Arborescence fichiers

```
desktop-app/
├── electron/
│   ├── main.ts                               # Main process
│   ├── companion-window.ts                    # BrowserWindow companion (PiP/overlay)
│   ├── companion-tray.ts                      # Tray icon companion
│   └── ipc/
│       └── companion-ipc.ts                   # IPC handlers companion
├── src/
│   ├── types/companion.ts                     # Via @imuchat/shared-types
│   ├── stores/companion-store.ts              # Zustand + electron-store
│   ├── hooks/useCompanion.ts
│   ├── services/
│   │   ├── companion-ai.ts                    # Client REST Alice
│   │   ├── companion-fsm.ts                   # FSM partagée
│   │   ├── companion-context.ts               # OS context (idle, focus, DND)
│   │   ├── companion-tts.ts                   # Web Speech + fallback
│   │   ├── companion-stt.ts                   # SpeechRecognition + Whisper
│   │   └── companion-lipsync.ts               # AudioContext → Live2D
│   ├── components/companion/
│   │   ├── CompanionPanel.tsx                 # Sidebar intégrée
│   │   ├── CompanionPetWindow.tsx             # Contenu fenêtre flottante
│   │   ├── Live2DCanvas.tsx                   # Canvas WebGL Live2D
│   │   ├── CompanionChat.tsx                  # Zone conversation
│   │   ├── ArchetypeGallery.tsx
│   │   ├── CompanionCustomizer.tsx
│   │   └── CompanionCallOverlay.tsx
│   └── pages/companion/
│       ├── index.tsx                          # Hub
│       ├── archetypes.tsx
│       ├── customize.tsx
│       └── settings.tsx
└── public/models/                             # Assets Live2D locaux
```

### 9.2 IPC Architecture

```
┌─────────────────────────┐     IPC      ┌─────────────────────────┐
│     MAIN PROCESS        │◄────────────►│    RENDERER PROCESS     │
│                         │              │                         │
│  companion-window.ts    │              │  useCompanion()         │
│  companion-tray.ts      │              │  companion-store.ts     │
│  companion-ipc.ts       │              │  Live2DCanvas.tsx       │
│  powerMonitor           │              │  CompanionPanel.tsx     │
│  globalShortcut         │              │                         │
│  Notification           │              │                         │
└─────────────────────────┘              └─────────────────────────┘
         │                                         │
         │                                         │
         ▼                                         ▼
  ┌──────────────┐                         ┌──────────────┐
  │  OS Native   │                         │  WebGL GPU   │
  │  Tray, DND   │                         │  Live2D SDK  │
  │  Shortcuts   │                         │  Audio API   │
  └──────────────┘                         └──────────────┘
```

### 9.3 IPC Canaux

| Canal IPC | Direction | Description |
|-----------|:---------:|-------------|
| `companion:toggle` | main → renderer | Toggle panneau companion |
| `companion:show-pet` | renderer → main | Ouvrir fenêtre pet desktop |
| `companion:hide-pet` | renderer → main | Fermer fenêtre pet |
| `companion:set-position` | renderer → main | Repositionner fenêtre |
| `companion:os-idle` | main → renderer | Notification idle OS |
| `companion:os-lock` | main → renderer | Lock/unlock screen |
| `companion:notification` | renderer → main | Envoyer notification OS |
| `companion:shortcut` | main → renderer | Raccourci global déclenché |

---

## 10. Avantages Desktop vs Web/Mobile

| Feature | Desktop | Web | Mobile |
|---------|:-------:|:---:|:------:|
| **Fenêtre flottante** | ✅ Always-on-top natif | ❌ | ❌ |
| **Desktop Pet** | ✅ Transparent window | ❌ | ❌ |
| **Tray icon** | ✅ Natif | ❌ | ❌ |
| **Raccourcis globaux** | ✅ Même hors focus | ❌ | ❌ |
| **Notifications OS** | ✅ Natives riches | ⚠️ Web Push limité | ✅ Push natif |
| **GPU** | ✅ Illimité | ✅ Bon | ⚠️ Limité batterie |
| **LLM local** | ✅ Ollama/LM Studio | ❌ | ❌ |
| **Multi-écran** | ✅ APIs Electron screen | ❌ | ❌ |
| **Idle detection** | ✅ powerMonitor | ⚠️ Idle Detection API | ❌ |
| **Push-to-talk** | ✅ globalShortcut | ❌ | ⚠️ |

---

## 11. Prérequis & dépendances

### Dépendances sur d'autres roadmaps

| Dépendance | Source | Impact |
|------------|--------|--------|
| Types companion partagés | `@imuchat/shared-types` | IC-D1 bloqué si pas de types |
| FSM partagée | IC-M1 / IC-W1 (mobile ou web first) | Logic réutilisable  |
| platform-core Alice routes | Backend existant ✅ | Prêt à utiliser |
| Stream Video SDK | Desktop tracker prérequis | IC-D6 appel avatar |
| Live2D Cubism SDK | Licence commerciale | Toutes phases rendering |

### Composants partagés cross-platform (via shared-types / logic)

| Composant partageable | Partage possible |
|----------------------|:----------------:|
| Types (CompanionState, ArchetypeConfig, etc.) | ✅ npm package |
| FSM (states, transitions) | ✅ Pure logic |
| AI post-processing (emotion mapping, tool routing) | ✅ Pure logic |
| Lip sync algo (amplitude → param) | ✅ Pure logic |
| Archetype configs (prompt templates, defaults) | ✅ JSON / config |
| Live2D rendering | ❌ Platform-specific |
| OS integration (tray, notifications, shortcuts) | ❌ Electron only |
| UI components | ❌ Platform-specific |

---

## 12. Timeline consolidée

```
Phase         Semaine  1   2   3   4   5   6   7   8   9  10  11  12  ...  20
              ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤────────┤
IC-D1 Core    │▓▓▓▓▓▓▓▓▓▓▓│                                              │
              │ Store, IPC │                                              │
              │ Panel + Pet│                                              │
              │ Service IA │                                              │
IC-D2 Live2D  │            │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                              │
              │            │ WebGL Canvas   │                              │
              │            │ Transparent Win│                              │
              │            │ Animations     │                              │
IC-D3 FSM+OS  │            │▓▓▓▓▓▓▓▓▓▓▓│    │ (parallèle IC-D2)           │
              │            │ FSM, idle  │    │                              │
              │            │ Notifs, DND│    │                              │
IC-D4 Speech  │            │                │▓▓▓▓▓▓▓▓▓▓▓│                  │
              │            │                │ TTS, STT   │                  │
              │            │                │ Lip Sync   │                  │
IC-D5 Perso   │            │                │            │▓▓▓▓▓▓▓▓▓▓▓│     │
              │            │                │            │ Archétypes │     │
              │            │                │            │ Desktop UX │     │
IC-D6 Avancé  │            │                │            │            │▓▓▓▓▓▓▓▓▓▓▓▓▓│──→
              │            │                │            │            │ Desktop Pet  │
              │            │                │            │            │ Appel avatar │
              │            │                │            │            │ LLM local    │
              ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤──→
```

### Récapitulatif

| Phase | Durée | Effort (j) | Priorité | Dépendances |
|-------|:-----:|:----------:|:--------:|-------------|
| **IC-D1** Companion Core | 3 sem. | ~14j | 🔴 P0 | Desktop prérequis (Supabase, etc.) |
| **IC-D2** Rendering Live2D | 4 sem. | ~16j | 🔴 P0 | IC-D1 + Live2D SDK |
| **IC-D3** FSM & OS Integration | 3 sem. | ~11j | 🔴 P0 | IC-D1 (parallélisable avec IC-D2) |
| **IC-D4** TTS & Lip Sync | 3 sem. | ~12j | 🟡 P1 | IC-D2 + IC-D3 |
| **IC-D5** Personnalisation | 3 sem. | ~15j | 🟡 P1 | IC-D2 |
| **IC-D6** Desktop-Only Features | 4 sem. | ~22j | 🟢 P2 | IC-D4 + IC-D5 |
| **TOTAL** | **~20 sem.** | **~90j** | | |

> Avec parallélisation IC-D2 / IC-D3, durée effective réduite à **~17 semaines**.  
> ⚠️ Ajouter ~8 semaines de prérequis desktop si non encore réalisés.

---

### Ordre de développement recommandé cross-platform

| Ordre | Plateforme | Justification |
|:-----:|:----------:|---------------|
| 1️⃣ | **Mobile** | Stack la plus mature (~66K LOC). Alice IA déjà implémentée. |
| 2️⃣ | **Web** | Deuxième plateforme (~70% Phase 1). Live2D Web SDK natif. |
| 3️⃣ | **Desktop** | App à 100% (S0-S30). Companion ~85% implémenté. |

**Stratégie** : Développer mobile first → extraire les composants partagés (types, FSM, AI post-processing) → appliquer sur web → appliquer sur desktop.

---

_Document créé le 1 mars 2026 — Roadmap ImuCompanion Desktop (Electron)_
