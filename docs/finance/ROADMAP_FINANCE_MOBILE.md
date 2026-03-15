# 📱 ROADMAP FINANCE MOBILE — ImuBank & ImuEconomy (React Native / Expo)

**Périmètre :** Portage intégral des 8 macro-phases finance desktop (S44→S70) vers la mobile app  
**Baseline :** Wallet MVP existant (balance, transactions, missions, top-up Stripe, abonnements, IAP)  
**Stack :** React Native 0.81 · Expo 54 · Expo Router · Zustand 5 · Jest 30 · i18n-js (en/fr/ja)  
**Départ tests mobile :** 124 suites · 2788 tests · 0 failures (sprint S12)

> **Convention :** Les sprints mobiles finance sont numérotés **M-F1** à **M-F27** (Mobile-Finance).
> Chaque sprint correspond à un ou plusieurs sprints desktop, adaptés aux spécificités RN/Expo.

---

## 📊 Progression Mobile App — Finance

| Sprint Mobile | Desktop Equiv. | Contenu Finance | Tests | Status |
|:-------------:|:--------------:|-----------------|:-----:|:------:|
| **M-F1** | S44 | Finance Hub (dashboard, navigation, top-up enrichi, gamification wallet) | +XX → XXXX | 🔲 |
| **M-F2** | S45 | KYC Onfido niveaux 0-2 + vérification documents | +XX → XXXX | 🔲 |
| **M-F3** | S45 | P2P Payments (envoi/requête dans le chat, QR scan) | +XX → XXXX | 🔲 |
| **M-F4** | S46 | Economy A1 — 15 types transactions IC + stats wallet | +XX → XXXX | 🔲 |
| **M-F5** | S47 | Split Bill + Cagnottes de groupe | +XX → XXXX | 🔲 |
| **M-F6** | S48 | Economy A2 — Cycle économique IC complet (IC↔fiat) | +XX → XXXX | 🔲 |
| **M-F7** | S49 | Economy A3 — Commissions dynamiques, revenue share | +XX → XXXX | 🔲 |
| **M-F8** | S50 | Cartes virtuelles Stripe Issuing | +XX → XXXX | 🔲 |
| **M-F9** | S51 | Tips / Pourboires (chat, feed, profil) | +XX → XXXX | 🔲 |
| **M-F10** | S52 | Apple Pay / Google Pay / QR / NFC | +XX → XXXX | 🔲 |
| **M-F11** | S53 | Cadeaux Live (7 animations Lottie, combo, leaderboard) | +XX → XXXX | 🔲 |
| **M-F12** | S54 | Coffres d'épargne + règles automatiques | +XX → XXXX | 🔲 |
| **M-F13** | S55 | Super-likes, votes premium, boosts payants | +XX → XXXX | 🔲 |
| **M-F14** | S56 | Cashback + Programme de parrainage | +XX → XXXX | 🔲 |
| **M-F15** | S57 | Cadeaux Live tables + RPCs + commissions | +XX → XXXX | 🔲 |
| **M-F16** | S58 | Tickets tournoi + pass saison gaming | +XX → XXXX | 🔲 |
| **M-F17** | S59 | Abonnements fans 3 tiers + ventes créateurs | +XX → XXXX | 🔲 |
| **M-F18** | S60 | Skins, items, lootboxes, boutique gaming | +XX → XXXX | 🔲 |
| **M-F19** | S61 | Business Hub (marchands, terminal QR, facturation) | +XX → XXXX | 🔲 |
| **M-F20** | S62 | Store enrichi (avis, remboursements, bundles, promos) | +XX → XXXX | 🔲 |
| **M-F21** | S63 | Developer payouts v2 (auto, fiscaux, multi-devises) | +XX → XXXX | 🔲 |
| **M-F22** | S64 | Marketplace services (escrow, réservation, litiges) | +XX → XXXX | 🔲 |
| **M-F23** | S65 | Investissements (actions fractionnées, ETF, watchlist) | +XX → XXXX | 🔲 |
| **M-F24** | S66 | Crypto Hub (BTC, ETH, SOL, staking, alertes) | +XX → XXXX | 🔲 |
| **M-F25** | S67 | Régie pub self-service (5 formats, ciblage, dashboard) | +XX → XXXX | 🔲 |
| **M-F26** | S68 | Premium multi-tiers, dashboard revenus consolidé, export | +XX → XXXX | 🔲 |
| **M-F27** | S69-S70 | Alice Finance IA + Compliance (KYC3, PSD2/SCA, fraude ML, PCI DSS) | +XX → XXXX | 🔲 |

---

## Macro-Phases Mobile

### M-Phase 1 — Fondations Finance Hub (M-F1)

> Enrichir le wallet MVP existant avec le Finance Hub complet et la gamification avancée.

