# 🎮 Roadmap — ImuChat Gaming Hub

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Implémenter l'espace Gaming central d'ImuChat (communautés, guildes, mini-jeux, streaming, tournois)

---

## 📊 Vue d'ensemble des phases

| Phase | Nom | Durée estimée | Priorité | Dépendances |
|-------|-----|---------------|----------|-------------|
| **Phase 1** | Fondations Gaming | 4 sprints | P0 | platform-core, shared-types |
| **Phase 2** | Social Gaming | 4 sprints | P0 | Phase 1 |
| **Phase 3** | Guildes & Communautés | 3 sprints | P1 | Phase 2 |
| **Phase 4** | Voice Chat Gaming | 3 sprints | P1 | Phase 2, Calls & RTC |
| **Phase 5** | Mini-jeux intégrés | 4 sprints | P2 | Phase 2 |
| **Phase 6** | Streaming & Watch | 3 sprints | P2 | Phase 4 |
| **Phase 7** | Tournois & Esports | 4 sprints | P2 | Phase 3 |
| **Phase 8** | IA Gaming & Recommandations | 3 sprints | P3 | Phase 2, IA Assistant |
| **Phase 9** | Gaming Store & Personnalisation | 2 sprints | P3 | Phase 5, Store Core |

---

## 🏗️ Phase 1 — Fondations Gaming (Sprints 1-4)

### Objectif

Mettre en place l'architecture technique du Gaming Hub, les types partagés, les services backend et l'écran d'accueil.

### Sprint 1 — Types & modèles de données

- [ ] Définir les types Gaming dans `@imuchat/shared-types`
  - `GamingProfile`, `Game`, `Guild`, `Tournament`, `GamingSession`
  - `GamingPresence`, `PartyGroup`, `GamingEvent`
- [ ] Créer le schéma Supabase `supabase_gaming.sql`
  - Tables : `gaming_profiles`, `games`, `user_games`, `gaming_sessions`
  - Tables : `guilds`, `guild_members`, `tournaments`, `tournament_participants`
  - Policies RLS pour chaque table
- [ ] Ajouter migrations et seed data

### Sprint 2 — Gaming Service (platform-core)

- [ ] Créer `GamingModule` dans `@imuchat/platform-core`
  - `GamingService` — CRUD profils gaming, bibliothèque de jeux
  - `GamingPresenceService` — détection statut "en jeu"
  - `GamingEventBus` — événements gaming temps réel
- [ ] Tests unitaires (objectif : 90% coverage)
- [ ] Intégration avec `PresenceModule` existant

### Sprint 3 — API Gaming

- [ ] Endpoints REST/API :
  - `GET /api/gaming/profile/:userId`
  - `GET /api/gaming/friends-playing`
  - `GET /api/gaming/games/discover`
  - `POST /api/gaming/profile/update`
  - `GET /api/gaming/events`
- [ ] Middleware d'authentification gaming
- [ ] Rate limiting sur les endpoints publics
- [ ] Documentation OpenAPI

### Sprint 4 — Écran Gaming Home (Frontend)

- [ ] Composant `GamingHub` — page d'accueil Gaming
- [ ] Section `FriendsPlaying` — amis actuellement en jeu
- [ ] Section `DiscoverGames` — jeux populaires & recommandés
- [ ] Section `GamingEvents` — événements à venir
- [ ] Navigation onglet Gaming dans la barre principale
- [ ] Responsive : web, mobile, desktop
- [ ] Composants UI dans `@imuchat/ui-kit` : `GameCard`, `PlayerStatus`, `GamingNav`

### Livrables Phase 1

- ✅ Types partagés Gaming
- ✅ Schéma BDD Gaming
- ✅ GamingModule dans platform-core
- ✅ API Gaming fonctionnelle
- ✅ Écran Gaming Home sur toutes les plateformes

---

## 👥 Phase 2 — Social Gaming (Sprints 5-8)

### Objectif

Ajouter les fonctionnalités sociales gaming : profils enrichis, statuts, amis gaming, party system.

### Sprint 5 — Profils Gaming

- [ ] Écran `GamingProfile` — profil gaming d'un utilisateur
  - Jeux favoris, statistiques, rang, badges
