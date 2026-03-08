# 🏦 ROADMAP — ImuBank & Wallet

**Périmètre :** Wallet (ImuCoin + fiat) · P2P · Cartes · KYC · Épargne · Abonnements · Sécurité  
**Source :** `Finance_Vision_v2.md` (§4-8, §12, §21)  
**Durée totale :** 18 sprints · 6 phases · ~36 semaines

---

## Phase 1 — Consolidation Wallet MVP (Sprints 1-4)

> **Objectif :** Corriger les incohérences du wallet existant, unifier les types, implémenter les Edge Functions Stripe manquantes.

### Sprint 1 — Harmonisation types & tables

**Priorité :** 🔴 CRITIQUE

| Tâche | Détail | Fichiers |
|-------|--------|----------|
| Unifier `WalletBalance` | Merge `shared-types/src/wallet.ts` et `mobile/types/wallet.ts` → le shared-type est la source de vérité | `shared-types/src/wallet.ts`, `mobile/types/wallet.ts` |
| Corriger noms tables | Mobile requête `wallets` → réalité `imucoin_wallets`. Idem `wallet_transactions` → `imucoin_transactions` | `mobile/services/wallet-api.ts`, `mobile/stores/wallet-store.ts` |
| Corriger `wallet_missions` | Mobile requête `wallet_missions` → réalité `missions` + `user_missions` | `mobile/services/wallet-api.ts` |
| Supprimer types dupliqués | Supprimer `mobile/types/wallet.ts` et ré-exporter depuis `@imuchat/shared-types` | `mobile/types/wallet.ts`, imports touchés |
| Ajouter types manquants | `TopUpPackage`, `CheckoutSession`, `CashoutRequest` dans shared-types | `shared-types/src/wallet.ts` |
| Tests types | Jest snapshot des types exportés | `shared-types/tests/wallet.test.ts` |

**Livrables Sprint 1 :**

- ✅ `shared-types/src/wallet.ts` = unique source de vérité pour tous les types wallet
- ✅ Mobile compile sans erreur avec les bons noms de tables
- ✅ Zéro duplication de types entre mobile et shared-types

---

### Sprint 2 — Edge Functions Stripe

**Priorité :** 🔴 CRITIQUE

| Tâche | Détail | Route Edge Function |
|-------|--------|---------------------|
| `create-checkout-session` | Créer session Stripe Checkout pour top-up ImuCoin | `POST /functions/v1/create-checkout-session` |
| `check-checkout-status` | Vérifier statut après paiement | `POST /functions/v1/check-checkout-status` |
| `stripe-webhook` | Webhook Stripe : créditer wallet après paiement réussi | `POST /functions/v1/stripe-webhook` |
| `list-payment-methods` | Lister moyens de paiement Stripe du user | `GET /functions/v1/list-payment-methods` |
| `create-setup-intent` | Ajouter nouveau moyen de paiement | `POST /functions/v1/create-setup-intent` |
| `remove-payment-method` | Supprimer un moyen de paiement | `DELETE /functions/v1/remove-payment-method` |
| `set-default-payment-method` | Définir le moyen par défaut | `PUT /functions/v1/set-default-payment-method` |
| Validation sécurité | Vérifier `auth.uid()`, rate limiting, input validation | Toutes les fonctions |
| Tests e2e | Tester le flow complet : checkout → webhook → solde crédité | `tests/e2e/stripe-flow.test.ts` |

**Livrables Sprint 2 :**

- ✅ 7 Edge Functions Stripe déployées et fonctionnelles
- ✅ Webhook validé en sandbox Stripe
- ✅ Top-up ImuCoin end-to-end fonctionnel sur mobile

---

### Sprint 3 — Gamification ↔ Wallet

**Priorité :** 🟡 HAUTE