**Existant mobile :**
- ✅ `wallet-api.ts` — fetchBalance, sendImucoins, fetchMissions, claimMission
- ✅ `payment-api.ts` — fetchTopupPackages, createCheckoutSession, fetchPaymentMethods
- ✅ `subscription-api.ts` — 3 plans (Free/Pro/Premium), subscribe/cancel/change
- ✅ `iap-service.ts` — 7 produits, achat, restauration
- ✅ `wallet-store.ts` — 800+ lignes, Zustand + AsyncStorage persistence
- ✅ 11 écrans wallet (index, topup, transactions, withdraw, invoices, etc.)

**À créer (M-F1) :**

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/finance-hub.ts` | Types | `FinanceHubTab`, `FinanceActivityType`, `FinanceDashboardStats`, `TopUpPackage` enrichi, `CashoutLimits`, `LoginStreak`, `BadgeReward`, `WalletMission` enrichi |
| `services/finance-hub-api.ts` | Service | `fetchDashboardStats()`, `fetchActivity()`, `getStreak()`, `claimBadge()`, `getCashoutLimits()` |
| `stores/finance-hub-store.ts` | Store | Dashboard stats, activity feed, streaks, badges, cashout limits |
| `app/wallet/finance-hub.tsx` | Écran | Dashboard principal Finance Hub (solde, actions rapides, activité récente, streaks) |
| `app/wallet/badges.tsx` | Écran | Collection de badges financiers, progression |
| `__tests__/sprint-mf1-finance-hub.test.ts` | Tests | Types, service, store, écrans, i18n |

**Dépendance desktop :** `finance-hub-service.ts` (S44)

---

### M-Phase 2 — KYC & P2P + ImuCoin Economy (M-F2 → M-F7)

> 6 sprints couvrant KYC, P2P, Economy IC (fondations + cycle + commissions).

#### M-F2 — KYC Onfido (Desktop S45)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/kyc-verification.ts` | Types | `KycDocumentType`, `KycTier` (0-3), `VerificationAttempt`, `KycProfile`, `KycRequirement` |
| `services/kyc-verification-api.ts` | Service | `getKycProfile()`, `startVerification()`, `uploadDocument()` (expo-image-picker + expo-file-system), `submitSelfie()` (expo-camera), `getAttemptHistory()` |
| `stores/kyc-verification-store.ts` | Store | Profil KYC, documents uploadés, progression étapes |
| `app/wallet/kyc-verification.tsx` | Écran | Parcours KYC step-by-step (document → selfie → validation) |
| `app/wallet/kyc-status.tsx` | Écran | Statut vérification, tier actuel, limites |
| `__tests__/sprint-mf2-kyc.test.ts` | Tests | ~90 tests |

#### M-F3 — P2P Payments (Desktop S45)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/p2p-payment.ts` | Types | `P2PTransfer`, `P2PRequest`, `P2PContact`, `P2PQRCode`, `P2PLimits` |
| `services/p2p-payment-api.ts` | Service | `sendTransfer()`, `requestPayment()`, `getTransfers()`, `getContacts()`, `generateQRCode()`, `acceptTransfer()`, `declineTransfer()` |
| `stores/p2p-payment-store.ts` | Store | Transferts, requêtes, contacts, QR codes |
| `app/wallet/p2p-send.tsx` | Écran | Envoi P2P (sélection contact, montant, confirmation) |
| `app/wallet/p2p-request.tsx` | Écran | Demande de paiement |
| `app/wallet/p2p-history.tsx` | Écran | Historique P2P avec filtres |
| `components/wallet/QRScanner.tsx` | Composant | Scanner QR expo-camera/barcode-scanner |
| `__tests__/sprint-mf3-p2p.test.ts` | Tests | ~95 tests |

#### M-F4 — Economy Transactions (Desktop S46)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/economy-transactions.ts` | Types | `IcTransactionType` (15 types), `TransactionFilter`, `WalletStats`, `CategoryStat` |
| `services/economy-transactions-api.ts` | Service | `getTransactions()`, `getStats()`, `getCategoryStats()`, `exportTransactions()` |
| `stores/economy-transactions-store.ts` | Store | Transactions IC, stats, filtres, catégories |
| `app/wallet/economy-transactions.tsx` | Écran | Historique IC enrichi (15 types, search, filtres, graphiques) |
| `__tests__/sprint-mf4-economy-tx.test.ts` | Tests | ~85 tests |