- [ ] Composant `GameStats` — visualisation des statistiques
- [ ] Composant `GamingBadges` — badges et achievements
- [ ] Lien profil gaming ↔ profil principal ImuChat
- [ ] API : `GET /api/gaming/profile/:id/stats`

### Sprint 6 — Connexion plateformes externes

- [ ] Service `PlatformConnector` — connexion comptes externes
  - Steam (OAuth + API)
  - PlayStation Network
  - Xbox Live
  - Epic Games
  - Riot Games
- [ ] Import bibliothèque de jeux depuis plateformes
- [ ] Écran `ConnectPlatforms` — gestion des comptes liés
- [ ] Synchronisation statuts cross-platform

### Sprint 7 — Friends Playing & Présence Gaming

- [ ] `GamingPresenceService` amélioré
  - Détection jeu en cours (WebSocket)
  - Durée de session
  - Statut libre / en partie / en recherche
- [ ] Écran `FriendsPlaying` détaillé
  - Voir le jeu de chaque ami
  - Boutons Join / Invite / Watch
- [ ] Notifications : "Lucas joue à Valorant"

### Sprint 8 — Party System

- [ ] Service `PartyService`
  - Créer / rejoindre un groupe
  - Inviter des amis
  - Chat de groupe gaming
- [ ] Écran `PartyLobby` — lobby d'équipe
- [ ] Intégration vocal (preview Phase 4)
- [ ] API : `POST /api/gaming/party/create`, `POST /api/gaming/party/join`

### Livrables Phase 2

- ✅ Profils gaming enrichis
- ✅ Connexion aux plateformes externes
- ✅ Système de présence gaming temps réel
- ✅ Party system fonctionnel

---

## 🏰 Phase 3 — Guildes & Communautés (Sprints 9-11)

### Objectif

Système de guildes/clans inspiré de Discord et des MMO.

### Sprint 9 — CRUD Guildes

- [ ] Service `GuildService`
  - Création / modification / suppression
  - Système de rôles (leader, officier, modérateur, membre)
  - Gestion membre (invite, kick, ban)
- [ ] Schéma BDD : `guilds`, `guild_roles`, `guild_members`, `guild_settings`
- [ ] API : CRUD complet guildes

### Sprint 10 — Interface Guildes

- [ ] Écran `GuildList` — découvrir et rechercher des guildes
- [ ] Écran `GuildDetail` — page d'une guilde
  - Chat dédié
  - Liste des membres et rôles
  - Événements de la guilde
- [ ] Écran `GuildSettings` — paramètres de la guilde
- [ ] Composants : `GuildCard`, `MemberList`, `RoleManager`

### Sprint 11 — Fonctionnalités avancées guildes

