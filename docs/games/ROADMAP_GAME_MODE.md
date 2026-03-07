# 🎮 Roadmap — Game Mode Global ImuChat

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Implémenter un mode gaming global qui transforme ImuChat en compagnon intelligent pendant les sessions de jeu (overlay, anti-distraction, performance, clips, assistant IA vocal)

---

## 📊 Vue d'ensemble des phases

| Phase | Nom | Durée | Priorité | Plateforme principale |
|-------|-----|-------|----------|----------------------|
| **Phase 1** | Fondations Game Mode | 2 sprints | P0 | Desktop |
| **Phase 2** | Overlay gaming | 3 sprints | P0 | Desktop |
| **Phase 3** | Anti-distraction & Performance | 2 sprints | P1 | Desktop |
| **Phase 4** | Clips & Replay | 3 sprints | P1 | Desktop |
| **Phase 5** | Assistant IA vocal gaming | 2 sprints | P2 | Desktop |
| **Phase 6** | Streaming depuis l'overlay | 2 sprints | P2 | Desktop |
| **Phase 7** | Gamification & Achievements | 2 sprints | P3 | Toutes |

> ⚠️ **Note :** Le Game Mode est principalement une fonctionnalité **Desktop**. Sur mobile/web, seuls les éléments de gamification (Phase 7) et le suivi de session sont disponibles.

---

## 🏗️ Phase 1 — Fondations Game Mode (Sprints 1-2)

### Objectif

Infrastructure technique pour détecter les jeux, activer/désactiver le Game Mode, et gérer l'état global.

### Sprint 1 — Détection & activation

- [ ] `GameModeManager` — service principal
  - Détection automatique de lancement de jeu (process monitor)
  - Activation manuelle via bouton ou raccourci (`Ctrl+Shift+G`)
  - État global : `NORMAL` | `GAME_MODE_ACTIVE` | `GAME_MODE_PAUSED`
- [ ] `ProcessMonitorService` (Rust)
  - Scan des processus actifs toutes les 2-5s
  - Base de données de jeux connus (hashes, noms de processus)
  - Détection heuristique (fullscreen, GPU usage)
- [ ] Événements temps réel :

  ```
  gamemode.activated
  gamemode.deactivated
  gamemode.game_detected { gameName, processId }
  ```

### Sprint 2 — Configuration Game Mode

- [ ] Écran `GameModeSettings`
  - Activation automatique ON/OFF
  - Liste blanche/noire d'applications
  - Raccourci clavier personnalisable
  - Comportement au lancement (overlay auto, vocal auto)
- [ ] Persistance des préférences dans `PreferencesModule`
- [ ] API : `GET/PUT /api/settings/gamemode`
- [ ] Tests unitaires complets

### Livrables Phase 1

- ✅ Détection automatique de jeux
- ✅ Activation/désactivation Game Mode
- ✅ Configuration utilisateur complète

---

## 🖥 Phase 2 — Overlay Gaming (Sprints 3-5)

### Objectif

Overlay léger, non-intrusif, affiché au-dessus des jeux avec les outils essentiels.

### Sprint 3 — Fenêtre overlay de base

- [ ] `OverlayWindow` (Electron BrowserWindow transparent)
  - Fenêtre transparente always-on-top
  - Mode click-through (ne capture pas les clics sauf quand activé)
  - Raccourci pour afficher/masquer (`Ctrl+Shift+O`)
  - Positionnement configurable (coin, bord)
- [ ] Architecture overlay :

  ```
  ┌─────────────────────────┐
  │    Overlay Container     │
  │  ┌──────┐ ┌──────────┐  │
  │  │Voice │ │ Quick    │  │
  │  │Panel │ │ Chat     │  │
  │  └──────┘ └──────────┘  │
  │  ┌──────┐ ┌──────────┐  │
  │  │Party │ │ Widgets  │  │
  │  │Ctrl  │ │          │  │
  │  └──────┘ └──────────┘  │
  └─────────────────────────┘
  ```