#### M-F5 — Split Bill (Desktop S47)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/split-bill.ts` | Types | `SplitBill`, `SplitBillParticipant`, `GroupPool`, `PoolContribution` |
| `services/split-bill-api.ts` | Service | `createSplitBill()`, `createGroupPool()`, `addParticipant()`, `contributeToPool()`, `settleBill()`, `getHistory()` |
| `stores/split-bill-store.ts` | Store | Split bills actifs, pools, historique |
| `app/wallet/split-bill.tsx` | Écran | Création split (égal/custom/pourcentage), ajout participants |
| `app/wallet/group-pool.tsx` | Écran | Cagnotte de groupe (progression, contributions) |
| `__tests__/sprint-mf5-split-bill.test.ts` | Tests | ~90 tests |

#### M-F6 — Economy Cycle (Desktop S48)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/economy-cycle.ts` | Types | `ConversionRate`, `ConversionResult`, `EconomyFlow`, `PurchasePackage`, `WithdrawalRecord` |
| `services/economy-cycle-api.ts` | Service | `getWalletBalance()`, `convertCoins()`, `withdraw()`, `purchasePackage()`, `redeemReward()` |
| `stores/economy-cycle-store.ts` | Store | Balance étendue, conversions, flux économiques |
| `app/wallet/economy-cycle.tsx` | Écran | Conversion IC↔fiat, packages, historique retraits |
| `__tests__/sprint-mf6-economy-cycle.test.ts` | Tests | ~85 tests |

#### M-F7 — Commissions & Revenue (Desktop S49)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/commission-revenue.ts` | Types | `CommissionRule`, `PaymentSplit`, `CreatorPayout`, `PlatformRevenue` |
| `services/commission-revenue-api.ts` | Service | `getCommissionRules()`, `calculateCommission()`, `executePaymentSplits()`, `getCreatorPayouts()` |
| `stores/commission-revenue-store.ts` | Store | Règles commissions, splits, payouts créateurs |
| `app/wallet/commission-dashboard.tsx` | Écran | Dashboard commissions (règles, revenus, audit log) |
| `__tests__/sprint-mf7-commission.test.ts` | Tests | ~80 tests |

**Milestone M-Phase 2 :** Finance Hub + KYC + P2P + Economy IC complète

---

### M-Phase 3 — Social Economy & Cartes (M-F8 → M-F14)

> Cartes virtuelles, paiements mobiles, tips, cadeaux live, épargne, boosts, cashback.

#### M-F8 — Cartes Virtuelles (Desktop S50)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/virtual-card.ts` | Types | `VirtualCard`, `CardTransaction`, `CardTier`, `SpendLimit`, `CreateCardRequest` |
| `services/virtual-card-api.ts` | Service | `getCards()`, `createCard()`, `freezeCard()`, `getTransactions()`, `setSpendLimit()` |
| `stores/virtual-card-store.ts` | Store | Cartes, transactions, limites |
| `app/wallet/virtual-cards.tsx` | Écran | Liste cartes (animation flip), gestion, historique |
| `app/wallet/card-detail.tsx` | Écran | Détail carte, transactions, paramètres |
| `components/wallet/CardFlip.tsx` | Composant | Animation carte (Reanimated flip 3D) |
| `__tests__/sprint-mf8-cards.test.ts` | Tests | ~85 tests |

#### M-F9 — Tips / Pourboires (Desktop S51)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/tipping.ts` | Types | `Tip`, `TipStats`, `TipLeaderboardEntry`, `TipSettings`, `TipReaction` |
| `services/tipping-api.ts` | Service | `sendTip()`, `getSentTips()`, `getReceivedTips()`, `getLeaderboard()` |
| `stores/tipping-store.ts` | Store | Tips envoyés/reçus, leaderboard, stats |
| `app/wallet/tipping.tsx` | Écran | Envoi tip (quick amounts, animations), historique |
| `components/wallet/TipButton.tsx` | Composant | Bouton tip intégrable (chat, feed, profil) |
| `__tests__/sprint-mf9-tipping.test.ts` | Tests | ~80 tests |

#### M-F10 — Apple Pay / Google Pay / QR / NFC (Desktop S52)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/mobile-pay.ts` | Types | `MobilePayProvider`, `QRPayment`, `PaymentLink`, `NFCTransaction` |
| `services/mobile-pay-api.ts` | Service | `setupProvider()`, `createQRCode()`, `createPaymentLink()`, `processNFCTransaction()` |
| `stores/mobile-pay-store.ts` | Store | Providers configurés, QR, NFC, liens paiement |
| `app/wallet/mobile-pay.tsx` | Écran | Hub paiements mobiles (Apple Pay, Google Pay, QR, NFC) |
| `app/wallet/qr-payment.tsx` | Écran | Scan & génération QR (expo-barcode-scanner) |
| `__tests__/sprint-mf10-mobile-pay.test.ts` | Tests | ~80 tests |

