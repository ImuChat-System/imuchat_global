# 🪙 ROADMAP — ImuEconomy & Monétisation

**Périmètre :** ImuCoin · Social Economy · Gaming Economy · Creator Economy · Store Economy · Business Economy · Publicité · Modèle économique  
**Source :** `Finance_Vision_v2.md` (§14-20)  
**Durée totale :** 15 sprints · 5 phases · ~30 semaines

---

## Phase A — ImuCoin Economy Foundation (Sprints A1-A3)

> **Objectif :** Consolider l'ImuCoin comme monnaie interne unique, étendre les types de transactions, implémenter le cycle complet achat → dépense → gain → retrait.

### Sprint A1 — Extension types transactions ImuCoin

**Priorité :** 🔴 CRITIQUE

| Tâche | Détail | Fichiers |
|-------|--------|----------|
| Étendre `imucoin_transactions.type` | Ajouter : `tip`, `gift`, `vote`, `boost`, `cashback`, `gaming`, `staking`, `referral` | Migration SQL ALTER CHECK |
| Historique enrichi | Catégoriser les transactions avec icône, couleur, label par type | `mobile/stores/wallet-store.ts` |
| Filtres historique | Filtrer par type, date, montant, direction (in/out) | `mobile/app/wallet/transactions.tsx` |
| Stats wallet | Sommes par catégorie (mois) : combien gagné en rewards, dépensé en gaming, etc. | Nouveau composant `WalletStats.tsx` |
| API stats | RPC `get_wallet_stats(user_id, period)` → breakdown catégorisé | SQL function |
| Types shared | Ajouter les nouveaux types dans `shared-types/src/wallet.ts` | `shared-types/src/wallet.ts` |

**Livrables Sprint A1 :**

- ✅ 15 types de transactions ImuCoin (vs 7 actuels)
- ✅ Historique filtrable et catégorisé
- ✅ Stats wallet par catégorie

---

### Sprint A2 — Cycle économique ImuCoin complet

**Priorité :** 🔴 CRITIQUE

| Tâche | Détail |
|-------|--------|
| Flow achat → crédit | Stripe / IAP → webhook → crédit `imucoin_wallets` (**dépend Sprint 2 du ROADMAP_IMUBANK**) |
| Flow dépense store | Achat module store → `store_transactions` + débit wallet | Existant à vérifier |
| Flow transfert P2P | Send ImuCoin → `transfer_imucoins()` atomique | ✅ Existant |
| Flow reward | Mission/badge/streak → auto-credit wallet | **Dépend Sprint 3 du ROADMAP_IMUBANK** |
| Flow conversion IC → fiat | ImuCoin → EUR/USD au taux fixe (100 IC = 1 €) → créditer fiat_wallets | Nouveau RPC `convert_imucoin_to_fiat` |
| Flow retrait fiat | fiat_wallets → Stripe Connect → virement bancaire | **Dépend Sprint 4 du ROADMAP_IMUBANK** |
| Tableaux de bord économiques | Dashboard admin : volume IC en circulation, velocity, burn rate | Admin dashboard |
| Tests cycle complet | Test e2e : achat IC → dépense → gain reward → conversion → retrait | `tests/e2e/imucoin-cycle.test.ts` |

**Livrables Sprint A2 :**

- ✅ Cycle ImuCoin complet end-to-end
- ✅ Conversion IC ↔ fiat fonctionnelle
- ✅ Dashboard admin métriques économiques

---

### Sprint A3 — Commission & Revenue Share

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Table `commission_rules` | Remplacer `revenue_share_config` statique par règles dynamiques | Migration SQL |
| Commissions par source | Dons 80/20, Abonnements 85/15, Ventes 70/30, Cadeaux 75/25 | Cf. §10.3 Finance_Vision_v2 |
| RPC `calculate_commission` | Calcul dynamique selon type de transaction + surcharges par créateur | SQL function |
| Auto-split paiement | Quand un paiement arrive → split automatique créateur/plateforme en temps réel |
| Table `platform_revenue` | Agrégation revenus plateforme par source, jour, mois | Vue matérialisée SQL |
| Dashboard revenus plateforme | Admin : revenus par pilier (abonnements, store, créateurs, micro-tx, finance, pub) |
| Audit trail | Chaque commission calculée est loggée avec détail calcul |

