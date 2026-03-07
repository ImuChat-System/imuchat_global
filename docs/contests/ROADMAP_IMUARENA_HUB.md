# 🏆 Roadmap — ImuArena : Hub Concours & Compétitions

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Implémenter le hub central des concours d'ImuChat (création, participation, soumissions, votes, résultats)

---

## 📊 Vue d'ensemble des phases

| Phase | Nom | Durée | Priorité | Dépendances |
|-------|-----|-------|----------|-------------|
| **Phase 1** | Fondations ImuArena | 4 sprints | P0 | platform-core, shared-types |
| **Phase 2** | Participation & soumissions | 3 sprints | P0 | Phase 1 |
| **Phase 3** | Système de votes | 3 sprints | P0 | Phase 2 |
| **Phase 4** | Résultats & récompenses | 2 sprints | P1 | Phase 3 |
| **Phase 5** | Concours par catégorie | 4 sprints | P1 | Phase 4 |
| **Phase 6** | Organisation & gestion | 3 sprints | P1 | Phase 4 |
| **Phase 7** | IA & Modération | 3 sprints | P2 | Phase 2 |

---

## 🏗️ Phase 1 — Fondations ImuArena (Sprints 1-4)

### Objectif
Architecture technique du module concours, modèle de données, services backend, API et premier écran d'accueil.

### Sprint 1 — Types & modèle de données

- [ ] Définir types dans `@imuchat/shared-types`
  - `Contest`, `ContestEntry`, `ContestVote`, `ContestResult`
  - `ContestCategory`, `ContestStatus`, `ContestPhase`
  - `JuryMember`, `ContestSponsor`, `ContestTransaction`
  - `ArenaRank`, `ArenaSeason`, `ArenaLeague`
- [ ] Créer le schéma Supabase `supabase_contests.sql`
  - Tables : `contests`, `contest_entries`, `contest_votes`, `contest_results`
  - Tables : `contest_jury`, `contest_sponsors`, `contest_transactions`
  - Enums : `contest_status` (draft, open, submissions, voting, judging, completed, cancelled)
  - Enums : `contest_category` (gaming, creative, tech, story, knowledge, visual)
  - Policies RLS : organisateur, participants, votants, public
  - Indexes : category, status, organizer_id, dates
- [ ] Migrations et seed data (concours exemples)

### Sprint 2 — Contest Service (platform-core)

- [ ] Créer `ContestModule` dans `@imuchat/platform-core`
  - `ContestService` — CRUD concours complet
    - Création avec validation (titre, dates, règles, catégorie)
    - Gestion du cycle de vie (draft → open → submissions → voting → completed)
    - Auto-transition entre phases basée sur les dates
  - `ContestEntryService` — gestion des soumissions
    - Soumission avec upload de fichiers (images, audio, vidéo, texte, code)
    - Validation par type de concours (formats acceptés, tailles max)
    - Limites : 1 soumission par utilisateur par concours (configurable)
  - `ContestEventBus` — événements temps réel
- [ ] Tests unitaires (objectif : 90%+ coverage)
- [ ] Intégration avec `MediaHandler` pour les uploads

### Sprint 3 — API Concours

- [ ] Endpoints REST :
  - `POST /api/contests` — Créer un concours
  - `GET /api/contests` — Lister (filtres : catégorie, statut, popularité, dates)
  - `GET /api/contests/:id` — Détail
  - `PUT /api/contests/:id` — Modifier (organisateur uniquement)
  - `DELETE /api/contests/:id` — Supprimer (draft uniquement)
  - `POST /api/contests/:id/entries` — Soumettre une participation
  - `GET /api/contests/:id/entries` — Voir les soumissions
  - `GET /api/contests/:id/entries/:entryId` — Détail d'une soumission
- [ ] Middleware d'authentification et de rôles
- [ ] Rate limiting : 5 créations de concours/jour, 50 soumissions/jour
- [ ] Pagination, tri, filtres avancés
- [ ] Documentation OpenAPI

### Sprint 4 — Écran Arena Home (Frontend)