| Tâche | Détail | Fichiers |
|-------|--------|----------|
| Créer RPC `claim_mission_reward` | Fonction SQL qui vérifie la mission complétée + crédite le wallet | `supabase/migrations/xxx_claim_mission_reward.sql` |
| Trigger auto récompense | Quand `user_missions.status = 'completed'` → créditer `imucoin_wallets` automatiquement | `supabase/migrations/xxx_mission_reward_trigger.sql` |
| Corriger wallet-store | `claimMission()` → appeler RPC correctement | `mobile/stores/wallet-store.ts` |
| Streak login rewards | Système de combo : jour 1 = 10 IC, jour 7 = 100 IC | table `login_streaks` + trigger |
| Badge rewards | Quand badge obtenu → bonus ImuCoin según rareté | trigger sur `user_badges` |
| Dashboard missions wallet | Afficher missions disponibles avec récompense IC dans le wallet | `mobile/app/wallet/index.tsx` |

**Livrables Sprint 3 :**

- ✅ Missions complétées créditent automatiquement le wallet
- ✅ Streak login avec rewards progressifs
- ✅ Badges débloqués = bonus ImuCoin

---

### Sprint 4 — Retrait & Tests e2e

**Priorité :** 🟡 HAUTE

| Tâche | Détail | Fichiers |
|-------|--------|----------|
| Edge Function `request-cashout` | Demande de retrait ImuCoin → fiat → Stripe Connect | `supabase/functions/request-cashout/` |
| Minimum retrait | 50 € (5 000 IC) — vérifié côté serveur | Edge Function validation |
| KYC check retrait | Vérifier KYC ≥ 2 avant autoriser retrait | Edge Function validation |
| Table `cashout_requests` | `user_id`, `amount_ic`, `amount_fiat`, `currency`, `status`, `stripe_transfer_id` | SQL migration |
| UI retrait mobile | Formulaire retrait + confirmation + statut suivi | `mobile/app/wallet/withdraw.tsx` ✅ (enrichir) |
| Tests e2e wallet complet | Flow : recharge → transfert → mission → claim → retrait | `tests/e2e/wallet-complete.test.ts` |
| Tests unitaires store | Jest pour wallet-store (mocked APIs) | `mobile/__tests__/wallet-store.test.ts` |

**Livrables Sprint 4 :**

- ✅ Retrait fonctionnel (sandbox Stripe Connect)
- ✅ Suite de tests e2e wallet couvrant tous les flows
- ✅ **Wallet ImuCoin MVP complet et stable**

---

## Phase 2 — KYC & Finance Hub Core (Sprints 5-8)

> **Objectif :** Mettre en place le vrai KYC, lancer le Finance Hub dashboard, et implémenter les paiements P2P.

### Sprint 5 — KYC réel (niveaux 0-2)

**Priorité :** 🔴 CRITIQUE (bloquant pour fiat et cartes)

| Tâche | Détail |
|-------|--------|
| Choisir provider KYC | Onfido (EU-focus) ou Jumio (global) — SDK mobile natif |
| Créer table `user_kyc` | Cf. §24.2 du Finance_Vision_v2 |
| Edge Function `submit-kyc` | Upload document + selfie → envoi au provider → status `pending` |
| Edge Function `kyc-webhook` | Callback du provider → mettre à jour `user_kyc.status` |
| Niveaux automatiques | KYC 0 : email/tél · KYC 1 : +nom/naissance · KYC 2 : +ID+selfie |
| UI KYC mobile | Écran capture document, selfie, attente validation | `mobile/app/finance/kyc.tsx` |
| Limites dynamiques | Appliquer limites selon KYC level (500 IC, 250 €/mois, 5 000 €/mois) |
| Tests | Flow KYC complet avec mock provider |

**Livrables Sprint 5 :**

- ✅ KYC niveaux 0-2 fonctionnels
- ✅ Limites appliquées dynamiquement

---

### Sprint 6 — Finance Hub Dashboard

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Layout Finance Hub | Navigation Finance Hub avec tabs : Dashboard, Wallet, Cartes, Épargne | `mobile/app/finance/_layout.tsx` |
| Dashboard principal | Solde total (IC + fiat), widgets rapides, transactions récentes | `mobile/app/finance/index.tsx` |
| Financial Insights | Graphiques dépenses (par catégorie, par mois), tendances IA | `mobile/app/finance/insights.tsx` |
| Transaction Feed | Historique paginé, filtres (type, date, montant), recherche | `mobile/app/finance/transactions.tsx` |
| Transaction Detail | Détail : montant, catégorie, note, reçu, statut | `mobile/app/finance/transaction/[id].tsx` |
| Migration wallet → finance | Les écrans wallet existants deviennent sous-section du Finance Hub | `mobile/app/wallet/` → deep-link vers `finance/wallet/` |
| Composants | `FinanceDashboard.tsx`, `TransactionItem.tsx`, `BalanceWidget.tsx` |