- [ ] Animations minimales (performance)

### Sprint 4 — Widgets overlay

- [ ] Widget `VoiceChatOverlay`
  - Liste des participants vocaux
  - Indicateur "qui parle"
  - Boutons mute/unmute/deafen
  - Volume individuel
- [ ] Widget `QuickChatOverlay`
  - Derniers messages du chat d'équipe
  - Input de message rapide
  - Réponses rapides prédéfinies
- [ ] Widget `FriendsOverlay`
  - Amis en ligne (condensé)
  - Bouton invite rapide
- [ ] Widget `PartyControlOverlay`
  - Gestion de l'équipe
  - Invite / Leave / Voice settings

### Sprint 5 — Widgets gaming avancés

- [ ] Widget `SessionTracker`
  - Durée de la session en cours
  - Temps de jeu total aujourd'hui
- [ ] Widget `LiveStats` (pour jeux supportés)
  - Kills / Deaths / Assists
  - Score en direct
  - Données via API jeux (Riot, Steam)
- [ ] Widget `QuickActions`
  - Screenshot
  - Start clip
  - Toggle stream
  - DND toggle
- [ ] Système de widgets drag & drop (positionnement libre)

### Livrables Phase 2

- ✅ Overlay transparent fonctionnel
- ✅ Widgets : voice, chat, friends, party
- ✅ Widgets : session, stats, quick actions
- ✅ Positionnement personnalisable

---

## 🔕 Phase 3 — Anti-distraction & Performance (Sprints 6-7)

### Objectif

Réduire les interruptions et l'impact sur les performances pendant les sessions de jeu.

### Sprint 6 — Mode anti-distraction

- [ ] `DisturbReducer` — gestionnaire de notifications
  - Couper toutes les notifications non-critiques
  - Notifications gaming uniquement (invites, party)
  - Silencer les sons ImuChat
  - Mettre les chats en mode silencieux
- [ ] Règles de priorité configurables
  - Toujours laisser passer : messages de X contacts
  - Bloquer : notifications de groupes, store, social
  - Personnalisable par l'utilisateur
- [ ] Indicateur visuel "DND Gaming" sur le profil
- [ ] Désactivation automatique à la fin de la session

### Sprint 7 — Mode performance

- [ ] `PerformanceOptimizer` (Rust)
  - Réduction consommation RAM d'ImuChat
  - Désactivation des animations UI
  - Suspension des modules non-essentiels
  - Réduction fréquence sync en arrière-plan
- [ ] Monitoring de l'impact ImuChat
  - CPU % utilisé par ImuChat pendant le jeu
  - RAM consommée
  - Objectif : < 150 MB RAM, < 2% CPU
- [ ] Profils de performance
  - Ultra léger (overlay minimal + vocal uniquement)
  - Équilibré (overlay + chat)
  - Complet (tout activé)
- [ ] Dashboard performance dans les settings

### Livrables Phase 3

- ✅ Mode anti-distraction intelligent
- ✅ Optimization performance avec profils
- ✅ Impact minimal sur les FPS (< 2%)

---

## 🎥 Phase 4 — Clips & Replay (Sprints 8-10)

### Objectif

Capture et partage de moments de jeu directement depuis ImuChat.

### Sprint 8 — Capture vidéo de base

- [ ] `ClipCaptureService` (Rust + FFmpeg)
  - Buffer circulaire vidéo (dernières 30s / 1min / 5min)
  - Capture GPU-accelerated (NVENC / AMF / VideoToolbox)
  - Configuration qualité : 720p, 1080p, résolution native
  - Raccourci sauvegarde instantanée (`Ctrl+Shift+C`)
- [ ] Encodage en arrière-plan (impact minimal)
- [ ] Stockage local temporaire

### Sprint 9 — Édition & gestion de clips

- [ ] `ClipEditor` — éditeur intégré léger
  - Trim (début / fin)
  - Ajout de texte / annotations
  - Ralenti / accéléré
  - Preview avant export
