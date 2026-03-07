# 💰 Roadmap — Économie des Concours ImuArena

**Date de création :** 7 mars 2026  
**Version :** 1.0  
**Objectif :** Implémenter le système économique complet d'ImuArena (frais d'entrée, prize pools, sponsors, crowdfunding, commissions, Wallet)

---

## 📊 Vue d'ensemble des phases

| Phase | Nom | Durée | Priorité | Dépendances |
|-------|-----|-------|----------|-------------|
| **Phase 1** | Économie de base | 3 sprints | P0 | ROADMAP_IMUARENA_HUB Phase 1-3 |
| **Phase 2** | Frais d'entrée & Prize Pools | 3 sprints | P0 | Phase 1, Wallet Core |
| **Phase 3** | Sponsoring & Marques | 3 sprints | P1 | Phase 2 |
| **Phase 4** | Crowdfunding & Communauté | 2 sprints | P2 | Phase 2 |
| **Phase 5** | Vente & Billetterie événementielle | 2 sprints | P2 | Phase 3 |
| **Phase 6** | Analytics & Optimisation revenus | 2 sprints | P2 | Phase 2-5 |

---

## 🏗️ Phase 1 — Économie de Base (Sprints 1-3)

### Objectif
Infrastructure économique : types, services financiers internes, intégration Wallet.

### Sprint 1 — Modèle de données économique

- [ ] Types dans `@imuchat/shared-types`
  - `ContestEntryFee` — type et montant du frais d'entrée
  - `PrizePool` — structure du prize pool (sources, répartition)
  - `PrizeDistribution` — distribution des prix (podium, top X, participation)
  - `SponsorTier` (Titre, Or, Argent, Bronze)
  - `SponsorDeal` — contrat de sponsoring
  - `CrowdfundingCampaign` — campagne de financement participatif
  - `ContestTransaction` — transaction financière liée à un concours
  - `PlatformCommission` — commission de la plateforme
- [ ] Schéma Supabase `supabase_arena_economy.sql`
  - Tables :
    - `contest_entry_fees` — configuration des frais par concours
    - `contest_prize_pools` — prize pools et sources de financement
    - `contest_prize_distributions` — répartition par position
    - `contest_transactions` — toutes les transactions (entrées, prix, commissions)
    - `contest_sponsors` — sponsors et leurs contrats
    - `contest_crowdfunding` — campagnes de crowdfunding
    - `platform_revenue` — revenus de la plateforme (commissions)
  - RLS policies pour sécurité financière
  - Triggers pour mise à jour automatique du prize pool à chaque entrée

### Sprint 2 — ContestEconomyService

- [ ] `ContestEconomyModule` dans `@imuchat/platform-core`
  - `PrizePoolService`
    - Calcul automatique du prize pool total
    - Sources : frais d'entrée + sponsors + crowdfunding + fonds ImuChat
    - Distribution configurable :
      ```
      1ère place    : 40%
      2ème place    : 25%
      3ème place    : 15%
      4-10ème       : 10% réparti
      Participation : 5% réparti
      Commission    : 5% ImuChat
      ```
    - Variantes par type de concours
  - `TransactionService`
    - Enregistrement de chaque transaction
    - Intégrité financière : double-entry logging
    - Rollback en cas d'annulation de concours
    - Audit trail complet
  - `CommissionService`
    - Calcul de la commission plateforme (5-15% selon type)
    - Rapport de revenus par période
- [ ] Tests unitaires + tests d'intégrité financière

### Sprint 3 — Intégration Wallet & paiements

- [ ] Connexion avec le Wallet ImuChat
  - Paiement des frais d'entrée via le Wallet
  - Créditation automatique des gains
  - Vérification de solde avant inscription
  - Historique des transactions liées aux concours
- [ ] Écran `ContestPayment`
  - Résumé du frais d'entrée
  - Choix du mode de paiement (ImuCoins, premium currency)
  - Confirmation sécurisée
  - Reçu de paiement
- [ ] Écran `ContestEarnings`
  - Gains totaux (par période, par catégorie)
  - Détail des transactions (gains, frais, bonus)
  - Graphe d'évolution des gains