**Livrables Sprint 6 :**

- ✅ Finance Hub accessible et navigable
- ✅ Dashboard avec vue consolidée

---

### Sprint 7 — Paiements P2P (send & request)

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Table `p2p_payments` | Cf. §24.2 Finance_Vision_v2 |
| RPC `send_p2p_payment` | Vérifie solde, débite expéditeur, statut `pending` jusqu'à acceptation |
| RPC `accept_p2p_payment` | Crédite destinataire, passe `completed` |
| RPC `decline_p2p_payment` | Rembourse expéditeur, passe `declined` |
| RPC `request_p2p_payment` | Crée une demande (pas de débit immédiat) |
| Composant chat P2P | `P2PPaymentCard.tsx` — affiché dans la conversation comme message spécial |
| Bouton "+" chat | Ajouter options : Envoyer argent, Demander paiement | `mobile/components/chat/ChatInput.tsx` |
| UI envoi | Formulaire : destinataire, montant, devise, note | `mobile/app/finance/send.tsx` |
| UI réception | QR code personnel + lien de paiement | `mobile/app/finance/receive.tsx` |
| Notifications | Push quand on reçoit un paiement / demande |
| Sécurité | FaceID/PIN requis pour envoi > configurable (défaut 0 IC, 10 € fiat) |
| Expiration auto | Paiements non acceptés expirent après 7 jours (cron Supabase) |

**Livrables Sprint 7 :**

- ✅ Envoi et réception ImuCoin + fiat dans le chat
- ✅ Demandes de paiement fonctionnelles
- ✅ Messages P2P dans les conversations

---

### Sprint 8 — Split Bill & Cagnottes

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Tables `split_bills` + `split_bill_participants` | Cf. §24.2 |
| Tables `group_pools` + `pool_contributions` | Cf. §24.2 |
| RPC `create_split_bill` | Diviser montant entre N participants (equal, custom, %) |
| RPC `pay_split_bill_share` | Participant paie sa part |
| RPC `create_group_pool` | Créer cagnotte avec objectif |
| RPC `contribute_to_pool` | Ajouter une contribution |
| Composants chat | `SplitBillCard.tsx`, `GroupPoolCard.tsx` — messages interactifs |
| UI Split Bill | Sélection participants, montant, type de division | `mobile/app/finance/split-bill.tsx` |
| UI Cagnotte | Création, suivi progression, contributions | `mobile/app/finance/group-pool.tsx` |
| Rappels | Notification automatique pour les participants en attente |
| Expiration | Cagnottes/splits expirent selon durée configurée |

**Livrables Sprint 8 :**

- ✅ Split bill dans les conversations de groupe
- ✅ Cagnottes de groupe
- ✅ **P2P complet (send, request, split, pool)**

---

## Phase 3 — Cartes & Épargne (Sprints 9-12)

> **Objectif :** Cartes virtuelles ImuChat (Stripe Issuing), coffres d'épargne, cashback.

### Sprint 9 — Cartes virtuelles

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Table `imuchat_cards` | Cf. §24.2 |
| Edge Function `create-card` | Appel Stripe Issuing API → créer carte virtuelle |
| Edge Function `freeze-card` | Bloquer/débloquer carte |
| Edge Function `update-card-limits` | Modifier plafonds |
| KYC gate | Carte virtuelle = KYC ≥ 2 obligatoire |
| UI Mes cartes | Liste, détail, copier numéro, bloquer | `mobile/app/finance/cards/index.tsx` |
| UI Créer carte | Choix tier + confirmation | `mobile/app/finance/cards/create.tsx` |
| UI Détail carte | Numéro, plafonds, historique, actions | `mobile/app/finance/cards/[id].tsx` |
| Composant `CardWidget` | Widget carte 3D / flat design avec flip animation |
| Stripe Webhook cards | Écouter événements `issuing_authorization.*`, `issuing_transaction.*` |

**Livrables Sprint 9 :**

