# 🌐 ImuCompanion Engine — Roadmap Web-App (Next.js)

> **Date de création** : 1 mars 2026  
> **Référence** : `docs/VISION_muCompanion.md` · `docs/3D_AND_Live2D.md`  
> **Stack** : Next.js 14+ · React 18+ · WebGL / Three.js · Zustand · Socket.IO  
> **Périmètre** : Intégration du moteur d'Assistant IA incarné dans la web-app  
> **Prérequis** : Architecture modules Phase A-D ✅ · Socket.IO ✅ · Store & Modules ✅

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [État actuel & fondations web](#2-état-actuel--fondations-web)
3. [Phase IC-W1 — Companion Core Web (3 semaines)](#3-phase-ic-w1--companion-core-web-3-semaines)
4. [Phase IC-W2 — Rendering WebGL / Live2D (5 semaines)](#4-phase-ic-w2--rendering-webgl--live2d-5-semaines)
5. [Phase IC-W3 — Behaviour Engine & Contexte Web (3 semaines)](#5-phase-ic-w3--behaviour-engine--contexte-web-3-semaines)
6. [Phase IC-W4 — Web Speech & Lip Sync (3 semaines)](#6-phase-ic-w4--web-speech--lip-sync-3-semaines)
7. [Phase IC-W5 — Personnalisation & Archétypes Web (3 semaines)](#7-phase-ic-w5--personnalisation--archétypes-web-3-semaines)
8. [Phase IC-W6 — Intégration Modules & Avancé (4 semaines)](#8-phase-ic-w6--intégration-modules--avancé-4-semaines)
9. [Architecture technique Web](#9-architecture-technique-web)
10. [Spécificités Web vs Mobile](#10-spécificités-web-vs-mobile)
11. [Performance Web](#11-performance-web)
12. [Timeline consolidée](#12-timeline-consolidée)

---

## 1. Résumé exécutif

La web-app ImuChat dispose déjà d'une architecture modulaire mature (Phases A-D) avec 27 modules, un Store fonctionnel et Socket.IO. L'intégration d'ImuCompanion sur web s'appuie sur **WebGL + Live2D Web SDK** (pas de bridge natif nécessaire), ce qui simplifie le rendering par rapport au mobile.

**Avantages web** :

- Live2D Web SDK officiel (canvas WebGL direct)
- Web Speech API native (TTS + STT sans dépendance)
- Plus de puissance GPU disponible (desktop browsers)
- Layout 3 colonnes permettant un panneau companion dédié

**Durée totale estimée** : ~21 semaines (6 phases)

---

## 2. État actuel & fondations web

### Composants réutilisables existants

| Composant | Statut | Localisation | Réutilisation |
|-----------|:------:|-------------|:-------------:|
| **Architecture modules** | ✅ | Phases A-D (27 modules) | ImuCompanion = module core natif |
| **Socket.IO temps réel** | ✅ ~95% | WebSocket infrastructure | Événements companion real-time |
| **Zustand stores** | ✅ | Multiples stores | Pattern pour companion-store |
| **ModulesContext** | ✅ | Registre unifié | Enregistrement companion |
| **Store & ImuCoin** | ✅ MVP | Store monétisation planifié | Skins premium companion |
| **WebRTC (Stream Video)** | ✅ | Appels audio/vidéo | Avatar en appel vidéo |
| **Rich Text** | ✅ | Markdown + toolbar | Companion messages formatés |
| **Command Palette (Cmd+K)** | ✅ | Raccourcis clavier | Assistant companion invocable |

### Ce qui manque

- ❌ Rendu WebGL Live2D (canvas + SDK)
- ❌ Assistant IA type Alice (côté web — existe sur mobile)
- ❌ Companion store + hook + overlay
- ❌ TTS/STT intégration (Web Speech API)
- ❌ FSM comportementale
- ❌ Panneau companion dans le layout 3 colonnes

---

## 3. Phase IC-W1 — Companion Core Web (3 semaines)

> **Objectif** : Socle architectural web — store, hook, panneau UI, service IA.

### 3.1 Types partagés

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `src/types/companion.ts` — réutiliser les types définis côté mobile | 🔴 P0 | 0.5j |
| Alternative : ajouter dans `@imuchat/shared-types` pour partage cross-platform | 🟡 P1 | 1j |

### 3.2 Store Zustand

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `src/stores/companion-store.ts` (même interface que mobile) | 🔴 P0 | 1j |
| Persist via localStorage (préférences companion) | 🔴 P0 | 0.5j |

### 3.3 Service IA (Alice Web)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `src/services/companion-ai.ts` — client REST vers platform-core Alice routes | 🔴 P0 | 1.5j |
| Post-processing CompanionResponse (text + emotion + animation) | 🔴 P0 | 1j |
| Hook `useCompanion()` — pont companion-store + companion-ai + FSM | 🔴 P0 | 1.5j |

### 3.4 UI — Panneau Companion

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| `CompanionPanel.tsx` — panneau latéral (4e colonne ou overlay droit) | 🔴 P0 | 2j |
| Mode FAB (mini avatar flottant en bas à droite, clic pour ouvrir) | 🔴 P0 | 1j |
| Mode panneau latéral (split avec la colonne de contenu) | 🟡 P1 | 1.5j |
| Mode plein écran (modal immersif) | 🟢 P2 | 1j |
| Placeholder avatar (illustration statique avant Live2D) | 🔴 P0 | 0.5j |
| Intégration dans AppShell / Layout principal | 🔴 P0 | 0.5j |
| Raccourci clavier `Cmd+J` pour toggle companion | 🟡 P1 | 0.5j |

### 3.5 Socket.IO — Événements Companion

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Émettre/recevoir événements companion via Socket.IO (sync multi-onglets) | 🟡 P1 | 1j |

### 3.6 i18n + Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Ajouter ~40 clés `companion.*` dans messages/ (fr, en) | 🟡 P1 | 0.5j |
| Tests companion-store + useCompanion (20+ tests) | 🟡 P1 | 1.5j |

**Total Phase IC-W1 : ~16 jours-dev (~3 semaines)**

---

## 4. Phase IC-W2 — Rendering WebGL / Live2D (5 semaines)

> **Objectif** : Rendu avatar Live2D dans un canvas WebGL avec le SDK officiel web.

### 4.1 Live2D Cubism Web SDK

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Installer Live2D Cubism SDK for Web (npm) | 🔴 P0 | 0.5j |
| Créer `src/components/companion/Live2DCanvas.tsx` — React wrapper du canvas | 🔴 P0 | 3j |
| WebGL context management (init, resize, cleanup) | 🔴 P0 | 1j |
| ModelLoader — charger `.model3.json` + textures + motions depuis CDN/static | 🔴 P0 | 2j |
| Caching assets (Service Worker cache pour modèles) | 🟡 P1 | 1j |

### 4.2 Animation Controller

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Idle animations (breathing, blink, micro-movements) | 🔴 P0 | 2j |
| Trigger animations (wave, nod, explain, celebrate, thinking) | 🔴 P0 | 2j |
| Expression Controller (paramètres Live2D) | 🔴 P0 | 1.5j |
| requestAnimationFrame loop avec delta time | 🔴 P0 | 0.5j |

### 4.3 Intégration UI

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Remplacer placeholder par Live2DCanvas dans CompanionPanel | 🔴 P0 | 1j |
| Responsive canvas (FAB: 80×80, panel: 300×400, fullscreen: adaptive) | 🔴 P0 | 1j |
| Mode sombre/clair — adapter background canvas au thème | 🟡 P1 | 0.5j |
| Transitions CSS fluides entre modes d'affichage | 🟡 P1 | 1j |

### 4.4 Three.js fallback (optionnel, Phase 3)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Évaluer Three.js comme alternative pour avatars 3D | 🟢 P2 | 1j |
| Prototype espace communautaire 3D léger | 🟢 P2 | 3j |

**Total Phase IC-W2 : ~22 jours-dev (~5 semaines)**

---

## 5. Phase IC-W3 — Behaviour Engine & Contexte Web (3 semaines)

> **Objectif** : FSM émotionnelle adaptée au contexte web (onglet actif, focus, visibilité page).

### 5.1 FSM Web

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `src/services/companion-fsm.ts` — même FSM que mobile (shared logic) | 🔴 P0 | 1.5j |
| Transitions déclenchées par événements UI web | 🔴 P0 | 1j |

### 5.2 Context Adapter Web

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Contexte basé sur : route active, mode sidebar, thème, focus/blur window | 🔴 P0 | 2j |
| Page Visibility API : réduire animations quand onglet inactif | 🔴 P0 | 0.5j |
| Prefer Reduced Motion (accessibilité) → mode statique | 🔴 P0 | 0.5j |
| Adapter comportement selon section (Chat → réactif, Store → guide, Settings → discret) | 🟡 P1 | 1j |

### 5.3 Companion proactif (suggestions contextuelles)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Suggestions intelligentes basées sur la page active | 🟡 P1 | 2j |
| Bulle tooltip du companion (tips, raccourcis, aide) | 🟡 P1 | 1j |
| Debounce proactivité (max 1 suggestion/5min) | 🟡 P1 | 0.5j |

### 5.4 Segmentation par âge (connexion AgePolicyContext)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Connecter companion au `AgePolicyContext` (Sprint 2 MVP Phase 2) | 🟡 P1 | 1j |
| Filtrer comportements/archétypes selon tier (KIDS → mascotte uniquement) | 🟡 P1 | 0.5j |

### 5.5 Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests FSM web (15+ tests) | 🟡 P1 | 1j |
| Tests Context Adapter (10+ tests) | 🟡 P1 | 1j |

**Total Phase IC-W3 : ~14 jours-dev (~3 semaines)**

---

## 6. Phase IC-W4 — Web Speech & Lip Sync (3 semaines)

> **Objectif** : TTS/STT via Web Speech API + lip sync Live2D.

### 6.1 Text-to-Speech

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Implémenter `src/services/companion-tts.ts` — Web Speech API `SpeechSynthesis` | 🔴 P0 | 1.5j |
| Fallback API cloud (OpenAI TTS / ElevenLabs) pour voix premium | 🟡 P1 | 1.5j |
| Sélection voix selon archétype + locale (FR, EN, JA) | 🔴 P0 | 1j |
| Personnalisation : pitch, rate, volume | 🟡 P1 | 0.5j |

### 6.2 Speech-to-Text

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Implémenter mode "voix" input via `SpeechRecognition` API | 🟡 P1 | 1.5j |
| Bouton micro dans le panneau companion | 🟡 P1 | 0.5j |
| Continuous listening mode (optionnel, configurable) | 🟢 P2 | 1j |

### 6.3 Lip Sync WebGL

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| AudioContext AnalyserNode → amplitude extraction | 🔴 P0 | 1.5j |
| Mapping amplitude → Live2D ParamMouthOpen (temps réel) | 🔴 P0 | 1.5j |
| Lissage (smoothing factor, anti-jitter) | 🟡 P1 | 0.5j |
| Web Audio API pipeline intégré au rendering loop | 🔴 P0 | 1j |

### 6.4 Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests TTS service (mock SpeechSynthesis) | 🟡 P1 | 1j |
| Tests lip sync (mock AnalyserNode) | 🟡 P1 | 0.5j |

**Total Phase IC-W4 : ~14 jours-dev (~3 semaines)**

---

## 7. Phase IC-W5 — Personnalisation & Archétypes Web (3 semaines)

> **Objectif** : Interface de personnalisation complète pour le web.

### 7.1 Pages companion

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Page `/companion` — Hub principal (archétype actif, chat, avatar) | 🔴 P0 | 2j |
| Page `/companion/archetypes` — Galerie avec preview Live2D | 🔴 P0 | 1.5j |
| Page `/companion/customize` — Éditeur apparence (style, tenue, accessoires, couleurs) | 🔴 P0 | 3j |
| Page `/companion/settings` — Préférences (voix, proactivité, mode d'affichage) | 🟡 P1 | 1.5j |

### 7.2 Preview live

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Preview temps réel de l'avatar lors de la personnalisation | 🔴 P0 | 2j |
| Changement de tenue/accessoire → mise à jour texture Live2D instantanée | 🟡 P1 | 1.5j |

### 7.3 Skins Store (connexion Store existant)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Section "Skins Companion" dans le Store existant | 🟡 P1 | 1j |
| Achat skin → ImuCoin ou Stripe (intégré au wallet web quand disponible) | 🟡 P1 | 1j |
| Affichage preview skin avant achat | 🟡 P1 | 0.5j |

**Total Phase IC-W5 : ~15 jours-dev (~3 semaines)**

---

## 8. Phase IC-W6 — Intégration Modules & Avancé (4 semaines)

> **Objectif** : Companion intégré dans tous les modules + mode appel avatar.

### 8.1 Mode appel avatar

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Toggle caméra ↔ avatar dans l'interface WebRTC | 🔴 P0 | 2j |
| Lip sync micro en direct (AudioContext + AnalyserNode → Live2D) | 🔴 P0 | 2j |
| Avatar visible par les autres participants (stream canvas) | 🟡 P1 | 3j |

### 8.2 Contexte par module

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Companion dans Chat — résumés, suggestions, traduction | 🟡 P1 | 1.5j |
| Companion dans Social Hub — tendances, suggestions posts | 🟡 P1 | 1j |
| Companion dans Store — recommandations modules | 🟡 P1 | 1j |
| Companion dans Watch — commentaires, résumés | 🟢 P2 | 1j |
| Companion dans Dashboard — briefing matinal, métriques clés | 🟡 P1 | 1.5j |

### 8.3 Command Palette integration

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Ajouter "Ask Companion" dans Command Palette (Cmd+K) | 🟡 P1 | 1j |
| Commandes rapides : résumer, traduire, expliquer (via companion) | 🟡 P1 | 1j |

### 8.4 Offline / PWA

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Avatar visible offline (assets Service Worker) | 🟡 P1 | 1j |
| Réponses pré-scriptées offline | 🟡 P1 | 0.5j |

### 8.5 Tests E2E

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests Playwright companion (open, close, send message, change archetype) | 🟡 P1 | 2j |
| Tests performance (canvas FPS, memory leak detection) | 🔴 P0 | 1j |

**Total Phase IC-W6 : ~21 jours-dev (~4 semaines)**

---

## 9. Architecture technique Web

### 9.1 Arborescence fichiers

```
web-app/src/
├── types/companion.ts                        # Types partagés (ou via @imuchat/shared-types)
├── stores/companion-store.ts                 # Zustand persist localStorage
├── hooks/useCompanion.ts                     # Hook principal
├── services/
│   ├── companion-ai.ts                       # Client REST Alice + post-processing
│   ├── companion-fsm.ts                      # FSM états (partageable avec mobile)
│   ├── companion-context.ts                  # Contexte web (route, theme, visibility)
│   ├── companion-tts.ts                      # Web Speech API + fallback cloud
│   ├── companion-stt.ts                      # SpeechRecognition API
│   └── companion-lipsync.ts                  # AudioContext AnalyserNode → Live2D
├── components/companion/
│   ├── CompanionPanel.tsx                    # Panneau latéral principal
│   ├── CompanionFAB.tsx                      # Bouton flottant mini avatar
│   ├── CompanionFullScreen.tsx               # Modal plein écran
│   ├── Live2DCanvas.tsx                      # Canvas WebGL Live2D
│   ├── CompanionChat.tsx                     # Zone conversation dans le panneau
│   ├── ArchetypeGallery.tsx                  # Galerie de sélection
│   ├── CompanionCustomizer.tsx               # Éditeur apparence
│   └── CompanionCallOverlay.tsx              # Avatar dans appels vidéo
├── app/companion/
│   ├── page.tsx                              # Hub companion
│   ├── archetypes/page.tsx                   # Galerie archétypes
│   ├── customize/page.tsx                    # Personnalisation
│   └── settings/page.tsx                     # Paramètres
└── public/models/                            # Assets Live2D (ou CDN)
    └── alice-base/
```

### 9.2 Stack technique

| Couche | Technologie |
|--------|------------|
| Rendering | Live2D Cubism SDK for Web (WebGL canvas) |
| Audio TTS | Web Speech API `SpeechSynthesis` + OpenAI TTS fallback |
| Audio STT | Web Speech API `SpeechRecognition` |
| Lip Sync | Web Audio API `AnalyserNode` → Live2D params |
| State | Zustand (companion-store) + localStorage persist |
| IA Backend | platform-core Alice routes (REST) |
| Real-time | Socket.IO (sync événements companion) |
| 3D (futur) | Three.js (espaces communautaires 3D) |

---

## 10. Spécificités Web vs Mobile

| Aspect | Web | Mobile |
|--------|:---:|:------:|
| **Rendering SDK** | Live2D Web SDK (natif canvas) | Bridge natif ou WebView fallback |
| **TTS** | Web Speech API (gratuit, natif) | expo-speech ou API cloud |
| **STT** | SpeechRecognition API | expo-av Recording + Whisper |
| **Lip Sync** | AudioContext AnalyserNode | Amplitude extraction expo-av |
| **Layout** | Panneau latéral 4e colonne | Overlay flottant |
| **Performance** | GPU desktop → plus de marge | Contrainte batterie + RAM |
| **Offline** | Service Worker cache | AsyncStorage + modèle local |
| **Raccourci** | Cmd+J toggle, Cmd+K palette | Bouton FAB |
| **Avatar appel** | Canvas stream → WebRTC | Stream Video custom data |

### Types partagés (recommandation)

Les types `CompanionState`, `CompanionResponse`, `ArchetypeId`, `SkinConfig` et la logique FSM devraient être extraits dans `@imuchat/shared-types` pour garantir la cohérence cross-platform.

---

## 11. Performance Web

### 11.1 Objectifs

| Métrique | Objectif |
|----------|:--------:|
| FPS canvas Live2D | 60 fps (desktop), 30 fps (mobile browser) |
| Memory (companion chargé) | < 80 MB heap |
| Bundle size companion | < 500 KB gzip (sans modèle) |
| Modèle Live2D assets | < 15 MB (chargé lazy) |
| Lighthouse impact | < 5 points de perte performance |
| First Meaningful Paint | Non impacté (companion lazy loaded) |

### 11.2 Stratégies

1. **Lazy loading** — Companion code split via `next/dynamic`
2. **Canvas pause** — `requestAnimationFrame` arrêté quand onglet inactif (Page Visibility API)
3. **prefers-reduced-motion** — Avatar statique si accessibilité activée
4. **Assets CDN** — Modèles Live2D sur CDN avec cache longue durée
5. **WebGL cleanup** — Nettoyage context GL sur unmount
6. **Bundle splitting** — Live2D SDK en chunk séparé

---

## 12. Timeline consolidée

```
Phase         Semaine  1   2   3   4   5   6   7   8   9  10  11  12  ...  21
              ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤────────┤
IC-W1 Core    │▓▓▓▓▓▓▓▓▓▓▓│                                              │
              │ Store, Hook│                                              │
              │ Panel UI   │                                              │
              │ IA Service │                                              │
IC-W2 WebGL   │            │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                         │
              │            │ Live2D Web SDK      │                        │
              │            │ Canvas, Animations   │                       │
IC-W3 FSM     │            │                     │▓▓▓▓▓▓▓▓▓▓▓│            │
              │            │                     │ FSM, Context│           │
              │            │                     │ Proactif    │           │
IC-W4 Speech  │            │                     │            │▓▓▓▓▓▓▓▓▓▓││
              │            │                     │            │ TTS, STT  ││
              │            │                     │            │ Lip Sync  ││
IC-W5 Perso   │            │                     │            │           │▓▓▓▓▓▓▓▓▓▓│
              │            │                     │            │           │ Pages     │
              │            │                     │            │           │ Archétypes│
IC-W6 Avancé  │            │                     │            │           │           │▓▓▓▓▓▓▓▓▓▓▓▓▓│──→
              │            │                     │            │           │           │ Appel avatar │
              │            │                     │            │           │           │ Modules integ│
              ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤──→
```

### Récapitulatif

| Phase | Durée | Effort (j) | Priorité | Dépendances |
|-------|:-----:|:----------:|:--------:|-------------|
| **IC-W1** Companion Core | 3 sem. | ~16j | 🔴 P0 | platform-core Alice routes |
| **IC-W2** Rendering WebGL | 5 sem. | ~22j | 🔴 P0 | IC-W1 + Live2D Web SDK |
| **IC-W3** Behaviour Engine | 3 sem. | ~14j | 🔴 P0 | IC-W1 |
| **IC-W4** Web Speech & Lip Sync | 3 sem. | ~14j | 🟡 P1 | IC-W2 + IC-W3 |
| **IC-W5** Personnalisation | 3 sem. | ~15j | 🟡 P1 | IC-W2 |
| **IC-W6** Modules & Avancé | 4 sem. | ~21j | 🟢 P2 | IC-W4 + IC-W5 |
| **TOTAL** | **~21 sem.** | **~102j** | | |

> **Note** : IC-W3 peut être développé en parallèle de IC-W2 (pas de dépendance rendering).  
> Avec parallélisation, la durée effective peut être réduite à **~18 semaines**.

---

### Relation avec MVP Phase 2 Web-App

ImuCompanion s'insère **après le Sprint 4** du MVP Phase 2 (Admin, Testing, Infrastructure). Il constitue le premier axe du **MVP Phase 3** web :

| Sprint MVP Phase 2 | Contenu | Relation ImuCompanion |
|---------------------|---------|----------------------|
| Sprint 0 | Phase 1 finition | Prérequis : APIs réelles OK |
| Sprint 1 | Store monétisation | Prérequis : Skins companion vendables |
| Sprint 2 | Age Segmentation | Prérequis : AgePolicyContext pour companion |
| Sprint 3 | Communautés | Companion dans communautés (IC-W6) |
| Sprint 4 | Admin, Tests | Prérequis : infra tests |
| **→ IC-W1 à IC-W6** | **ImuCompanion Engine** | **MVP Phase 3 — Premier axe** |

---

_Document créé le 1 mars 2026 — Roadmap ImuCompanion Web-App_