#### M-F11 — Cadeaux Live (Desktop S53)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/live-gift.ts` | Types | `LiveGiftDefinition`, `LiveGift`, `GiftTier`, `GiftLeaderboardEntry` |
| `services/live-gift-api.ts` | Service | `sendGift()`, `getSentGifts()`, `getReceivedGifts()`, `getLeaderboard()` |
| `stores/live-gift-store.ts` | Store | Cadeaux envoyés/reçus, leaderboard, animations |
| `app/wallet/live-gifts.tsx` | Écran | Catalogue cadeaux (7 tiers), envoi, leaderboard |
| `components/wallet/GiftAnimation.tsx` | Composant | Animations Lottie pour chaque tier (Rose→Castle) |
| `__tests__/sprint-mf11-live-gifts.test.ts` | Tests | ~85 tests |

#### M-F12 — Coffres d'Épargne (Desktop S54)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/savings-vault.ts` | Types | `SavingsVault`, `AutoSavingsRule`, `SavingsTransaction`, `SavingsStats` |
| `services/savings-vault-api.ts` | Service | `getVaults()`, `createVault()`, `depositToVault()`, `createAutoRule()` |
| `stores/savings-vault-store.ts` | Store | Coffres, règles auto, transactions épargne |
| `app/wallet/savings-vaults.tsx` | Écran | Liste coffres (emoji, progression), création |
| `app/wallet/vault-detail.tsx` | Écran | Détail coffre, dépôt/retrait, règles auto |
| `__tests__/sprint-mf12-savings.test.ts` | Tests | ~85 tests |

#### M-F13 — Social Boosts (Desktop S55)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/social-boosts.ts` | Types | `SuperLike`, `PremiumVote`, `ProfileBoost`, `BoostStats` |
| `services/social-boosts-api.ts` | Service | `sendSuperLike()`, `castPremiumVote()`, `activateBoost()`, `getBoostStats()` |
| `stores/social-boosts-store.ts` | Store | Boosts actifs, super-likes, votes premium |
| `app/wallet/social-boosts.tsx` | Écran | Achat/utilisation boosts, historique, stats |
| `__tests__/sprint-mf13-social-boosts.test.ts` | Tests | ~80 tests |

#### M-F14 — Cashback & Parrainage (Desktop S56)

| Fichier | Type | Contenu |
|---------|------|---------|
| `types/cashback-referral.ts` | Types | `CashbackTransaction`, `Referral`, `AmbassadorProfile`, `ReferralCode` |
| `services/cashback-referral-api.ts` | Service | `getCashbackStats()`, `getReferrals()`, `createReferralCode()`, `getAmbassadorProfile()` |
| `stores/cashback-referral-store.ts` | Store | Cashback, parrainages, statut ambassadeur |
| `app/wallet/cashback.tsx` | Écran | Dashboard cashback, historique, niveaux |
| `app/wallet/referral.tsx` | Écran | Code parrainage (partage deep-link), amis parrainés |
| `__tests__/sprint-mf14-cashback-referral.test.ts` | Tests | ~85 tests |

**Milestone M-Phase 3 :** Cartes virtuelles + Épargne + Social Economy complète + Paiements mobiles natifs

---

### M-Phase 4 — Creator & Gaming Economy (M-F15 → M-F19)

> Économie créateurs avancée + Gaming Economy.

#### M-F15 — Cadeaux Live Avancés (Desktop S57)

| Fichier | Contenu |
|---------|---------|
| `types/live-gift-advanced.ts` | Tables Supabase, RPCs commissions, combos |
| `services/live-gift-advanced-api.ts` | RPCs create_gift_transaction, get_gift_leaderboard, commissions |
| Mise à jour `live-gift-store.ts` | Commissions, split créateur/plateforme |
| `app/wallet/gift-commissions.tsx` | Dashboard commissions cadeaux |
| `__tests__/sprint-mf15-gifts-advanced.test.ts` | ~80 tests |

#### M-F16 — Tournois Gaming (Desktop S58)

| Fichier | Contenu |
|---------|---------|
| `types/gaming-tournament.ts` | `Tournament`, `TournamentEntry`, `SeasonPass`, `PrizeDistribution` |
| `services/gaming-tournament-api.ts` | `getTournaments()`, `joinTournament()`, `buySeasonPass()` |
| `stores/gaming-tournament-store.ts` | Tournois, inscriptions, pass saison |
| `app/wallet/gaming-tournaments.tsx` | Liste tournois, inscription, prize pools |
| `app/wallet/season-pass.tsx` | Achat & progression pass saison |
| `__tests__/sprint-mf16-tournaments.test.ts` | ~85 tests |

#### M-F17 — Abonnements Fans & Créateurs (Desktop S59)