### Livrables Phase 1
- ✅ Infrastructure économique complète
- ✅ Service de prize pool avec distribution automatique
- ✅ Intégration Wallet ImuChat
- ✅ Double-entry logging pour intégrité financière

---

## 💎 Phase 2 — Frais d'Entrée & Prize Pools (Sprints 4-6)

### Objectif
Système flexible de frais d'entrée et prize pools pour tous les types de concours.

### Sprint 4 — Types de frais d'entrée

- [ ] Frais d'entrée configurables par l'organisateur
  - Gratuit — pas de frais, prize pool financé par sponsors ou ImuChat
  - ImuCoins — prix en monnaie virtuelle interne
  - Premium — frais réel (converti via Wallet)
  - Mixte — partie ImuCoins + partie premium
- [ ] Frais d'entrée variables selon la division
  - Division 1 : frais plus élevés → prize pool plus gros
  - Open : frais symboliques ou gratuit
- [ ] Écran `ContestEntryConfig` (pour organisateurs)
  - Choix du type de frais
  - Montant configurable
  - Estimation automatique du prize pool
  - Aperçu de la répartition des prix

### Sprint 5 — Types de prize pools

- [ ] Prize pools dynamiques
  - Pool fixe — montant prédéfini par l'organisateur
  - Pool progressif — augmente avec chaque inscription
  - Pool garanti — minimum garanti par ImuChat ou sponsor
  - Pool à seuil — activé si X participants atteint
- [ ] Écran `PrizePoolTracker`
  - Montant actuel du prize pool
  - Jauge de progression (vers le seuil si applicable)
  - Nombre de participants
  - Répartition prévue des prix
  - Countdown vers le début du concours
- [ ] Widget prize pool sur la carte de concours (ContestCard)

### Sprint 6 — Distribution & paiement des gains

- [ ] Distribution automatique des prix à la clôture du concours
  - Calcul basé sur la répartition configurée
  - Déduction de la commission plateforme
  - Créditation instantanée sur le Wallet
  - Notification à chaque gagnant
- [ ] Écran `ContestResults` enrichi
  - Podium avec montants gagnés
  - Ma récompense détaillée (prix + bonus rank + battle pass XP)
  - Bouton "Réclamer" (si nécessaire pour certains prix)
- [ ] Gestion des cas spéciaux
  - Concours annulé → remboursement intégral
  - Égalité → partage du prix
  - Disqualification → redistribution
  - Non-réclamé après 30j → retour au pool

### Livrables Phase 2
- ✅ 4 types de frais d'entrée
- ✅ 4 types de prize pools
- ✅ Distribution automatique et paiement des gains
- ✅ Gestion des cas spéciaux (annulation, égalité, etc.)

---

## 🏢 Phase 3 — Sponsoring & Marques (Sprints 7-9)

### Objectif
Plateforme de sponsoring permettant aux marques de financer des concours et gagner en visibilité.

### Sprint 7 — Infrastructure sponsoring

- [ ] `SponsorService`
  - Gestion des profils sponsors (marques, entreprises)
  - 4 tiers de sponsoring :
    ```
    Titre   → Nom du concours ("Concours X by Sponsor")
              Logo prominant, page sponsor dédiée
              Jusqu'à 50% du financement du prize pool
    
    Or      → Logo affiché, mention dans les résultats
              20-30% du financement
    
    Argent  → Logo secondaire, remerciement
              10-20% du financement
    
    Bronze  → Mention dans la page sponsor
              < 10% du financement
    ```
  - Contrats de sponsoring avec durée, budget, et visibilité
- [ ] Schéma `sponsor_contracts` — contrats, paiements, visibilité
- [ ] API : `POST /api/arena/sponsors/apply`, `GET /api/arena/contests/:id/sponsors`

### Sprint 8 — Dashboard sponsor

- [ ] Écran `SponsorDashboard`
  - Concours sponsorisés (actifs et passés)
  - Métriques de visibilité :
    - Impressions (nombre de vues du logo/nom)
    - Clics vers le site sponsor
    - Engagement (likes, partages de concours sponsorisés)
    - Audience touchée (démographie, géographie)
  - Budget restant / dépensé
  - Propositions de nouveaux concours à sponsoriser