- [ ] `ClipLibrary` — bibliothèque de clips
  - Liste des clips sauvegardés
  - Métadonnées : jeu, date, durée
  - Tri et recherche
- [ ] Export en MP4 / GIF
- [ ] Suppression automatique des vieux clips (configurable)

### Sprint 10 — Partage & social clips

- [ ] Partage de clips
  - Dans le chat ImuChat (embed)
  - Dans les communautés / guildes
  - Lien public partageable
- [ ] Fil de clips gaming (Gaming Feed)
  - Clips populaires de la communauté
  - Likes, commentaires, partages
- [ ] Upload vers plateformes externes
  - YouTube, TikTok (via API)
  - Twitch clips
- [ ] Écran `ClipFeed` + composants : `ClipCard`, `ClipPlayer`

### Livrables Phase 4

- ✅ Capture vidéo GPU-accelerated
- ✅ Éditeur de clips intégré
- ✅ Bibliothèque et partage de clips
- ✅ Fil communautaire de clips

---

## 🤖 Phase 5 — Assistant IA Vocal Gaming (Sprints 11-12)

### Objectif

Assistant vocal contextuel activable pendant les sessions de jeu.

### Sprint 11 — Commandes vocales

- [ ] `GamingVoiceAssistant` — moteur de commandes vocales
  - Wake word : "Hey Imu"
  - Speech-to-text optimisé pour le bruit gaming
  - Commandes supportées :

    ```
    "Hey Imu, invite [nom]"
    "Hey Imu, mute everyone"
    "Hey Imu, unmute [nom]"
    "Hey Imu, start recording"
    "Hey Imu, save clip"
    "Hey Imu, what time is it"
    "Hey Imu, read last message"
    ```

- [ ] Feedback audio (confirmation sonore)
- [ ] Mode push-to-talk pour commandes (éviter faux positifs)

### Sprint 12 — Conseils IA contextuels

- [ ] `GamingCoachWidget` — suggestions IA dans l'overlay
  - Tips contextuels (basés sur les stats du jeu en cours)
  - Rappels de pause (ex: toutes les 2h)
  - Résumé de session à la fin du jeu
- [ ] Intégration avec `GamingRecommendationService` du Gaming Hub
- [ ] Désactivable par l'utilisateur
- [ ] Notifications proactives :
  - "Tu joues depuis 3h, pense à faire une pause"
  - "Ton KDA a augmenté de 20% cette semaine"

### Livrables Phase 5

- ✅ Commandes vocales gaming fonctionnelles
- ✅ Conseils IA contextuels dans l'overlay
- ✅ Résumés de session automatiques

---

## 📺 Phase 6 — Streaming depuis l'overlay (Sprints 13-14)

### Objectif

Lancer et gérer un stream directement depuis l'overlay du Game Mode.

### Sprint 13 — Streaming depuis l'overlay

- [ ] Bouton "Start Stream" dans l'overlay
  - Configuration rapide (titre, jeu, plateforme)
  - Indicateur "LIVE" dans l'overlay
  - Compteur de viewers
- [ ] Plateformes de diffusion
  - Stream natif ImuChat
  - Twitch (via RTMP)
  - YouTube Live (via RTMP)
- [ ] Qualité de stream configurable

### Sprint 14 — Interaction viewers

- [ ] Chat viewers dans l'overlay
  - Messages des viewers en overlay
  - Réponses rapides
  - Modération basique (ban, timeout)
- [ ] Alertes de stream
  - Nouveau follower
  - Nouveau viewer
  - Messages importants
- [ ] Invite viewers à rejoindre la partie

### Livrables Phase 6

- ✅ Lancement de stream depuis l'overlay
- ✅ Multi-plateforme (ImuChat, Twitch, YouTube)
- ✅ Chat viewers en overlay

---

## 🏆 Phase 7 — Gamification & Achievements (Sprints 15-16)