**Livrables Sprint A3 :**

- ✅ Commissions dynamiques par type de transaction
- ✅ Split automatique créateur/plateforme
- ✅ Dashboard revenus plateforme

---

## Phase B — Social Economy (Sprints B1-B3)

> **Objectif :** Monétiser les interactions sociales : pourboires chat, cadeaux live, super-likes, votes.

### Sprint B1 — Pourboires & Tips

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Table `social_tips` | `sender_id`, `recipient_id`, `amount_ic`, `context` (chat, feed, profile), `message_id` |
| RPC `send_tip` | Débiter sender, appliquer commission (20%), créditer créateur (80%) |
| UI tip dans chat | Bouton tip accessible depuis profil utilisateur dans le chat |
| Message tip | Message spécial dans la conversation : "🎁 Nathan a envoyé un tip de 50 IC" |
| Tip sur ImuFeed | Bouton "💰 Tip" sous chaque post (à côté de like) |
| Tip sur profil | Bouton "Soutenir" sur le profil créateur | Profil créateur |
| Montants rapides | Boutons prédéfinis : 10, 25, 50, 100, 500 IC + montant custom |
| Notifications | Push côté créateur : "Vous avez reçu un tip de X IC de @user" |
| Classement top tippers | "Top supporters" visible sur le profil créateur |

**Livrables Sprint B1 :**

- ✅ Tips dans le chat, ImuFeed et profils
- ✅ Commissions automatiques
- ✅ Classement supporters

---

### Sprint B2 — Cadeaux Live (animations)

**Priorité :** 🟡 HAUTE

> **Note :** Dépend du Sprint 13 du ROADMAP_IMUBANK pour les tables et RPCs. Ce sprint ajoute le layer visuel et l'intégration live stream.

| Tâche | Détail |
|-------|--------|
| Catalogue cadeaux UI | Grid scrollable avec preview animation | `mobile/components/finance/GiftCatalog.tsx` |
| Animation Rose (🌹) | Float : rose remonte lentement avec particules pétales | Lottie / Rive |
| Animation Star (⭐) | Float : étoile brille et remonte | Lottie / Rive |
| Animation Guitar (🎸) | Float : guitare vibre avec notes musicales | Lottie / Rive |
| Animation Rocket (🚀) | Explosion : fusée traverse l'écran avec trainée | Lottie / Rive |
| Animation Crown (👑) | Explosion : couronne descend + confetti doré | Lottie / Rive |
| Animation Diamond (💎) | Explosion : diamant géant + sparkle | Lottie / Rive |
| Animation Castle (🏰) | Fullscreen : château animé plein écran pendant 5s | Lottie / Rive |
| Overlay live | `LiveGiftOverlay.tsx` — couche sur le stream affichant les cadeaux | `mobile/components/finance/LiveGiftOverlay.tsx` |
| Queue cadeaux | File d'attente pour gérer plusieurs cadeaux simultanés (FIFO) |
| Combo system | Envoyer le même cadeau rapidement → combo x2, x3... avec multiplicateur visuel |
| Leaderboard live | Top donateurs du stream en temps réel (sidebar) |

**Livrables Sprint B2 :**

- ✅ 7 animations de cadeaux live
- ✅ Système de combo
- ✅ Leaderboard donateurs en temps réel

---

### Sprint B3 — Super-likes & Votes monétisés

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Super-like ImuFeed | Bouton "⭐ Super" = 5 IC, animation visible par le créateur | `mobile/components/feed/SuperLikeButton.tsx` |
| Animation super-like | Étoile explosante sur le post + notif prioritaire |
| Compteur super-likes | Affiché séparément des likes normaux sur le post |
| Votes concours premium | Vote gratuit : 1/jour/concours · Vote payant : 5 IC = 1 vote (max 10/jour) |
| Pool de prix votes | Les IC des votes alimentent la cagnotte de prix du concours |
| Table `contest_votes` | `user_id`, `contest_id`, `entry_id`, `vote_type` (free/paid), `amount_ic` |
| RPC `cast_premium_vote` | Débiter voter, ajouter au prize pool, incrémenter votes |
| UI vote premium | Bouton "⭐ Vote Premium (5 IC)" sous chaque entrée de concours |
| Boosts payants | Boost post (50-500 IC), boost story (30-300 IC), boost profil (100-1000 IC) |
| Table `boosts` | `user_id`, `target_type`, `target_id`, `amount_ic`, `duration_hours`, `impressions` |
| RPC `create_boost` | Débiter user, activer boost pour durée choisie |
| Algorithme boost | Post boosté = priorité dans le feed (multiplier × impressions garanties) |

