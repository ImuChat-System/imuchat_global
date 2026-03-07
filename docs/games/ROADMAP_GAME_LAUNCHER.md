# 🎮 Roadmap — Game Launcher Universel ImuChat

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Implémenter un launcher de jeux universel intégré à ImuChat (bibliothèque unifiée, détection de jeux, connexion multi-plateformes, social intégré)

---

## 📊 Vue d'ensemble des phases

| Phase | Nom | Durée | Priorité | Plateformes |
|-------|-----|-------|----------|-------------|
| **Phase 1** | Fondations Launcher | 3 sprints | P0 | Desktop |
| **Phase 2** | Détection & bibliothèque | 3 sprints | P0 | Desktop |
| **Phase 3** | Intégration sociale | 3 sprints | P1 | Desktop, Web, Mobile |
| **Phase 4** | Fonctions avancées | 3 sprints | P2 | Desktop |
| **Phase 5** | Personnalisation & Store | 2 sprints | P3 | Toutes |

> ⚠️ **Note :** Le Game Launcher est principalement une fonctionnalité **Desktop** (Electron + Rust). Les versions Web/Mobile se concentrent sur la bibliothèque et le social.

---

## 🏗️ Phase 1 — Fondations Launcher (Sprints 1-3)

### Objectif

Architecture technique du launcher, service backend, types et premier écran.

### Sprint 1 — Types & architecture

- [ ] Définir types dans `@imuchat/shared-types`
  - `GameLibraryEntry`, `InstalledGame`, `GamePlatform`, `LaunchConfig`
  - `GameSession`, `PlayHistory`, `PlatformAccount`
- [ ] Schéma Supabase `supabase_game_launcher.sql`
  - Tables : `game_library`, `installed_games`, `platform_connections`, `play_history`
  - Indexes optimisés pour requêtes fréquentes
- [ ] Architecture microservice :

  ```
  game-library-service
  game-detection-service
  platform-connector-service
  ```

### Sprint 2 — Game Library Service (platform-core)

- [ ] `GameLibraryModule` dans `@imuchat/platform-core`
  - CRUD bibliothèque de jeux utilisateur
  - Agrégation multi-plateformes
  - Historique de jeu et temps de jeu
- [ ] `GameDetectionService` — détection locale de jeux
  - Interface abstraite (implémentation desktop Sprint 4)
- [ ] Tests unitaires (90%+ coverage)

### Sprint 3 — API & Écran bibliothèque de base

- [ ] Endpoints API :
  - `GET /api/launcher/library` — bibliothèque complète
  - `GET /api/launcher/library/recent` — jeux récents
  - `GET /api/launcher/platforms` — plateformes connectées
  - `POST /api/launcher/platforms/connect` — connecter une plateforme
- [ ] Écran `GameLibrary` — bibliothèque de jeux
  - Liste des jeux avec filtres (plateforme, genre, favoris)
  - Tri par récemment joué, nom, plateforme
  - Vue grille / liste
- [ ] Composants UI : `GameLibraryCard`, `PlatformIcon`, `PlaytimeDisplay`

### Livrables Phase 1

- ✅ Types et schéma BDD launcher
- ✅ GameLibraryModule fonctionnel
- ✅ API launcher
- ✅ Écran bibliothèque de base

---

## 🔍 Phase 2 — Détection & Bibliothèque (Sprints 4-6)

### Objectif

Détection automatique des jeux installés, connexion aux plateformes de jeux, lancement de jeux.

### Sprint 4 — Détection de jeux sur Desktop

- [ ] `DesktopGameScanner` (Electron + Rust backend)
  - Scan dossiers Steam (`/steamapps/common/`)
  - Scan dossiers Epic Games
  - Scan registre Windows / plist macOS
  - Scan dossiers Ubisoft, Battle.net, EA
- [ ] Détection automatique au démarrage
- [ ] Rafraîchissement périodique en arrière-plan
- [ ] Mapping jeu détecté → métadonnées (nom, cover, genre)

### Sprint 5 — Connexion plateformes gaming

- [ ] `SteamConnector` — OAuth2 + Steam Web API
  - Import bibliothèque Steam complète
  - Stats de jeu, achievements
  - Statut en ligne Steam
- [ ] `EpicConnector` — Epic Games Store API
  - Import jeux Epic
- [ ] `RiotConnector` — Riot Sign-On
  - Import comptes Valorant, LoL, TFT
- [ ] `XboxConnector` — Xbox Live API
  - Import jeux Xbox / Game Pass
- [ ] Écran `PlatformManager` — gérer les connexions

### Sprint 6 — Lancement de jeux (Desktop)

- [ ] `GameLauncherService` — lancement d'exécutables
  - Résolution du chemin d'exécution
  - Lancement via commande OS
  - Fallback vers le launcher natif (Steam, Epic...)
- [ ] Bouton "Play" fonctionnel sur chaque jeu
- [ ] Détection démarrage/arrêt de jeu
  - Mise à jour présence temps réel
  - Tracking temps de jeu automatique
- [ ] Gestion erreurs de lancement

### Livrables Phase 2

- ✅ Scan automatique des jeux installés
- ✅ Connexion Steam, Epic, Riot, Xbox
- ✅ Lancement de jeux depuis ImuChat
- ✅ Tracking temps de jeu automatique

---

## 👥 Phase 3 — Intégration Sociale (Sprints 7-9)

### Objectif

Fusionner le launcher avec les fonctionnalités sociales d'ImuChat.

### Sprint 7 — Friends Playing dans le Launcher

- [ ] Widget `FriendsPlayingLauncher`
  - Affichage des amis en jeu dans la bibliothèque
  - "5 amis jouent à Valorant"
  - Quick join / invite depuis la bibliothèque