| Fichier | Contenu |
|---------|---------|
| `types/creator-subscription.ts` | `CreatorSubscriptionTier`, `TierPerk`, `CreatorContentSale` |
| `services/creator-subscription-api.ts` | `getCreatorTiers()`, `subscribe()`, `getContentSales()`, `getRevenueSummary()` |
| `stores/creator-subscription-store.ts` | Tiers, abonnés, ventes, revenus |
| `app/wallet/creator-subscriptions.tsx` | Dashboard créateur (tiers, abonnés, revenus) |
| `app/wallet/fan-subscription.tsx` | S'abonner à un créateur (3 tiers) |
| `__tests__/sprint-mf17-creator-subs.test.ts` | ~80 tests |

#### M-F18 — Boutique Gaming (Desktop S60)

| Fichier | Contenu |
|---------|---------|
| `types/gaming-shop.ts` | `GamingItem`, `LootboxConfig`, `MarketplaceListing`, raretés |
| `services/gaming-shop-api.ts` | `getShop()`, `buyItem()`, `openLootbox()`, `getInventory()`, `listOnMarketplace()` |
| `stores/gaming-shop-store.ts` | Boutique, inventaire, marketplace |
| `app/wallet/gaming-shop.tsx` | Boutique (rotation, raretés, animations ouverture) |
| `app/wallet/inventory.tsx` | Inventaire joueur, équipement |
| `__tests__/sprint-mf18-gaming-shop.test.ts` | ~85 tests |

#### M-F19 — Business Hub (Desktop S61)

| Fichier | Contenu |
|---------|---------|
| `types/business-hub.ts` | `MerchantProfile`, `QRTerminal`, `Invoice`, `BusinessStats` |
| `services/business-hub-api.ts` | `getMerchantProfile()`, `generateTerminalQR()`, `createInvoice()`, `getBusinessStats()` |
| `stores/business-hub-store.ts` | Profil marchand, terminal, factures |
| `app/wallet/business-hub.tsx` | Dashboard marchand (terminal QR, factures, stats) |
| `app/wallet/merchant-terminal.tsx` | Terminal de paiement QR mobile |
| `__tests__/sprint-mf19-business-hub.test.ts` | ~85 tests |

**Milestone M-Phase 4 :** Creator Economy + Gaming Economy + Business Hub opérationnels

---

### M-Phase 5 — Store Economy & Marketplace (M-F20 → M-F22)

#### M-F20 — Store Enrichi (Desktop S62)

| Fichier | Contenu |
|---------|---------|
| `types/store-enhanced.ts` | `StoreItem`, `StoreReview`, `StoreBundle`, `StorePromo`, `RefundReason` |
| `services/store-enhanced-api.ts` | `getItems()`, `getFeatured()`, `submitReview()`, `getBundles()`, `requestRefund()` |
| `stores/store-enhanced-store.ts` | Items, reviews, bundles, promos |
| `app/wallet/store-enhanced.tsx` | Store enrichi (bundles, promos, reviews) |
| `__tests__/sprint-mf20-store-enhanced.test.ts` | ~80 tests |

#### M-F21 — Developer Payouts v2 (Desktop S63)

| Fichier | Contenu |
|---------|---------|
| `types/developer-payout.ts` | `DeveloperPayout`, `PayoutConfig`, `TaxReport`, `EarningsByMonth` |
| `services/developer-payout-api.ts` | `getDashboardStats()`, `getPayouts()`, `setupConfig()`, `generateTaxReport()` |
| `stores/developer-payout-store.ts` | Earnings, payouts, rapports fiscaux |
| `app/wallet/developer-payouts.tsx` | Dashboard développeur (gains, payouts, taxes) |
| `__tests__/sprint-mf21-dev-payouts.test.ts` | ~75 tests |

#### M-F22 — Marketplace Escrow (Desktop S64)

| Fichier | Contenu |
|---------|---------|
| `types/marketplace-escrow.ts` | `EscrowTransaction`, `MarketplaceDispute`, `ServiceReservation` |
| `services/marketplace-escrow-api.ts` | `holdFunds()`, `releaseFunds()`, `openDispute()`, `getReservations()` |
| `stores/marketplace-escrow-store.ts` | Escrow, disputes, réservations |
| `app/wallet/marketplace-escrow.tsx` | Transactions escrow, disputes, litiges |
| `__tests__/sprint-mf22-escrow.test.ts` | ~80 tests |

**Milestone M-Phase 5 :** Store + Developer Payouts + Marketplace complète

---

### M-Phase 6 — Investissements & Crypto (M-F23 → M-F24)

#### M-F23 — Investissements (Desktop S65)