- [ ] Calendrier d'événements de guilde
- [ ] Roster management (compositions d'équipe)
- [ ] Classement interne de guilde
- [ ] Système d'annonces guilde
- [ ] Channels thématiques dans la guilde (type Discord)

### Livrables Phase 3

- ✅ Système de guildes complet (CRUD + rôles)
- ✅ Interface guildes multi-plateforme
- ✅ Calendrier, roster, classements internes

---

## 🎙 Phase 4 — Voice Chat Gaming (Sprints 12-14)

### Objectif

Voice chat optimisé pour le gaming avec salons persistants et features avancées.

### Sprint 12 — Infrastructure vocale gaming

- [ ] Service `GamingVoiceService` (basé sur WebRTC + SFU)
- [ ] Salons vocaux persistants (type Discord)
- [ ] Qualité audio optimisée gaming (low latency)
- [ ] Architecture SFU pour groupes > 2 personnes

### Sprint 13 — Features vocales gaming

- [ ] Push-to-talk (configurable par touche)
- [ ] Réduction de bruit IA (suppression clavier/ventilateur)
- [ ] Volume individuel par participant
- [ ] Indicateur visuel "qui parle"
- [ ] Détection automatique de micro

### Sprint 14 — Overlay vocal (Desktop)

- [ ] Mini-overlay vocal (widget flottant desktop)
- [ ] Intégration avec le Party System
- [ ] Ouverture automatique du vocal au lancement d'un jeu
- [ ] Soundboard gaming (sons personnalisés)
- [ ] Tests de latence et qualité audio

### Livrables Phase 4

- ✅ Voice chat gaming WebRTC fonctionnel
- ✅ Push-to-talk + noise cancellation
- ✅ Salons vocaux persistants
- ✅ Overlay vocal desktop

---

## 🕹 Phase 5 — Mini-jeux intégrés (Sprints 15-18)

### Objectif

Mini-jeux sociaux jouables directement dans ImuChat (type Discord Activities).

### Sprint 15 — SDK & Framework mini-jeux

- [ ] Créer `MiniGameSDK` — framework pour développer des mini-jeux
  - API de communication (scores, joueurs, événements)
  - Sandbox d'exécution sécurisé (iframe / WebView)
  - Système de state synchronisé temps réel
- [ ] Documentation SDK pour développeurs tiers

### Sprint 16 — Mini-jeux natifs (lot 1)

- [ ] Quiz Gaming — quiz thématique jeux vidéo
- [ ] Dessin & Devinette — type Pictionary
- [ ] Memory Match — jeu de mémoire multijoueur
- [ ] Intégration dans les conversations (bouton "Jouer")

### Sprint 17 — Mini-jeux natifs (lot 2)

- [ ] Mini Battle Royale 2D — top-down shooter simplifié
- [ ] Course de typing — vitesse de frappe
- [ ] Trivia coop — questions à répondre en équipe
- [ ] Classements et scores

### Sprint 18 — Marketplace mini-jeux

- [ ] Intégration au Store ImuChat
- [ ] Système de publication de mini-jeux par des développeurs tiers
- [ ] Review & modération des mini-jeux
- [ ] Système de notation et avis

### Livrables Phase 5

- ✅ SDK mini-jeux documenté
- ✅ 6+ mini-jeux natifs
- ✅ Mini-jeux jouables dans les conversations
- ✅ Marketplace mini-jeux dans le Store

---

## 📺 Phase 6 — Streaming & Watch (Sprints 19-21)

### Objectif

Streaming gaming et watch parties intégrés à ImuChat.

### Sprint 19 — Streaming natif ImuChat

- [ ] Service `StreamingService`
  - Capture d'écran / fenêtre de jeu
  - Encodage et diffusion en direct
  - Protocole : WebRTC ou HLS
- [ ] Écran `StreamView` — regarder un stream
- [ ] Chat en direct sur le stream

### Sprint 20 — Watch Parties

- [ ] Fonctionnalité "Regarder ensemble"
  - Synchronisation vidéo/stream entre participants
  - Réactions en temps réel
  - Voice chat pendant le visionnage
- [ ] Intégration avec les plateformes externes (Twitch, YouTube)
- [ ] Écran `WatchParty` — interface watch party

### Sprint 21 — Clips & Replays

- [ ] Système de clips gaming
  - Sauvegarder les dernières 30s / 1min / 5min
  - Édition basique (trim, texte)
- [ ] Galerie de clips personnelle
- [ ] Partage de clips dans le chat et les communautés
- [ ] Fil de clips gaming (feed)

### Livrables Phase 6

- ✅ Streaming natif fonctionnel
- ✅ Watch parties synchronisées
- ✅ Système de clips gaming

---

## 🏆 Phase 7 — Tournois & Esports (Sprints 22-25)

### Objectif

Plateforme de tournois communautaires et compétitions esports.

### Sprint 22 — Infrastructure tournois

- [ ] Service `TournamentService`
  - Création de tournois (admin)
  - Formats : single elimination, double elimination, round robin, Swiss
  - Gestion des inscriptions
- [ ] Schéma BDD : `tournaments`, `brackets`, `matches`, `results`
- [ ] API : CRUD tournois complet

### Sprint 23 — Interface tournois

- [ ] Écran `TournamentList` — découvrir les tournois
- [ ] Écran `TournamentDetail` — page d'un tournoi
  - Bracket interactif
  - Inscriptions / check-in
  - Résultats en direct
- [ ] Écran `TournamentCreate` — créer un tournoi
- [ ] Composants : `BracketView`, `MatchCard`, `Leaderboard`

### Sprint 24 — Matchmaking & compétitif

- [ ] Service `MatchmakingService`
  - Matchmaking basé sur le skill (ELO / MMR)
  - Files d'attente par jeu
  - Équilibrage des équipes
- [ ] Classements par jeu et par saison
- [ ] Système de récompenses (badges, titres, trophées)

### Sprint 25 — Événements esports

- [ ] Calendrier esports global
- [ ] Système de prédictions / pronostics
- [ ] Streams intégrés pour les tournois
- [ ] Statistiques et récaps de tournois
- [ ] Notifications événements esports

### Livrables Phase 7

- ✅ Plateforme de tournois multi-format
- ✅ Bracket interactif
- ✅ Matchmaking compétitif ELO/MMR
- ✅ Calendrier esports

---

## 🤖 Phase 8 — IA Gaming & Recommandations (Sprints 26-28)

### Objectif

Intelligence artificielle au service du joueur : recommandations, coaching, matchmaking social.

### Sprint 26 — Recommandations IA

- [ ] Service `GamingRecommendationService`
  - Recommandation de jeux basée sur l'historique
  - "Tes amis jouent à X" — suggestions sociales
  - Découverte de jeux similaires
- [ ] Modèle de recommandation (collaborative filtering)
- [ ] Intégration dans l'écran Discover

### Sprint 27 — Matchmaking social IA

- [ ] Trouver des coéquipiers compatibles
  - Basé sur : jeux, horaires, niveau, style de jeu
- [ ] Suggestions d'équipes équilibrées
- [ ] Écran `FindTeammates` — trouver des joueurs
- [ ] Notifications proactives : "3 amis jouent souvent à X avec toi"

### Sprint 28 — Coaching IA

- [ ] Analyse de performances (pour jeux compétitifs)
  - Stats par session, tendances
  - Conseils stratégiques contextuels
- [ ] Assistant vocal IA gaming
  - "Hey Imu, invite Lucas"
  - "Hey Imu, mute everyone"
- [ ] Résumés post-session

### Livrables Phase 8

- ✅ Recommandations de jeux par IA
- ✅ Matchmaking social intelligent
- ✅ Coaching IA et assistant vocal gaming

---

## 🛍 Phase 9 — Gaming Store & Personnalisation (Sprints 29-30)

### Objectif

Section gaming dans le Store ImuChat et personnalisation gaming complète.

### Sprint 29 — Gaming Store

- [ ] Section Gaming dans le Store ImuChat
  - Mini-jeux installables
  - Bots gaming
  - Extensions gaming (stats trackers, overlays)
- [ ] Système de skins/avatars gaming
- [ ] Monnaie in-app pour achats gaming

### Sprint 30 — Personnalisation Gaming

- [ ] Thèmes gaming pour ImuChat
  - Cyberpunk, Pixel Art, Retro Arcade, Néon, Esports
- [ ] Avatars gaming (cosplay, skins esports)
- [ ] Badges et achievements gaming
- [ ] Personnalisation du profil gaming (bannière, couleurs, emotes)

### Livrables Phase 9

- ✅ Section Gaming dans le Store
- ✅ Thèmes et skins gaming
- ✅ Système de personnalisation complet

---

## 📈 Métriques de succès par phase

| Phase | KPI principal | Objectif |
|-------|--------------|----------|
| Phase 1 | Gaming Hub accessible | 100% plateformes |
| Phase 2 | Profils gaming créés | 30% des utilisateurs actifs |
| Phase 3 | Guildes créées | 500+ guildes actives |
| Phase 4 | Sessions vocales gaming/jour | 1000+ |
| Phase 5 | Parties mini-jeux/jour | 5000+ |
| Phase 6 | Heures de streaming/mois | 10 000+ |
| Phase 7 | Tournois organisés/mois | 200+ |
| Phase 8 | Taux adoption recommandations IA | 40% |
| Phase 9 | Ventes Gaming Store/mois | 1000+ transactions |

---

## 🔗 Dépendances avec le monorepo ImuChat

| Module existant | Utilisation Gaming |
|----------------|-------------------|
| `platform-core` | GamingModule hébergé ici |
| `shared-types` | Types Gaming partagés |
| `ui-kit` | Composants UI gaming |
| `Calls & RTC` | Voice chat gaming (Phase 4) |
| `Store Core` | Marketplace mini-jeux (Phase 5, 9) |
| `IA Assistant` | Recommandations & coaching (Phase 8) |
| `Presence` | Gaming presence |
| `Notifications` | Alertes gaming |