- [ ] `GameActivityFeed` — fil d'activité gaming
  - "Nathan a débloqué un achievement dans Elden Ring"
  - "Lucas a commencé une partie de Minecraft"
- [ ] Notifications de lancement
  - "Emma vient de lancer Apex — Rejoindre ?"

### Sprint 8 — Party System dans le Launcher

- [ ] Intégration Party System (depuis Gaming Hub)
  - Créer un groupe depuis la bibliothèque
  - "Jouer ensemble à [jeu]"
- [ ] Lobby pré-partie
  - Chat texte + vocal
  - Prêt / Pas prêt
  - Lancement synchronisé
- [ ] Invitations in-game (deep links quand supporté)

### Sprint 9 — Profil & Statistiques dans le Launcher

- [ ] Section stats dans la GameLibrary
  - Temps de jeu total par jeu
  - Graphique d'activité (heures/jour, jours/semaine)
  - Achievements cross-plateformes
- [ ] Comparaison de stats entre amis
- [ ] "Year in Gaming" — récapitulatif annuel (type Spotify Wrapped)
- [ ] Export de stats

### Livrables Phase 3

- ✅ Friends playing intégré au launcher
- ✅ Party system + lobby depuis le launcher
- ✅ Statistiques et graphiques de jeu

---

## ⚡ Phase 4 — Fonctions Avancées (Sprints 10-12)

### Objectif

Fonctionnalités avancées du launcher : téléchargement, mises à jour, performances.

### Sprint 10 — Gestion des mises à jour

- [ ] Détection de mises à jour disponibles (via API plateformes)
- [ ] Notifications de mises à jour de jeux
- [ ] Lien direct vers la mise à jour (redirection launcher natif)
- [ ] Historique des changements de jeu

### Sprint 11 — Catégorisation & organisation

- [ ] Collections personnalisées (ex: "Jeux coop", "À finir")
- [ ] Tags et catégories automatiques (genre, multijoueur, solo)
- [ ] Système de favoris et épinglage
- [ ] Recherche avancée dans la bibliothèque
  - Filtres : plateforme, genre, multijoueur, temps de jeu
- [ ] Tri intelligent : "Jeux que tes amis jouent en ce moment"

### Sprint 12 — Performance & optimisation (Desktop)

- [ ] Mode performance au lancement d'un jeu
  - Libération RAM
  - Réduction processus ImuChat en arrière-plan
  - Désactivation modules lourds
- [ ] Monitoring performances (FPS, CPU, RAM) en overlay léger
- [ ] Optimisations Rust pour le scan et la détection
- [ ] Cache intelligent des métadonnées

### Livrables Phase 4

- ✅ Notifications de mises à jour
- ✅ Collections et organisation avancée
- ✅ Mode performance desktop

---

## 🎨 Phase 5 — Personnalisation & Store (Sprints 13-14)

### Objectif

Thèmes du launcher, personnalisation et intégration Store.

### Sprint 13 — Thèmes Launcher

- [ ] Système de thèmes pour le launcher
  - Thème Cyberpunk
  - Thème Pixel Art / Retro
  - Thème Neon
  - Thème Esports minimal
- [ ] Personnalisation bannière profil gaming
- [ ] Backgrounds dynamiques (basés sur le jeu sélectionné)

### Sprint 14 — Intégration Store & Extensions

- [ ] Extensions launcher dans le Store ImuChat
  - Widgets overlay supplémentaires
  - Connecteurs pour plateformes additionnelles
  - Trackers de stats avancés
- [ ] Échange de thèmes entre utilisateurs
- [ ] Wishlist gaming synchronisée

### Livrables Phase 5

- ✅ Thèmes personnalisables pour le launcher
- ✅ Extensions launcher dans le Store
- ✅ Wishlist gaming

---

## 🧱 Architecture technique résumée

### Stack Desktop (Electron + Rust)

```
┌──────────────────────────────────┐
│        Electron UI (React)       │
│  GameLibrary · Launcher · Overlay│
├──────────────────────────────────┤
│        Rust Backend (Tauri)      │
│  GameScanner · ProcessMonitor    │
│  PerformanceManager              │
├──────────────────────────────────┤
│         Node.js Bridge           │
│  IPC · Events · API Client       │
└──────────────────────────────────┘
```

### Services Backend

```
game-library-service     → Gestion bibliothèque unifiée
game-detection-service   → Détection jeux installés
platform-connector       → OAuth + API plateformes
gaming-presence-service  → Statut en jeu temps réel
```

### Événements temps réel (WebSocket)

```
user.game.started        → Un utilisateur lance un jeu
user.game.stopped        → Un utilisateur quitte un jeu
party.lobby.ready        → Lobby prêt à lancer
library.game.added       → Nouveau jeu détecté
```

---

## 📈 Métriques de succès

| Phase | KPI | Objectif |
|-------|-----|----------|
| Phase 1 | Bibliothèque accessible | 100% desktop users |
| Phase 2 | Jeux détectés correctement | 95% des jeux installés |
| Phase 3 | Utilisation sociale launcher | 50% des gamers actifs |
| Phase 4 | Gain performance game mode | < 2% impact FPS |
| Phase 5 | Thèmes installés | 3000+ installations |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| Gaming Hub (ROADMAP_GAMING_HUB) | Partage des types, services, présence |
| `platform-core` | GameLibraryModule |
| `shared-types` | Types gaming launcher |
| `desktop-app` | Client Electron principal |
| `ui-kit` | Composants visuels launcher |
| Store Core | Marketplace extensions |