| Fichier | Contenu |
|---------|---------|
| `types/investment.ts` | `Holding`, `Portfolio`, `MarketAsset`, `InvestmentOrder`, `WatchlistItem` |
| `services/investment-api.ts` | `getPortfolio()`, `placeOrder()`, `getMarketData()`, `getWatchlist()`, `getPriceHistory()` |
| `stores/investment-store.ts` | Portfolio, ordres, watchlist, market data |
| `app/wallet/investments.tsx` | Portfolio (graphique performance), ordres, marché |
| `app/wallet/asset-detail.tsx` | Détail actif (chart, buy/sell, historique) |
| `components/wallet/PriceChart.tsx` | Graphique prix (react-native-svg) |
| `__tests__/sprint-mf23-investments.test.ts` | ~85 tests |

#### M-F24 — Crypto Hub (Desktop S66)

| Fichier | Contenu |
|---------|---------|
| `types/crypto-hub.ts` | `CryptoHolding`, `CryptoPortfolio`, `CryptoMarketData`, `StakingPosition`, `PriceAlert` |
| `services/crypto-hub-api.ts` | `getPortfolio()`, `buyCrypto()`, `sellCrypto()`, `stakeCoins()`, `setPriceAlert()` |
| `stores/crypto-hub-store.ts` | Portfolio crypto, staking, alertes prix |
| `app/wallet/crypto-hub.tsx` | Portfolio crypto (BTC, ETH, SOL), marché |
| `app/wallet/crypto-detail.tsx` | Détail crypto (buy/sell, stake, alertes) |
| `__tests__/sprint-mf24-crypto-hub.test.ts` | ~85 tests |

**Milestone M-Phase 6 :** Investissements + Crypto via partenaires régulés

---

### M-Phase 7 — Publicité & Premium (M-F25 → M-F26)

#### M-F25 — Régie Publicitaire (Desktop S67)

| Fichier | Contenu |
|---------|---------|
| `types/ad-campaign.ts` | `AdCampaign`, `AdTargeting`, `AdCreative`, `AdvertiserDashboardStats` |
| `services/ad-campaign-api.ts` | `createCampaign()`, `getCampaigns()`, `getDashboardStats()`, `trackImpression()` |
| `stores/ad-campaign-store.ts` | Campagnes, statistiques, créatifs |
| `app/wallet/ad-campaigns.tsx` | Création/gestion campagnes pub, dashboard |
| `__tests__/sprint-mf25-ad-campaigns.test.ts` | ~80 tests |

#### M-F26 — Premium Multi-Tiers (Desktop S68)

| Fichier | Contenu |
|---------|---------|
| `types/premium-subscription.ts` | `PremiumPlan`, `PremiumSubscription`, `RevenueDashboard`, `RevenueProjection` |
| `services/premium-subscription-api.ts` | `getPremiumPlans()`, `subscribeToPlan()`, `getMetrics()`, `exportData()` |
| `stores/premium-subscription-store.ts` | Plans premium, métriques, projections |
| `app/wallet/premium-revenue.tsx` | Dashboard Premium (conversion, revenus par pilier, export) |
| `__tests__/sprint-mf26-premium.test.ts` | ~80 tests |

**Milestone M-Phase 7 :** Publicité native + Premium V2 complet

---

### M-Phase 8 — IA Finance & Compliance (M-F27)

> Sprint consolidé (S69+S70 desktop) vu que les 2 modules sont indépendants.

#### M-F27 — Alice Finance IA + Compliance

| Fichier | Contenu |
|---------|---------|
| `types/alice-finance.ts` | `SpendingCategory`, `ProactiveAlert`, `SmartBudget`, `FinancialInsight`, `AliceOverview` |
| `services/alice-finance-api.ts` | `getOverview()`, `getSpendingAnalysis()`, `getAlerts()`, `getBudgets()`, `createBudget()` |
| `stores/alice-finance-store.ts` | Overview, analyses, alertes, budgets, insights |
| `app/wallet/alice-finance.tsx` | Dashboard Alice (health score, dépenses, alertes, budgets) |
| `types/compliance.ts` | `Kyc3Application`, `ScaChallenge`, `FraudAssessment`, `PciDssReport` |
| `services/compliance-api.ts` | `getKyc3Application()`, `submitKyc3()`, `assessFraud()`, `getAuditLog()` |
| `stores/compliance-store.ts` | KYC3, SCA, fraude, audit PCI DSS |
| `app/wallet/compliance.tsx` | Dashboard compliance (KYC3, fraude, audit) |
| `__tests__/sprint-mf27-alice-compliance.test.ts` | ~130 tests |

**Milestone M-Phase 8 :** IA Finance + Compliance opérationnels — **Finance Hub Mobile v1 COMPLET**

---

## Timeline Mobile Finance

