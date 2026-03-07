# 🏆 ImuArena — Module Concours & Compétitions d'ImuChat

**Date de création :** 7 mars 2026  
**Version :** 2.0 (document enrichi)  
**Statut :** Vision & Architecture détaillée  
**Auteur :** Équipe ImuChat

---

## 📖 Sommaire

1. [Vision stratégique](#-1-vision-stratégique)
2. [Types de concours](#-2-types-de-concours)
3. [Système de ligues & saisons](#-3-système-de-ligues--saisons)
4. [Économie des concours](#-4-économie-des-concours)
5. [Architecture technique](#-5-architecture-technique)
6. [Écrans & UX](#-6-écrans--ux)
7. [Rôle de l'IA](#-7-rôle-de-lia)
8. [Modération & intégrité](#-8-modération--intégrité)
9. [Événements majeurs](#-9-événements-majeurs)
10. [Impact stratégique](#-10-impact-stratégique)

---

## 🎯 1. Vision stratégique

### Le problème

Les plateformes sociales actuelles (Discord, Telegram, WhatsApp) proposent des discussions et du contenu, mais **aucune n'offre un système natif de compétitions communautaires** couvrant tous les domaines créatifs, gaming, tech et connaissances.

Les solutions existantes sont fragmentées :

- **Gaming compétitif** → nécessite des plateformes tierces (Battlefy, Challonge, FACEIT)
- **Concours créatifs** → organisés manuellement sur Instagram/Twitter avec des hashtags
- **Hackathons** → Devpost, MLH — déconnectés du social
- **Quiz/trivia** → apps isolées (Kahoot, HQ Trivia)

### La solution — ImuArena

ImuArena est le **hub officiel des compétitions d'ImuChat** : une plateforme intégrée permettant à tout utilisateur, communauté ou organisation de créer, participer et gérer des concours dans n'importe quel domaine.

### Positionnement

ImuArena fusionne :

- **L'engagement communautaire** de Discord Events
- **La viralité** des challenges TikTok/Instagram
- **La structure compétitive** de l'e-sport (ligues, classements, saisons)
- **L'économie créative** des plateformes comme DeviantArt/Behance contests
- **La gamification** des systèmes de rang (League of Legends, Valorant)

### Principes fondamentaux

1. **Accessible à tous** — De l'amateur au professionnel, chaque utilisateur peut participer ou organiser
2. **Multi-domaine** — Gaming, art, tech, écriture, quiz, musique, photo, vidéo
3. **Économie intégrée** — Wallet ImuChat, ImuCoins, sponsors, crowdfunding
4. **Progression permanente** — Ligues, saisons, rangs, XP — toujours une raison de revenir
5. **Communautaire d'abord** — Les communautés et guildes sont les moteurs des compétitions
6. **Équitable** — Anti-triche, modération IA, règles transparentes

---

## 🧭 2. Types de concours

ImuArena supporte des compétitions dans **six grandes catégories**, chacune avec ses propres mécaniques, critères de jugement et formats.

---

### 🎮 2.1 Gaming League

Compétitions de jeux vidéo, des mini-jeux ImuChat aux tournois e-sport.

**Formats disponibles :**

| Format | Description | Exemple |
|--------|-------------|---------|
| Tournoi bracket | Élimination directe / double élimination | Tournoi Valorant 5v5 |
| Round Robin | Tous contre tous | League Rocket League |
| Speedrun | Terminer un jeu le plus vite possible | Speedrun Celeste |
| Mini-jeux ImuChat | Compétitions sur les mini-jeux intégrés | Tournoi Quiz Gaming |
| Battle Royale | Dernier debout gagne | Custom Fortnite 100 joueurs |

**Critères de classement :**

- Score / victoires
- Temps d'exécution (speedrun)
- ELO / MMR (matchmaking ranked)

**Intégration avec le Gaming Hub :**

- Utilisation du Party System pour les équipes
- Voice chat automatique pendant les matchs
- Streaming intégré des finales
- Clips automatiques des meilleurs moments

---

### 🎨 2.2 Creative League

Compétitions artistiques et créatives.

**Sous-catégories :**

| Catégorie | Types de soumission | Critères |
|-----------|--------------------|---------|
| **Dessin / Illustration** | Image (PNG, JPG, SVG) | Technique, originalité, thème |
| **Manga / BD** | Images multiples, PDF | Narration, style, mise en page |
| **Animation** | GIF, MP4 (< 60s) | Fluidité, créativité, technique |
| **Musique** | Audio (MP3, WAV, < 5min) | Composition, production, originalité |
| **Montage vidéo** | MP4 (< 3min) | Édition, rythme, impact visuel |
| **Stickers / Emotes** | Pack de stickers (min 5) | Expressivité, qualité, cohérence |
| **Photographie** | Image haute résolution | Composition, éclairage, sujet |
| **Design graphique** | Logos, posters, UI mockups | Esthétique, lisibilité, concept |

**Modes de jugement :**

- **Vote public** — La communauté vote (1 vote par utilisateur)
- **Jury d'experts** — Panel de 3-7 juges spécialisés
- **Vote pondéré** — 60% jury + 40% public
- **Vote par ronde** — Tours éliminatoires avec vote à chaque tour

---

### 💻 2.3 Tech League

Compétitions orientées développement et innovation.

**Formats :**

| Format | Durée | Description |
|--------|-------|-------------|
| **Hackathon** | 24h-72h | Développer un projet complet sur un thème |
| **Mini-app Challenge** | 1-2 semaines | Créer une mini-app ImuChat fonctionnelle |
| **Theme Challenge** | 1 semaine | Créer un thème visuel pour ImuChat |
| **IA Prompt Challenge** | 24h-48h | Créer les meilleurs prompts IA pour un use case |
| **Bug Bounty Contest** | Continu | Trouver et rapporter des bugs (sécurité) |
| **Code Golf** | 2-24h | Résoudre un problème en un minimum de code |

**Critères d'évaluation Tech :**

- Fonctionnalité (ça marche)
- Qualité du code (lisibilité, tests, architecture)
- Innovation (originalité de l'approche)
- UX/Design (pour les apps et thèmes)
- Performance (optimisation)

**Avantage stratégique :** Les hackathons et mini-app challenges alimentent directement l'écosystème ImuChat en générant des thèmes, mini-apps et extensions que les utilisateurs peuvent ensuite installer via le Store.

---

### 📚 2.4 Story League

Compétitions d'écriture et de narration.

**Types :**

| Type | Format | Limite |
|------|--------|--------|
| **Nouvelle / Short Story** | Texte | 1 000 - 10 000 mots |
| **Poésie** | Texte | 50 - 500 mots |
| **Fanfiction** | Texte | 2 000 - 20 000 mots |
| **Storytelling audio** | Audio | 3 - 15 minutes |
| **Micro-fiction** | Texte | 100 - 280 caractères |
| **Scénarisation** | Texte + storyboard | Variable |

**Thèmes possibles :**

- Thème imposé (ex: "Voyage dans le temps")
- Univers ImuChat (écrire dans le lore d'ImuChat)
- Genre imposé (sci-fi, fantasy, horreur, romance)
- Contrainte stylistique (écrire sans la lettre "e", POV inédit)

---

### 🧠 2.5 Knowledge League

Compétitions de connaissances et de culture.

**Formats :**

| Format | Mécanisme | Joueurs |
|--------|-----------|---------|
| **Quiz classique** | QCM, réponse rapide | 1 - 1000 |
| **Duel de culture** | 1v1 questions alternées | 2 |
| **Quiz d'équipe** | Buzzer par équipe | 2-8 équipes |
| **Quiz marathon** | 100+ questions, endurance | Individuel |
| **Quiz thématique** | Catégorie unique (anime, science, Bible...) | Variable |

**Catégories thématiques :**

- Culture générale
- Anime / Manga
- Jeux vidéo
- Science & Tech
- Histoire & Géographie
- Musique
- Cinéma / Séries
- Bible & Spiritualité (option pour communautés chrétiennes)
- ImuChat trivia (connaissance de la plateforme)

---

### 📷 2.6 Visual League

Compétitions visuelles et de création de contenu.

**Types :**

- **Photo Challenge** — Thème + contrainte (ex: "Le mouvement en noir et blanc")
- **Wallpaper Contest** — Créer des fonds d'écran pour ImuChat
- **Avatar Contest** — Créer des avatars 2D/3D
- **UI Design Challenge** — Redesigner un écran d'ImuChat
- **Meme Contest** — Meilleur mème de la communauté

---

## 🏟 3. Système de ligues & saisons

Le système de ligues est **le moteur de rétention principal** d'ImuArena. Il transforme la participation ponctuelle en engagement continu.

---

### 3.1 Les rangs ImuArena

Chaque utilisateur possède un **rang global** et des **rangs par catégorie**.

| Rang | Icône | Points requis | % population cible |
|------|-------|---------------|-------------------|
| **Bronze** | 🥉 | 0 - 499 | 40% |
| **Argent** | 🥈 | 500 - 1 499 | 25% |
| **Or** | 🥇 | 1 500 - 3 499 | 18% |
| **Platine** | 💎 | 3 500 - 6 999 | 10% |
| **Diamant** | 👑 | 7 000 - 14 999 | 5% |
| **Légende** | 🌟 | 15 000+ | 2% |

**Gain de points :**

| Action | Points |
|--------|--------|
| Participer à un concours | +10 à +50 |
| Finir dans le top 50% | +25 à +100 |
| Finir dans le top 10 | +100 à +300 |
| Gagner un concours | +200 à +500 |
| Voter (participation communautaire) | +5 |
| Organiser un concours | +50 à +200 |
| Streak participation (7 jours consécutifs) | +100 bonus |

**Perte de points :**

- Inactivité prolongée (> 30 jours sans participation) : -50 points/mois
- Triche détectée : reset à 0 + suspension
- Fin de saison : soft reset (points divisés par 2)

---

### 3.2 Les saisons

L'année est divisée en **4 saisons** de 3 mois chacune.

| Saison | Période | Thème suggéré |
|--------|---------|---------------|
| **Saison 1 — Éveil** | Janvier → Mars | Renouveau, créativité |
| **Saison 2 — Flamme** | Avril → Juin | Compétition, intensité |
| **Saison 3 — Horizon** | Juillet → Septembre | Exploration, innovation |
| **Saison 4 — Légende** | Octobre → Décembre | Épopée, finales, rétrospective |

**Cycle d'une saison :**

```
Semaine 1-2   → Placement (matchs de calibration)
Semaine 3-10  → Saison active (concours, points, progression)
Semaine 11    → Finales de saison (top 100 par ligue)
Semaine 12    → Résultats, récompenses, rétrospective
               → Soft reset des points pour la saison suivante
```

**Récompenses de fin de saison :**

| Rang atteint | Récompense |
|-------------|------------|
| Bronze | Badge saison |
| Argent | Badge + frame profil |
| Or | Badge + frame + thème exclusif |
| Platine | Tout ci-dessus + emotes exclusifs |
| Diamant | Tout ci-dessus + titre spécial |
| Légende | Tout ci-dessus + avatar exclusif + Hall of Fame |

---

### 3.3 Classements

**Types de classements :**

| Classement | Portée | Reset |
|-----------|--------|-------|
| **Global** | Tous les utilisateurs | Par saison |
| **Par catégorie** | Gaming, Art, Tech, Story, Knowledge, Visual | Par saison |
| **Par pays** | Classement national | Par saison |
| **Par communauté** | Serveurs / guildes | Par saison |
| **All-time** | Historique complet | Jamais |
| **Amis** | Parmi tes contacts | Par saison |
| **Hebdomadaire** | Top de la semaine | Hebdomadaire |

**Classements d'équipes :**

Les guildes et équipes ont également un classement, calculé par la somme des points de leurs membres actifs. Cela encourage la compétition inter-guildes.

---

### 3.4 Divisions & promotion/relégation

Pour les ligues les plus compétitives (Gaming, Tech), un système de **divisions** peut exister :

```
Division 1     → Top 10 équipes/joueurs
Division 2     → 11-30
Division 3     → 31-100
Open           → Tous les autres
```

- **Promotion** : Les 2-3 derniers de chaque division montent à la fin de la saison
- **Relégation** : Les 2-3 derniers descendent
- **Playoffs** : Les 3ème-5ème jouent des barrages pour monter/rester

---

## 💰 4. Économie des concours

L'économie d'ImuArena repose sur **cinq piliers** qui interagissent avec le wallet ImuChat.

---

### 4.1 Sources de revenus d'un concours

```
┌─────────────────────────────────────────┐
│          Prize Pool d'un concours       │
│                                         │
│  ┌──────────┐  ┌───────────┐            │
│  │ Entry    │  │ Sponsors  │            │
│  │ Fees     │  │           │            │
│  └────┬─────┘  └─────┬─────┘            │
│       │              │                  │
│       ▼              ▼                  │
│  ┌──────────────────────────┐           │
│  │     Prize Pool Total     │           │
│  └────────────┬─────────────┘           │
│               │                         │
│  ┌────────────▼─────────────┐           │
│  │  Distribution :          │           │
│  │  1er    50%              │           │
│  │  2ème   25%              │           │
│  │  3ème   15%              │           │
│  │  ImuChat 10% (commission)│           │
│  └──────────────────────────┘           │
│                                         │
│  ┌───────────┐  ┌────────────┐          │
│  │Crowd-     │  │ Ventes     │          │
│  │funding    │  │ contenus   │          │
│  │communauté │  │ événement  │          │
│  └───────────┘  └────────────┘          │
└─────────────────────────────────────────┘
```

---

### 4.2 Frais d'inscription (Entry Fees)

| Type de concours | Fee | Justification |
|-----------------|-----|---------------|
| Concours communautaire gratuit | 0 ImuCoins | Accessibilité |
| Concours compétitif standard | 5-20 ImuCoins | Filtre anti-spam + prize pool |
| Tournoi e-sport premium | 50-200 ImuCoins | Prize pool élevé |
| Hackathon sponsorisé | 0-10 ImuCoins | Sponsor couvre les frais |

---

### 4.3 Sponsors

**Types de sponsoring :**

| Tier | Contribution | Visibilité |
|------|-------------|------------|
| **Bronze Sponsor** | 100-500 ImuCoins | Logo dans la page concours |
| **Silver Sponsor** | 500-2 000 ImuCoins | Logo + mention dans les annonces |
| **Gold Sponsor** | 2 000-10 000 ImuCoins | Logo + mention + stand virtuel + badge |
| **Title Sponsor** | 10 000+ ImuCoins | Nom dans le titre du concours + tout ci-dessus |

**Types de sponsors potentiels :**

- Studios de jeux vidéo (pour Gaming League)
- Éditeurs de logiciels créatifs (Adobe, Clip Studio — pour Creative League)
- Entreprises tech (pour Tech League / Hackathons)
- Marques lifestyle / gaming gear
- Créateurs de contenu / influenceurs
- L'équipe ImuChat elle-même (concours officiels)

---

### 4.4 Crowdfunding communautaire

Les fans et la communauté peuvent **contribuer au prize pool** d'un concours qu'ils soutiennent.

**Mécanisme :**

- Bouton "Soutenir ce concours" sur la page du concours
- Contributions de 1, 5, 10, 50, 100 ImuCoins
- Les contributeurs obtiennent un badge "Supporter" pour ce concours
- Jauge de progression visible (objectif crowdfunding)
- Les gros contributeurs affichés comme "Patrons" de l'événement

---

### 4.5 Ventes liées aux événements

| Produit | Prix estimé | Description |
|---------|-------------|-------------|
| Badge "Participant Saison X" | 2-5 ImuCoins | Collector, exclusif à la saison |
| Thème événement exclusif | 10-30 ImuCoins | Thème ImuChat lié à l'événement |
| Stickers événement | 3-10 ImuCoins | Pack de stickers exclusifs |
| Billet live finale | 5-20 ImuCoins | Accès au stream premium + chat VIP |
| Replay premium | 5 ImuCoins | Accès aux replays commentés |

---

### 4.6 Commission plateforme

ImuChat prend une commission de **10%** sur les prize pools des concours payants :

- 10% du prize pool → ImuChat
- 90% → distribués aux gagnants

Pour les concours gratuits, aucune commission.

---

## 🧱 5. Architecture technique

### 5.1 Modèle de données

**Tables principales :**

```sql
-- Concours
contests (
  id, title, description, rules, category,
  organizer_id, status, entry_fee,
  start_date, end_date, voting_start, voting_end,
  max_participants, prize_pool,
  visibility, league_id, season_id
)

-- Participations
contest_entries (
  id, contest_id, user_id, team_id,
  submission_type, content_url, description,
  submitted_at, status, score
)

-- Votes
contest_votes (
  id, contest_id, entry_id, voter_id,
  score, created_at
)

-- Jury
contest_jury (
  id, contest_id, user_id, role, weight
)

-- Ligues
arena_leagues (
  id, name, category, season_id,
  division, rank_range
)

-- Rangs utilisateur
user_arena_rank (
  id, user_id, category, points,
  current_rank, season_id, league_id
)

-- Saisons
arena_seasons (
  id, name, start_date, end_date,
  status, theme
)

-- Sponsors
contest_sponsors (
  id, contest_id, sponsor_name, sponsor_logo,
  tier, contribution_amount
)

-- Transactions concours
contest_transactions (
  id, contest_id, user_id, type,
  amount, description, created_at
)
```

### 5.2 Services backend

```
contest-service          → CRUD concours, soumissions, résultats
voting-service           → Gestion des votes (public, jury, pondéré)
arena-ranking-service    → Calcul des rangs, ligues, classements
arena-season-service     → Gestion des saisons, promotions/relégations
contest-economy-service  → Entry fees, prize pools, distributions
contest-moderation-service → Anti-triche, modération IA, validation soumissions
contest-notification-service → Alertes concours, rappels, résultats
```

### 5.3 API principales

```
POST   /api/contests                    → Créer un concours
GET    /api/contests                    → Lister les concours (filtres)
GET    /api/contests/:id                → Détail d'un concours
POST   /api/contests/:id/entries        → Soumettre une participation
GET    /api/contests/:id/entries        → Voir les soumissions
POST   /api/contests/:id/votes         → Voter
GET    /api/contests/:id/results       → Résultats

GET    /api/arena/rank/:userId          → Rang d'un utilisateur
GET    /api/arena/leaderboard           → Classement (filtres: global, pays, catégorie)
GET    /api/arena/seasons/current       → Saison en cours
GET    /api/arena/seasons/:id/rewards   → Récompenses de saison

POST   /api/contests/:id/sponsor       → Ajouter un sponsor
POST   /api/contests/:id/fund          → Crowdfunding contribution
GET    /api/contests/:id/prize-pool    → État du prize pool
```

### 5.4 Événements temps réel (WebSocket)

```
contest.created              → Nouveau concours disponible
contest.entry.submitted      → Nouvelle soumission
contest.vote.cast            → Vote enregistré
contest.results.published    → Résultats publiés
contest.prize.distributed    → Prix distribués

arena.rank.changed           → Changement de rang
arena.season.started         → Nouvelle saison
arena.season.ended           → Fin de saison
arena.promotion              → Promotion de division
arena.relegation             → Relégation de division

leaderboard.updated          → Classement mis à jour
```

---

## 📱 6. Écrans & UX

### 6.1 Navigation

ImuArena est accessible depuis :

- Un **onglet Arena** dans la barre de navigation principale
- Une **mini-app installable** depuis le Store
- Des **liens directs** dans les communautés et guildes

### 6.2 Liste des écrans

| # | Écran | Description | Composants clés |
|---|-------|-------------|----------------|
| 1 | **Arena Home** | Hub principal — concours populaires, en cours, à venir | `ContestCarousel`, `LeagueWidget`, `SeasonBanner` |
| 2 | **Contest Discovery** | Explorer et chercher des concours (filtres par catégorie, statut, popularité) | `ContestGrid`, `CategoryFilter`, `SearchBar` |
| 3 | **Contest Detail** | Page d'un concours — description, règles, participants, récompenses, timeline | `ContestHeader`, `RulesSection`, `PrizeSection`, `Timeline` |
| 4 | **Submit Entry** | Soumettre une participation (upload, description, preview) | `FileUploader`, `SubmissionForm`, `Preview` |
| 5 | **Voting Gallery** | Galerie des soumissions avec système de vote | `EntryGrid`, `VoteButton`, `JuryScoreCard` |
| 6 | **Results** | Résultats — top 3, top 10, tous les classements | `Podium`, `ResultsTable`, `PrizeDistribution` |
| 7 | **Leaderboard** | Classements : global, par catégorie, par pays, amis | `LeaderboardTable`, `RankBadge`, `FilterTabs` |
| 8 | **My Arena Profile** | Profil compétitif — rang, stats, historique, badges | `RankCard`, `StatsChart`, `BadgeCollection` |
| 9 | **Season Overview** | Saison en cours — progression, événements, récompenses | `SeasonProgress`, `EventCalendar`, `RewardPreview` |
| 10 | **Create Contest** | Créer un concours (organisateur) — formulaire complet | `ContestForm`, `RuleEditor`, `PrizeConfigurator` |
| 11 | **Contest Management** | Dashboard organisateur — gérer participants, soumissions, résultats | `ParticipantList`, `SubmissionReview`, `JuryPanel` |
| 12 | **Sponsor Dashboard** | Pour les sponsors — gérer contributions, visibilité, stats | `SponsorStats`, `ContributionPanel` |

---

## 🤖 7. Rôle de l'IA

L'intelligence artificielle joue un rôle transversal dans ImuArena.

### 7.1 Modération des soumissions

- **Détection de plagiat** — Comparaison avec des bases d'images/textes existants
- **Détection de contenu inapproprié** — NSFW, violence, discours haineux
- **Vérification d'originalité** — S'assurer que le contenu est original (pas d'IA pure pour un concours "fait main")
- **Détection de multi-comptes** — Empêcher la triche par comptes multiples

### 7.2 Assistance à l'organisation

- **Suggestions de thèmes** — L'IA propose des idées de concours basées sur les tendances
- **Génération de règles** — Templates de règles personnalisables
- **Estimation de participation** — Prédiction du nombre de participants
- **Calibration des récompenses** — Suggestion de prize pool adapté

### 7.3 Jugement assisté

- **Pré-scoring IA** — L'IA attribue un score technique aux soumissions (qualité image, lisibilité code, etc.)
- **Détection d'anomalies de vote** — Identifier les patterns de vote suspects (vote rings)
- **Résumés de soumissions** — Résumer les textes/projets pour les jurés

### 7.4 Recommandations

- **Concours recommandés** — Basés sur l'historique, les compétences et les centres d'intérêt
- **Coéquipiers suggérés** — Pour les compétitions en équipe
- **Défis personnalisés** — Challenges quotidiens adaptés au niveau du joueur

---

## 🛡 8. Modération & intégrité

### 8.1 Anti-triche

| Menace | Contre-mesure |
|--------|---------------|
| Multi-comptes voter | Vérification téléphone/email + détection IA |
| Plagiat de soumission | Détection via reverse image search + comparaison textuelle |
| Vote rings (votes arrangés) | Analyse de patterns de vote, détection de clusters |
| Bots de participation | Captcha + analyse comportementale |
| Contenu IA non déclaré | Détection IA-generated (images, textes) |
| Collusion en tournoi | Analyse de patterns de jeu + signalements |

### 8.2 Système de signalement

- Bouton "Signaler" sur chaque soumission et chaque concours
- File de modération avec priorités
- Modérateurs communautaires (élus par la communauté)
- Équipe de modération ImuChat pour les cas graves

### 8.3 Sanctions

| Infraction | Sanction |
|-----------|---------|
| Première triche mineure | Avertissement + retrait de la soumission |
| Triche répétée | Suspension 30 jours d'ImuArena |
| Fraude financière | Ban permanent + remboursement des victimes |
| Contenu inapproprié | Retrait immédiat + avertissement |
| Harcèlement | Ban progressif (7j → 30j → permanent) |

---

## 🎪 9. Événements majeurs

### 9.1 Événements récurrents

| Événement | Fréquence | Catégories | Description |
|-----------|-----------|-----------|-------------|
| **Daily Challenge** | Quotidien | Toutes | Petit défi rapide (5-15 min), bonus XP |
| **Weekly Contest** | Hebdomadaire | Rotation | Concours thématique de la semaine |
| **Monthly Championship** | Mensuel | Toutes | Compétition majeure du mois |
| **Season Finals** | Trimestriel | Toutes | Finales de saison, top 100 par ligue |

### 9.2 Événements spéciaux annuels

| Événement | Période | Description |
|-----------|---------|-------------|
| **🌍 ImuWorld Festival** | Décembre | Le plus grand événement annuel — multi-catégories, finales live, jury, gros prix |
| **🎮 ImuGaming Cup** | Été | Tournoi e-sport majeur |
| **🎨 ImuArt Awards** | Printemps | Concours artistique mondial |
| **💻 ImuHack** | Automne | Hackathon officiel ImuChat |
| **📚 ImuStory Festival** | Variable | Festival littéraire |
| **🧠 ImuQuiz Masters** | Variable | Championnat de quiz |

### 9.3 ImuWorld Festival — Détail

Le **ImuWorld Festival** est l'événement phare d'ImuChat :

- **Durée** : 2 semaines
- **Catégories** : Gaming, Art, Tech, Story, Knowledge, Visual
- **Phases** : Qualifications (1 semaine) → Finales (1 semaine)
- **Finales** : Streams en direct avec commentateurs
- **Jury** : Célébrités, experts, meilleurs joueurs de la saison
- **Récompenses** : ImuCoins premium, mentions presse, produits physiques, invitations VIP
- **Cérémonie** : Live stream avec annonce des gagnants de chaque catégorie

---

## 📈 10. Impact stratégique

### 10.1 Pour les utilisateurs

- **Engagement quotidien** — Daily challenges + progression de rang
- **Création de contenu** — Les concours génèrent massivement du contenu user-generated
- **Communauté** — Compétitions inter-guildes, esprit d'équipe
- **Découverte de talents** — Artistes, développeurs, écrivains mis en lumière
- **Récompenses tangibles** — ImuCoins, badges, reconnaissance

### 10.2 Pour ImuChat

- **Rétention** — Le système de saisons et de rang crée une boucle d'engagement
- **Viralité** — Les concours se partagent facilement (votes, participation externe)
- **Monétisation** — Commission sur les prize pools, ventes de contenus événementiels
- **Écosystème** — Les hackathons et mini-app challenges enrichissent le Store
- **Image de marque** — ImuChat comme plateforme de création et d'innovation

### 10.3 Métriques cibles

| Métrique | 6 mois post-lancement | 12 mois |
|----------|----------------------|---------|
| Utilisateurs Arena actifs/mois | 30 000 | 300 000 |
| Concours créés/mois | 500 | 5 000 |
| Soumissions/mois | 10 000 | 100 000 |
| Prize pools distribués/mois | 50 000 ImuCoins | 500 000 ImuCoins |
| Taux de rétention Arena | 40% | 55% |
| Sponsors actifs | 20 | 200 |