- [ ] Écran `ArenaHome` — hub principal d'ImuArena
  - Bannière de saison en cours
  - Section "Concours populaires" (carousel)
  - Section "En cours" — concours ouverts à la participation
  - Section "Bientôt" — à venir
  - Section "Résultats récents" — derniers gagnants
- [ ] Écran `ContestDiscovery` — explorer les concours
  - Grille de concours avec filtres
  - Filtres par catégorie, statut, popularité, type de récompense
  - Barre de recherche
- [ ] Navigation : onglet "Arena" dans la barre principale
- [ ] Composants UI dans `@imuchat/ui-kit` :
  - `ContestCard` — carte d'un concours (titre, catégorie, statut, participants, prize)
  - `CategoryBadge` — badge de catégorie (Gaming, Art, Tech...)
  - `ContestStatusIndicator` — indicateur de phase du concours
  - `PrizeDisplay` — affichage du prize pool
- [ ] Responsive : web, mobile, desktop

### Livrables Phase 1
- ✅ Types partagés ImuArena
- ✅ Schéma BDD concours complet
- ✅ ContestModule dans platform-core
- ✅ API concours fonctionnelle
- ✅ Écran Arena Home multi-plateforme

---

## 📤 Phase 2 — Participation & Soumissions (Sprints 5-7)

### Objectif
Permettre aux utilisateurs de s'inscrire, soumettre leurs participations et gérer leurs soumissions.

### Sprint 5 — Écran Détail Concours

- [ ] Écran `ContestDetail` — page complète d'un concours
  - Header : titre, catégorie, organisateur, bannière
  - Section "Description & Règles" — markdown rendu
  - Section "Timeline" — phases avec dates et countdown
  - Section "Récompenses" — prize pool, badges, trophées
  - Section "Participants" — nombre + avatars des participants (preview)
  - Section "Organisateur" — profil de l'organisateur
  - Bouton "Participer" / "S'inscrire"
- [ ] Composants : `ContestTimeline`, `PrizeSection`, `ParticipantPreview`, `RulesRenderer`
- [ ] Partage du concours (deep link, réseaux sociaux)

### Sprint 6 — Soumission de participations

- [ ] Écran `SubmitEntry` — page de soumission
  - Upload de fichier adapté au type de concours :
    - Image : drag & drop, preview, crop
    - Audio : upload + player preview
    - Vidéo : upload + thumbnail auto
    - Texte : éditeur rich text
    - Code : éditeur de code avec syntax highlighting
    - Projet : URL de repo / zip
  - Champs : titre, description, tags
  - Preview de la soumission avant envoi
  - Validation des formats et tailles
- [ ] Composants : `FileUploader`, `MediaPreview`, `CodeEditor`, `RichTextEditor`
- [ ] Confirmation de soumission + notification à l'organisateur
- [ ] Possibilité de modifier la soumission avant la fin de la phase soumission

### Sprint 7 — Profil participant & mes concours

- [ ] Section "Mes Concours" dans le profil
  - Concours auxquels je participe (en cours)
  - Mes soumissions (avec statut)
  - Mon historique de participations
  - Concours que j'organise
- [ ] Notifications concours :
  - "Le concours X commence demain"
  - "La phase de vote commence"
  - "Les résultats sont disponibles"
  - "Votre soumission a reçu 50 votes"
- [ ] Widget Arena dans le profil utilisateur (rang, participations, badges)

### Livrables Phase 2
- ✅ Page détail concours complète
- ✅ Système de soumission multi-format
- ✅ Section "Mes Concours" dans le profil
- ✅ Notifications concours

---

## 🗳 Phase 3 — Système de Votes (Sprints 8-10)

### Objectif
Implémenter les différents modes de vote : public, jury, pondéré.

### Sprint 8 — Vote public

