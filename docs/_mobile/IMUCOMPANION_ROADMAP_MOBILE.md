# 📱 ImuCompanion Engine — Roadmap Mobile (React Native / Expo)

> **Date de création** : 1 mars 2026  
> **Référence** : `docs/VISION_muCompanion.md` · `docs/3D_AND_Live2D.md`  
> **Stack** : React Native 0.76+ · Expo SDK 52+ · expo-gl · expo-av · Zustand v5  
> **Périmètre** : Intégration progressive du moteur d'Assistant IA incarné sur mobile  
> **Prérequis** : DEV-024 (Alice IA) ✅ terminé — base conversationnelle existante

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [État actuel & fondations](#2-état-actuel--fondations)
3. [Phase IC-M1 — Companion Core (4 semaines)](#3-phase-ic-m1--companion-core-4-semaines)
4. [Phase IC-M2 — Rendering Live2D (6 semaines)](#4-phase-ic-m2--rendering-live2d-6-semaines)
5. [Phase IC-M3 — Behaviour Engine & Contexte (4 semaines)](#5-phase-ic-m3--behaviour-engine--contexte-4-semaines)
6. [Phase IC-M4 — TTS & Lip Sync (3 semaines)](#6-phase-ic-m4--tts--lip-sync-3-semaines)
7. [Phase IC-M5 — Personnalisation & Archétypes (4 semaines)](#7-phase-ic-m5--personnalisation--archétypes-4-semaines)
8. [Phase IC-M6 — Mode Appel Avatar & Avancé (6 semaines)](#8-phase-ic-m6--mode-appel-avatar--avancé-6-semaines)
9. [Architecture technique](#9-architecture-technique)
10. [Performance & contraintes mobile](#10-performance--contraintes-mobile)
11. [Sécurité & éthique](#11-sécurité--éthique)
12. [Dépendances & risques](#12-dépendances--risques)
13. [Timeline consolidée](#13-timeline-consolidée)

---

## 1. Résumé exécutif

ImuCompanion Engine sur mobile est la version **mobile-first** du moteur d'avatar IA incarné. Il s'appuie sur l'assistant Alice (DEV-024 ✅ — 7 personas, multi-provider LLM) pour ajouter une **couche visuelle incarnée** : un avatar Live2D animé qui réagit au contexte, parle avec lip sync, et s'adapte à l'âge et au mode utilisateur.

**Objectif** : Transformer l'assistant textuel Alice en un **compagnon visuel engageant** sans compromettre les performances sur appareils milieu de gamme.

**Durée totale estimée** : ~27 semaines (6 phases progressives)

---

## 2. État actuel & fondations

### Ce qui existe déjà (réutilisable)

| Composant | Statut | Fichiers | Réutilisation |
|-----------|:------:|----------|:-------------:|
| **Assistant Alice (IA)** | ✅ | `services/alice.ts`, `stores/alice-store.ts`, `hooks/useAlice.ts` | 100% — Backend proxy + local LLM |
| **7 personas IA** | ✅ | Intégré dans alice-store | 100% — Base des archétypes |
| **Multi-provider LLM** | ✅ | OpenAI, Claude, Gemini, Mistral, Groq, Ollama, LM Studio | 100% — Pipeline IA |
| **Transcription vocale** | ✅ | `services/transcription.ts`, `hooks/useTranscription.ts` | Partiel — Whisper pour STT |
| **Enregistrement vocal** | ✅ | `hooks/useVoiceRecording.ts`, expo-av | 100% — Input voix |
| **Audio player** | ✅ | `services/audio-player.ts`, expo-av | 100% — Playback TTS |
| **User store (préférences)** | ✅ | `stores/user-store.ts` | 100% — Thème, locale, préférences |
| **6 thèmes visuels** | ✅ | Light, Dark, Kawaii, Pro, Neon, Ocean | 100% — Context adaptation |
| **Segmentation par âge** | 🔲 | Prévu Phase 3 web | Quand disponible |

### Ce qui manque

- ❌ Moteur de rendu Live2D (expo-gl + custom renderer)
- ❌ Modèles Live2D (.model3.json, textures, animations)
- ❌ Behaviour Engine (FSM états émotionnels)
- ❌ TTS streaming + lip sync
- ❌ Overlay / widget flottant companion
- ❌ Archétypes visuels (Assistant Pro, Professeur, Coach, etc.)
- ❌ Système de skins/personnalisation avatar

---

## 3. Phase IC-M1 — Companion Core (4 semaines)

> **Objectif** : Poser le socle architectural — store, types, contexte, overlay UI de base.

### 3.1 Types & Interfaces

| Tâche | Priorité | Effort | Fichier |
|-------|:--------:|:------:|---------|
| Créer `types/companion.ts` — CompanionState, Archetype, Emotion, RenderMode, SkinConfig | 🔴 P0 | 1j | `types/companion.ts` |
| Créer enum `CompanionDisplayMode` (Mini, Dock, FullScreen, Hidden) | 🔴 P0 | 0.5j | `types/companion.ts` |
| Créer `CompanionResponse` (text, emotion, animation, tts, tool_calls) | 🔴 P0 | 0.5j | `types/companion.ts` |

```typescript
// types/companion.ts
export type CompanionState =
  | 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
  | 'REACTING' | 'FOCUS' | 'LOW_POWER';

export type CompanionDisplayMode = 'mini' | 'dock' | 'fullscreen' | 'hidden';

export type ArchetypeId =
  | 'assistant_pro' | 'professor' | 'coach'
  | 'mascot_edu' | 'moderator' | 'creative';

export interface CompanionResponse {
  text: string;
  emotion: string;           // e.g. 'calm_confident', 'happy', 'thinking'
  animation: string;         // e.g. 'gentle_explain', 'nod', 'wave'
  tts: boolean;
  tool_calls: ToolCall[];
}

export interface SkinConfig {
  modelId: string;
  style: 'kawaii' | 'sober' | 'futuristic' | 'minimal';
  outfit: string;
  accessories: string[];
  colorScheme: string;
}
```

### 3.2 Store Zustand

| Tâche | Priorité | Effort | Fichier |
|-------|:--------:|:------:|---------|
| Créer `stores/companion-store.ts` — état, archétype, skin, display mode, persist | 🔴 P0 | 1j | `stores/companion-store.ts` |
| Ajouter actions : `setArchetype`, `setDisplayMode`, `setEmotion`, `toggleCompanion` | 🔴 P0 | 0.5j | `stores/companion-store.ts` |
| Persist via AsyncStorage (préférences companion) | 🟡 P1 | 0.5j | `stores/companion-store.ts` |

### 3.3 Hook principal

| Tâche | Priorité | Effort | Fichier |
|-------|:--------:|:------:|---------|
| Créer `hooks/useCompanion.ts` — pont entre alice-store + companion-store | 🔴 P0 | 1.5j | `hooks/useCompanion.ts` |
| Intégrer `sendMessage()` avec enrichissement CompanionResponse (emotion, animation) | 🔴 P0 | 1j | `hooks/useCompanion.ts` |
| Gestion transitions d'état FSM (IDLE→LISTENING→THINKING→SPEAKING→IDLE) | 🔴 P0 | 1j | `hooks/useCompanion.ts` |

### 3.4 Overlay UI (sans Live2D)

| Tâche | Priorité | Effort | Fichier |
|-------|:--------:|:------:|---------|
| Créer `components/companion/CompanionOverlay.tsx` — widget flottant (placeholder avatar) | 🔴 P0 | 2j | `components/companion/CompanionOverlay.tsx` |
| Mode Mini (FAB 60x60, avatar statique, tap pour expand) | 🔴 P0 | 1j | Intégré dans CompanionOverlay |
| Mode Dock (half-body, zone interactive, text bubble) | 🟡 P1 | 1.5j | `components/companion/CompanionDock.tsx` |
| Mode FullScreen (conversation immersive, avatar large) | 🟢 P2 | 2j | `components/companion/CompanionFullScreen.tsx` |
| Intégration dans `app/_layout.tsx` (overlay global, toggle via companion-store) | 🔴 P0 | 0.5j | `app/_layout.tsx` |

### 3.5 Backend — Post-processing IA

| Tâche | Priorité | Effort | Fichier |
|-------|:--------:|:------:|---------|
| Étendre route Alice backend pour retourner `CompanionResponse` | 🔴 P0 | 1j | `platform-core/src/services/alice.ts` |
| Ajouter emotion extraction dans le prompt système | 🔴 P0 | 0.5j | `platform-core/src/services/alice.ts` |
| Parser JSON structuré (text + emotion + animation) | 🔴 P0 | 0.5j | `services/companion-ai.ts` |

### 3.6 i18n

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Ajouter ~40 clés `companion.*` (fr/en/ja) | 🟡 P1 | 0.5j |

### 3.7 Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests companion-store (15+ tests) | 🟡 P1 | 1j |
| Tests useCompanion hook (20+ tests) | 🟡 P1 | 1j |
| Tests CompanionOverlay (rendu, modes, transitions) | 🟢 P2 | 1j |

**Total Phase IC-M1 : ~20 jours-dev (~4 semaines)**

---

## 4. Phase IC-M2 — Rendering Live2D (6 semaines)

> **Objectif** : Intégrer le moteur de rendu Live2D pour afficher un avatar animé performant sur mobile.

### 4.1 Infrastructure GL

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Installer `expo-gl` + vérifier compatibilité Expo SDK 52 | 🔴 P0 | 0.5j |
| Créer bridge natif React Native ↔ Live2D Cubism SDK (iOS + Android) | 🔴 P0 | 5j |
| Alternative : évaluer Live2D Web SDK dans WebView isolée (fallback perf) | 🟡 P1 | 2j |
| Créer `components/companion/ImuAvatarView.tsx` — GLSurfaceView wrapper | 🔴 P0 | 2j |

### 4.2 Model Loader

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Implémenter chargeur `.model3.json` + textures + motions | 🔴 P0 | 3j |
| Cache modèle en mémoire (éviter rechargement) | 🔴 P0 | 1j |
| Preload textures optimisé (compression ASTC/ETC2) | 🟡 P1 | 1j |
| Gestion asset bundles (embarqués vs téléchargés) | 🟡 P1 | 1.5j |

### 4.3 Animation Controller

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Idle animations (clignement, respiration, micro-mouvements) | 🔴 P0 | 2j |
| Trigger animations (wave, nod, explain, celebrate) | 🔴 P0 | 2j |
| Expression Controller (ParamEyeOpen, ParamMouthOpen, ParamSmile, etc.) | 🔴 P0 | 2j |
| Context-based motion (mode meeting = minimal, mode social = expressif) | 🟡 P1 | 1.5j |

### 4.4 Intégration UI

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Remplacer placeholder avatar par `ImuAvatarView` dans CompanionOverlay | 🔴 P0 | 1j |
| Responsive rendering (mini 120×120, dock 200×300, fullscreen adaptive) | 🔴 P0 | 1.5j |
| Transitions animées entre modes (mini↔dock↔fullscreen) | 🟡 P1 | 1j |

### 4.5 Modèle(s) de base

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer ou acquérir 1 modèle Live2D de base "Alice" (half-body) | 🔴 P0 | Externe |
| Préparer 6-8 expressions de base (neutral, happy, thinking, surprised, sad, focused) | 🔴 P0 | Externe |
| Préparer 4-5 idle motions | 🟡 P1 | Externe |

**Total Phase IC-M2 : ~27 jours-dev (~6 semaines)**  
*Note : le bridge natif Live2D est le point le plus complexe. La fallback WebView peut accélérer le MVP.*

---

## 5. Phase IC-M3 — Behaviour Engine & Contexte (4 semaines)

> **Objectif** : Implémenter la FSM émotionnelle et l'adaptation contextuelle.

### 5.1 Finite State Machine

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `services/companion-fsm.ts` — Machine à états typée | 🔴 P0 | 2j |
| 7 états : IDLE, LISTENING, THINKING, SPEAKING, REACTING, FOCUS, LOW_POWER | 🔴 P0 | 1j |
| Transitions déclenchées par événements (message reçu, IA répond, mode change) | 🔴 P0 | 1.5j |
| Mapping état → expression Live2D + animation | 🔴 P0 | 1j |

```typescript
// services/companion-fsm.ts
const TRANSITIONS: Record<CompanionState, Partial<Record<FSMEvent, CompanionState>>> = {
  IDLE:      { USER_SPEAKS: 'LISTENING', RECEIVE_MSG: 'REACTING', FOCUS_MODE: 'FOCUS' },
  LISTENING: { USER_STOPS: 'THINKING', CANCEL: 'IDLE' },
  THINKING:  { AI_RESPONDS: 'SPEAKING', ERROR: 'IDLE' },
  SPEAKING:  { TTS_DONE: 'IDLE', USER_INTERRUPTS: 'LISTENING' },
  REACTING:  { REACTION_DONE: 'IDLE' },
  FOCUS:     { FOCUS_OFF: 'IDLE' },
  LOW_POWER: { POWER_OK: 'IDLE' },
};
```

### 5.2 Context Adapter

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Créer `services/companion-context.ts` — détecte le contexte actif | 🔴 P0 | 2j |
| Adapter expressivité selon : thème, onglet actif, heure, batterie, mode | 🔴 P0 | 1.5j |
| Connecter `ui-store` (tab active) + `user-store` (préférences) | 🟡 P1 | 1j |
| Adapter FPS selon performance appareil (30fps → 15fps → statique) | 🔴 P0 | 1j |
| Mode nuit : animations réduites, voix plus douce | 🟡 P1 | 0.5j |

### 5.3 Segmentation par âge

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Préparer hooks `useAgePolicy` pour filtrer comportements companion | 🟡 P1 | 1j |
| Limiter proactivité pour profils enfants | 🟡 P1 | 0.5j |
| Désactiver expressions inappropriées selon tranche d'âge | 🟡 P1 | 0.5j |
| Contrôle parental : toggle companion, journal interactions | 🟡 P1 | 1.5j |

### 5.4 Tests

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests FSM (transitions, états invalides, edge cases) | 🟡 P1 | 1.5j |
| Tests Context Adapter (mode nuit, batterie, performance) | 🟡 P1 | 1j |

**Total Phase IC-M3 : ~18 jours-dev (~4 semaines)**

---

## 6. Phase IC-M4 — TTS & Lip Sync (3 semaines)

> **Objectif** : Voix synthétique + synchronisation labiale avec l'avatar Live2D.

### 6.1 Text-to-Speech

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Évaluer options TTS : expo-speech (natif) vs API cloud (ElevenLabs, OpenAI TTS) | 🔴 P0 | 1j |
| Implémenter `services/companion-tts.ts` — streaming TTS chunk-by-chunk | 🔴 P0 | 2j |
| Cache audio courantes (greetings, confirmations) dans AsyncStorage | 🟡 P1 | 1j |
| Personnalisation voix : timbre, vitesse, genre (config par archétype) | 🟡 P1 | 1.5j |
| Fallback expo-speech quand offline ou provider indisponible | 🔴 P0 | 0.5j |

### 6.2 Lip Sync

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Extracteur amplitude audio → ParamMouthOpen mapping | 🔴 P0 | 2j |
| Amplitude stream sync (chunk audio → amplitude → Live2D param en temps réel) | 🔴 P0 | 2j |
| Lissage transitions bouche (interpolation, anti-jitter) | 🟡 P1 | 1j |

### 6.3 Pipeline complet

```
User Input → Alice LLM → CompanionResponse
  → Text → TTS → Audio chunks
  → Audio → Amplitude Extractor → Live2D ParamMouthOpen
  → Emotion → Expression Controller → Live2D Expressions
  → Animation → Animation Controller → Live2D Motions
```

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Orchestration pipeline complète (text+voice+animation simultanés) | 🔴 P0 | 2j |
| Tests end-to-end du pipeline (mock LLM → TTS → lip sync) | 🟡 P1 | 1j |

**Total Phase IC-M4 : ~14 jours-dev (~3 semaines)**

---

## 7. Phase IC-M5 — Personnalisation & Archétypes (4 semaines)

> **Objectif** : Système d'archétypes visuels et personnalisation utilisateur.

### 7.1 Archétypes officiels

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Définir 6 archétypes avec config complète (personnalité, limites, ton, expressivité) | 🔴 P0 | 1j |
| Créer `data/archetypes.ts` — registry des archétypes | 🔴 P0 | 1j |
| UI sélection archétype (cards visuelles avec preview) | 🔴 P0 | 2j |
| Écran `app/companion/archetypes.tsx` | 🟡 P1 | 1.5j |

| Archétype | Personnalité | Expressivité | Cas d'usage |
|-----------|-------------|:------------:|-------------|
| **Assistant Pro** | Calme, efficace, factuel | Modérée | Productivité, résumés, tâches |
| **Professeur** | Patient, pédagogue, encourageant | Élevée | Éducation, aide aux devoirs |
| **Coach** | Motivant, dynamique, direct | Élevée | Sport, objectifs, bien-être |
| **Mascotte Édu** | Joyeuse, ludique, simplifiée | Très élevée | Profils enfants (KIDS/JUNIOR) |
| **Modérateur** | Neutre, juste, posé | Faible | Communautés, groupes |
| **Créatif** | Inspirant, imaginatif, expressif | Élevée | Design, musique, écriture |

### 7.2 Personnalisation apparence

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Écran `app/companion/customize.tsx` — éditeur apparence | 🔴 P0 | 3j |
| Section style (kawaii, sobre, futuriste, minimal) | 🔴 P0 | 1j |
| Section tenues (5 tenues de base par archétype) | 🟡 P1 | 1j |
| Section accessoires (lunettes, chapeau, écouteurs, etc.) | 🟡 P1 | 1j |
| Section couleurs (palette primaire, secondaire) | 🟡 P1 | 0.5j |
| Preview live de l'avatar pendant la personnalisation | 🔴 P0 | 1.5j |

### 7.3 Personnalisation voix & comportement

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Sliders : expressivité, humour, proactivité, fréquence interaction | 🟡 P1 | 1j |
| Choix voix (masculin, féminin, neutre) + demo audio | 🟡 P1 | 1j |
| Sauvegarde config dans companion-store (persist) | 🔴 P0 | 0.5j |

### 7.4 Monétisation skins (infrastructure)

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Table Supabase `companion_skins` (id, name, archetype, preview, price, is_premium) | 🟡 P1 | 0.5j |
| API `GET /api/companion/skins` + `POST /api/companion/skins/purchase` | 🟡 P1 | 1j |
| Badge "Premium" sur skins payants dans l'UI | 🟢 P2 | 0.5j |

**Total Phase IC-M5 : ~19 jours-dev (~4 semaines)**

---

## 8. Phase IC-M6 — Mode Appel Avatar & Avancé (6 semaines)

> **Objectif** : Avatar Live2D comme alternative à la caméra dans les appels vidéo + fonctionnalités avancées.

### 8.1 Mode appel avatar

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Intégrer ImuAvatarView dans l'écran d'appel (`app/call/active.tsx`) | 🔴 P0 | 3j |
| Toggle caméra ↔ avatar dans les contrôles d'appel | 🔴 P0 | 1j |
| Lip sync micro en direct (amplitude micro → ParamMouthOpen) | 🔴 P0 | 3j |
| Expressions automatiques via analyse audio (ton, volume) | 🟡 P1 | 2j |
| Serialisation avatar pour envoi peer-to-peer (via Stream Video custom data) | 🟡 P1 | 3j |

### 8.2 Réactions aux messages

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Companion réagit aux messages reçus (surprise, rire, empathie) | 🟡 P1 | 2j |
| Companion réagit aux notifications (alerte, rappel) | 🟡 P1 | 1j |
| Mini-animations contextuelles dans l'overlay | 🟡 P1 | 1.5j |

### 8.3 Intégration modules

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Companion dans Store (guide, recommandations) | 🟢 P2 | 1j |
| Companion dans Tasks (rappels, encouragements productivité) | 🟢 P2 | 1j |
| Companion dans Music (reactions, suggestions) | 🟢 P2 | 1j |
| API `CompanionBridge` pour mini-apps WebView | 🟢 P2 | 2j |

### 8.4 Mode offline

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Avatar reste animé (idle) quand offline | 🔴 P0 | 0.5j |
| Réponses pré-scriptées (greetings, encouragements basiques) | 🟡 P1 | 1j |
| Bannière "Connexion requise pour l'IA avancée" | 🔴 P0 | 0.5j |

### 8.5 Tests & polish

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Tests intégration appel + avatar (mock Stream) | 🟡 P1 | 2j |
| Profiling GPU mobile (3 gammes d'appareils) | 🔴 P0 | 1.5j |
| i18n complémentaire (~30 clés) | 🟡 P1 | 0.5j |

**Total Phase IC-M6 : ~28 jours-dev (~6 semaines)**

---

## 9. Architecture technique

### 9.1 Couches du système

```
┌────────────────────────────────────────┐
│      UI Layer (React Native)           │
│  CompanionOverlay · CompanionDock      │
│  CompanionFullScreen · ImuAvatarView   │
└───────────────────┬────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│    ImuCompanion Core Controller        │
│  hooks/useCompanion.ts                 │
│  stores/companion-store.ts             │
└───────────────────┬────────────────────┘
                    │
  ┌─────────────────┼──────────────────┐
  │                 │                  │
  ▼                 ▼                  ▼
┌──────────┐  ┌───────────┐  ┌────────────┐
│ Rendering │  │ Behaviour │  │ AI Pipeline│
│ Engine    │  │ Engine    │  │            │
│ (Live2D)  │  │ (FSM)     │  │ (Alice+    │
│           │  │           │  │  PostProc) │
└─────┬─────┘  └─────┬─────┘  └─────┬──────┘
      │               │              │
      ▼               ▼              ▼
┌──────────┐  ┌───────────┐  ┌────────────┐
│ expo-gl   │  │ companion │  │ platform-  │
│ Live2D    │  │ -context  │  │ core API   │
│ Native    │  │ -fsm      │  │ OpenAI/    │
│ Bridge    │  │           │  │ Claude/etc │
└──────────┘  └───────────┘  └────────────┘
```

### 9.2 Fichiers à créer

```
mobile/
├── types/companion.ts                       # Types & interfaces
├── stores/companion-store.ts                # Zustand persist
├── hooks/useCompanion.ts                    # Hook principal
├── services/
│   ├── companion-ai.ts                      # Post-processing IA → CompanionResponse
│   ├── companion-fsm.ts                     # FSM états émotionnels
│   ├── companion-context.ts                 # Adaptation contextuelle
│   ├── companion-tts.ts                     # TTS streaming + cache
│   ├── companion-lipsync.ts                 # Amplitude → Live2D params
│   └── companion-skins-api.ts              # API skins (achat, catalogue)
├── components/companion/
│   ├── CompanionOverlay.tsx                 # Widget overlay global
│   ├── CompanionDock.tsx                    # Mode dock half-body
│   ├── CompanionFullScreen.tsx              # Mode plein écran
│   ├── CompanionMini.tsx                    # FAB mini avatar
│   ├── ImuAvatarView.tsx                    # GL surface Live2D
│   ├── ArchetypeSelector.tsx                # Sélection archétype
│   └── CompanionCustomizer.tsx              # Éditeur apparence
├── app/companion/
│   ├── _layout.tsx                          # Stack layout
│   ├── index.tsx                            # Hub companion (archétype + chat)
│   ├── customize.tsx                        # Personnalisation
│   ├── archetypes.tsx                       # Galerie archétypes
│   └── settings.tsx                         # Paramètres companion
├── data/archetypes.ts                       # Registry archétypes
└── assets/models/                           # Modèles Live2D
    ├── alice-base/
    │   ├── alice.model3.json
    │   ├── textures/
    │   └── motions/
    └── ...
```

---

## 10. Performance & contraintes mobile

### 10.1 Objectifs performance

| Métrique | Objectif | Mode Low Power |
|----------|:--------:|:--------------:|
| FPS avatar | 30 fps | 15 fps |
| CPU idle (companion visible) | < 8% | < 4% |
| RAM supplém. (avatar chargé) | < 50 MB | < 25 MB |
| Taille assets modèle de base | < 15 MB | - |
| Temps chargement modèle | < 2s | < 1s (cache) |
| Batterie impact | < 5%/h | < 2%/h |

### 10.2 Optimisations

1. **FPS adaptatif** — 30fps normal → 15fps batterie faible → pause hors écran
2. **Lazy loading** — Modèle Live2D chargé uniquement si companion activé
3. **Texture compression** — ASTC (iOS) / ETC2 (Android) pour textures
4. **Animation throttling** — Désactiver micro-mouvements quand non visible
5. **Memory management** — Déchargement textures GL quand inactif 5 min
6. **Respect `Reduce Motion`** — Mode statique si accessibilité activée
7. **Appareil milieu de gamme** — Benchmark sur iPhone SE 3 / Pixel 6a minimum

---

## 11. Sécurité & éthique

### 11.1 Règles fondamentales

- ✅ Mention permanente : **"Assistant IA"** visible dans l'interface
- ✅ Pas de dépendance affective encouragée (pas de "je t'aime", pas d'attachement simulé)
- ✅ Transparence sur les limitations (IA peut se tromper)
- ✅ Contrôle parental strict (désactivation, journal, limites temporelles)
- ✅ Possibilité de désactivation complète (companion hidden)
- ✅ Conformité RGPD (données companion = données personnelles)

### 11.2 Permission Gate

```
AI Intent → Permission Gate → Execute
```

| Action | Permission requise |
|--------|:------------------:|
| Répondre à une question | ✅ Auto |
| Résumer une conversation | ✅ Auto |
| Envoyer un message au nom de l'utilisateur | ⚠️ Confirmation requise |
| Dépenser du wallet | 🔐 2FA requis |
| Accéder aux contacts | 🔐 Permission explicite |
| Accéder à la localisation | 🔐 Permission explicite |

### 11.3 Journal interactions

| Tâche | Priorité | Effort |
|-------|:--------:|:------:|
| Logger les interactions companion (type, durée, archétype) | 🟡 P1 | 1j |
| Écran consultation journal (parents) | 🟡 P1 | 1j |
| Limites temporelles configurables (max 2h/jour pour enfants) | 🟡 P1 | 1j |

---

## 12. Dépendances & risques

| # | Risque | Impact | Probabilité | Mitigation |
|---|--------|:------:|:-----------:|------------|
| 1 | **Bridge natif Live2D complexe** | Élevé | Élevée | Fallback WebView avec Live2D Web SDK. Performance moindre mais fonctionnel. |
| 2 | **Performance GPU mobile** | Élevé | Moyenne | Mode low-power + mode statique. Tests sur 3 gammes d'appareils. |
| 3 | **Coût modèles Live2D** | Moyen | Moyenne | Commencer par 1 modèle open-source ou commissionné. Limiter à half-body MVP. |
| 4 | **Latence TTS streaming** | Moyen | Moyenne | Cache phrases courantes. Fallback expo-speech natif. |
| 5 | **Scope creep personnalisation** | Élevé | Élevée | Limiter à 6 archétypes + 5 tenues de base. Pas de full-body en Phase 1. |
| 6 | **EAS Build requis** | Faible | Faible | Bridge natif nécessite EAS Build (pas Expo Go). Planifier early. |
| 7 | **Éthique & régulation IA** | Élevé | Faible | Permission gate, journal interactions, contrôle parental, mention "IA". |

### Dépendances externes

| Dépendance | Phase | Type |
|------------|:-----:|:----:|
| Live2D Cubism SDK (license) | IC-M2 | Externe |
| Modèles Live2D (assets) | IC-M2 | Externe/Création |
| TTS provider (ElevenLabs / OpenAI TTS) | IC-M4 | API |
| EAS Build (pour native modules) | IC-M2+ | Infra |

---

## 13. Timeline consolidée

```
Phase         Semaine  1   2   3   4   5   6   7   8   9  10  11  12  13  ...  27
              ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤────────┤
IC-M1 Core    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                                              │
              │ Types, Store   │                                              │
              │ Hook, Overlay  │                                              │
              │ Backend post-  │                                              │
              │ processing     │                                              │
IC-M2 Live2D  │               │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                      │
              │               │ GL bridge, Model       │                      │
              │               │ Loader, Animations      │                     │
              │               │ ImuAvatarView           │                     │
IC-M3 FSM     │               │                        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     │
              │               │                        │ FSM, Context   │     │
              │               │                        │ Age policy     │     │
IC-M4 TTS     │               │                        │               │▓▓▓▓▓▓│▓▓▓│
              │               │                        │               │ TTS  │Lip│
              │               │                        │               │stream│Syn│
IC-M5 Perso   │               │                        │               │      │▓▓▓▓▓▓▓▓▓▓▓▓▓│
              │               │                        │               │      │ Archétypes   │
              │               │                        │               │      │ Skins, Voix  │
IC-M6 Avancé  │               │                        │               │      │              │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│──→
              │               │                        │               │      │              │ Appel avatar  │
              │               │                        │               │      │              │ Réactions msg │
              ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤──→
```

### Récapitulatif

| Phase | Durée | Effort (j) | Priorité | Dépendances |
|-------|:-----:|:----------:|:--------:|-------------|
| **IC-M1** Companion Core | 4 sem. | ~20j | 🔴 P0 | DEV-024 (Alice) ✅ |
| **IC-M2** Rendering Live2D | 6 sem. | ~27j | 🔴 P0 | IC-M1 + Live2D SDK |
| **IC-M3** Behaviour Engine | 4 sem. | ~18j | 🔴 P0 | IC-M1 |
| **IC-M4** TTS & Lip Sync | 3 sem. | ~14j | 🟡 P1 | IC-M2 + IC-M3 |
| **IC-M5** Personnalisation | 4 sem. | ~19j | 🟡 P1 | IC-M2 |
| **IC-M6** Mode Appel & Avancé | 6 sem. | ~28j | 🟢 P2 | IC-M4 + IC-M5 |
| **TOTAL** | **~27 sem.** | **~126j** | | |

> **Note** : IC-M3 peut être développé en parallèle de IC-M2 car il ne dépend pas du rendering.  
> Avec parallélisation IC-M2 + IC-M3, la durée totale peut être réduite à **~23 semaines**.

---

> **Prochaine étape** : Valider IC-M1 (Companion Core) comme premier sprint, en s'appuyant sur l'infrastructure Alice existante. Le companion démarre en mode "avatar statique + bulles texte" avant l'intégration Live2D.

---

*Document créé le 1 mars 2026 — Roadmap ImuCompanion Mobile*