- [ ] Écran `SponsorCatalog` (pour organisateurs)
  - Liste des sponsors disponibles
  - Candidature pour obtenir un sponsor
  - Matching automatique (taille du concours → tier du sponsor)

### Sprint 9 — Sponsoring IA & automatisation

- [ ] Matching IA entre sponsors et concours
  - Basé sur la catégorie, l'audience, le budget
  - Recommandations : "Ce sponsor pourrait être intéressé par votre concours"
  - Score de compatibilité sponsor-concours
- [ ] Package sponsoring automatisé
  - Templates de contrats standard
  - Paiement automatique via la plateforme
  - Rapport de ROI automatique en fin de concours
- [ ] Emplacements pub intégrés
  - Banner dans l'Arena Home (discret, non-intrusif)
  - Mention dans les résultats
  - Produits sponsor comme prix (goodie bags, licences, etc.)

### Livrables Phase 3
- ✅ 4 tiers de sponsoring
- ✅ Dashboard sponsor avec métriques
- ✅ Matching IA sponsor-concours
- ✅ Automatisation des contrats et paiements

---

## 🌱 Phase 4 — Crowdfunding & Communauté (Sprints 10-11)

### Objectif
Les communautés et fans peuvent contribuer financièrement aux concours.

### Sprint 10 — Crowdfunding de concours

- [ ] `CrowdfundingService`
  - Campagne de crowdfunding associée à un concours
  - Objectif financier avec paliers
    ```
    Palier 1 (500 ImuCoins)  → Concours confirmé
    Palier 2 (1500 ImuCoins) → Prize pool doublé
    Palier 3 (3000 ImuCoins) → Invité spécial / juge célébrité
    Palier 4 (5000 ImuCoins) → Streaming live + commentateurs
    ```
  - Remboursement si objectif minimal non atteint
- [ ] Écran `CrowdfundingPage`
  - Jauge de progression par paliers
  - Liste des contributeurs (optionnellement anonymes)
  - Récompenses par palier (pour les contributeurs)
  - Countdown vers la date limite
- [ ] Récompenses contributeurs
  - Badge "Mécène" sur le profil
  - Accès anticipé aux résultats
  - Vote bonus (poids de vote augmenté)
  - Place réservée dans le chat spécial du concours

### Sprint 11 — Contributions récurrentes & mécénat

- [ ] Mécénat régulier
  - Abonnement mensuel pour soutenir une catégorie ou un organisateur
  - Avantages : accès VIP, badge, votes bonus
  - Dashboard mécène : impact de mes contributions
- [ ] Pourboires (tips) aux créateurs
  - Pendant ou après un concours, donner un pourboire à un participant
  - Message personnalisé avec le pourboire
  - Top donateurs affichés (optionnel)
- [ ] Composants : `TipButton`, `PatronBadge`, `CrowdfundGauge`, `ContributorList`

### Livrables Phase 4
- ✅ Crowdfunding avec paliers et remboursement
- ✅ Mécénat récurrent
- ✅ Système de pourboires
- ✅ Récompenses pour les contributeurs

---

## 🎟️ Phase 5 — Vente & Billetterie Événementielle (Sprints 12-13)

### Objectif
Billetterie pour les grands événements et expériences premium.

### Sprint 12 — Billetterie

- [ ] `EventTicketService`
  - Billets pour les grands événements (ImuWorld Festival, finales de saison)
  - Types de billets :
    - Gratuit — accès au stream
    - Standard — accès au chat live + emotes événement
    - VIP — accès backstage, rencontre avec les finalistes, goodie numérique
    - Créateur — droit de stream/co-host l'événement
  - Limitation du nombre de places (FIFO)
  - QR code / code unique par billet
- [ ] Écran `EventTicketing`
  - Sélection du type de billet
  - Paiement via Wallet
  - Billet numérique avec QR code
  - Ajout au calendrier

### Sprint 13 — Ventes & merchandising numérique

- [ ] Vente liée aux concours
  - Stickers exclusifs de l'événement
  - Thèmes ImuChat en édition limitée
  - Packs d'emotes événement
  - NFT / certificats de participation (optionnel)