**Livrables Sprint B3 :**

- ✅ Super-likes payants sur ImuFeed
- ✅ Votes premium dans les concours
- ✅ Boosts payants (posts, stories, profils)

---

## Phase C — Gaming Economy (Sprints C1-C2)

> **Objectif :** Monétiser l'expérience gaming : tickets tournoi, pass saison, skins, lootboxes.

### Sprint C1 — Tickets & Pass Saison Gaming

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Table `tournament_entries` | `user_id`, `tournament_id`, `entry_fee_ic`, `status`, `placement`, `reward_ic` |
| RPC `join_tournament` | Vérifie solde, débite entry fee, inscrit | Atomique |
| RPC `distribute_tournament_rewards` | À la fin du tournoi : créditer les gagnants, rembourser si annulé |
| Prize pool dynamique | Pool = somme des entry fees × coefficient (ex: 90% redistribué, 10% plateforme) |
| Table `season_passes` | `id`, `name`, `season_number`, `price_ic`, `start_date`, `end_date`, `rewards` JSONB |
| Table `user_season_passes` | `user_id`, `pass_id`, `purchased_at`, `level`, `xp` |
| RPC `buy_season_pass` | Achat pass → accès aux récompenses de saison |
| Pass progression | Chaque match joué + performance → XP saison → débloque rewards (IC, skins, badges) |
| UI acheter pass | Écran avec preview toutes les récompenses par palier |
| UI tournoi entry | Écran : infos tournoi, entry fee, prize pool, bouton inscription |

**Livrables Sprint C1 :**

- ✅ Inscription payante aux tournois
- ✅ Distribution automatique des prix
- ✅ Pass saison avec progression

---

### Sprint C2 — Skins, Items & Marketplace

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Table `gaming_items` | `id`, `name`, `type` (skin, emote, border, trail), `rarity`, `price_ic`, `image_url` |
| Table `user_gaming_items` | `user_id`, `item_id`, `obtained_via` (purchase, reward, lootbox, trade) |
| Boutique gaming | Catalogue skins/items rotatif (comme Fortnite shop) | `mobile/app/gaming/shop.tsx` |
| RPC `buy_gaming_item` | Achat direct → ajout inventaire |
| Lootboxes | Contenu aléatoire avec probabilités transparentes (obligatoire UE) | Table `lootbox_config` |
| RPC `open_lootbox` | Débiter IC → random item → ajout inventaire + animation |
| Animation ouverture | Coffre / boîte qui s'ouvre avec reveal progressif |
| Inventaire | Vue des items possédés, équipés | `mobile/app/gaming/inventory.tsx` |
| Marketplace P2P (futur) | Échange/vente items entre joueurs | À planifier post-v1 |
| Probabilités affichées | Obligatoire par loi UE : afficher les % de drop par rareté |

**Livrables Sprint C2 :**

- ✅ Boutique gaming avec skins/items
- ✅ Lootboxes transparentes
- ✅ Inventaire joueur

---

## Phase D — Store Economy & Marketplace (Sprints D1-D3)

> **Objectif :** Consolider la monétisation du Store (apps, thèmes, stickers) et enrichir la marketplace développeurs.

### Sprint D1 — Store Transactions enrichies

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Audit `store_transactions` | Vérifier cohérence types paiement (stripe, imucoin, iap) | `supabase_store_monetization.sql` |
| Avis + notes | Ajouter système d'avis après achat (1-5 étoiles + commentaire) | Table `store_reviews` |
| Remboursements | Politique 24h → RPC `request_store_refund` + crédit auto |
| Table `store_refunds` | `transaction_id`, `reason`, `status`, `refunded_amount`, `refunded_at` |
| Bundles | Packs de modules/stickers/thèmes à prix réduit | Table `store_bundles` |
| Promotions | Système de codes promo / réductions temporaires | Table `store_promotions` |
| RPC `apply_promo_code` | Vérifier validité, appliquer réduction, usage tracking |
| Analytics développeur | Dashboard : ventes, revenus, avis, tendances | Enrichir dashboard store |

