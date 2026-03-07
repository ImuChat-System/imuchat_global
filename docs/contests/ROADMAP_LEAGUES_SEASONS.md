# 🏟 Roadmap — Ligues, Saisons & Classements ImuArena

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Implémenter le système de progression compétitive d'ImuArena (rangs, ligues, saisons, divisions, classements, récompenses de saison)

---

## 📊 Vue d'ensemble des phases

| Phase | Nom | Durée | Priorité | Dépendances |
|-------|-----|-------|----------|-------------|
| **Phase 1** | Fondations Ranking | 3 sprints | P0 | ROADMAP_IMUARENA_HUB Phase 1-2 |
| **Phase 2** | Saisons & cycles | 3 sprints | P0 | Phase 1 |
| **Phase 3** | Classements multi-niveaux | 3 sprints | P1 | Phase 2 |
| **Phase 4** | Divisions & promotion/relégation | 2 sprints | P1 | Phase 3 |
| **Phase 5** | Récompenses de saison | 3 sprints | P2 | Phase 2 |
| **Phase 6** | Compétitions d'équipes & guildes | 3 sprints | P2 | Phase 3, Guildes (Gaming Hub) |

---

## 🏗️ Phase 1 — Fondations Ranking (Sprints 1-3)

### Objectif
Système de points, rangs et profil compétitif.

### Sprint 1 — Modèle de données & types ranking

- [ ] Types dans `@imuchat/shared-types`
  - `ArenaRank` (Bronze → Légende), `RankPoints`, `RankHistory`
  - `ArenaSeason`, `SeasonStatus`, `SeasonReward`
  - `LeaderboardEntry`, `LeaderboardScope` (global, country, category, friends)
  - `Division`, `PromotionEvent`, `RelegationEvent`
- [ ] Schéma Supabase `supabase_arena_ranking.sql`
  - Tables :
    - `user_arena_rank` — rang global et par catégorie
    - `arena_seasons` — définition des saisons
    - `arena_season_results` — résultats de fin de saison par utilisateur
    - `arena_divisions` — divisions pour les ligues compétitives
    - `rank_history` — historique de progression
    - `rank_transactions` — log de chaque gain/perte de points
  - Indexes optimisés pour les requêtes leaderboard (points DESC, category, country)
  - Vue matérialisée : `leaderboard_global_view`, `leaderboard_category_view`

### Sprint 2 — Ranking Service (platform-core)

- [ ] `ArenaRankingModule` dans `@imuchat/platform-core`
  - `RankingService`
    - Calcul et attribution de points après chaque concours
    - Table de points configurable :
      ```
      participation     : +10 à +50 (selon taille du concours)
      top 50%           : +25 à +100
      top 10            : +100 à +300
      victoire          : +200 à +500
      vote communautaire: +5
      organisation      : +50 à +200
      streak 7 jours    : +100 bonus
      ```
    - Détermination du rang basée sur les points cumulés
    - Gestion de la décomposition de points (inactivité 30j → -50/mois)
  - `RankTransitionService`
    - Détection de changement de rang (promotion/démotion)
    - Notifications : "Félicitations ! Vous êtes maintenant Or 🥇"
    - Animations de transition de rang côté frontend
  - `RankHistoryService`
    - Enregistrement de chaque changement de points
    - Graphe de progression dans le temps
- [ ] Tests unitaires (90%+ coverage)

### Sprint 3 — API Ranking & Profil Arena

- [ ] Endpoints API :
  - `GET /api/arena/rank/:userId` — Rang d'un utilisateur (global + par catégorie)
  - `GET /api/arena/rank/:userId/history` — Historique de progression
  - `GET /api/arena/rank/:userId/stats` — Statistiques (participations, victoires, streaks)
  - `GET /api/arena/rank/:userId/badges` — Badges et trophées obtenus
- [ ] Écran `ArenaProfile` — profil compétitif
  - Rang actuel (global + par catégorie) avec icône
  - Graphe de progression sur la saison
  - Stats clés : participations, victoires, meilleur classement
  - Badges et trophées
  - Historique des concours récents
- [ ] Composants UI : `RankBadge`, `RankProgressBar`, `PointsChart`, `StatsGrid`
- [ ] Widget mini-rang dans le profil ImuChat principal

### Livrables Phase 1
- ✅ Système de points et de rangs
- ✅ Service de ranking dans platform-core
- ✅ Profil Arena avec progression
- ✅ Historique et statistiques