- ✅ Création carte virtuelle (sandbox)
- ✅ Gestion cartes (bloquer, plafonds)

---

### Sprint 10 — Apple Pay / Google Pay

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Apple Pay provisioning | Ajouter carte ImuChat dans Apple Wallet (Stripe Push Provisioning) |
| Google Pay provisioning | Ajouter dans Google Wallet |
| Tokenisation | La carte virtuelle est tokenisée localement |
| Tests sur device | Tester avec Stripe testmode + appareil physique |
| Guide utilisateur | Écran d'aide pour guider l'ajout dans Wallet natif |

**Livrables Sprint 10 :**

- ✅ Carte ImuChat utilisable via Apple Pay / Google Pay

---

### Sprint 11 — Coffres d'épargne

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Tables `savings_vaults` + `savings_auto_rules` | Cf. §24.2 |
| RPC `create_savings_vault` | Créer coffre avec objectif et emoji |
| RPC `add_to_vault` | Ajouter manuellement au coffre |
| Cron règles auto | Exécuter règles : recurring (hebdo), roundup (arrondi), percentage (% cashback) |
| UI Mes coffres | Liste coffres + progression visuelle | `mobile/app/finance/savings/index.tsx` |
| UI Créer coffre | Nom, emoji, objectif, date cible, règles auto | `mobile/app/finance/savings/create.tsx` |
| Composant `SavingsGoalCard` | Barre de progression, %, montant restant |
| Animation completion | Confetti / celebration quand objectif atteint |

**Livrables Sprint 11 :**

- ✅ Coffres d'épargne avec objectifs
- ✅ Règles automatiques (recurring, arrondis)

---

### Sprint 12 — Cashback & Programmes

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Système cashback | X% de chaque transaction carte → crédité en ImuCoin |
| Niveaux cashback | Standard 1%, Creator 1,5%, Business 2%, Premium 3% |
| Table `cashback_transactions` | `card_id`, `tx_amount`, `cashback_amount_ic`, `rate` |
| Programme parrainage | Table `referrals` (cf. §24.2) + logique rewards |
| RPC `register_referral` | Enregistrement filleul + récompense immédiate |
| Bonus relais | Filleul recharge → bonus supplémentaire parrain |
| Paliers ambassadeur | 5/20/50/100 filleuls → badges + bonus ImuCoin progressifs |
| UI Parrainage | Écran avec code, partage, tracker | `mobile/app/finance/referral.tsx` |

**Livrables Sprint 12 :**

- ✅ Cashback automatique sur transactions carte
- ✅ Programme de parrainage complet

---

## Phase 4 — Creator & Business Economy (Sprints 13-15)

> **Objectif :** Monétisation créateurs enrichie, cadeaux live, marchands.

### Sprint 13 — Cadeaux Live & Tips

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Table `live_gifts` + seed data | 7 cadeaux par défaut (Rose → Castle) |
| Table `live_gift_transactions` | `sender_id`, `recipient_id`, `gift_id`, `stream_id`, `amount_ic` |
| RPC `send_live_gift` | Débiter sender, créditer creator (75%), plateforme (25%) |
| RPC `send_tip` | Pourboire dans le chat (même mécanique, sans animation) |
| Composant `LiveGiftOverlay` | Overlay sur le stream avec animations |
| Composant `GiftAnimation` | Animations : float (remonte), explosion (particules), fullscreen (3s) |
| UI catalogue cadeaux | Grid cadeaux avec prix + animation preview |
| Super-like ImuFeed | 5 IC/super-like, animation spéciale, notif prioritaire |
| Commission dynamique | Table `creator_commission_rates` pour surcharger les taux par créateur |

**Livrables Sprint 13 :**

- ✅ 7 types de cadeaux pendant les lives
- ✅ Pourboires dans le chat
- ✅ Super-likes payants sur ImuFeed

---

### Sprint 14 — Abonnements Fans & Ventes Créateurs

**Priorité :** 🟡 HAUTE