**Livrables Sprint D1 :**

- ✅ Avis et notes sur les achats Store
- ✅ Remboursements automatisés
- ✅ Bundles et promotions

---

### Sprint D2 — Developer Payouts V2

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Enrichir `developer_payouts` | Ajouter : `payout_method`, `bank_details` (chiffré), `schedule` (mensuel/hebdo) |
| Stripe Connect Express | Onboarding développeur simplifié | Edge Function `onboard-developer` |
| Dashboard développeur | Revenus temps réel, projections, commission détaillée |
| Seuil payout configurable | Défaut 50 €, configurable par développeur |
| Paiement automatique | Cron mensuel/hebdo qui déclenche les payouts Stripe Connect |
| Rapports fiscaux | Générer récapitulatif annuel des revenus (PDF) pour déclaration |
| API développeur | Endpoints REST pour intégration outils tiers (analytics, compta) |
| Multi-devises | Support EUR, USD, GBP pour les développeurs internationaux |

**Livrables Sprint D2 :**

- ✅ Payouts développeurs automatisés
- ✅ Dashboard avec revenus temps réel
- ✅ Rapports fiscaux annuels

---

### Sprint D3 — Marketplace Services

**Priorité :** 🟢 MOYENNE (post-MVP)

| Tâche | Détail |
|-------|--------|
| Table `marketplace_services` | Services proposés par des créateurs/freelances (design, dev, coaching) |
| Table `service_bookings` | Réservation + paiement en escrow |
| Escrow system | L'argent est bloqué jusqu'à validation du service par l'acheteur |
| RPC `create_escrow` | Bloquer montant → créer booking |
| RPC `release_escrow` | Acheteur valide → créditer vendeur (- commission) |
| RPC `dispute_escrow` | Contestation → review admin |
| UI marketplace | Catalogue services, filtres, réservation | `mobile/app/store/services/` |
| Système d'avis services | Avis bidirectionnel (acheteur/vendeur) |

**Livrables Sprint D3 :**

- ✅ Marketplace de services avec escrow
- ✅ Système de réservation et validation

---

## Phase E — Publicité & Revenus Plateforme (Sprints E1-E2)

> **Objectif :** Mettre en place la régie publicitaire ImuChat et le système de boosts marchands.

### Sprint E1 — Régie publicitaire

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Table `ad_campaigns` | `advertiser_id`, `type` (post_sponsored, story, imufeed, banner, arena_sponsor), `budget_ic`, `spent_ic`, `status` |
| Table `ad_creatives` | `campaign_id`, `content_type`, `media_url`, `cta_text`, `target_url` |
| Table `ad_impressions` | `campaign_id`, `user_id`, `placement`, `timestamp` |
| Table `ad_clicks` | `campaign_id`, `user_id`, `timestamp` |
| Modèles pricing | CPM (5-25 €) pour awareness, CPC (0,50-5 €) pour performance |
| Création campagne UI | Interface pour créer campagne : cible, budget, créatif, durée | `mobile/app/finance/business/ads.tsx` |
| Placement engine | Insérer pub dans feed (1 pub / 8 contenus max) |
| Ciblage basique | Age, langue, pays, centres d'intérêt (déduits des communautés) |
| Label "Sponsorisé" | Obligatoire, visible, non-trompeur |
| Opt-out | Premium = 0 pub · Gratuit = option "Moins de pub" (réduit de 50%) |
| Dashboard annonceur | Impressions, clics, CTR, budget restant | Dashboard marchand |
| Contrôle parental | Filtrage pub selon tranche d'âge (< 13 ans = aucune pub) |

**Livrables Sprint E1 :**

- ✅ Régie publicitaire self-service
- ✅ 5 formats de placement
- ✅ Dashboard annonceur

---