```
Sprint    M-F1  M-F3  M-F5  M-F7  M-F9  M-F11 M-F13 M-F15 M-F17 M-F19 M-F21 M-F23 M-F25 M-F27
           │     │     │     │     │     │     │     │     │     │     │     │     │     │
Phase 1    █│                                                                            
Phase 2    │ ████████████│                                                               
Phase 3    │     │     │ ████████████████████│                                           
Phase 4    │     │     │     │     │     │   ██████████████│                             
Phase 5    │     │     │     │     │     │     │     │     █████████│                    
Phase 6    │     │     │     │     │     │     │     │     │     │  ████│                
Phase 7    │     │     │     │     │     │     │     │     │     │     │████│            
Phase 8    │     │     │     │     │     │     │     │     │     │     │    ██│           
```

---

## Résumé des livrables

| Phase | Sprints | Nouveaux Fichiers | Écrans | Tests estimés |
|:-----:|:-------:|:-----------------:|:------:|:-------------:|
| **1** | M-F1 | 6 | 2 | ~90 |
| **2** | M-F2→F7 | 30 | 12 | ~525 |
| **3** | M-F8→F14 | 38 | 14 | ~580 |
| **4** | M-F15→F19 | 23 | 10 | ~415 |
| **5** | M-F20→F22 | 15 | 3 | ~235 |
| **6** | M-F23→F24 | 14 | 4 | ~170 |
| **7** | M-F25→F26 | 10 | 2 | ~160 |
| **8** | M-F27 | 9 | 2 | ~130 |
| **Total** | **27 sprints** | **~145 fichiers** | **~49 écrans** | **~2 305 tests** |

**Projection test finale :** 2788 (actuel) + ~2305 (finance) = **~5093 tests mobile**

---

## Navigation Wallet (Mise à jour)

Mise à jour de `app/wallet/_layout.tsx` progressive par sprint :

```
app/wallet/
├── _layout.tsx                    # Stack navigator (existant, à enrichir)
├── index.tsx                      # ✅ Existant — overview/balance/transactions
├── topup.tsx                      # ✅ Existant — Stripe top-up
├── transactions.tsx               # ✅ Existant — full history
├── payment-methods.tsx            # ✅ Existant — card management
├── payment-modal.tsx              # ✅ Existant — checkout flow
├── subscription.tsx               # ✅ Existant — plan selection
├── manage-subscriptions.tsx       # ✅ Existant — plan management
├── withdraw.tsx                   # ✅ Existant — cashout
├── invoices.tsx                   # ✅ Existant — receipts
├── creator-settings.tsx           # ✅ Existant — payout & tax
│
│  ── M-F1 ──
├── finance-hub.tsx                # M-F1 — Dashboard Finance Hub
├── badges.tsx                     # M-F1 — Badges financiers
│
│  ── M-F2→F3 ──
├── kyc-verification.tsx           # M-F2 — Parcours KYC
├── kyc-status.tsx                 # M-F2 — Statut KYC
├── p2p-send.tsx                   # M-F3 — Envoi P2P
├── p2p-request.tsx                # M-F3 — Demande paiement
├── p2p-history.tsx                # M-F3 — Historique P2P
│
│  ── M-F4→F7 ──
├── economy-transactions.tsx       # M-F4 — Transactions IC enrichies
├── split-bill.tsx                 # M-F5 — Split bill
├── group-pool.tsx                 # M-F5 — Cagnotte groupe
├── economy-cycle.tsx              # M-F6 — Conversion IC↔fiat
├── commission-dashboard.tsx       # M-F7 — Dashboard commissions
│
│  ── M-F8→F14 ──
├── virtual-cards.tsx              # M-F8 — Cartes virtuelles
├── card-detail.tsx                # M-F8 — Détail carte
├── tipping.tsx                    # M-F9 — Tips/pourboires
├── mobile-pay.tsx                 # M-F10 — Apple/Google Pay
├── qr-payment.tsx                 # M-F10 — Paiement QR
├── live-gifts.tsx                 # M-F11 — Cadeaux Live
├── savings-vaults.tsx             # M-F12 — Coffres épargne
├── vault-detail.tsx               # M-F12 — Détail coffre
├── social-boosts.tsx              # M-F13 — Boosts sociaux
├── cashback.tsx                   # M-F14 — Dashboard cashback
├── referral.tsx                   # M-F14 — Parrainage
│
│  ── M-F15→F19 ──
├── gift-commissions.tsx           # M-F15 — Commissions cadeaux
├── gaming-tournaments.tsx         # M-F16 — Tournois
├── season-pass.tsx                # M-F16 — Pass saison
├── creator-subscriptions.tsx      # M-F17 — Dashboard créateur
├── fan-subscription.tsx           # M-F17 — Abonnement fan
├── gaming-shop.tsx                # M-F18 — Boutique gaming
├── inventory.tsx                  # M-F18 — Inventaire
├── business-hub.tsx               # M-F19 — Dashboard marchand
├── merchant-terminal.tsx          # M-F19 — Terminal QR
│
│  ── M-F20→F22 ──
├── store-enhanced.tsx             # M-F20 — Store enrichi
├── developer-payouts.tsx          # M-F21 — Payouts développeur
├── marketplace-escrow.tsx         # M-F22 — Escrow marketplace
│
│  ── M-F23→F24 ──
├── investments.tsx                # M-F23 — Portfolio investissement
├── asset-detail.tsx               # M-F23 — Détail actif
├── crypto-hub.tsx                 # M-F24 — Portfolio crypto
├── crypto-detail.tsx              # M-F24 — Détail crypto
│
│  ── M-F25→F26 ──
├── ad-campaigns.tsx               # M-F25 — Campagnes pub
├── premium-revenue.tsx            # M-F26 — Premium dashboard
│
│  ── M-F27 ──
├── alice-finance.tsx              # M-F27 — Alice IA Finance
└── compliance.tsx                 # M-F27 — Compliance dashboard
```