---

## 📆 Phase 2 — Saisons & Cycles (Sprints 4-6)

### Objectif
Implémenter le système de saisons trimestrielles avec cycle complet (placement → saison active → finales → reset).

### Sprint 4 — Infrastructure saisons

- [ ] `ArenaSeasonService`
  - CRUD saisons (création par les admins ImuChat)
  - Configuration de saison :
    ```
    nom, thème, dates (début/fin)
    phases : placement (2 sem), active (8 sem), finales (1 sem), résultats (1 sem)
    récompenses par rang
    règles spéciales de la saison
    ```
  - Gestion automatique des transitions de phase
  - Cron job : vérification quotidienne des transitions
- [ ] 4 saisons par an :
  - Saison 1 — Éveil (Jan-Mars)
  - Saison 2 — Flamme (Avr-Juin)
  - Saison 3 — Horizon (Juil-Sept)
  - Saison 4 — Légende (Oct-Déc)
- [ ] Soft reset de fin de saison
  - Points divisés par 2
  - Rang recalculé
  - Historique archivé

### Sprint 5 — Phase de placement

- [ ] Matchs de calibration en début de saison
  - 5-10 concours de placement
  - Le système évalue le niveau initial
  - Attribution d'un rang de départ basé sur la performance
- [ ] Écran `SeasonPlacement`
  - Progression des matchs de placement (X/10)
  - Résultat estimé en temps réel
  - Révélation du rang de placement (animation)
- [ ] Bonus "First blood" : XP doublé pendant la phase de placement

### Sprint 6 — Écran Saison & rétrospective

- [ ] Écran `SeasonOverview` — saison en cours
  - Bannière de saison avec thème visuel
  - Calendrier des événements de la saison
  - Ma progression dans la saison (rang, points, objectifs)
  - Concours phares de la saison
  - Countdown vers les finales
- [ ] Écran `SeasonRetrospective` — bilan de fin de saison
  - Type "Spotify Wrapped" :
    - Nombre de concours participés
    - Rang atteint
    - Meilleure performance
    - Catégorie la plus active
    - Comparaison avec la saison précédente
  - Partageable sur les réseaux / dans les chats
- [ ] Composants : `SeasonBanner`, `SeasonCalendar`, `SeasonProgress`, `RetrospectiveCard`

### Livrables Phase 2
- ✅ Système de saisons trimestrielles
- ✅ Phase de placement avec calibration
- ✅ Soft reset de fin de saison
- ✅ Écran saison & rétrospective "Wrapped"

---

## 📊 Phase 3 — Classements Multi-niveaux (Sprints 7-9)

### Objectif
Classements riches : global, par catégorie, par pays, entre amis, hebdomadaire.

### Sprint 7 — Classement global & par catégorie