| Tâche | Détail |
|-------|--------|
| Table `creator_subscription_tiers` | `creator_id`, `tier` (1/2/3), `price_cents`, `name`, `perks` (JSONB) |
| Table `creator_subscriptions` | `fan_id`, `tier_id`, `status`, `started_at`, `expires_at` |
| Stripe recurring | Abonnements fans via Stripe Billing (ou ImuCoin récurrent) |
| Perks par tier | Tier 1 : badge + emojis · Tier 2 : + contenu · Tier 3 : + DM + lives exclusifs |
| Table `creator_content_sales` | `creator_id`, `buyer_id`, `content_type`, `price_ic`, `file_url` |
| UI config tiers | Créateur configure ses 3 tiers + perks | `mobile/app/finance/creator-tiers.tsx` |
| UI côté fan | Bouton "S'abonner" sur profil créateur, accès contenu premium |
| Dashboard créateur enrichi | Revenus par source (tips, abos, ventes), graphiques | Enrichir `wallet/creator-settings.tsx` |

**Livrables Sprint 14 :**

- ✅ 3 tiers d'abonnement fans configurables
- ✅ Ventes de contenus numériques
- ✅ Dashboard créateur avec breakdown revenus

---

### Sprint 15 — Business Hub

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Table `merchant_profiles` | Cf. §24.2 |
| Table `merchant_transactions` | Historique ventes commerçant |
| Vérification marchand | KYC business (SIRET/KBIS pour EU) |
| Terminal QR | Commerçant affiche QR → client scanne → paiement | `mobile/app/finance/business/terminal.tsx` |
| Lien de paiement | Commerçant génère lien partageaable → client paie | Edge Function `create-payment-link` |
| Factures | Commerçant émet factures à ses clients | `mobile/app/finance/business/invoices.tsx` |
| Dashboard marchand | CA, tx moyen, heures pointe, graphiques | `mobile/app/finance/business/index.tsx` |
| Frais différenciés | Freelance 2,5%, Petit commerce 1,8%, Créateur 1,5%, Entreprise 1,5%+0,25€ |
| Stripe Connect | Onboarding marchand via Stripe Connect (Standard ou Express) |

**Livrables Sprint 15 :**

- ✅ Profil marchand
- ✅ Terminal QR + liens de paiement
- ✅ Facturation clients

---

## Phase 5 — Investissements & Crypto (Sprints 16-17)

> **Objectif :** Offrir investissements fractionnés et crypto (via partenaire régulé).

### Sprint 16 — Investissements

**Priorité :** 🟢 MOYENNE (nécessite partenariat)

| Tâche | Détail |
|-------|--------|
| Choix partenaire | Alpaca (US), Bux Zero (EU), DriveWealth (global) |
| Table `investment_portfolios` | `user_id`, `total_value`, `total_invested`, `pnl` |
| Table `investment_holdings` | `portfolio_id`, `asset_type`, `symbol`, `quantity`, `avg_price` |
| API invest | `fetchMarket()`, `buyAsset()`, `sellAsset()`, `getPortfolio()` |
| UI Dashboard invest | Portefeuille, PnL, allocation pie chart | `mobile/app/finance/invest/index.tsx` |
| UI Market explorer | Liste actifs, recherche, filtres, top gainers/losers | `mobile/app/finance/invest/market.tsx` |
| UI Achat/Vente | Montant, preview, confirmation | `mobile/app/finance/invest/buy.tsx` |
| KYC gate | Investissement = KYC ≥ 3 obligatoire |

**Livrables Sprint 16 :**

- ✅ Achat fractionné d'actions et ETF (sandbox)
- ✅ Portfolio avec PnL en temps réel

---

### Sprint 17 — Crypto Hub

**Priorité :** 🟢 MOYENNE (nécessite licence ou partenariat)

| Tâche | Détail |
|-------|--------|
| Choix partenaire crypto | MoonPay (widget), Wyre, ou Transak |
| Cryptos v1 | BTC, ETH, SOL, USDT, USDC |
| Table `crypto_portfolios` | `user_id`, `holdings` JSONB (coin, amount, avg_price) |
| API crypto | `buyCrypto()`, `sellCrypto()`, `getCryptoPrice()`, `getPortfolio()` |
| UI Crypto Hub | Portfolio, acheter/vendre, graphiques | `mobile/app/finance/crypto/index.tsx` |
| UI Détail crypto | Graphique prix (1h/1j/1s/1m/1a), stats, acheter | `mobile/app/finance/crypto/[coinId].tsx` |
| Alertes prix | Configurer alertes haut/bas pour chaque crypto |
| Staking | Staking BTC/ETH/SOL via partenaire |
| Composant `CryptoTicker` | Ticker défilant avec prix temps réel |