### Objectif

Système de gamification lié aux sessions de jeu (multi-plateforme).

### Sprint 15 — Achievements ImuChat Gaming

- [ ] `AchievementService` — système d'achievements
  - Achievements basés sur le temps de jeu
    - "First Hour" — 1h de jeu cumulée
    - "Night Owl" — jouer après minuit
    - "Marathon" — session de 4h+
    - "Social Gamer" — 50 parties en groupe
    - "Variety Show" — jouer à 10+ jeux différents
  - Achievements sociaux
    - "Squad Leader" — créer 10 parties
    - "Streamer" — 10h de streaming
    - "Clip Master" — 50 clips partagés
- [ ] Notifications d'achievement (overlay + mobile)
- [ ] Historique des achievements

### Sprint 16 — Niveaux & classements

- [ ] Système de niveaux gaming ImuChat
  - XP basé sur : temps de jeu, activité sociale, achievements
  - Niveaux visibles sur le profil
  - Récompenses par niveau (badges, emotes, thèmes)
- [ ] Classements
  - Classement amis
  - Classement global
  - Classement par jeu
- [ ] Saisons gaming (reset trimestriel)
- [ ] Intégration avec le profil gaming du Gaming Hub

### Livrables Phase 7

- ✅ Système d'achievements gaming complet
- ✅ Niveaux et XP gaming
- ✅ Classements et saisons

---

## 🧱 Architecture technique résumée

### Composants Desktop (Electron + Rust)

```
┌─────────────────────────────────────┐
│         Overlay Window              │
│  (Electron BrowserWindow)           │
│  Transparent · Always-on-top        │
│  ┌─────────────────────────────┐    │
│  │  React Overlay Components   │    │
│  │  Voice · Chat · Stats       │    │
│  │  Clips · Stream · Widgets   │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│         Rust Backend                │
│  ProcessMonitor · ClipCapture       │
│  PerformanceOptimizer               │
│  VoiceAssistant · GameDetector      │
├─────────────────────────────────────┤
│         IPC Bridge                  │
│  Electron ↔ Rust communication      │
└─────────────────────────────────────┘
```

### Services concernés

```
gamemode-service          → État Game Mode, préférences
clip-service              → Capture, stockage, partage clips
streaming-service         → Diffusion RTMP/WebRTC
gaming-presence-service   → Statut en jeu (partagé avec Gaming Hub)
achievement-service       → Achievements et niveaux
```

### Stack technique

| Composant | Technologie |
|-----------|-------------|
| Overlay UI | React (Electron renderer) |
| Process Monitor | Rust (sysinfo crate) |
| Clip Capture | Rust + FFmpeg (GPU-accelerated) |
| Voice Assistant | WebSpeech API / Whisper |
| Performance Monitor | Rust (system metrics) |
| Streaming | RTMP via FFmpeg |

---

## 📈 Métriques de succès

| Phase | KPI | Objectif |
|-------|-----|----------|
| Phase 1 | Taux détection automatique | 95% des jeux populaires |
| Phase 2 | Utilisation overlay/session | 70% des sessions gaming |
| Phase 3 | Impact FPS | < 2% de perte |
| Phase 4 | Clips créés/jour | 2000+ |
| Phase 5 | Commandes vocales réussies | 90% accuracy |
| Phase 6 | Streams lancés depuis overlay | 500+/mois |
| Phase 7 | Achievements débloqués/utilisateur | 10+ en moyenne |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| Gaming Hub (ROADMAP_GAMING_HUB) | Partage présence, profil, social |
| Game Launcher (ROADMAP_GAME_LAUNCHER) | Détection de jeux, bibliothèque |
| `desktop-app` | Fenêtre overlay Electron |
| `platform-core` | Services backend |
| `shared-types` | Types Game Mode |
| `ui-kit` | Composants overlay |
| Calls & RTC | Voice chat overlay |
| IA Assistant | Assistant vocal, coaching |