### Sprint E2 — Monétisation Premium & Projections

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Table `premium_subscriptions` | Enrichir le système de subscription existant |
| Premium tiers | Envisager : Premium (5 €), Premium+ (9,99 €), Family (14,99 €) |
| Premium perks engine | Système flexible de perks activés/désactivés par tier |
| Métriques conversion | Tracker : % gratuit → premium, churn, LTV |
| Revenue dashboard admin | Vue consolidée des 6 piliers de revenus (cf. §20.1 Finance_Vision_v2) |
| Projections automatiques | Calcul automatique des projections (scaling × base utilisateurs) |
| Export comptable | Export CSV/Excel des revenus pour comptabilité |
| A/B testing pricing | Framework pour tester différents prix |

**Livrables Sprint E2 :**

- ✅ System Premium multi-tiers
- ✅ Dashboard revenus consolidé (6 piliers)
- ✅ Export comptable

---

## Résumé des phases

| Phase | Sprints | Durée | Contenu clé |
|-------|:-------:|:-----:|-------------|
| **A. ImuCoin Foundation** | A1-A3 | 6 sem. | Types étendus, cycle complet, commissions dynamiques |
| **B. Social Economy** | B1-B3 | 6 sem. | Tips, cadeaux live, super-likes, votes, boosts |
| **C. Gaming Economy** | C1-C2 | 4 sem. | Tickets tournoi, pass saison, skins, lootboxes |
| **D. Store Economy** | D1-D3 | 6 sem. | Avis, remboursements, payouts v2, marketplace services |
| **E. Publicité & Premium** | E1-E2 | 4 sem. | Régie pub, premium tiers, dashboard revenus |

**Total : 15 sprints · ~30 semaines**

---

## Dépendances avec ROADMAP_IMUBANK_WALLET

```
IMUBANK Sprint 1 (Types) ────────── requis pour ── ImuEconomy Sprint A1
IMUBANK Sprint 2 (Edge Functions) ─ requis pour ── ImuEconomy Sprint A2 (flow achat)
IMUBANK Sprint 3 (Gamification) ─── requis pour ── ImuEconomy Sprint A2 (flow reward)
IMUBANK Sprint 4 (Retrait) ──────── requis pour ── ImuEconomy Sprint A2 (flow retrait)
IMUBANK Sprint 13 (Live Gifts) ──── requis pour ── ImuEconomy Sprint B2 (animations)
IMUBANK Sprint 14 (Creator Subs) ── requis pour ── ImuEconomy Sprint B1 (tips créateurs)
IMUBANK Sprint 15 (Business) ────── requis pour ── ImuEconomy Sprint E1 (pub marchands)
```

---

## Dépendances inter-domaines

```
Gaming Hub (docs/games/) ────── requis pour ── Phase C (Gaming Economy)
Contests (docs/contests/) ──── requis pour ── Sprint B3 (Votes monétisés)
ImuFeed (docs/_mobile/) ────── requis pour ── Sprint B3 (Super-likes, Boosts)
Live Streaming ──────────────── requis pour ── Sprint B2 (Cadeaux Live)
Store ───────────────────────── requis pour ── Phase D (Store Economy)
```

---

## KPIs par phase

| Phase | KPI cible |
|-------|-----------|
| **Phase A** | 100% des types de transactions couverts, cycle IC complet, commissions auto |
| **Phase B** | 10 000+ tips/mois, 5 000+ cadeaux live/mois, 50 000+ super-likes/mois |
| **Phase C** | 2 000+ entrées tournoi payantes/mois, 500+ pass saison vendus |
| **Phase D** | 30% des achats store notés, < 5% taux remboursement, 100+ développeurs payés |
| **Phase E** | 50+ campagnes pub actives, CTR > 2%, revenus pub > 5% du CA total |

---

## Métriques économiques globales (cibles projet)

| Métrique | Cible 100K users | Cible 1M users |
|----------|:----------------:|:--------------:|
| **Volume IC en circulation** | 50M IC | 500M IC |
| **Velocity (tx/IC/mois)** | 3-5x | 5-8x |
| **ARPU (revenu/user/mois)** | 0,50 € | 0,52 € |
| **ARPPU (revenu/payeur/mois)** | 8,50 € | 10,30 € |
| **Taux conversion payante** | 6% | 5% |
| **Taux churn Premium** | < 8%/mois | < 5%/mois |
| **Commission moyenne plateforme** | 22% | 20% |