- [ ] Écran `EventShop`
  - Catalogue des produits numériques de l'événement
  - Paiement intégré
  - Historique des achats événementiels
- [ ] Revenus partagés : plateforme (30%) + organisateur (70%)

### Livrables Phase 5
- ✅ Billetterie avec 4 tiers
- ✅ Merchandising numérique
- ✅ Revenue sharing organisateur/plateforme

---

## 📊 Phase 6 — Analytics & Optimisation Revenus (Sprints 14-15)

### Objectif
Dashboard financier complet et outils d'optimisation des revenus.

### Sprint 14 — Dashboard financier plateforme

- [ ] `ArenaFinanceModule` (admin)
  - Dashboard revenus global
    - Revenus par source : frais d'entrée, commissions, sponsors, crowdfunding, billetterie
    - Évolution mensuelle / trimestrielle
    - Revenus par catégorie de concours
    - Top concours par revenus
  - Prévisions de revenus (basées sur tendances)
  - Alertes : revenus en baisse, concours déficitaires
- [ ] API admin : `GET /api/admin/arena/finance/overview`
- [ ] Rapport automatique mensuel pour les administrateurs

### Sprint 15 — Analytics organisateur & optimisation

- [ ] Dashboard organisateur enrichi
  - Revenus de mes concours
  - Comparaison avec la moyenne de la catégorie
  - Suggestions d'optimisation :
    - "Augmenter le prize pool de 20% augmente la participation de 35%"
    - "Les concours le weekend ont 2x plus de participants"
    - "Ajouter un sponsor tier Or augmente le prize pool de 40%"
  - Historique financier complet
- [ ] Module de pricing IA
  - Suggestion du frais d'entrée optimal (basé sur la catégorie, l'audience, l'historique)
  - A/B testing de pricing (optionnel)
  - Prédiction de participation basée sur le prix
- [ ] Export des données financières (CSV, PDF)

### Livrables Phase 6
- ✅ Dashboard financier plateforme
- ✅ Analytics organisateur avec suggestions IA
- ✅ Module de pricing intelligent
- ✅ Export et rapports automatiques

---

## 📈 Métriques de succès par phase

| Phase | KPI principal | Objectif |
|-------|--------------|----------|
| Phase 1 | Transactions Arena / mois | 1 000+ |
| Phase 2 | Volume du plus gros prize pool | 10 000 ImuCoins |
| Phase 3 | Sponsors actifs | 20+ |
| Phase 4 | Montant total crowdfundé / mois | 50 000 ImuCoins |
| Phase 5 | Billets vendus / événement majeur | 500+ |
| Phase 6 | Revenus plateforme croissance | +15% mensuel |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| ROADMAP_IMUARENA_HUB | Concours de base (création, participation, résultats) |
| ROADMAP_LEAGUES_SEASONS | Rang et division pour frais variables |
| Wallet Core | Paiements, créditations, historique financier |
| `platform-core` | ContestEconomyModule |
| `shared-types` | Types économiques |
| `ui-kit` | Composants paiement, billetterie, graphes |
| ImuChat Store | Merchandising numérique |
| IA / ML | Pricing, matching sponsors, prévisions |
| Notifications | Gains, remboursements, crowdfunding |

---

## ⚠️ Considérations spéciales

### Sécurité financière
- **Double-entry logging** : chaque transaction enregistrée en débit ET crédit
- **Audit trail** : historique complet et immuable de toute transaction
- **Rate limiting** : protection contre les abus (entrées multiples, spam)
- **Rollback** : système de remboursement automatique en cas d'annulation

### Conformité
- Respect des réglementations locales sur les concours avec prix
- Pas de gambling : les concours sont basés sur la compétence, pas le hasard
- Conditions générales claires pour chaque type de concours
- Protection des mineurs : restrictions d'âge pour les concours payants

### Scalabilité
- Architecture event-driven pour les transactions (pas de blocage)
- Queue de paiement avec retry automatique
- Cache des prize pools en temps réel
- Sharding possible des tables de transactions à grande échelle