---

## Adaptations Mobile vs Desktop

| Aspect | Desktop (Electron) | Mobile (Expo/RN) |
|--------|-------------------|-------------------|
| **Tests** | vitest + readFileSync pattern | Jest 30 + Supabase chain mocks |
| **Routing** | React Router (react-router-dom) | Expo Router (file-based app/) |
| **i18n** | react-i18next (7 locales) | i18n-js (3 locales: en/fr/ja) |
| **State** | Zustand 5 (in-memory) | Zustand 5 + AsyncStorage persist |
| **Camera/QR** | N/A | expo-camera, expo-barcode-scanner |
| **NFC** | N/A | react-native-nfc-manager |
| **Biométrie** | N/A | expo-local-authentication |
| **Paiement natif** | Stripe.js | @stripe/stripe-react-native + Apple Pay + Google Pay |
| **Animations** | CSS transitions | Reanimated 4 + Lottie |
| **Charts** | recharts | react-native-svg + victory-native |
| **Stockage sécurisé** | N/A | expo-secure-store (tokens, clés) |
| **Deep links** | N/A | expo-linking (QR, referral, payment links) |
| **Push** | N/A | expo-notifications (alertes, transactions) |

---

## Références Desktop

| Sprint Mobile | Service Desktop (source) | Page Desktop |
|:-------------:|-------------------------|--------------|
| M-F1 | `finance-hub-service.ts` | `FinanceHubPage.tsx` |
| M-F2 | `kyc-verification-service.ts` | `KycVerificationPage.tsx` |
| M-F3 | `p2p-payment-service.ts` | `P2PPaymentPage.tsx` |
| M-F4 | `economy-transactions-service.ts` | `EconomyTransactionsPage.tsx` |
| M-F5 | `split-bill-service.ts` | `SplitBillPage.tsx` |
| M-F6 | `economy-cycle-service.ts` | `EconomyCyclePage.tsx` |
| M-F7 | `commission-revenue-service.ts` | `CommissionDashboardPage.tsx` |
| M-F8 | `virtual-card-service.ts` | `VirtualCardPage.tsx` |
| M-F9 | `tipping-service.ts` | `TippingPage.tsx` |
| M-F10 | `mobile-pay-service.ts` | `MobilePayPage.tsx` |
| M-F11 | `live-gift-service.ts` | `LiveGiftPage.tsx` |
| M-F12 | `savings-vault-service.ts` | `SavingsVaultPage.tsx` |
| M-F13 | `social-boosts-service.ts` | — (*intégré dans Social*) |
| M-F14 | `cashback-referral-service.ts` | `CashbackReferralPage.tsx` |
| M-F15 | `live-gift-service.ts` (avancé) | — (*RPCs + commissions*) |
| M-F16 | `gaming-tournament-service.ts` | `GamingTournamentPage.tsx` |
| M-F17 | `creator-subscription-service.ts` | `CreatorSubscriptionPage.tsx` |
| M-F18 | `gaming-shop-service.ts` | `GamingShopPage.tsx` |
| M-F19 | `business-hub-service.ts` | — (*intégré dans Finance*) |
| M-F20 | `store-enhanced-service.ts` | `StoreEnhancedPage.tsx` |
| M-F21 | `developer-payout-service.ts` | `DeveloperPayoutPage.tsx` |
| M-F22 | `marketplace-escrow-service.ts` | `MarketplaceEscrowPage.tsx` |
| M-F23 | `investment-service.ts` | `InvestmentPage.tsx` |
| M-F24 | `crypto-hub-service.ts` | `CryptoHubPage.tsx` |
| M-F25 | `ad-campaign-service.ts` | `AdCampaignsPage.tsx` |
| M-F26 | `premium-subscription-service.ts` | `PremiumRevenuePage.tsx` |
| M-F27 | `alice-finance-service.ts` + `compliance-service.ts` | `AliceFinancePage.tsx` + `CompliancePage.tsx` |