**Livrables Sprint 17 :**

- ✅ Achat/Vente de 5 cryptos
- ✅ Portfolio crypto
- ✅ Staking basique

---

## Phase 6 — IA Finance & Compliance (Sprint 18)

> **Objectif :** IA financière, publicité, compliance renforcée, audit sécurité.

### Sprint 18 — Alice Finance & Scale

**Priorité :** 🟢 MOYENNE

| Tâche | Détail |
|-------|--------|
| Alice Finance | Intégrer analyse financière dans Alice (LLM) : résumés dépenses, suggestions, budgets |
| Alertes proactives | Budget dépassé, abonnement inutilisé, cashback disponible, objectif épargne |
| Publicité native | Posts sponsorisés dans Feed, bannières Store, sponsor Arena |
| Table `ad_campaigns` | Campagnes publicitaires commerçants (CPM/CPC) |
| Détection fraude | ML scoring sur transactions (montant inhabituel, geo, heure) |
| KYC niveau 3 | Justificatif domicile + source de fonds |
| Conformité PSD2 SCA | Strong Customer Authentication pour paiements > 30 € |
| Audit sécurité | Pentest, revue code, conformité PCI DSS |
| Monitoring | Alertes temps réel sur transactions suspectes (Supabase + webhook) |

**Livrables Sprint 18 :**

- ✅ Alice Finance fonctionnelle
- ✅ Publicité native
- ✅ Compliance PSD2 / AML complète
- ✅ **Finance Hub v1 complet**

---

## Résumé des phases

| Phase | Sprints | Durée | Contenu clé |
|-------|:-------:|:-----:|-------------|
| **1. Consolidation Wallet** | 1-4 | 8 sem. | Fix types, Edge Functions, gamification, retrait |
| **2. KYC & Finance Core** | 5-8 | 8 sem. | KYC réel, dashboard, P2P, split, cagnottes |
| **3. Cartes & Épargne** | 9-12 | 8 sem. | Cartes virtuelles, Apple Pay, coffres, cashback, parrainage |
| **4. Creator & Business** | 13-15 | 6 sem. | Cadeaux live, abos fans, marchands, factures |
| **5. Invest & Crypto** | 16-17 | 4 sem. | Actions fractionnées, crypto, staking |
| **6. IA & Compliance** | 18 | 2 sem. | Alice Finance, pub, fraude, audit |

**Total : 18 sprints · ~36 semaines**

---

## Dépendances critiques

```
Sprint 1 (Types) ─────────────────────────────── bloque TOUT
Sprint 2 (Stripe Edge) ─────────────────────── bloque Stripe (top-up, cartes, retrait)
Sprint 5 (KYC) ──────────────────────────────── bloque Cartes (S9), Invest (S16), Crypto (S17)
Sprint 7 (P2P) ──────────────────────────────── bloque Split/Cagnottes (S8)
Sprint 9 (Cartes) ───────────────────────────── bloque Apple Pay (S10), Cashback (S12)
Sprint 13 (Live Gifts) ──────────────────────── nécessite système live streaming fonctionnel
Sprint 16 (Invest) ──────────────────────────── nécessite partenariat courtier régulé
Sprint 17 (Crypto) ──────────────────────────── nécessite partenariat / licence crypto
```

---

## KPIs par phase

| Phase | KPI cible |
|-------|-----------|
| **Phase 1** | 0 erreur types, top-up Stripe fonctionnel, 90% tests pass |
| **Phase 2** | 500+ KYC complétés, 1 000+ transactions P2P/mois |
| **Phase 3** | 2 000+ cartes virtuelles créées, 200+ coffres épargne |
| **Phase 4** | 100+ créateurs avec revenus > 50 €/mois, 50+ marchands |
| **Phase 5** | 500+ utilisateurs investisseurs, volume crypto > 10K €/mois |
| **Phase 6** | 70%+ satisfaction Alice Finance, 0 incident sécurité |