- [ ] `LeaderboardService`
  - Calcul des classements (mise à jour en temps réel ou near-real-time)
  - Scopes :
    - Global — tous les utilisateurs
    - Par catégorie — Gaming, Creative, Tech, Story, Knowledge, Visual
  - Pagination performante (curseurs, pas d'offset)
  - Cache Redis pour les top 100 (invalidation sur changement)
- [ ] API :
  - `GET /api/arena/leaderboard?scope=global&page=1`
  - `GET /api/arena/leaderboard?scope=category&category=gaming`
  - `GET /api/arena/leaderboard?scope=global&around=userId` (mon voisinage)
- [ ] Écran `Leaderboard` — classement principal
  - Onglets : Global, Gaming, Creative, Tech, Story, Knowledge, Visual
  - Top 3 avec podium visuel
  - Table scrollable avec rang, avatar, nom, points, variation (+/-) 
  - Mon rang mis en surbrillance
  - "Voir autour de moi" — afficher les 10 joueurs autour de mon rang

### Sprint 8 — Classements géographiques & sociaux

- [ ] Classement par pays
  - Basé sur le pays de l'utilisateur (profil)
  - Classement national avec drapeau
  - Top pays (classement des pays par points cumulés des membres)
- [ ] Classement entre amis
  - Classement parmi mes contacts ImuChat
  - Notifications : "Lucas t'a dépassé dans le classement !"
  - Widget "Classement amis" sur l'Arena Home
- [ ] Classement hebdomadaire
  - Reset chaque lundi
  - Récompenses pour le top 3 de la semaine
  - Points de la semaine uniquement
- [ ] Composants : `CountryLeaderboard`, `FriendsLeaderboard`, `WeeklyLeaderboard`

### Sprint 9 — Classement all-time & animations

- [ ] Classement all-time
  - Historique complet, jamais reset
  - Hall of Fame permanent
  - Récompenses spéciales pour les milestones (top 100 all-time, etc.)
- [ ] Animations de classement
  - Animation de montée/descente de rang
  - Effet visuel quand on entre dans le top 10/100/1000
  - Confetti / effets spéciaux pour les promotions de rang
- [ ] Notifications de classement
  - "Tu es maintenant #42 mondial !"
  - "Tu as atteint le top 100 en Creative !"
  - Push digest hebdomadaire : résumé de ta progression
- [ ] WebSocket pour le leaderboard live pendant les finales

### Livrables Phase 3
- ✅ Classements global, par catégorie, par pays
- ✅ Classement amis et hebdomadaire
- ✅ Classement all-time & Hall of Fame
- ✅ Animations et notifications de progression

---

## 🔄 Phase 4 — Divisions & Promotion/Relégation (Sprints 10-11)

### Objectif
Système de divisions pour les ligues les plus compétitives, avec promotion et relégation.

### Sprint 10 — Système de divisions

- [ ] `DivisionService`
  - Divisions par catégorie (Gaming, Tech principalement) :
    ```
    Division 1     → Top 10 joueurs/équipes
    Division 2     → Rang 11-30
    Division 3     → Rang 31-100
    Open           → Tous les autres
    ```
  - Certains concours réservés à certaines divisions
    - "Concours Division 1 uniquement" — haut niveau
    - "Open" — ouvert à tous
  - Bonus de points pour les concours de division supérieure
- [ ] Écran `DivisionView`
  - Ma division actuelle
  - Les joueurs de ma division (classement interne)
  - Concours de division disponibles
  - Zone de promotion/relégation mise en évidence

### Sprint 11 — Promotion, relégation & playoffs

- [ ] Promotion / relégation en fin de saison
  - Top 3 d'une division → monte dans la division supérieure
  - Derniers 3 d'une division → descend
  - Rang 4-6 du bas → playoffs de barrage
- [ ] Playoffs de barrage
  - Concours spéciaux entre les joueurs en zone de barrage
  - Le gagnant reste, le perdant descend
  - Format : meilleur de 3 concours
- [ ] Écran `PromotionCeremony`
  - Animation spéciale de promotion
  - Récapitulatif de la saison dans la division
- [ ] Notifications : "Félicitations, tu montes en Division 2 !"
- [ ] Historique de divisions dans le profil Arena

### Livrables Phase 4
- ✅ Système de 4 divisions par catégorie
- ✅ Promotion/relégation automatique
- ✅ Playoffs de barrage
- ✅ Animations de promotion

---

## 🎁 Phase 5 — Récompenses de Saison (Sprints 12-14)

### Objectif
Système de récompenses qui motive la progression et célèbre les accomplissements.

### Sprint 12 — Battle Pass de saison

- [ ] `SeasonRewardService`
  - Battle Pass gratuit (récompenses de base pour la progression)
  - Battle Pass premium (récompenses exclusives, optionnel payant)
  - Paliers de progression (30-50 niveaux par saison)
    ```
    Niveau 1  → Badge participant
    Niveau 5  → 50 ImuCoins
    Niveau 10 → Sticker pack saison
    Niveau 15 → Frame profil saison
    Niveau 20 → Emote exclusif
    Niveau 25 → Thème ImuChat saison
    Niveau 30 → Avatar exclusif
    Niveau 40 → Titre "Champion Saison X"
    Niveau 50 → Trophée légendaire + effet profil
    ```
  - XP de saison gagné par : participation, victoires, défis quotidiens, streaks
- [ ] Écran `SeasonPass`
  - Chemin visuel de progression (paliers)
  - Récompenses débloquées / à venir
  - XP de saison actuel et requis
  - Bouton "Réclamer" pour chaque palier atteint

### Sprint 13 — Récompenses de rang

- [ ] Récompenses automatiques par rang atteint en fin de saison
  - Bronze : Badge de saison
  - Argent : Badge + frame profil
  - Or : Badge + frame + thème exclusif
  - Platine : + emotes exclusifs
  - Diamant : + titre spécial ("Diamant S1 2026")
  - Légende : + avatar exclusif + nom dans le Hall of Fame
- [ ] Trophées de catégorie
  - Trophée "Meilleur Artiste Saison X"
  - Trophée "Champion Gaming Saison X"
  - Trophée "Innovateur Tech Saison X"
  - Affichés dans le profil Arena
- [ ] Écran `TrophyCase` — vitrine de trophées
  - Collection de tous les trophées et badges
  - Rareté affichée (% de joueurs ayant ce trophée)
  - Tri par saison, catégorie, rareté

### Sprint 14 — Streaks & défis quotidiens

- [ ] `DailyChallengeService`
  - Défis quotidiens générés par l'IA (cf. ROADMAP_IMUARENA_HUB Phase 7)
  - Bonus XP pour complétion
  - Streak de participation (jours consécutifs)
    - 7 jours : +100 points bonus
    - 30 jours : +500 points + badge "Assidu"
    - 100 jours : +2000 points + badge "Légende de la constance"
  - Compteur de streak visible sur le profil
- [ ] Écran `DailyChallenges`
  - Défi du jour (personnalisé par catégorie)
  - Streak actuel et record
  - Calendrier de participation (type GitHub contributions)
- [ ] Notifications : "Ton streak de 7 jours ! +100 points bonus 🔥"

### Livrables Phase 5
- ✅ Battle Pass de saison (gratuit + premium)
- ✅ Récompenses de rang automatiques
- ✅ Trophées et badges collectibles
- ✅ Défis quotidiens avec streaks

---

## 👥 Phase 6 — Compétitions d'Équipes & Guildes (Sprints 15-17)

### Objectif
Étendre le système de ligues aux équipes et guildes pour des compétitions inter-groupes.

### Sprint 15 — Classement d'équipes

- [ ] `TeamRankingService`
  - Classement d'équipes : somme pondérée des points des membres actifs
  - Bonus pour les concours faits en équipe
  - Rang de guilde (mêmes rangs Bronze → Légende)
- [ ] Écran `TeamLeaderboard`
  - Classement des guildes et équipes
  - Détail d'une équipe : membres, rang collectif, stats
  - Historique des performances d'équipe
- [ ] API : `GET /api/arena/leaderboard/teams`

### Sprint 16 — Concours inter-guildes

- [ ] Concours réservés aux guildes
  - "Guerre de guildes" : 2 guildes s'affrontent sur une série de concours
  - Classement inter-guildes par saison
  - Trophées de guilde
- [ ] Système d'inscription d'équipe
  - La guilde s'inscrit collectivement
  - Nomination des représentants
  - Roster management (composition d'équipe)
- [ ] Chat d'équipe dédié pendant la compétition

### Sprint 17 — Ligues inter-communautés & événements

- [ ] Ligues inter-communautés
  - Les serveurs/communautés ImuChat peuvent former des ligues
  - Compétitions régulières entre communautés
  - Classement des communautés
- [ ] Événements spéciaux équipes
  - "All-Star" — les meilleurs joueurs de chaque guilde dans un tournoi
  - "Draft" — les capitaines d'équipe choisissent leurs joueurs
  - "Relay Challenge" — concours en relais (chaque membre fait une partie)
- [ ] Récapitulatif d'équipe en fin de saison
  - MVP de la guilde
  - Stats collectives
  - Progression par rapport à la saison précédente

### Livrables Phase 6
- ✅ Classement d'équipes et guildes
- ✅ Concours inter-guildes ("guerres")
- ✅ Ligues inter-communautés
- ✅ Événements spéciaux (All-Star, Draft, Relay)

---

## 📈 Métriques de succès par phase

| Phase | KPI principal | Objectif |
|-------|--------------|----------|
| Phase 1 | Profils Arena créés | 50% des participants |
| Phase 2 | Complétion de saison (12 semaines actif) | 30% des inscrits |
| Phase 3 | Consultations leaderboard/jour | 5 000+ |
| Phase 4 | Matchs de playoffs joués | 100+ par saison |
| Phase 5 | Battle Pass complétés | 20% des participants |
| Phase 6 | Guildes actives en Arena | 200+ |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| ROADMAP_IMUARENA_HUB | Concours de base (participation, votes, résultats) |
| `platform-core` | ArenaRankingModule |
| `shared-types` | Types ranking/saison/division |
| `ui-kit` | Composants leaderboard, badges, animations |
| Gaming Hub — Guildes | Classement et concours inter-guildes |
| Wallet Core | Récompenses ImuCoins |
| IA Assistant | Défis quotidiens personnalisés |
| Notifications | Alertes de progression, streaks, promotions |
