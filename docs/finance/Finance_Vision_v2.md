# 💳 Finance Hub — ImuBank & ImuEconomy (v2 enrichi)

**Date :** 8 mars 2026  
**Document source :** `Finance_Vision.md`  
**Enrichi avec :** analyse du code existant (wallet-store, wallet-api, payment-api, Supabase schema, shared-types)  
**Stack :** Supabase (PostgreSQL + Edge Functions) · Stripe · expo-iap · Zustand · React Native · Next.js

---

## Table des matières

1. [Positionnement stratégique](#1-positionnement-stratégique)
2. [État actuel — ce qui existe déjà](#2-état-actuel--ce-qui-existe-déjà)
3. [Architecture globale Finance Hub](#3-architecture-globale-finance-hub)
4. [Module 1 — Wallet ImuChat (ImuCoin + Fiat)](#4-module-1--wallet-imuchat-imucoin--fiat)
5. [Module 2 — Paiements P2P dans le chat](#5-module-2--paiements-p2p-dans-le-chat)
6. [Module 3 — Paiements commerçants](#6-module-3--paiements-commerçants)
7. [Module 4 — Cartes ImuChat (virtuelles & physiques)](#7-module-4--cartes-imuchat-virtuelles--physiques)
8. [Module 5 — Abonnements & Facturation](#8-module-5--abonnements--facturation)
9. [Module 6 — Micro-transactions & Contenus](#9-module-6--micro-transactions--contenus)
10. [Module 7 — Creator Economy](#10-module-7--creator-economy)
11. [Module 8 — Business Economy](#11-module-8--business-economy)
12. [Module 9 — Investissements & Épargne](#12-module-9--investissements--épargne)
13. [Module 10 — Crypto Hub](#13-module-10--crypto-hub)
14. [ImuEconomy — L'économie interne](#14-imueconomy--léconomie-interne)
15. [ImuCoin — Monnaie de l'écosystème](#15-imucoin--monnaie-de-lécosystème)
16. [Social Economy — Interactions monétisées](#16-social-economy--interactions-monétisées)
17. [Gaming Economy](#17-gaming-economy)
18. [Fonctionnalités virales](#18-fonctionnalités-virales)
19. [Publicité & Revenus plateforme](#19-publicité--revenus-plateforme)
20. [Modèle économique & Projections](#20-modèle-économique--projections)
21. [Sécurité & Conformité réglementaire](#21-sécurité--conformité-réglementaire)
22. [IA financière (Alice Finance)](#22-ia-financière-alice-finance)
23. [Architecture technique détaillée](#23-architecture-technique-détaillée)
24. [Schéma Supabase complet](#24-schéma-supabase-complet)
25. [40+ écrans UI — Mapping complet](#25-40-écrans-ui--mapping-complet)
26. [Plan MVP par phases](#26-plan-mvp-par-phases)

---

## 1. Positionnement stratégique

### Pourquoi un Finance Hub dans ImuChat ?

Dans l'écosystème des super-apps, la couche financière est le **moteur économique** qui transforme une app sociale en plateforme indispensable. Les exemples de référence :

| Super-app | Service financier | Impact |
|-----------|-------------------|--------|
| **WeChat** | WeChat Pay | 1,2 milliard d'utilisateurs, 60% du marché paiement mobile Chine |
| **Grab** | GrabPay / GrabFinance | +40M utilisateurs, prêts, assurances, investissements |
| **Revolut** | Full banking | 40M+ clients, licences bancaires EU/UK |
| **Cash App** | P2P + Bitcoin + Stocks | $2,9B revenus en 2023, 55M utilisateurs |
| **PayPal/Venmo** | P2P + Commerce | 400M+ comptes, $27B revenus |

### Vision ImuChat

ImuChat Finance Hub (**ImuBank**) devient la **couche économique unifiée** qui connecte :

```
┌─────────────────────────────────────────────────┐
│                  ImuBank                         │
├─────────┬──────────┬──────────┬─────────────────┤
│ Social  │ Gaming   │ Creator  │ Store           │
│ Pay     │ Economy  │ Economy  │ Economy         │
├─────────┴──────────┴──────────┴─────────────────┤
│              ImuCoin (monnaie interne)           │
├─────────────────────────────────────────────────┤
│     Wallet · Cartes · P2P · Invest · Crypto     │
└─────────────────────────────────────────────────┘
```

### Accès dans l'app

Le Finance Hub est accessible depuis **5 points d'entrée** :

| Point d'entrée | Contexte | UI |
|-----------------|----------|-----|
| **Onglet Profil** | Section "Mon Wallet" | Lien vers Finance Hub complet |
| **Onglet Store** | Bouton "Recharger" / "Payer" | Modal paiement contextuel |
| **Chat (DM/Groupe)** | Bouton "+" → Paiement | Paiement P2P inline |
| **Social / ImuFeed** | Pourboire / Don créateur | Micro-transaction rapide |
| **Gaming / Arena** | Ticket tournoi / Achat skin | Paiement ImuCoin direct |

---

## 2. État actuel — ce qui existe déjà

### ✅ Implémenté

| Composant | Plateforme | Détail |
|-----------|:----------:|--------|
| **wallet-store.ts** | Mobile | Store Zustand complet (~600 lignes) : balance, transactions, missions, send/claim, payment methods, top-up Stripe, subscriptions, IAP, withdrawals, invoices, KYC, creator payout |
| **wallet-api.ts** | Mobile | API Supabase : `fetchBalance()`, `fetchTransactions()`, `sendImucoins()` (RPC atomique), `fetchMissions()`, `claimMission()` |
| **payment-api.ts** | Mobile | Intégration Stripe via Edge Functions : `fetchTopupPackages()`, `createCheckoutSession()`, etc. 5 packages (100→6500 IMC) |
| **subscription-api.ts** | Mobile | API abonnements : plans, souscription, annulation |
| **iap-service.ts** | Mobile | In-App Purchases : catalogue, achat, restauration |
| **11 écrans wallet** | Mobile | index, topup, transactions, subscription, manage-subscriptions, payment-methods, payment-modal, invoices, withdraw, creator-settings, _layout |
| **wallet-context.tsx** | Web | Context React + hook `useWallet()`, balance + 5 dernières transactions |
| **imucoin-api.ts** | Web | `fetchWallet()`, `fetchBalance()`, `fetchImuCoinHistory()`, `creditImuCoins()` |
| **Composants wallet** | Web | wallet-popover, wallet-card, wallet-icon, wallet-balance-card |
| **imucoin_wallets** | DB | Table : `balance`, `lifetime_earned`, `lifetime_spent`, `is_frozen` |
| **imucoin_transactions** | DB | Table : 7 types (purchase, module_buy, transfer, reward, refund, admin_grant, subscription) |
| **store_transactions** | DB | Table : achats modules (buyer, module, developer, Stripe/ImuCoin/IAP) |
| **developer_payouts** | DB | Table : versements développeurs (Stripe Connect) |
| **revenue_share_config** | DB | Table : commission 70/30 dev/plateforme |
| **transfer_imucoins()** | DB | Fonction SQL atomique avec vérification solde |
| **Clés i18n** | Toutes | `imuBank.*` dans fr.json, en.json, ja.json |
| **Types wallet** | Shared | `Wallet`, `WalletBalance`, `Transaction`, `ImuCoin`, `PaymentMethod`, etc. |

### ⚠️ Problèmes identifiés

| Problème | Détail | Impact |
|----------|--------|--------|
| **Supabase Edge Functions manquantes** | `create-checkout-session`, `check-checkout-status`, `request-cashout` etc. → appelées mais non implémentées | Stripe non fonctionnel |
| **Noms tables incompatibles** | Mobile requête `wallets` / `wallet_transactions` / `wallet_missions` mais SQL crée `imucoin_wallets` / `imucoin_transactions` / `missions` | Erreurs runtime |
| **Types dupliqués divergents** | `shared-types/src/wallet.ts` vs `mobile/types/wallet.ts` → structures différentes (ex: `WalletBalance` = différent) | Confusion, bugs |
| **KYC mock uniquement** | Données KYC dans le store mais pas de véritable service de vérification | Non fonctionnel | ✅ *Desktop S45 : kyc-verification-service.ts — Onfido integration, KYC tiers 0-2* |
| **Gamification ↔ Wallet** | `missions.imucoin_reward` existe en SQL mais pas de trigger pour créditer le wallet automatiquement à la complétion | Rewards non distribuées |

### ❌ Non implémenté (prévu dans la vision)

- Finance Hub complet (40 écrans) — ✅ *Desktop S44 : FinanceHubPage.tsx (dashboard + navigation)*
- Paiements P2P dans le chat — ✅ *Desktop S45 : P2PPaymentPage.tsx (send, request, contacts, history)*
- Cartes ImuChat (virtuelles/physiques)
- QR code / NFC
- Investissements / Épargne
- Crypto Hub
- Business Hub
- IA financière
- Fonctionnalités virales (cagnottes, cashback social)

---

## 3. Architecture globale Finance Hub

```
Finance Hub (ImuBank)
│
├── 💰 Wallet Core
│   ├── Solde ImuCoin ✅ (existe)
│   ├── Solde multi-devises (EUR, USD, JPY)
│   ├── Historique transactions ✅ (existe)
│   ├── Recharge (Stripe / IAP) ✅ (partiellement)
│   └── Retrait vers banque
│
├── 👤 Paiements P2P
│   ├── Envoyer argent (chat) ✅ (ImuCoin only)
│   ├── Demander argent
│   ├── Diviser la note
│   └── Cagnottes de groupe
│
├── 🛍 Paiements Commerçants
│   ├── QR code
│   ├── NFC (Apple Pay / Google Pay)
│   ├── Lien de paiement
│   └── Terminal marchand
│
├── 💳 Cartes ImuChat
│   ├── Carte virtuelle (paiement en ligne)
│   ├── Carte physique (Visa/Mastercard)
│   ├── Apple Pay / Google Pay
│   └── Gestion (blocage, plafonds, PIN)
│
├── 🔁 Abonnements ✅ (partiellement)
│   ├── ImuChat Premium
│   ├── Abonnements créateurs
│   ├── Apps du Store
│   └── Facturation / Historique ✅ (existe)
│
├── ⚡ Micro-transactions
│   ├── Cadeaux live (ImuCoin) ✅ (types existent)
│   ├── Stickers payants
│   ├── Boost posts
│   └── Votes concours
│
├── 🧑‍💻 Creator Economy ✅ (partiellement)
│   ├── Dashboard revenus ✅ (écran existe)
│   ├── Abonnements fans
│   ├── Dons / Pourboires
│   ├── Ventes contenus
│   └── Retraits ✅ (UI existe)
│
├── 🧑‍💼 Business Economy
│   ├── Profil marchand
│   ├── Terminal de paiement
│   ├── Factures clients
│   └── API paiement
│
├── 📈 Investissements
│   ├── Actions (achat fractionné)
│   ├── ETF
│   ├── Crypto
│   └── Crowdfunding créateurs
│
├── 🏦 Épargne
│   ├── Coffres-objectifs
│   ├── Épargne automatique
│   ├── Arrondis
│   └── Intérêts
│
├── 🪙 Crypto Hub
│   ├── Acheter / Vendre
│   ├── Envoyer / Recevoir
│   ├── Staking
│   └── Portfolio
│
└── ⚙️ Paramètres financiers
    ├── Sécurité (2FA, biométrie)
    ├── KYC ✅ (mock seulement)
    ├── Limites personnalisables
    └── Notifications transactions
```

---

## 4. Module 1 — Wallet ImuChat (ImuCoin + Fiat)

### 4.1 Architecture du wallet

Le Wallet ImuChat est le **cœur du système financier**. Il gère deux types de soldes :

```
Wallet ImuChat
├── 🪙 ImuCoin (monnaie virtuelle interne)
│   ├── balance: number        // Solde disponible
│   ├── lifetime_earned: number // Total gagné
│   ├── lifetime_spent: number  // Total dépensé
│   └── is_frozen: boolean      // Gel de sécurité
│
└── 💶 Fiat (argent réel)
    ├── EUR: { amount, available, pending, reserved }
    ├── USD: { amount, available, pending, reserved }
    ├── JPY: { amount, available, pending, reserved }
    └── custom currencies...
```

### 4.2 Types de soldes détaillés

| Type | Source | Utilisation | Retrait |
|------|--------|-------------|---------|
| **ImuCoin** | Achat (Stripe/IAP), Récompenses, Dons reçus | Tout dans ImuChat (store, créateurs, gaming, votes) | Conversion → fiat → virement |
| **EUR/USD/JPY** | Virement bancaire, Carte | P2P réel, Commerçants, Cartes | Virement vers banque |
| **Crypto** | Achat, Staking rewards | Échange, Envoi, Paiement (si supporté) | Virement vers wallet externe |

### 4.3 Équivalence ImuCoin

```
1 € = 100 ImuCoin (IC)
1 $ = 100 ImuCoin
1 ¥ = 1 ImuCoin
```

### 4.4 Packages de recharge existants

| Package | ImuCoin | Prix | Bonus |
|---------|:-------:|:----:|:-----:|
| Starter | 100 IC | 0,99 € | — |
| Basic | 500 IC | 4,99 € | — |
| Popular | 1 200 IC | 9,99 € | +200 IC |
| Premium | 3 500 IC | 24,99 € | +500 IC |
| Elite | 6 500 IC | 49,99 € | +1 500 IC |

### 4.5 Fonctions wallet

```
Wallet Actions
├── Voir solde (par devise)
├── Historique transactions (filtré, paginé)
├── Recharger ImuCoin (Stripe / Apple IAP / Google Play)
├── Ajouter argent fiat (virement, carte)
├── Envoyer (ImuCoin ou fiat)
├── Recevoir (QR code, lien, adresse)
├── Convertir (ImuCoin ↔ fiat, devises ↔ devises)
├── Retirer vers banque
└── Voir limites & plafonds
```

### 4.6 Wireframe — Wallet Home

```
┌─────────────────────────────────────┐
│  ← Retour            ⚙️ Paramètres  │
│                                     │
│  ╔══════════════════════════════╗   │
│  ║     💰 Solde Total           ║   │
│  ║     2 450,00 €               ║   │
│  ║                              ║   │
│  ║  🪙 4 200 IC    💶 1 250 €   ║   │
│  ║  💵 $380         🪙 ₿0.002  ║   │
│  ╚══════════════════════════════╝   │
│                                     │
│  [📤 Envoyer] [📥 Recevoir]        │
│  [💳 Recharger] [🏦 Retirer]       │
│                                     │
│  ─── Transactions récentes ───      │
│  🟢 +200 IC  Mission "Daily Login"  │
│  🔴 -50 IC   Achat sticker pack    │
│  🟢 +10 €    Nathan → Vous         │
│  🔴 -1200 IC Module "ImuArena"     │
│  🟢 +500 IC  Don live @creator1    │
│                                     │
│  [Voir tout l'historique →]         │
└─────────────────────────────────────┘
```

---

## 5. Module 2 — Paiements P2P dans le chat

### 5.1 Vision

Le paiement P2P dans le chat est la fonctionnalité **la plus virale** d'ImuBank. Elle transforme chaque conversation en point de transaction.

### 5.2 Actions dans le chat

Depuis le bouton "+" de la barre de chat :

```
+  →  💸 Envoyer argent
       💳 Demander paiement
       🧾 Diviser la note
       🎁 Cagnotte de groupe
```

### 5.3 Envoyer de l'argent

```
┌─────────────────────────────────────┐
│          💸 Envoyer argent          │
│                                     │
│  À : Nathan                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        10,00 €              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Note : "Restaurant hier soir 🍕"  │
│                                     │
│  Source : [🪙 ImuCoin ▼]           │
│           [💶 EUR      ]           │
│           [💳 Carte ****4242]      │
│                                     │
│  [Envoyer 10,00 € →]              │
│                                     │
│  🔒 Sécurisé · FaceID requis      │
└─────────────────────────────────────┘
```

### 5.4 Message dans le chat

Après envoi, le message apparaît dans la conversation :

```
┌─────────────────────────────────────┐
│  💸 Nathan vous a envoyé 10,00 €   │
│  "Restaurant hier soir 🍕"         │
│                                     │
│  [✅ Accepter]  [❌ Refuser]       │
└─────────────────────────────────────┘
```

### 5.5 Diviser la note (Split Bill)

```
┌─────────────────────────────────────┐
│       🧾 Diviser une note          │
│                                     │
│  Total : 85,00 €                   │
│  Participants : 4                   │
│                                     │
│  👤 Nathan      21,25 €  ✅ Payé   │
│  👤 Alice       21,25 €  ⏳ En att.│
│  👤 Bob         21,25 €  ⏳ En att.│
│  👤 Vous        21,25 €  ✅ Payé   │
│                                     │
│  [🔔 Rappeler les retardataires]   │
└─────────────────────────────────────┘
```

### 5.6 Cagnotte de groupe

```
┌─────────────────────────────────────┐
│      🎁 Cagnotte de groupe         │
│                                     │
│  "Cadeau anniversaire Sarah 🎂"    │
│                                     │
│  Objectif : 200 €                  │
│  ████████████░░░░░░  145 € (72%)   │
│                                     │
│  👤 Nathan    50 €                  │
│  👤 Alice     30 €                  │
│  👤 Bob       25 €                  │
│  👤 Vous      40 €                  │
│  +3 participants...                 │
│                                     │
│  [💶 Contribuer]  [📤 Partager]    │
│                                     │
│  ⏰ Expire dans 5 jours            │
└─────────────────────────────────────┘
```

### 5.7 Types techniques P2P

```typescript
interface P2PPayment {
  id: string;
  type: 'send' | 'request' | 'split' | 'pool';
  senderId: string;
  recipientId?: string;      // pour send/request
  groupId?: string;          // pour split/pool
  amount: number;
  currency: 'EUR' | 'USD' | 'JPY' | 'IMC';
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';
  note?: string;
  chatId: string;            // conversation liée
  messageId: string;         // message affiché dans le chat
  expiresAt?: Date;
  createdAt: Date;
}

interface SplitBill {
  id: string;
  creatorId: string;
  chatId: string;
  totalAmount: number;
  currency: string;
  splitType: 'equal' | 'custom' | 'percentage';
  participants: SplitParticipant[];
  status: 'collecting' | 'completed' | 'expired';
}

interface GroupPool {
  id: string;
  creatorId: string;
  chatId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  contributions: PoolContribution[];
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  expiresAt?: Date;
}
```

---

## 6. Module 3 — Paiements commerçants

### 6.1 QR Code

```
                ╔══════════════╗
                ║  ▓▓▓▓▓▓▓▓▓▓ ║
      Scanner   ║  ▓▓ QR  ▓▓  ║     Afficher
      (payer)   ║  ▓▓ CODE ▓▓ ║     (recevoir)
                ║  ▓▓▓▓▓▓▓▓▓▓ ║
                ╚══════════════╝
```

- **Scanner** → Ouvre la caméra, lit le QR du commerçant, affiche montant, confirmer avec FaceID/PIN
- **Afficher** → Génère un QR personnel (pour recevoir un paiement)

### 6.2 NFC (Tap to Pay)

- Intégration Apple Pay / Google Pay
- Le wallet ImuChat apparaît comme moyen de paiement natif
- Débit direct du solde fiat ou ImuCoin (avec conversion auto)

### 6.3 Lien de paiement

Le commerçant/freelance génère un lien :
```
https://pay.imuchat.com/p/abc123
→ Montant : 45,00 €
→ Marchand : Studio Design Nathan
→ Ref : INV-2026-042
```

### 6.4 Terminal marchand (futur)

Application dédiée pour commerçants avec :
- Catalogue produits
- Historique ventes
- Gestion employés
- Rapports journaliers

---

## 7. Module 4 — Cartes ImuChat (virtuelles & physiques)

### 7.1 Cartes virtuelles

Générées instantanément dans l'app :

```
┌─────────────────────────────────────┐
│  ╔══════════════════════════════╗   │
│  ║  ImuChat Card               ║   │
│  ║                              ║   │
│  ║  **** **** **** 4242        ║   │
│  ║  NATHAN IMOGO               ║   │
│  ║  09/28         VISA         ║   │
│  ╚══════════════════════════════╝   │
│                                     │
│  [📋 Copier numéro]                │
│  [🔒 Bloquer]  [📊 Plafonds]       │
│  [🗑 Supprimer carte]              │
└─────────────────────────────────────┘
```

**Usages :**
- Paiement en ligne sécurisé
- Abonnements (carte dédiée par abonnement)
- Carte jetable (à usage unique pour sécurité)

### 7.2 Cartes physiques

| Type | Cible | Frais | Avantages |
|------|-------|:-----:|-----------|
| **Standard** | Tous utilisateurs | Gratuit | Paiement mondial, Apple Pay, blocage instant |
| **Creator** | Créateurs vérifiés | 2,99 €/mois | +1% cashback, priorité support, design exclusif |
| **Business** | Commerçants | 9,99 €/mois | Multi-utilisateurs, plafond élevé, API |
| **Premium** | Power users | 14,99 €/mois | +3% cashback, lounge aéroport, assurance voyage |

### 7.3 Fonctions cartes

- Paiement mondial (Visa / Mastercard réseau)
- Apple Pay / Google Pay (tokenisation)
- Cashback configurable (1-3% selon carte)
- Limites personnalisables (journalier, mensuel, par transaction)
- Blocage/déblocage instantané
- Gel automatique si activité suspecte
- Notifications push à chaque transaction

### 7.4 Partenaires techniques

| Partenaire | Rôle | Region |
|------------|------|--------|
| **Stripe Issuing** | Émission cartes virtuelles + physiques | Global |
| **Marqeta** | Infrastructure card-as-a-service | US/EU |
| **Adyen** | Processing paiements commerçants | Global |
| **Solarisbank** | Licence bancaire (BaaS) | EU |

---

## 8. Module 5 — Abonnements & Facturation

### 8.1 Types d'abonnements

```
Mes Abonnements
├── ImuChat Premium (5 €/mois)
│   ├── Stockage cloud 50 Go
│   ├── Thèmes premium (accès complet)
│   ├── IA Alice avancée (GPT-4)
│   ├── Avatar 3D
│   ├── Badge Premium ✨
│   ├── Appels vidéo HD 4K
│   └── Pas de publicité
│
├── Abonnements créateurs
│   ├── @artist1 → Fan Club (2,99 €/mois)
│   ├── @gamer2 → VIP (4,99 €/mois)
│   └── @dev3 → Pro Tools (9,99 €/mois)
│
├── Apps du Store
│   ├── ImuArena Pro (1,99 €/mois)
│   └── Traduction avancée (0,99 €/mois)
│
├── Gaming
│   ├── Battle Pass Saison 4 (7,99 €)
│   └── Gaming+ (3,99 €/mois)
│
└── Services externes
    └── (futurs partenariats)
```

### 8.2 Gestion

- Voir tous les abonnements actifs
- Pause / Reprise (sans perdre l'abonnement)
- Changement de plan (upgrade/downgrade)
- Historique factures (PDF téléchargeables)
- Alerte avant renouvellement (J-3)
- Annulation simple (1 tap)

---

## 9. Module 6 — Micro-transactions & Contenus

### 9.1 Achats dans l'écosystème ImuChat

| Catégorie | Exemples | Prix typique |
|-----------|----------|:------------:|
| **Stickers** | Packs animés, packs créateurs | 50-200 IC |
| **Thèmes** | Thème Sakura, Neon City, etc. | 100-500 IC |
| **Avatars** | Costumes, accessoires, skins | 50-300 IC |
| **Sons** | Sonneries, sons notification | 30-100 IC |
| **Contenus** | BD premium, vidéos exclusives, cours | 100-2000 IC |
| **Lives privés** | Accès live premium d'un créateur | 200-1000 IC |
| **Boosts** | Boost post, boost story, boost profil | 50-500 IC |

### 9.2 Paiement rapide

```
┌─────────────────────────┐
│  🎨 Pack Stickers Anime │
│  150 ImuCoin             │
│                         │
│  [🔓 Acheter · FaceID]  │
└─────────────────────────┘
```

- 1 tap + FaceID/TouchID = achat instantané
- Pas de formulaire, pas de friction
- Solde insuffisant → propose recharge

---

## 10. Module 7 — Creator Economy

### 10.1 Vision

La Creator Economy est l'axe le plus stratégique. Chaque créateur qui gagne de l'argent sur ImuChat devient un ambassadeur et attire son audience.

### 10.2 Sources de revenus créateur

```
Creator Wallet
├── 🎁 Dons & Pourboires
│   ├── Tips dans les chats (10-500 IC)
│   ├── Cadeaux pendant les lives
│   │   ├── 🌹 Rose = 50 IC
│   │   ├── ⭐ Star = 100 IC
│   │   ├── 🚀 Rocket = 500 IC
│   │   ├── 👑 Crown = 1000 IC
│   │   └── 💎 Diamond = 5000 IC
│   └── Super-likes sur ImuFeed (5 IC)
│
├── 👥 Abonnements fans
│   ├── Tier 1 : Fan (2,99 €/mois) → badge, emojis exclusifs
│   ├── Tier 2 : Supporter (4,99 €/mois) → + contenu premium
│   └── Tier 3 : VIP (9,99 €/mois) → + DM privé, lives exclusifs
│
├── 📦 Ventes contenus
│   ├── BD / Manga numériques
│   ├── Formations / Cours
│   ├── Templates / Assets
│   ├── Musique originale
│   └── Packs graphiques
│
├── 🏆 Prix concours / Arena
│   └── Gains des compétitions ImuArena
│
└── 📊 Programme partenaire (futur)
    └── Revenus publicitaires partagés
```

### 10.3 Commission plateforme

| Source | Créateur reçoit | ImuChat garde |
|--------|:---------------:|:-------------:|
| Dons / Pourboires | 80% | 20% |
| Abonnements fans | 85% | 15% |
| Ventes contenus | 70% | 30% |
| Cadeaux lives | 75% | 25% |
| Prix concours | 100% | 0% |

### 10.4 Dashboard créateur

```
┌──────────────────────────────────────────┐
│  👤 Creator Dashboard                    │
│                                          │
│  💰 Solde disponible : 1 245,50 €       │
│  📈 Ce mois : +342,80 € (+27%)          │
│                                          │
│  ┌────────────────────────────────┐      │
│  │  📊 Revenus (30 jours)        │      │
│  │  ▓▓▓▓▓▓▓▓▓▓░░ 342,80 €      │      │
│  │  ▓▓▓▓▓▓▓▓░░░░ 270,10 €  M-1 │      │
│  └────────────────────────────────┘      │
│                                          │
│  🎁 Dons         145,20 € (42%)         │
│  👥 Abonnements   89,70 € (26%)         │
│  📦 Ventes        68,40 € (20%)         │
│  ⭐ Cadeaux live  39,50 € (12%)         │
│                                          │
│  [🏦 Retirer] [📊 Analytics] [⚙️ Config]│
└──────────────────────────────────────────┘
```

### 10.5 Conditions de retrait

| Critère | Condition |
|---------|-----------|
| Minimum retrait | 50 € (5 000 IC) |
| KYC requis | Oui (vérifié) |
| Cycle paiement | Mensuel (configurable : hebdo si > 500 €/mois) |
| Méthodes | Virement bancaire, PayPal, Stripe Connect |
| Délai | 3-5 jours ouvrés |

---

## 11. Module 8 — Business Economy

### 11.1 Profil marchand

Les entreprises et freelances peuvent créer un **profil Business** :

```
Business Hub
├── Profil marchand vérifié
├── Terminal de paiement (QR / NFC / Lien)
├── Catalogue produits/services
├── Factures automatiques
├── Gestion employés (accès multi)
├── API paiement (webhooks)
├── Statistiques (CA, tickets moyens, heures de pointe)
└── Publicité & Boosts
```

### 11.2 Types de marchands

| Type | Exemples | Frais transaction |
|------|----------|:-----------------:|
| **Freelance** | Graphiste, dev, coach | 2,5% |
| **Petit commerce** | Café, restaurant, boutique | 1,8% |
| **Créateur** | Artiste, influenceur | 1,5% (tarif préférentiel) |
| **Entreprise** | Startup, agence | 1,5% + 0,25 €/tx |

### 11.3 Publicité

Toute entreprise peut acheter de la visibilité :

```
Boost Options
├── 🚀 Boost post (50-500 IC)
├── 📢 Boost story (30-300 IC)
├── 📺 Boost dans ImuFeed (100-1000 IC)
├── 🏆 Sponsor concours Arena (à partir de 5000 IC)
└── 🎯 Publicité ciblée (CPM personnalisé)
```

---

## 12. Module 9 — Investissements & Épargne

### 12.1 Investissements (via partenaire)

> ⚠️ Module à long terme, nécessite des partenariats avec des institutions financières régulées.

```
Invest Hub
├── Actions (achat fractionné dès 1 €)
│   ├── Top entreprises tech
│   ├── ETF diversifiés
│   └── Portefeuille IA (auto-géré)
│
├── Crypto
│   ├── Bitcoin, Ethereum, Solana
│   └── Staking
│
└── Crowdfunding créateurs
    └── Investir dans un projet créateur
        (BD, jeu, album, app)
```

Inspiré de : Revolut, Robinhood, Cash App

### 12.2 Épargne

```
Épargne
├── 🏦 Coffres-objectifs
│   ├── "Voyage Japon 🇯🇵" → 500/2000 €
│   ├── "PC Gaming 🎮" → 350/1200 €
│   └── "Studio créateur 🎬" → 0/5000 €
│
├── 🔄 Épargne automatique
│   ├── Règle : +5 € chaque lundi
│   ├── Règle : +10 % de chaque cashback
│   └── Règle : arrondir chaque paiement
│
├── 💰 Arrondis
│   └── Achat 3,40 € → 0,60 € épargné
│
└── 📈 Intérêts (si partenariat bancaire)
    └── 2-3% annuel sur solde épargne
```

---

## 13. Module 10 — Crypto Hub

### 13.1 Fonctions

```
Crypto Hub
├── 🛒 Acheter (carte, virement, ImuCoin → crypto)
├── 💱 Vendre (crypto → fiat ou ImuCoin)
├── 📤 Envoyer (vers wallet externe)
├── 📥 Recevoir (adresse wallet ImuChat)
├── 📊 Portfolio (vue consolidée, PnL)
├── 📈 Staking (revenus passifs)
└── 🔔 Alertes prix
```

### 13.2 Cryptos supportées (v1)

| Crypto | Ticker | Raison |
|--------|--------|--------|
| Bitcoin | BTC | Standard, valeur refuge |
| Ethereum | ETH | Smart contracts, DeFi |
| Solana | SOL | Vitesse, faibles frais |
| USDT/USDC | Stablecoins | Stabilité pour les paiements |

### 13.3 ImuCoin on-chain (futur)

> Vision long terme : ImuCoin pourrait devenir un token on-chain (ERC-20 ou SPL) pour :
> - Interopérabilité avec l'écosystème crypto
> - Échanges sur DEX
> - Gouvernance communautaire (votes)

---

## 14. ImuEconomy — L'économie interne

### 14.1 Structure

ImuEconomy est la **couche économique globale** qui unifie toutes les interactions monétisables :

```
ImuEconomy
│
├── 🪙 ImuCoin (monnaie unifiée)
│
├── 💬 Social Economy
│   ├── Pourboires chat
│   ├── Cadeaux live
│   ├── Super-likes ImuFeed
│   └── Votes concours
│
├── 🎮 Gaming Economy
│   ├── Skins / Avatars
│   ├── Pass saison
│   ├── Tickets tournoi
│   └── Récompenses classement
│
├── 🎨 Creator Economy
│   ├── Dons / Tips
│   ├── Abonnements fans
│   ├── Ventes contenus
│   └── Revenus publicitaires
│
├── 🛍 Store Economy
│   ├── Vente apps / thèmes / stickers
│   ├── Services marketplace
│   └── Publicité Store
│
├── 🧑‍💼 Business Economy
│   ├── Terminal paiement
│   ├── Factures
│   └── Sponsor / Publicité
│
└── 🏦 Finance Infrastructure (ImuBank)
    ├── Wallet multi-devises
    ├── Cartes de paiement
    ├── P2P / Cagnottes
    ├── Investissements
    ├── Crypto
    └── Épargne
```

### 14.2 Cycle économique

```
     Utilisateur
         │
         ▼
    Achète ImuCoin
    (€ → 100 IC/€)
         │
         ▼
    Dépense dans ImuChat
    (store, créateurs, gaming, social)
         │
         ▼
    Créateurs / Développeurs gagnent
    (IC - commission plateforme)
         │
         ▼
    Retrait via ImuBank
    (IC → € → virement bancaire)
         │
         ▼
    Commission ImuChat (15-30%)
    = REVENU PLATEFORME
```

---

## 15. ImuCoin — Monnaie de l'écosystème

### 15.1 Sources d'acquisition

| Source | Montant | Fréquence |
|--------|---------|-----------|
| **Achat** (Stripe / IAP) | 100-6500+ IC | À la demande |
| **Mission quotidienne** | 5-50 IC | Journalier |
| **Badge obtenu** | 50-500 IC | Ponctuel |
| **Streak login** | 10-100 IC | Journalier (combo) |
| **Concours / Arena** | 100-10 000 IC | Ponctuel |
| **Parrainage** | 200 IC | Par filleul |
| **Cashback** | 1-5% en IC | Par achat |

### 15.2 Dépenses

| Usage | Montant typique |
|-------|:---------------:|
| Stickers / Emojis | 30-200 IC |
| Thèmes | 100-500 IC |
| Avatars / Skins | 50-300 IC |
| Contenus premium | 100-2000 IC |
| Cadeaux live | 50-5000 IC |
| Pourboires chat | 10-500 IC |
| Votes concours | 5-50 IC |
| Boost post/story | 50-500 IC |
| Modules Store | 99-4999 IC |
| Don créateur | 10-10 000 IC |
| Ticket tournoi gaming | 50-500 IC |
| Pass saison gaming | 799-1999 IC |

### 15.3 Types de transactions ImuCoin (existantes en DB)

```sql
-- Types déjà définis dans imucoin_transactions
'purchase'       -- Achat ImuCoins (€ → IC)
'module_buy'     -- Achat module avec ImuCoins
'transfer'       -- Transfert entre utilisateurs
'reward'         -- Récompense (mission, badge)
'refund'         -- Remboursement
'admin_grant'    -- Crédité par admin
'subscription'   -- Paiement abonnement

-- Types à ajouter
'tip'            -- Pourboire créateur
'gift'           -- Cadeau live
'vote'           -- Vote concours
'boost'          -- Boost post/story
'cashback'       -- Cashback achat
'gaming'         -- Transaction gaming
'staking'        -- Récompense staking crypto
'referral'       -- Bonus parrainage
```

---

## 16. Social Economy — Interactions monétisées

### 16.1 Cadeaux dans les lives

| Cadeau | Coût | Animation |
|--------|:----:|-----------|
| 🌹 Rose | 50 IC | Rose qui tombe doucement |
| ⭐ Star | 100 IC | Étoile qui brille |
| 🎸 Guitar | 200 IC | Guitar qui vibre |
| 🚀 Rocket | 500 IC | Fusée qui traverse l'écran |
| 👑 Crown | 1 000 IC | Couronne dorée + confetti |
| 💎 Diamond | 5 000 IC | Diamant géant + explosion sparkle |
| 🏰 Castle | 10 000 IC | Château animé plein écran 3s |

**Règle de répartition :**
- Créateur reçoit **75%** du cadeau
- ImuChat garde **25%**

### 16.2 Super-like ImuFeed

- **Coût :** 5 IC par super-like
- **Effet :** Animation spéciale + notif prioritaire au créateur
- **x10 :** Le créateur voit les super-likes en premier

### 16.3 Votes concours monétisés

- **Vote gratuit :** 1 vote / jour / concours
- **Vote premium :** 5 IC = 1 vote supplémentaire (max 10/jour)
- Les ImuCoin des votes alimentent la cagnotte de prix

---

## 17. Gaming Economy

### 17.1 Transactions gaming

```
Gaming Economy
├── 🎫 Tickets tournoi (50-500 IC par entrée)
├── 🎮 Pass saison (799-1999 IC / saison)
├── 🎨 Skins avatar gaming (100-1000 IC)
├── ⚔️ Items in-game (50-500 IC)
├── 🏆 Récompenses classement (top 3 : 500-5000 IC)
└── 🎲 Lootbox (contenu aléatoire) (100-300 IC)
```

### 17.2 Tournois à enjeu

```
Tournoi Arena — Fortnite Custom
Entrée : 100 IC
Participants : 32/64
Prize Pool : 3 200 IC

🥇 1er : 1 600 IC (50%)
🥈 2ème : 800 IC (25%)
🥉 3ème : 400 IC (12.5%)
4-8ème : 50 IC chacun
```

---

## 18. Fonctionnalités virales

### 18.1 Les 10 fonctions virales

| # | Fonction | Mécanique virale |
|---|----------|------------------|
| 1 | **Paiement P2P dans chat** | L'ami doit installer ImuChat pour recevoir l'argent |
| 2 | **Cagnottes de groupe** | Tous les participants doivent être sur ImuChat |
| 3 | **Dons créateurs** | Les créateurs promeuvent ImuChat à leur audience |
| 4 | **Cadeaux live** | Spectateurs = acheteurs d'ImuCoin |
| 5 | **Cartes virtuelles gratuites** | Carte bancaire gratuite = aimant utilisateurs |
| 6 | **Cashback social** | "Nathan a économisé 3 €" → visible dans le feed social |
| 7 | **Missions & Récompenses** | Daily missions gamifiées pour revenir chaque jour |
| 8 | **Marché créateurs** | Créateurs attirent leur communauté |
| 9 | **Concours monétisés** | Prizepool attractif = acquisition organique |
| 10 | **Investissement communautaire** | Crowdfunding projets créateurs = engagement fort |

### 18.2 Programme de parrainage

```
🎁 Invite tes amis, gagne des ImuCoin !

Parrainer un ami → +200 IC pour toi + 100 IC pour lui
L'ami recharge 10 € → +50 IC bonus pour toi
L'ami devient créateur → +500 IC

Paliers ambassadeur :
🥉 5 filleuls  → Badge Bronze + 500 IC bonus
🥈 20 filleuls → Badge Argent + 2000 IC bonus
🥇 50 filleuls → Badge Or + 5000 IC + carte Creator gratuite
💎 100 filleuls → Badge Diamant + 15 000 IC + Premium 1 an
```

---

## 19. Publicité & Revenus plateforme

### 19.1 Formats publicitaires

| Format | Placement | Prix |
|--------|-----------|------|
| **Post sponsorisé** | Feed Social / ImuFeed | CPM 5-15 € |
| **Story sponsorisée** | Entre les Stories | CPM 8-20 € |
| **ImuFeed sponsorisé** | Feed vidéo (toutes les 8 vidéos) | CPM 10-25 € |
| **Banner Store** | En-tête du Store | CPC 0,50-2 € |
| **Sponsor concours** | Badge "Sponsorisé par X" sur un concours Arena | Forfait 500-5000 € |
| **IA contextuelle** | Suggestions dans le chat (opt-in) | CPC 1-5 € |

### 19.2 Règles

- **Maximum 1 pub / 8 contenus organiques**
- **Clairement identifié "Sponsorisé"**
- **Opt-out possible** (niveau réduit pour gratuit, zéro pour Premium)
- **Pas de pub dans les DM privés**
- **Contrôle parental** : pub filtrée selon l'âge

---

## 20. Modèle économique & Projections

### 20.1 Les 6 piliers de revenus

| Pilier | Description | % du CA estimé |
|--------|-------------|:--------------:|
| **Abonnements Premium** | ImuChat Premium 5 €/mois, 2-4% conversion | 30% |
| **Commissions Store** | 25-30% sur ventes apps, thèmes, stickers | 20% |
| **Creator Economy** | 15-25% sur dons, abonnements, ventes créateurs | 20% |
| **Micro-transactions** | 25-30% sur cadeaux live, boosts, votes | 15% |
| **Finance Hub** | 0,5-2,5% sur transactions, frais cartes, conversion | 5% |
| **Publicité** | CPM/CPC sur posts, stories, ImuFeed | 10% |

### 20.2 Projections

| Base utilisateurs | Abonnements | Store | Créateurs | Micro-tx | Finance | Pub | **Total** |
|:-----------------:|:-----------:|:-----:|:---------:|:--------:|:-------:|:---:|:---------:|
| **100K** | 180 K€ | 125 K€ | 150 K€ | 90 K€ | 25 K€ | 50 K€ | **620 K€** |
| **1M** | 1,8 M€ | 1,25 M€ | 1,5 M€ | 900 K€ | 250 K€ | 500 K€ | **6,2 M€** |
| **5M** | 9 M€ | 6,25 M€ | 7,5 M€ | 4,5 M€ | 1,25 M€ | 2,5 M€ | **31 M€** |
| **20M** | 36 M€ | 25 M€ | 30 M€ | 18 M€ | 5 M€ | 10 M€ | **124 M€** |

### 20.3 Priorité stratégique (startup)

```
Phase 1 : Messenger gratuit (acquisition)
Phase 2 : Creator Economy (rétention, effet réseau)
Phase 3 : Store (écosystème)
Phase 4 : Premium (monétisation base)
Phase 5 : Finance Hub (couche économique)
Phase 6 : Publicité légère (complément)
```

---

## 21. Sécurité & Conformité réglementaire

### 21.1 Sécurité obligatoire

| Mesure | Détail |
|--------|--------|
| **KYC (Know Your Customer)** | Vérification identité : carte d'identité + selfie (Onfido / Jumio) |
| **AML (Anti Money Laundering)** | Détection transactions suspectes, seuils déclaratifs |
| **2FA** | Authentification double facteur (SMS / TOTP / biométrie) |
| **Biométrie** | FaceID / TouchID pour chaque transaction > seuil |
| **Chiffrement** | TLS 1.3, chiffrement au repos AES-256, tokenisation cartes |
| **Détection fraude** | ML scoring en temps réel, blocage auto, alertes |
| **Notifications** | Push immédiat pour chaque transaction |
| **Gel automatique** | 3 tentatives échouées → gel 30 min |
| **PCI DSS** | Conformité standard pour traitement cartes (via Stripe) |

### 21.2 Conformité européenne

| Réglementation | Application |
|----------------|-------------|
| **PSD2** (Payment Services Directive) | Si paiements réels, nécessaire agrément EME ou partenariat |
| **RGPD** | Données financières = données sensibles, consentement explicite |
| **DSP2 SCA** | Strong Customer Authentication pour paiements > 30 € |
| **MiFID II** | Si investissements / crypto, agrément requis |
| **5AMLD** | Anti-blanchiment, seuils de déclaration |

### 21.3 Niveaux KYC

| Niveau | Vérification | Limites |
|--------|-------------|---------|
| **KYC 0** (non vérifié) | Email + téléphone | ImuCoin only, max 500 IC/mois |
| **KYC 1** (basique) | + Nom + Date de naissance | ImuCoin illimité, fiat < 250 €/mois |
| **KYC 2** (vérifié) | + Pièce d'identité + Selfie | Fiat < 5 000 €/mois, carte virtuelle |
| **KYC 3** (complet) | + Justificatif domicile + Source fonds | Illimité, carte physique, investissements |

---

## 22. IA financière (Alice Finance)

### 22.1 Fonctions IA

Alice (l'IA d'ImuChat) peut analyser les finances de l'utilisateur :

```
Commandes dans le chat avec Alice :

💬 "Combien j'ai dépensé ce mois ?"
→ Résumé catégorisé avec graphique

💬 "Compare mes dépenses avec le mois dernier"
→ Comparaison visuelle + tendances

💬 "Aide-moi à économiser 500 € d'ici juin"
→ Plan d'épargne personnalisé + règles auto

💬 "Quels abonnements sont inutiles ?"
→ Analyse d'utilisation + suggestions d'annulation

💬 "Propose-moi un budget mensuel"
→ Budget catégorisé basé sur l'historique

💬 "Alerte-moi si je dépasse 200 € en restos"
→ Alerte proactive configurée
```

### 22.2 Alertes proactives

- **Seuil budget dépassé** → Push + message Alice
- **Abonnement peu utilisé** → "Tu n'as pas utilisé X depuis 2 mois"
- **Cashback disponible** → "Tu as 12,50 € de cashback non réclamé"
- **Objectif épargne en retard** → "Tu es à 60% de ton objectif Voyage, ajoute 50 €"
- **Activité suspecte** → "Transaction inhabituelle détectée à 3h du matin"

---

## 23. Architecture technique détaillée

### 23.1 Structure fichiers cible (Mobile)

```
mobile/
├── app/
│   ├── finance/                       # ← NOUVEAU module Finance Hub
│   │   ├── _layout.tsx                # Layout navigation Finance
│   │   ├── index.tsx                  # Dashboard Finance Hub
│   │   ├── insights.tsx               # Financial Insights
│   │   ├── send.tsx                   # Envoyer argent
│   │   ├── receive.tsx                # Recevoir (QR code)
│   │   ├── split-bill.tsx             # Diviser la note
│   │   ├── group-pool.tsx             # Cagnotte de groupe
│   │   ├── cards/
│   │   │   ├── index.tsx              # Mes cartes
│   │   │   ├── [id].tsx              # Détail carte
│   │   │   └── create.tsx             # Créer carte virtuelle
│   │   ├── invest/
│   │   │   ├── index.tsx              # Dashboard investissements
│   │   │   ├── market.tsx             # Explorer marché
│   │   │   ├── [assetId].tsx         # Détail actif
│   │   │   └── portfolio.tsx          # Mon portefeuille
│   │   ├── savings/
│   │   │   ├── index.tsx              # Mes coffres
│   │   │   └── create.tsx             # Créer un coffre
│   │   ├── crypto/
│   │   │   ├── index.tsx              # Crypto Hub
│   │   │   ├── [coinId].tsx          # Détail crypto
│   │   │   └── portfolio.tsx          # Portfolio crypto
│   │   ├── business/
│   │   │   ├── index.tsx              # Business Hub
│   │   │   ├── terminal.tsx           # Terminal paiement
│   │   │   └── invoices.tsx           # Factures clients
│   │   └── settings.tsx               # Paramètres financiers
│   │
│   └── wallet/                        # ← EXISTANT (à migrer/harmoniser)
│       ├── index.tsx                  # ✅ Existe
│       ├── topup.tsx                  # ✅ Existe
│       ├── transactions.tsx           # ✅ Existe
│       └── ...
│
├── components/
│   ├── finance/                       # ← NOUVEAUX composants
│   │   ├── FinanceDashboard.tsx       # Widget dashboard
│   │   ├── P2PPaymentCard.tsx         # Card paiement dans le chat
│   │   ├── SplitBillCard.tsx          # Card split bill dans le chat
│   │   ├── GroupPoolCard.tsx          # Card cagnotte dans le chat
│   │   ├── LiveGiftOverlay.tsx        # Overlay cadeaux pendant live
│   │   ├── GiftAnimation.tsx          # Animations des cadeaux
│   │   ├── CardWidget.tsx             # Widget carte bancaire
│   │   ├── SavingsGoalCard.tsx        # Card coffre-épargne
│   │   ├── InvestChart.tsx            # Graphique investissement
│   │   └── CryptoTicker.tsx           # Ticker crypto temps réel
│   │
│   └── wallet/                        # ← EXISTANT
│       ├── WalletBalanceCard.tsx       # ✅ Existe
│       └── ...
│
├── services/
│   ├── finance/                       # ← NOUVEAUX services
│   │   ├── p2p-api.ts                # API P2P (send, request, split, pool)
│   │   ├── cards-api.ts              # API cartes (Stripe Issuing)
│   │   ├── invest-api.ts             # API investissements
│   │   ├── savings-api.ts            # API épargne / coffres
│   │   ├── crypto-api.ts             # API crypto
│   │   ├── business-api.ts           # API business
│   │   ├── kyc-api.ts                # API KYC (Onfido / Jumio)
│   │   └── fraud-detection.ts        # Détection fraude côté client
│   │
│   ├── wallet-api.ts                  # ✅ Existe
│   └── payment-api.ts                # ✅ Existe
│
├── stores/
│   ├── finance-store.ts               # ← NOUVEAU store Finance Hub
│   ├── cards-store.ts                 # ← NOUVEAU store cartes
│   ├── savings-store.ts               # ← NOUVEAU store épargne
│   ├── wallet-store.ts                # ✅ Existe
│   └── gamification-store.ts          # ✅ Existe
│
└── types/
    ├── finance.ts                     # ← NOUVEAUX types
    ├── wallet.ts                      # ✅ Existe (à harmoniser avec shared-types)
    └── ...
```

### 23.2 Types TypeScript clés

```typescript
// === FINANCE HUB ===
interface FinanceHub {
  wallet: Wallet;
  cards: ImuChatCard[];
  savings: SavingsVault[];
  investments: Portfolio;
  crypto: CryptoPortfolio;
  kyc: KYCStatus;
  settings: FinanceSettings;
}

// === CARTES ===
interface ImuChatCard {
  id: string;
  type: 'virtual' | 'physical';
  tier: 'standard' | 'creator' | 'business' | 'premium';
  brand: 'visa' | 'mastercard';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  status: 'active' | 'frozen' | 'cancelled';
  limits: CardLimits;
  cashbackPercent: number;
  stripeCardId: string;
  createdAt: Date;
}

interface CardLimits {
  dailySpend: number;
  monthlySpend: number;
  singleTransaction: number;
  atmWithdraw: number;  // physique seulement
}

// === ÉPARGNE ===
interface SavingsVault {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  autoRules: SavingsAutoRule[];
  interestRate?: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  targetDate?: Date;
}

interface SavingsAutoRule {
  type: 'recurring' | 'roundup' | 'percentage';
  amount?: number;        // pour recurring
  dayOfWeek?: number;     // pour recurring
  sourcePercent?: number; // pour percentage (% du cashback)
  isActive: boolean;
}

// === INVESTISSEMENTS ===
interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdings: Holding[];
}

interface Holding {
  assetId: string;
  assetType: 'stock' | 'etf' | 'crypto';
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

// === KYC ===
type KYCStatus = {
  level: 0 | 1 | 2 | 3;
  status: 'none' | 'pending' | 'verified' | 'rejected';
  documentType?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  limits: KYCLimits;
};

interface KYCLimits {
  monthlyFiatLimit: number;  // en centimes
  canHaveCard: boolean;
  canInvest: boolean;
  canWithdrawFiat: boolean;
}

// === CADEAUX LIVE ===
interface LiveGift {
  id: string;
  name: string;
  emoji: string;
  costImuCoin: number;
  animationType: 'float' | 'explosion' | 'fullscreen';
  animationDuration: number;  // ms
  creatorSharePercent: number; // 75% par défaut
}

// === BUSINESS ===
interface MerchantProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'freelance' | 'small_business' | 'creator' | 'enterprise';
  category: string;
  transactionFeePercent: number;
  isVerified: boolean;
  stripeAccountId: string;
  settings: MerchantSettings;
}
```

### 23.3 Store Zustand (finance-store)

```typescript
interface FinanceStoreState {
  // Dashboard
  dashboardLoaded: boolean;
  totalBalance: number;
  balanceByCurrency: Record<string, number>;
  recentTransactions: Transaction[];
  
  // Cards
  cards: ImuChatCard[];
  activeCardId: string | null;
  
  // Savings
  vaults: SavingsVault[];
  totalSaved: number;
  
  // KYC
  kycStatus: KYCStatus;
  
  // P2P
  pendingP2P: P2PPayment[];
  activeSplitBills: SplitBill[];
  activeGroupPools: GroupPool[];
  
  // Loading states
  isLoading: boolean;
  errors: Record<string, string | null>;
}

interface FinanceStoreActions {
  // Dashboard
  loadDashboard: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  
  // P2P
  sendMoney: (to: string, amount: number, currency: string, note?: string) => Promise<void>;
  requestMoney: (from: string, amount: number, note?: string) => Promise<void>;
  createSplitBill: (chatId: string, total: number, participants: string[]) => Promise<void>;
  createGroupPool: (chatId: string, title: string, target: number) => Promise<void>;
  contributeToPool: (poolId: string, amount: number) => Promise<void>;
  
  // Cards
  loadCards: () => Promise<void>;
  createVirtualCard: (tier: string) => Promise<void>;
  freezeCard: (cardId: string) => Promise<void>;
  updateCardLimits: (cardId: string, limits: Partial<CardLimits>) => Promise<void>;
  
  // Savings
  loadVaults: () => Promise<void>;
  createVault: (name: string, target: number, emoji: string) => Promise<void>;
  addToVault: (vaultId: string, amount: number) => Promise<void>;
  
  // KYC
  submitKYC: (level: number, documents: KYCDocument[]) => Promise<void>;
  refreshKYCStatus: () => Promise<void>;
}
```

---

## 24. Schéma Supabase complet

### 24.1 Tables existantes (déjà implémentées)

```sql
-- ✅ imucoin_wallets (exists)
-- ✅ imucoin_transactions (exists)
-- ✅ store_transactions (exists)
-- ✅ developer_payouts (exists)
-- ✅ revenue_share_config (exists)
```

### 24.2 Tables à ajouter

```sql
-- ================================================================
-- NOUVELLES TABLES FINANCE HUB
-- ================================================================

-- 1. Wallet fiat (multi-devises, complémentaire à imucoin_wallets)
CREATE TABLE IF NOT EXISTS public.fiat_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  available_cents INTEGER NOT NULL DEFAULT 0,
  pending_cents INTEGER NOT NULL DEFAULT 0,
  reserved_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'locked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- 2. Paiements P2P
CREATE TABLE IF NOT EXISTS public.p2p_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('send', 'request', 'split', 'pool')),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  chat_id UUID,
  message_id UUID,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'completed', 'expired', 'cancelled'
  )),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 3. Split bills
CREATE TABLE IF NOT EXISTS public.split_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  chat_id UUID NOT NULL,
  title TEXT,
  total_amount_cents INTEGER NOT NULL CHECK (total_amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  split_type TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom', 'percentage')),
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'completed', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.split_bill_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  split_bill_id UUID NOT NULL REFERENCES public.split_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'declined')),
  paid_at TIMESTAMPTZ,
  UNIQUE(split_bill_id, user_id)
);

-- 4. Cagnottes de groupe
CREATE TABLE IF NOT EXISTS public.group_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  chat_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_amount_cents INTEGER NOT NULL CHECK (target_amount_cents > 0),
  current_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pool_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.group_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cartes ImuChat
CREATE TABLE IF NOT EXISTS public.imuchat_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('virtual', 'physical')),
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'creator', 'business', 'premium')),
  brand TEXT NOT NULL DEFAULT 'visa' CHECK (brand IN ('visa', 'mastercard')),
  last4 TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  holder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  daily_limit_cents INTEGER DEFAULT 100000,    -- 1000€
  monthly_limit_cents INTEGER DEFAULT 500000,  -- 5000€
  single_tx_limit_cents INTEGER DEFAULT 50000, -- 500€
  cashback_percent NUMERIC(3,2) DEFAULT 1.00,
  stripe_card_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. KYC
CREATE TABLE IF NOT EXISTS public.user_kyc (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 3),
  status TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('none', 'pending', 'verified', 'rejected')),
  document_type TEXT,
  document_url TEXT,       -- stocké chiffré dans Supabase Storage
  selfie_url TEXT,
  address_proof_url TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  provider_reference TEXT,  -- ID chez Onfido/Jumio
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Coffres d'épargne
CREATE TABLE IF NOT EXISTS public.savings_vaults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '💰',
  target_amount_cents INTEGER NOT NULL CHECK (target_amount_cents > 0),
  current_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (current_amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Règles d'épargne automatique
CREATE TABLE IF NOT EXISTS public.savings_auto_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID NOT NULL REFERENCES public.savings_vaults(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('recurring', 'roundup', 'percentage')),
  amount_cents INTEGER,          -- pour recurring
  day_of_week INTEGER,           -- 0-6 pour recurring
  source_percent NUMERIC(5,2),   -- pour percentage
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Cadeaux live
CREATE TABLE IF NOT EXISTS public.live_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  cost_imucoin INTEGER NOT NULL CHECK (cost_imucoin > 0),
  animation_type TEXT NOT NULL DEFAULT 'float' CHECK (animation_type IN ('float', 'explosion', 'fullscreen')),
  animation_duration_ms INTEGER DEFAULT 2000,
  creator_share_percent NUMERIC(5,2) DEFAULT 75.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Insérer les cadeaux par défaut
INSERT INTO public.live_gifts (name, emoji, cost_imucoin, animation_type, animation_duration_ms, sort_order)
VALUES
  ('Rose', '🌹', 50, 'float', 2000, 1),
  ('Star', '⭐', 100, 'float', 2000, 2),
  ('Guitar', '🎸', 200, 'float', 2500, 3),
  ('Rocket', '🚀', 500, 'explosion', 3000, 4),
  ('Crown', '👑', 1000, 'explosion', 3500, 5),
  ('Diamond', '💎', 5000, 'explosion', 4000, 6),
  ('Castle', '🏰', 10000, 'fullscreen', 5000, 7)
ON CONFLICT DO NOTHING;

-- 10. Profils marchands
CREATE TABLE IF NOT EXISTS public.merchant_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('freelance', 'small_business', 'creator', 'enterprise')),
  category TEXT,
  description TEXT,
  logo_url TEXT,
  transaction_fee_percent NUMERIC(4,2) DEFAULT 2.50,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Programmes de parrainage
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referee_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_reward_ic INTEGER DEFAULT 200,
  referee_reward_ic INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referee_id)
);
```

### 24.3 Index & RLS

```sql
-- Index performance
CREATE INDEX IF NOT EXISTS idx_fiat_wallets_user ON public.fiat_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_p2p_payments_sender ON public.p2p_payments(sender_id);
CREATE INDEX IF NOT EXISTS idx_p2p_payments_recipient ON public.p2p_payments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_p2p_payments_chat ON public.p2p_payments(chat_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_chat ON public.split_bills(chat_id);
CREATE INDEX IF NOT EXISTS idx_group_pools_chat ON public.group_pools(chat_id);
CREATE INDEX IF NOT EXISTS idx_cards_user ON public.imuchat_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user ON public.savings_vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- RLS (Row Level Security)
ALTER TABLE public.fiat_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.p2p_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imuchat_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne voient QUE leurs propres données financières
CREATE POLICY "Users see own wallet" ON public.fiat_wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users see own cards" ON public.imuchat_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users see own KYC" ON public.user_kyc
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users see own savings" ON public.savings_vaults
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own P2P" ON public.p2p_payments
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
```

---

## 25. 40+ écrans UI — Mapping complet

### Module Onboarding & Auth (7 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 1 | Splash Screen | `finance/splash` | Logo ImuBank + chargement |
| 2 | Welcome | `finance/welcome` | Présentation Finance Hub |
| 3 | Sign Up Finance | `finance/signup` | Création compte financier (si séparé) |
| 4 | Login Finance | `finance/login` | Connexion avec 2FA |
| 5 | OTP Verification | `finance/otp` | Validation SMS/email |
| 6 | KYC Identity | `finance/kyc` | Upload pièce d'identité + selfie |
| 7 | Profile Setup | `finance/profile-setup` | Préférences financières |

### Dashboard (5 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 8 | Main Dashboard | `finance/index` | Solde total, widgets, accès rapides |
| 9 | Financial Insights | `finance/insights` | Analyse IA, graphiques, prévisions |
| 10 | Transaction Feed | `finance/transactions` | Historique paginé, filtrable |
| 11 | Transaction Details | `finance/transaction/[id]` | Détail : montant, date, catégorie, note |
| 12 | Notifications Center | `finance/notifications` | Alertes paiements, sécurité, invest |

### Comptes & Wallet (6 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 13 | Accounts Overview | `wallet/index` ✅ | Liste comptes (ImuCoin, EUR, Crypto) |
| 14 | Account Details | `wallet/account/[currency]` | Solde, historique, actions |
| 15 | Create Sub-Account | `wallet/create-account` | Nouveau sous-compte (voyage, business) |
| 16 | Add Money | `wallet/topup` ✅ | Recharger (carte, virement, crypto) |
| 17 | Withdraw Money | `wallet/withdraw` ✅ | Retrait vers banque externe |
| 18 | Card Management | `finance/cards/index` | Gestion cartes (bloquer, plafond, PIN) |

### Paiements & Transferts (6 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 19 | Send Money | `finance/send` | Envoyer argent (ImuCoin/fiat) |
| 20 | Receive Money | `finance/receive` | QR code ou lien de paiement |
| 21 | Payment Confirmation | `finance/confirm` | Validation transaction (FaceID) |
| 22 | QR Payment | `finance/qr-pay` | Scanner QR commerçant |
| 23 | Scheduled Payments | `finance/scheduled` | Paiements programmés |
| 24 | Bill Payments | `finance/bills` | Factures récurrentes |

### Investissements (6 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 25 | Investment Dashboard | `finance/invest/index` | Portefeuille : actions, crypto, ETF |
| 26 | Market Explorer | `finance/invest/market` | Explorer actifs, filtres, top gainers |
| 27 | Asset Details | `finance/invest/[assetId]` | Graphiques + infos marché |
| 28 | Buy Asset | `finance/invest/buy` | Achat (fractionné possible) |
| 29 | Sell Asset | `finance/invest/sell` | Vente |
| 30 | Portfolio Analytics | `finance/invest/portfolio` | ROI, allocation, historique |

### Crédit & Financement (5 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 31 | Credit Hub | `finance/credit/index` | Offres : prêt perso, micro-crédit |
| 32 | Loan Simulator | `finance/credit/simulate` | Simulation montant/durée/mensualité |
| 33 | Apply for Loan | `finance/credit/apply` | Formulaire demande |
| 34 | Loan Status | `finance/credit/[id]` | Suivi dossier |
| 35 | Repayment Schedule | `finance/credit/repayments` | Calendrier remboursements |

### Budget & Gestion (3 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 36 | Budget Planner | `finance/budget` | Budgets catégorisés |
| 37 | Expense Categories | `finance/categories` | Catégorisation dépenses |
| 38 | Savings Goals | `finance/savings/index` | Coffres-objectifs |

### Paramètres & Support (2 écrans)

| # | Écran | Route | Description |
|---|-------|-------|-------------|
| 39 | Settings | `finance/settings` | Profil, sécurité, notifs, limites |
| 40 | Help & Support | `finance/help` | Chat support, FAQ, tickets |

**Total : 40 écrans + 11 écrans wallet existants = 51 écrans finance**

---

## 26. Plan MVP par phases

### Phase 1 — Consolidation Wallet (4 sprints)

> Corriger les problèmes existants + harmoniser types + Edge Functions Stripe

- Harmoniser `shared-types/wallet.ts` ↔ `mobile/types/wallet.ts`
- Implémenter Supabase Edge Functions manquantes (Stripe)
- Corriger noms tables (wallets vs imucoin_wallets)
- Connecter gamification → wallet (trigger claim mission)
- Tests e2e wallet complet

### Phase 2 — Finance Hub Core (5 sprints)

> Dashboard + P2P + KYC + tables Supabase

- Finance Hub dashboard (`finance/index`)
- Paiements P2P dans le chat (send, request)
- Split bill + Cagnottes de groupe
- KYC niveaux 0-2 (Onfido)
- Tables Supabase (p2p_payments, split_bills, group_pools, user_kyc)

### Phase 3 — Cartes & Épargne (4 sprints)

> Cartes virtuelles + Coffres d'épargne + Cashback

- Cartes virtuelles (Stripe Issuing)
- Apple Pay / Google Pay integration
- Coffres d'épargne (objectifs + règles auto)
- Programme de cashback
- Parrainage

### Phase 4 — Creator & Business Economy (4 sprints)

> Monétisation créateurs + Marchands

- Dashboard créateur enrichi
- Cadeaux live (7 types + animations)
- Abonnements fans (3 tiers)
- Profils marchands + Terminal QR
- Programme partenaire créateur

### Phase 5 — Investissements & Crypto (3 sprints)

> Module invest + Crypto Hub (via partenaire)

- Investissements (actions fractionnées, ETF)
- Crypto Hub (achat/vente/staking)
- Portfolio analytics
- Alertes prix

### Phase 6 — IA Finance & Scale (3 sprints)

> Alice Finance + Publicité + Compliance complète

- Alice Finance (analyse dépenses, recommandations)
- Publicité native (posts sponsorisés, boosts)
- KYC niveau 3 + conformité PSD2
- Détection fraude ML
- Audit sécurité complet

**Total estimé : 23 sprints (~46 semaines)**