- [ ] `VotingService` dans platform-core
  - Vote public : 1 vote par utilisateur par concours
  - Anti-fraude basique : vérification compte, rate limiting
  - Comptage de votes en temps réel
  - Anonymat des votes (le votant n'est pas visible)
- [ ] Écran `VotingGallery` — galerie des soumissions
  - Grille de soumissions avec preview
  - Vue détail d'une soumission (plein écran)
  - Bouton vote (like / étoiles / classement)
  - Compteur de votes en temps réel
  - Navigation entre soumissions (swipe / flèches)
- [ ] Composants : `EntryCard`, `VoteButton`, `VoteCounter`

### Sprint 9 — Vote jury

- [ ] Système de jury
  - L'organisateur invite des jurés (3-7 personnes)
  - Chaque juré attribue un score (1-10) par critère
  - Critères configurables par l'organisateur (ex: technique, originalité, thème)
  - Interface juré dédiée avec grille de notation
- [ ] Écran `JuryPanel` — interface de notation
  - Liste des soumissions à évaluer
  - Grille de critères avec curseurs/notes
  - Commentaires par soumission (privés)
  - Progression : X/Y soumissions évaluées
- [ ] Calcul du score final : moyenne des jurés par critère

### Sprint 10 — Vote pondéré & résultats en direct

- [ ] Mode vote pondéré : configurable par l'organisateur
  - Exemple : 60% jury + 40% public
  - Normalisation des scores (jury sur 10, public sur nombre de votes)
  - Score final combiné
- [ ] Classement en temps réel
  - Leaderboard live pendant la phase de vote
  - Option "résultats cachés" (révélés à la fin)
  - Animations de progression
- [ ] Anti-fraude avancé
  - Détection de vote rings (clusters de votes suspects)
  - Vérification d'ancienneté du compte (min 7 jours)
  - Détection de multi-comptes (fingerprinting)
- [ ] WebSocket pour mise à jour temps réel des compteurs

### Livrables Phase 3
- ✅ Vote public fonctionnel
- ✅ Système de jury avec grille de notation
- ✅ Vote pondéré configurable
- ✅ Classement en temps réel
- ✅ Anti-fraude de vote

---

## 🏅 Phase 4 — Résultats & Récompenses (Sprints 11-12)

### Objectif
Afficher les résultats, distribuer les récompenses et célébrer les gagnants.

### Sprint 11 — Résultats & podium

- [ ] `ResultService` dans platform-core
  - Calcul automatique des résultats (selon le mode de vote)
  - Classement final avec scores
  - Gestion des ex-æquo
  - Validation par l'organisateur avant publication
- [ ] Écran `ContestResults` — page de résultats
  - Podium animé (top 3 avec animation de révélation)
  - Classement complet (top 10, top 50, tous)
  - Détail des scores (votes publics, scores jury)
  - Soumission gagnante mise en avant
- [ ] Composants : `Podium`, `ResultsTable`, `WinnerCard`, `ScoreBreakdown`
- [ ] Notifications : "Les résultats du concours X sont disponibles !"

### Sprint 12 — Distribution des récompenses

- [ ] `RewardService` — distribution automatique des récompenses
  - Distribution ImuCoins depuis le prize pool vers les wallets des gagnants
  - Attribution de badges de concours (participant, top 10, gagnant)
  - Attribution de trophées (par catégorie, par saison)
  - Thèmes et emotes exclusifs s'il y en a
- [ ] Intégration avec le Wallet ImuChat
  - Transaction "Contest Prize" tracée
  - Historique des gains Arena dans le profil
- [ ] Écran `RewardClaim` — récupérer ses récompenses
  - Animation de récompense (type loot box / coffre)
  - Résumé des gains
- [ ] Hall of Fame — page des précédents gagnants

### Livrables Phase 4
- ✅ Calcul et affichage des résultats
- ✅ Podium animé
- ✅ Distribution automatique des récompenses
- ✅ Intégration Wallet ImuChat
- ✅ Hall of Fame

---

## 🎯 Phase 5 — Concours par Catégorie (Sprints 13-16)

### Objectif
Implémenter les mécaniques spécifiques à chaque catégorie de concours.

### Sprint 13 — Gaming Contests

- [ ] Intégration avec le Gaming Hub
  - Tournois bracket (single/double elimination) — réutiliser `TournamentService`
  - Mini-jeux ImuChat comme support de compétition
  - Speedrun avec timer intégré et validation
- [ ] Écran `GamingContest` — interface tournoi dans l'Arena
  - Bracket interactif
  - Résultats en direct
  - Lien vers voice chat / stream
- [ ] Import de stats depuis plateformes gaming (validation des résultats)

### Sprint 14 — Creative Contests (Art, Musique, Vidéo)

- [ ] Templates de concours créatifs
  - Dessin / Illustration : galerie avec zoom HD
  - Musique : player audio intégré dans la galerie de vote
  - Vidéo : player vidéo avec preview dans le feed
  - Stickers : preview en contexte (dans une bulle de chat)
- [ ] Critères de jugement créatifs prédéfinis
  - Technique, Originalité, Respect du thème, Impact émotionnel
- [ ] Mode "Expo" — exposition virtuelle des soumissions
  - Galerie navigable (type musée virtuel)
  - Commentaires et réactions sur chaque œuvre

### Sprint 15 — Tech Contests (Hackathons, Mini-apps)

- [ ] Templates hackathon
  - Timer de hackathon (24h, 48h, 72h)
  - Soumission = lien GitHub / URL déployée + README
  - Critères : fonctionnalité, qualité code, innovation, UX
- [ ] Mini-app Challenge
  - Soumission = package mini-app ImuChat
  - Test sandbox pour les jurés
  - La mini-app gagnante est publiée dans le Store
- [ ] Theme Challenge
  - Soumission = fichier de thème ImuChat
  - Preview live du thème dans l'app
  - Le thème gagnant est intégré dans le catalogue officiel

### Sprint 16 — Story, Knowledge & Visual Contests

- [ ] Story Contests
  - Éditeur de texte dédié avec formatage
  - Mode lecture (pagination, police adaptée)
  - Storytelling audio : player avec waveform
- [ ] Knowledge Contests (Quiz)
  - Intégration avec le système de quiz
  - Questions à choix multiples, réponse rapide, buzzers
  - Classement en temps réel pendant le quiz
  - Mode solo et mode équipe
- [ ] Visual Contests
  - Photo Challenge : galerie haute résolution
  - Wallpaper Contest : preview sur mockup device
  - Avatar Contest : preview en contexte profil

### Livrables Phase 5
- ✅ Mécaniques spécifiques Gaming (brackets, speedrun)
- ✅ Galeries créatives (art, musique, vidéo)
- ✅ Hackathons avec timer et soumission code
- ✅ Quiz compétitifs en temps réel
- ✅ Templates par catégorie

---

## 🛠 Phase 6 — Organisation & Gestion (Sprints 17-19)

### Objectif
Outils pour les organisateurs de concours : dashboard, modération, gestion des sponsors.

### Sprint 17 — Dashboard organisateur

- [ ] Écran `ContestManagement` — tableau de bord organisateur
  - Vue d'ensemble : participants, soumissions, votes, timeline
  - Actions rapides : prolonger les dates, modifier les règles, publier résultats
  - Statistiques : engagement, nombre de vues, partages
- [ ] Gestion des participants
  - Approuver / refuser des participations
  - Communiquer avec les participants (message groupé)
  - Disqualifier un participant (avec motif)
- [ ] Gestion des soumissions
  - Review des soumissions avant publication (queue de modération)
  - Flag des soumissions problématiques

### Sprint 18 — Gestion des sponsors

- [ ] `SponsorService` — gestion des sponsorings
  - Recherche et invitation de sponsors
  - Packages de visibilité (Bronze, Silver, Gold, Title)
  - Tracking de la contribution au prize pool
- [ ] Écran `SponsorDashboard`
  - Vue sponsor : concours sponsorisés, visibilité, ROI
  - Ajout de contribution au prize pool
  - Upload logo et assets sponsor
- [ ] Écran `SponsorMarketplace` — pour les organisateurs
  - Trouver des sponsors pour son concours
  - Proposer des packages de visibilité

### Sprint 19 — Concours communautaires & templates

- [ ] Templates de concours prédéfinis
  - "Concours de dessin hebdomadaire"
  - "Tournoi gaming rapide (1h)"
  - "Quiz du vendredi"
  - "Hackathon weekend"
  - "Challenge photo du jour"
- [ ] Concours programmés / récurrents
  - Créer un concours qui se répète (hebdo, mensuel)
  - Auto-création à chaque période
- [ ] Concours communautaires
  - Une guilde ou un serveur peut créer des concours internes
  - Visibilité : privé (guilde) ou public
  - Intégration avec le système de guildes du Gaming Hub

### Livrables Phase 6
- ✅ Dashboard organisateur complet
- ✅ Gestion des sponsors
- ✅ Templates de concours prédéfinis
- ✅ Concours récurrents et communautaires

---

## 🤖 Phase 7 — IA & Modération (Sprints 20-22)

### Objectif
Intelligence artificielle pour modérer, assister, recommander et sécuriser les concours.

### Sprint 20 — Modération IA des soumissions

- [ ] `ContestModerationService`
  - Détection de contenu NSFW / inapproprié (images, textes, vidéos)
  - Détection de plagiat :
    - Reverse image search pour les images
    - Comparaison textuelle (Jaccard, cosine similarity) pour les textes
    - Détection de code copié (plagiarism checker)
  - Détection de contenu généré par IA (quand le concours l'interdit)
  - Auto-flag avec score de confiance
- [ ] Queue de modération pour les modérateurs humains
  - Soumissions flaggées par l'IA classées par priorité
  - Actions : approuver, rejeter, demander modification

### Sprint 21 — Anti-fraude & intégrité

- [ ] `FraudDetectionService`
  - Détection de multi-comptes
    - Fingerprinting device/browser
    - Analyse d'IP et de patterns de connexion
  - Détection de vote rings
    - Graphe de votes : identifier les clusters suspects
    - Analyse temporelle (votes groupés en burst)
  - Détection de collusion en tournoi
    - Analyse de patterns de jeu inhabituels
    - Signalements croisés
- [ ] Système de sanctions automatiques
  - Avertissement → suspension temporaire → ban permanent
  - Actions reversibles (appel possible)
- [ ] Dashboard anti-fraude pour les admins ImuChat

### Sprint 22 — IA de recommandation & assistance

- [ ] `ContestRecommendationService`
  - Recommandations personnalisées de concours
    - Basées sur : historique, catégories préférées, niveau, amis
  - Suggestions de thèmes pour les organisateurs
    - Tendances actuelles, thèmes populaires, saisonnalité
  - Estimation de participation pour un nouveau concours
- [ ] Défis quotidiens personnalisés
  - L'IA génère un petit défi adapté au niveau du joueur
  - Exemple : "Dessine un paysage en 30 minutes" pour un artiste Bronze
  - Bonus XP pour complétion
- [ ] Résumés IA
  - Résumé automatique des soumissions textuelles pour les jurés
  - Résumé de concours pour les nouveaux arrivants
  - Récapitulatif de saison personnalisé

### Livrables Phase 7
- ✅ Modération IA des soumissions (NSFW, plagiat, IA-generated)
- ✅ Anti-fraude (multi-comptes, vote rings)
- ✅ Recommandations personnalisées
- ✅ Défis quotidiens IA
- ✅ Résumés automatiques

---

## 📈 Métriques de succès par phase

| Phase | KPI principal | Objectif |
|-------|--------------|----------|
| Phase 1 | Arena Hub accessible | 100% plateformes |
| Phase 2 | Soumissions / premier mois | 1 000+ |
| Phase 3 | Votes par concours (moyenne) | 100+ |
| Phase 4 | Taux satisfaction gagnants | 90%+ |
| Phase 5 | Concours par catégorie actifs | 10+ par catégorie |
| Phase 6 | Organisateurs actifs/mois | 200+ |
| Phase 7 | Fraudes détectées / faux positifs | < 5% faux positifs |

---

## 🔗 Dépendances avec le monorepo ImuChat

| Module existant | Utilisation Arena |
|----------------|------------------|
| `platform-core` | ContestModule hébergé ici |
| `shared-types` | Types Contest/Arena partagés |
| `ui-kit` | Composants UI Arena |
| `MediaHandler` | Upload soumissions (images, audio, vidéo) |
| `Notifications` | Alertes concours, résultats, votes |
| `Wallet Core` | Entry fees, prize pool, distribution |
| Gaming Hub | Tournois gaming, brackets, mini-jeux |
| `IA Assistant` | Modération, recommandations |
| Store Core | Mini-apps et thèmes issus de hackathons |
