# 💳 ROADMAP FINANCE GLOBAL — ImuBank & ImuEconomy

**Périmètre :** Vue consolidée des 2 roadmaps finance :  
→ `ROADMAP_IMUBANK_WALLET.md` (18 sprints · Wallet, P2P, Cartes, KYC, Épargne, Creator/Business, Invest, Crypto, IA)  
→ `ROADMAP_IMUECONOMY_MONETISATION.md` (15 sprints · ImuCoin, Social/Gaming/Store/Creator/Business Economy, Pub)  
**Durée totale projet Finance :** ~33 sprints effectifs (parallélisation) · 8 macro-phases · ~50 semaines

### 📊 Progression Desktop App

| Sprint Desktop | Contenu Finance | Tests | Status |
|:--------------:|-----------------|:-----:|:------:|
| **S44** | IMUBANK 1-4 (Wallet MVP, Stripe, Gamification, Retrait) | +125 → 3147 | ✅ |
| **S45** | IMUBANK 5 (KYC Onfido) + IMUBANK 7 (P2P Payments) | +238 → 3385 | ✅ |
| **S46** | ECONOMY A1 (15 types transactions IC + stats wallet) | +285 → 3670 | ✅ |
| **S47** | IMUBANK 8 (Split Bill + Cagnottes de groupe) | +201 → 3871 | ✅ |
| **S48** | ECONOMY A2 (Cycle économique IC complet) | +192 → 4063 | ✅ |
| **S49** | ECONOMY A3 (Commissions dynamiques, revenue share) | +132 → 4195 | ✅ |
| **S50** | IMUBANK 9 (Cartes virtuelles Stripe Issuing) | +110 → 4305 | ✅ |
| **S51** | ECONOMY B1 (Tips / Pourboires) | +98 → 4390 | ✅ |
| **S52** | IMUBANK 10 (Apple Pay / Google Pay / QR / NFC / Liens) | +100 → 4490 | ✅ |
| **S53** | ECONOMY B2 (Cadeaux Live — Rose 50IC → Castle 10000IC) | +111 → 4601 | ✅ |
| **S54** | IMUBANK 11 (Coffres d'épargne + règles automatiques) | +109 → 4710 | ✅ |
| **S55** | ECONOMY B3 (Super-likes, votes premium, boosts payants) | +122 → 4832 | ✅ |
| **S56** | IMUBANK 12 (Cashback + Programme de parrainage) | +132 → 4964 | ✅ |
| **S57** | IMUBANK 13 (Cadeaux Live tables + RPCs + commissions) | +102 → 5066 | ✅ |
| **S58** | ECONOMY C1 (Tickets tournoi + pass saison gaming) | +97 → 5163 | ✅ |
| **S59** | IMUBANK 14 (Abonnements fans 3 tiers + ventes créateurs) | +94 → 5257 | ✅ |
| **S60** | ECONOMY C2 (Skins, items, lootboxes, boutique gaming) | +102 → 5359 | ✅ |
| **S61** | IMUBANK 15 (Business Hub — marchands, QR, facturation) | +109 → 5468 | ✅ |

**✅ Macro-Phase 3 — Social Economy & Cartes : TERMINÉE (S50→S56)**

**✅ Macro-Phase 4 — Creator & Gaming Economy : TERMINÉE (S57→S61)**

| **S62** | ECONOMY D1 (Store enrichi — avis, remboursements, bundles, promos) | +100 → 5568 | ✅ |
| **S63** | ECONOMY D2 (Developer payouts v2 — auto, fiscaux, multi-devises) | +95 → 5663 | ✅ |
| **S64** | ECONOMY D3 (Marketplace services — escrow, réservation, litiges) | +105 → 5768 | ✅ |

**✅ Macro-Phase 5 — Store Economy & Marketplace : TERMINÉE (S62→S64)**

| **S65** | IMUBANK 16 (Investissements — actions fractionnées, ETF, watchlist) | +100 → 5868 | ✅ |
| **S66** | IMUBANK 17 (Crypto Hub — BTC, ETH, SOL, staking, alertes) | +100 → 5968 | ✅ |

**✅ Macro-Phase 6 — Investissements & Crypto : TERMINÉE (S65→S66)**

| **S67** | ECONOMY E1 (Régie pub self-service — 5 formats, ciblage, dashboard) | +89 → 6112 | ✅ |
| **S68** | ECONOMY E2 (Premium multi-tiers, dashboard revenus consolidé, export) | +89 → 6201 | ✅ |

**✅ Macro-Phase 7 — Publicité & Premium : TERMINÉE (S67→S68)**

| **S69** | IMUBANK 18 (Alice Finance — analyse dépenses IA, alertes proactives, budgets intelligents) | +113 → 6319 | ✅ |
| **S70** | Compliance (KYC3, PSD2/SCA, détection fraude ML, audit PCI DSS) | +118 → 6437 | ✅ |

**✅ Macro-Phase 8 — IA Finance & Compliance : TERMINÉE (S69→S70)**

---

## Timeline consolidée

```
Semaine    1    5    9    13   17   21   25   29   33   37   41   45   50
           │    │    │    │    │    │    │    │    │    │    │    │    │
ImuBank    ████████████████████████████████████████████████████████████
           Ph1  │Ph2 │Ph3 │    Ph4 │ Ph5│Ph6 │
           Cons.│KYC │Cart│  Creat.│Inv │IA  │
           Wllt │Core│Épgn│  Biz   │Cryp│Comp│
           │    │    │    │    │    │    │    │    │    │    │    │    │
ImuEcon         ██████████████████████████████████████████████████
                PhA  │PhB │    PhC │    PhD │PhE │
                IC   │Soc.│  Gaming│  Store │Pub │
                Foun │Eco │  Eco   │  Eco   │Prem│
```

---

## Macro-phases intégrées

### Macro-Phase 1 — Fondations (Semaines 1-8)

> Corriger l'existant, unifier les types, établir le cycle ImuCoin complet.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **IMUBANK 1** ✅ | Wallet | 2 sem. | Harmoniser types shared-types ↔ mobile, corriger noms tables — *Desktop S44* |
| **IMUBANK 2** ✅ | Wallet | 2 sem. | 7 Edge Functions Stripe (checkout, webhook, payment methods) — *Desktop S44* |
| **IMUBANK 3** ✅ | Wallet | 2 sem. | Gamification ↔ Wallet (claim mission, streaks, badges) — *Desktop S44* |
| **IMUBANK 4** ✅ | Wallet | 2 sem. | Retrait (Stripe Connect), tests e2e wallet complet — *Desktop S44* |

**Milestone :** ✅ Wallet ImuCoin MVP stable et testé — **COMPLÉTÉ (Desktop S44 : 3147 tests)**  
**Dépendances :** Aucune (bloque tout le reste)  
**Équipe :** 2 backend, 1 mobile, 1 QA

---

### Macro-Phase 2 — KYC & Finance Hub + ImuCoin Economy (Semaines 9-16)

> Lancer le Finance Hub, le KYC, les P2P et l'économie ImuCoin étendue.  
> **Parallélisation :** ImuBank Phase 2 + ImuEconomy Phase A en parallèle.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **IMUBANK 5** ✅ | Wallet | 2 sem. | KYC réel niveaux 0-2 (Onfido) — *Desktop S45 : kyc-verification-service.ts + KycVerificationPage.tsx (238 tests)* |
| **IMUBANK 6** ✅ | Wallet | 2 sem. | Finance Hub dashboard + navigation — *Desktop S44 : finance-hub-service.ts + FinanceHubPage.tsx (125 tests)* |
| **ECONOMY A1** ✅ | Economy | 2 sem. | Extension 15 types transactions IC + stats wallet — *Desktop S46 : economy-transactions-service.ts + EconomyTransactionsPage.tsx (285 tests)* |
| **IMUBANK 7** ✅ | Wallet | 2 sem. | P2P dans le chat (send, request) — *Desktop S45 : p2p-payment-service.ts + P2PPaymentPage.tsx (238 tests)* |
| **ECONOMY A2** ✅ | Economy | 2 sem. | Cycle économique IC complet (conversion IC↔fiat) — *Desktop S48 : economy-cycle-service.ts + EconomyCyclePage.tsx (+192 tests → 4063)* |
| **IMUBANK 8** ✅ | Wallet | 2 sem. | Split Bill + Cagnottes de groupe — *Desktop S47 : split-bill-service.ts + SplitBillPage.tsx (201 tests)* |
| **ECONOMY A3** ✅ | Economy | 2 sem. | Commissions dynamiques, revenue share, dashboard admin — *Desktop S49 : dynamic-commission-service.ts + EconomyTransactionsPage.tsx (+132 tests → 4195)* |

> Note : A1 peut démarrer dès que IMUBANK 1-2 sont terminés. A2 après IMUBANK 2-4. A3 en parallèle avec IMUBANK 7-8.

**Milestone :** ✅ Finance Hub live + P2P complet + ImuCoin economy fonctionnelle  
**Équipe :** 2 backend, 2 mobile, 1 QA, 1 designer

---

### Macro-Phase 3 — Social Economy & Cartes (Semaines 17-24) ✅ TERMINÉE

> Monétiser les interactions sociales + lancer les cartes virtuelles.  
> **Parallélisation :** ImuBank Phase 3 + ImuEconomy Phase B.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **IMUBANK 9** | Wallet | 2 sem. | Cartes virtuelles (Stripe Issuing) |
| **ECONOMY B1** | Economy | 2 sem. | Tips / Pourboires (chat, feed, profil) |
| **IMUBANK 10** | Wallet | 2 sem. | Apple Pay / Google Pay |
| **ECONOMY B2** | Economy | 2 sem. | Cadeaux Live (7 animations, overlay, combo, leaderboard) |
| **IMUBANK 11** | Wallet | 2 sem. | Coffres d'épargne + règles automatiques |
| **ECONOMY B3** | Economy | 2 sem. | Super-likes, votes premium, boosts payants |
| **IMUBANK 12** | Wallet | 2 sem. | Cashback + Programme de parrainage |

**Milestone :** ✅ Cartes virtuelles + Épargne + Social Economy complète  
**Équipe :** 2 backend, 2 mobile, 1 animations (Lottie/Rive), 1 QA

---

### Macro-Phase 4 — Creator & Gaming Economy (Semaines 25-32)

> Économie créateurs enrichie + monétisation gaming.  
> **Parallélisation :** ImuBank Phase 4 + ImuEconomy Phases C.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **IMUBANK 13** | Wallet | 2 sem. | Cadeaux Live tables + RPCs + commissions |
| **ECONOMY C1** | Economy | 2 sem. | Tickets tournoi + pass saison gaming |
| **IMUBANK 14** | Wallet | 2 sem. | Abonnements fans (3 tiers) + ventes créateurs |
| **ECONOMY C2** | Economy | 2 sem. | Skins, items, lootboxes, boutique gaming |
| **IMUBANK 15** | Wallet | 2 sem. | Business Hub (marchands, terminal QR, facturation) |

**Milestone :** ✅ Creator Economy complète + Gaming Economy + Business Hub  
**Équipe :** 2 backend, 2 mobile, 1 gaming dev, 1 QA

---

### Macro-Phase 5 — Store Economy & Marketplace (Semaines 33-38)

> Consolider le Store + developer payouts + marketplace services.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **ECONOMY D1** | Economy | 2 sem. | Store enrichi (avis, remboursements, bundles, promos) |
| **ECONOMY D2** | Economy | 2 sem. | Developer payouts v2 (auto, rapports fiscaux, multi-devises) |
| **ECONOMY D3** | Economy | 2 sem. | Marketplace services (escrow, réservation) |

**Milestone :** ✅ Store Economy mature + Marketplace services  
**Équipe :** 1 backend, 1 mobile, 1 QA

---

### Macro-Phase 6 — Investissements & Crypto (Semaines 39-42)

> Modules investissement et crypto (nécessitent partenariats externes).

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **IMUBANK 16** | Wallet | 2 sem. | Investissements (actions fractionnées, ETF via partenaire) |
| **IMUBANK 17** | Wallet | 2 sem. | Crypto Hub (BTC, ETH, SOL, stablecoins, staking) |

**Milestone :** ✅ Investissements + Crypto via partenaires régulés  
**Prérequis :** Partenariats signés (Alpaca/DriveWealth + MoonPay/Transak)  
**Équipe :** 1 backend, 1 mobile, 1 QA

---

### Macro-Phase 7 — Publicité & Premium (Semaines 43-46)

> Régie publicitaire + système Premium enrichi.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **ECONOMY E1** | Economy | 2 sem. | Régie pub self-service (5 formats, ciblage, dashboard) |
| **ECONOMY E2** | Economy | 2 sem. | Premium multi-tiers, dashboard revenus consolidé, export |

**Milestone :** ✅ Publicité native + Premium V2  
**Équipe :** 1 backend, 1 mobile, 1 designer

---

### Macro-Phase 8 — IA Finance & Compliance (Semaines 47-50)

> IA financière, conformité réglementaire, audit sécurité.

| Sprint | Source | Durée | Contenu |
|--------|--------|:-----:|---------|
| **IMUBANK 18** | Wallet | 2 sem. | Alice Finance (analyse dépenses, alertes proactives, budgets) |
| **Compliance** | Transversal | 2 sem. | KYC niveau 3, PSD2/SCA, détection fraude ML, pentest, audit PCI DSS |

**Milestone :** ✅ **Finance Hub v1 complet — ImuBank & ImuEconomy opérationnels**  
**Équipe :** 1 backend IA, 1 security, 1 QA, 1 legal

---

## Carte des dépendances globale

```
                     FONDATIONS
                     ┌──────────┐
                     │ S1: Types│
                     │ S2: Stripe│
                     │ S3: Gamif │
                     │ S4: Retrait│
                     └─────┬────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        KYC & FINANCE    IMUCOIN      SOCIAL
        ┌──────────┐   ┌──────────┐  (après A1)
        │ S5: KYC  │   │ A1: Types│     │
        │ S6: Dash │   │ A2: Cycle│     │
        │ S7: P2P  │   │ A3: Comm.│     │
        │ S8: Split│   └──────────┘     │
        └─────┬────┘                    │
              │         ┌───────────────┘
              │         │
        CARTES+ÉPARGNE  SOCIAL ECONOMY
        ┌──────────┐   ┌──────────┐
        │ S9: Cartes│  │ B1: Tips │
        │ S10: xPay │  │ B2: Gifts│
        │ S11: Épgn │  │ B3: Votes│
        │ S12: Cashb│  └────┬─────┘
        └─────┬────┘        │
              │    ┌────────┘
              │    │
        CREATOR+BIZ  GAMING ECONOMY
        ┌──────────┐   ┌──────────┐
        │ S13: Live │   │ C1: Trnmt│
        │ S14: Fans │   │ C2: Items│
        │ S15: Biz  │   └──────────┘
        └─────┬────┘
              │
        ┌─────┴──────────────────┐
        │              │         │
   STORE ECONOMY    INVEST    PUB/PREMIUM
   ┌──────────┐   ┌───────┐  ┌──────────┐
   │ D1: Store│   │S16:Inv│  │ E1: Pub  │
   │ D2: Payo │   │S17:Cry│  │ E2: Prem │
   │ D3: Mktpl│   └───────┘  └──────────┘
   └──────────┘
              │
        ┌─────┘
   IA & COMPLIANCE
   ┌──────────────┐
   │ S18: Alice   │
   │ Compliance   │
   └──────────────┘
```

---

## Allocation équipe recommandée

| Rôle | Phase 1-2 | Phase 3-4 | Phase 5-6 | Phase 7-8 |
|------|:---------:|:---------:|:---------:|:---------:|
| **Backend senior** | 2 | 2 | 1 | 1 |
| **Mobile dev** | 1 | 2 | 1 | 1 |
| **Frontend web** | 0 | 1 | 1 | 0 |
| **Designer UI/UX** | 1 | 1 | 0 | 1 |
| **Animations (Lottie/Rive)** | 0 | 1 | 0 | 0 |
| **QA** | 1 | 1 | 1 | 1 |
| **Security / Legal** | 0 | 0 | 0 | 1 |
| **Total** | **5** | **8** | **4** | **5** |

---

## Risques & Mitigations

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|:-----------:|:------:|------------|
| 1 | **Stripe Edge Functions échouent** | Moyenne | 🔴 Critique | Tester en sandbox dès sprint 2, fallback sur API Stripe directe |
| 2 | **Partenaire KYC lent à intégrer** | Haute | 🟡 Haute | Commencer avec Onfido (SDK React Native dispo), fallback Jumio |
| 3 | **Licence/agrément bancaire requis** | Haute | 🔴 Critique | Partenariat BaaS (Solarisbank ou Treezor) plutôt qu'agrément propre |
| 4 | **Réglementation crypto (MiCA)** | Moyenne | 🟡 Haute | Passer par widget tiers (MoonPay) qui porte la licence |
| 5 | **Complexité commission multi-niveaux** | Moyenne | 🟢 Moyenne | Tests unitaires exhaustifs sur les RPCs de commission |
| 6 | **Performance haute fréquence** | Basse | 🟡 Haute | Index SQL dès le départ, connection pooling, cache Redis pour balances |
| 7 | **Fraude P2P (faux comptes)** | Haute | 🔴 Critique | KYC obligatoire pour fiat, limites strictes KYC 0, rate limiting |
| 8 | **Adoption créateurs insuffisante** | Moyenne | 🟡 Haute | Programme early-adopters : 0% commission 6 mois pour les 100 premiers |
| 9 | **Lootboxes et réglementation UE** | Moyenne | 🟡 Haute | Probabilités affichées obligatoirement, alternative : battle pass only |
| 10 | **Table name mismatch non détecté** | Haute | 🔴 Critique | Sprint 1 = priorité absolue, tests d'intégration avant tout |

---

## KPIs consolidés

### Métriques North Star

| Métrique | 6 mois post-launch | 12 mois | 24 mois |
|----------|:------------------:|:-------:|:-------:|
| **MAU Finance Hub** | 15K | 80K | 300K |
| **Volume ImuCoin mensuel** | 5M IC | 50M IC | 500M IC |
| **Revenu mensuel Finance** | 15K € | 120K € | 600K € |
| **Nb créateurs rémunérés** | 50 | 500 | 3 000 |
| **Nb cartes actives** | 500 | 5 000 | 30 000 |

### Métriques par pilier

| Pilier | KPI primaire | KPI secondaire |
|--------|-------------|----------------|
| **Wallet** | Tx/utilisateur/mois | % recharge récurrente |
| **P2P** | Volume P2P/mois | Nb split bills créés |
| **Cartes** | Nb cartes actives | Volume tx carte/mois |
| **Épargne** | Nb coffres actifs | Taux progression objectifs |
| **Creator** | Revenu moyen/créateur | Nb abonnés fans/créateur |
| **Gaming** | Revenu gaming/mois | Nb pass saison vendus |
| **Store** | Commission store/mois | Taux remboursement |
| **Business** | Nb marchands actifs | Volume tx marchands |
| **Pub** | Revenu pub/mois | CTR moyen |
| **Premium** | Taux conversion premium | Churn mensuel |

---

## Budget technique estimé

| Poste | Coût mensuel estimé | Notes |
|-------|:-------------------:|-------|
| **Stripe** | Variable (2,9% + 0,25 €/tx) | Standard Stripe pricing |
| **Stripe Issuing** | 0,10 € / carte créée + 0,20 €/tx | Cartes virtuelles |
| **Onfido (KYC)** | ~2 € / vérification | Volume pricing disponible |
| **Supabase Pro** | 25 $/mois (base) + Edge Functions | Scaling auto |
| **Partenaire invest** | Variable (rev share) | Alpaca/DriveWealth |
| **MoonPay (crypto)** | Widget gratuit (commission intégrée) | Pas de coût fixe |
| **Lottie/Rive** | 0 (open source) | Gratuit |
| **Hébergement** | ~100 $/mois | Vercel + Supabase |

---

## Récapitulatif fichiers

| Fichier | Type | Sprints |
|---------|------|:-------:|
| [Finance_Vision_v2.md](Finance_Vision_v2.md) | Document enrichi | — |
| [ROADMAP_IMUBANK_WALLET.md](ROADMAP_IMUBANK_WALLET.md) | Roadmap | 18 sprints / 6 phases |
| [ROADMAP_IMUECONOMY_MONETISATION.md](ROADMAP_IMUECONOMY_MONETISATION.md) | Roadmap | 15 sprints / 5 phases |
| **ROADMAP_FINANCE_GLOBAL.md** (ce fichier) | Vue consolidée | 33 sprints / 8 macro-phases |
